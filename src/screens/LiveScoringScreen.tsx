import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS } from '../constants';
import { APP_CONFIG, SCORING_CONFIG, UI_CONFIG } from '../config/appConfig';
import { liveScoringService, Match, BallData as FirebaseBallData } from '../services/liveScoringService';
// Removed offline functionality - causing too many issues
// import { useOfflineScoring } from '../hooks/useOfflineScoring';
// import { OfflineStatusBar } from '../components/OfflineStatusBar';
import { REAL_CRICKET_TEAMS, getTeamById, getBatsmen, getBowlers } from '../data/realCricketData';
import ShotDetailsModal, { ShotDetails } from '../components/ShotDetailsModal';
import PlayerStatsCard from '../components/PlayerStatsCard';
import ProfessionalScorecard from '../components/ProfessionalScorecard';
import ProfessionalCommentary from '../components/ProfessionalCommentary';
import ProfessionalMatchSummary from '../components/ProfessionalMatchSummary';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');

const MAX_T20_OVERS_PER_BOWLER = 4;

const WICKET_TYPES: Array<{ id: string; label: string; requiresFielder: boolean }> = [
  { id: 'Bowled', label: 'Bowled', requiresFielder: false },
  { id: 'Caught', label: 'Caught', requiresFielder: true },
  { id: 'Caught & Bowled', label: 'Caught & Bowled', requiresFielder: false },
  { id: 'LBW', label: 'LBW', requiresFielder: false },
  { id: 'Run Out', label: 'Run Out', requiresFielder: true },
  { id: 'Stumped', label: 'Stumped', requiresFielder: true },
  { id: 'Hit Wicket', label: 'Hit Wicket', requiresFielder: false },
];

const sanitizeForFirestore = (value: any): any => {
  if (Array.isArray(value)) {
    return value
      .map(sanitizeForFirestore)
      .filter((item) => item !== undefined && item !== null);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      if (val === undefined || val === null) {
        return acc;
      }
      const sanitized = sanitizeForFirestore(val);
      if (sanitized !== undefined && sanitized !== null) {
        acc[key] = sanitized;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  return value;
};

export interface MatchSummary {
  teamAName: string;
  teamBName: string;
  teamAScore: string;
  teamBScore?: string; // Add team2 score
  overs: string;
  topBatsman?: {
    name: string;
    runs: number;
    balls: number;
  };
  topBowler?: {
    name: string;
    wickets: number;
    runs: number;
  };
  resultText: string;
  timestamp: string;
  matchId?: string; // Add match ID for deduplication
}

interface LiveScoringScreenProps {
  onBack: () => void;
  matchId?: string;
  teamA?: string;
  teamB?: string;
  battingOrder?: string[];
  bowlingOrder?: string[];
  teamAPlayers?: any[];
  teamBPlayers?: any[];
  totalOvers?: number;
  autoSimulate?: boolean;
  onSimulationProgress?: (message: string) => void;
  onSimulationComplete?: (summary?: MatchSummary) => void;
}

interface InningsSummary {
  inningsNumber: number;
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
}

interface MatchData {
  id: string;
  team1: string;
  team2: string;
  overs: number;
  currentInnings: number;
  currentOver: number;
  currentBall: number;
  totalRuns: number;
  wickets: number;
  balls: BallData[];
  // Real player data
  currentBatsmen: {
    striker: { id: string; name: string; runs: number; balls: number; isOut: boolean; fours: number; sixes: number };
    nonStriker: { id: string; name: string; runs: number; balls: number; isOut: boolean; fours: number; sixes: number };
  };
  currentBowler: { id: string; name: string; overs: number; wickets: number; runs: number };
  nextBatsman: { id: string; name: string };
  team1Players: any[];
  team2Players: any[];
  team1PlayersOriginal: any[];
  team2PlayersOriginal: any[];
  battingOrder?: string[];
  bowlingOrder?: string[];
  remainingBatters: string[];
  pendingFreeHit: boolean;
  battingTeamName: string;
  bowlingTeamName: string;
  inningsHistory: InningsSummary[];
  targetScore?: number;
  matchResult?: string;
  isMatchCompleted?: boolean;
  awaitingNextInnings: boolean;
  pendingInningsSummary?: InningsSummary | null;
}

interface BallData {
  id: string;
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  dismissalFielderId?: string;
  dismissalFielderName?: string;
  isExtra: boolean;
  extraType?: string;
  timestamp: number;
  // Shot details
  shotType?: string; // e.g., 'Drive', 'Pull', 'Cut', 'Sweep'
  shotRegion?: string; // e.g., 'Long On', 'Cover', 'Square Leg'
  shotQuality?: string; // e.g., 'Well Timed', 'Mistimed', 'Edge'
  // Player details
  batsmanOnStrike?: string; // Name of batsman who faced the ball
  batsmanId?: string; // ID of batsman
  bowlerName?: string; // Name of bowler
  bowlerId?: string; // ID of bowler
  // Commentary
  commentary?: string; // User-written commentary for the shot
  // Extras metadata
  batsmanRuns?: number;
  extraRuns?: number;
  extraSubType?: string;
  legalDelivery?: boolean;
  awardedFreeHit?: boolean;
  wasFreeHit?: boolean;
  innings?: number;
}

interface BallMetaOptions {
  batsmanRuns?: number;
  extraRuns?: number;
  extraSubType?: string;
  legalDelivery?: boolean;
  commentaryOverride?: string;
  awardFreeHit?: boolean;
}

type ScorecardBatting = {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  minutes: number;
  isOut: boolean;
  isCurrentlyBatting?: boolean;
  isOnStrike?: boolean;
  isPlaceholder?: boolean;
  dismissal?: string;
};

type ScorecardBowling = {
  id: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
};

export type ScorecardData = {
  battingStats: ScorecardBatting[];
  bowlingStats: ScorecardBowling[];
  fallOfWickets: { wicket: number; batsman: string; score: number; over: string }[];
  extras: number;
  yetToBat: string[];
};

const DEFAULT_EXTRA_RUN_CHOICES = [1, 2, 3, 4, 5, 6, 7];
const NO_BALL_RUN_CHOICES = [0, 1, 2, 3, 4, 5, 6];

const pluralize = (value: number, singular: string, plural?: string) =>
  `${value} ${value === 1 ? singular : plural || `${singular}s`}`;

const VERBOSE_LOGGING_ENABLED = APP_CONFIG.DEBUG?.ENABLE_VERBOSE_LOGS ?? false;
const logVerbose = (...args: any[]) => {
  if (VERBOSE_LOGGING_ENABLED) {
    console.log(...args);
  }
};

export const buildScorecardData = (data: MatchData): ScorecardData => {
  const battingMap = new Map<string, ScorecardBatting>();
  const bowlingMap = new Map<string, ScorecardBowling & { balls: number }>();

  const registerBatter = (playerId: string, playerName: string) => {
    if (!playerId) {
      return;
    }
    const normalizedName = playerName || playerId;
    const isPlaceholder =
      playerId.startsWith('pending-') ||
      normalizedName.toLowerCase().includes('select next batsman');

    if (!battingMap.has(playerId)) {
      battingMap.set(playerId, {
        id: playerId,
        name: normalizedName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        minutes: 0,
        isOut: false,
        isCurrentlyBatting: false,
        isOnStrike: false,
        isPlaceholder,
        dismissal: undefined,
      });
      return;
    }

    const existing = battingMap.get(playerId)!;
    if (!existing.name || existing.name === existing.id) {
      existing.name = normalizedName;
    }
    if (isPlaceholder) {
      existing.isPlaceholder = true;
    }
  };

  const registerBowler = (playerId: string, playerName: string) => {
    if (!bowlingMap.has(playerId)) {
      bowlingMap.set(playerId, {
        id: playerId,
        name: playerName || playerId,
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
        balls: 0,
      });
    }
  };

  (data.team1Players || []).forEach((player: any) => {
    if (!player?.id) {
      return;
    }
    registerBatter(player.id, player.name || player.id);
  });

  (data.team2Players || []).forEach((player: any) => {
    if (!player?.id) {
      return;
    }
    registerBowler(player.id, player.name || player.id);
  });

  const fieldingPlayerLookup = new Map<string, any>();
  (data.team2Players || []).forEach((player: any) => {
    if (player?.id) {
      fieldingPlayerLookup.set(player.id, player);
    }
  });

  const fallOfWickets: { wicket: number; batsman: string; score: number; over: string }[] = [];
  let runningScore = 0;
  let extras = 0;

  const formatDismissal = (
    wicketType?: string,
    fielderName?: string,
    bowlerName?: string,
    fielderId?: string
  ): string => {
    let trimmedFielder = fielderName?.trim();
    const trimmedBowler = bowlerName?.trim();

    if (fielderId && trimmedFielder) {
      const fielderPlayer = fieldingPlayerLookup.get(fielderId);
      const role = String(fielderPlayer?.role || '').toLowerCase();
      if (role.includes('wicket') && !trimmedFielder.startsWith('†')) {
        trimmedFielder = `†${trimmedFielder}`;
      }
    }

    switch (wicketType) {
      case 'Bowled':
        return trimmedBowler ? `b ${trimmedBowler}` : 'bowled';
      case 'LBW':
        return trimmedBowler ? `lbw b ${trimmedBowler}` : 'lbw';
      case 'Caught':
        if (trimmedFielder && trimmedBowler) {
          return `c ${trimmedFielder} b ${trimmedBowler}`;
        }
        if (trimmedBowler) {
          return `caught b ${trimmedBowler}`;
        }
        return trimmedFielder ? `caught ${trimmedFielder}` : 'caught';
      case 'Caught & Bowled':
        return trimmedBowler ? `c & b ${trimmedBowler}` : 'c & b';
      case 'Run Out':
        return trimmedFielder ? `run out (${trimmedFielder})` : 'run out';
      case 'Stumped':
        if (trimmedFielder && trimmedBowler) {
          return `st ${trimmedFielder} b ${trimmedBowler}`;
        }
        return trimmedFielder ? `stumped (${trimmedFielder})` : 'stumped';
      case 'Hit Wicket':
        return trimmedBowler ? `hit wicket b ${trimmedBowler}` : 'hit wicket';
      default:
        if (wicketType && trimmedBowler) {
          return `${wicketType} (${trimmedBowler})`;
        }
        return wicketType || 'out';
    }
  };

  (data.balls || []).forEach((ball, index) => {
    const batsmanId = ball.batsmanId || data.currentBatsmen.striker.id;
    registerBatter(batsmanId, ball.batsmanOnStrike || batsmanId);
    const batter = battingMap.get(batsmanId)!;
    const legalDelivery = ball.legalDelivery ?? true;
    const batterRuns = ball.batsmanRuns ?? (ball.isExtra ? 0 : ball.runs);
    const extraRuns = ball.extraRuns ?? (ball.isExtra ? ball.runs : 0);
    if (legalDelivery) {
      batter.balls += 1;
    }
    batter.runs += batterRuns;
    if (batterRuns === 4) batter.fours += 1;
    if (batterRuns === 6) batter.sixes += 1;

    const bowlerId = ball.bowlerId || data.currentBowler.id;
    registerBowler(bowlerId, ball.bowlerName || bowlerId);
    const bowler = bowlingMap.get(bowlerId)!;
    if (legalDelivery) {
      bowler.balls += 1;
    }
    bowler.runs += ball.runs;
    if (ball.isWicket) {
      bowler.wickets += 1;
    }

    runningScore += ball.runs;

    if (extraRuns > 0) {
      extras += extraRuns;
    }

    if (ball.isWicket) {
      batter.isOut = true;
      batter.dismissal = formatDismissal(
        ball.wicketType,
        ball.dismissalFielderName,
        ball.bowlerName,
        ball.dismissalFielderId
      );
      fallOfWickets.push({
        wicket: fallOfWickets.length + 1,
        batsman: batter.name,
        score: runningScore,
        over: `${ball.over}.${Math.max(ball.ball, 1)}`,
      });
    }
  });

  const battingStats = Array.from(battingMap.values()).map((batter) => {
    const hasFacedDelivery = batter.balls > 0 || batter.runs > 0;
    const strikeRate = batter.balls > 0 ? (batter.runs / batter.balls) * 100 : 0;
    const dismissal = batter.isOut
      ? batter.dismissal || 'out'
      : hasFacedDelivery
      ? 'not out'
      : undefined;
    return {
      ...batter,
      strikeRate,
      dismissal,
      isCurrentlyBatting: batter.isCurrentlyBatting ?? false,
      isOnStrike: batter.isOnStrike ?? false,
    };
  });

  const bowlingStats = Array.from(bowlingMap.values()).map((bowlerWithBalls) => {
    const { balls, ...bowler } = bowlerWithBalls;
    const overs = balls ? Math.floor(balls / 6) + (balls % 6) / 10 : 0;
    const economy = balls ? (bowler.runs * 6) / balls : 0;
    return {
      ...bowler,
      overs,
      economy,
    };
  });

  const battingLookup = new Map(battingStats.map((batter) => [batter.id, batter]));
  const strikerId = data.currentBatsmen?.striker?.id;
  const nonStrikerId = data.currentBatsmen?.nonStriker?.id;

  if (strikerId && battingLookup.has(strikerId)) {
    const striker = battingLookup.get(strikerId)!;
    striker.isCurrentlyBatting = true;
    striker.isOnStrike = true;
    striker.isOut = false;
    striker.dismissal = 'not out';
  }
  if (nonStrikerId && battingLookup.has(nonStrikerId)) {
    const nonStriker = battingLookup.get(nonStrikerId)!;
    nonStriker.isCurrentlyBatting = true;
    nonStriker.isOut = false;
    nonStriker.dismissal = 'not out';
  }

  const resolvedBattingOrder: string[] = [];
  const pushUnique = (playerId?: string | null) => {
    if (!playerId) {
      return;
    }
    if (!battingLookup.has(playerId)) {
      return;
    }
    if (!resolvedBattingOrder.includes(playerId)) {
      resolvedBattingOrder.push(playerId);
    }
  };

  const initialOrder =
    (data.battingOrder && data.battingOrder.length
      ? data.battingOrder
      : undefined) ||
    (data.team1Players || []).map((player: any) => player?.id);

  initialOrder.forEach(pushUnique);
  (data.balls || []).forEach((ball) => pushUnique(ball.batsmanId));
  pushUnique(data.currentBatsmen?.striker?.id);
  pushUnique(data.currentBatsmen?.nonStriker?.id);
  (data.remainingBatters || []).forEach(pushUnique);
  (data.team1Players || []).forEach((player: any) => pushUnique(player?.id));

  const filteredBowlingStats = bowlingStats.filter((bowlerWithBalls) => {
    const original = bowlingMap.get(bowlerWithBalls.id);
    return !!original?.balls && original.balls > 0;
  });

  const orderedBattingStats = resolvedBattingOrder
    .map((playerId) => battingLookup.get(playerId))
    .filter(Boolean) as ScorecardBatting[];
  const finalBattingStatsBase: ScorecardBatting[] = orderedBattingStats.length ? orderedBattingStats : battingStats;

  const shouldDisplayBatter = (batter: ScorecardBatting | undefined): boolean => {
    if (!batter) {
      return false;
    }
    if (batter.isPlaceholder) {
      return Boolean(batter.isCurrentlyBatting);
    }
    if (batter.isCurrentlyBatting) {
      return true;
    }
    if (batter.isOut) {
      return true;
    }
    if (batter.balls > 0 || batter.runs > 0) {
      return true;
    }
    return false;
  };

  const finalBattingStats = finalBattingStatsBase.filter((stat) => shouldDisplayBatter(stat));

  const yetToBat = (resolvedBattingOrder
    .map((playerId) => battingLookup.get(playerId))
    .filter(Boolean) as ScorecardBatting[])
    .filter((batter) => !shouldDisplayBatter(batter) && !batter.isPlaceholder)
    .map((batter) => batter.name);

  let orderedBowlingStats = filteredBowlingStats;
  if (data.bowlingOrder?.length) {
    const bowlingLookup = new Map(filteredBowlingStats.map((bowler) => [bowler.id, bowler]));
    const orderedBySelection = data.bowlingOrder
      .map((playerId) => bowlingLookup.get(playerId))
      .filter((value): value is ScorecardBowling => Boolean(value));
    if (orderedBySelection.length) {
      orderedBowlingStats = orderedBySelection;
    }
  }

  return {
    battingStats: finalBattingStats,
    bowlingStats: orderedBowlingStats,
    fallOfWickets,
    extras,
    yetToBat,
  };
};

const buildMatchSummaryFromData = (data: MatchData): MatchSummary => {
  const scorecard = buildScorecardData(data);
  const topBatsman = [...scorecard.battingStats].sort((a, b) => {
    if (b.runs !== a.runs) return b.runs - a.runs;
    return a.balls - b.balls;
  })[0];

  const topBowler = [...scorecard.bowlingStats].sort((a, b) => {
    if (b.wickets !== a.wickets) return b.wickets - a.wickets;
    return a.runs - b.runs;
  })[0];

  // Calculate team scores from innings history if available
  let teamAScore = `${data.totalRuns}/${data.wickets}`;
  let teamBScore: string | undefined;
  
  if (data.inningsHistory && data.inningsHistory.length > 0) {
    // Get first innings (team1 batting)
    const firstInnings = data.inningsHistory[0];
    teamAScore = `${firstInnings.totalRuns || data.totalRuns}/${firstInnings.wickets || data.wickets}`;
    
    // Get second innings (team2 batting) if exists
    if (data.inningsHistory.length > 1) {
      const secondInnings = data.inningsHistory[1];
      teamBScore = `${secondInnings.totalRuns || 0}/${secondInnings.wickets || 0}`;
    }
  }

  // Build result text
  let resultText = `${data.team1} posted ${teamAScore}`;
  if (teamBScore) {
    resultText += `, ${data.team2} ${teamBScore}`;
  }
  resultText += ` in ${data.currentOver}.${data.currentBall} overs`;

  return {
    teamAName: data.team1,
    teamBName: data.team2,
    teamAScore,
    teamBScore,
    overs: `${data.currentOver}.${data.currentBall}`,
    topBatsman: topBatsman
      ? { name: topBatsman.name, runs: topBatsman.runs, balls: topBatsman.balls }
      : undefined,
    topBowler: topBowler
      ? { name: topBowler.name, wickets: topBowler.wickets, runs: topBowler.runs }
      : undefined,
    resultText,
    timestamp: new Date().toISOString(),
    matchId: data.id,
  };
};

const LiveScoringScreen: React.FC<LiveScoringScreenProps> = ({
  onBack,
  matchId,
  teamA,
  teamB,
  autoSimulate = false,
  onSimulationProgress,
  onSimulationComplete,
  battingOrder,
  bowlingOrder,
  teamAPlayers,
  teamBPlayers,
  totalOvers,
}) => {
  const [matchData, setMatchData] = useState<MatchData>({
    id: '1',
    team1: teamA || 'Team A',
    team2: teamB || 'Team B',
    overs: totalOvers || SCORING_CONFIG.DEFAULT_OVERS,
    currentInnings: 1,
    currentOver: 0,
    currentBall: 0,
    totalRuns: 0,
    wickets: 0,
    balls: [],
    // Initialize with real players
    currentBatsmen: {
      striker: { id: 'rohit-sharma', name: 'Rohit Sharma', runs: 0, balls: 0, isOut: false, fours: 0, sixes: 0 },
      nonStriker: { id: 'suryakumar-yadav', name: 'Suryakumar Yadav', runs: 0, balls: 0, isOut: false, fours: 0, sixes: 0 }
    },
    currentBowler: { id: 'jasprit-bumrah', name: 'Jasprit Bumrah', overs: 0, wickets: 0, runs: 0 },
    nextBatsman: { id: 'tilak-varma', name: 'Tilak Varma' },
    team1Players: teamAPlayers || [],
    team2Players: teamBPlayers || [],
    team1PlayersOriginal: teamAPlayers || [],
    team2PlayersOriginal: teamBPlayers || [],
    battingOrder,
    bowlingOrder,
    remainingBatters:
      (battingOrder && battingOrder.slice(2)) ||
      (teamAPlayers ? teamAPlayers.slice(2).map((player: any) => player.id) : []),
    pendingFreeHit: false,
    battingTeamName: teamA || 'Team A',
    bowlingTeamName: teamB || 'Team B',
    inningsHistory: [],
    targetScore: undefined,
    matchResult: undefined,
    isMatchCompleted: false,
    awaitingNextInnings: false,
    pendingInningsSummary: null,
  });

  const [isScoring, setIsScoring] = useState(false);
  const [selectedRuns, setSelectedRuns] = useState<number | null>(null);
  const [showExtras, setShowExtras] = useState(false);
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [selectedExtraType, setSelectedExtraType] = useState<string | null>(null);
  const [extraRunsValue, setExtraRunsValue] = useState<number>(1);
  const [noBallRunSource, setNoBallRunSource] = useState<'bat' | 'bye' | 'leg-bye'>('bat');
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [selectedWicketType, setSelectedWicketType] = useState<string | null>(null);
  const [selectedDismissalFielderId, setSelectedDismissalFielderId] = useState<string | null>(null);
  const [pendingDismissalError, setPendingDismissalError] = useState<string | null>(null);
  
  // Shot details modal state
  const [showShotDetails, setShowShotDetails] = useState(false);
  const [pendingBallData, setPendingBallData] = useState<Partial<BallData> | null>(null);
  
  // Professional UI state
  const [activeTab, setActiveTab] = useState<'live' | 'scorecard' | 'commentary'>('live');

  // Manual selection modals
  const [showNextBatsmanSelector, setShowNextBatsmanSelector] = useState(false);
  const [nextBatsmanSelectionMode, setNextBatsmanSelectionMode] = useState<'required' | 'optional' | null>(null);
  const [nextBatsmanOptions, setNextBatsmanOptions] = useState<any[]>([]);
  const [showNextBowlerSelector, setShowNextBowlerSelector] = useState(false);
  const [nextBowlerSelectionMode, setNextBowlerSelectionMode] = useState<'required' | 'optional' | null>(null);
  const [nextBowlerOptions, setNextBowlerOptions] = useState<any[]>([]);
  const [showInningsBreakOverlay, setShowInningsBreakOverlay] = useState(false);
  const [inningsBreakSummary, setInningsBreakSummary] = useState<InningsSummary | null>(null);
  const [showMatchCompleteOverlay, setShowMatchCompleteOverlay] = useState(false);
  const [matchCompletionSummary, setMatchCompletionSummary] = useState<{ summary: InningsSummary; resultText: string } | null>(null);
  const [isClosingMatch, setIsClosingMatch] = useState(false);
  const [openingSelectionStep, setOpeningSelectionStep] = useState<'none' | 'striker' | 'nonStriker' | 'bowler'>('none');
  
  const scorecardData = useMemo(() => buildScorecardData(matchData), [matchData]);
  const battingNameLookup = useMemo(() => {
    const map = new Map<string, string>();
    (matchData.team1Players || []).forEach((player: any) => {
      if (player?.id) {
        map.set(player.id, player.name || player.id);
      }
    });
    return map;
  }, [matchData.team1Players]);

  const bowlingNameLookup = useMemo(() => {
    const map = new Map<string, string>();
    (matchData.team2Players || []).forEach((player: any) => {
      if (player?.id) {
        map.set(player.id, player.name || player.id);
      }
    });
    return map;
  }, [matchData.team2Players]);

  const decorateBallForDisplay = useCallback(
    (ball: BallData) => {
      const batsmanName =
        ball.batsmanOnStrike ||
        (ball.batsmanId ? battingNameLookup.get(ball.batsmanId) : undefined) ||
        ball.batsmanId ||
        'Batter';
      const bowlerName =
        ball.bowlerName ||
        (ball.bowlerId ? bowlingNameLookup.get(ball.bowlerId) : undefined) ||
        ball.bowlerId ||
        'Bowler';

      let actionDescription: string;
      if (ball.commentary) {
        actionDescription = ball.commentary;
      } else if (ball.isWicket) {
        actionDescription = `${ball.wicketType || 'Wicket'}!`;
      } else if (ball.runs === 6) {
        actionDescription = 'SIX!';
      } else if (ball.runs === 4) {
        actionDescription = 'FOUR!';
      } else if (ball.runs === 0) {
        actionDescription = 'no run';
      } else {
        actionDescription = `${ball.runs} run${ball.runs !== 1 ? 's' : ''}`;
      }

      if (ball.wasFreeHit && !actionDescription.toLowerCase().includes('free hit')) {
        actionDescription = `${actionDescription} (free hit)`;
      }

      return {
        ...ball,
        batsman: batsmanName,
        bowler: bowlerName,
        commentary: actionDescription,
      };
    },
    [battingNameLookup, bowlingNameLookup]
  );

  const recentBallsForLive = useMemo(
    () =>
      matchData.balls
        .slice()
        .reverse()
        .slice(0, 6)
        .map((ball) => decorateBallForDisplay(ball)),
    [matchData.balls, decorateBallForDisplay]
  );

  const recentBallsForCommentary = useMemo(
    () =>
      matchData.balls
        .slice()
        .reverse()
        .slice(0, 10)
        .map((ball) => decorateBallForDisplay(ball)),
    [matchData.balls, decorateBallForDisplay]
  );

  const currentOverBalls = useMemo(
    () =>
      matchData.balls
        .filter((ball) => ball.over === matchData.currentOver)
        .map((ball) => decorateBallForDisplay(ball)),
    [matchData.balls, matchData.currentOver, decorateBallForDisplay]
  );

  const currentOverSummary = useMemo(
    () => ({
      over: matchData.currentOver,
      balls: currentOverBalls,
      runs: currentOverBalls.reduce((sum, ball) => sum + ball.runs, 0),
      wickets: currentOverBalls.filter((ball) => ball.isWicket).length,
    }),
    [matchData.currentOver, currentOverBalls]
  );

  const persistLocalMatchSnapshot = useCallback(
    async (data: MatchData) => {
      if (!matchId) {
        return;
      }
      try {
        await AsyncStorage.setItem(
          'currentMatchSnapshot',
          JSON.stringify(
            sanitizeForFirestore({
              matchId,
              matchData: {
                team1: data.team1,
                team2: data.team2,
                totalRuns: data.totalRuns,
                wickets: data.wickets,
                currentOver: data.currentOver,
                currentBall: data.currentBall,
                currentBatsmen: data.currentBatsmen,
                currentBowler: data.currentBowler,
                nextBatsman: data.nextBatsman,
                remainingBatters: data.remainingBatters,
                battingOrder: data.battingOrder,
                bowlingOrder: data.bowlingOrder,
                team1Players: data.team1Players,
                team2Players: data.team2Players,
                pendingFreeHit: data.pendingFreeHit,
                team1PlayersOriginal: data.team1PlayersOriginal,
                team2PlayersOriginal: data.team2PlayersOriginal,
                battingTeamName: data.battingTeamName,
                bowlingTeamName: data.bowlingTeamName,
                inningsHistory: data.inningsHistory,
                targetScore: data.targetScore,
                matchResult: data.matchResult,
                isMatchCompleted: data.isMatchCompleted,
                awaitingNextInnings: data.awaitingNextInnings,
                pendingInningsSummary: data.pendingInningsSummary,
              },
            })
          )
        );
      } catch (error) {
        console.warn('⚠️ Failed to persist match snapshot', error);
      }
    },
    [matchId]
  );
  const isSelectionPending = showNextBatsmanSelector || showNextBowlerSelector;
  const selectedWicketConfig = selectedWicketType
    ? WICKET_TYPES.find((type) => type.id === selectedWicketType)
    : undefined;
  const wicketRequiresFielder = !!selectedWicketConfig?.requiresFielder;

  // User and Admin Management
  const { user, isAdminForTeam } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  // Edit Lock Management - Prevent multiple admins from editing simultaneously
  const [editLock, setEditLock] = useState<{
    isLocked: boolean;
    lockedBy: string | null;
    lockedByName: string | null;
    lockedAt: number | null;
  }>({
    isLocked: false,
    lockedBy: null,
    lockedByName: null,
    lockedAt: null,
  });
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const lockCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const matchDataRef = useRef(matchData);

  useEffect(() => {
    if (!totalOvers) {
      return;
    }
    if (matchDataRef.current.overs === totalOvers) {
      return;
    }
    setMatchData(prev => {
      const updated = {
        ...prev,
        overs: totalOvers,
      };
      matchDataRef.current = updated;
      return updated;
    });
  }, [totalOvers]);
  useEffect(() => {
    matchDataRef.current = matchData;
  }, [matchData]);

  useEffect(() => {
    const hydrateFromSnapshot = async () => {
      if (!matchId) {
        return;
      }
      try {
        const raw = await AsyncStorage.getItem('currentMatchSnapshot');
        if (!raw) {
          return;
        }
        const parsed = JSON.parse(raw);
        if (parsed?.matchId !== matchId || !parsed.matchData) {
          return;
        }
        const snapshot = parsed.matchData;
        matchDataRef.current = {
          ...matchDataRef.current,
          team1: snapshot.team1 || matchDataRef.current.team1,
          team2: snapshot.team2 || matchDataRef.current.team2,
          totalRuns: snapshot.totalRuns ?? matchDataRef.current.totalRuns,
          wickets: snapshot.wickets ?? matchDataRef.current.wickets,
          currentOver: snapshot.currentOver ?? matchDataRef.current.currentOver,
          currentBall: snapshot.currentBall ?? matchDataRef.current.currentBall,
          currentBatsmen: snapshot.currentBatsmen
            ? {
                striker: {
                  ...matchDataRef.current.currentBatsmen.striker,
                  ...snapshot.currentBatsmen.striker,
                },
                nonStriker: {
                  ...matchDataRef.current.currentBatsmen.nonStriker,
                  ...snapshot.currentBatsmen.nonStriker,
                },
              }
            : matchDataRef.current.currentBatsmen,
          currentBowler: snapshot.currentBowler
            ? {
                ...matchDataRef.current.currentBowler,
                ...snapshot.currentBowler,
              }
            : matchDataRef.current.currentBowler,
          nextBatsman: snapshot.nextBatsman || matchDataRef.current.nextBatsman,
          remainingBatters: snapshot.remainingBatters || matchDataRef.current.remainingBatters,
          battingOrder: snapshot.battingOrder || matchDataRef.current.battingOrder,
          bowlingOrder: snapshot.bowlingOrder || matchDataRef.current.bowlingOrder,
          team1Players: snapshot.team1Players || matchDataRef.current.team1Players,
          team2Players: snapshot.team2Players || matchDataRef.current.team2Players,
          pendingFreeHit:
            snapshot.pendingFreeHit ?? matchDataRef.current.pendingFreeHit ?? false,
          awaitingNextInnings:
            snapshot.awaitingNextInnings ?? matchDataRef.current.awaitingNextInnings ?? false,
          pendingInningsSummary:
            snapshot.pendingInningsSummary || matchDataRef.current.pendingInningsSummary || null,
          team1PlayersOriginal:
            snapshot.team1PlayersOriginal || matchDataRef.current.team1PlayersOriginal,
          team2PlayersOriginal:
            snapshot.team2PlayersOriginal || matchDataRef.current.team2PlayersOriginal,
          battingTeamName: snapshot.battingTeamName || matchDataRef.current.battingTeamName,
          bowlingTeamName:
            snapshot.bowlingTeamName || matchDataRef.current.bowlingTeamName,
          inningsHistory: snapshot.inningsHistory || matchDataRef.current.inningsHistory,
          targetScore: snapshot.targetScore ?? matchDataRef.current.targetScore,
          matchResult: snapshot.matchResult ?? matchDataRef.current.matchResult,
          isMatchCompleted:
            snapshot.isMatchCompleted ?? matchDataRef.current.isMatchCompleted ?? false,
        };
        setMatchData(matchDataRef.current);
      } catch (error) {
        console.warn('⚠️ Failed to hydrate match snapshot', error);
      }
    };

    hydrateFromSnapshot();
  }, [matchId]);

  const simulationRunningRef = useRef(false);

  const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const normalizePlayer = (player: any, fallbackId: string = 'player', fallbackName: string = 'Player') => ({
    id: player?.id ?? fallbackId,
    name: player?.name ?? fallbackName,
    role: player?.role || player?.position || 'Player',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  });

  const getRemainingBatsmenOptions = (data: MatchData) => {
    const remainingIds = data.remainingBatters || [];
    return remainingIds
      .map((id) => data.team1Players.find((player: any) => player.id === id))
      .filter(Boolean);
  };

  const buildBowlerDeliveryMap = (balls: BallData[]) => {
    const map = new Map<string, number>();
    balls.forEach((ball) => {
      if (!ball.bowlerId) {
        return;
      }
      if (ball.legalDelivery ?? true) {
        map.set(ball.bowlerId, (map.get(ball.bowlerId) || 0) + 1);
      }
    });
    return map;
  };

  const getBowlerFigures = (playerId: string, balls: BallData[]) => {
    let deliveries = 0;
    let runs = 0;
    let wickets = 0;
    balls.forEach((ball) => {
      if (ball.bowlerId !== playerId) {
        return;
      }
      if (ball.legalDelivery ?? true) {
        deliveries += 1;
      }
      runs += ball.runs;
      if (ball.isWicket) {
        wickets += 1;
      }
    });
    const overs = deliveries
      ? Math.floor(deliveries / SCORING_CONFIG.BALLS_PER_OVER) +
        (deliveries % SCORING_CONFIG.BALLS_PER_OVER) / 10
      : 0;
    return { deliveries, overs, runs, wickets };
  };

  const getEligibleBowlerOptions = (data: MatchData) => {
    const usage = buildBowlerDeliveryMap(data.balls);
    const currentBowlerId = data.currentBowler?.id;
    return (data.team2Players || []).filter((player: any) => {
      if (!player?.id) {
        return false;
      }
      if (player.id === currentBowlerId) {
        return true;
      }
      const deliveries = usage.get(player.id) || 0;
      const oversBowled = deliveries / SCORING_CONFIG.BALLS_PER_OVER;
      return oversBowled < MAX_T20_OVERS_PER_BOWLER;
    });
  };

  const openNextBatsmanSelector = (mode: 'required' | 'optional') => {
    if (autoSimulate) {
      return;
    }
    const options = getRemainingBatsmenOptions(matchDataRef.current);
    if (!options.length) {
      if (mode === 'optional') {
        Alert.alert('No Batters Available', 'All players are already at the crease or all out.');
      }
      return;
    }
    setNextBatsmanSelectionMode(mode);
    setNextBatsmanOptions(options);
    setShowNextBatsmanSelector(true);
  };

  const openNextBowlerSelector = (mode: 'required' | 'optional') => {
    if (autoSimulate) {
      return;
    }
    const options = getEligibleBowlerOptions(matchDataRef.current);
    if (!options.length) {
      if (mode === 'optional') {
        Alert.alert('No Bowlers Available', 'All bowlers have reached their maximum overs.');
      }
      return;
    }
    setNextBowlerSelectionMode(mode);
    setNextBowlerOptions(options);
    setShowNextBowlerSelector(true);
  };

  const beginOpeningSelection = (state: MatchData) => {
    if (autoSimulate) {
      return;
    }
    const options = getRemainingBatsmenOptions(state);
    if (!options.length) {
      setOpeningSelectionStep('none');
      return;
    }
    setOpeningSelectionStep('striker');
    setNextBatsmanSelectionMode('required');
    setNextBatsmanOptions(options);
    setShowNextBatsmanSelector(true);
  };

  useEffect(() => {
    const battingLineup = battingOrder && battingOrder.length > 0 ? battingOrder : matchData.battingOrder;
    const bowlingLineup = bowlingOrder && bowlingOrder.length > 0 ? bowlingOrder : matchData.bowlingOrder;
    const team1List = teamAPlayers && teamAPlayers.length > 0 ? teamAPlayers : matchData.team1Players;
    const team2List = teamBPlayers && teamBPlayers.length > 0 ? teamBPlayers : matchData.team2Players;

    if (!team1List || !team2List) {
      return;
    }

    if (team1List.length === 0 || team2List.length === 0) {
      return;
    }

    setMatchData(prev => {
      // If balls already recorded, just ensure player lists are stored
      if (prev.balls.length > 0) {
        const updated = {
          ...prev,
          team1Players: team1List,
          team2Players: team2List,
          battingOrder: battingLineup || prev.battingOrder,
          bowlingOrder: bowlingLineup || prev.bowlingOrder,
          remainingBatters:
            (battingLineup && battingLineup.length > 2
              ? battingLineup.slice(2)
              : team1List.slice(2).map((player: any) => player.id)),
        };
        matchDataRef.current = updated;
        return updated;
      }

      const findPlayer = (players: any[], id?: string) =>
        (id && players.find(player => player.id === id)) || players[0];

      const strikerSource = findPlayer(team1List, battingLineup?.[0]);
      const nonStrikerSource =
        (battingLineup?.[1] && team1List.find(player => player.id === battingLineup[1])) ||
        team1List.find(player => player.id !== strikerSource.id) ||
        strikerSource;
      const nextBatsmanSource =
        (battingLineup?.slice(2).map(id => team1List.find(player => player.id === id)).find(Boolean)) ||
        team1List.find(player => player.id !== strikerSource.id && player.id !== nonStrikerSource.id) ||
        strikerSource;
      const bowlerSource = findPlayer(team2List, bowlingLineup?.[0]);

      const striker = normalizePlayer(strikerSource, 'player1', 'Batsman 1');
      const nonStriker = normalizePlayer(nonStrikerSource, 'player2', 'Batsman 2');

      const nextBatsman = {
        id: nextBatsmanSource?.id || striker.id,
        name: nextBatsmanSource?.name || striker.name,
      };

      const bowler = {
        id: bowlerSource?.id || team2List[0].id,
        name: bowlerSource?.name || team2List[0].name,
        overs: 0,
        wickets: 0,
        runs: 0,
      };

      const updated: MatchData = {
        ...prev,
        team1Players: team1List,
        team2Players: team2List,
        battingOrder: battingLineup || prev.battingOrder,
        bowlingOrder: bowlingLineup || prev.bowlingOrder,
        currentBatsmen: {
          striker,
          nonStriker,
        },
        nextBatsman,
        currentBowler: bowler,
        remainingBatters:
          (battingLineup && battingLineup.length > 2
            ? battingLineup.slice(2)
            : team1List.slice(2).map((player: any) => player.id)),
      };

      matchDataRef.current = updated;
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battingOrder, bowlingOrder, teamAPlayers, teamBPlayers]);

  // Removed offline functionality - just use Firebase directly
  // const { 
  //   offlineState, 
  //   addBallOffline, 
  //   updateMatchOffline, 
  //   syncData, 
  //   forceSync,
  //   refreshStatus 
  // } = useOfflineScoring();

  // Load real players based on team names
  const loadRealPlayers = () => {
    const team1Data = REAL_CRICKET_TEAMS.find(team => team.name === matchData.team1);
    const team2Data = REAL_CRICKET_TEAMS.find(team => team.name === matchData.team2);
    
    if (team1Data && team2Data) {
      const team1Batsmen = getBatsmen(team1Data.id);
      const team2Batsmen = getBatsmen(team2Data.id);
      const team1Bowlers = getBowlers(team1Data.id);
      const team2Bowlers = getBowlers(team2Data.id);
      
      setMatchData(prev => ({
        ...prev,
        currentBatsmen: {
          striker: { 
            id: team1Batsmen[0]?.id || 'player1', 
            name: team1Batsmen[0]?.name || 'Batsman 1', 
            runs: 0, 
            balls: 0, 
            isOut: false,
            fours: 0,
            sixes: 0
          },
          nonStriker: { 
            id: team1Batsmen[1]?.id || 'player2', 
            name: team1Batsmen[1]?.name || 'Batsman 2', 
            runs: 0, 
            balls: 0, 
            isOut: false,
            fours: 0,
            sixes: 0
          }
        },
        currentBowler: { 
          id: team2Bowlers[0]?.id || 'bowler1', 
          name: team2Bowlers[0]?.name || 'Bowler 1', 
          overs: 0, 
          wickets: 0, 
          runs: 0 
        },
        nextBatsman: { 
          id: team1Batsmen[2]?.id || 'player3', 
          name: team1Batsmen[2]?.name || 'Next Batsman' 
        },
        team1Players: team1Data.players,
        team2Players: team2Data.players
      }));
    }
  };

  const createDemoMatch = async () => {
    try {
      setLoading(true);
      // Create a demo match in Firebase
      const matchId = await liveScoringService.createMatch({
        name: `${teamA || 'Mumbai Indians'} vs ${teamB || 'Chennai Super Kings'}`,
        team1: { id: 'team1', name: teamA || 'Mumbai Indians', players: [] },
        team2: { id: 'team2', name: teamB || 'Chennai Super Kings', players: [] },
        matchType: 'T20',
        totalOvers: totalOvers || SCORING_CONFIG.DEFAULT_OVERS,
        currentInnings: 1,
        status: 'live',
        createdBy: 'user',
        isLive: true,
      });
      
      // Update the matchId in the component
      setMatchData(prev => ({ ...prev, id: matchId }));
      loadRealPlayers();
    } catch (error) {
      console.error('Error creating demo match:', error);
      loadRealPlayers();
    } finally {
      setLoading(false);
    }
  };

  // Track which matchId has been loaded to prevent re-loading
  const loadedMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only load if matchId changed
    if (loadedMatchIdRef.current === matchId) {
      logVerbose('⏭️  Data already loaded for this matchId, skipping...');
      return;
    }
    
    logVerbose('🔄 LiveScoringScreen useEffect - matchId:', matchId);
    if (matchId) {
      logVerbose('📥 Loading existing match data...');
      loadMatchData();
      loadedMatchIdRef.current = matchId;
    } else {
      logVerbose('🆕 No match ID provided - creating demo match...');
      createDemoMatch();
      loadedMatchIdRef.current = null;
    }
  }, [matchId]);

  useEffect(() => {
    if (!autoSimulate) {
      return;
    }

    if (simulationRunningRef.current) {
      return;
    }

    if (!matchId) {
      console.warn('⚠️ Auto-simulation requested but matchId is missing');
      onSimulationProgress?.('Cannot start simulation without a match ID.');
      onSimulationComplete?.();
      return;
    }

    if (matchDataRef.current.balls.length > 0) {
    logVerbose('ℹ️ Match already contains deliveries, skipping auto-simulation.');
      onSimulationProgress?.('Match already has deliveries; skipping auto-simulation.');
      onSimulationComplete?.();
      return;
    }

    simulationRunningRef.current = true;

    (async () => {
      await waitFor(600);
      await simulateTwentyOverMatch();
      simulationRunningRef.current = false;
    })();
    // We intentionally omit simulateTwentyOverMatch from deps because the ref guard prevents re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSimulate, matchId]);

  // Temporary function to make current user admin for testing
  const makeMeAdmin = async () => {
    if (!user || !matchId) {
      Alert.alert('Error', 'User or match not found');
      return;
    }

    try {
      // For testing, we'll directly set the user as admin in the match document
      // This bypasses the team-based admin system for now
      logVerbose('🔑 Making user admin for testing:', user.phoneNumber);
      setIsAdmin(true);
      Alert.alert('Success', 'You are now an admin! Click "Start Scoring" to begin editing.');
    } catch (error) {
      console.error('Error making admin:', error);
      Alert.alert('Error', 'Failed to make you admin');
    }
  };

  // Lock management functions
  const requestEditAccess = async () => {
    if (!user || !matchId) return;

    const success = await liveScoringService.acquireEditLock(
      matchId,
      user.phoneNumber,
      user.name || `User ${user.phoneNumber}`
    );

    if (success) {
      setHasEditAccess(true);
      setIsScoring(true);
      Alert.alert('✅ Edit Access Granted', 'You can now edit scores. The match is locked for other admins.');
    } else {
      Alert.alert(
        '🔒 Match Locked',
        `${editLock.lockedByName} is currently editing. Please wait for them to finish.`,
        [{ text: 'OK' }]
      );
    }
  };

  const releaseEditAccess = async () => {
    if (!user || !matchId) return;

    await liveScoringService.releaseEditLock(matchId, user.phoneNumber);
    setHasEditAccess(false);
    setIsScoring(false);
  };

  // Subscribe to lock changes in real-time
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = liveScoringService.subscribeToEditLock(matchId, (lock) => {
      setEditLock(lock);

      // Check if current user has edit access
      if (user && lock.lockedBy === user.phoneNumber) {
        setHasEditAccess(true);
      } else if (user && lock.lockedBy !== user.phoneNumber && lock.isLocked) {
        // Someone else is editing
        setHasEditAccess(false);
        setIsScoring(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [matchId, user]);

  // Renew lock every 2 minutes while editing
  useEffect(() => {
    if (hasEditAccess && matchId && user) {
      lockCheckInterval.current = setInterval(() => {
        liveScoringService.renewEditLock(matchId, user.phoneNumber);
      }, 2 * 60 * 1000); // Renew every 2 minutes

      return () => {
        if (lockCheckInterval.current) {
          clearInterval(lockCheckInterval.current);
        }
      };
    }
  }, [hasEditAccess, matchId, user]);

  // Release lock when component unmounts
  useEffect(() => {
    return () => {
      if (hasEditAccess && matchId && user) {
        liveScoringService.releaseEditLock(matchId, user.phoneNumber);
      }
    };
  }, [hasEditAccess, matchId, user]);

  // Check admin status when user or matchId changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !matchId) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        setAdminLoading(true);
        const adminStatus = await isAdminForTeam(matchId);
        setIsAdmin(adminStatus);
        logVerbose('👑 Admin status for', user.phoneNumber, 'in match', matchId, ':', adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, matchId, isAdminForTeam]);

  // Disabled auto-save to prevent continuous refreshing
  // Data is saved after each ball anyway
  // useEffect(() => {
  //   // Auto-save every 30 seconds (only when online and matchId exists)
  //   if (offlineState.isOnline && matchId) {
  //     autoSaveRef.current = setInterval(() => {
  //       saveMatchData();
  //     }, APP_CONFIG.PERFORMANCE.AUTO_SAVE_INTERVAL);
  //   }

  //   return () => {
  //     if (autoSaveRef.current) {
  //       clearInterval(autoSaveRef.current);
  //     }
  //   };
  // }, [offlineState.isOnline, matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;
    
    try {
      setLoading(true);
      logVerbose('🔍 Looking for match with ID:', matchId);
      const match = await liveScoringService.getMatch(matchId);
      if (match) {
        logVerbose('✅ Match found in Firebase:', match);
        setCurrentMatch(match);
        const team1PlayersList = match.team1.players || [];
        const team2PlayersList = match.team2.players || [];

        const fallbackStriker = { id: 'player1', name: 'Batsman 1' };
        const fallbackNonStriker = { id: 'player2', name: 'Batsman 2' };
        const fallbackBowler = { id: 'bowler1', name: 'Bowler 1' };

        const strikerSource = team1PlayersList.find((player: any) => player.id === match.currentBatsmen?.striker?.id)
          || team1PlayersList[0]
          || fallbackStriker;
        const nonStrikerSource = team1PlayersList.find((player: any) => player.id === match.currentBatsmen?.nonStriker?.id)
          || team1PlayersList.find((player: any) => player.id !== strikerSource.id)
          || fallbackNonStriker;
        const savedNextBatsman = match.nextBatsman;
        const nextBatsmanSource =
          savedNextBatsman && savedNextBatsman.id
            ? team1PlayersList.find((player: any) => player.id === savedNextBatsman.id) || {
                id: savedNextBatsman.id,
                name: savedNextBatsman.name || savedNextBatsman.id,
              }
            : team1PlayersList[2] || strikerSource;
        const bowlerSource = team2PlayersList.find((player: any) => player.id === match.currentBowler?.id)
          || team2PlayersList[0]
          || fallbackBowler;

        const restoredMatchData: MatchData = {
          id: match.id,
          team1: match.team1.name,
          team2: match.team2.name,
          overs: match.totalOvers || totalOvers || SCORING_CONFIG.DEFAULT_OVERS,
          currentInnings: match.currentInnings || 1,
          currentOver: match.currentOver ?? 0,
          currentBall: match.currentBall ?? 0,
          totalRuns: match.totalRuns ?? 0,
          wickets: match.wickets ?? 0,
          balls: [],
          currentBatsmen: {
            striker: {
              id: match.currentBatsmen?.striker?.id || strikerSource.id,
              name: match.currentBatsmen?.striker?.name || strikerSource.name,
              runs: match.currentBatsmen?.striker?.runs ?? 0,
              balls: match.currentBatsmen?.striker?.balls ?? 0,
              fours: match.currentBatsmen?.striker?.fours ?? 0,
              sixes: match.currentBatsmen?.striker?.sixes ?? 0,
              isOut: match.currentBatsmen?.striker?.isOut ?? false,
            },
            nonStriker: {
              id: match.currentBatsmen?.nonStriker?.id || nonStrikerSource.id,
              name: match.currentBatsmen?.nonStriker?.name || nonStrikerSource.name,
              runs: match.currentBatsmen?.nonStriker?.runs ?? 0,
              balls: match.currentBatsmen?.nonStriker?.balls ?? 0,
              fours: match.currentBatsmen?.nonStriker?.fours ?? 0,
              sixes: match.currentBatsmen?.nonStriker?.sixes ?? 0,
              isOut: match.currentBatsmen?.nonStriker?.isOut ?? false,
            },
          },
          currentBowler: {
            id: match.currentBowler?.id || bowlerSource.id,
            name: match.currentBowler?.name || bowlerSource.name,
            overs: match.currentBowler?.overs ?? 0,
            wickets: match.currentBowler?.wickets ?? 0,
            runs: match.currentBowler?.runs ?? 0,
          },
          nextBatsman: {
            id: (savedNextBatsman && savedNextBatsman.id) || nextBatsmanSource.id,
            name: (savedNextBatsman && savedNextBatsman.name) || nextBatsmanSource.name,
          },
          team1Players: team1PlayersList,
          team2Players: team2PlayersList,
          team1PlayersOriginal: (match as any).team1PlayersOriginal || team1PlayersList,
          team2PlayersOriginal: (match as any).team2PlayersOriginal || team2PlayersList,
          battingOrder: (match.battingOrder && match.battingOrder.length ? match.battingOrder : battingOrder) ||
            team1PlayersList.map((player: any) => player.id),
          bowlingOrder: (match.bowlingOrder && match.bowlingOrder.length ? match.bowlingOrder : bowlingOrder) ||
            team2PlayersList.slice(0, Math.min(6, team2PlayersList.length)).map((player: any) => player.id),
          remainingBatters:
            (match.remainingBatters && match.remainingBatters.length ? match.remainingBatters : undefined) ||
            ((match.battingOrder && match.battingOrder.slice(2)) ||
              team1PlayersList
                .map((player: any) => player.id)
                .filter(
                  (id: string) =>
                    id !== strikerSource.id &&
                    id !== nonStrikerSource.id
                )),
          pendingFreeHit: match.pendingFreeHit ?? false,
          awaitingNextInnings: (match as any).awaitingNextInnings ?? false,
          pendingInningsSummary: (match as any).pendingInningsSummary ?? null,
          battingTeamName: (match as any).battingTeamName || match.team1.name,
          bowlingTeamName: (match as any).bowlingTeamName || match.team2.name,
          inningsHistory: (match as any).inningsHistory || [],
          targetScore: (match as any).targetScore ?? undefined,
          matchResult: (match as any).matchResult ?? undefined,
          isMatchCompleted: (match as any).isMatchCompleted ?? false,
        };

        matchDataRef.current = restoredMatchData;
        setMatchData(restoredMatchData);
        logVerbose('✅ Match data loaded successfully');

        // Load existing balls
        const balls = await liveScoringService.getMatchBalls(matchId);
          logVerbose('📊 Loaded balls from Firebase:', balls.length, 'balls');

        if (balls.length > 0) {
          const formattedBalls: BallData[] = balls.map((ball) => {
            const rawTimestamp: any = ball.timestamp;
            const timestampMs =
              rawTimestamp && typeof rawTimestamp === 'object' && typeof rawTimestamp.seconds === 'number'
                ? rawTimestamp.seconds * 1000
                : typeof rawTimestamp === 'number'
                ? rawTimestamp
                : Date.now();

            return {
              id: ball.id,
              over: ball.over,
              ball: ball.ball,
              runs: ball.runs,
              isWicket: ball.isWicket,
              wicketType: ball.wicketType,
              isExtra: ball.isExtra,
              extraType: ball.extraType,
              batsmanRuns: ball.batsmanRuns,
              extraRuns: ball.extraRuns,
              extraSubType: ball.extraSubType,
              legalDelivery: ball.legalDelivery ?? true,
              awardedFreeHit: ball.awardedFreeHit ?? false,
              wasFreeHit: ball.wasFreeHit ?? false,
              timestamp: timestampMs,
              batsmanId: ball.batsmanId,
              bowlerId: ball.bowlerId,
              innings: ball.innings ?? 1,
            } as BallData;
          });

          const activeInnings = restoredMatchData.currentInnings || 1;
          const filteredBalls = formattedBalls.filter(
            (ball) => (ball.innings ?? activeInnings) === activeInnings
          );

          const inningsRuns = filteredBalls.reduce((sum, ball) => sum + ball.runs, 0);
          const inningsWickets = filteredBalls.filter((ball) => ball.isWicket).length;

          logVerbose('📊 Updating match data with balls:', inningsRuns, 'runs,', inningsWickets, 'wickets');

          const updatedMatchData: MatchData = {
            ...restoredMatchData,
            totalRuns: inningsRuns,
            wickets: inningsWickets,
            currentOver: filteredBalls.length ? filteredBalls[filteredBalls.length - 1].over : restoredMatchData.currentOver,
            currentBall: filteredBalls.length ? filteredBalls[filteredBalls.length - 1].ball : restoredMatchData.currentBall,
            balls: filteredBalls,
          };

          matchDataRef.current = updatedMatchData;
          matchDataRef.current = updatedMatchData;
          setMatchData(updatedMatchData);
        } else {
          logVerbose('📊 No balls found, keeping match data as is');
        }
      } else {
        logVerbose('❌ No match found in Firebase');
        logVerbose('🔍 Expected match ID:', matchId);
        Alert.alert('Match Not Found', 'The match could not be found. It may have been deleted or not created yet.');
        // Don't retry - just fail gracefully
      }
    } catch (error) {
      console.error('❌ Error loading match data:', error);
      Alert.alert('Error', 'Failed to load match data');
    } finally {
      setLoading(false);
      logVerbose('🏁 Match data loading complete');
    }
  };

  useEffect(() => {
    if (!matchId) {
      return;
    }
    persistLocalMatchSnapshot(matchData);
  }, [matchData, matchId, persistLocalMatchSnapshot]);

  const saveMatchData = async () => {
    if (!matchId) return;
    
    try {
      // First try to get the match to see if it exists
      const existingMatch = await liveScoringService.getMatch(matchId);
      
      // Explicitly set status to 'completed' if match is completed
      const matchStatus = matchData.isMatchCompleted ? 'completed' : (matchData.awaitingNextInnings ? 'live' : 'live');
      const isLiveFlag = !matchData.isMatchCompleted && !matchData.awaitingNextInnings;
      
      // Log match completion status for debugging
      if (matchData.isMatchCompleted) {
        console.log('✅ Saving completed match:', matchId, 'Status:', matchStatus);
      }

      // Get venue from storage if available
      let venueName = existingMatch?.venue || 'Cricket Ground';
      try {
        const storedVenue = await AsyncStorage.getItem('currentMatchVenue');
        if (storedVenue) {
          venueName = storedVenue;
        }
      } catch (error) {
        console.warn('⚠️ Could not retrieve venue from storage:', error);
      }

      const payload = sanitizeForFirestore({
        name: `${matchData.team1} vs ${matchData.team2}`,
        team1: existingMatch?.team1 || { id: 'team1', name: matchData.team1, players: matchData.team1Players },
        team2: existingMatch?.team2 || { id: 'team2', name: matchData.team2, players: matchData.team2Players },
        totalOvers: matchData.overs,
        currentInnings: matchData.currentInnings,
        status: matchStatus,
        isLive: isLiveFlag,
        totalRuns: matchData.totalRuns,
        wickets: matchData.wickets,
        currentOver: matchData.currentOver,
        currentBall: matchData.currentBall,
        currentBatsmen: matchData.currentBatsmen,
        currentBowler: matchData.currentBowler,
        nextBatsman: matchData.nextBatsman,
        remainingBatters: matchData.remainingBatters,
        battingOrder: matchData.battingOrder,
        bowlingOrder: matchData.bowlingOrder,
        team1Players: matchData.team1Players,
        team2Players: matchData.team2Players,
        pendingFreeHit: matchData.pendingFreeHit,
        team1PlayersOriginal: matchData.team1PlayersOriginal,
        team2PlayersOriginal: matchData.team2PlayersOriginal,
        battingTeamName: matchData.battingTeamName,
        bowlingTeamName: matchData.bowlingTeamName,
        inningsHistory: matchData.inningsHistory,
        targetScore: matchData.targetScore,
        matchResult: matchData.matchResult,
        isMatchCompleted: matchData.isMatchCompleted,
        awaitingNextInnings: matchData.awaitingNextInnings,
        pendingInningsSummary: matchData.pendingInningsSummary,
        venue: venueName, // Ensure venue is always included
        completedAt: matchData.isMatchCompleted ? new Date().toISOString() : undefined,
      });

      if (existingMatch) {
        await liveScoringService.updateMatch(matchId, payload);
        logVerbose('✅ Match data updated in Firebase');
      } else {
        // Match doesn't exist, create it
        const cleanMatchData = {
          ...payload,
          matchType: 'T20',
          createdBy: 'user',
        };

        const newMatchId = await liveScoringService.createMatch(cleanMatchData as any);
        logVerbose('✅ Match created in Firebase with ID:', newMatchId);
        await AsyncStorage.setItem('currentMatchId', newMatchId);
      }
    } catch (error) {
      console.error('❌ Error saving match data:', error);
    }
  };

  const addBall = async (runs: number, isWicket: boolean = false, wicketType?: string, isExtra: boolean = false, extraType?: string) => {
    logVerbose('🏏 Adding ball:', { runs, isWicket, wicketType, isExtra, extraType, matchId });
    
    if (matchData.awaitingNextInnings) {
      Alert.alert('Start Second Innings', 'First innings is complete. Tap "Start Second Innings" to continue.');
      return;
    }
    
    if (matchData.isMatchCompleted) {
      Alert.alert('Match Completed', 'This match is already finished. No further scoring is allowed.');
      return;
    }
    
    // Validate wicket count - maximum 10 wickets per innings
    if (isWicket && matchData.wickets >= 10) {
      Alert.alert('All Out!', 'Innings complete! Maximum 10 wickets per innings. Start next innings or finish match.');
      return;
    }
    
    // For runs (1, 2, 3, 4, 6), show shot details modal
    if (runs > 0 && !isWicket && !isExtra) {
      setPendingBallData({
        runs,
        isWicket,
        isExtra,
        wicketType,
        extraType,
        over: matchData.currentOver,
        ball: matchData.currentBall,
        batsmanOnStrike: matchData.currentBatsmen.striker.name,
        batsmanId: matchData.currentBatsmen.striker.id,
        bowlerName: matchData.currentBowler.name,
        bowlerId: matchData.currentBowler.id,
      });
      setShowShotDetails(true);
      return;
    }
    
    // For wickets, extras, or dot balls, add directly without shot details
    await addBallWithDetails(runs, isWicket, wicketType, isExtra, extraType, undefined, undefined);
  };

  const addBallWithDetails = async (
    runs: number,
    isWicket: boolean = false,
    wicketType?: string,
    isExtra: boolean = false,
    extraType?: string,
    shotDetails?: ShotDetails,
    dismissalDetails?: { fielderId?: string; fielderName?: string },
    meta: BallMetaOptions = {}
  ) => {
    try {
      let currentMatch = matchDataRef.current;

      if (currentMatch.awaitingNextInnings) {
        if (autoSimulate && currentMatch.pendingInningsSummary) {
          const prepared = prepareSecondInnings(currentMatch, currentMatch.pendingInningsSummary);
          currentMatch = {
            ...prepared,
            awaitingNextInnings: false,
            pendingInningsSummary: null,
          };
          matchDataRef.current = currentMatch;
          setMatchData(currentMatch);
        } else {
          Alert.alert('Start Second Innings', 'First innings is complete. Tap "Start Second Innings" to continue.');
          return;
        }
      }

      const defaultLegalDelivery = !(isExtra && (extraType === 'Wide' || extraType === 'No Ball'));
      const legalDelivery = meta.legalDelivery ?? defaultLegalDelivery;

      let batsmanRuns = meta.batsmanRuns;
      if (batsmanRuns === undefined) {
        batsmanRuns = isExtra
          ? extraType === 'No Ball'
            ? Math.max(0, runs - 1)
            : 0
          : runs;
      }
      batsmanRuns = Math.max(0, Math.min(runs, batsmanRuns));

      let extraRuns = meta.extraRuns;
      if (extraRuns === undefined) {
        extraRuns = isExtra ? runs - batsmanRuns : 0;
      }
      extraRuns = Math.max(0, extraRuns);

      const extraSubType = meta.extraSubType;
      const awardFreeHit = !!meta.awardFreeHit;

      let pendingFreeHit = currentMatch.pendingFreeHit ?? false;
      const wasFreeHit = pendingFreeHit;

      if (wasFreeHit && legalDelivery) {
        pendingFreeHit = false;
      }
      if (awardFreeHit) {
        pendingFreeHit = true;
      }

      const baseBallNumber = currentMatch.currentBall + 1;
      const displayBallNumber = Math.min(baseBallNumber, SCORING_CONFIG.BALLS_PER_OVER);
      const ballId = `${currentMatch.currentInnings}-${currentMatch.currentOver}.${displayBallNumber}-${Date.now()}`;

      let commentary = shotDetails?.commentary;
      if (meta.commentaryOverride) {
        commentary = meta.commentaryOverride;
      }
      
      // Generate default commentary if none provided
      if (!commentary || commentary.trim() === '') {
        const batsmanName = currentMatch.currentBatsmen.striker.name;
        const bowlerName = currentMatch.currentBowler.name;
        
        if (isWicket) {
          commentary = `${batsmanName} is out! ${bowlerName} takes the wicket.`;
        } else if (isExtra) {
          if (extraType === 'Wide') {
            commentary = `Wide ball from ${bowlerName}. ${runs} run${runs !== 1 ? 's' : ''}.`;
          } else if (extraType === 'No Ball') {
            commentary = `No ball from ${bowlerName}. ${runs} run${runs !== 1 ? 's' : ''}.`;
          } else if (extraType === 'Bye') {
            commentary = `Bye${runs !== 1 ? 's' : ''}. ${runs} run${runs !== 1 ? 's' : ''}.`;
          } else if (extraType === 'Leg Bye') {
            commentary = `Leg bye${runs !== 1 ? 's' : ''}. ${runs} run${runs !== 1 ? 's' : ''}.`;
          } else {
            commentary = `${extraType || 'Extra'} from ${bowlerName}. ${runs} run${runs !== 1 ? 's' : ''}.`;
          }
        } else if (runs === 0) {
          commentary = `${batsmanName} defends the ball from ${bowlerName}.`;
        } else if (runs === 1) {
          commentary = `${batsmanName} takes a single off ${bowlerName}.`;
        } else if (runs === 2) {
          commentary = `${batsmanName} takes two runs off ${bowlerName}.`;
        } else if (runs === 3) {
          commentary = `${batsmanName} takes three runs off ${bowlerName}.`;
        } else if (runs === 4) {
          commentary = `${batsmanName} hits a boundary off ${bowlerName}!`;
        } else if (runs === 6) {
          commentary = `${batsmanName} hits a six off ${bowlerName}!`;
        } else {
          commentary = `${batsmanName} scores ${runs} runs off ${bowlerName}.`;
        }
      }

      // Build ball data object, only including wicketType and extraType if applicable
      const ballData: any = {
        over: currentMatch.currentOver,
        ball: displayBallNumber,
        runs,
        isWicket,
        isExtra,
        batsmanId: currentMatch.currentBatsmen.striker.id,
        bowlerId: currentMatch.currentBowler.id,
        batsmanOnStrike: currentMatch.currentBatsmen.striker.name,
        bowlerName: currentMatch.currentBowler.name,
        legalDelivery,
        batsmanRuns,
        extraRuns,
        innings: currentMatch.currentInnings,
        commentary, // Always include commentary
      };

      if (extraSubType) {
        ballData.extraSubType = extraSubType;
      }
      if (wasFreeHit) {
        ballData.wasFreeHit = true;
      }
      if (awardFreeHit) {
        ballData.awardedFreeHit = true;
      }

      if (shotDetails?.shotType) {
        ballData.shotType = Array.isArray(shotDetails.shotType) 
          ? shotDetails.shotType.join(', ') 
          : shotDetails.shotType;
      }
      if (shotDetails?.shotRegion) {
        ballData.shotRegion = Array.isArray(shotDetails.shotRegion) 
          ? shotDetails.shotRegion.join(', ') 
          : shotDetails.shotRegion;
      }
      if (shotDetails?.shotQuality) {
        ballData.shotQuality = Array.isArray(shotDetails.shotQuality) 
          ? shotDetails.shotQuality.join(', ') 
          : shotDetails.shotQuality;
      }
      // Commentary is already included in ballData above

      if (isWicket && wicketType) {
        ballData.wicketType = wicketType;
      }
      if (isWicket && dismissalDetails) {
        if (dismissalDetails.fielderId) {
          ballData.dismissalFielderId = dismissalDetails.fielderId;
        }
        if (dismissalDetails.fielderName) {
          ballData.dismissalFielderName = dismissalDetails.fielderName;
        }
      }

      if (isExtra && extraType) {
        ballData.extraType = extraType;
      }

      if (matchId) {
        try {
          logVerbose('🌐 Saving ball to Firebase...');
          await liveScoringService.addBall(matchId, sanitizeForFirestore(ballData));
          logVerbose('✅ Ball saved successfully');
        } catch (error) {
          console.error('❌ Failed to save ball:', error);
          Alert.alert('Save Failed', 'Could not save ball. Please check your internet connection.');
        }
      }

      const newBall: BallData = {
        id: ballId,
        over: currentMatch.currentOver,
        ball: displayBallNumber,
        runs,
        isWicket,
        wicketType: isWicket ? wicketType : undefined,
        isExtra,
        extraType: isExtra ? extraType : undefined,
        extraSubType,
        timestamp: Date.now(),
        shotType: shotDetails?.shotType 
          ? (Array.isArray(shotDetails.shotType) ? shotDetails.shotType.join(', ') : shotDetails.shotType)
          : undefined,
        shotRegion: shotDetails?.shotRegion 
          ? (Array.isArray(shotDetails.shotRegion) ? shotDetails.shotRegion.join(', ') : shotDetails.shotRegion)
          : undefined,
        shotQuality: shotDetails?.shotQuality 
          ? (Array.isArray(shotDetails.shotQuality) ? shotDetails.shotQuality.join(', ') : shotDetails.shotQuality)
          : undefined,
        commentary,
        batsmanOnStrike: currentMatch.currentBatsmen.striker.name,
        batsmanId: currentMatch.currentBatsmen.striker.id,
        bowlerName: currentMatch.currentBowler.name,
        bowlerId: currentMatch.currentBowler.id,
        batsmanRuns,
        extraRuns,
        legalDelivery,
        awardedFreeHit: awardFreeHit,
        wasFreeHit,
        innings: currentMatch.currentInnings,
      };

      if (isWicket) {
        if (dismissalDetails?.fielderId) {
          newBall.dismissalFielderId = dismissalDetails.fielderId;
        }
        if (dismissalDetails?.fielderName) {
          newBall.dismissalFielderName = dismissalDetails.fielderName;
        }
      }

      const newBalls = [...currentMatch.balls, newBall];
      const newTotalRuns = currentMatch.totalRuns + runs;
      const newWickets = isWicket ? currentMatch.wickets + 1 : currentMatch.wickets;
      const isInningsComplete = newWickets >= 10;

      let newOver = currentMatch.currentOver;
      let newBallInOver = currentMatch.currentBall;

      const updatedCurrentBatsmen = {
        striker: { ...currentMatch.currentBatsmen.striker },
        nonStriker: { ...currentMatch.currentBatsmen.nonStriker },
      };
      const updatedCurrentBowler = { ...currentMatch.currentBowler };
      let updatedRemainingBatters = [...currentMatch.remainingBatters];
      let overCompleted = false;
      const manualSelectionAllowed = !autoSimulate;
      let requiresNextBatsmanSelection = false;

      if (legalDelivery) {
        const prospectiveBallCount = currentMatch.currentBall + 1;
        if (prospectiveBallCount >= SCORING_CONFIG.BALLS_PER_OVER) {
          newOver += 1;
          newBallInOver = 0;
          overCompleted = true;

          const temp = updatedCurrentBatsmen.striker;
          updatedCurrentBatsmen.striker = updatedCurrentBatsmen.nonStriker;
          updatedCurrentBatsmen.nonStriker = temp;

          if (manualSelectionAllowed) {
            updatedCurrentBowler.id = 'pending-bowler';
            updatedCurrentBowler.name = 'Select Next Bowler';
            updatedCurrentBowler.overs = 0;
            updatedCurrentBowler.wickets = 0;
            updatedCurrentBowler.runs = 0;
          }
        } else {
          newBallInOver = prospectiveBallCount;
        }
      }

      if (!isWicket) {
        if (legalDelivery) {
          updatedCurrentBatsmen.striker.balls += 1;
        }
        if (batsmanRuns > 0) {
          updatedCurrentBatsmen.striker.runs += batsmanRuns;
          if (batsmanRuns === 4) updatedCurrentBatsmen.striker.fours += 1;
          if (batsmanRuns === 6) updatedCurrentBatsmen.striker.sixes += 1;
        }

        let shouldRotate = false;
        if (isExtra) {
          switch (extraType) {
            case 'Bye':
            case 'Leg Bye':
              shouldRotate = runs % 2 === 1;
              break;
            case 'Wide':
              shouldRotate = runs % 2 === 1;
              break;
            case 'No Ball': {
              if (batsmanRuns > 0) {
                shouldRotate = batsmanRuns % 2 === 1;
              } else {
                const runsFromRunning = Math.max(0, runs - 1);
                shouldRotate = runsFromRunning % 2 === 1;
              }
              break;
            }
            default:
              shouldRotate = batsmanRuns % 2 === 1;
          }
        } else {
          shouldRotate = batsmanRuns % 2 === 1;
        }

        if (shouldRotate) {
          const temp = updatedCurrentBatsmen.striker;
          updatedCurrentBatsmen.striker = updatedCurrentBatsmen.nonStriker;
          updatedCurrentBatsmen.nonStriker = temp;
        }
      } else {
        updatedCurrentBatsmen.striker.isOut = true;
        if (legalDelivery) {
          updatedCurrentBatsmen.striker.balls += 1;
        }

        if (manualSelectionAllowed && updatedRemainingBatters.length > 0) {
          requiresNextBatsmanSelection = true;
          updatedCurrentBatsmen.striker = normalizePlayer(
            { id: 'pending-batsman', name: 'Select Next Batsman' },
            'pending-batsman',
            'Select Next Batsman'
          );
        } else {
          const nextBatsmanId = updatedRemainingBatters.shift();
          if (nextBatsmanId) {
            const nextBatsmanPlayer =
              currentMatch.team1Players.find((player: any) => player.id === nextBatsmanId) || {
                id: nextBatsmanId,
                name: nextBatsmanId,
              };
            updatedCurrentBatsmen.striker = normalizePlayer(
              nextBatsmanPlayer,
              nextBatsmanPlayer.id || nextBatsmanId,
              nextBatsmanPlayer.name || nextBatsmanId
            );
          }
        }
      }

      const bowlerDeliveries = newBalls.filter(
        (ball) => ball.bowlerId === updatedCurrentBowler.id && (ball.legalDelivery ?? true)
      ).length;
      const bowlerRuns = newBalls.reduce(
        (sum, ball) => (ball.bowlerId === updatedCurrentBowler.id ? sum + ball.runs : sum),
        0
      );
      const bowlerWickets = newBalls.reduce(
        (sum, ball) => (ball.bowlerId === updatedCurrentBowler.id && ball.isWicket ? sum + 1 : sum),
        0
      );

      updatedCurrentBowler.overs =
        Math.floor(bowlerDeliveries / SCORING_CONFIG.BALLS_PER_OVER) +
        (bowlerDeliveries % SCORING_CONFIG.BALLS_PER_OVER) / 10;
      updatedCurrentBowler.runs = bowlerRuns;
      updatedCurrentBowler.wickets = bowlerWickets;

      const nextBatsmanQueueName =
        updatedRemainingBatters.length > 0
          ? currentMatch.team1Players.find((player: any) => player.id === updatedRemainingBatters[0])?.name ||
            updatedRemainingBatters[0]
          : 'All Out';
      const nextBatsmanIdForState = updatedRemainingBatters.length > 0 ? updatedRemainingBatters[0] : '';

      const updatedMatchData: MatchData = {
        ...currentMatch,
        balls: newBalls,
        totalRuns: newTotalRuns,
        wickets: newWickets,
        currentOver: newOver,
        currentBall: newBallInOver,
        currentBatsmen: updatedCurrentBatsmen,
        currentBowler: updatedCurrentBowler,
        remainingBatters: updatedRemainingBatters,
        nextBatsman: requiresNextBatsmanSelection
          ? { id: '', name: 'Select Next Batsman' }
          : {
              id: nextBatsmanIdForState,
              name: updatedRemainingBatters.length > 0 ? nextBatsmanQueueName : 'All Out',
            },
        pendingFreeHit,
      };

      const oversLimitReached =
        legalDelivery && newBallInOver === 0 && newOver >= currentMatch.overs;
      const chaseAchieved =
        currentMatch.currentInnings >= 2 &&
        currentMatch.targetScore !== undefined &&
        newTotalRuns >= currentMatch.targetScore;

      let finalMatchData = updatedMatchData;
      let matchFinished = false;

      if (
        currentMatch.currentInnings === 1 &&
        (isInningsComplete || oversLimitReached)
      ) {
        const { updated: withSummary, summary } = appendInningsSummary(updatedMatchData);
        finalMatchData = {
          ...withSummary,
          awaitingNextInnings: true,
          pendingInningsSummary: summary,
          pendingFreeHit: false,
          targetScore: summary.totalRuns + 1,
        };
        if (!autoSimulate) {
          setInningsBreakSummary(summary);
          setShowInningsBreakOverlay(true);
        }
      } else if (currentMatch.currentInnings >= 2) {
        if (chaseAchieved || isInningsComplete || oversLimitReached) {
          const { updated: withSummary, summary } = appendInningsSummary(updatedMatchData);
          const { finalState, resultText } = finalizeMatchState(withSummary, summary, {
            chaseAchieved,
            oversLimitReached,
            allOut: isInningsComplete,
          });
          finalMatchData = finalState;
          matchFinished = true;
          if (!autoSimulate) {
            setMatchCompletionSummary({ summary, resultText });
            setShowMatchCompleteOverlay(true);
          }
        }
      }

      logVerbose('📊 Updated match data:', finalMatchData);
      matchDataRef.current = finalMatchData;
      setMatchData(finalMatchData);

      if (manualSelectionAllowed) {
        if (requiresNextBatsmanSelection && !isInningsComplete && !matchFinished) {
          openNextBatsmanSelector('required');
        } else if (overCompleted && !isInningsComplete && !matchFinished && !finalMatchData.awaitingNextInnings) {
          openNextBowlerSelector('required');
        }
      }

      if (isInningsComplete && !matchFinished && !finalMatchData.awaitingNextInnings) {
        Alert.alert(
          'Innings Complete!',
          'All 10 wickets down! Innings finished. You can start the next innings or finish the match.',
          [
            { text: 'Continue', style: 'default' },
            {
              text: 'Finish Match',
              onPress: () => {
                logVerbose('User wants to finish match');
              },
            },
          ]
        );
      }

      if (matchId) {
        setTimeout(async () => {
          try {
            await saveMatchData();
            logVerbose('✅ Match data saved after ball');
          } catch (error) {
            console.error('❌ Failed to save match data:', error);
          }
        }, 500);
      }

      setIsScoring(false);
      setSelectedRuns(null);
    } catch (error) {
      console.error('Error adding ball:', error);
      Alert.alert('Error', 'Failed to save ball data');
    }
  };

  const simulateTwentyOverMatch = async () => {
    try {
      const wicketTypes = ['Caught', 'Bowled', 'LBW', 'Run Out', 'Stumped'];
      const shotTypes = ['Cover Drive', 'Pull Shot', 'Cut Shot', 'Lofted Drive', 'Straight Drive', 'Flick'];
      const shotRegions = ['Cover', 'Mid-Wicket', 'Straight', 'Point', 'Long-on', 'Long-off', 'Deep Square'];

      const outcomes = [
        { type: 'runs', value: 0, weight: 0.22 },
        { type: 'runs', value: 1, weight: 0.34 },
        { type: 'runs', value: 2, weight: 0.15 },
        { type: 'runs', value: 3, weight: 0.05 },
        { type: 'runs', value: 4, weight: 0.16 },
        { type: 'runs', value: 6, weight: 0.06 },
        { type: 'wicket', weight: 0.02 },
      ];
      const totalWeight = outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);

      const pickOutcome = () => {
        const random = Math.random() * totalWeight;
        let cumulative = 0;
        for (const outcome of outcomes) {
          cumulative += outcome.weight;
          if (random <= cumulative) {
            return outcome;
          }
        }
        return outcomes[0];
      };

      const oversToPlay = matchDataRef.current.overs || totalOvers || SCORING_CONFIG.DEFAULT_OVERS;

      const team2Players = matchDataRef.current.team2Players || [];
      const normalizedBowlingOrder =
        matchDataRef.current.bowlingOrder?.filter((playerId: string | undefined) => Boolean(playerId)) || [];

      const preferredBowlerIds = team2Players
        .filter((player: any) => {
          const role = String(player.role || '').toLowerCase();
          return role.includes('bowler') || role.includes('all-rounder') || role.includes('allrounder');
        })
        .map((player: any) => player.id)
        .filter(Boolean);

      const remainingBowlerIds = team2Players
        .map((player: any) => player.id)
        .filter((playerId: string) => playerId && !preferredBowlerIds.includes(playerId));

      let bowlingLineupSource: string[] = [];
      if (normalizedBowlingOrder.length) {
        bowlingLineupSource = normalizedBowlingOrder.slice();
      } else {
        bowlingLineupSource = [...preferredBowlerIds, ...remainingBowlerIds];
      }

      if (bowlingLineupSource.length === 0) {
        if (matchDataRef.current.currentBowler?.id) {
          bowlingLineupSource = [matchDataRef.current.currentBowler.id];
        } else if (team2Players[0]?.id) {
          bowlingLineupSource = [team2Players[0].id];
        } else {
          bowlingLineupSource = ['bowler-1'];
        }
      }

      const uniqueBowlingLineup: string[] = [];
      bowlingLineupSource.forEach((bowlerId) => {
        if (bowlerId && !uniqueBowlingLineup.includes(bowlerId)) {
          uniqueBowlingLineup.push(bowlerId);
        }
      });

      const requiredBowlerCount = Math.min(
        Math.ceil(oversToPlay / MAX_T20_OVERS_PER_BOWLER),
        team2Players.length || oversToPlay
      );

      if (uniqueBowlingLineup.length < requiredBowlerCount) {
        const additionalCandidates = team2Players
          .map((player: any) => player.id)
          .filter((playerId: string) => playerId && !uniqueBowlingLineup.includes(playerId));
        for (const candidate of additionalCandidates) {
          uniqueBowlingLineup.push(candidate);
          if (uniqueBowlingLineup.length >= requiredBowlerCount) {
            break;
          }
        }
      }

      if (uniqueBowlingLineup.length < requiredBowlerCount) {
        const syntheticIds = Array.from({ length: requiredBowlerCount - uniqueBowlingLineup.length }, (_, index) => {
          const base = matchDataRef.current.team2 || 'bowler';
          return `${base}-part-timer-${index + 1}`;
        });
        uniqueBowlingLineup.push(...syntheticIds);
      }

      const bowlerOvers = new Map<string, number>();
      let bowlerIndex = 0;

      const pickBowlerForOver = () => {
        for (let i = 0; i < uniqueBowlingLineup.length; i++) {
          const idx = (bowlerIndex + i) % uniqueBowlingLineup.length;
          const candidate = uniqueBowlingLineup[idx];
          const oversBowled = bowlerOvers.get(candidate) || 0;
          if (oversBowled < MAX_T20_OVERS_PER_BOWLER) {
            bowlerIndex = (idx + 1) % uniqueBowlingLineup.length;
            return candidate;
          }
        }

        // Fallback: pick the bowler with the fewest overs bowled so far
        let fallbackCandidate = uniqueBowlingLineup[0];
        let minOvers = bowlerOvers.get(fallbackCandidate) || 0;
        uniqueBowlingLineup.forEach((candidate) => {
          const oversBowled = bowlerOvers.get(candidate) || 0;
          if (oversBowled < minOvers) {
            minOvers = oversBowled;
            fallbackCandidate = candidate;
          }
        });
        return fallbackCandidate;
      };

      onSimulationProgress?.(`Simulating ${oversToPlay}-over innings...`);

      outer: for (let overIndex = 0; overIndex < oversToPlay; overIndex++) {
        const bowlerId = pickBowlerForOver();
        const bowlerPlayer =
          matchDataRef.current.team2Players.find((player: any) => player.id === bowlerId) || {
            id: bowlerId,
            name: bowlerId,
          };
        bowlerOvers.set(bowlerId, bowlerOvers.get(bowlerId) || 0);

        setMatchData(prev => {
          const updated = {
            ...prev,
            currentBowler: {
              id: bowlerPlayer.id,
              name: bowlerPlayer.name,
              overs: bowlerOvers.get(bowlerId) || 0,
              wickets: prev.currentBowler.id === bowlerPlayer.id ? prev.currentBowler.wickets : 0,
              runs: prev.currentBowler.id === bowlerPlayer.id ? prev.currentBowler.runs : 0,
            },
          };
          matchDataRef.current = updated;
          return updated;
        });

        for (let ballIndex = 0; ballIndex < SCORING_CONFIG.BALLS_PER_OVER; ballIndex++) {
          const outcome = pickOutcome();
          let runs = 0;
          let isWicket = false;
          let wicketType: string | undefined;

          if (outcome.type === 'runs') {
            runs = typeof outcome.value === 'number' ? outcome.value : 0;
          } else {
            isWicket = true;
            wicketType = wicketTypes[Math.floor(Math.random() * wicketTypes.length)];
          }

          let shotDetails: ShotDetails | undefined;
          if (runs >= 4) {
            const strikerName = matchDataRef.current.currentBatsmen.striker.name;
            shotDetails = {
              shotType: shotTypes[Math.floor(Math.random() * shotTypes.length)],
              shotRegion: shotRegions[Math.floor(Math.random() * shotRegions.length)],
              shotQuality: runs === 6 ? 'Powerfully struck' : 'Well timed',
              commentary:
                runs === 4
                  ? `${strikerName} finds the rope with a classy four!`
                  : `${strikerName} launches it for a massive six!`,
            };
          }

          await addBallWithDetails(runs, isWicket, wicketType, false, undefined, shotDetails, undefined);
          await waitFor(140);

          if (matchDataRef.current.wickets >= 10) {
            break outer;
          }
        }

        onSimulationProgress?.(
          `Over ${overIndex + 1}/${oversToPlay} complete • ${matchDataRef.current.totalRuns}/${matchDataRef.current.wickets}`
        );
        await waitFor(160);

        const completedOvers = (bowlerOvers.get(bowlerId) || 0) + 1;
        bowlerOvers.set(bowlerId, Math.min(completedOvers, MAX_T20_OVERS_PER_BOWLER));
      }

      await waitFor(400);
      try {
        await saveMatchData();
      } catch (error) {
        console.error('❌ Failed to save match after simulation:', error);
      }

      if (matchId) {
        try {
          await liveScoringService.updateMatch(
            matchId,
            sanitizeForFirestore({
              status: 'completed',
              isLive: false,
            })
          );
        } catch (error) {
          console.error('❌ Failed to update match status after simulation:', error);
        }
      }

      const summary = buildMatchSummaryFromData(matchDataRef.current);
      onSimulationProgress?.(
        `Match completed • ${summary.teamAScore} (${summary.overs} Ov)`
      );
      onSimulationComplete?.(summary);
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      onSimulationProgress?.('Simulation failed. Please try again.');
      onSimulationComplete?.();
    }
  };

  // Shot details modal handlers
  const handleShotDetailsConfirm = async (shotDetails: ShotDetails) => {
    if (pendingBallData) {
      await addBallWithDetails(
        pendingBallData.runs!,
        pendingBallData.isWicket!,
        pendingBallData.wicketType,
        pendingBallData.isExtra!,
        pendingBallData.extraType,
        shotDetails,
        undefined
      );
    }
    setShowShotDetails(false);
    setPendingBallData(null);
  };

  const handleShotDetailsCancel = () => {
    setShowShotDetails(false);
    setPendingBallData(null);
  };

  const handleSelectNextBatsman = (playerId: string) => {
    const mode = nextBatsmanSelectionMode || 'optional';
    if (openingSelectionStep === 'striker' || openingSelectionStep === 'nonStriker') {
      setMatchData((prev) => {
        const selectedPlayer = prev.team1Players.find((player: any) => player.id === playerId);
        if (!selectedPlayer) {
          return prev;
        }
        const normalized = normalizePlayer(selectedPlayer, selectedPlayer.id, selectedPlayer.name);
        const remaining = prev.remainingBatters.filter((id) => id !== playerId);
        const baseBattingOrder =
          (prev.battingOrder && prev.battingOrder.length
            ? [...prev.battingOrder]
            : (prev.team1Players || []).map((player: any) => player.id)) || [];
        if (!baseBattingOrder.includes(playerId)) {
          baseBattingOrder.push(playerId);
        }
        const nextQueueId = remaining.length > 0 ? remaining[0] : '';
        const nextQueuePlayer = prev.team1Players.find((player: any) => player.id === nextQueueId);
        const nextQueueName = nextQueueId ? nextQueuePlayer?.name || nextQueueId : 'All Out';
        const updated: MatchData = {
          ...prev,
          currentBatsmen: {
            striker:
              openingSelectionStep === 'striker'
                ? {
                    ...normalized,
                    runs: normalized.runs,
                    balls: normalized.balls,
                    fours: normalized.fours,
                    sixes: normalized.sixes,
                    isOut: false,
                  }
                : { ...prev.currentBatsmen.striker },
            nonStriker:
              openingSelectionStep === 'nonStriker'
                ? {
                    ...normalized,
                    runs: normalized.runs,
                    balls: normalized.balls,
                    fours: normalized.fours,
                    sixes: normalized.sixes,
                    isOut: false,
                  }
                : { ...prev.currentBatsmen.nonStriker },
          },
          remainingBatters: remaining,
          nextBatsman: {
            id: nextQueueId,
            name: nextQueueName,
          },
          battingOrder: baseBattingOrder,
        };
        matchDataRef.current = updated;
        return updated;
      });

      if (openingSelectionStep === 'striker') {
        const options = getRemainingBatsmenOptions(matchDataRef.current);
        if (options.length > 0) {
          setOpeningSelectionStep('nonStriker');
          setNextBatsmanSelectionMode('required');
          setNextBatsmanOptions(options);
          setShowNextBatsmanSelector(true);
        } else {
          setOpeningSelectionStep('bowler');
          setNextBatsmanSelectionMode(null);
          setNextBatsmanOptions([]);
          setShowNextBatsmanSelector(false);
          setTimeout(() => openNextBowlerSelector('required'), 0);
        }
      } else {
        setOpeningSelectionStep('bowler');
        setNextBatsmanSelectionMode(null);
        setNextBatsmanOptions([]);
        setShowNextBatsmanSelector(false);
        setTimeout(() => openNextBowlerSelector('required'), 0);
      }
      return;
    }

    setMatchData((prev) => {
      const selectedPlayer = prev.team1Players.find((player: any) => player.id === playerId);
      if (!selectedPlayer) {
        return prev;
      }

      if (mode === 'required') {
        const remaining = prev.remainingBatters.filter((id) => id !== playerId);
        const normalized = normalizePlayer(selectedPlayer, selectedPlayer.id, selectedPlayer.name);
        const nextQueueName =
          remaining.length > 0
            ? prev.team1Players.find((player: any) => player.id === remaining[0])?.name || remaining[0]
            : 'All Out';
        const baseBattingOrder =
          (prev.battingOrder && prev.battingOrder.length
            ? [...prev.battingOrder]
            : (prev.team1Players || []).map((player: any) => player.id)) || [];
        if (!baseBattingOrder.includes(playerId)) {
          baseBattingOrder.push(playerId);
        }
        const updated: MatchData = {
          ...prev,
          currentBatsmen: {
            striker: {
              ...normalized,
              runs: normalized.runs,
              balls: normalized.balls,
              fours: normalized.fours,
              sixes: normalized.sixes,
              isOut: false,
            },
            nonStriker: { ...prev.currentBatsmen.nonStriker },
          },
          remainingBatters: remaining,
          nextBatsman: {
            id: remaining.length > 0 ? remaining[0] : '',
            name: remaining.length > 0 ? nextQueueName : 'All Out',
          },
        battingOrder: baseBattingOrder,
        };
        matchDataRef.current = updated;
        return updated;
      }

      // Optional mode: reorder upcoming queue without changing current batsmen
      const remainingWithoutSelected = prev.remainingBatters.filter((id) => id !== playerId);
      const reorderedRemaining = [playerId, ...remainingWithoutSelected];
      const nextPlayerName =
        prev.team1Players.find((player: any) => player.id === playerId)?.name || playerId;
      const updated: MatchData = {
        ...prev,
        remainingBatters: reorderedRemaining,
        nextBatsman: {
          id: playerId,
          name: nextPlayerName,
        },
      };
      matchDataRef.current = updated;
      return updated;
    });
    setNextBatsmanSelectionMode(null);
    setShowNextBatsmanSelector(false);
    setNextBatsmanOptions([]);
  };

  const handleSelectNextBowler = (playerId: string) => {
    const mode = nextBowlerSelectionMode || 'optional';
    setMatchData((prev) => {
      const selectedPlayer = prev.team2Players.find((player: any) => player.id === playerId);
      if (!selectedPlayer) {
        return prev;
      }
      const figures = getBowlerFigures(playerId, prev.balls);
      const updated: MatchData = {
        ...prev,
        currentBowler: {
          id: selectedPlayer.id,
          name: selectedPlayer.name,
          overs: figures.overs,
          wickets: figures.wickets,
          runs: figures.runs,
        },
        bowlingOrder: prev.bowlingOrder?.includes(playerId)
          ? prev.bowlingOrder
          : [...(prev.bowlingOrder || []), playerId],
      };
      matchDataRef.current = updated;
      return updated;
    });
    setNextBowlerSelectionMode(null);
    setShowNextBowlerSelector(false);
    setNextBowlerOptions([]);
    if (openingSelectionStep === 'bowler') {
      setOpeningSelectionStep('none');
    }
  };

  // Calculate player statistics from ball data
  const calculatePlayerStats = () => {
    const battingStats: { [key: string]: any } = {};
    const bowlingStats: { [key: string]: any } = {};

    // Initialize all players - add current batsmen and bowler if teams are empty
    const allPlayers = [
      ...matchData.team1Players,
      ...matchData.team2Players,
    ];

    // If no players in teams, add current players
    if (allPlayers.length === 0) {
      allPlayers.push(
        matchData.currentBatsmen.striker,
        matchData.currentBatsmen.nonStriker,
        matchData.currentBowler,
        matchData.nextBatsman
      );
    }

    allPlayers.forEach(player => {
      battingStats[player.id] = {
        id: player.id,
        name: player.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        isOnStrike: false,
        minutes: 0,
      };
      bowlingStats[player.id] = {
        id: player.id,
        name: player.name,
        overs: 0,
        balls: 0,
        wickets: 0,
        runs: 0,
        economy: 0,
        maidens: 0,
      };
    });

    // Process each ball
    matchData.balls.forEach(ball => {
      // Batting stats
      if (ball.batsmanId && battingStats[ball.batsmanId]) {
        battingStats[ball.batsmanId].balls += 1;
        battingStats[ball.batsmanId].runs += ball.runs;
        
        if (ball.runs === 4) battingStats[ball.batsmanId].fours += 1;
        if (ball.runs === 6) battingStats[ball.batsmanId].sixes += 1;
        
        if (ball.isWicket) {
          battingStats[ball.batsmanId].isOut = true;
        }
      }

      // Bowling stats
      if (ball.bowlerId && bowlingStats[ball.bowlerId]) {
        bowlingStats[ball.bowlerId].balls += 1;
        bowlingStats[ball.bowlerId].runs += ball.runs;
        
        if (ball.isWicket) {
          bowlingStats[ball.bowlerId].wickets += 1;
        }
      }
    });

    // Calculate strike rates and economy
    Object.values(battingStats).forEach((player: any) => {
      if (player.balls > 0) {
        player.strikeRate = (player.runs / player.balls) * 100;
      }
    });

    Object.values(bowlingStats).forEach((player: any) => {
      if (player.balls > 0) {
        player.overs = Math.floor(player.balls / 6) + (player.balls % 6) / 10;
        player.economy = (player.runs / player.balls) * 6;
      }
    });

    // Mark current striker
    if (matchData.currentBatsmen.striker.id && battingStats[matchData.currentBatsmen.striker.id]) {
      battingStats[matchData.currentBatsmen.striker.id].isOnStrike = true;
    }

    return { battingStats, bowlingStats };
  };

  const handleRunsPress = (runs: number) => {
    if (isSelectionPending) {
      Alert.alert('Select Player', 'Please choose the next batsman or bowler before scoring.');
      return;
    }
    setSelectedRuns(runs);
    addBall(runs);
  };

  const handleWicketPress = () => {
    if (isSelectionPending) {
      Alert.alert('Select Player', 'Please choose the next batsman or bowler before scoring.');
      return;
    }
    setSelectedWicketType(null);
    setSelectedDismissalFielderId(null);
    setPendingDismissalError(null);
    setShowWicketModal(true);
  };

  const handleCancelWicket = () => {
    setShowWicketModal(false);
    setSelectedWicketType(null);
    setSelectedDismissalFielderId(null);
    setPendingDismissalError(null);
  };

  const handleConfirmWicket = () => {
    if (!selectedWicketType) {
      setPendingDismissalError('Please choose a dismissal type.');
      return;
    }
    const config = WICKET_TYPES.find((type) => type.id === selectedWicketType);
    if (config?.requiresFielder && !selectedDismissalFielderId) {
      setPendingDismissalError('Select the fielder involved in the dismissal.');
      return;
    }

    const fielder =
      matchData.team2Players.find((player: any) => player.id === selectedDismissalFielderId) || null;

    addBallWithDetails(
      0,
      true,
      selectedWicketType,
      false,
      undefined,
      undefined,
      {
        fielderId: fielder?.id,
        fielderName: fielder?.name,
      }
    );

    setShowWicketModal(false);
    setSelectedWicketType(null);
    setSelectedDismissalFielderId(null);
    setPendingDismissalError(null);
  };

  const handleStartNextInnings = async () => {
    if (!matchData.awaitingNextInnings || !matchData.pendingInningsSummary) {
      Alert.alert('Start Next Innings', 'First-innings summary is not available yet.');
      return;
    }

    const prepared = prepareSecondInnings(matchData, matchData.pendingInningsSummary);
    const nextState: MatchData = {
      ...prepared,
      awaitingNextInnings: false,
      pendingInningsSummary: null,
    };

    logVerbose('🎯 Starting second innings manually');
    matchDataRef.current = nextState;
    setMatchData(nextState);
    setShowInningsBreakOverlay(false);
    setInningsBreakSummary(null);
    setActiveTab('live');
    if (!autoSimulate) {
      beginOpeningSelection(nextState);
    }

    if (matchId) {
      try {
        await saveMatchData();
      } catch (error) {
        console.error('❌ Failed to save match data:', error);
      }
    }
  };

  const handleCloseMatch = async () => {
    if (isClosingMatch) {
      return;
    }

    if (!matchData.isMatchCompleted) {
      setShowMatchCompleteOverlay(false);
      return;
    }

    setIsClosingMatch(true);
    try {
      if (matchId) {
        // Explicitly ensure match is marked as completed before saving
        const finalMatchData = {
          ...matchData,
          isMatchCompleted: true,
        };
        
        // Update local state to ensure saveMatchData uses the correct status
        matchDataRef.current = finalMatchData;
        setMatchData(finalMatchData);
        
        // Save match data with completed status
        await saveMatchData();
        
        // Explicitly update match status in Firebase to ensure it's marked as completed
        // Note: updateMatch already adds updatedAt with serverTimestamp, so we don't need to add it here
        await liveScoringService.updateMatch(matchId, sanitizeForFirestore({
          status: 'completed',
          isLive: false,
          isMatchCompleted: true,
        }));
        
        console.log('✅ Match marked as completed and saved:', matchId);
      }
      
      setShowMatchCompleteOverlay(false);
      setMatchCompletionSummary(null);
      onSimulationComplete?.(buildMatchSummaryFromData(matchDataRef.current));
      
      // Small delay to ensure Firebase update completes before navigating
      setTimeout(() => {
      onBack();
      }, 500);
    } catch (error) {
      console.error('❌ Failed to close match:', error);
      Alert.alert('Close Match Failed', 'Unable to finalize the match. Please try again.');
      setIsClosingMatch(false);
    }
  };

  const handleViewScorecardFromBreak = () => {
    setActiveTab('scorecard');
    setShowInningsBreakOverlay(false);
    setInningsBreakSummary(null);
  };

  const handleViewScorecardFromCompletion = () => {
    setActiveTab('scorecard');
    setShowMatchCompleteOverlay(false);
    setMatchCompletionSummary(null);
  };

  const resetExtraSelection = () => {
    setSelectedExtraType(null);
  setExtraRunsValue(1);
    setNoBallRunSource('bat');
    setShowExtraDetails(false);
  };

  const openExtraDetailsForType = (extraType: string) => {
    setSelectedExtraType(extraType);
  setExtraRunsValue(extraType === 'No Ball' ? 0 : 1);
    setNoBallRunSource('bat');
    setShowExtraDetails(true);
  };

  const handleExtraRunsSelect = (runs: number) => {
    const normalizedRuns = Math.max(0, runs);
  if (selectedExtraType === 'No Ball') {
    setExtraRunsValue(Math.min(6, normalizedRuns));
  } else {
    setExtraRunsValue(Math.max(1, normalizedRuns));
  }
  };

  const handleNoBallSourceSelect = (source: 'bat' | 'bye' | 'leg-bye') => {
    setNoBallRunSource(source);
  };

  const handleCancelExtraDetails = () => {
    resetExtraSelection();
    setShowExtras(true);
  };

  const handleConfirmExtraDetails = () => {
    if (!selectedExtraType) {
      resetExtraSelection();
      return;
    }

    let totalRuns = 0;
    let batsmanRuns = 0;
    let extraSubType: string | undefined;
    let legalDelivery = selectedExtraType === 'Bye' || selectedExtraType === 'Leg Bye';
    const awardFreeHit = selectedExtraType === 'No Ball';
    let commentary = '';

    if (selectedExtraType === 'No Ball') {
      const additionalRuns = Math.max(0, extraRunsValue);
      totalRuns = additionalRuns + 1;
      legalDelivery = false;
      if (noBallRunSource === 'bat') {
        batsmanRuns = additionalRuns;
      } else if (noBallRunSource === 'leg-bye') {
        batsmanRuns = 0;
        extraSubType = 'Leg Bye';
      } else if (noBallRunSource === 'bye') {
        batsmanRuns = 0;
        extraSubType = 'Bye';
      }

      if (additionalRuns > 0) {
        if (noBallRunSource === 'bat') {
          commentary = `No ball! ${pluralize(additionalRuns, 'run')} off the bat. Free hit coming up.`;
        } else if (noBallRunSource === 'leg-bye') {
          commentary = `No ball! ${pluralize(additionalRuns, 'leg bye')}. Free hit coming up.`;
        } else {
          commentary = `No ball! ${pluralize(additionalRuns, 'bye')}. Free hit coming up.`;
        }
      } else {
        commentary = 'No ball! Free hit coming up.';
      }
    } else if (selectedExtraType === 'Wide') {
      totalRuns = Math.max(1, extraRunsValue);
      batsmanRuns = 0;
      commentary = `Wide! ${pluralize(totalRuns, 'run')} added as wides.`;
    } else if (selectedExtraType === 'Bye') {
      totalRuns = Math.max(1, extraRunsValue);
      batsmanRuns = 0;
      commentary = `${pluralize(totalRuns, 'bye')} taken.`;
    } else if (selectedExtraType === 'Leg Bye') {
      totalRuns = Math.max(1, extraRunsValue);
      batsmanRuns = 0;
      extraSubType = 'Leg Bye';
      commentary = `${pluralize(totalRuns, 'leg bye')} taken.`;
    } else {
      totalRuns = Math.max(1, extraRunsValue);
    }

    const extraRuns = Math.max(0, totalRuns - batsmanRuns);

    const meta = {
      batsmanRuns,
      extraRuns,
      extraSubType,
      legalDelivery,
      commentaryOverride: commentary,
      awardFreeHit,
    };

    addBallWithDetails(
      totalRuns,
      false,
      undefined,
      true,
      selectedExtraType,
      undefined,
      undefined,
      meta
    );

    resetExtraSelection();
  };

  const appendInningsSummary = (data: MatchData): { updated: MatchData; summary: InningsSummary } => {
    const summary: InningsSummary = {
      inningsNumber: data.currentInnings,
      battingTeam: data.battingTeamName || data.team1,
      bowlingTeam: data.bowlingTeamName || data.team2,
      totalRuns: data.totalRuns,
      wickets: data.wickets,
      overs: data.currentOver,
      balls: data.currentBall,
    };

    const existing = (data.inningsHistory || []).filter(
      (item) => item.inningsNumber !== summary.inningsNumber
    );

    return {
      updated: {
        ...data,
        inningsHistory: [...existing, summary],
      },
      summary,
    };
  };

  const clonePlayers = (players: any[] | undefined): any[] =>
    (players || []).map((player) => ({ ...player }));

  const prepareSecondInnings = (data: MatchData, summary: InningsSummary): MatchData => {
    const battingPlayersSourceRaw =
      (data.team2PlayersOriginal && data.team2PlayersOriginal.length
        ? data.team2PlayersOriginal
        : data.team2Players) || [];
    const bowlingPlayersSourceRaw =
      (data.team1PlayersOriginal && data.team1PlayersOriginal.length
        ? data.team1PlayersOriginal
        : data.team1Players) || [];

    const nextBattingPlayers = clonePlayers(battingPlayersSourceRaw);
    const nextBowlingPlayers = clonePlayers(bowlingPlayersSourceRaw);

    const fallbackStriker = { id: 'second-innings-striker', name: 'Batter 1' };
    const fallbackNonStriker = { id: 'second-innings-non-striker', name: 'Batter 2' };

    const placeholderStriker = normalizePlayer(
      { id: 'pending-striker', name: 'Select Opening Striker' },
      'pending-striker',
      'Select Opening Striker'
    );
    (placeholderStriker as any).isPlaceholder = true;
    const placeholderNonStriker = normalizePlayer(
      { id: 'pending-non-striker', name: 'Select Non-Striker' },
      'pending-non-striker',
      'Select Non-Striker'
    );
    (placeholderNonStriker as any).isPlaceholder = true;

    const remainingIds = (nextBattingPlayers || [])
      .map((player: any) => player?.id)
      .filter(Boolean) as string[];

    const nextBatsmanId = remainingIds[0] || '';
    const nextBatsmanName =
      remainingIds[0]
        ? nextBattingPlayers.find((player: any) => player?.id === remainingIds[0])?.name ||
          remainingIds[0]
        : 'All Out';

    const startingBowler = {
      id: 'pending-bowler',
      name: 'Select Opening Bowler',
      overs: 0,
      wickets: 0,
      runs: 0,
    };

    return {
      ...data,
      currentInnings: data.currentInnings + 1,
      balls: [],
      totalRuns: 0,
      wickets: 0,
      currentOver: 0,
      currentBall: 0,
      currentBatsmen: {
        striker: placeholderStriker,
        nonStriker: placeholderNonStriker,
      },
      currentBowler: startingBowler,
      nextBatsman: remainingIds.length
        ? { id: nextBatsmanId, name: nextBatsmanName }
        : { id: '', name: 'All Out' },
      team1Players: nextBattingPlayers,
      team2Players: nextBowlingPlayers,
      battingOrder: nextBattingPlayers
        .map((player: any) => player?.id)
        .filter(Boolean),
      bowlingOrder: nextBowlingPlayers
        .map((player: any) => player?.id)
        .filter(Boolean),
      remainingBatters: remainingIds,
      pendingFreeHit: false,
      battingTeamName: data.bowlingTeamName,
      bowlingTeamName: data.battingTeamName,
      targetScore: summary.totalRuns + 1,
      matchResult: undefined,
      isMatchCompleted: false,
      awaitingNextInnings: false,
      pendingInningsSummary: null,
    };
  };

  const finalizeMatchState = (
    data: MatchData,
    summary: InningsSummary,
    options: { chaseAchieved: boolean; oversLimitReached: boolean; allOut: boolean }
  ): { finalState: MatchData; resultText: string } => {
    const history = data.inningsHistory || [];

    const firstInnings = history.find((innings) => innings.inningsNumber === 1) || history[0];
    const chasingTeam = summary.battingTeam;
    const defendingTeam = summary.bowlingTeam;
    let resultText = '';

    if (options.chaseAchieved) {
      const wicketsRemaining = Math.max(0, SCORING_CONFIG.MAX_WICKETS - summary.wickets);
      resultText = `${chasingTeam} won by ${wicketsRemaining || 1} wicket${(wicketsRemaining || 1) === 1 ? '' : 's'}`;
    } else {
      const firstInningsRuns =
        firstInnings?.totalRuns ??
        (data.targetScore ? data.targetScore - 1 : summary.totalRuns);
      const runsMargin = Math.max(0, firstInningsRuns - summary.totalRuns);
      if (runsMargin === 0) {
        resultText = `Match tied between ${defendingTeam} and ${chasingTeam}`;
      } else {
        resultText = `${defendingTeam} won by ${runsMargin} run${runsMargin === 1 ? '' : 's'}`;
      }
    }

    const finalState: MatchData = {
      ...data,
      isMatchCompleted: true,
      matchResult: resultText,
      pendingFreeHit: false,
      awaitingNextInnings: false,
      pendingInningsSummary: null,
    };

    return { finalState, resultText };
  };

  const handleExtrasPress = () => {
    if (isSelectionPending) {
      Alert.alert('Select Player', 'Please choose the next batsman or bowler before recording extras.');
      return;
    }
    setShowExtras(true);
  };

  const handleExtraPress = (extraType: string) => {
    setShowExtras(false);
    openExtraDetailsForType(extraType);
  };

  const computePendingFreeHit = useCallback((balls: BallData[]): boolean => {
    let pending = false;
    for (const ball of balls) {
      if (pending && (ball.legalDelivery ?? true)) {
        pending = false;
      }
      if (ball.awardedFreeHit) {
        pending = true;
      }
    }
    return pending;
  }, []);

  const undoLastBall = () => {
    if (matchData.balls.length > 0) {
      const lastBall = matchData.balls[matchData.balls.length - 1];
      const newBalls = matchData.balls.slice(0, -1);
      const newTotalRuns = matchData.totalRuns - lastBall.runs;
      const newWickets = lastBall.isWicket ? matchData.wickets - 1 : matchData.wickets;
      
      setMatchData({
        ...matchData,
        balls: newBalls,
        totalRuns: newTotalRuns,
        wickets: newWickets,
        pendingFreeHit: computePendingFreeHit(newBalls),
      });
    }
  };

  const getCurrentScore = () => {
    return `${matchData.totalRuns}/${matchData.wickets}`;
  };

  const getCurrentOver = () => {
    return `${matchData.currentOver}.${matchData.currentBall}`;
  };

  const getRunRate = () => {
    const legalBalls = matchData.balls.filter((ball) => ball.legalDelivery ?? true).length;
    if (legalBalls === 0) return '0.00';
    return ((matchData.totalRuns / legalBalls) * 6).toFixed(2);
  };

  const getBallsRemaining = () => {
    const totalBalls = matchData.overs * SCORING_CONFIG.BALLS_PER_OVER;
    const ballsBowled = matchData.currentOver * SCORING_CONFIG.BALLS_PER_OVER + matchData.currentBall;
    return Math.max(totalBalls - ballsBowled, 0);
  };

  const canStartNextInnings = isAdmin && hasEditAccess;
  const isOpeningStrikerSelection = openingSelectionStep === 'striker';
  const isOpeningNonStrikerSelection = openingSelectionStep === 'nonStriker';
  const isOpeningBowlerSelection = openingSelectionStep === 'bowler';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading match data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏏 Live Scoring</Text>
        {/* Removed sync button - auto-saves after each ball */}
      </View>

      {/* Professional Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
            LIVE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scorecard' && styles.activeTab]}
          onPress={() => setActiveTab('scorecard')}
        >
          <Text style={[styles.tabText, activeTab === 'scorecard' && styles.activeTabText]}>
            SCORECARD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'commentary' && styles.activeTab]}
          onPress={() => setActiveTab('commentary')}
        >
          <Text style={[styles.tabText, activeTab === 'commentary' && styles.activeTabText]}>
            COMMENTARY
          </Text>
        </TouchableOpacity>
      </View>

      {/* Removed Offline Status Bar - causing issues */}

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'live' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Match Info */}
          <View style={styles.matchInfo}>
            <Text style={styles.matchTitle}>{matchData.team1} vs {matchData.team2}</Text>
          <Text style={styles.matchDetails}>
            {matchData.overs} Overs • Innings {matchData.currentInnings}
          </Text>
        </View>

        {/* Live Score Display */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Live Score</Text>
            <Text style={styles.overText}>Over: {getCurrentOver()}</Text>
          </View>
          
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreText}>{getCurrentScore()}</Text>
            <Text style={styles.runRateText}>RR: {getRunRate()}</Text>
          </View>
          {matchData.pendingFreeHit && (
            <Text style={styles.freeHitBanner}>Next delivery is a free hit</Text>
          )}
          {matchData.currentInnings >= 2 && matchData.targetScore && !matchData.isMatchCompleted && (
            <Text style={styles.targetText}>
              Target {matchData.targetScore} • Needs {Math.max(matchData.targetScore - matchData.totalRuns, 0)} off {getBallsRemaining()} balls
            </Text>
          )}
          {matchData.matchResult && matchData.isMatchCompleted && (
            <View style={styles.matchResultBanner}>
              <Text style={styles.resultText}>{matchData.matchResult}</Text>
              <TouchableOpacity
                style={[styles.closeMatchButton, isClosingMatch && styles.closeMatchButtonDisabled]}
                onPress={handleCloseMatch}
                disabled={isClosingMatch}
              >
                <Text style={styles.closeMatchButtonText}>
                  {isClosingMatch ? 'Saving...' : 'Save & Close Match'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {matchData.awaitingNextInnings && (
          <View style={styles.inningsBanner}>
            <Text style={styles.inningsBannerText}>
              {matchData.pendingInningsSummary
                ? `${matchData.pendingInningsSummary.battingTeam} posted ${matchData.pendingInningsSummary.totalRuns}/${matchData.pendingInningsSummary.wickets} in ${matchData.pendingInningsSummary.overs}.${matchData.pendingInningsSummary.balls} overs.`
                : 'First innings complete.'}
            </Text>
            {canStartNextInnings ? (
              <TouchableOpacity style={styles.startInningsButton} onPress={handleStartNextInnings}>
                <Text style={styles.startInningsButtonText}>Start Second Innings</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.inningsBannerSubtext}>
                Waiting for an admin to start the second innings.
              </Text>
            )}
          </View>
        )}

        {/* Current Batsmen Display */}
        <View style={styles.batsmenCard}>
          <Text style={styles.batsmenTitle}>Current Batsmen</Text>
          <View style={styles.batsmenInfo}>
            <View style={styles.batsman}>
              <Text style={styles.batsmanName}>
                {matchData.currentBatsmen.striker.name} {matchData.currentBatsmen.striker.isOut ? '(OUT)' : '*'}
              </Text>
              <Text style={styles.batsmanScore}>
                {matchData.currentBatsmen.striker.runs}* ({matchData.currentBatsmen.striker.balls})
              </Text>
            </View>
            <View style={styles.batsman}>
              <Text style={styles.batsmanName}>
                {matchData.currentBatsmen.nonStriker.name} {matchData.currentBatsmen.nonStriker.isOut ? '(OUT)' : ''}
              </Text>
              <Text style={styles.batsmanScore}>
                {matchData.currentBatsmen.nonStriker.runs} ({matchData.currentBatsmen.nonStriker.balls})
              </Text>
            </View>
          </View>
        </View>

        {/* Bowler Information */}
        <View style={styles.bowlerCard}>
          <View style={styles.bowlerHeader}>
            <Text style={styles.bowlerTitle}>Bowler</Text>
            {isAdmin && hasEditAccess && !autoSimulate && (
              <TouchableOpacity
                style={styles.changeLink}
                onPress={() => openNextBowlerSelector('optional')}
              >
                <Text style={styles.changeLinkText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.bowlerInfo}>
            <Text style={styles.bowlerName}>{matchData.currentBowler.name}</Text>
            <Text style={styles.bowlerStats}>
              {matchData.currentBowler.overs} overs, {matchData.currentBowler.wickets} wickets, {matchData.currentBowler.runs} runs
            </Text>
          </View>
        </View>

        {/* Next Batsman */}
          <TouchableOpacity
            activeOpacity={isAdmin && hasEditAccess && !autoSimulate ? 0.7 : 1}
            disabled={!(isAdmin && hasEditAccess && !autoSimulate)}
            style={styles.nextBatsmanCard}
            onPress={() => openNextBatsmanSelector('optional')}
          >
          <View style={styles.nextBatsmanHeader}>
            <Text style={styles.nextBatsmanTitle}>Next Batsman</Text>
            {isAdmin && hasEditAccess && !autoSimulate && (
              <Text style={styles.changeLinkText}>Change</Text>
            )}
          </View>
          <Text style={styles.nextBatsmanName}>{matchData.nextBatsman.name}</Text>
        </TouchableOpacity>

        {/* Scoring Buttons - Admin with Edit Access Only */}
        {isAdmin && hasEditAccess ? (
          <>
            <View style={styles.scoringSection}>
              <Text style={styles.sectionTitle}>Score Runs</Text>
              <View style={styles.runsGrid}>
                {SCORING_CONFIG.SCORING_OPTIONS.RUNS.map((runs: number) => (
                  <TouchableOpacity
                    key={runs}
                    style={[
                      styles.runButton,
                      selectedRuns === runs && styles.selectedRunButton,
                      isSelectionPending && styles.disabledRunButton,
                    ]}
                    disabled={isSelectionPending}
                    onPress={() => {
                      if (isSelectionPending) {
                        return;
                      }
                      handleRunsPress(runs);
                    }}
                  >
                    <Text
                      style={[
                        styles.runButtonText,
                        selectedRuns === runs && styles.selectedRunButtonText,
                        isSelectionPending && styles.disabledRunButtonText,
                      ]}
                    >
                      {runs}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.actionButton} onPress={handleWicketPress}>
                <Text style={styles.actionButtonText}>Wicket</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleExtrasPress}>
                <Text style={styles.actionButtonText}>Extras</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={undoLastBall}>
                <Text style={styles.actionButtonText}>Undo</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : isAdmin && !hasEditAccess ? (
          <View style={styles.viewerMessage}>
            {editLock.isLocked && editLock.lockedBy !== user?.phoneNumber ? (
              <>
                <Text style={styles.lockStatusIcon}>🔒</Text>
                <Text style={styles.viewerMessageText}>
                  Match is currently locked
                </Text>
                <Text style={styles.viewerMessageSubtext}>
                  {editLock.lockedByName} is editing scores right now.
                </Text>
                <Text style={styles.viewerMessageSubtext}>
                  Please wait for them to finish or try again in a few minutes.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.lockStatusIcon}>✋</Text>
                <Text style={styles.viewerMessageText}>
                  Ready to start scoring?
                </Text>
                <Text style={styles.viewerMessageSubtext}>
                  Click below to acquire edit access and lock the match.
                </Text>
                <TouchableOpacity 
                  style={styles.startScoringButton} 
                  onPress={requestEditAccess}
                >
                  <Text style={styles.startScoringButtonText}>
                    🏏 Start Scoring
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : !isAdmin ? (
          <View style={styles.viewerMessage}>
            <Text style={styles.viewerMessageText}>
              👀 You are viewing this match. Only admins can score runs.
            </Text>
            <Text style={styles.viewerMessageSubtext}>
              Contact an admin to get scoring access.
            </Text>
            <TouchableOpacity 
              style={styles.makeAdminButton} 
              onPress={makeMeAdmin}
            >
              <Text style={styles.makeAdminButtonText}>
                🔑 Make Me Admin (Testing)
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Stop Scoring Button - For admin who is currently editing */}
        {isAdmin && hasEditAccess && (
          <View style={styles.stopScoringSection}>
            <Text style={styles.editingIndicator}>
              ✅ You are editing • Match is locked for other admins
            </Text>
            <TouchableOpacity 
              style={styles.stopScoringButton} 
              onPress={releaseEditAccess}
            >
              <Text style={styles.stopScoringButtonText}>
                🛑 Stop Scoring & Release Lock
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Balls */}
        <View style={styles.recentBallsSection}>
          <Text style={styles.sectionTitle}>Recent Balls</Text>
          <View style={styles.ballsList}>
            {recentBallsForLive.map((ball) => (
              <View key={ball.id} style={styles.ballItem}>
                <Text style={styles.ballText}>
                  {ball.over}.{ball.ball} • {ball.bowler} to {ball.batsman} — {ball.commentary}
                </Text>
                {ball.shotType && (
                  <Text style={styles.ballShotDetails}>
                    🏏 {ball.shotType} to {ball.shotRegion} ({ball.shotQuality || 'well timed'})
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
        </ScrollView>
      )}

      {/* Scorecard Tab */}
      {activeTab === 'scorecard' && (
        <ProfessionalScorecard
          battingStats={scorecardData.battingStats}
          yetToBat={scorecardData.yetToBat}
          bowlingStats={scorecardData.bowlingStats}
          fallOfWickets={scorecardData.fallOfWickets}
          totalRuns={matchData.totalRuns}
          totalWickets={matchData.wickets}
          totalOvers={`${matchData.currentOver}.${matchData.currentBall}`}
          extras={scorecardData.extras}
          runRate={parseFloat(getRunRate())}
          teamName={matchData.battingTeamName}
        />
      )}

      {/* Commentary Tab */}
      {activeTab === 'commentary' && (
        <ProfessionalCommentary
          currentOver={currentOverSummary}
          recentBalls={recentBallsForCommentary}
          currentBatsman={matchData.currentBatsmen.striker.name}
          currentBatsmanStats={{
            runs: matchData.currentBatsmen.striker.runs,
            balls: matchData.currentBatsmen.striker.balls,
          }}
          currentBowler={matchData.currentBowler.name}
          currentBowlerStats={{
            overs: matchData.currentBowler.overs,
            wickets: matchData.currentBowler.wickets,
            runs: matchData.currentBowler.runs,
          }}
          bowlerId={matchData.currentBowler.id}
          allBalls={matchData.balls.map((ball) => decorateBallForDisplay(ball))}
          totalRuns={matchData.totalRuns}
          totalWickets={matchData.wickets}
        />
      )}

      {showInningsBreakOverlay && inningsBreakSummary && (
        <View style={styles.overlayModal}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>First Innings Complete</Text>
            <Text style={styles.overlayBody}>
              {`${inningsBreakSummary.battingTeam} scored ${inningsBreakSummary.totalRuns}/${inningsBreakSummary.wickets} in ${inningsBreakSummary.overs}.${inningsBreakSummary.balls} overs.`}
            </Text>
            <Text style={styles.overlayBodySecondary}>
              {`Target for ${inningsBreakSummary.bowlingTeam}: ${inningsBreakSummary.totalRuns + 1}`}
            </Text>
            <View style={styles.overlayActions}>
              <TouchableOpacity style={styles.overlaySecondaryButton} onPress={handleViewScorecardFromBreak}>
                <Text style={styles.overlaySecondaryButtonText}>View Scorecard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.overlayPrimaryButton} onPress={handleStartNextInnings}>
                <Text style={styles.overlayPrimaryButtonText}>Start Second Innings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showMatchCompleteOverlay && matchCompletionSummary && (
        <View style={styles.overlayModal}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>Match Complete</Text>
            <Text style={styles.overlayBody}>{matchCompletionSummary.resultText}</Text>
            <Text style={styles.overlayBodySecondary}>
              {`${matchCompletionSummary.summary.battingTeam} scored ${matchCompletionSummary.summary.totalRuns}/${matchCompletionSummary.summary.wickets} in ${matchCompletionSummary.summary.overs}.${matchCompletionSummary.summary.balls} overs.`}
            </Text>
            <View style={styles.overlayActions}>
              <TouchableOpacity style={styles.overlaySecondaryButton} onPress={handleViewScorecardFromCompletion}>
                <Text style={styles.overlaySecondaryButtonText}>Review Scorecard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.overlayPrimaryButton, isClosingMatch && styles.overlayPrimaryButtonDisabled]}
                onPress={handleCloseMatch}
                disabled={isClosingMatch}
              >
                <Text style={styles.overlayPrimaryButtonText}>
                  {isClosingMatch ? 'Saving...' : 'Save & Close Match'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Next Batsman Selector */}
      {showNextBatsmanSelector && (
        <View style={styles.selectorModal}>
          <View style={styles.selectorContent}>
            <Text style={styles.selectorTitle}>
              {isOpeningStrikerSelection
                ? 'Select Opening Striker'
                : isOpeningNonStrikerSelection
                ? 'Select Non-Striker'
                : 'Select Next Batsman'}
            </Text>
            <Text style={styles.selectorSubtitle}>
              {isOpeningStrikerSelection
                ? 'Choose who will take strike to start this innings.'
                : isOpeningNonStrikerSelection
                ? 'Choose the batter who will stand at the non-striker end.'
                : 'Choose the incoming batter to continue the innings.'}
            </Text>
            <ScrollView style={styles.selectorList}>
              {nextBatsmanOptions.map((player: any) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.selectorOption}
                  onPress={() => handleSelectNextBatsman(player.id)}
                >
                  <View>
                    <Text style={styles.selectorOptionName}>{player.name}</Text>
                    <Text style={styles.selectorOptionMeta}>
                      {(player.role || 'Batsman').toString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Next Bowler Selector */}
      {showNextBowlerSelector && (
        <View style={styles.selectorModal}>
          <View style={styles.selectorContent}>
            <Text style={styles.selectorTitle}>
              {isOpeningBowlerSelection ? 'Select Opening Bowler' : 'Select Next Bowler'}
            </Text>
            <Text style={styles.selectorSubtitle}>
              {isOpeningBowlerSelection
                ? 'Pick the bowler who will start this innings.'
                : 'Pick the bowler for the upcoming over.'}
            </Text>
            <ScrollView style={styles.selectorList}>
              {nextBowlerOptions.map((player: any) => {
                const figures = getBowlerFigures(player.id, matchData.balls);
                return (
                  <TouchableOpacity
                    key={player.id}
                    style={styles.selectorOption}
                    onPress={() => handleSelectNextBowler(player.id)}
                  >
                    <View>
                      <Text style={styles.selectorOptionName}>{player.name}</Text>
                      <Text style={styles.selectorOptionMeta}>
                        {(player.role || 'Bowler').toString()} • {figures.overs.toFixed(1)} ov • {figures.wickets} wkts • {figures.runs} runs
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Wicket Modal */}
      {showWicketModal && (
        <View style={styles.wicketModal}>
          <View style={styles.wicketContent}>
            <Text style={styles.wicketTitle}>Select Dismissal</Text>
            <View style={styles.wicketTypesRow}>
              {WICKET_TYPES.map((type) => {
                const isSelected = selectedWicketType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.wicketTypeButton,
                      isSelected && styles.selectedWicketTypeButton,
                    ]}
                    onPress={() => {
                      setSelectedWicketType(type.id);
                      if (!type.requiresFielder) {
                        setSelectedDismissalFielderId(null);
                      }
                      setPendingDismissalError(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.wicketTypeText,
                        isSelected && styles.selectedWicketTypeText,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {wicketRequiresFielder && (
              <View style={styles.wicketFielderSection}>
                <Text style={styles.wicketSubtitle}>Select Fielder</Text>
                <ScrollView style={styles.wicketFielderList}>
                  {matchData.team2Players.map((player: any) => {
                    const isSelected = selectedDismissalFielderId === player.id;
                    return (
                      <TouchableOpacity
                        key={player.id}
                        style={[
                          styles.fielderOption,
                          isSelected && styles.selectedFielderOption,
                        ]}
                        onPress={() => {
                          setSelectedDismissalFielderId(player.id);
                          setPendingDismissalError(null);
                        }}
                      >
                        <Text style={styles.fielderName}>{player.name}</Text>
                        <Text style={styles.fielderRole}>{player.role}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {pendingDismissalError ? (
              <Text style={styles.wicketError}>{pendingDismissalError}</Text>
            ) : null}

            <View style={styles.wicketActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelWicket}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmWicket}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Extras Modal */}
      {showExtras && (
        <View style={styles.extrasModal}>
          <View style={styles.extrasContent}>
            <Text style={styles.extrasTitle}>Select Extra</Text>
            {SCORING_CONFIG.SCORING_OPTIONS.EXTRAS.map((extra: string) => (
              <TouchableOpacity
                key={extra}
                style={styles.extraButton}
                onPress={() => handleExtraPress(extra)}
              >
                <Text style={styles.extraButtonText}>{extra}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowExtras(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Extras Details Modal */}
      {showExtraDetails && selectedExtraType && (
        <View style={styles.extraDetailsModal}>
          <View style={styles.extraDetailsContent}>
            <Text style={styles.extrasTitle}>Record {selectedExtraType}</Text>

            <View style={styles.extraSection}>
              <Text style={styles.extraSectionLabel}>
                {selectedExtraType === 'No Ball'
                  ? 'Runs from play (excluding automatic no-ball run)'
                  : 'Total runs'}
              </Text>
              <View style={styles.extraOptionsRow}>
                {(selectedExtraType === 'No Ball' ? NO_BALL_RUN_CHOICES : DEFAULT_EXTRA_RUN_CHOICES).map(
                  (value) => (
                    <TouchableOpacity
                      key={`extra-total-${value}`}
                      style={[
                        styles.extraOptionButton,
                        extraRunsValue === value && styles.selectedExtraOptionButton,
                      ]}
                      onPress={() => handleExtraRunsSelect(value)}
                    >
                      <Text
                        style={[
                          styles.extraOptionText,
                          extraRunsValue === value && styles.selectedExtraOptionText,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {selectedExtraType === 'No Ball' && (
              <>
                <View style={styles.extraSection}>
                  <Text style={styles.extraSectionLabel}>Runs Source</Text>
                  <View style={styles.extraOptionsRow}>
                    {[
                      { id: 'bat', label: 'Off the bat' },
                      { id: 'bye', label: 'Byes' },
                      { id: 'leg-bye', label: 'Leg byes' },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.extraOptionButton,
                          noBallRunSource === option.id && styles.selectedExtraOptionButton,
                        ]}
                        onPress={() => handleNoBallSourceSelect(option.id as 'bat' | 'bye' | 'leg-bye')}
                      >
                        <Text
                          style={[
                            styles.extraOptionText,
                            noBallRunSource === option.id && styles.selectedExtraOptionText,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Text style={styles.extraInfoText}>Next delivery will be a free hit.</Text>
              </>
            )}

            {selectedExtraType === 'Wide' && (
              <Text style={styles.extraInfoText}>
                Wides do not count as legal deliveries. Strike changes if the batters ran an odd number of wides.
              </Text>
            )}

            {(selectedExtraType === 'Bye' || selectedExtraType === 'Leg Bye') && (
              <Text style={styles.extraInfoText}>
                {selectedExtraType === 'Bye'
                  ? 'Byes count as legal deliveries and can rotate strike.'
                  : 'Leg byes count as legal deliveries and can rotate strike.'}
              </Text>
            )}

            <View style={styles.extraActions}>
              <TouchableOpacity
                style={[styles.cancelButton, styles.extraActionButton]}
                onPress={handleCancelExtraDetails}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.extraActionButton]}
                onPress={handleConfirmExtraDetails}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Shot Details Modal */}
      <ShotDetailsModal
        visible={showShotDetails}
        onClose={handleShotDetailsCancel}
        onConfirm={handleShotDetailsConfirm}
        runs={pendingBallData?.runs || 0}
        isWicket={pendingBallData?.isWicket || false}
        batsmanName={pendingBallData?.batsmanOnStrike || matchData.currentBatsmen.striker.name}
        bowlerName={pendingBallData?.bowlerName || matchData.currentBowler.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  backButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  saveButton: {
    padding: SIZES.sm,
  },
  saveButtonText: {
    fontSize: 18,
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  matchInfo: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  matchTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
  },
  matchDetails: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
    marginTop: SIZES.sm,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: UI_CONFIG.SHADOW_OPACITY,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  scoreTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
  },
  disabledRunButton: {
    opacity: 0.4,
  },
  disabledRunButtonText: {
    color: UI_CONFIG.TEXT_COLOR,
  },
  overText: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
  },
  scoreDisplay: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.PRIMARY_COLOR,
  },
  runRateText: {
    fontSize: 18,
    color: UI_CONFIG.TEXT_COLOR,
    marginTop: SIZES.sm,
  },
  scoringSection: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.md,
  },
  runsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  runButton: {
    width: (width - SIZES.lg * 2 - SIZES.md * 3) / 4,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: UI_CONFIG.SHADOW_OPACITY,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedRunButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
  },
  runButtonText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
  },
  freeHitBanner: {
    marginTop: SIZES.sm,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.WARNING_COLOR,
    textAlign: 'center',
  },
  targetText: {
    marginTop: SIZES.sm,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
  },
  resultText: {
    marginTop: SIZES.sm,
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.SUCCESS_COLOR,
    textAlign: 'center',
  },
  matchResultBanner: {
    marginTop: SIZES.sm,
    alignItems: 'center',
  },
  closeMatchButton: {
    marginTop: SIZES.sm,
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
  },
  closeMatchButtonDisabled: {
    opacity: 0.6,
  },
  closeMatchButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  inningsBanner: {
    backgroundColor: '#FFF6E6',
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: UI_CONFIG.WARNING_COLOR,
    marginBottom: SIZES.md,
  },
  inningsBannerText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.sm,
  },
  inningsBannerSubtext: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  startInningsButton: {
    marginTop: SIZES.sm,
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.sm,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    alignItems: 'center',
  },
  startInningsButtonText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  selectedRunButtonText: {
    color: COLORS.white,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: UI_CONFIG.SECONDARY_COLOR,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    marginHorizontal: SIZES.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
  },
  recentBallsSection: {
    marginBottom: SIZES.lg,
  },
  ballsList: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.md,
  },
  ballItem: {
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ballText: {
    fontSize: 16,
    color: UI_CONFIG.TEXT_COLOR,
    fontWeight: 'bold',
  },
  ballCommentary: {
    fontSize: 14,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  ballShotDetails: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: 'italic',
  },
  overlayModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  overlayCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
  },
  overlayTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  overlayBody: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: SIZES.sm / 2,
  },
  overlayBodySecondary: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
    opacity: 0.8,
  },
  overlayActions: {
    flexDirection: 'row',
    marginTop: SIZES.md,
  },
  overlayPrimaryButton: {
    flex: 1,
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    marginLeft: SIZES.sm / 2,
  },
  overlayPrimaryButtonDisabled: {
    opacity: 0.6,
  },
  overlayPrimaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  overlaySecondaryButton: {
    flex: 1,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI_CONFIG.PRIMARY_COLOR,
    marginRight: SIZES.sm / 2,
  },
  overlaySecondaryButtonText: {
    color: UI_CONFIG.PRIMARY_COLOR,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  selectorModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.lg,
  },
  selectorContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
  },
  selectorTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  selectorSubtitle: {
    fontSize: 14,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  selectorList: {
    maxHeight: 320,
  },
  selectorOption: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: SIZES.sm,
    backgroundColor: COLORS.white,
  },
  selectorOptionName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  selectorOptionMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  wicketModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  wicketContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
  },
  wicketTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  wicketTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  wicketTypeButton: {
    minWidth: 120,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  selectedWicketTypeButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  wicketTypeText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
  },
  selectedWicketTypeText: {
    color: COLORS.primary,
  },
  wicketFielderSection: {
    marginBottom: SIZES.md,
  },
  wicketSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.sm,
  },
  wicketFielderList: {
    maxHeight: 200,
  },
  fielderOption: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: SIZES.xs,
    backgroundColor: COLORS.white,
  },
  selectedFielderOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  fielderName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  fielderRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  wicketError: {
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  wicketActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.sm,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  extrasModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extrasContent: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
    width: width * 0.8,
  },
  extrasTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: UI_CONFIG.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  extraButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    marginBottom: SIZES.sm,
    alignItems: 'center',
  },
  extraButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  extraDetailsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraDetailsContent: {
    backgroundColor: COLORS.white,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    padding: SIZES.lg,
    width: width * 0.9,
    maxWidth: 420,
  },
  extraSection: {
    marginBottom: SIZES.md,
  },
  extraSectionLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.sm,
  },
  extraOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  extraOptionButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    backgroundColor: '#f5f5f5',
  },
  selectedExtraOptionButton: {
    backgroundColor: UI_CONFIG.PRIMARY_COLOR,
  },
  extraOptionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  selectedExtraOptionText: {
    color: COLORS.white,
  },
  extraInfoText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: UI_CONFIG.TEXT_COLOR,
    marginBottom: SIZES.md,
  },
  extraActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.sm,
  },
  extraActionButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: SIZES.md,
    borderRadius: UI_CONFIG.BORDER_RADIUS,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: UI_CONFIG.TEXT_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.BACKGROUND_COLOR,
  },
  loadingText: {
    fontSize: 18,
    color: UI_CONFIG.TEXT_COLOR,
    fontFamily: FONTS.medium,
  },
  // Current Batsmen Styles
  batsmenCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batsmenTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.md,
  },
  batsmenInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  batsman: {
    flex: 1,
    alignItems: 'center',
  },
  batsmanName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  batsmanScore: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  // Bowler Styles
  bowlerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bowlerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  bowlerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
  },
  bowlerInfo: {
    alignItems: 'center',
  },
  bowlerName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#333',
    marginBottom: SIZES.xs,
  },
  bowlerStats: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.medium,
  },
  changeLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeLinkText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  // Next Batsman Styles
  nextBatsmanCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  nextBatsmanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextBatsmanTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#666',
  },
  nextBatsmanName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#333',
  },
  // Player Statistics Styles
  playerStatsSection: {
    marginBottom: SIZES.lg,
  },
  statsCategory: {
    marginBottom: SIZES.md,
  },
  statsCategoryTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.sm,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  // Professional Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  // Viewer Message Styles
  viewerMessage: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radius,
    margin: SIZES.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  viewerMessageText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  viewerMessageSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  makeAdminButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    marginTop: SIZES.md,
  },
  makeAdminButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  // Lock Status Styles
  lockStatusIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  startScoringButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    marginTop: SIZES.md,
  },
  startScoringButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  stopScoringSection: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    margin: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  editingIndicator: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  stopScoringButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radius,
  },
  stopScoringButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default LiveScoringScreen;


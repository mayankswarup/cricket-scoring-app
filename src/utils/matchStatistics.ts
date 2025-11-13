import { BallData } from '../services/liveScoringService';
import { ScorecardData } from '../screens/LiveScoringScreen';

export interface TeamInningsStats {
  teamId: string;
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
  extras: number;
}

export interface MatchStatistics {
  team1Innings: TeamInningsStats;
  team2Innings: TeamInningsStats;
  topBatsman: {
    id: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
  } | null;
  topBowler: {
    id: string;
    name: string;
    wickets: number;
    runs: number;
    overs: number;
    economy: number;
  } | null;
  mostSixes: {
    id: string;
    name: string;
    sixes: number;
  } | null;
  mostFours: {
    id: string;
    name: string;
    fours: number;
  } | null;
  playerOfMatch: {
    id: string;
    name: string;
    team: string;
    score: number;
    reason: string;
  } | null;
}

/**
 * Calculate statistics for both teams from ball data
 */
export const calculateTeamInningsStats = (
  balls: BallData[],
  team1Id: string,
  team1Name: string,
  team2Id: string,
  team2Name: string,
  team1InningsNumber: number | null = 1,
  team2InningsNumber: number | null = 2
): { team1: TeamInningsStats; team2: TeamInningsStats } => {
  // Separate balls by innings using the provided innings numbers
  // If innings numbers are not provided, fall back to default (1 for team1, 2 for team2)
  const team1Innings = team1InningsNumber ?? 1;
  const team2Innings = team2InningsNumber ?? 2;
  
  // Check if any balls have innings field
  const ballsWithInnings = balls.filter(b => b.innings !== undefined);
  const useInningsField = ballsWithInnings.length > 0;
  
  let team1Balls: BallData[];
  let team2Balls: BallData[];
  
  if (useInningsField) {
    // Use innings field to filter balls
    team1Balls = balls.filter(ball => {
      return ball.innings !== undefined && ball.innings === team1Innings;
    });

    team2Balls = balls.filter(ball => {
      return ball.innings !== undefined && ball.innings === team2Innings;
    });
  } else {
    // If no balls have innings field, assign all balls to team1 (first innings)
    // This assumes the match only has one innings completed
    // In a two-innings match, balls should always have innings field
    console.warn('⚠️ No balls have innings field - assigning all to team1 (first innings)');
    team1Balls = balls;
    team2Balls = [];
  }
  
  console.log('🔍 Filtered balls:', {
    totalBalls: balls.length,
    team1Balls: team1Balls.length,
    team2Balls: team2Balls.length,
    useInningsField,
    team1Innings,
    team2Innings,
    uniqueInningsInBalls: [...new Set(balls.map(b => b.innings).filter(v => v !== undefined))],
  });

  // Calculate team1 stats (from balls where team1 was batting)
  const team1Runs = team1Balls.reduce((sum, ball) => {
    // Skip extras - they don't count as batsman runs
    if (ball.isExtra) return sum;
    // Use batsmanRuns if available, otherwise use runs (but exclude extra runs)
    const runs = ball.batsmanRuns ?? ball.runs ?? 0;
    return sum + runs;
  }, 0);
  const team1Wickets = team1Balls.filter(ball => ball.isWicket).length;
  const team1LegalBalls = team1Balls.filter(ball => {
    const isWide = ball.extraType === 'Wide';
    const isNoBall = ball.extraType === 'No Ball';
    return !isWide && !isNoBall && ball.legalDelivery !== false;
  }).length;
  const team1Overs = Math.floor(team1LegalBalls / 6);
  const team1BallsInOver = team1LegalBalls % 6;
  const team1Extras = team1Balls.reduce((sum, ball) => sum + (ball.extraRuns || 0), 0);

  // Calculate team2 stats (from balls where team2 was batting)
  const team2Runs = team2Balls.reduce((sum, ball) => {
    // Skip extras - they don't count as batsman runs
    if (ball.isExtra) return sum;
    // Use batsmanRuns if available, otherwise use runs (but exclude extra runs)
    const runs = ball.batsmanRuns ?? ball.runs ?? 0;
    return sum + runs;
  }, 0);
  const team2Wickets = team2Balls.filter(ball => ball.isWicket).length;
  const team2LegalBalls = team2Balls.filter(ball => {
    const isWide = ball.extraType === 'Wide';
    const isNoBall = ball.extraType === 'No Ball';
    return !isWide && !isNoBall && ball.legalDelivery !== false;
  }).length;
  const team2Overs = Math.floor(team2LegalBalls / 6);
  const team2BallsInOver = team2LegalBalls % 6;
  const team2Extras = team2Balls.reduce((sum, ball) => sum + (ball.extraRuns || 0), 0);

  return {
    team1: {
      teamId: team1Id,
      teamName: team1Name,
      runs: team1Runs,
      wickets: team1Wickets,
      overs: team1Overs,
      balls: team1BallsInOver,
      runRate: team1LegalBalls > 0 ? (team1Runs / team1LegalBalls) * 6 : 0,
      extras: team1Extras,
    },
    team2: {
      teamId: team2Id,
      teamName: team2Name,
      runs: team2Runs,
      wickets: team2Wickets,
      overs: team2Overs,
      balls: team2BallsInOver,
      runRate: team2LegalBalls > 0 ? (team2Runs / team2LegalBalls) * 6 : 0,
      extras: team2Extras,
    },
  };
};

/**
 * Calculate comprehensive match statistics
 */
export const calculateMatchStatistics = (
  balls: BallData[],
  scorecard: ScorecardData,
  team1Id: string,
  team1Name: string,
  team2Id: string,
  team2Name: string,
  team1InningsNumber: number | null = 1,
  team2InningsNumber: number | null = 2
): MatchStatistics => {
  // Get top batsman
  const topBatsman = [...scorecard.battingStats]
    .sort((a, b) => {
      if (b.runs !== a.runs) return b.runs - a.runs;
      if (a.balls === 0) return 1;
      if (b.balls === 0) return -1;
      return (b.runs / b.balls) - (a.runs / a.balls); // Strike rate
    })[0];

  // Get top bowler
  const topBowler = [...scorecard.bowlingStats]
    .sort((a, b) => {
      if (b.wickets !== a.wickets) return b.wickets - a.wickets;
      if (a.wickets === 0) return 1;
      if (b.wickets === 0) return -1;
      return (a.runs / a.wickets) - (b.runs / b.wickets); // Average (lower is better)
    })[0];

  // Get most sixes
  const mostSixes = [...scorecard.battingStats]
    .sort((a, b) => b.sixes - a.sixes)
    .filter(p => p.sixes > 0)[0] || null;

  // Get most fours
  const mostFours = [...scorecard.battingStats]
    .sort((a, b) => b.fours - a.fours)
    .filter(p => p.fours > 0)[0] || null;

  // Calculate Player of the Match (smart AI combination)
  const playerOfMatch = calculatePlayerOfMatch(scorecard, team1Name, team2Name);

  // Calculate team innings stats
  const inningsStats = calculateTeamInningsStats(
    balls, 
    team1Id, 
    team1Name, 
    team2Id, 
    team2Name,
    team1InningsNumber,
    team2InningsNumber
  );

  return {
    team1Innings: inningsStats.team1,
    team2Innings: inningsStats.team2,
    topBatsman: topBatsman ? {
      id: topBatsman.id,
      name: topBatsman.name,
      runs: topBatsman.runs,
      balls: topBatsman.balls,
      fours: topBatsman.fours,
      sixes: topBatsman.sixes,
      strikeRate: topBatsman.strikeRate,
    } : null,
    topBowler: topBowler ? {
      id: topBowler.id,
      name: topBowler.name,
      wickets: topBowler.wickets,
      runs: topBowler.runs,
      overs: topBowler.overs,
      economy: topBowler.economy,
    } : null,
    mostSixes: mostSixes ? {
      id: mostSixes.id,
      name: mostSixes.name,
      sixes: mostSixes.sixes,
    } : null,
    mostFours: mostFours ? {
      id: mostFours.id,
      name: mostFours.name,
      fours: mostFours.fours,
    } : null,
    playerOfMatch,
  };
};

/**
 * Calculate Player of the Match using smart AI combination
 * Considers: runs, strike rate, wickets, economy, impact
 */
const calculatePlayerOfMatch = (
  scorecard: ScorecardData,
  team1Name: string,
  team2Name: string
): MatchStatistics['playerOfMatch'] => {
  const allPlayers: Array<{
    id: string;
    name: string;
    team: string;
    battingScore: number;
    bowlingScore: number;
    totalScore: number;
    reason: string;
  }> = [];

  // Score batting performance
  scorecard.battingStats.forEach((player: any) => {
    const runsScore = player.runs * 1;
    const strikeRateScore = player.balls > 0 ? (player.strikeRate / 200) * 50 : 0; // Normalize to 50 points max
    const boundaryScore = (player.fours * 2) + (player.sixes * 3);
    const battingScore = runsScore + strikeRateScore + boundaryScore;
    
    let reason = '';
    if (player.runs >= 50) reason = `${player.runs} runs`;
    if (player.strikeRate > 150) reason += reason ? ` at ${player.strikeRate.toFixed(1)} SR` : `Strike rate ${player.strikeRate.toFixed(1)}`;
    if (player.sixes > 0) reason += reason ? `, ${player.sixes} sixes` : `${player.sixes} sixes`;
    
    // Determine team
    const team = team1Name; // Simplified - would need team mapping
    
    allPlayers.push({
      id: player.id,
      name: player.name,
      team,
      battingScore,
      bowlingScore: 0,
      totalScore: battingScore,
      reason: reason || `${player.runs} runs`,
    });
  });

  // Score bowling performance
  scorecard.bowlingStats.forEach((player: any) => {
    const wicketsScore = player.wickets * 25;
    const economyScore = player.overs > 0 ? Math.max(0, (7 - player.economy) * 10) : 0; // Lower economy = better
    const bowlingScore = wicketsScore + economyScore;
    
    let reason = '';
    if (player.wickets > 0) reason = `${player.wickets} wickets`;
    if (player.economy < 7 && player.overs > 0) reason += reason ? ` at ${player.economy.toFixed(1)} economy` : `Economy ${player.economy.toFixed(1)}`;
    
    // Find existing player or create new
    const existing = allPlayers.find(p => p.id === player.id);
    if (existing) {
      existing.bowlingScore = bowlingScore;
      existing.totalScore += bowlingScore;
      if (bowlingScore > existing.battingScore) {
        existing.reason = reason || `${player.wickets} wickets`;
      }
    } else {
      const team = team2Name; // Simplified
      allPlayers.push({
        id: player.id,
        name: player.name,
        team,
        battingScore: 0,
        bowlingScore,
        totalScore: bowlingScore,
        reason: reason || `${player.wickets} wickets`,
      });
    }
  });

  // Sort by total score and get top player
  const topPlayer = allPlayers.sort((a, b) => b.totalScore - a.totalScore)[0];
  
  if (!topPlayer || topPlayer.totalScore === 0) {
    return null;
  }

  return {
    id: topPlayer.id,
    name: topPlayer.name,
    team: topPlayer.team,
    score: topPlayer.totalScore,
    reason: topPlayer.reason,
  };
};


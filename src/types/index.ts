// Cricket App Types
export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingStyle: 'right-handed' | 'left-handed';
  bowlingStyle?: 'right-arm fast' | 'left-arm fast' | 'right-arm spin' | 'left-arm spin';
  stats: PlayerStats;
}

export interface PlayerStats {
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  players: Player[];
  captain: string;
  coach: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  venue: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  score?: MatchScore;
}

export interface MatchScore {
  homeTeam: {
    runs: number;
    wickets: number;
    overs: number;
  };
  awayTeam: {
    runs: number;
    wickets: number;
    overs: number;
  };
  currentInnings: 'home' | 'away';
  target?: number;
}

export interface News {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  category: 'match' | 'player' | 'team' | 'general';
}

// Enhanced types for match management
export interface MatchSetup {
  id: string;
  homeTeam: TeamSetup;
  awayTeam: TeamSetup;
  venue: string;
  date: string;
  tossResult?: TossResult;
  status: 'setup' | 'toss' | 'ready' | 'live' | 'completed';
}

export interface TeamSetup {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  players: Player[];
  playingXI: Player[]; // 11 selected players
  captain: Player | null;
  viceCaptain: Player | null;
  coach: string;
}

export interface TossResult {
  winner: 'home' | 'away';
  winnerTeam: TeamSetup;
  decision: 'bat' | 'bowl';
  electedTo: 'bat' | 'bowl';
  timestamp: string;
}

export interface MatchAdmin {
  id: string;
  name: string;
  email: string;
  permissions: ('create_match' | 'edit_match' | 'manage_players' | 'view_admin')[];
}

// Enhanced types for player registration and team management
export interface PlayerRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // In real app, this would be hashed
  dateOfBirth: string;
  preferredRole: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingStyle: 'right-handed' | 'left-handed';
  bowlingStyle?: 'right-arm fast' | 'left-arm fast' | 'right-arm spin' | 'left-arm spin';
  experience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  location: string;
  availability: PlayerAvailability[];
  profileImage?: string;
  stats: PlayerStats;
  createdAt: string;
  isActive: boolean;
}

export interface PlayerAvailability {
  id: string;
  playerId: string;
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
  isAvailable: boolean;
  reason?: string; // If not available, why?
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
  isAvailable: boolean;
}

export interface TeamMembership {
  id: string;
  playerId: string;
  teamId: string;
  role: 'member' | 'captain' | 'vice-captain' | 'coach';
  joinedAt: string;
  isActive: boolean;
}

export interface TeamCreation {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  description: string;
  location: string;
  ownerId: string; // Player ID who created the team
  captainId?: string;
  viceCaptainId?: string;
  members: TeamMembership[];
  maxMembers: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface MatchSchedule {
  id: string;
  homeTeam: TeamCreation;
  awayTeam: TeamCreation;
  venue: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  playingXI: {
    homeTeam: string[]; // Player IDs
    awayTeam: string[]; // Player IDs
  };
  tossResult?: TossResult;
}

export interface PlayerConflict {
  playerId: string;
  conflictingMatches: string[]; // Match IDs
  conflictReason: 'time_overlap' | 'location_conflict' | 'player_unavailable';
}

// Tournament Management Types
export interface Tournament {
  id: string;
  name: string;
  description: string;
  format: 'league' | 'knockout' | 'round_robin' | 't20' | 'odi' | 'test';
  startDate: string;
  endDate: string;
  organizerId: string;
  maxTeams: number;
  entryFee: number;
  prizeMoney: number;
  status: 'draft' | 'open' | 'closed' | 'ongoing' | 'completed';
  teams: string[]; // Team IDs
  matches: string[]; // Match IDs
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  registrationDate: string;
  isConfirmed: boolean;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  overNumber: number;
  ballNumber: number;
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  eventType: 'run' | 'wide' | 'no_ball' | 'wicket' | 'bye' | 'leg_bye';
  runs: number;
  extrasType?: 'wide' | 'no_ball' | 'bye' | 'leg_bye';
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 'hit_wicket';
  dismissalPlayerId?: string;
  scorerId: string;
  timestamp: string;
}

export interface PlayerStatistics {
  id: string;
  userId: string;
  matchId: string;
  teamId: string;
  // Batting Stats
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isNotOut: boolean;
  // Bowling Stats
  oversBowled: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  // Fielding Stats
  catches: number;
  runOuts: number;
  stumpings: number;
  createdAt: string;
}

export interface PointsTable {
  id: string;
  tournamentId: string;
  teamId: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesTied: number;
  points: number;
  netRunRate: number;
  createdAt: string;
  updatedAt?: string;
}
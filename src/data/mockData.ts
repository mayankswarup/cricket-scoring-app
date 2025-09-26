// Mock data for testing UI components
import { Match, Player, Team, MatchSetup, TeamSetup, TossResult } from '../types';

// Mock teams
export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'India',
    shortName: 'IND',
    logo: '🇮🇳',
    players: [],
    captain: 'Rohit Sharma',
    coach: 'Rahul Dravid'
  },
  {
    id: '2',
    name: 'Australia',
    shortName: 'AUS',
    logo: '🇦🇺',
    players: [],
    captain: 'Pat Cummins',
    coach: 'Andrew McDonald'
  },
  {
    id: '3',
    name: 'South Africa',
    shortName: 'SA',
    logo: '🇿🇦',
    players: [],
    captain: 'Temba Bavuma',
    coach: 'Rob Walter'
  },
  {
    id: '4',
    name: 'New Zealand',
    shortName: 'NZ',
    logo: '🇳🇿',
    players: [],
    captain: 'Kane Williamson',
    coach: 'Gary Stead'
  },
  {
    id: '5',
    name: 'England',
    shortName: 'ENG',
    logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    players: [],
    captain: 'Jos Buttler',
    coach: 'Matthew Mott'
  },
  {
    id: '6',
    name: 'Pakistan',
    shortName: 'PAK',
    logo: '🇵🇰',
    players: [],
    captain: 'Babar Azam',
    coach: 'Grant Bradburn'
  }
];

// Mock players for each team
export const mockPlayers: Player[] = [
  // India players
  {
    id: '1',
    name: 'Virat Kohli',
    team: 'India',
    role: 'batsman',
    battingStyle: 'right-handed',
    stats: {
      matches: 100,
      runs: 5000,
      wickets: 0,
      average: 50.0,
      strikeRate: 120.0
    }
  },
  {
    id: '2',
    name: 'Rohit Sharma',
    team: 'India',
    role: 'batsman',
    battingStyle: 'right-handed',
    stats: {
      matches: 150,
      runs: 6000,
      wickets: 0,
      average: 45.0,
      strikeRate: 110.0
    }
  },
  {
    id: '3',
    name: 'Jasprit Bumrah',
    team: 'India',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 80,
      runs: 200,
      wickets: 150,
      average: 20.0,
      strikeRate: 18.0
    }
  },
  // Australia players
  {
    id: '4',
    name: 'Pat Cummins',
    team: 'Australia',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 80,
      runs: 500,
      wickets: 200,
      average: 25.0,
      strikeRate: 20.0
    }
  },
  {
    id: '5',
    name: 'Steve Smith',
    team: 'Australia',
    role: 'batsman',
    battingStyle: 'right-handed',
    stats: {
      matches: 120,
      runs: 5500,
      wickets: 0,
      average: 55.0,
      strikeRate: 115.0
    }
  },
  {
    id: '6',
    name: 'David Warner',
    team: 'Australia',
    role: 'batsman',
    battingStyle: 'left-handed',
    stats: {
      matches: 140,
      runs: 5800,
      wickets: 0,
      average: 48.0,
      strikeRate: 125.0
    }
  },
  // South Africa players
  {
    id: '7',
    name: 'Quinton de Kock',
    team: 'South Africa',
    role: 'wicket-keeper',
    battingStyle: 'left-handed',
    stats: {
      matches: 90,
      runs: 4000,
      wickets: 0,
      average: 45.0,
      strikeRate: 130.0
    }
  },
  {
    id: '8',
    name: 'Kagiso Rabada',
    team: 'South Africa',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 70,
      runs: 300,
      wickets: 120,
      average: 22.0,
      strikeRate: 19.0
    }
  },
  // New Zealand players
  {
    id: '9',
    name: 'Kane Williamson',
    team: 'New Zealand',
    role: 'batsman',
    battingStyle: 'right-handed',
    stats: {
      matches: 110,
      runs: 5200,
      wickets: 0,
      average: 52.0,
      strikeRate: 105.0
    }
  },
  {
    id: '10',
    name: 'Trent Boult',
    team: 'New Zealand',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'left-arm fast',
    stats: {
      matches: 85,
      runs: 400,
      wickets: 140,
      average: 24.0,
      strikeRate: 20.0
    }
  },
  // England players
  {
    id: '11',
    name: 'Jos Buttler',
    team: 'England',
    role: 'wicket-keeper',
    battingStyle: 'right-handed',
    stats: {
      matches: 95,
      runs: 4500,
      wickets: 0,
      average: 47.0,
      strikeRate: 135.0
    }
  },
  {
    id: '12',
    name: 'Ben Stokes',
    team: 'England',
    role: 'all-rounder',
    battingStyle: 'left-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 100,
      runs: 3500,
      wickets: 80,
      average: 35.0,
      strikeRate: 25.0
    }
  },
  // Pakistan players
  {
    id: '13',
    name: 'Babar Azam',
    team: 'Pakistan',
    role: 'batsman',
    battingStyle: 'right-handed',
    stats: {
      matches: 85,
      runs: 4200,
      wickets: 0,
      average: 49.0,
      strikeRate: 118.0
    }
  },
  {
    id: '14',
    name: 'Shaheen Afridi',
    team: 'Pakistan',
    role: 'bowler',
    battingStyle: 'left-handed',
    bowlingStyle: 'left-arm fast',
    stats: {
      matches: 60,
      runs: 250,
      wickets: 100,
      average: 20.0,
      strikeRate: 18.0
    }
  },
  // Additional players for complete scorecard
  {
    id: '15',
    name: 'KL Rahul',
    team: 'India',
    role: 'wicket-keeper',
    battingStyle: 'right-handed',
    stats: {
      matches: 70,
      runs: 3500,
      wickets: 0,
      average: 42.0,
      strikeRate: 125.0
    }
  },
  {
    id: '16',
    name: 'Hardik Pandya',
    team: 'India',
    role: 'all-rounder',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 60,
      runs: 2000,
      wickets: 50,
      average: 35.0,
      strikeRate: 25.0
    }
  },
  {
    id: '17',
    name: 'Mitchell Starc',
    team: 'Australia',
    role: 'bowler',
    battingStyle: 'left-handed',
    bowlingStyle: 'left-arm fast',
    stats: {
      matches: 90,
      runs: 400,
      wickets: 180,
      average: 22.0,
      strikeRate: 19.0
    }
  },
  {
    id: '18',
    name: 'Glenn Maxwell',
    team: 'Australia',
    role: 'all-rounder',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm spin',
    stats: {
      matches: 80,
      runs: 3000,
      wickets: 30,
      average: 38.0,
      strikeRate: 28.0
    }
  },
  {
    id: '19',
    name: 'Heinrich Klaasen',
    team: 'South Africa',
    role: 'wicket-keeper',
    battingStyle: 'right-handed',
    stats: {
      matches: 50,
      runs: 2000,
      wickets: 0,
      average: 40.0,
      strikeRate: 140.0
    }
  },
  {
    id: '20',
    name: 'Anrich Nortje',
    team: 'South Africa',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 40,
      runs: 150,
      wickets: 80,
      average: 18.0,
      strikeRate: 17.0
    }
  },
  {
    id: '21',
    name: 'Devon Conway',
    team: 'New Zealand',
    role: 'wicket-keeper',
    battingStyle: 'left-handed',
    stats: {
      matches: 45,
      runs: 1800,
      wickets: 0,
      average: 41.0,
      strikeRate: 115.0
    }
  },
  {
    id: '22',
    name: 'Lockie Ferguson',
    team: 'New Zealand',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 55,
      runs: 200,
      wickets: 90,
      average: 20.0,
      strikeRate: 18.0
    }
  },
  {
    id: '23',
    name: 'Jonny Bairstow',
    team: 'England',
    role: 'wicket-keeper',
    battingStyle: 'right-handed',
    stats: {
      matches: 75,
      runs: 3200,
      wickets: 0,
      average: 43.0,
      strikeRate: 128.0
    }
  },
  {
    id: '24',
    name: 'Jofra Archer',
    team: 'England',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 35,
      runs: 100,
      wickets: 70,
      average: 19.0,
      strikeRate: 16.0
    }
  },
  {
    id: '25',
    name: 'Mohammad Rizwan',
    team: 'Pakistan',
    role: 'wicket-keeper',
    battingStyle: 'right-handed',
    stats: {
      matches: 70,
      runs: 2800,
      wickets: 0,
      average: 40.0,
      strikeRate: 120.0
    }
  },
  {
    id: '26',
    name: 'Haris Rauf',
    team: 'Pakistan',
    role: 'bowler',
    battingStyle: 'right-handed',
    bowlingStyle: 'right-arm fast',
    stats: {
      matches: 45,
      runs: 120,
      wickets: 85,
      average: 17.0,
      strikeRate: 15.0
    }
  }
];

// Mock live matches
export const mockLiveMatches: Match[] = [
  {
    id: '1',
    homeTeam: mockTeams[0], // India
    awayTeam: mockTeams[1], // Australia
    venue: 'Melbourne Cricket Ground',
    date: '2024-01-15T10:00:00Z',
    status: 'live',
    score: {
      homeTeam: {
        runs: 170,
        wickets: 3,
        overs: 19.1
      },
      awayTeam: {
        runs: 185,
        wickets: 6,
        overs: 20.0
      },
      currentInnings: 'home',
      target: 186
    }
  },
  {
    id: '2',
    homeTeam: mockTeams[2], // South Africa
    awayTeam: mockTeams[3], // New Zealand
    venue: 'Newlands, Cape Town',
    date: '2024-01-15T14:00:00Z',
    status: 'live',
    score: {
      homeTeam: {
        runs: 180,
        wickets: 5,
        overs: 18.3
      },
      awayTeam: {
        runs: 0,
        wickets: 0,
        overs: 0
      },
      currentInnings: 'home',
      target: 0
    }
  },
  {
    id: '3',
    homeTeam: mockTeams[4], // England
    awayTeam: mockTeams[5], // Pakistan
    venue: 'Lord\'s, London',
    date: '2024-01-15T18:00:00Z',
    status: 'upcoming',
    score: {
      homeTeam: {
        runs: 0,
        wickets: 0,
        overs: 0
      },
      awayTeam: {
        runs: 0,
        wickets: 0,
        overs: 0
      },
      currentInnings: 'home',
      target: 0
    }
  },
  {
    id: '4',
    homeTeam: mockTeams[0], // India
    awayTeam: mockTeams[2], // South Africa
    venue: 'Wankhede Stadium, Mumbai',
    date: '2024-01-14T14:00:00Z',
    status: 'completed',
    score: {
      homeTeam: {
        runs: 195,
        wickets: 5,
        overs: 20.0
      },
      awayTeam: {
        runs: 142,
        wickets: 10,
        overs: 18.2
      },
      currentInnings: 'home',
      target: 196
    }
  }
];

// Keep the old single match for backward compatibility
export const mockLiveMatch = mockLiveMatches[0];

// Mock current batsmen for different matches
export const mockCurrentBatsmen = {
  '1': [ // India vs Australia
    {
      name: 'Virat Kohli',
      runs: 78,
      balls: 45,
      isStriker: true
    },
    {
      name: 'Rohit Sharma',
      runs: 67,
      balls: 42,
      isStriker: false
    }
  ],
  '2': [ // South Africa vs New Zealand
    {
      name: 'Quinton de Kock',
      runs: 65,
      balls: 45,
      isStriker: true
    },
    {
      name: 'Temba Bavuma',
      runs: 35,
      balls: 28,
      isStriker: false
    }
  ],
  '3': [ // England vs Pakistan (upcoming)
    {
      name: 'Jos Buttler',
      runs: 0,
      balls: 0,
      isStriker: true
    },
    {
      name: 'Ben Stokes',
      runs: 0,
      balls: 0,
      isStriker: false
    }
  ]
};

// Mock current bowlers for different matches
export const mockCurrentBowlers = {
  '1': { // India vs Australia
    name: 'Pat Cummins',
    overs: 3.1,
    runs: 28,
    wickets: 1
  },
  '2': { // South Africa vs New Zealand
    name: 'Trent Boult',
    overs: 3.3,
    runs: 18,
    wickets: 1
  },
  '3': { // England vs Pakistan (upcoming)
    name: 'Shaheen Afridi',
    overs: 0.0,
    runs: 0,
    wickets: 0
  }
};

// Mock scorecard data for all players
export const mockScorecardData = {
  '1': { // India vs Australia
    batting: {
      'India': [
        { name: 'Virat Kohli', runs: 78, balls: 45, fours: 7, sixes: 3, isNotOut: true, isStriker: true },
        { name: 'Rohit Sharma', runs: 67, balls: 42, fours: 5, sixes: 4, isNotOut: true, isStriker: false },
        { name: 'KL Rahul', runs: 15, balls: 12, fours: 1, sixes: 1, isNotOut: false, isStriker: false },
        { name: 'Hardik Pandya', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false },
        { name: 'Jasprit Bumrah', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false }
      ],
      'Australia': [
        { name: 'David Warner', runs: 67, balls: 45, fours: 8, sixes: 2, isNotOut: false, isStriker: false },
        { name: 'Steve Smith', runs: 45, balls: 32, fours: 5, sixes: 1, isNotOut: false, isStriker: false },
        { name: 'Glenn Maxwell', runs: 38, balls: 28, fours: 4, sixes: 2, isNotOut: false, isStriker: false },
        { name: 'Pat Cummins', runs: 25, balls: 18, fours: 2, sixes: 1, isNotOut: false, isStriker: false },
        { name: 'Mitchell Starc', runs: 10, balls: 8, fours: 1, sixes: 0, isNotOut: false, isStriker: false }
      ]
    },
    bowling: {
      'India': [
        { name: 'Jasprit Bumrah', overs: 4.0, maidens: 1, runs: 18, wickets: 4, economy: 4.5 },
        { name: 'Hardik Pandya', overs: 3.3, maidens: 0, runs: 28, wickets: 3, economy: 8.0 },
        { name: 'Mohammed Shami', overs: 4.0, maidens: 0, runs: 32, wickets: 2, economy: 8.0 },
        { name: 'Ravindra Jadeja', overs: 4.0, maidens: 0, runs: 25, wickets: 1, economy: 6.25 }
      ],
      'Australia': [
        { name: 'Pat Cummins', overs: 4.0, maidens: 0, runs: 25, wickets: 2, economy: 6.25 },
        { name: 'Mitchell Starc', overs: 3.0, maidens: 0, runs: 18, wickets: 1, economy: 6.0 },
        { name: 'Glenn Maxwell', overs: 2.0, maidens: 0, runs: 15, wickets: 0, economy: 7.5 }
      ]
    }
  },
  '2': { // South Africa vs New Zealand
    batting: {
      'South Africa': [
        { name: 'Quinton de Kock', runs: 65, balls: 45, fours: 6, sixes: 3, isNotOut: true, isStriker: true },
        { name: 'Temba Bavuma', runs: 35, balls: 28, fours: 3, sixes: 1, isNotOut: true, isStriker: false },
        { name: 'Heinrich Klaasen', runs: 20, balls: 15, fours: 2, sixes: 1, isNotOut: false, isStriker: false },
        { name: 'Kagiso Rabada', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false },
        { name: 'Anrich Nortje', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false }
      ],
      'New Zealand': [
        { name: 'Kane Williamson', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false },
        { name: 'Devon Conway', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false },
        { name: 'Trent Boult', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false },
        { name: 'Lockie Ferguson', runs: 0, balls: 0, fours: 0, sixes: 0, isNotOut: false, isStriker: false }
      ]
    },
    bowling: {
      'South Africa': [
        { name: 'Kagiso Rabada', overs: 0.0, maidens: 0, runs: 0, wickets: 0, economy: 0.0 },
        { name: 'Anrich Nortje', overs: 0.0, maidens: 0, runs: 0, wickets: 0, economy: 0.0 }
      ],
      'New Zealand': [
        { name: 'Trent Boult', overs: 3.3, maidens: 0, runs: 18, wickets: 1, economy: 5.1 },
        { name: 'Lockie Ferguson', overs: 3.0, maidens: 0, runs: 22, wickets: 2, economy: 7.3 }
      ]
    }
  }
};

// Mock recent balls data
export const mockRecentBalls = {
  '1': [ // India vs Australia
    { ball: '19.1', runs: 4, description: 'FOUR! Kohli smashes it through covers! 15 needed from 5 balls! 🔥' },
    { ball: '19.0', runs: 6, description: 'SIX! Rohit clears the boundary! What a shot! 💥' }
  ],
  '2': [ // South Africa vs New Zealand
    { ball: '18.6', runs: 4, description: 'FOUR! Quinton de Kock finds the gap at cover.' },
    { ball: '18.5', runs: 2, description: 'Two runs to long-on.' }
  ],
  '3': [ // England vs Pakistan (upcoming)
    { ball: '0.0', runs: 0, description: 'Match not started yet.' }
  ]
};

// Enhanced mock data for admin functionality
export const mockTeamSetups: TeamSetup[] = [
  {
    id: '1',
    name: 'India',
    shortName: 'IND',
    logo: '🇮🇳',
    players: mockPlayers.filter(p => p.team === 'India'),
    playingXI: mockPlayers.filter(p => p.team === 'India').slice(0, 11),
    captain: mockPlayers.find(p => p.name === 'Rohit Sharma') || null,
    viceCaptain: mockPlayers.find(p => p.name === 'Virat Kohli') || null,
    coach: 'Rahul Dravid'
  },
  {
    id: '2',
    name: 'Australia',
    shortName: 'AUS',
    logo: '🇦🇺',
    players: mockPlayers.filter(p => p.team === 'Australia'),
    playingXI: mockPlayers.filter(p => p.team === 'Australia').slice(0, 11),
    captain: mockPlayers.find(p => p.name === 'Pat Cummins') || null,
    viceCaptain: mockPlayers.find(p => p.name === 'Steve Smith') || null,
    coach: 'Andrew McDonald'
  },
  {
    id: '3',
    name: 'South Africa',
    shortName: 'SA',
    logo: '🇿🇦',
    players: mockPlayers.filter(p => p.team === 'South Africa'),
    playingXI: mockPlayers.filter(p => p.team === 'South Africa').slice(0, 11),
    captain: mockPlayers.find(p => p.name === 'Quinton de Kock') || null,
    viceCaptain: mockPlayers.find(p => p.name === 'Kagiso Rabada') || null,
    coach: 'Rob Walter'
  },
  {
    id: '4',
    name: 'New Zealand',
    shortName: 'NZ',
    logo: '🇳🇿',
    players: mockPlayers.filter(p => p.team === 'New Zealand'),
    playingXI: mockPlayers.filter(p => p.team === 'New Zealand').slice(0, 11),
    captain: mockPlayers.find(p => p.name === 'Kane Williamson') || null,
    viceCaptain: mockPlayers.find(p => p.name === 'Trent Boult') || null,
    coach: 'Gary Stead'
  },
  {
    id: '5',
    name: 'England',
    shortName: 'ENG',
    logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    players: mockPlayers.filter(p => p.team === 'England'),
    playingXI: mockPlayers.filter(p => p.team === 'England').slice(0, 11),
    captain: mockPlayers.find(p => p.name === 'Jos Buttler') || null,
    viceCaptain: mockPlayers.find(p => p.name === 'Ben Stokes') || null,
    coach: 'Matthew Mott'
  },
  {
    id: '6',
    name: 'Pakistan',
    shortName: 'PAK',
    logo: '🇵🇰',
    players: mockPlayers.filter(p => p.team === 'Pakistan'),
    playingXI: mockPlayers.filter(p => p.team === 'Pakistan').slice(0, 11),
    captain: mockPlayers.find(p => p.name === 'Babar Azam') || null,
    viceCaptain: mockPlayers.find(p => p.name === 'Shaheen Afridi') || null,
    coach: 'Grant Bradburn'
  }
];

// Mock match setup data for admin
export const mockMatchSetups: MatchSetup[] = [
  {
    id: 'setup-1',
    homeTeam: mockTeamSetups[0], // India
    awayTeam: mockTeamSetups[1], // Australia
    venue: 'Melbourne Cricket Ground',
    date: '2024-01-20T10:00:00Z',
    status: 'setup',
    tossResult: undefined
  },
  {
    id: 'setup-2',
    homeTeam: mockTeamSetups[2], // South Africa
    awayTeam: mockTeamSetups[3], // New Zealand
    venue: 'Newlands, Cape Town',
    date: '2024-01-21T14:00:00Z',
    status: 'toss',
    tossResult: {
      winner: 'home',
      winnerTeam: mockTeamSetups[2],
      decision: 'bat',
      electedTo: 'bat',
      timestamp: '2024-01-21T13:30:00Z'
    }
  },
  {
    id: 'setup-3',
    homeTeam: mockTeamSetups[4], // England
    awayTeam: mockTeamSetups[5], // Pakistan
    venue: 'Lord\'s, London',
    date: '2024-01-22T18:00:00Z',
    status: 'ready',
    tossResult: {
      winner: 'away',
      winnerTeam: mockTeamSetups[5],
      decision: 'bowl',
      electedTo: 'bowl',
      timestamp: '2024-01-22T17:30:00Z'
    }
  }
];

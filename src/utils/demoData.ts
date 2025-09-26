import { Team, Player, Match } from '../services/liveScoringService';

// Sample Players
export const samplePlayers: Player[] = [
  { id: '1', name: 'Virat Kohli', role: 'batsman' },
  { id: '2', name: 'Rohit Sharma', role: 'batsman' },
  { id: '3', name: 'MS Dhoni', role: 'wicket-keeper' },
  { id: '4', name: 'Jasprit Bumrah', role: 'bowler' },
  { id: '5', name: 'Ravindra Jadeja', role: 'all-rounder' },
  { id: '6', name: 'KL Rahul', role: 'batsman' },
  { id: '7', name: 'Hardik Pandya', role: 'all-rounder' },
  { id: '8', name: 'Mohammed Shami', role: 'bowler' },
  { id: '9', name: 'Yuzvendra Chahal', role: 'bowler' },
  { id: '10', name: 'Shikhar Dhawan', role: 'batsman' },
];

// Sample Teams
export const sampleTeams: Team[] = [
  {
    id: '1',
    name: 'Team India',
    players: samplePlayers.slice(0, 5),
    captain: '1',
    wicketKeeper: '3',
  },
  {
    id: '2',
    name: 'Team Australia',
    players: samplePlayers.slice(5, 10),
    captain: '6',
    wicketKeeper: '8',
  },
  {
    id: '3',
    name: 'Team England',
    players: samplePlayers.slice(0, 3).concat(samplePlayers.slice(5, 7)),
    captain: '2',
    wicketKeeper: '3',
  },
];

// Sample Matches
export const sampleMatches: Match[] = [
  {
    id: '1',
    name: 'India vs Australia',
    team1: sampleTeams[0],
    team2: sampleTeams[1],
    matchType: 'T20',
    totalOvers: 20,
    currentInnings: 1,
    status: 'upcoming',
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    createdBy: 'demo-user',
    isLive: false,
  },
  {
    id: '2',
    name: 'India vs England',
    team1: sampleTeams[0],
    team2: sampleTeams[2],
    matchType: 'ODI',
    totalOvers: 50,
    currentInnings: 1,
    status: 'live',
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    createdBy: 'demo-user',
    isLive: true,
  },
];

// Demo mode functions
export const initializeDemoData = async () => {
  console.log('🎮 Initializing demo data...');
  
  // This would normally save to Firebase, but for demo we'll just log
  console.log('✅ Demo players created:', samplePlayers.length);
  console.log('✅ Demo teams created:', sampleTeams.length);
  console.log('✅ Demo matches created:', sampleMatches.length);
  
  return {
    players: samplePlayers,
    teams: sampleTeams,
    matches: sampleMatches,
  };
};

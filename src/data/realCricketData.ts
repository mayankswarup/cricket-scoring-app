/**
 * Real Cricket Teams & Players Database
 * Professional cricket teams with real player names
 */

export interface CricketPlayer {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingStyle: 'right-handed' | 'left-handed';
  bowlingStyle: 'right-arm fast' | 'right-arm medium' | 'left-arm fast' | 'left-arm medium' | 'right-arm off-spin' | 'left-arm orthodox' | 'leg-spin' | 'off-spin';
  isCaptain: boolean;
  isWicketKeeper: boolean;
}

export interface CricketTeam {
  id: string;
  name: string;
  shortName: string;
  city: string;
  logo: string;
  players: CricketPlayer[];
}

// Real Cricket Teams with Professional Players
export const REAL_CRICKET_TEAMS: CricketTeam[] = [
  {
    id: 'mumbai-indians',
    name: 'Mumbai Indians',
    shortName: 'MI',
    city: 'Mumbai',
    logo: '🏏',
    players: [
      { id: 'rohit-sharma', name: 'Rohit Sharma', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: true, isWicketKeeper: false },
      { id: 'suryakumar-yadav', name: 'Suryakumar Yadav', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'ishan-kishan', name: 'Ishan Kishan', role: 'wicket-keeper', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
      { id: 'tilak-varma', name: 'Tilak Varma', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'hardik-pandya', name: 'Hardik Pandya', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'jasprit-bumrah', name: 'Jasprit Bumrah', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'jason-behrendorff', name: 'Jason Behrendorff', role: 'bowler', battingStyle: 'left-handed', bowlingStyle: 'left-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'piyush-chawla', name: 'Piyush Chawla', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'leg-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'akash-madwal', name: 'Akash Madwal', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'kumar-kartikeya', name: 'Kumar Kartikeya', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'nehal-wadhera', name: 'Nehal Wadhera', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'vishnu-vinod', name: 'Vishnu Vinod', role: 'wicket-keeper', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
    ]
  },
  {
    id: 'chennai-super-kings',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    city: 'Chennai',
    logo: '🦁',
    players: [
      { id: 'ms-dhoni', name: 'MS Dhoni', role: 'wicket-keeper', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: true, isWicketKeeper: true },
      { id: 'ruturaj-gaikwad', name: 'Ruturaj Gaikwad', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'devon-conway', name: 'Devon Conway', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'ajinkya-rahane', name: 'Ajinkya Rahane', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'ambati-rayudu', name: 'Ambati Rayudu', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'ravindra-jadeja', name: 'Ravindra Jadeja', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'moeen-ali', name: 'Moeen Ali', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'deepak-chahar', name: 'Deepak Chahar', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'tushar-deshpande', name: 'Tushar Deshpande', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'maheesh-theekshana', name: 'Maheesh Theekshana', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'matheesha-pathirana', name: 'Matheesha Pathirana', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'ben-stokes', name: 'Ben Stokes', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
    ]
  },
  {
    id: 'royal-challengers-bangalore',
    name: 'Royal Challengers Bangalore',
    shortName: 'RCB',
    city: 'Bangalore',
    logo: '👑',
    players: [
      { id: 'faf-du-plessis', name: 'Faf du Plessis', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm leg-spin', isCaptain: true, isWicketKeeper: false },
      { id: 'virat-kohli', name: 'Virat Kohli', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'glenn-maxwell', name: 'Glenn Maxwell', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'rajat-patidar', name: 'Rajat Patidar', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'dinesh-karthik', name: 'Dinesh Karthik', role: 'wicket-keeper', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
      { id: 'mahipal-lomror', name: 'Mahipal Lomror', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'anuj-rawat', name: 'Anuj Rawat', role: 'wicket-keeper', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
      { id: 'harshal-patel', name: 'Harshal Patel', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'karn-sharma', name: 'Karn Sharma', role: 'bowler', battingStyle: 'left-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'mohammed-siraj', name: 'Mohammed Siraj', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'josh-hazlewood', name: 'Josh Hazlewood', role: 'bowler', battingStyle: 'left-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'wanindu-hasaranga', name: 'Wanindu Hasaranga', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'leg-spin', isCaptain: false, isWicketKeeper: false },
    ]
  },
  {
    id: 'delhi-capitals',
    name: 'Delhi Capitals',
    shortName: 'DC',
    city: 'Delhi',
    logo: '🏛️',
    players: [
      { id: 'david-warner', name: 'David Warner', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm leg-spin', isCaptain: true, isWicketKeeper: false },
      { id: 'prithvi-shaw', name: 'Prithvi Shaw', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'yash-dhull', name: 'Yash Dhull', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'manish-pandey', name: 'Manish Pandey', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'rishabh-pant', name: 'Rishabh Pant', role: 'wicket-keeper', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
      { id: 'axar-patel', name: 'Axar Patel', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'lalit-yadav', name: 'Lalit Yadav', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'kagiso-rabada', name: 'Kagiso Rabada', role: 'bowler', battingStyle: 'left-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'anrich-nortje', name: 'Anrich Nortje', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'kuldeep-yadav', name: 'Kuldeep Yadav', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'left-arm chinaman', isCaptain: false, isWicketKeeper: false },
      { id: 'chetan-sakariya', name: 'Chetan Sakariya', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'left-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'khaleel-ahmed', name: 'Khaleel Ahmed', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'left-arm medium', isCaptain: false, isWicketKeeper: false },
    ]
  },
  {
    id: 'kolkata-knight-riders',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    city: 'Kolkata',
    logo: '⚡',
    players: [
      { id: 'nitish-rana', name: 'Nitish Rana', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: true, isWicketKeeper: false },
      { id: 'venkatesh-iyer', name: 'Venkatesh Iyer', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'shreyas-iyer', name: 'Shreyas Iyer', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm leg-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'andre-russell', name: 'Andre Russell', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'sunil-narine', name: 'Sunil Narine', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'shardul-thakur', name: 'Shardul Thakur', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'varun-chakravarthy', name: 'Varun Chakravarthy', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm leg-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'umesh-yadav', name: 'Umesh Yadav', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'tim-southee', name: 'Tim Southee', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'lockie-ferguson', name: 'Lockie Ferguson', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'pat-cummins', name: 'Pat Cummins', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'sheldon-jackson', name: 'Sheldon Jackson', role: 'wicket-keeper', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
    ]
  }
];

// Helper functions
export const getTeamById = (teamId: string): CricketTeam | undefined => {
  return REAL_CRICKET_TEAMS.find(team => team.id === teamId);
};

export const getPlayerById = (teamId: string, playerId: string): CricketPlayer | undefined => {
  const team = getTeamById(teamId);
  return team?.players.find(player => player.id === playerId);
};

export const getTeamPlayers = (teamId: string): CricketPlayer[] => {
  const team = getTeamById(teamId);
  return team?.players || [];
};

export const getBatsmen = (teamId: string): CricketPlayer[] => {
  return getTeamPlayers(teamId).filter(player => 
    player.role === 'batsman' || player.role === 'all-rounder' || player.role === 'wicket-keeper'
  );
};

export const getBowlers = (teamId: string): CricketPlayer[] => {
  return getTeamPlayers(teamId).filter(player => 
    player.role === 'bowler' || player.role === 'all-rounder'
  );
};

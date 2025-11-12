import { liveScoringService, Team, Player } from '../src/services/liveScoringService';

interface TeamSeedConfig {
  name: string;
  shortName: string;
  city: string;
  slug: string;
  playerNames: string[];
}

const ROLE_SEQUENCE: Player['role'][] = [
  'batsman',
  'batsman',
  'batsman',
  'all-rounder',
  'batsman',
  'all-rounder',
  'bowler',
  'bowler',
  'bowler',
  'bowler',
  'wicket-keeper',
  'all-rounder',
  'bowler',
];

const BATTING_STYLES = ['Right-hand bat', 'Left-hand bat'];
const BOWLING_STYLES = ['Right-arm medium', 'Left-arm orthodox', 'Right-arm offbreak', 'Right-arm legbreak'];

const TEAM_CONFIGS: TeamSeedConfig[] = [
  {
    name: 'Maveric 11',
    shortName: 'MAV',
    city: 'Bengaluru',
    slug: 'maveric-11',
    playerNames: [
      'Pawan Singh',
      'Nikhil Rao',
      'Vinay Kumar',
      'Avinash Reddy',
      'Rahul Desai',
      'Kiran Patil',
      'Sameer Joshi',
      'Aditya Chauhan',
      'Ravi Sharma',
      'Vikas Menon',
      'Sunil Mehta',
      'Akshay Verma',
      'Deepak Kulkarni',
    ],
  },
  {
    name: 'Chennai 11',
    shortName: 'CHE',
    city: 'Chennai',
    slug: 'chennai-11',
    playerNames: [
      'Daniel Roberts',
      'Michael Harris',
      'George Matthews',
      'Liam Parker',
      'Ethan Clarke',
      'Noah Mitchell',
      'Oliver Foster',
      'Jacob Wright',
      'Lucas Turner',
      'Henry Collins',
      'Aiden Brooks',
      'Mason Hughes',
      'Logan Perry',
    ],
  },
];

const generatePlayer = (teamSlug: string, index: number, name: string): Player => {
  const role = ROLE_SEQUENCE[index % ROLE_SEQUENCE.length];
  const normalizedName = name.trim();
  const [firstName] = normalizedName.split(' ');

  return {
    id: `${teamSlug}-player-${index + 1}`,
    name: normalizedName,
    shortName: firstName || normalizedName,
    role,
    battingStyle: BATTING_STYLES[index % BATTING_STYLES.length],
    bowlingStyle: BOWLING_STYLES[index % BOWLING_STYLES.length],
    nationality: role === 'wicket-keeper' ? 'Sri Lanka' : 'India',
    jerseyNumber: 11 + index,
    isCaptain: index === 0,
    isWicketKeeper: role === 'wicket-keeper',
  };
};

const buildTeamPayload = (config: TeamSeedConfig): Omit<Team, 'id'> => {
  const players = config.playerNames.map((name, index) => generatePlayer(config.slug, index, name));

  return {
    name: config.name,
    shortName: config.shortName,
    city: config.city,
    slug: config.slug,
    logo: '',
    players,
    captain: players.find((player) => player.isCaptain)?.id,
    wicketKeeper: players.find((player) => player.isWicketKeeper)?.id,
    coach: `${config.name} Coach`,
  };
};

const seedTeams = async () => {
  try {
    console.log('🚀 Seeding manual test teams into Firestore...');
    const existingTeams = await liveScoringService.getAllTeams();
    const existingByName = new Map(existingTeams.map((team) => [team.name.toLowerCase(), team]));

    for (const config of TEAM_CONFIGS) {
      const payload = buildTeamPayload(config);
      const existing = existingByName.get(config.name.toLowerCase());

      if (existing) {
        console.log(`♻️  Updating existing team: ${config.name} (${existing.id})`);
        await liveScoringService.updateTeam(existing.id, payload);
      } else {
        console.log(`✨ Creating new team: ${config.name}`);
        const teamId = await liveScoringService.createTeam(payload);
        console.log(`✅ Created team ${config.name} with id ${teamId}`);
      }
    }

    console.log('✅ Team seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed teams:', error);
    process.exit(1);
  }
};

seedTeams();


import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC7tD1DO6GnqZOkBmqC15Jo4G_Ta_YG8NY',
  authDomain: 'cricket-app-7d4b5.firebaseapp.com',
  projectId: 'cricket-app-7d4b5',
  storageBucket: 'cricket-app-7d4b5.firebasestorage.app',
  messagingSenderId: '485455094442',
  appId: '1:485455094442:web:1fbe251ed871531fd026d3',
  measurementId: 'G-ZH58CWQQPT',
};

const ROLE_SEQUENCE = [
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

const TEAM_CONFIGS = [
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const generatePlayer = (teamSlug, index, name) => {
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

const buildTeamPayload = (config) => {
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
    console.log('🚀 Connecting to Firestore...');
    const teamsCollection = collection(db, 'teams');
    const snapshot = await getDocs(teamsCollection);
    const existingByName = new Map(snapshot.docs.map((docSnap) => [docSnap.data().name?.toLowerCase(), { id: docSnap.id, data: docSnap.data() }]));

    for (const config of TEAM_CONFIGS) {
      const payload = buildTeamPayload(config);
      const existing = existingByName.get(config.name.toLowerCase());

      if (existing) {
        console.log(`♻️  Updating existing team: ${config.name} (${existing.id})`);
        await setDoc(doc(db, 'teams', existing.id), payload, { merge: true });
      } else {
        console.log(`✨ Creating new team: ${config.name}`);
        await addDoc(teamsCollection, payload);
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


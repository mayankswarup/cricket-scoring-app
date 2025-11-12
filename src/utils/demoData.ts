import { collection, doc, getDoc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { REAL_CRICKET_TEAMS, CricketTeam } from '../data/realCricketData';
export const MANUAL_TEST_TEAMS: CricketTeam[] = [
  {
    id: 'maveric-11',
    name: 'Maveric 11',
    shortName: 'MAV',
    city: 'Bengaluru',
    logo: '⭐️',
    players: [
      { id: 'maveric-11-pawan-singh', name: 'Pawan Singh', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: true, isWicketKeeper: false },
      { id: 'maveric-11-nikhil-rao', name: 'Nikhil Rao', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-vinay-kumar', name: 'Vinay Kumar', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-avinash-reddy', name: 'Avinash Reddy', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-rahul-desai', name: 'Rahul Desai', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-kiran-patil', name: 'Kiran Patil', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-sameer-joshi', name: 'Sameer Joshi', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-aditya-chauhan', name: 'Aditya Chauhan', role: 'bowler', battingStyle: 'left-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-ravi-sharma', name: 'Ravi Sharma', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'leg-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-vikas-menon', name: 'Vikas Menon', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-sunil-mehta', name: 'Sunil Mehta', role: 'wicket-keeper', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
      { id: 'maveric-11-akshay-verma', name: 'Akshay Verma', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'maveric-11-deepak-kulkarni', name: 'Deepak Kulkarni', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'off-spin', isCaptain: false, isWicketKeeper: false },
    ],
  },
  {
    id: 'chennai-11',
    name: 'Chennai 11',
    shortName: 'CHE',
    city: 'Chennai',
    logo: '🌟',
    players: [
      { id: 'chennai-11-daniel-roberts', name: 'Daniel Roberts', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: true, isWicketKeeper: false },
      { id: 'chennai-11-michael-harris', name: 'Michael Harris', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-george-matthews', name: 'George Matthews', role: 'batsman', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-liam-parker', name: 'Liam Parker', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-ethan-clarke', name: 'Ethan Clarke', role: 'batsman', battingStyle: 'left-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-noah-mitchell', name: 'Noah Mitchell', role: 'all-rounder', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-oliver-foster', name: 'Oliver Foster', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm fast', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-jacob-wright', name: 'Jacob Wright', role: 'bowler', battingStyle: 'left-handed', bowlingStyle: 'left-arm orthodox', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-lucas-turner', name: 'Lucas Turner', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'leg-spin', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-henry-collins', name: 'Henry Collins', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-aiden-brooks', name: 'Aiden Brooks', role: 'wicket-keeper', battingStyle: 'right-handed', bowlingStyle: 'right-arm off-spin', isCaptain: false, isWicketKeeper: true },
      { id: 'chennai-11-mason-hughes', name: 'Mason Hughes', role: 'all-rounder', battingStyle: 'left-handed', bowlingStyle: 'right-arm medium', isCaptain: false, isWicketKeeper: false },
      { id: 'chennai-11-logan-perry', name: 'Logan Perry', role: 'bowler', battingStyle: 'right-handed', bowlingStyle: 'off-spin', isCaptain: false, isWicketKeeper: false },
    ],
  },
];

import { db } from '../config/firebase';
import { APP_CONFIG } from '../config/appConfig';
import { Player, Team } from '../services/liveScoringService';

interface SeedResult {
  teamsCreated: number;
  teamsUpdated: number;
  playersCreated: number;
  playersUpdated: number;
}

const { TEAMS, PLAYERS } = APP_CONFIG.FIREBASE.COLLECTIONS;

const buildPlayerPayload = (player: any, teamId: string) => {
  const playerData = player as Record<string, any>;

  const payload: any = {
    id: player.id,
    name: player.name,
    role: player.role,
    battingStyle: player.battingStyle || null,
    bowlingStyle: player.bowlingStyle || null,
    nationality: playerData.nationality || null,
    shortName: playerData.shortName || player.name,
    jerseyNumber: playerData.jerseyNumber || null,
    isCaptain: !!player.isCaptain,
    isWicketKeeper: !!player.isWicketKeeper,
    teams: arrayUnion(teamId),
    updatedAt: serverTimestamp(),
  };

  if (player.stats) {
    payload.stats = player.stats;
  }

  return payload;
};

const buildTeamPayload = (team: any, players: Player[]): Partial<Team> & Record<string, any> => ({
  id: team.id,
  slug: team.id,
  name: team.name,
  shortName: team.shortName,
  logo: team.logo,
  city: team.city,
  coach: team.coach || null,
  captain: team.players.find((player: any) => player.isCaptain)?.id || players[0]?.id,
  wicketKeeper:
    team.players.find((player: any) => player.isWicketKeeper)?.id ||
    players.find((p) => p.role === 'wicket-keeper')?.id ||
    null,
  players,
  updatedAt: serverTimestamp(),
});

export const initializeDemoData = async (): Promise<SeedResult> => {
  console.log('🎮 Seeding professional team data to Firestore...');

  const teamsCollection = collection(db, TEAMS);
  const playersCollection = collection(db, PLAYERS);

  const result: SeedResult = {
    teamsCreated: 0,
    teamsUpdated: 0,
    playersCreated: 0,
    playersUpdated: 0,
  };

  const targetTeams = [...REAL_CRICKET_TEAMS.slice(0, 5), ...MANUAL_TEST_TEAMS];

  for (const team of targetTeams) {
    const teamDocRef = doc(teamsCollection, team.id);
    const teamSnapshot = await getDoc(teamDocRef);

    const normalizedPlayers: Player[] = [];

    for (const player of team.players) {
      const playerDocRef = doc(playersCollection, player.id);
      const playerSnapshot = await getDoc(playerDocRef);

      const payload = buildPlayerPayload(player, team.id);
      if (!playerSnapshot.exists()) {
        payload.createdAt = serverTimestamp();
        await setDoc(playerDocRef, payload, { merge: true });
        result.playersCreated += 1;
      } else {
        await setDoc(playerDocRef, payload, { merge: true });
        result.playersUpdated += 1;
      }

      normalizedPlayers.push({
        id: player.id,
        name: player.name,
        role: player.role,
        battingStyle: player.battingStyle,
        bowlingStyle: player.bowlingStyle,
        shortName: (player as any).shortName || player.name,
        nationality: (player as any).nationality,
        jerseyNumber: (player as any).jerseyNumber,
        isCaptain: player.isCaptain,
        isWicketKeeper: player.isWicketKeeper,
      });
    }

    const teamPayload = buildTeamPayload(team, normalizedPlayers);
    if (!teamSnapshot.exists()) {
      teamPayload.createdAt = serverTimestamp();
      await setDoc(teamDocRef, teamPayload, { merge: true });
      result.teamsCreated += 1;
    } else {
      await setDoc(teamDocRef, teamPayload, { merge: true });
      result.teamsUpdated += 1;
    }
  }

  console.log(`✅ Teams created: ${result.teamsCreated}, updated: ${result.teamsUpdated}`);
  console.log(`✅ Players created: ${result.playersCreated}, updated: ${result.playersUpdated}`);

  return result;
};

// API Service for Cricket App
import { APP_CONFIG } from '../constants';
import { Match, Player, Team, News } from '../types';
import { 
  mockLiveMatches, 
  mockTeams, 
  mockPlayers, 
  mockCurrentBatsmen, 
  mockCurrentBowlers, 
  mockScorecardData, 
  mockRecentBalls 
} from '../data/mockData';

// CricketAPI.com response types
interface CricketApiMatch {
  id: string;
  name: string;
  short_name: string;
  status: string;
  status_note: string;
  game_type: string;
  season: string;
  date: string;
  dateTimeGMT: string;
  venue: string;
  home: CricketApiTeam;
  away: CricketApiTeam;
  live: boolean;
  result: string;
  winning_team_id: string;
  commentary: boolean;
  wagon: boolean;
  latest_inning_number: number;
  toss: {
    text: string;
    winner: string;
    decision: string;
  };
  score: CricketApiScore[];
}

interface CricketApiTeam {
  id: string;
  name: string;
  short_name: string;
  logo_url: string;
}

interface CricketApiScore {
  id: string;
  inning_number: number;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  run_rate: number;
  required_run_rate: number;
  target: number;
}

class ApiService {
  private baseUrl: string;
  private cricketApiBaseUrl: string;
  private cricketApiKey: string;
  private useRealData: boolean;

  constructor() {
    this.baseUrl = APP_CONFIG.apiBaseUrl;
    this.cricketApiBaseUrl = APP_CONFIG.cricketApiBaseUrl;
    this.cricketApiKey = APP_CONFIG.cricketApiKey;
    this.useRealData = APP_CONFIG.useRealData;
  }

  // Generic API call method
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // CricketAPI.com specific request method
  private async makeCricketApiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      if (!this.cricketApiKey) {
        throw new Error('CricketAPI key not configured');
      }

      const response = await fetch(`${this.cricketApiBaseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.cricketApiKey,
          'X-RapidAPI-Host': 'cricketapi.com',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`CricketAPI Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CricketAPI Request failed:', error);
      throw error;
    }
  }

  // Data transformation methods
  private transformFreeApiMatch(apiMatch: any): Match {
    const homeTeam: Team = {
      id: apiMatch.home_team?.id || '1',
      name: apiMatch.home_team?.name || 'Team A',
      shortName: apiMatch.home_team?.short_name || 'TEA',
      logo: apiMatch.home_team?.logo || '🏏',
      players: [],
      captain: '',
      coach: ''
    };

    const awayTeam: Team = {
      id: apiMatch.away_team?.id || '2',
      name: apiMatch.away_team?.name || 'Team B',
      shortName: apiMatch.away_team?.short_name || 'TEB',
      logo: apiMatch.away_team?.logo || '🏏',
      players: [],
      captain: '',
      coach: ''
    };

    // Determine match status
    let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
    if (apiMatch.status === 'live' || apiMatch.status === 'in_progress') {
      status = 'live';
    } else if (apiMatch.status === 'completed' || apiMatch.status === 'finished') {
      status = 'completed';
    }

    // Transform score data
    let matchScore;
    if (apiMatch.score) {
      matchScore = {
        homeTeam: {
          runs: apiMatch.score.home_runs || 0,
          wickets: apiMatch.score.home_wickets || 0,
          overs: apiMatch.score.home_overs || 0
        },
        awayTeam: {
          runs: apiMatch.score.away_runs || 0,
          wickets: apiMatch.score.away_wickets || 0,
          overs: apiMatch.score.away_overs || 0
        },
        currentInnings: apiMatch.score.current_innings === 'home' ? 'home' : 'away' as 'home' | 'away',
        target: apiMatch.score.target || undefined
      };
    }

    return {
      id: apiMatch.id || Math.random().toString(),
      homeTeam,
      awayTeam,
      venue: apiMatch.venue || 'TBD',
      date: apiMatch.date || new Date().toISOString(),
      status,
      score: matchScore
    };
  }

  private transformCricketApiMatch(apiMatch: CricketApiMatch): Match {
    const homeTeam: Team = {
      id: apiMatch.home.id,
      name: apiMatch.home.name,
      shortName: apiMatch.home.short_name,
      logo: apiMatch.home.logo_url || '🏏',
      players: [],
      captain: '',
      coach: ''
    };

    const awayTeam: Team = {
      id: apiMatch.away.id,
      name: apiMatch.away.name,
      shortName: apiMatch.away.short_name,
      logo: apiMatch.away.logo_url || '🏏',
      players: [],
      captain: '',
      coach: ''
    };

    // Determine match status
    let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
    if (apiMatch.live) {
      status = 'live';
    } else if (apiMatch.status === 'completed' || apiMatch.result) {
      status = 'completed';
    }

    // Transform score data
    let matchScore;
    if (apiMatch.score && apiMatch.score.length > 0) {
      const latestScore = apiMatch.score[apiMatch.score.length - 1];
      const previousScore = apiMatch.score.length > 1 ? apiMatch.score[apiMatch.score.length - 2] : null;

      matchScore = {
        homeTeam: {
          runs: latestScore.inning_number === 1 ? latestScore.runs : (previousScore?.runs || 0),
          wickets: latestScore.inning_number === 1 ? latestScore.wickets : (previousScore?.wickets || 0),
          overs: latestScore.inning_number === 1 ? latestScore.overs : (previousScore?.overs || 0)
        },
        awayTeam: {
          runs: latestScore.inning_number === 2 ? latestScore.runs : (previousScore?.runs || 0),
          wickets: latestScore.inning_number === 2 ? latestScore.wickets : (previousScore?.wickets || 0),
          overs: latestScore.inning_number === 2 ? latestScore.overs : (previousScore?.overs || 0)
        },
        currentInnings: latestScore.inning_number === 1 ? 'home' : 'away' as 'home' | 'away',
        target: latestScore.target || undefined
      };
    }

    return {
      id: apiMatch.id,
      homeTeam,
      awayTeam,
      venue: apiMatch.venue,
      date: apiMatch.dateTimeGMT,
      status,
      score: matchScore
    };
  }

  // Match related API calls
  async getMatches(): Promise<Match[]> {
    if (!this.useRealData) {
      return mockLiveMatches;
    }

    try {
      const response = await this.makeCricketApiRequest<{data: CricketApiMatch[]}>('/matches');
      return response.data.map(match => this.transformCricketApiMatch(match));
    } catch (error) {
      console.warn('Failed to fetch real matches, falling back to mock data:', error);
      return mockLiveMatches;
    }
  }

  async getMatchById(id: string): Promise<Match> {
    if (!this.useRealData) {
      return mockLiveMatches.find(match => match.id === id) || mockLiveMatches[0];
    }

    try {
      const response = await this.makeCricketApiRequest<{data: CricketApiMatch}>(`/match/${id}`);
      return this.transformCricketApiMatch(response.data);
    } catch (error) {
      console.warn('Failed to fetch real match, falling back to mock data:', error);
      return mockLiveMatches.find(match => match.id === id) || mockLiveMatches[0];
    }
  }

  async getLiveMatches(): Promise<Match[]> {
    if (!this.useRealData) {
      return mockLiveMatches.filter(match => match.status === 'live');
    }

    try {
      const response = await this.makeCricketApiRequest<{data: CricketApiMatch[]}>('/matches/live');
      return response.data.map(match => this.transformCricketApiMatch(match));
    } catch (error) {
      console.warn('Failed to fetch real live matches, falling back to mock data:', error);
      return mockLiveMatches.filter(match => match.status === 'live');
    }
  }

  // Free cricket API method (no authentication required)
  private async makeFreeCricketApiRequest<T>(endpoint: string): Promise<T> {
    try {
      // Try a different free cricket API that doesn't have CORS issues
      const response = await fetch(`https://api.cricapi.com/v1/matches?apikey=YOUR_API_KEY&offset=0`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Free Cricket API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Free Cricket API Request failed:', error);
      throw error;
    }
  }

  // Generate realistic mock data that simulates real cricket data
  private generateRealisticMockData(): Match[] {
    const currentDate = new Date();
    const matches: Match[] = [];
    
    // Generate some realistic Asia Cup matches
    const asiaCupTeams = [
      { id: '1', name: 'India', shortName: 'IND', logo: '🇮🇳' },
      { id: '2', name: 'Pakistan', shortName: 'PAK', logo: '🇵🇰' },
      { id: '3', name: 'Sri Lanka', shortName: 'SL', logo: '🇱🇰' },
      { id: '4', name: 'Bangladesh', shortName: 'BAN', logo: '🇧🇩' },
      { id: '5', name: 'Afghanistan', shortName: 'AFG', logo: '🇦🇫' },
      { id: '6', name: 'Nepal', shortName: 'NEP', logo: '🇳🇵' },
      { id: '7', name: 'Hong Kong', shortName: 'HK', logo: '🇭🇰' },
      { id: '8', name: 'UAE', shortName: 'UAE', logo: '🇦🇪' }
    ];

    // Create some exciting Asia Cup matches
    const excitingMatches = [
      {
        home: asiaCupTeams[0], // India
        away: asiaCupTeams[1], // Pakistan
        venue: 'Dubai International Stadium',
        status: 'live' as const,
        score: {
          homeTeam: { runs: 168, wickets: 4, overs: 19.1 },
          awayTeam: { runs: 165, wickets: 7, overs: 20.0 },
          currentInnings: 'home' as const,
          target: 166
        }
      },
      {
        home: asiaCupTeams[2], // Sri Lanka
        away: asiaCupTeams[3], // Bangladesh
        venue: 'Sharjah Cricket Stadium',
        status: 'upcoming' as const,
        score: undefined
      },
      {
        home: asiaCupTeams[4], // Afghanistan
        away: asiaCupTeams[6], // Hong Kong
        venue: 'Abu Dhabi Cricket Stadium',
        status: 'completed' as const,
        score: {
          homeTeam: { runs: 195, wickets: 5, overs: 20.0 },
          awayTeam: { runs: 142, wickets: 10, overs: 18.3 },
          currentInnings: 'away' as const,
          target: 196
        }
      }
    ];

    excitingMatches.forEach((matchData, i) => {
      const match: Match = {
        id: `asia-cup-${i + 1}`,
        homeTeam: {
          ...matchData.home,
          players: [],
          captain: '',
          coach: ''
        },
        awayTeam: {
          ...matchData.away,
          players: [],
          captain: '',
          coach: ''
        },
        venue: matchData.venue,
        date: new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
        status: matchData.status,
        score: matchData.score
      };
      
      matches.push(match);
    });
    
    return matches;
  }

  // Asia Cup specific methods
  async getAsiaCupMatches(): Promise<Match[]> {
    console.log('🔍 getAsiaCupMatches called');
    console.log('🔑 API Key configured:', !!this.cricketApiKey);
    console.log('🌐 Use Real Data:', this.useRealData);
    
    if (!this.useRealData) {
      console.log('📱 Using mock data (useRealData is false)');
      return mockLiveMatches;
    }

    // For now, use realistic mock data since free APIs have CORS issues
    console.log('🚀 Generating realistic Asia Cup mock data...');
    const realisticMatches = this.generateRealisticMockData();
    console.log('✅ Generated realistic mock data:', realisticMatches.length, 'matches');
    
    return realisticMatches;
  }

  async getAsiaCupLiveMatches(): Promise<Match[]> {
    if (!this.useRealData) {
      return mockLiveMatches.filter(match => match.status === 'live');
    }

    try {
      const response = await this.makeCricketApiRequest<{data: CricketApiMatch[]}>('/matches/live?competition=asia-cup');
      return response.data.map(match => this.transformCricketApiMatch(match));
    } catch (error) {
      console.warn('Failed to fetch Asia Cup live matches, falling back to mock data:', error);
      return mockLiveMatches.filter(match => match.status === 'live');
    }
  }

  // Team related API calls
  async getTeams(): Promise<Team[]> {
    if (!this.useRealData) {
      return mockTeams;
    }

    try {
      const response = await this.makeCricketApiRequest<{data: any[]}>('/teams');
      // Transform API response to our Team interface
      return response.data.map(team => ({
        id: team.id,
        name: team.name,
        shortName: team.short_name,
        logo: team.logo_url || '🏏',
        players: [],
        captain: team.captain || '',
        coach: team.coach || ''
      }));
    } catch (error) {
      console.warn('Failed to fetch real teams, falling back to mock data:', error);
      return mockTeams;
    }
  }

  async getTeamById(id: string): Promise<Team> {
    if (!this.useRealData) {
      return mockTeams.find(team => team.id === id) || mockTeams[0];
    }

    try {
      const response = await this.makeCricketApiRequest<{data: any}>(`/team/${id}`);
      const team = response.data;
      return {
        id: team.id,
        name: team.name,
        shortName: team.short_name,
        logo: team.logo_url || '🏏',
        players: [],
        captain: team.captain || '',
        coach: team.coach || ''
      };
    } catch (error) {
      console.warn('Failed to fetch real team, falling back to mock data:', error);
      return mockTeams.find(team => team.id === id) || mockTeams[0];
    }
  }

  // Player related API calls
  async getPlayers(): Promise<Player[]> {
    if (!this.useRealData) {
      return mockPlayers;
    }

    try {
      const response = await this.makeCricketApiRequest<{data: any[]}>('/players');
      // Transform API response to our Player interface
      return response.data.map(player => ({
        id: player.id,
        name: player.name,
        team: player.team_name || '',
        role: this.mapPlayerRole(player.role),
        battingStyle: player.batting_style || 'right-handed',
        bowlingStyle: player.bowling_style,
        stats: {
          matches: player.matches || 0,
          runs: player.runs || 0,
          wickets: player.wickets || 0,
          average: player.average || 0,
          strikeRate: player.strike_rate || 0
        }
      }));
    } catch (error) {
      console.warn('Failed to fetch real players, falling back to mock data:', error);
      return mockPlayers;
    }
  }

  async getPlayerById(id: string): Promise<Player> {
    if (!this.useRealData) {
      return mockPlayers.find(player => player.id === id) || mockPlayers[0];
    }

    try {
      const response = await this.makeCricketApiRequest<{data: any}>(`/player/${id}`);
      const player = response.data;
      return {
        id: player.id,
        name: player.name,
        team: player.team_name || '',
        role: this.mapPlayerRole(player.role),
        battingStyle: player.batting_style || 'right-handed',
        bowlingStyle: player.bowling_style,
        stats: {
          matches: player.matches || 0,
          runs: player.runs || 0,
          wickets: player.wickets || 0,
          average: player.average || 0,
          strikeRate: player.strike_rate || 0
        }
      };
    } catch (error) {
      console.warn('Failed to fetch real player, falling back to mock data:', error);
      return mockPlayers.find(player => player.id === id) || mockPlayers[0];
    }
  }

  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    if (!this.useRealData) {
      return mockPlayers.filter(player => player.team === teamId);
    }

    try {
      const response = await this.makeCricketApiRequest<{data: any[]}>(`/team/${teamId}/players`);
      return response.data.map(player => ({
        id: player.id,
        name: player.name,
        team: player.team_name || '',
        role: this.mapPlayerRole(player.role),
        battingStyle: player.batting_style || 'right-handed',
        bowlingStyle: player.bowling_style,
        stats: {
          matches: player.matches || 0,
          runs: player.runs || 0,
          wickets: player.wickets || 0,
          average: player.average || 0,
          strikeRate: player.strike_rate || 0
        }
      }));
    } catch (error) {
      console.warn('Failed to fetch real team players, falling back to mock data:', error);
      return mockPlayers.filter(player => player.team === teamId);
    }
  }

  // Helper method to map API player roles to our interface
  private mapPlayerRole(apiRole: string): 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper' {
    const roleMap: {[key: string]: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper'} = {
      'batsman': 'batsman',
      'bowler': 'bowler',
      'allrounder': 'all-rounder',
      'all-rounder': 'all-rounder',
      'wicketkeeper': 'wicket-keeper',
      'wicket-keeper': 'wicket-keeper',
      'keeper': 'wicket-keeper'
    };
    return roleMap[apiRole?.toLowerCase()] || 'batsman';
  }

  // News related API calls (keeping mock data for now as CricketAPI.com may not have news)
  async getNews(): Promise<News[]> {
    // For now, return empty array as CricketAPI.com focuses on match data
    return [];
  }

  async getNewsById(id: string): Promise<News> {
    throw new Error('News API not implemented with CricketAPI.com');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

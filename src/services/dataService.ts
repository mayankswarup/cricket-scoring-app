// Production-Ready Data Service
// This service simulates a real database and can be easily replaced with actual API calls

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  PlayerRegistration, 
  TeamCreation, 
  Match, 
  Tournament 
} from '../types';

// Data Service Interface
interface DataService {
  // User Operations
  createUser(user: PlayerRegistration): Promise<PlayerRegistration>;
  getUserById(id: string): Promise<PlayerRegistration | null>;
  updateUser(id: string, updates: Partial<PlayerRegistration>): Promise<PlayerRegistration>;
  deleteUser(id: string): Promise<boolean>;
  
  // Team Operations
  createTeam(team: TeamCreation): Promise<TeamCreation>;
  getTeamById(id: string): Promise<TeamCreation | null>;
  updateTeam(id: string, updates: Partial<TeamCreation>): Promise<TeamCreation>;
  deleteTeam(id: string): Promise<boolean>;
  getTeamsByOwner(ownerId: string): Promise<TeamCreation[]>;
  
  // Tournament Operations
  createTournament(tournament: Tournament): Promise<Tournament>;
  getTournamentById(id: string): Promise<Tournament | null>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament>;
  deleteTournament(id: string): Promise<boolean>;
  getTournamentsByOrganizer(organizerId: string): Promise<Tournament[]>;
  
  // Match Operations
  createMatch(match: Match): Promise<Match>;
  getMatchById(id: string): Promise<Match | null>;
  updateMatch(id: string, updates: Partial<Match>): Promise<Match>;
  deleteMatch(id: string): Promise<boolean>;
  getMatchesByTournament(tournamentId: string): Promise<Match[]>;
  
  // Search Operations
  searchUsers(query: string): Promise<PlayerRegistration[]>;
  searchTeams(query: string): Promise<TeamCreation[]>;
  searchTournaments(query: string): Promise<Tournament[]>;
}

class ProductionDataService implements DataService {
  private storageKey = 'cricket_app_data';
  private data: {
    users: Map<string, PlayerRegistration>;
    teams: Map<string, TeamCreation>;
    tournaments: Map<string, Tournament>;
    matches: Map<string, Match>;
  };

  constructor() {
    this.data = {
      users: new Map(),
      teams: new Map(),
      tournaments: new Map(),
      matches: new Map(),
    };
    this.loadData();
  }

  // Load data from AsyncStorage
  private async loadData(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(this.storageKey);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        this.data.users = new Map(parsed.users || []);
        this.data.teams = new Map(parsed.teams || []);
        this.data.tournaments = new Map(parsed.tournaments || []);
        this.data.matches = new Map(parsed.matches || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  // Save data to AsyncStorage
  private async saveData(): Promise<void> {
    try {
      const dataToSave = {
        users: Array.from(this.data.users.entries()),
        teams: Array.from(this.data.teams.entries()),
        tournaments: Array.from(this.data.tournaments.entries()),
        matches: Array.from(this.data.matches.entries()),
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // User Operations
  async createUser(user: PlayerRegistration): Promise<PlayerRegistration> {
    const newUser = {
      ...user,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    this.data.users.set(newUser.id, newUser);
    await this.saveData();
    return newUser;
  }

  async getUserById(id: string): Promise<PlayerRegistration | null> {
    return this.data.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<PlayerRegistration>): Promise<PlayerRegistration> {
    const existingUser = this.data.users.get(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.users.set(id, updatedUser);
    await this.saveData();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = this.data.users.delete(id);
    if (deleted) {
      await this.saveData();
    }
    return deleted;
  }

  // Team Operations
  async createTeam(team: TeamCreation): Promise<TeamCreation> {
    const newTeam = {
      ...team,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    this.data.teams.set(newTeam.id, newTeam);
    await this.saveData();
    return newTeam;
  }

  async getTeamById(id: string): Promise<TeamCreation | null> {
    return this.data.teams.get(id) || null;
  }

  async updateTeam(id: string, updates: Partial<TeamCreation>): Promise<TeamCreation> {
    const existingTeam = this.data.teams.get(id);
    if (!existingTeam) {
      throw new Error('Team not found');
    }

    const updatedTeam = {
      ...existingTeam,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.teams.set(id, updatedTeam);
    await this.saveData();
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const deleted = this.data.teams.delete(id);
    if (deleted) {
      await this.saveData();
    }
    return deleted;
  }

  async getTeamsByOwner(ownerId: string): Promise<TeamCreation[]> {
    return Array.from(this.data.teams.values()).filter(team => team.ownerId === ownerId);
  }

  // Tournament Operations
  async createTournament(tournament: Tournament): Promise<Tournament> {
    const newTournament = {
      ...tournament,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    this.data.tournaments.set(newTournament.id, newTournament);
    await this.saveData();
    return newTournament;
  }

  async getTournamentById(id: string): Promise<Tournament | null> {
    return this.data.tournaments.get(id) || null;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const existingTournament = this.data.tournaments.get(id);
    if (!existingTournament) {
      throw new Error('Tournament not found');
    }

    const updatedTournament = {
      ...existingTournament,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.tournaments.set(id, updatedTournament);
    await this.saveData();
    return updatedTournament;
  }

  async deleteTournament(id: string): Promise<boolean> {
    const deleted = this.data.tournaments.delete(id);
    if (deleted) {
      await this.saveData();
    }
    return deleted;
  }

  async getTournamentsByOrganizer(organizerId: string): Promise<Tournament[]> {
    return Array.from(this.data.tournaments.values()).filter(tournament => tournament.organizerId === organizerId);
  }

  // Match Operations
  async createMatch(match: Match): Promise<Match> {
    const newMatch = {
      ...match,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    this.data.matches.set(newMatch.id, newMatch);
    await this.saveData();
    return newMatch;
  }

  async getMatchById(id: string): Promise<Match | null> {
    return this.data.matches.get(id) || null;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
    const existingMatch = this.data.matches.get(id);
    if (!existingMatch) {
      throw new Error('Match not found');
    }

    const updatedMatch = {
      ...existingMatch,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.matches.set(id, updatedMatch);
    await this.saveData();
    return updatedMatch;
  }

  async deleteMatch(id: string): Promise<boolean> {
    const deleted = this.data.matches.delete(id);
    if (deleted) {
      await this.saveData();
    }
    return deleted;
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    return Array.from(this.data.matches.values()).filter(match => match.tournamentId === tournamentId);
  }

  // Search Operations
  async searchUsers(query: string): Promise<PlayerRegistration[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.data.users.values()).filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.location.toLowerCase().includes(searchTerm)
    );
  }

  async searchTeams(query: string): Promise<TeamCreation[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.data.teams.values()).filter(team => 
      team.name.toLowerCase().includes(searchTerm) ||
      team.description.toLowerCase().includes(searchTerm)
    );
  }

  async searchTournaments(query: string): Promise<Tournament[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.data.tournaments.values()).filter(tournament => 
      tournament.name.toLowerCase().includes(searchTerm) ||
      tournament.description.toLowerCase().includes(searchTerm)
    );
  }

  // Utility Methods
  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Data Export/Import for testing
  async exportData(): Promise<string> {
    const dataToExport = {
      users: Array.from(this.data.users.entries()),
      teams: Array.from(this.data.teams.entries()),
      tournaments: Array.from(this.data.tournaments.entries()),
      matches: Array.from(this.data.matches.entries()),
    };
    return JSON.stringify(dataToExport, null, 2);
  }

  async importData(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data);
      this.data.users = new Map(parsed.users || []);
      this.data.teams = new Map(parsed.teams || []);
      this.data.tournaments = new Map(parsed.tournaments || []);
      this.data.matches = new Map(parsed.matches || []);
      await this.saveData();
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    this.data.users.clear();
    this.data.teams.clear();
    this.data.tournaments.clear();
    this.data.matches.clear();
    await this.saveData();
  }
}

// Export singleton instance
export const dataService = new ProductionDataService();
export default dataService;

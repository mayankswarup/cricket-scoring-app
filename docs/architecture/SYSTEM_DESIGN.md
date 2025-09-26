# 🏏 Cricket Scoring & Tournament Management System - System Design

## Overview
A comprehensive cricket platform supporting live scoring, tournament management, player profiles, and fan engagement with offline-first architecture and real-time synchronization.

## Problem Statement & Personas

### Core Personas

#### 1. **Scorer** 
- **Context**: Captures ball-by-ball data on ground with poor/patchy network
- **Pain Points**: Network connectivity issues, data loss, synchronization problems
- **Needs**: Offline-first scoring, conflict-free sync, simple interface

#### 2. **Players**
- **Context**: View profile, career stats, match highlights, badges
- **Pain Points**: Limited visibility into performance, no centralized stats
- **Needs**: Comprehensive profiles, performance analytics, achievement tracking

#### 3. **Captains/Managers**
- **Context**: Create squads, fixtures, lineups, submit results
- **Pain Points**: Complex team management, scheduling conflicts
- **Needs**: Team management tools, scheduling system, lineup management

#### 4. **Fans**
- **Context**: Live score feed, commentary, notifications
- **Pain Points**: Delayed updates, poor user experience
- **Needs**: Real-time updates, engaging content, notifications

#### 5. **Organizers**
- **Context**: Create leagues/tournaments, points table, leaderboards
- **Pain Points**: Complex tournament management, manual calculations
- **Needs**: Tournament creation tools, automated calculations, management dashboard

#### 6. **Umpires**
- **Context**: Validate results, enter penalties
- **Pain Points**: Manual result validation, inconsistent processes
- **Needs**: Validation tools, penalty management, result verification

## Top Use Cases

### 1. **Live Match Scoring**
- **Ball-by-ball scoring** with offline tolerance + sync
- **Real-time updates** to global viewers (< 2-3s latency)
- **Conflict resolution** when multiple scorers sync
- **Offline-first architecture** with local storage

### 2. **Tournament Management**
- **Multiple formats**: League, knockout, round-robin
- **Automated fixture generation**
- **Points table calculation**
- **NRR (Net Run Rate) calculations**
- **Purple/Orange cap tracking**

### 3. **Player & Team Management**
- **Player registration** with KYC (optional)
- **Role-based permissions**
- **Team creation and management**
- **Squad selection and lineups**
- **Career statistics tracking**

### 4. **Fan Engagement**
- **Live score feeds**
- **Match commentary**
- **Push notifications**
- **Match highlights**
- **Player profiles and stats**

### 5. **Media Management**
- **Photo uploads**
- **Short video clips**
- **Match highlights**
- **Player/team galleries**

### 6. **Search & Discovery**
- **Player search** with filters
- **Team search**
- **Tournament search**
- **Ground/venue search**

### 7. **Moderation & Anti-Cheat**
- **Score edit audits**
- **Organizer approval workflows**
- **Data integrity checks**
- **Suspicious activity detection**

## Non-Functional Requirements (NFRs)

### Performance
- **Low-latency live updates**: < 2-3s to global viewers
- **High write throughput**: Handle India peak weekends (burst traffic)
- **Tiny payloads**: Efficient data transmission
- **Offline-first**: Work without network, sync when available

### Scalability
- **Cost-efficient**: Long tail (many micro-tournaments, few viewers each)
- **Occasional spikes**: Handle viral matches/tournaments
- **Global distribution**: Multi-region deployment
- **Auto-scaling**: Handle traffic spikes automatically

### Reliability
- **Conflict-free sync**: Handle offline/online transitions
- **Data integrity**: Prevent data loss during network issues
- **Backup systems**: Redundant data storage
- **Disaster recovery**: Quick recovery from failures

### Security & Compliance
- **GDPR compliance**: Data deletion/export capabilities
- **Auditability**: Sports integrity requirements
- **Data encryption**: End-to-end encryption
- **Access control**: Role-based permissions

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├─────────────────────────────────────────────────────────────┤
│  Scorer App  │  Player App  │  Fan App  │  Admin Dashboard  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
│  • Authentication  • Rate Limiting  • Load Balancing       │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Microservices Layer                       │
├─────────────────────────────────────────────────────────────┤
│ Scoring │ Tournament │ Player │ Media │ Notification │ Auth │
│ Service │ Service    │ Service│ Service│ Service     │ Service│
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  S3/MinIO  │  Elasticsearch       │
│  (Primary)   │ (Cache) │ (Media)    │ (Search)             │
└─────────────────────────────────────────────────────────────┘
```

### Offline-First Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                      │
├─────────────────────────────────────────────────────────────┤
│  Local Storage  │  Sync Engine  │  Conflict Resolution     │
│  (SQLite)       │  (Background) │  (Operational Transform)  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Sync Service                             │
│  • Conflict Detection  • Merge Strategies  • Version Control│
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Central Database                         │
│  • Event Sourcing  • CQRS  • Audit Logs                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### Core Entities

#### Match & Scoring
```typescript
interface Match {
  id: string;
  tournamentId: string;
  homeTeam: Team;
  awayTeam: Team;
  venue: Venue;
  date: Date;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  format: 'T20' | 'ODI' | 'Test' | 'T10';
  innings: Inning[];
  tossResult?: TossResult;
  result?: MatchResult;
}

interface Ball {
  id: string;
  matchId: string;
  inningId: string;
  over: number;
  ball: number;
  batsman: Player;
  bowler: Player;
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped';
  timestamp: Date;
  scorerId: string;
}

interface Inning {
  id: string;
  matchId: string;
  team: Team;
  battingOrder: number;
  runs: number;
  wickets: number;
  overs: number;
  balls: Ball[];
  status: 'not_started' | 'in_progress' | 'completed';
}
```

#### Tournament Management
```typescript
interface Tournament {
  id: string;
  name: string;
  format: 'league' | 'knockout' | 'round_robin' | 'hybrid';
  teams: Team[];
  matches: Match[];
  pointsTable: PointsTableEntry[];
  status: 'upcoming' | 'live' | 'completed';
  startDate: Date;
  endDate: Date;
  organizerId: string;
}

interface PointsTableEntry {
  teamId: string;
  matches: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  netRunRate: number;
  position: number;
}
```

#### Player & Team Management
```typescript
interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingStyle: 'right-handed' | 'left-handed';
  bowlingStyle?: string;
  teams: TeamMembership[];
  stats: PlayerStats;
  achievements: Achievement[];
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  players: Player[];
  captain: Player;
  coach: string;
  createdBy: string;
  tournaments: string[];
}

interface PlayerStats {
  matches: number;
  runs: number;
  wickets: number;
  catches: number;
  stumpings: number;
  battingAverage: number;
  bowlingAverage: number;
  strikeRate: number;
  economyRate: number;
  bestBatting: number;
  bestBowling: string;
}
```

#### Media & Content
```typescript
interface Media {
  id: string;
  type: 'image' | 'video' | 'highlight';
  url: string;
  thumbnailUrl: string;
  matchId?: string;
  playerId?: string;
  teamId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata: MediaMetadata;
}

interface MediaMetadata {
  duration?: number;
  size: number;
  format: string;
  resolution?: string;
  tags: string[];
}
```

#### Notifications & Events
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'match_start' | 'wicket' | 'milestone' | 'result' | 'tournament_update';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: Date;
}

interface Event {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  timestamp: Date;
  version: number;
}
```

## API Architecture

### RESTful APIs

#### Scoring Service
```
POST   /api/v1/matches/{matchId}/balls
GET    /api/v1/matches/{matchId}/score
PUT    /api/v1/matches/{matchId}/balls/{ballId}
DELETE /api/v1/matches/{matchId}/balls/{ballId}
```

#### Tournament Service
```
POST   /api/v1/tournaments
GET    /api/v1/tournaments/{tournamentId}
PUT    /api/v1/tournaments/{tournamentId}
GET    /api/v1/tournaments/{tournamentId}/points-table
POST   /api/v1/tournaments/{tournamentId}/matches
```

#### Player Service
```
POST   /api/v1/players
GET    /api/v1/players/{playerId}
PUT    /api/v1/players/{playerId}
GET    /api/v1/players/{playerId}/stats
GET    /api/v1/players/search
```

#### Media Service
```
POST   /api/v1/media/upload
GET    /api/v1/media/{mediaId}
GET    /api/v1/matches/{matchId}/media
POST   /api/v1/media/{mediaId}/highlights
```

### Real-time APIs (WebSocket)

#### Live Scoring
```typescript
// Client subscribes to match updates
ws.send({
  type: 'subscribe',
  matchId: 'match-123'
});

// Server sends real-time updates
{
  type: 'ball_update',
  matchId: 'match-123',
  ball: { /* ball data */ },
  score: { /* current score */ }
}
```

#### Notifications
```typescript
// Real-time notifications
{
  type: 'notification',
  notification: {
    id: 'notif-123',
    type: 'wicket',
    title: 'Wicket!',
    message: 'Player X is out!',
    matchId: 'match-123'
  }
}
```

## Database Design

### Primary Database (PostgreSQL)

#### Core Tables
```sql
-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  venue_id UUID REFERENCES venues(id),
  date TIMESTAMP,
  status VARCHAR(20),
  format VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Balls (Event Sourcing)
CREATE TABLE balls (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  inning_id UUID REFERENCES innings(id),
  over INTEGER,
  ball INTEGER,
  batsman_id UUID REFERENCES players(id),
  bowler_id UUID REFERENCES players(id),
  runs INTEGER,
  is_wide BOOLEAN,
  is_no_ball BOOLEAN,
  is_wicket BOOLEAN,
  wicket_type VARCHAR(20),
  timestamp TIMESTAMP,
  scorer_id UUID REFERENCES users(id),
  version INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Players
CREATE TABLE players (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  role VARCHAR(20),
  batting_style VARCHAR(20),
  bowling_style VARCHAR(30),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  short_name VARCHAR(10),
  logo_url VARCHAR(500),
  captain_id UUID REFERENCES players(id),
  coach VARCHAR(255),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  format VARCHAR(20),
  status VARCHAR(20),
  start_date DATE,
  end_date DATE,
  organizer_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Cache Layer (Redis)

#### Caching Strategy
```typescript
// Match scores (frequently accessed)
const matchScoreKey = `match:${matchId}:score`;
const matchScore = {
  homeTeam: { runs: 150, wickets: 3, overs: 20 },
  awayTeam: { runs: 120, wickets: 5, overs: 18 },
  currentInnings: 'home'
};

// Player stats (updated after each match)
const playerStatsKey = `player:${playerId}:stats`;
const playerStats = {
  matches: 25,
  runs: 1250,
  wickets: 15,
  average: 50.0
};

// Live matches (real-time updates)
const liveMatchesKey = 'live:matches';
const liveMatches = ['match-123', 'match-456', 'match-789'];
```

### Search Database (Elasticsearch)

#### Search Indices
```json
{
  "players": {
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "role": { "type": "keyword" },
        "location": { "type": "text" },
        "stats": { "type": "object" }
      }
    }
  },
  "teams": {
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "location": { "type": "text" },
        "players": { "type": "keyword" }
      }
    }
  },
  "tournaments": {
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "format": { "type": "keyword" },
        "status": { "type": "keyword" }
      }
    }
  }
}
```

## Microservices Architecture

### Service Breakdown

#### 1. **Scoring Service**
- **Responsibility**: Ball-by-ball scoring, match state management
- **Database**: PostgreSQL (matches, balls, innings)
- **Cache**: Redis (live scores, match state)
- **Events**: Ball updates, match events

#### 2. **Tournament Service**
- **Responsibility**: Tournament management, fixtures, points table
- **Database**: PostgreSQL (tournaments, fixtures, points)
- **Cache**: Redis (points table, fixtures)
- **Events**: Tournament updates, fixture changes

#### 3. **Player Service**
- **Responsibility**: Player profiles, stats, achievements
- **Database**: PostgreSQL (players, stats, achievements)
- **Search**: Elasticsearch (player search)
- **Events**: Player updates, stat changes

#### 4. **Media Service**
- **Responsibility**: Media upload, processing, delivery
- **Storage**: S3/MinIO (media files)
- **Database**: PostgreSQL (media metadata)
- **Events**: Media uploads, processing complete

#### 5. **Notification Service**
- **Responsibility**: Push notifications, real-time updates
- **Database**: PostgreSQL (notifications, subscriptions)
- **Queue**: Redis/RabbitMQ (notification queue)
- **Events**: Notification triggers

#### 6. **Authentication Service**
- **Responsibility**: User authentication, authorization
- **Database**: PostgreSQL (users, roles, permissions)
- **Cache**: Redis (sessions, tokens)
- **Events**: Login/logout events

### Service Communication

#### Event-Driven Architecture
```typescript
// Event Bus (Redis Streams/Apache Kafka)
interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
}

// Domain Events
interface BallScoredEvent {
  type: 'BALL_SCORED';
  matchId: string;
  ball: Ball;
  timestamp: Date;
}

interface MatchCompletedEvent {
  type: 'MATCH_COMPLETED';
  matchId: string;
  result: MatchResult;
  timestamp: Date;
}

interface PlayerStatsUpdatedEvent {
  type: 'PLAYER_STATS_UPDATED';
  playerId: string;
  stats: PlayerStats;
  timestamp: Date;
}
```

#### API Gateway
```typescript
// API Gateway Configuration
interface APIGatewayConfig {
  routes: Route[];
  middleware: Middleware[];
  rateLimiting: RateLimitConfig;
  authentication: AuthConfig;
}

interface Route {
  path: string;
  method: string;
  service: string;
  timeout: number;
  retries: number;
}
```

## Offline-First Implementation

### Client-Side Architecture

#### Local Storage (SQLite)
```typescript
// Local Database Schema
interface LocalMatch {
  id: string;
  matchData: Match;
  status: 'pending_sync' | 'synced' | 'conflict';
  lastModified: Date;
  version: number;
}

interface LocalBall {
  id: string;
  matchId: string;
  ballData: Ball;
  status: 'pending_sync' | 'synced' | 'conflict';
  timestamp: Date;
  version: number;
}
```

#### Sync Engine
```typescript
class SyncEngine {
  async syncMatch(matchId: string): Promise<SyncResult> {
    const localMatch = await this.getLocalMatch(matchId);
    const serverMatch = await this.getServerMatch(matchId);
    
    if (this.hasConflicts(localMatch, serverMatch)) {
      return this.resolveConflicts(localMatch, serverMatch);
    }
    
    return this.mergeChanges(localMatch, serverMatch);
  }
  
  async resolveConflicts(local: LocalMatch, server: Match): Promise<SyncResult> {
    // Operational Transform for conflict resolution
    const merged = this.operationalTransform(local, server);
    return this.applyChanges(merged);
  }
}
```

#### Conflict Resolution
```typescript
// Operational Transform for Ball Scoring
class BallConflictResolver {
  resolveBallConflicts(localBalls: Ball[], serverBalls: Ball[]): Ball[] {
    const mergedBalls = [...serverBalls];
    
    for (const localBall of localBalls) {
      const serverBall = serverBalls.find(b => b.id === localBall.id);
      
      if (!serverBall) {
        // New ball from local
        mergedBalls.push(localBall);
      } else if (this.hasConflict(localBall, serverBall)) {
        // Resolve conflict based on timestamp and scorer
        const resolved = this.resolveConflict(localBall, serverBall);
        const index = mergedBalls.findIndex(b => b.id === localBall.id);
        mergedBalls[index] = resolved;
      }
    }
    
    return mergedBalls.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
```

## Real-Time Features

### WebSocket Implementation

#### Connection Management
```typescript
class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  
  subscribeToMatch(userId: string, matchId: string): void {
    const ws = this.connections.get(userId);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        matchId: matchId
      }));
    }
  }
  
  broadcastMatchUpdate(matchId: string, update: any): void {
    const subscribers = this.getMatchSubscribers(matchId);
    subscribers.forEach(ws => {
      ws.send(JSON.stringify({
        type: 'match_update',
        matchId: matchId,
        data: update
      }));
    });
  }
}
```

#### Live Score Updates
```typescript
// Real-time score broadcasting
class LiveScoreService {
  async onBallScored(ball: Ball): Promise<void> {
    // Update database
    await this.updateMatchScore(ball);
    
    // Broadcast to subscribers
    await this.broadcastScoreUpdate(ball.matchId, {
      ball: ball,
      score: await this.getCurrentScore(ball.matchId)
    });
    
    // Send notifications
    await this.sendNotifications(ball);
  }
}
```

### Push Notifications

#### Notification Types
```typescript
interface NotificationConfig {
  matchStart: boolean;
  wickets: boolean;
  milestones: boolean;
  results: boolean;
  tournamentUpdates: boolean;
}

class NotificationService {
  async sendMatchStartNotification(match: Match): Promise<void> {
    const subscribers = await this.getMatchSubscribers(match.id);
    
    for (const subscriber of subscribers) {
      await this.sendPushNotification(subscriber.userId, {
        title: 'Match Started!',
        body: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        data: { matchId: match.id, type: 'match_start' }
      });
    }
  }
  
  async sendWicketNotification(ball: Ball): Promise<void> {
    const subscribers = await this.getMatchSubscribers(ball.matchId);
    
    for (const subscriber of subscribers) {
      await this.sendPushNotification(subscriber.userId, {
        title: 'Wicket!',
        body: `${ball.batsman.name} is out!`,
        data: { matchId: ball.matchId, type: 'wicket' }
      });
    }
  }
}
```

## Security & Compliance

### Data Protection

#### GDPR Compliance
```typescript
class DataProtectionService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await this.collectUserData(userId);
    return {
      personalInfo: userData.personal,
      matchData: userData.matches,
      mediaData: userData.media,
      exportDate: new Date()
    };
  }
  
  async deleteUserData(userId: string): Promise<void> {
    // Anonymize instead of delete for audit purposes
    await this.anonymizeUserData(userId);
    await this.removePersonalIdentifiers(userId);
  }
}
```

#### Audit Logging
```typescript
class AuditService {
  async logScoreEdit(ballId: string, editorId: string, changes: any): Promise<void> {
    await this.auditLog.create({
      type: 'SCORE_EDIT',
      entityId: ballId,
      userId: editorId,
      changes: changes,
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: await this.getUserAgent()
    });
  }
}
```

### Anti-Cheat Measures

#### Score Validation
```typescript
class ScoreValidator {
  async validateScoreEdit(ballId: string, newScore: any): Promise<ValidationResult> {
    const ball = await this.getBall(ballId);
    const match = await this.getMatch(ball.matchId);
    
    // Check if edit is within reasonable time window
    if (this.isEditTooLate(ball, newScore)) {
      return { valid: false, reason: 'Edit too late' };
    }
    
    // Check for suspicious patterns
    if (await this.hasSuspiciousPattern(ball, newScore)) {
      return { valid: false, reason: 'Suspicious pattern detected' };
    }
    
    // Require organizer approval for significant changes
    if (this.requiresApproval(ball, newScore)) {
      await this.requestApproval(ballId, newScore);
      return { valid: false, reason: 'Approval required' };
    }
    
    return { valid: true };
  }
}
```

## Deployment Architecture

### Cloud Infrastructure

#### AWS Deployment
```yaml
# Infrastructure as Code (Terraform)
resources:
  - name: "api-gateway"
    type: "aws_api_gateway"
    config:
      name: "cricket-api"
      stage: "prod"
  
  - name: "scoring-service"
    type: "aws_ecs_service"
    config:
      cluster: "cricket-cluster"
      task_definition: "scoring-service"
      desired_count: 3
  
  - name: "database"
    type: "aws_rds"
    config:
      engine: "postgresql"
      instance_class: "db.r5.large"
      multi_az: true
  
  - name: "cache"
    type: "aws_elasticache"
    config:
      engine: "redis"
      node_type: "cache.r5.large"
      num_cache_nodes: 2
```

#### Container Orchestration
```yaml
# Docker Compose for Development
version: '3.8'
services:
  api-gateway:
    image: cricket-api-gateway:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/cricket
      - REDIS_URL=redis://redis:6379
  
  scoring-service:
    image: cricket-scoring-service:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/cricket
      - REDIS_URL=redis://redis:6379
  
  database:
    image: postgres:13
    environment:
      - POSTGRES_DB=cricket
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
```

### Monitoring & Observability

#### Application Monitoring
```typescript
// Metrics Collection
class MetricsCollector {
  async recordBallScored(matchId: string, latency: number): Promise<void> {
    await this.metrics.increment('balls_scored_total', { matchId });
    await this.metrics.histogram('ball_scoring_latency', latency);
  }
  
  async recordMatchUpdate(matchId: string, subscriberCount: number): Promise<void> {
    await this.metrics.gauge('match_subscribers', subscriberCount, { matchId });
  }
}
```

#### Health Checks
```typescript
class HealthCheckService {
  async checkDatabase(): Promise<HealthStatus> {
    try {
      await this.database.query('SELECT 1');
      return { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkRedis(): Promise<HealthStatus> {
    try {
      await this.redis.ping();
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
```

## Performance Optimization

### Caching Strategy

#### Multi-Level Caching
```typescript
class CacheManager {
  // L1: In-memory cache (fastest)
  private memoryCache = new Map();
  
  // L2: Redis cache (fast)
  private redisCache: Redis;
  
  // L3: Database (slowest)
  private database: Database;
  
  async getMatchScore(matchId: string): Promise<MatchScore> {
    // Try L1 cache first
    let score = this.memoryCache.get(`match:${matchId}:score`);
    if (score) return score;
    
    // Try L2 cache
    score = await this.redisCache.get(`match:${matchId}:score`);
    if (score) {
      this.memoryCache.set(`match:${matchId}:score`, score);
      return score;
    }
    
    // Fallback to database
    score = await this.database.getMatchScore(matchId);
    await this.redisCache.set(`match:${matchId}:score`, score, 300); // 5 min TTL
    this.memoryCache.set(`match:${matchId}:score`, score);
    return score;
  }
}
```

### Database Optimization

#### Read Replicas
```typescript
class DatabaseManager {
  private master: Database; // Write operations
  private replicas: Database[]; // Read operations
  
  async writeMatchScore(matchId: string, score: MatchScore): Promise<void> {
    // Write to master
    await this.master.updateMatchScore(matchId, score);
    
    // Invalidate cache
    await this.cache.invalidate(`match:${matchId}:score`);
  }
  
  async readMatchScore(matchId: string): Promise<MatchScore> {
    // Read from replica (load balanced)
    const replica = this.getReplica();
    return await replica.getMatchScore(matchId);
  }
}
```

## Cost Optimization

### Resource Management

#### Auto-Scaling
```typescript
class AutoScaler {
  async scaleBasedOnLoad(): Promise<void> {
    const metrics = await this.getMetrics();
    
    if (metrics.cpuUsage > 80) {
      await this.scaleUp('scoring-service', 2);
    } else if (metrics.cpuUsage < 20) {
      await this.scaleDown('scoring-service', 1);
    }
    
    if (metrics.activeMatches > 100) {
      await this.scaleUp('notification-service', 1);
    }
  }
}
```

#### Cost Monitoring
```typescript
class CostMonitor {
  async trackCosts(): Promise<CostReport> {
    return {
      database: await this.getDatabaseCosts(),
      compute: await this.getComputeCosts(),
      storage: await this.getStorageCosts(),
      network: await this.getNetworkCosts(),
      total: await this.getTotalCosts()
    };
  }
}
```

## Implementation Roadmap

### Phase 1: Core Foundation (Weeks 1-4)
- [ ] Basic player registration and authentication
- [ ] Simple match scoring (online only)
- [ ] Basic team management
- [ ] Database setup and basic APIs

### Phase 2: Offline-First Scoring (Weeks 5-8)
- [ ] Offline scoring capability
- [ ] Conflict-free synchronization
- [ ] Local storage implementation
- [ ] Sync engine development

### Phase 3: Tournament Management (Weeks 9-12)
- [ ] Tournament creation and management
- [ ] Fixture generation
- [ ] Points table calculation
- [ ] NRR calculations

### Phase 4: Real-Time Features (Weeks 13-16)
- [ ] WebSocket implementation
- [ ] Live score updates
- [ ] Push notifications
- [ ] Real-time commentary

### Phase 5: Media & Fan Engagement (Weeks 17-20)
- [ ] Media upload and processing
- [ ] Match highlights
- [ ] Fan engagement features
- [ ] Social features

### Phase 6: Advanced Features (Weeks 21-24)
- [ ] Anti-cheat measures
- [ ] Advanced analytics
- [ ] Performance optimization
- [ ] Security hardening

## Success Metrics

### Technical Metrics
- **Latency**: < 2-3s for live updates
- **Uptime**: 99.9% availability
- **Sync Success**: 99.5% conflict-free sync
- **Performance**: Handle 10,000+ concurrent users

### Business Metrics
- **User Engagement**: Daily active users
- **Match Completion**: % of matches fully scored
- **Tournament Success**: % of tournaments completed
- **User Satisfaction**: App store ratings

### Cost Metrics
- **Infrastructure Cost**: < $0.10 per match
- **Storage Cost**: < $0.01 per GB/month
- **Bandwidth Cost**: < $0.05 per GB

This comprehensive system design provides a solid foundation for building a scalable, offline-first cricket scoring and tournament management platform that can handle the requirements of all personas while maintaining high performance and cost efficiency.

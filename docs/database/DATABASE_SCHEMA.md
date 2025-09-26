# 🗄️ Cricket App Database Schema - Production Ready

## 📊 Core Tables

### **1. Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  role ENUM('player', 'organizer', 'admin', 'scorer') DEFAULT 'player',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **2. User Profiles Table**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  preferred_role ENUM('batsman', 'bowler', 'all-rounder', 'wicket-keeper'),
  batting_style ENUM('right-handed', 'left-handed'),
  bowling_style ENUM('right-arm fast', 'left-arm fast', 'right-arm spin', 'left-arm spin'),
  experience_level ENUM('beginner', 'intermediate', 'advanced', 'professional'),
  location VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Teams Table**
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  captain_id UUID REFERENCES users(id),
  vice_captain_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **4. Team Members Table**
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role ENUM('captain', 'vice_captain', 'player') DEFAULT 'player',
  jersey_number INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);
```

### **5. Tournaments Table**
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  format ENUM('league', 'knockout', 'round_robin', 't20', 'odi', 'test'),
  start_date DATE,
  end_date DATE,
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  max_teams INTEGER DEFAULT 8,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_money DECIMAL(10,2) DEFAULT 0,
  status ENUM('draft', 'open', 'closed', 'ongoing', 'completed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **6. Tournament Teams Table**
```sql
CREATE TABLE tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_confirmed BOOLEAN DEFAULT FALSE,
  UNIQUE(tournament_id, team_id)
);
```

### **7. Matches Table**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  venue VARCHAR(255),
  match_date DATE,
  match_time TIME,
  status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
  toss_winner_id UUID REFERENCES teams(id),
  toss_decision ENUM('bat', 'bowl'),
  result ENUM('home_win', 'away_win', 'tie', 'no_result'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **8. Match Events Table (Live Scoring)**
```sql
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  over_number INTEGER NOT NULL,
  ball_number INTEGER NOT NULL,
  striker_id UUID REFERENCES users(id),
  non_striker_id UUID REFERENCES users(id),
  bowler_id UUID REFERENCES users(id),
  event_type ENUM('run', 'wide', 'no_ball', 'wicket', 'bye', 'leg_bye'),
  runs INTEGER DEFAULT 0,
  extras_type ENUM('wide', 'no_ball', 'bye', 'leg_bye'),
  wicket_type ENUM('bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket'),
  dismissal_player_id UUID REFERENCES users(id),
  scorer_id UUID REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, over_number, ball_number)
);
```

### **9. Player Statistics Table**
```sql
CREATE TABLE player_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  -- Batting Stats
  runs INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  is_not_out BOOLEAN DEFAULT FALSE,
  -- Bowling Stats
  overs_bowled DECIMAL(3,1) DEFAULT 0,
  runs_conceded INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  maidens INTEGER DEFAULT 0,
  -- Fielding Stats
  catches INTEGER DEFAULT 0,
  run_outs INTEGER DEFAULT 0,
  stumpings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **10. Points Table**
```sql
CREATE TABLE points_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  matches_lost INTEGER DEFAULT 0,
  matches_tied INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  net_run_rate DECIMAL(5,3) DEFAULT 0.000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, team_id)
);
```

## 🔗 Relationships

### **One-to-Many:**
- Users → Teams (owner)
- Users → Tournaments (organizer)
- Teams → Team Members
- Tournaments → Matches
- Matches → Match Events

### **Many-to-Many:**
- Teams ↔ Tournaments (through tournament_teams)
- Users ↔ Teams (through team_members)

## 📈 Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Team lookups
CREATE INDEX idx_teams_owner ON teams(owner_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Match lookups
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_match_events_match ON match_events(match_id);
CREATE INDEX idx_match_events_over_ball ON match_events(match_id, over_number, ball_number);

-- Statistics
CREATE INDEX idx_player_stats_user ON player_statistics(user_id);
CREATE INDEX idx_player_stats_match ON player_statistics(match_id);
```

## 🚀 Scalability Considerations

### **Partitioning Strategy:**
- Partition `match_events` by `match_id` for large datasets
- Partition `player_statistics` by date for historical data

### **Caching Strategy:**
- Cache points table in Redis
- Cache live match data in Redis
- Cache user sessions in Redis

### **API Rate Limiting:**
- Rate limit by user_id
- Rate limit by IP address
- Different limits for different user roles

## 🔒 Security Considerations

### **Data Encryption:**
- Encrypt sensitive user data
- Hash passwords with bcrypt
- Encrypt API keys and tokens

### **Access Control:**
- Row-level security for user data
- Role-based access control
- API authentication with JWT

### **Audit Trail:**
- Log all user actions
- Track data changes
- Monitor suspicious activity

This schema is designed to scale from MVP to enterprise-level cricket management platform! 🏏

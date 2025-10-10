# 🏏 Cricket Scoring App - Complete Implementation Roadmap

**Version:** 1.0  
**Target:** Production-Ready App with PRO Features  
**Timeline:** 6 Weeks (Aggressive) or 8-10 Weeks (Steady)  
**Database:** Firebase Firestore  
**Cost:** ₹0 (Free tier) → ₹99/month PRO subscription

---

## 📋 **Project Overview**

### **Core Features:**
- Dynamic player management with profiles
- Team creation & management (unlimited players)
- Match creation & scheduling
- Match invitations & acceptance
- Live scoring with real-time updates
- Complete statistics & analytics
- Ball-by-ball commentary
- Match history with full scorecards
- Team & player rankings/leaderboards
- Push notifications (configurable)
- PRO subscription (₹99/month or ₹399/year)

---

## 🎯 **User Requirements Summary**

### **Player Management:**
- Players register with profile (optional on first login)
- **Mandatory fields:** Name, Role, Batting Hand, Bowling Style
- **Optional fields:** Profile Photo, Jersey Number
- Players can be in multiple teams
- Players can reject team invitations
- Former players' stats preserved with "Former Player" tag

### **Team Formation:**
- **Minimum:** 11 players to create team
- **Maximum:** Unlimited (50+)
- Only 11 play at a time
- Team admins can add/remove players

### **Match Creation:**
- Only team admins can challenge
- Opponent team gets notification → Accept/Reject
- Matches are PUBLIC (anyone can watch)
- Multiple matches can be scheduled in advance
- Configurable reminders (30 min, 1 hour before)
- Auto-cancel configurable (24 hours default)

### **Live Scoring:**
- Offline support with sync
- Multiple admins can take over scoring
- Spectators see live updates (striker/non-striker)
- Match summary at end (MOTM, Top Scorer, Best Bowler)

### **Statistics:**
- Overall, per season, per team stats
- Team rankings & leaderboards
- Player rankings & leaderboards

### **Notifications:**
- Team invitation
- Match invitation
- Match starting soon
- Match completed
- Wickets/boundaries (opt-in)
- Century/50 scored
- Match result

### **PRO Features:**
**FREE:** 1 team, unlimited matches, basic stats  
**PRO (₹99/month or ₹399/year):** Unlimited teams, advanced stats, rankings, PDF export, ad-free

---

## 🗓️ **6-WEEK IMPLEMENTATION PLAN**

---

## **WEEK 1: Foundation - Player Management & Profiles** 🏗️

### **Day 1-2: Player Profile System**

#### **Task 1.1: Create Player Data Model**
```typescript
// types/player.ts
export interface Player {
  id: string; // phone number
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingHand: 'right' | 'left';
  bowlingStyle: 'fast' | 'spin' | 'medium' | 'none';
  profileImage?: string;
  jerseyNumber?: number;
  teams: string[]; // Array of team IDs
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### **Task 1.2: Player Registration Screen**
- Create `PlayerProfileScreen.tsx`
- Form fields: Name, Role, Batting Hand, Bowling Style
- Optional: Profile Photo upload, Jersey Number
- "Skip for Now" button (profile optional on first login)
- Validation: All mandatory fields required

#### **Task 1.3: Firebase Service - Player CRUD**
```typescript
// services/playerService.ts
- createPlayerProfile(playerData)
- updatePlayerProfile(playerId, updates)
- getPlayerProfile(playerId)
- searchPlayers(query)
- getAllPlayers()
```

### **Day 3-4: Player Search & Discovery**

#### **Task 1.4: Player Search Screen**
- Search by name or phone number
- Filter by role (batsman/bowler/etc.)
- Show player card with basic info
- View player profile button

#### **Task 1.5: Player Profile View**
- Display player info
- Show teams they're in
- Show basic stats (if available)
- Edit button (only for own profile)

### **Day 5: Testing & Polish**
- Test player registration flow
- Test search functionality
- Add loading states
- Add error handling
- Fix any bugs

---

## **WEEK 2: Team Management** 👥

### **Day 1-2: Dynamic Team Creation**

#### **Task 2.1: Update Team Data Model**
```typescript
// types/team.ts
export interface Team {
  id: string;
  name: string;
  shortName: string;
  location: string;
  logo?: string;
  players: TeamPlayer[];
  admins: string[]; // phone numbers
  createdBy: string;
  createdAt: timestamp;
}

export interface TeamPlayer {
  playerId: string;
  name: string;
  role: string;
  status: 'active' | 'former' | 'pending-invitation';
  addedAt: timestamp;
  leftAt?: timestamp;
}
```

#### **Task 2.2: Team Player Management**
- Add real players to teams (replace mock data)
- Player invitation system
- Accept/reject invitations
- Remove players from team
- Mark players as "former" when they leave

### **Day 3-4: Team Invitations**

#### **Task 2.3: Invitation System**
```typescript
// types/invitation.ts
export interface Invitation {
  id: string;
  type: 'team' | 'match';
  fromTeamId: string;
  fromTeamName: string;
  toPlayerId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: timestamp;
}
```

#### **Task 2.4: Invitation Screens**
- Send invitation screen
- Invitation notification
- Accept/reject invitation UI
- Invitation history

### **Day 5: Team Validation**
- Validate minimum 11 players to start match
- Show team composition (batsmen, bowlers, etc.)
- Test team creation flow end-to-end

---

## **WEEK 3: Match Creation & Scheduling** 🏏

### **Day 1-2: Match Invitation System**

#### **Task 3.1: Update Match Data Model**
```typescript
// types/match.ts
export interface Match {
  id: string;
  name: string;
  team1: MatchTeam;
  team2: MatchTeam;
  matchType: 'T20' | 'ODI' | 'Test' | 'Custom';
  totalOvers: number;
  venue?: string;
  scheduledDate?: timestamp;
  status: 'pending-invitation' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  invitationStatus: 'pending' | 'accepted' | 'rejected';
  createdBy: string;
  createdAt: timestamp;
  settings: MatchSettings;
}

export interface MatchSettings {
  reminders: number[]; // [30, 60] minutes before
  autoCancelAfter: number; // hours after scheduled time
  isPublic: boolean; // always true for now
}
```

#### **Task 3.2: Match Challenge/Invitation Flow**
- Team A admin creates match challenge
- Team B admin gets notification
- Team B admin accepts/rejects
- If accepted → match status changes to 'scheduled'
- If rejected → match cancelled

### **Day 3-4: Match Scheduling**

#### **Task 3.3: Schedule Match Screen**
- Date/time picker
- Venue input (optional)
- Match type selection
- Overs configuration
- Reminder settings (30min, 1hr, configurable)
- Auto-cancel setting (24hr default, configurable)

#### **Task 3.4: Scheduled Matches View**
- List of upcoming matches
- Filter by date
- Cancel match option
- Reminders

### **Day 5: Match Lifecycle**
- Auto-cancel if time passes (configurable hours)
- Reminder notifications before match
- Update match status flow
- Test scheduling end-to-end

---

## **WEEK 4: Dynamic Live Scoring** ⚡

### **Day 1-2: Real Players in Live Scoring**

#### **Task 4.1: Load Real Players for Match**
- Load actual team players (not mock data)
- Playing11 selection saves to Firebase
- Batting order from real players
- Bowling order from real players

#### **Task 4.2: Update Playing11 Selection**
- Show only players from selected teams
- Validate team composition
- Save selection to Firebase
- Load in LiveScoringScreen

### **Day 3-4: Real-time Score Updates**

#### **Task 4.3: Firebase Real-time Listeners**
```typescript
// Real-time score updates for all viewers
const unsubscribe = onSnapshot(
  doc(db, 'matches', matchId),
  (doc) => {
    const matchData = doc.data();
    updateScorecard(matchData);
  }
);
```

#### **Task 4.4: Spectator View**
- Read-only score view
- Live updates without refresh
- Show striker/non-striker names
- Show current bowler
- Recent balls display
- Live commentary

### **Day 5: Testing**
- Test real-time updates with multiple devices
- Test edit lock system
- Test spectator view
- Fix any synchronization issues

---

## **WEEK 5: Statistics, Rankings & Match Summary** 📊

### **Day 1-2: Player Statistics**

#### **Task 5.1: Auto-Calculate Player Stats**
```typescript
// types/playerStats.ts
export interface PlayerStats {
  playerId: string;
  overall: Stats;
  perSeason: { [year: string]: Stats };
  perTeam: { [teamId: string]: Stats };
}

export interface Stats {
  matches: number;
  batting: {
    innings: number;
    runs: number;
    highScore: number;
    average: number;
    strikeRate: number;
    centuries: number;
    fifties: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    innings: number;
    overs: number;
    wickets: number;
    economy: number;
    average: number;
    bestFigures: string;
  };
}
```

#### **Task 5.2: Stats Calculation Service**
- Calculate stats after each ball
- Update player profile stats
- Aggregate by overall/season/team
- Store in separate collection for performance

### **Day 3: Rankings & Leaderboards**

#### **Task 5.3: Team Rankings**
- Most wins
- Highest team score
- Best bowling figures
- Win/loss ratio
- Update after each match

#### **Task 5.4: Player Rankings**
- Top run scorers
- Top wicket takers
- Best batting average
- Best bowling economy
- Best strike rate
- Most sixes/fours

### **Day 4-5: Match Summary**

#### **Task 5.5: Match Summary Screen**
- Match result
- Man of the Match (auto-suggest based on performance)
- Top scorer
- Best bowler
- Fall of wickets
- Partnership details
- Complete scorecard
- Ball-by-ball archive

---

## **WEEK 6: Notifications, PRO Features & Polish** 🚀

### **Day 1-2: Push Notifications**

#### **Task 6.1: Setup Expo Notifications**
```bash
expo install expo-notifications
```

#### **Task 6.2: Notification Types**
- Team invitation
- Team invitation accepted/rejected
- Match invitation received
- Match invitation accepted/rejected
- Match starting soon (configurable time)
- Match completed
- Wicket fallen (opt-in)
- Boundary scored (opt-in)
- Century/50 scored by teammate
- Match result announced

#### **Task 6.3: Notification Preferences**
- Settings screen for notifications
- Toggle for each notification type
- Save preferences to Firebase

### **Day 3: PRO Features**

#### **Task 6.4: Subscription System**
```typescript
// types/subscription.ts
export interface Subscription {
  userId: string;
  plan: 'free' | 'pro-monthly' | 'pro-yearly';
  status: 'active' | 'expired' | 'cancelled';
  startDate: timestamp;
  expiryDate: timestamp;
  amount: number;
}
```

#### **Task 6.5: PRO Feature Gates**
- Check subscription status
- FREE users: 1 team limit
- PRO users: unlimited teams
- PRO-only: Advanced stats
- PRO-only: Rankings/leaderboards
- PRO-only: PDF export

### **Day 4: Payment Integration (Basic Setup)**
- Integrate Razorpay SDK
- Create payment screen
- Handle payment success
- Upgrade user to PRO
- Handle subscription expiry

### **Day 5: Final Polish**
- Add loading states everywhere
- Add error messages
- Add success messages
- Test entire app flow
- Fix all bugs
- Optimize performance

---

## 📦 **Firebase Collections Structure**

```
firestore/
├── users/
│   └── {phoneNumber}
│       ├── name
│       ├── isPro: boolean
│       ├── subscriptionId
│       ├── teams: [teamIds]
│       └── createdAt
│
├── players/
│   └── {phoneNumber}
│       ├── name
│       ├── role
│       ├── battingHand
│       ├── bowlingStyle
│       ├── profileImage
│       ├── jerseyNumber
│       ├── teams: [teamIds]
│       └── createdAt
│
├── teams/
│   └── {teamId}
│       ├── name
│       ├── shortName
│       ├── location
│       ├── logo
│       ├── players: [TeamPlayer]
│       ├── admins: [phoneNumbers]
│       ├── createdBy
│       └── createdAt
│
├── invitations/
│   └── {invitationId}
│       ├── type: 'team' | 'match'
│       ├── fromTeamId
│       ├── toTeamId (for match)
│       ├── toPlayerId (for team)
│       ├── status
│       └── createdAt
│
├── matches/
│   └── {matchId}
│       ├── name
│       ├── team1
│       ├── team2
│       ├── scheduledDate
│       ├── status
│       ├── invitationStatus
│       ├── settings
│       ├── editLock
│       └── createdAt
│
├── matchPlayers/
│   └── {matchId}
│       ├── team1Players: [Player]
│       └── team2Players: [Player]
│
├── balls/ (subcollection under matches)
│   └── matches/{matchId}/balls/{ballId}
│       ├── ballNumber
│       ├── runs
│       ├── batsmanId
│       ├── bowlerId
│       ├── commentary
│       └── timestamp
│
├── playerStats/
│   └── {playerId}
│       ├── overall
│       ├── perSeason
│       └── perTeam
│
├── teamRankings/
│   └── {teamId}
│       ├── wins
│       ├── losses
│       ├── highestScore
│       └── rank
│
├── playerRankings/
│   └── {playerId}
│       ├── runs
│       ├── wickets
│       ├── average
│       └── rank
│
└── subscriptions/
    └── {subscriptionId}
        ├── userId
        ├── plan
        ├── status
        ├── startDate
        └── expiryDate
```

---

## 🔒 **Firebase Security Rules (To Implement)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.token.phone_number == userId;
    }
    
    function isTeamAdmin(teamId) {
      return isAuthenticated() && 
        request.auth.token.phone_number in get(/databases/$(database)/documents/teams/$(teamId)).data.admins;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) && 
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['isPro', 'subscriptionId']);
    }
    
    // Players collection
    match /players/{playerId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(playerId);
      allow update: if isOwner(playerId);
    }
    
    // Teams collection
    match /teams/{teamId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isTeamAdmin(teamId);
      allow delete: if isAuthenticated() && 
        resource.data.createdBy == request.auth.token.phone_number;
    }
    
    // Matches collection
    match /matches/{matchId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        request.auth.token.phone_number == resource.data.editLock.lockedBy;
    }
    
    // Player stats (auto-calculated, read-only for users)
    match /playerStats/{playerId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Subscriptions (only Cloud Functions can write)
    match /subscriptions/{subId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.token.phone_number;
      allow write: if false; // Only Cloud Functions after payment
    }
  }
}
```

---

## 🧪 **Testing Checklist**

### **Week 1:**
- [ ] Player registration works
- [ ] Player profile edit works
- [ ] Player search works
- [ ] Profile validation works

### **Week 2:**
- [ ] Team creation with real players works
- [ ] Team invitations work
- [ ] Accept/reject invitations work
- [ ] Minimum 11 players enforced

### **Week 3:**
- [ ] Match challenge/invitation works
- [ ] Match scheduling works
- [ ] Reminders work
- [ ] Auto-cancel works

### **Week 4:**
- [ ] Real players load in live scoring
- [ ] Real-time updates work for spectators
- [ ] Edit lock prevents multiple scorers
- [ ] Offline scoring syncs properly

### **Week 5:**
- [ ] Player stats calculate correctly
- [ ] Rankings update after each match
- [ ] Match summary shows correct data
- [ ] Man of the Match auto-suggested

### **Week 6:**
- [ ] Notifications work on real devices
- [ ] PRO subscription works
- [ ] Payment integration works
- [ ] Feature gates work (free vs PRO)

---

## 🚀 **Launch Checklist**

### **Pre-Launch (Week 6):**
- [ ] All features tested
- [ ] Firebase security rules deployed
- [ ] Firebase indexes created
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] App icons created (all sizes)
- [ ] Screenshots taken (4-8 for store)
- [ ] Store listing written
- [ ] Payment gateway tested
- [ ] Subscription flow tested

### **Launch Day:**
- [ ] Deploy to GitHub Pages (web version)
- [ ] Build APK for Android
- [ ] Submit to Google Play Store
- [ ] Share with 10-20 beta testers
- [ ] Monitor Firebase usage
- [ ] Monitor errors in console
- [ ] Be ready to fix critical bugs

### **Post-Launch (Week 7+):**
- [ ] Gather user feedback
- [ ] Fix reported bugs
- [ ] Optimize Firebase queries
- [ ] Add requested features
- [ ] Marketing & user acquisition

---

## 💰 **Revenue Projections**

### **Conservative Estimate:**

**Month 1-3:** 100 users, 10% PRO → ₹990/month  
**Month 4-6:** 500 users, 15% PRO → ₹7,425/month  
**Month 7-12:** 1,000 users, 20% PRO → ₹19,800/month  

**Year 1 Total:** ~₹1.5L revenue

### **Optimistic Estimate:**

**Month 1-3:** 500 users, 15% PRO → ₹7,425/month  
**Month 4-6:** 2,000 users, 20% PRO → ₹39,600/month  
**Month 7-12:** 5,000 users, 25% PRO → ₹1,23,750/month  

**Year 1 Total:** ~₹10L revenue

---

## 📝 **Notes & Reminders**

### **Future Features (Post-Launch):**
- [ ] Video highlights upload (PRO)
- [ ] Export data as Excel/CSV (PRO)
- [ ] Export scorecards as PDF (PRO)
- [ ] Team performance reports (PRO)
- [ ] WhatsApp integration for sharing
- [ ] Tournament management
- [ ] Umpire mode
- [ ] DRS (Decision Review System) 😄
- [ ] Global expansion (multi-language)

### **Important:**
- Keep match data forever (for now)
- Soft delete with trash (30-day recovery)
- Stats are sacred - never delete
- Former players keep their history
- All matches are PUBLIC by default
- Notifications are configurable per user

---

## ✅ **Success Metrics**

### **Technical Metrics:**
- App loads in < 3 seconds
- Real-time updates within 1 second
- Crash rate < 1%
- Firebase costs < 2% of revenue

### **Business Metrics:**
- 500 users in first 3 months
- 15% PRO conversion rate
- < 5% monthly churn
- 4+ star rating on Play Store

---

**Created:** October 10, 2025  
**Last Updated:** October 10, 2025  
**Status:** Ready to Implement 🚀


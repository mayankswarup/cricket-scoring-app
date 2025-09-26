# 🏏 Cricket MVP - Complete Implementation Guide

## Overview
This document provides the complete blueprint for building a cricket scoring and tournament management MVP in 4-6 weeks, based on your detailed specifications.

## 1. MVP Scope (Ship in 4–6 weeks)

### Must-Have Features ✅
- **Auth**: Email/phone OTP, social optional
- **Team Management**: Create team, players, tournament, schedule
- **Live Scoring**: Overs, balls, runs, extras, wickets, batter/bowler context
- **Derived Stats**: Scoreboard, basic player stats per match
- **Public Match Page**: Real-time updates

### Nice-to-Have (V1.1) 🚀
- Push notifications (match start, wicket, result)
- Leaderboards + points table
- Basic media uploads (photos only)
- Simple admin dashboard (tournament owner)

## 2. Architecture Overview

```
[Mobile/Web Client]
| WebSocket (live) + HTTPS (REST/GraphQL)
[API Gateway / BFF]
|-- Auth Service
|-- Match Scoring Service <—— hot path
|-- Stats/Leaderboards Service (read-optimized)
|-- Tournament Service
|-- Media Service (signed URLs)
|-- Notification Service

Data Layer:
- PostgreSQL (OLTP, normalized core)
- Redis (caching, pub/sub for live fan feed)
- S3/GCS (media)
- Elastic/OpenSearch (search)

Streaming: Kafka/PubSub (optional V2)
Infra: Nginx/ALB, CDN (CloudFront/Fastly), Object storage, Terraform
```

## 3. Core Domain Model

### Database Schema
```sql
-- Core Entities
USER(id, name, email, phone, role)
TEAM(id, name, owner_user_id)
PLAYER(id, user_id?, team_id, dob, handedness, bowling_style)
TOURNAMENT(id, name, format, start_date, end_date, organizer_id)
GROUND(id, name, geo, city)
MATCH(id, tournament_id, ground_id, status, start_ts, overs_per_innings)
MATCH_TEAM(match_id, team_id, is_home)
LINEUP(id, match_id, team_id, player_id, batting_pos, is_captain, is_keeper)

-- Scoring Events (Event Sourcing)
EVENT(id, match_id, over, ball, striker_id, non_striker_id, bowler_id,
      event_type, runs, extras_type, wicket_type, dismissal_player_id, 
      ts, scorer_id, client_event_uuid)

-- Derived Data
SCORECARD(id, match_id, team_id, innings_no, total_runs, wickets, overs, extras_breakup)
PLAYER_STATS(match_id, player_id, runs, balls, fours, sixes, wickets, overs, maidens, runs_conceded)
POINTS_TABLE(id, tournament_id, team_id, played, won, lost, tied, nrr, points)

-- Audit & Media
AUDIT_LOG(id, entity, entity_id, action, user_id, ts, diff)
MEDIA(id, match_id?, team_id?, player_id?, url, type, uploader_id, ts)
```

## 4. Live Scoring Data Flow (Happy Path)

### Real-Time Flow
```
Scorer starts match → app subscribes to match:{id} channel
Each ball = one EVENT (JSON) sent via WebSocket (with client_event_uuid)
API validates + writes to Postgres (transaction)
Also publishes to Redis pub/sub match:{id}

Stats Service consumes Redis/Kafka and updates:
- In-memory live state (over, totals, batter/bowler context) → cache in Redis with TTL
- Derived tables (SCORECARD, PLAYER_STATS) → eventual consistency OK (<1s)
- Fans receive updates via WebSocket broadcast (or SSE) within ~1–2s
```

### Offline Tolerance (Scorer)
```
Write each local ball to IndexedDB with client_event_uuid
Background sync worker retries until ACK
Conflict policy: server wins by over,ball sequence; client replays missing ones; manual resolve if divergent
```

## 5. API Specifications (MVP Examples)

### Auth APIs
```typescript
POST /auth/otp/start → start phone OTP
POST /auth/otp/verify → JWT
```

### Tournament/Team APIs
```typescript
POST /tournaments | GET /tournaments/:id
POST /teams | GET /teams/:id | POST /teams/:id/players
```

### Match Lifecycle APIs
```typescript
POST /matches (tournament_id, teams, overs)
POST /matches/:id/start
POST /matches/:id/events (idempotentKey=client_event_uuid)
GET /matches/:id/live (live state + last N events)
POST /matches/:id/close (locks edits → audit trail)
```

### Leaderboards & Points APIs
```typescript
GET /tournaments/:id/points (precomputed)
GET /tournaments/:id/leaderboards (most runs/wkts, SR, Econ)
```

### Media APIs
```typescript
POST /media/sign → presigned URL; client direct-uploads to S3 → webhook to attach metadata
```

### Notification APIs
```typescript
POST /notify/match/:id/event (internal) → push via FCM/APNs
```

## 6. Data Contracts

### EVENT (client→server)
```json
{
  "client_event_uuid": "1b2c-...",
  "match_id": "m_123",
  "over": 12,
  "ball": 3,
  "context": {
    "striker_id": "p_10",
    "non_striker_id": "p_04",
    "bowler_id": "p_22"
  },
  "event": {
    "type": "RUNS",        // RUNS|WIDE|NO_BALL|WICKET|LEG_BYE|BYE|PENALTY
    "runs": 2,
    "extras_type": null,
    "wicket": null
  },
  "ts_client": 1732452332
}
```

### Server ACK
```json
{ 
  "status": "ok", 
  "event_id": "ev_987", 
  "seq": {"over": 12, "ball": 3} 
}
```

### Fan Feed (broadcast)
```json
{
  "match_id": "m_123",
  "seq": {"over":12, "ball":3},
  "score": {"runs": 98, "wkts": 3, "overs": 12.3},
  "last_event": {"type":"RUNS", "runs":2, "batter":"A Khan", "bowler":"S Iyer"}
}
```

## 7. Real-Time Transport Choices

### WebSockets (Socket.io)
- Bidirectional, rooms per match
- Sticky sessions required if no shared pub/sub

### Server-Sent Events (SSE)
- One-way (server→client), simpler infra
- Great for fan feed
- Scorer still uses REST for writes

### Pub/Sub
- Redis (MVP), Kafka/PubSub (scale, durability, replay)

### Broadcast Path (recommended MVP)
```
Scorer → REST /events → Postgres
                    ↘→ Redis Pub/Sub: match:{id}
                       → WebSocket gateway → Fans
```

## 8. Caching Strategy

### Hot Match State
- Redis key: `live:match:{id}` (JSON), TTL extend per event
- Recent events: Redis list `events:match:{id}` (last 180 balls)
- Tournament pages: Cache for 10–30s
- CDN: Cache public match pages, images, static JS/CSS

## 9. Security & Integrity

### Authentication
- JWT with short TTL + refresh
- Role-based access (SCORER, ORGANIZER, FAN, ADMIN)

### Data Integrity
- Idempotency keys for event writes
- Audit trail for score edits
- Post-close edits require admin approval
- Rate limits per IP/user on write endpoints (Redis token bucket)

### Media Security
- Media uploads via pre-signed URLs (server never sees file bytes)

## 10. Implementation Roadmap

### Week 1–2 (MVP Base)
- [ ] Auth, teams/players, tournament setup
- [ ] Create match + lineup; start/close match
- [ ] Live EVENTS write + Redis pub/sub
- [ ] WebSocket/SSE for fans

### Week 3–4 (Stats & Pages)
- [ ] Materialize scorecard & player stats from EVENTS
- [ ] Public match page with live updates
- [ ] Points table + basic leaderboards

### Week 5–6 (Polish)
- [ ] Offline scoring + idempotent sync
- [ ] Notifications (FCM/APNs)
- [ ] Media uploads (photos), CDN
- [ ] Admin dashboard + audit log

## 11. Tech Stack

### Frontend
- **Framework**: Next.js (PWA) + React Query
- **Storage**: IndexedDB via idb
- **Real-time**: Socket.io or EventSource

### Backend
- **Framework**: NestJS + Prisma
- **Validation**: Zod/JOI
- **Background Jobs**: BullMQ

### Database
- **Primary**: Postgres 15
- **Partition**: EVENTS by match_id or time
- **Index**: Composite index (match_id, over, ball)

### Cache & Infrastructure
- **Cache**: Redis 7; pub/sub channels per match; key TTLs
- **Infra**: Terraform; Fly.io/Render/Heroku for quickest start; later EKS/GKE

## 12. Testing Strategy

### Unit Tests
- Rules engine (ball validity, extras, wickets)
- Property-based tests for sequences (no negative overs, ball ≤ 6 + extras logic)

### Integration Tests
- Contract tests for WS/SSE payloads
- Load test: emulate 10k concurrent fans on a hot match; assert <2s latency

## 13. Cost-Conscious Choices

### Performance Optimization
- Keep WS fan connections lightweight; prefer SSE for read-only fans
- Use Redis only for hot matches; evict old matches aggressively
- Resize Postgres vertically before sharding; proper indexing on EVENTS
- Thumbnails & media lifecycle policies (S3 storage tiers)

## 14. Anti-Cheat & Moderation (V2)

### Security Measures
- Dual-scorer mode: two independent scorers → reconcile
- Umpire/organizer approval workflows
- Heuristics: impossible sequences, abnormal run rates → flag
- Reputation for scorers; lock matches after grace period

## 15. Upgrade Path (V2+)

### Advanced Features
- Multi-innings formats, Super Over, DLS support
- Video highlights (HLS) with serverless transcode pipeline
- Advanced analytics: wagon wheels, pitch maps
- Social graph: follows, comments, badges; abuse detection
- Multi-region: geo-replicated read models, edge compute for fan feed

## 16. Learning Pointers

### Why These Choices
- **Event-sourcing light**: Ball-by-ball as append-only truth → easy rebuilds & audits
- **Cache-first reads**: Fans read from Redis/edge; DB protected from thundering herd
- **Idempotency + offline**: Real games have flaky networks; UX must survive it
- **Monolith first, split later**: Fewer moving parts while learning; clear seams for future services

## 17. Next Steps

### Immediate Actions
1. **Set up development environment**
2. **Create database schema**
3. **Implement basic auth system**
4. **Build team and tournament management**
5. **Start on live scoring interface**

### Success Metrics
- **Week 2**: Basic CRUD operations working
- **Week 4**: Live scoring functional
- **Week 6**: Full MVP with real-time updates

This comprehensive blueprint provides everything needed to build the cricket MVP in 4-6 weeks, following your detailed specifications and maintaining focus on the core scoring functionality while building a scalable foundation for future enhancements.

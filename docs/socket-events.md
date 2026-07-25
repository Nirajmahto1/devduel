# DevDuel — Socket.io Event Contract

## Connection
All socket events require a valid JWT token passed during handshake:
```js
const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer <jwt_token>' }
});
```

---

## Matchmaking Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `queue:join` | `{ userId, rating }` | Join the matchmaking queue |
| `queue:leave` | `{ userId }` | Leave the queue |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `queue:waiting` | `{ position }` | Queued, waiting for opponent |
| `queue:matched` | `{ roomId, opponent: { id, username, rating } }` | Match found! Join room. |
| `queue:error` | `{ message }` | Queue error occurred |

---

## Duel Room Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `room:join` | `{ roomId, userId }` | Join a duel room |
| `room:leave` | `{ roomId }` | Leave / forfeit |
| `opponent:status` | `{ roomId, status }` | Broadcast status to opponent |
| `code:run` | `{ roomId, language, code }` | Run against sample test cases |
| `code:submit` | `{ roomId, language, code }` | Submit for full judging |

**Status values**: `'typing'` | `'running'` | `'submitted'` | `'idle'`

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room:ready` | `{ roomId, problem, players, startsAt }` | Both players connected, duel starts |
| `room:countdown` | `{ roomId, secondsRemaining }` | Timer tick (every second) |
| `opponent:update` | `{ status, timestamp }` | Opponent's current status |
| `code:verdict` | `{ submissionId, verdict, testResults, timeMs }` | Execution result |
| `match:end` | `{ winnerId, reason, eloChanges, summary }` | Match concluded |
| `room:error` | `{ message }` | Room error |

**Verdict values**: `'AC'` | `'WA'` | `'TLE'` | `'RE'` | `'CE'` | `'MLE'`

**End reasons**: `'solved'` | `'timeout'` | `'forfeit'` | `'disconnect'`

---

## Lifecycle Flow

```
Client A                    Server                    Client B
   │                          │                          │
   ├── queue:join ───────────►│                          │
   │                          │◄──────── queue:join ─────┤
   │                          │                          │
   │                     [Match found]                   │
   │                          │                          │
   │◄── queue:matched ───────┤──── queue:matched ──────►│
   │                          │                          │
   ├── room:join ────────────►│                          │
   │                          │◄──────── room:join ──────┤
   │                          │                          │
   │◄── room:ready ──────────┤──── room:ready ─────────►│
   │                          │                          │
   │◄── room:countdown ──────┤──── room:countdown ─────►│
   │         ...              │         ...              │
   │                          │                          │
   ├── opponent:status ──────►│                          │
   │                          ├──── opponent:update ────►│
   │                          │                          │
   ├── code:submit ──────────►│                          │
   │                          │                          │
   │◄── code:verdict ────────┤                          │
   │                          │                          │
   │◄── match:end ───────────┤──── match:end ──────────►│
```

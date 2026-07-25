# DevDuel — REST API Contract

Base URL: `http://localhost:5000/api`

## Auth Headers
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

## Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Server health check |

---

## Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register with email/password |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/google` | No | Google OAuth redirect |
| GET | `/auth/google/callback` | No | Google OAuth callback |
| GET | `/auth/github` | No | GitHub OAuth redirect |
| GET | `/auth/github/callback` | No | GitHub OAuth callback |
| POST | `/auth/refresh` | Yes | Refresh JWT token |

### POST `/auth/register`
```json
// Request
{ "username": "niraj", "email": "niraj@example.com", "password": "secure123" }

// Response 201
{ "success": true, "data": { "user": { ... }, "token": "jwt..." } }
```

### POST `/auth/login`
```json
// Request
{ "email": "niraj@example.com", "password": "secure123" }

// Response 200
{ "success": true, "data": { "user": { ... }, "token": "jwt..." } }
```

---

## Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | Yes | Current user profile |
| PATCH | `/users/me` | Yes | Update profile |
| GET | `/users/:id` | No | Public user profile |
| GET | `/users/:id/matches` | No | User's match history |

---

## Problems

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/problems` | No | List problems (paginated) |
| GET | `/problems/:id` | No | Problem detail |
| POST | `/problems` | Admin | Create problem |
| PUT | `/problems/:id` | Admin | Update problem |
| DELETE | `/problems/:id` | Admin | Delete problem |

### Query params for `GET /problems`
- `difficulty` — easy, medium, hard
- `tags` — comma-separated (e.g., `dp,arrays`)
- `page` — page number (default: 1)
- `limit` — items per page (default: 20)

---

## Matches

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/matches/:id` | Yes | Match details & result |
| POST | `/matches/private` | Yes | Create private room |
| POST | `/matches/:id/join` | Yes | Join via invite code |

---

## Submissions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/submissions` | Yes | Submit code for judging |
| GET | `/submissions/:id` | Yes | Submission details & verdict |

---

## Leaderboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard` | No | Global/weekly leaderboard |

### Query params
- `period` — `all` or `weekly` (default: all)
- `limit` — number of results (default: 50)
- `offset` — pagination offset (default: 0)

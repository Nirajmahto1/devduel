<p align="center">
  <img src="docs/assets/logo-placeholder.png" alt="DevDuel Logo" width="120" />
</p>

<h1 align="center">⚔️ DevDuel</h1>
<p align="center">
  <strong>Real-Time Competitive Coding Platform</strong><br/>
  CodeChef meets Chess.com — race to solve, head-to-head.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-in%20development-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-green?style=flat-square" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" />
</p>

---

## 🚀 What is DevDuel?

DevDuel is a **real-time, head-to-head competitive programming platform**. Two players get matched, receive the same problem, and race to solve it — live. Think 1v1 coding battles with Elo ratings, live opponent status, and instant verdicts.

### ✨ Key Features (MVP)

- 🔐 **Auth & Profiles** — Email/OAuth (Google/GitHub), JWT sessions, rating & match history
- 🎯 **Matchmaking** — Quick-match queue, Elo-based pairing (±150 band), private rooms via invite code
- ⚔️ **Live Duel Room** — Shared problem, per-user Monaco editor, live opponent status indicators
- ⏱️ **Server-Synced Timer** — No client-clock cheating
- 🧪 **Code Execution** — Judge0-powered sandboxed execution (C++, Python, Java, JavaScript)
- 🏆 **Scoring & Ratings** — First-correct-solve wins, Elo rating updates, post-match summary
- 📊 **Leaderboard** — Global + weekly, filterable by rating band
- 📚 **Problem Bank** — 100+ curated problems tagged by topic & difficulty

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS |
| Code Editor | Monaco Editor (VS Code engine) |
| Realtime | Socket.io |
| Code Execution | Judge0 (self-hosted, Docker) |
| Backend API | Node.js + Express |
| Auth | JWT + OAuth 2.0 (Passport.js) |
| Database | PostgreSQL |
| Cache / Queue | Redis |
| CI/CD | GitHub Actions + Docker |

---

## 📁 Project Structure

```
devduel/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level pages
│       ├── hooks/          # Custom React hooks
│       ├── services/       # API & socket service layers
│       ├── context/        # React context providers
│       ├── utils/          # Helper functions
│       └── assets/         # Static assets
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # DB, Redis, Judge0 config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, rate-limit, error handling
│   │   ├── models/         # Sequelize/Knex models
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Business logic layer
│   │   ├── sockets/        # Socket.io event handlers
│   │   └── utils/          # Helpers, Elo calculator, etc.
│   ├── migrations/         # DB migrations
│   └── seeds/              # Seed data (problems, test users)
├── judge0/                 # Judge0 config & overrides
├── docs/                   # Architecture docs, API contracts
│   ├── api-contract.md
│   ├── socket-events.md
│   └── db-schema.md
├── docker-compose.yml      # Local dev: Postgres + Redis + Judge0
├── docker-compose.prod.yml # Production overrides
├── .github/
│   └── workflows/
│       └── ci.yml          # CI pipeline
├── .gitignore
├── .env.example
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Docker** & **Docker Compose**
- **Git**

### 1. Clone the repo

```bash
git clone https://github.com/nirajmahto1/devduel.git
cd devduel
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your local config
```

### 3. Start infrastructure (Postgres, Redis, Judge0)

```bash
docker-compose up -d
```

### 4. Install dependencies & run

```bash
# Backend
cd server && npm install && npm run dev

# Frontend (separate terminal)
cd client && npm install && npm run dev
```

### 5. Open in browser

```
Frontend: http://localhost:5173
API:      http://localhost:5000/api
Judge0:   http://localhost:2358
```

---

## 📐 Architecture Overview

```
┌──────────┐     WebSocket      ┌──────────────┐
│  React   │◄──────────────────►│  Socket.io   │
│  Client  │    HTTP/REST       │   Server     │
│          │◄──────────────────►│  (Express)   │
└──────────┘                    └──────┬───────┘
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                     ┌────▼───┐  ┌────▼───┐  ┌────▼────┐
                     │Postgres│  │ Redis  │  │ Judge0  │
                     │  (DB)  │  │(Cache) │  │(Sandbox)│
                     └────────┘  └────────┘  └─────────┘
```

---

## 👥 Team

| Name | Role | Focus Areas |
|---|---|---|
| **Niraj Mahto** | Backend & Infra Lead | Judge0, Socket.io, Redis, PostgreSQL, CI/CD |
| **Anamika Gupta** | Frontend & Product Lead | React UI, Monaco Editor, Dashboards, Admin Panel |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ☕ and competitive spirit.
</p>

# Client (React + Vite + Tailwind)

This directory will contain the React frontend. To be scaffolded by Anamika using:

```bash
npx create-vite@latest ./ --template react
npm install
npm install -D tailwindcss @tailwindcss/vite
```

## Planned Structure
```
src/
├── components/       # Reusable UI components
│   ├── Editor/       # Monaco editor wrapper
│   ├── Timer/        # Countdown timer
│   ├── StatusBadge/  # Opponent status indicator
│   └── Layout/       # Header, sidebar, footer
├── pages/            # Route-level pages
│   ├── Home/
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   ├── DuelRoom/
│   ├── Leaderboard/
│   ├── Profile/
│   └── Admin/
├── hooks/            # Custom React hooks
│   ├── useSocket.js
│   ├── useAuth.js
│   └── useTimer.js
├── services/         # API & socket layers
│   ├── api.js
│   └── socket.js
├── context/          # React context providers
│   ├── AuthContext.js
│   └── SocketContext.js
├── utils/            # Helpers
└── assets/           # Static assets
```

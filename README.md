# Gatore

> A full-stack board game cafe discovery and reservation platform that connects players with local board game cafes.

Gatore helps board game enthusiasts discover nearby cafes, browse game catalogs via BoardGameGeek integration, and make table reservations — all in one place. Cafe owners get a dedicated business portal to manage their venues, tables, and game inventories.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Database Schema](#database-schema)
- [License](#license)

---

## Features

### Customer-Facing

- **Cafe Discovery** — Browse and search board game cafes by location, rating, and game availability
- **Game Search** — Find games across all partner cafes with BoardGameGeek data integration
- **Reservations** — Book tables with party size, time slots, and pre-select games for your session
- **User Preferences** — Set preferred game types, group size, and complexity for personalized recommendations
- **Google OAuth & Email Auth** — Sign up and log in with Google or email/password with OTP verification

### Business Portal

- **Business Dashboard** — Manage tables, games, reservations, and operating hours
- **Access Request System** — Cafe owners request portal access, reviewed and approved by admins
- **Game Issue Tracking** — Staff can report and resolve issues with games (missing pieces, damage, etc.)

---

## Tech Stack

| Layer        | Technology                                                     |
| ------------ | -------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7   |
| **Backend**  | Node.js, Express 5, TypeScript                                 |
| **Database** | PostgreSQL with Prisma 7 ORM                                   |
| **Auth**     | JWT (access + refresh tokens), Google OAuth 2.0, OTP via email |
| **Email**    | Nodemailer (Gmail SMTP) / Resend                               |
| **APIs**     | BoardGameGeek XML API integration                              |

---

## Architecture

```
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────┐
│                      │       │                      │       │              │
│   React SPA          │◄─────►│   Express REST API   │◄─────►│  PostgreSQL  │
│   (Vite / Port 5173) │  API  │   (Port 3000)        │Prisma │              │
│                      │ Proxy │                      │  ORM  │              │
└──────────────────────┘       └──────────┬───────────┘       └──────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │  BoardGameGeek   │
                                │  XML API         │
                                └──────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gatore.git
cd gatore
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Create `.env` files in both `server/` and `client/` directories. See [Environment Variables](#environment-variables) below.

### 4. Set Up the Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 5. Start Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

The client runs at `http://localhost:5173` and proxies API requests to `http://localhost:3000`.

---

## Environment Variables

### Server (`server/.env`)

| Variable                 | Description                      | Example                                        |
| ------------------------ | -------------------------------- | ---------------------------------------------- |
| `PORT`                   | Server port                      | `3000`                                         |
| `NODE_ENV`               | Environment mode                 | `development`                                  |
| `DATABASE_URL`           | PostgreSQL connection string     | `postgresql://user:pass@localhost:5432/gatore` |
| `JWT_SECRET`             | Secret for access token signing  | _(random 256-bit string)_                      |
| `JWT_REFRESH_SECRET`     | Secret for refresh token signing | _(random 256-bit string)_                      |
| `JWT_EXPIRES_IN`         | Access token TTL                 | `15m`                                          |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL                | `7d`                                           |
| `FRONTEND_URL`           | Allowed CORS origin              | `http://localhost:5173`                        |
| `EMAIL_USER`             | Gmail address for sending OTPs   | `your-email@gmail.com`                         |
| `EMAIL_PASS`             | Gmail app password               | _(app-specific password)_                      |
| `GOOGLE_CLIENT_ID`       | Google OAuth client ID           | _(from Google Cloud Console)_                  |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth client secret       | _(from Google Cloud Console)_                  |

### Client (`client/.env`)

| Variable                | Description            | Example                       |
| ----------------------- | ---------------------- | ----------------------------- |
| `VITE_API_URL`          | Backend API base URL   | `http://localhost:3000`       |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | _(from Google Cloud Console)_ |

---

## Available Scripts

### Root

No root-level scripts — run commands from `client/` or `server/` directories.

### Client

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR       |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

### Server

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start with nodemon (auto-reload) |
| `npm run start` | Start compiled production build  |

---

## Project Structure

```
gatore/
├── client/                    # React frontend
│   ├── public/                # Static assets (icons, images)
│   ├── src/
│   │   ├── components/        # Reusable UI + feature components
│   │   ├── context/           # React context providers (Auth)
│   │   ├── hooks/             # Custom hooks (auth, cafes, games, reservations)
│   │   ├── pages/             # Route-level page components
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Constants and validation helpers
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # Express backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Migration history
│   ├── src/
│   │   ├── config/            # Database, JWT, Prisma configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/         # Auth, rate limiter, validation
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Email service
│   │   ├── types/             # Express type extensions
│   │   └── utils/             # JWT, OTP, password, Google helpers
│   └── package.json
│
└── README.md                  # ← You are here
```

---

## API Overview

| Endpoint            | Description                                    |
| ------------------- | ---------------------------------------------- |
| `GET  /`            | Health check                                   |
| `GET  /api/health`  | Database connectivity check                    |
| `/api/auth`         | Registration, login, OTP verification, OAuth   |
| `/api/restaurant`   | Browse and search cafes                        |
| `/api/reservations` | Create, view, and manage reservations          |
| `/api/games`        | Game catalog with filtering and search         |
| `/api/bgg`          | BoardGameGeek data proxy and search            |
| `/api/business`     | Business portal operations and access requests |

All API routes are rate-limited and return JSON responses in the format:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

---

## Database Schema

**14 models** covering the full domain:

- **User** — Accounts with email/Google auth, roles, and preferences
- **OtpCode / RefreshToken** — Authentication infrastructure
- **Restaurant** — Cafe profiles with ratings, hours, and location
- **OperatingHours / Table** — Venue capacity and scheduling
- **Game** — Board game catalog linked to BoardGameGeek
- **RestaurantGame** — Game availability per venue
- **Reservation / GameReservation** — Booking system with game selection
- **GameIssue / StaffAction** — Issue reporting and resolution audit trail
- **BusinessAccessRequest** — Cafe owner onboarding workflow
- **UserPreference** — Player taste profiles for recommendations

See [server/prisma/schema.prisma](server/prisma/schema.prisma) for the full schema.

---

## License

This project is for educational and capstone purposes.

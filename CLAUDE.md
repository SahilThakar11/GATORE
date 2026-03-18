# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GATORE is a full-stack TypeScript app connecting board game café enthusiasts with venues. It has a React/Vite frontend (`client/`) and an Express backend (`server/`), with a PostgreSQL database via Prisma ORM.

## Development Commands

### Frontend (`client/`)
```bash
npm run dev        # Start dev server on port 5173
npm run build      # Type-check then build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Backend (`server/`)
```bash
npm run dev        # Start dev server on port 3000 (via nodemon)
npm start          # Run production build
npx prisma studio  # Open Prisma DB GUI
npx prisma migrate dev  # Run migrations
npx prisma generate     # Regenerate Prisma client after schema changes
```

Both client and server must be running concurrently for full development. The client proxies `/api` requests to `http://localhost:3000`.

## Architecture

### Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, React Router DOM 7
- **Backend**: Express 5, TypeScript, Prisma 7 (PostgreSQL adapter)
- **Database**: PostgreSQL (Neon cloud)
- **Auth**: JWT (15m access / 7d refresh tokens) + Google OAuth + email OTP
- **Email**: nodemailer + Resend
- **External API**: BoardGameGeek (BGG) API for game data

### Authentication Flow
1. User signs up via email/password or Google OAuth
2. Email OTP verification required
3. JWT access + refresh tokens stored in `localStorage`
4. Bearer token sent in `Authorization` header
5. Role-based access control: `user` vs `business` roles
6. Business portal has a separate OTP-only sign-in flow with access request system

### Key Backend Patterns
- Routes in `server/src/routes/` → Controllers in `server/src/controllers/`
- Auth middleware: `authenticate` (required), `optionalAuthenticate`, `authorize(role)`
- Rate limiting applied to all `/api` routes
- Input validation via express-validator

### API Endpoints
| Router | Path | Purpose |
|--------|------|---------|
| auth | `/api/auth` | Login, signup, refresh, logout |
| restaurant | `/api/restaurant` | Café listings and details |
| reservations | `/api/reservations` | Booking CRUD |
| games | `/api/games` | Game database |
| bgg | `/api/bgg` | BoardGameGeek integration |
| business | `/api/business` | Business portal operations |

### Frontend Routing
- Public: `/`, `/find-cafe`, `/how-it-works`, `/find-game`, `/partner-with-us`, `/pricing`, `/about`, `/contact`
- Auth-gated: `/reservations`, `/cafe/:id`
- Role-gated (business): `/business-dashboard`

### State Management
- Global auth state via `AuthContext` (`client/src/context/`)
- No external state library — props + context only

### Database Models (Prisma)
Key entities: `User`, `Restaurant`, `Table`, `Game`, `Reservation`, `GameReservation`, `UserPreference`, `BusinessAccessRequest`, `OtpCode`, `RefreshToken`

Schema lives at `server/prisma/schema.prisma`. After any schema change, run `npx prisma generate` and `npx prisma migrate dev`.

## Environment Variables

The server requires a `.env` file in `server/` with:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`
- `BGG_TOKEN`
- `FRONTEND_URL` (defaults to `http://localhost:5173`)

The client requires a `.env` file in `client/` with:
- `VITE_GOOGLE_CLIENT_ID`

## Testing

No test framework is currently configured. The `npm test` script in `server/` is a placeholder.

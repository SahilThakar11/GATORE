# Gatore — Backend

> Express REST API powering the Gatore board game cafe platform.

---

## Tech Stack

| Technology         | Version | Purpose                             |
| ------------------ | ------- | ----------------------------------- |
| Node.js            | >= 18   | Runtime                             |
| Express            | 5.2     | HTTP framework                      |
| TypeScript         | 5.9     | Type safety                         |
| Prisma             | 7.3     | ORM and database migrations         |
| PostgreSQL         | >= 14   | Relational database                 |
| JSON Web Tokens    | 9.0     | Authentication (access + refresh)   |
| Bcryptjs           | 3.0     | Password hashing                    |
| Nodemailer         | 8.0     | Email delivery (OTP, notifications) |
| Resend             | 6.9     | Alternative email provider          |
| express-validator  | 7.3     | Request validation                  |
| express-rate-limit | 8.2     | API rate limiting                   |
| fast-xml-parser    | 5.4     | BoardGameGeek XML API parsing       |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14 running locally or remotely
- **npm** or **yarn**

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gatore

# JWT
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run all migrations
npx prisma migrate deploy

# (Development) Create and apply a new migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

### Running

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm run start
```

The server starts at `http://localhost:3000` by default.

---

## Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start with nodemon (auto-reload on save) |
| `npm run start` | Run compiled build from `dist/`          |
| `npm test`      | _(not yet configured)_                   |

---

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema (14 models)
│   └── migrations/            # Migration history
│
├── scripts/
│   └── admin-review.ts        # Admin tooling scripts
│
├── src/
│   ├── index.ts               # Application entry point
│   │
│   ├── config/
│   │   ├── database.ts        # PostgreSQL connection pool
│   │   ├── jwt.ts             # Token expiry and secret config
│   │   └── prisma.ts          # Prisma client initialization
│   │
│   ├── controllers/
│   │   ├── authController.ts        # Signup, login, OTP, OAuth, token refresh
│   │   ├── bggController.ts         # BoardGameGeek API proxy
│   │   ├── businessController.ts    # Business portal operations
│   │   ├── preferencesController.ts # User game preferences
│   │   ├── reservationController.ts # Booking CRUD
│   │   └── restaurantController.ts  # Cafe browse, search, details
│   │
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification & role-based access
│   │   ├── rateLimiter.ts     # Request rate limiting
│   │   └── validation.ts      # express-validator rules
│   │
│   ├── routes/
│   │   ├── auth.ts            # /api/auth/*
│   │   ├── bgg.ts             # /api/bgg/*
│   │   ├── business.ts        # /api/business/*
│   │   ├── games.ts           # /api/games/*
│   │   ├── reservation.ts     # /api/reservations/*
│   │   └── restaurant.ts      # /api/restaurant/*
│   │
│   ├── services/
│   │   └── emailService.ts    # OTP email templates and delivery
│   │
│   ├── types/
│   │   └── express.d.ts       # Express type augmentations
│   │
│   └── utils/
│       ├── google.ts          # Google OAuth token verification
│       ├── jwt.ts             # Token generation and verification
│       ├── otp.ts             # OTP code generation
│       └── password.ts        # Password hashing and comparison
│
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

---

## API Reference

### Health

| Method | Endpoint      | Description                |
| ------ | ------------- | -------------------------- |
| GET    | `/`           | Server status              |
| GET    | `/api/health` | Database connectivity test |

### Authentication (`/api/auth`)

| Method | Endpoint      | Description                  | Auth |
| ------ | ------------- | ---------------------------- | ---- |
| POST   | `/signup`     | Register with email/password | No   |
| POST   | `/login`      | Login with credentials       | No   |
| POST   | `/verify-otp` | Verify email with OTP code   | No   |
| POST   | `/google`     | Google OAuth sign-in         | No   |
| POST   | `/refresh`    | Refresh access token         | No   |
| POST   | `/logout`     | Invalidate refresh token     | Yes  |

### Restaurants (`/api/restaurant`)

| Method | Endpoint | Description                   | Auth |
| ------ | -------- | ----------------------------- | ---- |
| GET    | `/`      | List all cafes with filtering | No   |
| GET    | `/:id`   | Get cafe details with games   | No   |

### Reservations (`/api/reservations`)

| Method | Endpoint | Description              | Auth |
| ------ | -------- | ------------------------ | ---- |
| POST   | `/`      | Create a new reservation | Yes  |
| GET    | `/`      | Get user's reservations  | Yes  |

### Games (`/api/games`)

| Method | Endpoint | Description             | Auth |
| ------ | -------- | ----------------------- | ---- |
| GET    | `/`      | Search and filter games | No   |

### BoardGameGeek (`/api/bgg`)

| Method | Endpoint    | Description                | Auth |
| ------ | ----------- | -------------------------- | ---- |
| GET    | `/search`   | Search BGG for board games | No   |
| GET    | `/game/:id` | Get game details from BGG  | No   |

### Business Portal (`/api/business`)

| Method | Endpoint          | Description                    | Auth           |
| ------ | ----------------- | ------------------------------ | -------------- |
| POST   | `/request-access` | Submit business access request | No             |
| POST   | `/verify-otp`     | Verify business email          | No             |
| GET    | `/dashboard`      | Get dashboard data             | Yes (business) |

---

## Authentication Flow

```
┌─────────┐     POST /signup      ┌──────────┐     OTP Email     ┌───────┐
│  Client  │ ──────────────────►  │  Server  │  ──────────────►  │ Email │
│          │                      │          │                    │       │
│          │  POST /verify-otp    │          │                    │       │
│          │ ──────────────────►  │          │                    │       │
│          │                      │          │                    │       │
│          │ ◄── accessToken ──── │          │                    │       │
│          │ ◄── refreshToken ──  │          │                    │       │
│          │                      │          │                    │       │
│          │  POST /refresh       │          │                    │       │
│          │ ──────────────────►  │          │                    │       │
│          │ ◄── new accessToken  │          │                    │       │
└─────────┘                      └──────────┘                    └───────┘
```

- **Access tokens** expire in 15 minutes (configurable)
- **Refresh tokens** expire in 7 days (configurable)
- Passwords are hashed with bcrypt before storage
- OTP codes expire after 10 minutes

---

## Middleware

| Middleware             | Applied To       | Description                            |
| ---------------------- | ---------------- | -------------------------------------- |
| `apiLimiter`           | `/api/*`         | Rate limits all API endpoints          |
| `authenticate`         | Protected routes | Requires valid JWT Bearer token        |
| `optionalAuthenticate` | Optional routes  | Continues if no token present          |
| `authorize(roles)`     | Role-restricted  | Checks user role against allowed roles |

---

## Database Schema

The Prisma schema defines **14 models**:

| Model                   | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `User`                  | Accounts (email/Google auth, roles)           |
| `OtpCode`               | Email verification codes                      |
| `RefreshToken`          | JWT refresh token storage                     |
| `Restaurant`            | Cafe profiles with location and ratings       |
| `OperatingHours`        | Weekly schedule per restaurant                |
| `Table`                 | Seating capacity and availability             |
| `Game`                  | Board game catalog with BGG integration       |
| `RestaurantGame`        | Game inventory per venue                      |
| `Reservation`           | Table bookings with date/time/party size      |
| `GameReservation`       | Games selected for a reservation              |
| `GameIssue`             | Issue reports for damaged/missing games       |
| `StaffAction`           | Audit trail for issue resolution              |
| `BusinessAccessRequest` | Cafe owner onboarding requests                |
| `UserPreference`        | Player preferences (types, complexity, group) |

See [prisma/schema.prisma](prisma/schema.prisma) for full details.

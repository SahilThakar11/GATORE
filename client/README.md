# Gatore — Frontend

> React single-page application for the Gatore board game cafe platform.

---

## Tech Stack

| Technology          | Version | Purpose                  |
| ------------------- | ------- | ------------------------ |
| React               | 19.2    | UI framework             |
| TypeScript          | 5.9     | Type safety              |
| Vite                | 7.2     | Build tool & dev server  |
| Tailwind CSS        | 4.1     | Utility-first styling    |
| React Router        | 7.13    | Client-side routing      |
| Lucide React        | 0.564   | Icon library             |
| @react-oauth/google | 0.13    | Google OAuth integration |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- Backend server running (see `../server/README.md`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Development

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:5173` with hot module replacement. API requests to `/api` are proxied to `http://localhost:3000`.

### Production Build

```bash
npm run build
```

Runs TypeScript type-checking and outputs optimized static files to `dist/`.

```bash
npm run preview
```

Serves the production build locally for verification.

---

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR       |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint across the codebase       |

---

## Project Structure

```
src/
├── components/                # UI and feature components
│   ├── auth/                  # Authentication modals, OAuth, protected routes
│   │   ├── AuthModal.tsx      # Login/signup modal with step-based flow
│   │   ├── GoogleAuthButton.tsx
│   │   ├── ProtectedRoute.tsx # Route guard for authenticated users
│   │   └── steps/             # Multi-step auth form components
│   ├── businessPortal/        # Business owner portal components
│   │   ├── BusinessPortalModal.tsx
│   │   ├── BPSignIn.tsx       # Business sign-in flow
│   │   ├── BPOTPVerify.tsx    # OTP verification for business users
│   │   └── BPRequestAccess.tsx
│   ├── home/                  # Homepage components (cafe cards, filters)
│   ├── reservation/           # Reservation flow components
│   ├── searchGames/           # Game search and filtering
│   ├── ui/                    # Shared UI primitives
│   ├── Header.tsx             # Global navigation header
│   ├── Footer.tsx             # Global footer
│   └── PageHero.tsx           # Reusable hero banner
│
├── context/
│   └── AuthContext.tsx         # Authentication state provider
│
├── hooks/                     # Custom React hooks
│   ├── useAuthModal.ts        # Auth modal state management
│   ├── useBGG.ts              # BoardGameGeek API integration
│   ├── useBusinessPortal.ts   # Business portal logic
│   ├── useCafe.ts             # Cafe data fetching
│   ├── useRecommendedGames.ts # Game recommendation engine
│   ├── useReservationFlow.ts  # Multi-step reservation logic
│   └── useReservations.ts     # User reservation management
│
├── pages/                     # Route-level page components
│   ├── Home.tsx
│   ├── FindCafe.tsx           # Cafe discovery and search
│   ├── FindGame.tsx           # Game search across cafes
│   ├── CafeDetailPage.tsx     # Individual cafe profile
│   ├── Reservations.tsx       # User's booking history
│   ├── BusinessDashboard.tsx  # Business owner dashboard
│   ├── HowItWorks.tsx
│   ├── PartnerWithUs.tsx
│   ├── Pricing.tsx
│   ├── About.tsx
│   └── Contact.tsx
│
├── types/
│   └── reservation.types.ts   # Reservation domain types
│
├── utils/
│   ├── const.ts               # App constants (nav links, game categories)
│   └── validation.ts          # Form validation helpers
│
├── App.tsx                    # Root component with routing
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

---

## Routing

| Path               | Page              | Auth Required  | Notes                             |
| ------------------ | ----------------- | -------------- | --------------------------------- |
| `/`                | Home              | No             | Landing page with featured cafes  |
| `/find-a-cafe`     | FindCafe          | No             | Cafe discovery and search         |
| `/find-a-game`     | FindGame          | No             | Game search across all cafes      |
| `/cafe/:id`        | CafeDetailPage    | No             | Cafe profile with games & booking |
| `/how-it-works`    | HowItWorks        | No             | Platform guide                    |
| `/for-cafe-owners` | PartnerWithUs     | No             | Business signup info              |
| `/partner`         | PartnerWithUs     | No             | Alias for cafe owners page        |
| `/pricing`         | Pricing           | No             | Pricing information               |
| `/about`           | About             | No             | About the platform                |
| `/contact`         | Contact           | No             | Contact form                      |
| `/reservations`    | Reservations      | Yes            | User's booking history            |
| `/dashboard`       | BusinessDashboard | Yes (business) | Business management portal        |

---

## Authentication

The app supports two authentication methods:

1. **Email/Password** — Multi-step signup with OTP email verification
2. **Google OAuth** — One-click sign-in via Google

Auth state is managed through `AuthContext` and persisted in `localStorage` (`accessToken`, `refreshToken`, `authUser`). Protected routes use the `<ProtectedRoute>` component with role-based access control.

---

## Key Conventions

- **Component organization** — Feature-based folders under `components/`
- **Custom hooks** — All data fetching and business logic encapsulated in hooks
- **Type safety** — Strict TypeScript throughout; shared types in `types/`
- **Styling** — Tailwind CSS utility classes; no CSS modules or styled-components

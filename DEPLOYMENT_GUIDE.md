# Gatore Local Deployment Guide

This guide explains how a brand-new user can download the Gatore project, create every required environment variable, obtain every external credential, prepare the database, and run the application locally from start to finish.

This guide is written for the codebase as it exists in this repository on April 7, 2026.

## 1. What You Are Setting Up

Gatore is a full-stack project with two separate apps:

- `client/` = React + Vite frontend
- `server/` = Express + Prisma backend
- PostgreSQL = database used by the backend

Local development uses these default ports:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

The frontend talks to the backend through Vite's development proxy. In development, the client sends requests to `/api/...`, and Vite forwards them to port `3000`.

## 2. What a New User Must Have Before Starting

Install these tools first:

1. Node.js 18 or newer
2. npm
3. PostgreSQL 14 or newer
4. Git

Create or have access to these accounts/services:

1. A Google account for Google OAuth setup
2. A Gmail account for sending OTP emails
3. A BoardGameGeek account for the BGG API token

Recommended version checks:

```powershell
node -v
npm -v
git --version
psql --version
```

If `psql` is not recognized, PostgreSQL may be installed but not added to your `PATH`. That is okay as long as you can still create a database using pgAdmin or the PostgreSQL installer tools.

## 3. Download the Project

### Option A: Clone with Git

```powershell
git clone <repository-url>
cd Gatore
```

Replace `<repository-url>` with the actual Git repository URL.

### Option B: Download a ZIP

1. Download the project ZIP from the repository host.
2. Extract it to a normal folder, not inside a protected system folder.
3. Open a terminal inside the extracted `Gatore` folder.

## 4. Understand the Repository Layout

At the root of the repo you should see:

```text
Gatore/
  client/
  server/
  README.md
  DEPLOYMENT_GUIDE.md
```

Important note:

- There is no root `package.json`.
- You must run frontend commands inside `client/`.
- You must run backend commands inside `server/`.

## 5. Install Project Dependencies

Open a terminal in the repository root and run:

```powershell
cd server
npm install

cd ..\client
npm install
```

If the project is being installed on macOS or Linux, use:

```bash
cd server
npm install

cd ../client
npm install
```

## 6. Create the PostgreSQL Database

Gatore needs a PostgreSQL database before the backend can start.

### Option A: Create a local PostgreSQL database

If you are using `psql`, run:

```powershell
psql -U postgres
```

Then inside the PostgreSQL prompt:

```sql
CREATE DATABASE gatore;
```

If your PostgreSQL username is not `postgres`, use your actual username.

Example local connection string:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gatore
```

### Option B: Use a hosted PostgreSQL database

You can also use a managed PostgreSQL service such as Neon, Supabase, Railway, Render, or another PostgreSQL provider. If you do this, use the exact connection string they give you.

Important:

- The backend and Prisma both depend on `DATABASE_URL`.
- If your provider requires SSL, keep the SSL parameters included in the connection string.

## 7. Create the Server Environment File

Inside `server/`, create a file named `.env`.

The fastest way is to copy the example file:

```powershell
cd server
Copy-Item .env.example .env
```

If `Copy-Item` fails because the example file does not exist yet on the user's machine, create the file manually and paste the template below.

Use this template:

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gatore

# JWT
JWT_SECRET=GENERATE_A_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=GENERATE_ANOTHER_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=optional-currently-unused-by-runtime

# BoardGameGeek API
BGG_TOKEN=your-boardgamegeek-token
```

### What each server variable does

- `PORT`: port the backend listens on
- `NODE_ENV`: environment mode; use `development` locally
- `FRONTEND_URL`: allowed frontend origin for CORS and email links
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: secret used to sign access tokens
- `JWT_REFRESH_SECRET`: secret used to sign refresh tokens
- `JWT_EXPIRES_IN`: access token lifetime
- `JWT_REFRESH_EXPIRES_IN`: refresh token lifetime
- `EMAIL_USER`: Gmail address used to send OTP emails
- `EMAIL_PASS`: Gmail App Password, not your normal Gmail password
- `GOOGLE_CLIENT_ID`: frontend Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: included for completeness, but the current backend code does not read it
- `BGG_TOKEN`: token required by the BoardGameGeek API routes

## 8. Generate the JWT Secrets

Do not invent short secrets like `abc123`. Use long cryptographically random values.

### PowerShell method

Run this once for the access-token secret:

```powershell
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToHexString($bytes).ToLower()
```

Run it again for the refresh-token secret.

Then paste the two generated values into:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### OpenSSL method

If OpenSSL is available:

```bash
openssl rand -hex 64
openssl rand -hex 64
```

Use the first output for `JWT_SECRET` and the second for `JWT_REFRESH_SECRET`.

## 9. Create the Client Environment File

Inside `client/`, create a file named `.env`.

The easiest method is:

```powershell
cd ..\client
Copy-Item .env.example .env
```

Use this content:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

Important:

- The current frontend code reads `VITE_GOOGLE_CLIENT_ID`.
- The current frontend code does not use `VITE_API_URL`.
- API calls are relative and depend on the Vite proxy during development.

## 10. Set Up Google OAuth

Google sign-in will not work until you create an OAuth client and register your local origin.

High-level setup:

1. Go to the Google Cloud Console.
2. Create a project or reuse an existing project.
3. Configure the OAuth consent screen.
4. Create an OAuth Client ID for a Web application.
5. Add your local frontend origin.
6. Copy the generated Client ID into both:
   - `server/.env` as `GOOGLE_CLIENT_ID`
   - `client/.env` as `VITE_GOOGLE_CLIENT_ID`

### Exact local values to add

For local development, add these JavaScript origins if you plan to use them:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Use at least `http://localhost:5173`, because that is the default frontend URL in this repo.

### Important note about the current code

The frontend obtains a Google access token and sends it to the backend. The backend then calls Google's userinfo endpoint. In the current codebase:

- `GOOGLE_CLIENT_ID` is required by the frontend flow
- `GOOGLE_CLIENT_SECRET` is present in the existing env template style, but the backend does not currently use it at runtime

Official references:

- [Google OAuth web client setup](https://support.google.com/workspacemigrate/answer/9222992?hl=en)
- [Google Cloud OAuth domain/origin help](https://support.google.com/cloud/answer/7650096?hl=en)

## 11. Set Up Gmail SMTP for OTP Emails

This project sends OTP codes by email. It is configured to use Gmail through Nodemailer.

You must use a Gmail App Password, not your normal Gmail password.

### Step-by-step

1. Sign in to the Gmail or Google account you want the app to send from.
2. Turn on 2-Step Verification for that account.
3. Open the Google App Passwords page.
4. Generate a new app password for Mail.
5. Copy the generated 16-character password.
6. Put that value into `EMAIL_PASS`.
7. Put the Gmail address into `EMAIL_USER`.

Important:

- If 2-Step Verification is not enabled, App Passwords will not be available.
- If `EMAIL_USER` or `EMAIL_PASS` is wrong, signup OTP and business OTP flows will fail.

Official reference:

- [Google Account Help: Sign in with app passwords](https://support.google.com/accounts/answer/185833?hl=en)

## 12. Get the BoardGameGeek Token

The BGG endpoints in this codebase require `BGG_TOKEN`.

The backend will return an error if `BGG_TOKEN` is missing.

### What to do

1. Create or sign in to a BoardGameGeek account.
2. Request access according to the BoardGameGeek XML API instructions.
3. Wait for approval if required.
4. Copy the token they provide.
5. Put that token into `server/.env` as `BGG_TOKEN`.

Important note:

- Based on BoardGameGeek's XML API documentation, registration is required and approval can take time.
- Do this early so it does not block the rest of setup.

Reference:

- [BoardGameGeek XML API2](https://boardgamegeek.com/wiki/page/BGG_XML_API2)

## 13. Run Prisma Client Generation and Database Migrations

Once `server/.env` is complete, set up the database schema.

From the `server/` directory:

```powershell
cd server
npx prisma generate
npx prisma migrate deploy
```

What these commands do:

- `npx prisma generate`: creates the Prisma client used by the backend
- `npx prisma migrate deploy`: applies the existing migration history to your database

Optional but useful:

```powershell
npx prisma studio
```

That opens Prisma Studio so you can inspect tables and data in a browser.

Important:

- This repository includes migrations.
- This repository does not include seed data.
- A fresh database will start empty.

## 14. Start the Backend

In one terminal:

```powershell
cd server
npm run dev
```

You should see the backend listening on port `3000`.

Useful URLs:

- `http://localhost:3000/`
- `http://localhost:3000/api/health`

If `/api/health` fails, the most common causes are:

1. `DATABASE_URL` is wrong
2. PostgreSQL is not running
3. Migrations were not applied
4. `PORT` is already in use

## 15. Start the Frontend

In a second terminal:

```powershell
cd client
npm run dev
```

Then open:

```text
http://localhost:5173
```

If the frontend starts but API features fail:

1. Make sure the backend is already running on port `3000`
2. Make sure the frontend is running on port `5173`
3. Make sure `FRONTEND_URL=http://localhost:5173` in `server/.env`

## 16. First Validation Checklist

After both servers are running, verify the following:

1. Homepage opens at `http://localhost:5173`
2. Backend root route responds at `http://localhost:3000/`
3. Health route responds at `http://localhost:3000/api/health`
4. Email signup can request an OTP
5. Google sign-in button opens the Google popup
6. Search pages load without immediate backend errors

## 17. Understand the Empty Database State

A brand-new database will not contain cafes, tables, games, or reservations.

That means:

- The UI may load correctly but show empty lists
- Cafe discovery may return no cafes
- Business dashboards will be empty until a business account completes setup

This is normal for a fresh install.

## 18. How to Create a Normal User for Testing

To test the standard user flow:

1. Open the frontend.
2. Start signup with an email address.
3. Check the inbox for the OTP.
4. Submit the OTP.
5. Complete the password step.

Password requirements enforced by the backend:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Example valid password:

```text
BoardGame123!
```

## 19. How to Create and Approve a Business User

The business flow has one extra step: approval.

### Step 1: Submit a business access request

From the frontend:

1. Open the business or partner flow.
2. Submit a business access request.

This creates a `BusinessAccessRequest` row in the database with `pending` status.

### Step 2: Approve the request from the admin script

From the `server/` directory:

```powershell
npx ts-node scripts/admin-review.ts
```

What the script does:

1. Reads pending business access requests
2. Lets the admin approve, reject, or skip them
3. Creates or upgrades the user to the `business` role
4. Sends an approval or rejection email

Important:

- This script depends on valid `DATABASE_URL`, `EMAIL_USER`, and `EMAIL_PASS`
- If email sending fails, approval logic may still run, but the notification email will not send correctly

### Step 3: Sign in through the Business Portal

After approval:

1. Use the business sign-in flow
2. Receive a business OTP email
3. Verify the OTP
4. Complete the business setup wizard

### Step 4: Complete the business setup wizard

The business setup flow creates the restaurant and stores:

- Profile details
- Tables
- Operating hours
- Pricing

After setup, the business dashboard becomes usable.

## 20. Useful Database Tables to Inspect During Setup

If something seems wrong, open Prisma Studio and inspect these tables first:

- `users`
- `otp_codes`
- `refresh_tokens`
- `business_access_requests`
- `restaurants`
- `tables`
- `operating_hours`
- `games`
- `restaurant_games`
- `reservations`

Examples:

- If OTP is not working, inspect `otp_codes`
- If login is failing, inspect `users` and `refresh_tokens`
- If a business dashboard says no restaurant is linked, inspect `users.restaurant_id`

## 21. Recommended Verification Commands

Run these after setup to confirm the codebase is healthy.

Important note before you run them:

- As of April 7, 2026, the frontend test suite passes, but `client/npm run build` currently fails because of existing TypeScript errors already present in the repository.
- That frontend build failure is a current codebase issue, not a local environment setup issue.

### Frontend

```powershell
cd client
npm run build
npm run test -- --run
```

### Backend

```powershell
cd server
npm test -- --runInBand
npx tsc -p tsconfig.json
```

Why `npx tsc` is included:

- The backend `package.json` has `npm run start`
- `npm run start` expects compiled output in `server/dist/index.js`
- The repository currently does not define a `build` script for the backend

So if someone wants a production-style local start for the backend, they must compile manually first:

```powershell
cd server
npx tsc -p tsconfig.json
npm run start
```

## 22. Important Codebase-Specific Notes

These details matter because the current code does not exactly match the older README guidance.

### Client env variables

- `VITE_GOOGLE_CLIENT_ID` is used
- `VITE_API_URL` is not used by the current frontend code

### Google secret

- `GOOGLE_CLIENT_SECRET` is documented in older files
- The current runtime code does not read it

### API routing

- Frontend requests are relative, such as `/api/auth/...`
- Development works because Vite proxies `/api` to `http://localhost:3000`
- If you ever deploy the frontend as static files outside Vite, you must provide a reverse proxy or serve the API under the same origin

### Migrations

- The repository has migrations
- The repository does not have seed data

### Current frontend build status

- Local development can still run with `npm run dev`
- Frontend tests can still run
- A production-style frontend build is currently blocked by existing TypeScript errors in the repository

## 23. Troubleshooting

### Problem: frontend loads but API calls fail

Check:

1. Backend is running on port `3000`
2. Frontend is running on port `5173`
3. `FRONTEND_URL` matches the frontend URL
4. Backend terminal does not show CORS or database errors

### Problem: OTP emails are not sent

Check:

1. `EMAIL_USER` is a real Gmail address
2. `EMAIL_PASS` is an App Password, not the regular password
3. The Gmail account has 2-Step Verification enabled

### Problem: Google popup opens but login fails

Check:

1. `VITE_GOOGLE_CLIENT_ID` is correct
2. `http://localhost:5173` is listed as an authorized JavaScript origin
3. You restarted the frontend after changing `.env`

### Problem: health check fails

Check:

1. PostgreSQL is running
2. `DATABASE_URL` is correct
3. The `gatore` database exists
4. `npx prisma migrate deploy` completed successfully

### Problem: BGG pages fail

Check:

1. `BGG_TOKEN` exists in `server/.env`
2. The token is valid
3. Your BGG API access has been approved

### Problem: business dashboard says no restaurant linked

Check:

1. The business request was approved through `scripts/admin-review.ts`
2. The business user completed the setup wizard
3. The `users.restaurant_id` field was populated

## 24. Safe Setup Rules for New Users

Tell every new user to follow these rules:

1. Never commit `.env` files
2. Never share real secrets in screenshots or screen recordings
3. Use placeholder values in documentation
4. Rotate any secret that was accidentally shared
5. Restart the relevant server after changing `.env`

## 25. Quick Start Summary

If someone already understands the details above, this is the short version:

```powershell
git clone <repository-url>
cd Gatore

cd server
npm install
Copy-Item .env.example .env
# Fill in .env
npx prisma generate
npx prisma migrate deploy
npm run dev

# New terminal
cd client
npm install
Copy-Item .env.example .env
# Fill in .env
npm run dev
```

Then open `http://localhost:5173`.

## 26. External References

- [Google OAuth web client setup](https://support.google.com/workspacemigrate/answer/9222992?hl=en)
- [Google Cloud OAuth domain/origin help](https://support.google.com/cloud/answer/7650096?hl=en)
- [Google App Passwords help](https://support.google.com/accounts/answer/185833?hl=en)
- [BoardGameGeek XML API2](https://boardgamegeek.com/wiki/page/BGG_XML_API2)

# ✈️ Share My Itinerary

A full-stack travel expense tracker built with **Next.js 14**, **MongoDB Atlas**, **Google Maps Places API**, and **NextAuth.js**. Register or sign in with Google, create trips, log categorised expenses, and filter by category — fully containerised with Podman.

---

## Table of Contents

- [Changelog](#changelog)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Google Maps API Setup](#google-maps-api-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Local Development](#local-development)
- [Running with Podman](#running-with-podman)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)

---

## Changelog

### v3 — 2026-02-23
- 📄 Expanded README with Google OAuth setup guide, security documentation, and full changelog

### v2 — 2026-02-23
- 🔐 Added **NextAuth.js v4** authentication (Google OAuth + local email/password)
- 👤 New `User` model in MongoDB (name, email, bcrypt-hashed password, googleId, image)
- 📝 `/register` page — create a local account with name, email, and password
- 🔑 `/login` page — sign in with Google or email/password
- 🛡️ Route protection via `middleware.js` (`withAuth`) — unauthenticated users redirected to `/login`
- 🔒 All API routes protected with `getServerSession`; trip/expense ownership verified (403 on mismatch)
- 🧑‍💼 `UserNav` component in header — shows avatar (initials), display name, and sign-out button
- 🔗 Google account auto-linked to existing local account on first Google sign-in
- 🗝️ Passwords hashed with **bcrypt** (cost factor 10) — never stored in plain text
- 🌐 `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` added to env

### v1 — 2026-02-23
- 🚀 Initial release — containerised Next.js travel expense tracker
- 🗺️ Trip management (create, view, delete) with Google Maps location autocomplete
- 💸 Expense tracking with categories, amounts, currencies, and dates
- 🐳 Multi-stage Podman build (`~188MB` image, non-root user)
- ⚙️ Runtime secret injection via `env_file` — secrets never baked into image
- 📦 `podman-compose.yml` for single-command start

---

## Features

- **Authentication** — register with email/password or sign in with Google; accounts are automatically linked
- Create and manage trips with destination, dates, and currency
- Add categorised expenses (Food, Transport, Accommodation, Activities, Shopping, Health, Other)
- Location autocomplete powered by Google Maps Places API
- Multi-currency support with per-currency expense totals
- Filter expenses by category
- Per-user data isolation — users only see their own trips and expenses
- Fully containerised — runs identically in development and production

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS 3 |
| Icons | Lucide React |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | NextAuth.js v4 (JWT sessions) |
| Password hashing | bcryptjs (cost factor 10) |
| Maps | Google Maps JavaScript API (Places) |
| Container | Podman + podman-compose |

---

## Prerequisites

- **Node.js** >= 18.17 (`node --version`)
- **npm** >= 9 (`npm --version`)
- **Podman** >= 4 + **podman-compose** (for containerised run)
- A **MongoDB Atlas** account (free tier works)
- A **Google Cloud** account (for Maps API key and/or OAuth)

---

## MongoDB Atlas Setup

### 1. Create a free cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in
2. Click **"Build a Database"** → choose **Free (M0)** tier
3. Select a cloud provider and region → click **"Create"**

### 2. Create a database user

1. In the left sidebar go to **Security → Database Access**
2. Click **"Add New Database User"**
3. Choose **Password authentication** — note the username and password
4. Set role to **"Atlas admin"** or **"Read and write to any database"**
5. Click **"Add User"**

### 3. Whitelist your IP address

1. Go to **Security → Network Access**
2. Click **"Add IP Address"**
3. For development: click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   > ⚠️ For production, restrict to your server's IP only.
4. Click **"Confirm"**

### 4. Get your connection string

1. Go to **Database → Connect → Drivers**
2. Select **Node.js** driver
3. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with the credentials from step 2
5. Add your database name before `?`:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/travel_expenses?retryWrites=true&w=majority&appName=<cluster>
   ```

---

## Google Maps API Setup

### 1. Create a Google Cloud project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector at the top → **"New Project"**
3. Give it a name (e.g. `share-my-itinerary`) → **"Create"**

### 2. Enable the required APIs

1. In the left menu go to **APIs & Services → Library**
2. Search for and enable:
   - **Maps JavaScript API**
   - **Places API**

### 3. Create an API key

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials" → "API Key"**
3. Copy the generated key

### 4. Restrict the key (recommended)

1. Click the pencil icon on your API key
2. Under **Application restrictions** → select **HTTP referrers**
3. Add `http://localhost:3000/*` for development
4. Under **API restrictions** → select **Restrict key** → choose **Maps JavaScript API** and **Places API**
5. Click **Save**

---

## Google OAuth Setup

Google OAuth lets users sign in with their Google account. It also links to existing local accounts automatically.

### 1. Use the same Google Cloud project as Maps

You can reuse the project you created above, or create a new one.

### 2. Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** (works for personal projects) → **Create**
3. Fill in the required fields:
   - **App name** — e.g. `Share My Itinerary`
   - **User support email** — your email
   - **Developer contact information** — your email
4. Click **Save and Continue** through the remaining steps
5. On the **Test users** step, add your own Google email so you can test before publishing
6. Click **Back to Dashboard**

### 3. Create an OAuth 2.0 client

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials" → "OAuth 2.0 Client IDs"**
3. Set **Application type** to **Web application**
4. Give it a name (e.g. `Share My Itinerary Web`)
5. Under **Authorised JavaScript origins**, add:
   ```
   http://localhost:3000
   ```
6. Under **Authorised redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** — you'll need these for `.env.local`

> ⚠️ For production, add your production domain to both origins and redirect URIs, e.g.:
> ```
> https://yourdomain.com
> https://yourdomain.com/api/auth/callback/google
> ```

### 4. How it works in the app

- Clicking **"Continue with Google"** on the login page triggers Google's OAuth flow
- After consent, Google sends a callback to `/api/auth/callback/google`
- NextAuth verifies the token, retrieves the user's profile (name, email, avatar), and:
  - Creates a new user in MongoDB if the email doesn't exist
  - Links the Google account to an existing local account if the email matches
- A JWT session is created and the user lands on the dashboard

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/travel_expenses?retryWrites=true&w=majority&appName=<cluster>

# Google Maps JavaScript API key (server-side, injected at runtime)
GOOGLE_MAPS_API_KEY=<your-maps-api-key>

# NextAuth — base URL of your app
NEXTAUTH_URL=http://localhost:3000

# NextAuth — random secret used to sign JWT tokens
# Generate one with: openssl rand -base64 32
NEXTAUTH_SECRET=<your-random-secret>

# Google OAuth credentials (from Google Cloud Console → Credentials)
GOOGLE_CLIENT_ID=<your-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-oauth-client-secret>
```

> `.env.local` is listed in `.dockerignore` and `.gitignore` — it is **never** committed or baked into the image.

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output into your `.env.local`.

---

## Security

### Password storage

Passwords are **never stored in plain text**. Before saving to MongoDB, every password is hashed using **bcrypt** with a cost factor of 10:

```
user inputs "mypassword"
        ↓
bcrypt.hash("mypassword", 10)
        ↓
"$2a$10$X9v7kL...randomhash..." ← stored in MongoDB
```

When signing in, `bcrypt.compare` checks the input against the stored hash — the raw password never touches the database again.

| Protection | Detail |
|-----------|--------|
| Hashing algorithm | bcrypt (industry standard) |
| Salt | Randomly generated per password (built into bcrypt) |
| Cost factor | 10 — each hash takes ~100ms, slowing brute-force attacks |
| Plain text | Never stored |
| Timing attacks | `bcrypt.compare` is constant-time |
| Rainbow tables | Defeated by per-user random salt |

### Session security

- Sessions use **JWT tokens** signed with `NEXTAUTH_SECRET` — never stored in the database
- JWTs expire after the NextAuth default session lifetime (30 days)
- Tokens are `HttpOnly` cookies — not accessible from JavaScript in the browser

### Route protection

- `middleware.js` runs on every request before the page renders
- Unauthenticated requests to any protected route are redirected to `/login`
- All API routes verify the session with `getServerSession` before touching the database
- Trip and expense ownership is checked on every mutating request — a user cannot read or modify another user's data (returns `403 Forbidden`)

### Secrets management

- All secrets live in `.env.local` — excluded from git and Docker image
- Injected into the container at **runtime** via `env_file` in `podman-compose.yml`
- `GOOGLE_MAPS_API_KEY` is server-side only (no `NEXT_PUBLIC_` prefix) — never exposed to the client

### What to do if you suspect a breach

1. Rotate `NEXTAUTH_SECRET` — all existing sessions are immediately invalidated
2. Rotate your `MONGODB_URI` password in Atlas
3. Revoke and regenerate your Google OAuth client secret
4. Bcrypt-hashed passwords remain safe even if the database is exposed

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your keys (see Environment Variables above)

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You will be redirected to `/login`. You can:
- Register a local account at `/register`
- Sign in with email/password
- Sign in with Google (requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`)

---

## Running with Podman

### Install Podman (macOS)

```bash
brew install podman podman-compose
podman machine init
podman machine start
```

### Build and run

```bash
# Build image and start container (reads secrets from .env.local at runtime)
podman-compose -f podman-compose.yml up --build -d

# View logs
podman logs -f share-my-itenary

# Stop
podman-compose -f podman-compose.yml down
```

Open [http://localhost:3000](http://localhost:3000).

### How secrets are injected

The `podman-compose.yml` uses `env_file: .env.local` to inject all variables into the container at **runtime** — they are never baked into the image.

```
.env.local  ──[env_file]──▶  container environment  ──▶  process.env.*
```

### Rebuild for a new release

```bash
podman-compose -f podman-compose.yml down
podman-compose -f podman-compose.yml up --build -d
```

### Image tags

```bash
# Tag current build
podman tag share-my-itenary:latest share-my-itenary:v3

# List images
podman images share-my-itenary
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Create optimised production build |
| `npm run start` | Start production server (after build) |
| `podman-compose -f podman-compose.yml up --build -d` | Build image and run container (background) |
| `podman-compose -f podman-compose.yml down` | Stop and remove container |
| `podman logs -f share-my-itenary` | Tail container logs |
| `openssl rand -base64 32` | Generate a NEXTAUTH_SECRET value |

---

## Project Structure

```
share-my-itenary/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js    # NextAuth handler (GET + POST)
│   │   │   └── register/route.js        # POST /api/auth/register
│   │   ├── trips/
│   │   │   ├── route.js                 # GET /api/trips, POST /api/trips
│   │   │   └── [id]/
│   │   │       ├── route.js             # GET/PUT/DELETE /api/trips/:id
│   │   │       └── expenses/route.js    # GET/POST /api/trips/:id/expenses
│   │   └── expenses/
│   │       └── [id]/route.js            # DELETE /api/expenses/:id
│   ├── login/page.js                    # Login page (Google + credentials)
│   ├── register/page.js                 # Registration page
│   ├── trips/
│   │   ├── new/page.js                  # Create trip form
│   │   └── [id]/page.js                 # Trip detail + expenses
│   ├── layout.js                        # Root layout + AuthProvider + UserNav
│   └── page.js                          # Dashboard (protected)
├── components/
│   ├── AuthProvider.js                  # SessionProvider wrapper
│   ├── UserNav.js                       # Header avatar + sign-out
│   └── LocationAutocomplete.js          # Google Places input
├── lib/
│   ├── auth.js                          # Shared NextAuth authOptions
│   ├── mongodb.js                       # DB connection singleton
│   └── models/
│       ├── User.js                      # User schema (bcrypt password)
│       ├── Trip.js                      # Trip schema (userId ref)
│       └── Expense.js                   # Expense schema
├── middleware.js                        # Route protection (withAuth)
├── Dockerfile                           # Multi-stage Podman/Docker build
├── podman-compose.yml                   # Container orchestration
└── .env.local                           # Local secrets (never committed)
```

# ✈️ Share My Itinerary

A full-stack travel expense tracker built with **Next.js 14**, **MongoDB Atlas**, and **Google Maps Places API**. Track trips, log categorised expenses, and filter by category — fully containerised with Podman.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Google Maps API Setup](#google-maps-api-setup)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Running with Podman](#running-with-podman)
- [Available Scripts](#available-scripts)

---

## Features

- Create and manage trips with destination, dates, and currency
- Add categorised expenses (Food, Transport, Accommodation, Activities, Shopping, Health, Other)
- Location autocomplete powered by Google Maps Places API
- Multi-currency support with per-currency expense totals
- Filter expenses by category
- Fully containerised — runs identically in development and production

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS 3 |
| Icons | Lucide React |
| Database | MongoDB Atlas + Mongoose 8 |
| Maps | Google Maps JavaScript API (Places) |
| Container | Podman + podman-compose |

---

## Prerequisites

- **Node.js** >= 18.17 (`node --version`)
- **npm** >= 9 (`npm --version`)
- **Podman** >= 4 + **podman-compose** (for containerised run)
- A **MongoDB Atlas** account (free tier works)
- A **Google Cloud** account (for Maps API key)

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

## Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/travel_expenses?retryWrites=true&w=majority&appName=<cluster>

# Google Maps JavaScript API key
GOOGLE_MAPS_API_KEY=<your-api-key>
```

> `.env.local` is listed in `.dockerignore` and `.gitignore` — it is **never** committed or baked into the image.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your keys (see above)

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

The `podman-compose.yml` uses `env_file: .env.local` to inject `MONGODB_URI` and `GOOGLE_MAPS_API_KEY` into the container at **runtime** — they are never baked into the image.

```
.env.local  ──[env_file]──▶  container environment  ──▶  process.env.*
```

### Image tags

```bash
# Tag current build as a release
podman tag share-my-itenary:latest share-my-itenary:v1

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

---

## Project Structure

```
share-my-itenary/
├── app/
│   ├── api/
│   │   ├── trips/
│   │   │   ├── route.js              # GET /api/trips, POST /api/trips
│   │   │   └── [id]/
│   │   │       ├── route.js          # GET/PUT/DELETE /api/trips/:id
│   │   │       └── expenses/
│   │   │           └── route.js      # GET/POST /api/trips/:id/expenses
│   │   └── expenses/
│   │       └── [id]/route.js         # DELETE /api/expenses/:id
│   ├── trips/
│   │   ├── new/page.js               # Create trip form
│   │   └── [id]/page.js              # Trip detail + expenses
│   ├── layout.js                     # Root layout + Google Maps script
│   └── page.js                       # Dashboard
├── components/
│   └── LocationAutocomplete.js       # Google Places input
├── lib/
│   ├── mongodb.js                    # DB connection singleton
│   └── models/
│       ├── Trip.js                   # Trip schema
│       └── Expense.js                # Expense schema
├── Dockerfile                        # Multi-stage Podman/Docker build
├── podman-compose.yml                # Container orchestration
└── .env.local                        # Local secrets (never committed)
```

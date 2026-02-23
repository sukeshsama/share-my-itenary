# Travel Expenses Tracker — Setup Guide

## Prerequisites
- Node.js >= 18.17 (use `brew install node@22` if needed)
- A MongoDB Atlas account (free tier works)
- A Google Cloud account (for Maps Places autocomplete)

---

## 1. MongoDB Atlas

1. Sign up at https://cloud.mongodb.com (free)
2. Create a **Cluster** (M0 free tier)
3. Under **Database Access**, create a user with read/write access
4. Under **Network Access**, add `0.0.0.0/0` (allow all) or your IP
5. Click **Connect → Drivers** and copy the connection string

Paste the string into `.env.local`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/travel_expenses?retryWrites=true&w=majority
```

---

## 2. Google Maps API (for location autocomplete)

1. Go to https://console.cloud.google.com
2. Create a project (or use an existing one)
3. Enable **Maps JavaScript API** and **Places API**
4. Create an **API Key** under Credentials
5. (Optional) Restrict the key to your domain for security

Paste into `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

> If you skip this step, location search won't autocomplete but you can still type locations manually.

---

## 3. Run the app

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Features
- Create trips with destination (Google Maps autocomplete), dates, and default currency
- Add expenses with: description, amount, currency, category, location, date, notes
- Per-trip totals grouped by currency
- Filter expenses by category (Food, Transport, Accommodation, etc.)
- All data stored in MongoDB Atlas

## Data Schema (MongoDB)

**trips** collection:
```json
{ "name": "Japan Spring", "destination": "Tokyo, Japan",
  "startDate": "2025-03-01", "endDate": "2025-03-15",
  "currency": "JPY", "notes": "..." }
```

**expenses** collection:
```json
{ "tripId": "<ref>", "description": "Dinner at Sakura",
  "amount": 3500, "currency": "JPY",
  "category": "Food & Drink", "location": "Shinjuku, Tokyo",
  "date": "2025-03-05", "notes": "..." }
```

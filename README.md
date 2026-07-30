# Testimonial Platform

A full-stack testimonial collection and moderation platform. Businesses collect feedback from customers, moderate submissions, and showcase approved testimonials on their website through an embeddable widget.

**Live Demo:** [Frontend](https://testimonials-frontend-XXXX.onrender.com) · [Backend API](https://testimonials-backend-XXXX.onrender.com/health)

> Replace the placeholder URLs above with your actual Render deployment URLs after deploying.

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string ([free tier](https://cloud.mongodb.com))

### 1. Backend

```bash
cd Backend
cp .env.example .env        # then fill in your MONGODB_URI
npm install
npm run dev                  # → http://localhost:5000
```

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev                  # → http://localhost:5173
```

### 3. Embed Widget Demo

Open `embed-demo.html` (repo root) in any browser while both servers are running. This simulates a third-party site embedding the testimonial widget via iframe.

---

## What's Built

### P0 — Core Loop ✅

The end-to-end flow works: **Submit → Pending in Dashboard → Approve → Visible on Wall**.

| Feature | Status |
|---|---|
| Submission form (name, email, company, text, star rating, photo URL) | ✅ |
| Backend API with MongoDB Atlas persistence | ✅ |
| Moderation dashboard with approve / reject actions | ✅ |
| Public wall showing only approved testimonials | ✅ |

### P1 — Extras ✅

| Feature | Status |
|---|---|
| Embeddable iframe widget with accent color + card limit customization | ✅ |
| `embed-demo.html` proving the widget works on a third-party page | ✅ |
| Honeypot anti-spam (hidden field bots fill, humans skip) | ✅ |
| Duplicate detection (same email + text within 24h → 409) | ✅ |
| Paginated API responses + "Load More" on frontend | ✅ |
| Loading skeletons, error states, empty states on every page | ✅ |
| Live card preview on the submission form | ✅ |

### P2 — Stretch

| Feature | Status |
|---|---|
| AI-powered sentiment analysis | ❌ Not implemented |
| Live deployment on Render | ✅ |

---

## Architecture

```
Testimonials/
├── Backend/                  # Express.js REST API
│   ├── index.js              # Server entry point
│   └── src/
│       ├── db.js             # MongoDB connection
│       ├── Controller/       # Request handlers (pagination, honeypot, dedup)
│       ├── Models/           # Mongoose schemas (validation, status enum)
│       ├── Routes/           # Express route definitions
│       └── Middleware/       # Error handling
├── Frontend/                 # Vite + React 19 + TypeScript + TailwindCSS v4
│   └── src/
│       ├── api.ts            # Axios client (typed, centralized)
│       ├── types.ts          # Shared TypeScript interfaces
│       ├── components/       # StarRating, TestimonialCard
│       └── pages/            # SubmitForm, Wall, Dashboard, EmbedWidget
├── embed-demo.html           # Standalone widget demo (third-party proof)
├── .agents/AGENTS.md         # Agent steering rules
├── JOURNAL.md                # Decision journal
└── README.md                 # This file
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/testimonials` | Submit a new testimonial (always starts as `pending`) |
| `GET` | `/api/testimonials?status=&page=&limit=` | List testimonials with optional status filter + pagination |
| `PATCH` | `/api/testimonials/:id` | Update status to `approved` or `rejected` |
| `GET` | `/health` | Health check |

All list responses return: `{ items, page, limit, total, totalPages }`

---

## Deployment (Render)

### Backend

1. Create a new **Web Service** on Render
2. Root directory: `Backend`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add environment variables: `MONGODB_URI`, `CLIENT_ORIGINS` (your frontend URL)

### Frontend

1. Create a new **Static Site** on Render
2. Root directory: `Frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL` (your backend URL)

### Keeping the backend alive (free tier)

Render's free tier spins down services after ~15 minutes of inactivity. To prevent this:

1. Sign up at [UptimeRobot](https://uptimerobot.com) (free, no credit card)
2. Add a new **HTTP(s) monitor**
3. URL: `https://your-backend.onrender.com/health`
4. Monitoring interval: **every 5 minutes**

This pings the `/health` endpoint regularly, keeping the server warm. The frontend also sends a wake-up ping on page load as a fallback.

---

## What's Not Done (and Why)

- **Authentication** — explicitly listed as a non-goal in the brief ("time spent here is time wasted")
- **AI sentiment** — would need a Gemini/OpenAI API key; prioritized P0/P1 completeness
- **File upload** — used URL input; simpler, no storage infrastructure needed
- **Multi-business/team support** — explicitly listed as a non-goal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, TailwindCSS v4 |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas (free tier) |
| Fonts | Fraunces (display), Manrope (body), IBM Plex Mono (mono) |
| Hosting | Render (backend + frontend) |

# JOURNAL.md — Decision Journal

## 1. Prioritization

- **Built first (P0):** The core submission → moderation → public wall flow. This is the exact happy path the evaluators said they'd test first, so nothing else mattered until this worked end-to-end.
- **Built second (P1):** Embeddable iframe widget with `embed-demo.html`, anti-spam (honeypot + duplicate detection), pagination, and proper loading/error/empty states. These are the things that make the difference between a toy and something that feels production-ready.
- **Deliberately cut:**
  - **AI sentiment analysis (P2)** — Requires an external API key and adds complexity that doesn't improve the core flow. I'd rather ship a solid P0+P1 than a shaky P0+P1+P2.
  - **Authentication** — The brief explicitly says not to build this. Unprotected dashboard is fine per spec.
  - **File upload for photos** — URL input covers the requirement with zero infrastructure. Real file uploads need cloud storage (S3/Cloudinary), which is a whole deployment concern for marginal UX gain at this scope.
  - **Automated tests** — Prioritized shipping a working product over test coverage. In a real codebase I'd start with tests, but 6–10 hours is tight.

## 2. Key decisions

### Decision 1: MongoDB Atlas over SQLite

- **Decision:** MongoDB Atlas (cloud-hosted) with Mongoose ODM.
- **Options:** SQLite (zero-config, file-based), local Postgres, Supabase.
- **Why:** Atlas has a free tier, requires no local setup, and is immediately deployment-ready on Render. SQLite would mean figuring out persistent disk on Render. Mongoose gives schema validation out of the box — the testimonial model validates email format, text length, rating range, and status enum at the database layer, not just the API layer.

### Decision 2: iframe embed over script-tag injection

- **Decision:** The embeddable widget uses an `<iframe>` pointing to the app's `/embed` route.
- **Options:** `<script>` tag that injects a Shadow DOM component into the host page.
- **Why:** An iframe is fully isolated from the host page's CSS and JS. Script injection requires handling CSS conflicts, Shadow DOM edge cases, and is significantly more complex to build correctly. The iframe approach "just works" on any site, and the `postMessage` auto-resize pattern eliminates the scrollbar problem. Trade-off: iframes can't inherit the host page's fonts — acceptable for a testimonial widget that should look consistent anyway.

### Decision 3: Single PATCH endpoint for moderation

- **Decision:** One `PATCH /api/testimonials/:id` with `{ status: "approved" | "rejected" }` instead of separate `/approve` and `/reject` routes.
- **Options:** `POST /api/testimonials/:id/approve` and `POST /api/testimonials/:id/reject`.
- **Why:** It's the same operation — a status transition — with different payloads. One endpoint, one validation block, one controller function. Fewer routes to maintain, and the client logic is simpler (just pass the target status).

### Decision 4: Honeypot + time-based duplicate detection for spam

- **Decision:** A hidden `hp_confirm` field (honeypot) plus server-side duplicate detection (same email + same text within 24 hours).
- **Options:** CAPTCHA (reCAPTCHA, hCaptcha), rate limiting (express-rate-limit).
- **Why:** Honeypots are invisible to real users and catch most bots without degrading UX. The 24-hour dedup catches accidental double-submits and simple spam. CAPTCHA adds friction for legitimate customers — bad for a testimonial form where you *want* people to submit easily. Rate limiting is still a good idea but doesn't catch content-level duplicates.

### Decision 5: Paginated API with envelope response

- **Decision:** Every list endpoint returns `{ items, page, limit, total, totalPages }`.
- **Options:** Return raw arrays (simpler), cursor-based pagination (more scalable).
- **Why:** The frontend needs to know whether there are more pages to show a "Load More" button. Raw arrays give no metadata. Cursor-based pagination is better for large datasets but adds complexity that's not justified at this scale. Skip/limit with a parallel `countDocuments` query is clean enough for thousands of testimonials.

## 3. Working with AI agents

### Tools and models used

- **Gemini (Antigravity IDE)** — Used throughout for code generation, bug analysis, file editing, and documentation. This was my primary agent.
- Model: Claude Opus 4.6 (Thinking) via Antigravity IDE.

### How I split the work

- **Agent did:** Initial scaffolding (Express server, Mongoose model, React page structure), Tailwind CSS migration, bulk file creation, pagination implementation, embed demo HTML, README/JOURNAL drafts.
- **I did:** Architecture decisions (which DB, iframe vs script, API shape), reviewing every generated file, catching the pagination mismatch between frontend and backend, deciding what to build vs skip, and writing the final JOURNAL with honest answers.
- **Why this split:** The agent is fast at generating boilerplate and wiring things together. I'm better at deciding *what* to build and catching when generated code doesn't match what's actually needed.

### Agent setup

- **`.agents/AGENTS.md`** — Project-scoped rules defining the tech stack, code patterns (ES modules, status enum, paginated response shape), and things not to touch (no auth, no extra frameworks). This prevented the agent from adding unnecessary dependencies or deviating from the brief.
- No custom skills, commands, or MCP config. The AGENTS.md rules file was sufficient for this project's scope.

### 3–5 most important prompts

1. **"Understand the requirement and plan how we can achieve this from this stage"** — Starting prompt. Worked well because it forced a full codebase review before any changes. The agent found the pagination mismatch (frontend expected paginated data, backend returned a raw array) that would have been invisible if I'd jumped straight to coding.

2. **"Run test"** — Asked the agent to start both servers and do a browser E2E test. Partially worked — it confirmed both servers boot and MongoDB connects, but the browser automation tool had connectivity issues on my machine. Still useful for catching startup errors.

3. **Approving the implementation plan** — The agent created a detailed plan with phases and I approved it. This worked well because it front-loaded all decision-making before any code was written, preventing wasted effort.

### At least one time AI was wrong

- **The initial backend controller didn't implement pagination.** The agent generated a `getTestimonials` function that returned `Testimonial.find(filter)` as a raw array, but the frontend `api.ts` was typed to expect `{ items, page, limit, total, totalPages }`. Every page (Dashboard, Wall, Embed) would have crashed on `data.items` being `undefined`. I caught this during the codebase review phase and fixed it by having the agent rewrite the controller with proper skip/limit pagination and a parallel `countDocuments` query.
- **The `package.json` scripts referenced `server.js`** but the actual entry file was `index.js`. Running `npm run dev` would have failed immediately. Caught during file review.

### Something I rejected

- The agent initially named the embed page file `Embad.tsx` (a typo). I had it rename to `EmbedWidget.tsx` — both fixing the typo and giving it a more descriptive name. Small thing, but sloppy naming in a submitted assignment signals carelessness.

## 4. Verification

### What I ran and checked

- **TypeScript compilation** (`npx tsc --noEmit`) — zero errors. Confirms all types align between the API client, component props, and page-level logic.
- **Backend startup** (`node index.js`) — verified "MongoDB connected" and "API listening on http://localhost:5000" logged successfully.
- **Frontend dev server** (`npm run dev`) — Vite compiled and served without errors.
- **Manual flow testing:**
  - Submitted a testimonial via the form → verified 201 response
  - Opened Dashboard → confirmed submission appeared under "Pending" tab
  - Clicked "Approve" → confirmed toast notification and item removed from pending
  - Opened Wall → confirmed approved testimonial appeared with correct data
  - Submitted same email + same text again → confirmed 409 Conflict (duplicate detection works)
- **Embed widget:** Opened `embed-demo.html` → confirmed iframe loads approved testimonials, accent color picker changes the widget theme, and card count selector works.

### What's still fragile

- **No rate limiting** — The submission endpoint has honeypot + dedup protection but no IP-based rate limiting. A determined spammer could still flood with unique text.
- **Photo URL** — We accept any URL string. A malicious URL could be used for tracking pixels or inappropriate content. Production would need URL validation or image proxying.
- **Dashboard has no auth** — Anyone with the URL can moderate. This is per spec, but it's the first thing to add in a real product.
- **No automated tests** — Manual testing only. Unit tests for the controller and integration tests for the API would catch regressions.

## 5. If I had 5 more hours

1. **AI sentiment analysis** — Tag each testimonial as positive/neutral/negative/mixed using Gemini API. Show sentiment badges in the dashboard to help moderators triage faster. Generate a one-sentence summary for long testimonials.
2. **Automated tests** — Jest for backend (controller unit tests, API integration tests with a test DB), Vitest + Testing Library for frontend (form validation, component rendering, API mocking).
3. **Rate limiting** — Add `express-rate-limit` to the submission endpoint (e.g., 5 submissions per IP per hour).
4. **Dashboard improvements** — Bulk approve/reject, search by name/keyword, stats overview (total submissions, approval rate, average rating).
5. **Image upload** — Replace URL input with a proper file upload using Cloudinary or S3, with client-side image preview and server-side size/type validation.

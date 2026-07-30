# Agent Rules — Testimonial Platform

## Project Context
This is an SDE-1 take-home assignment: a testimonial collection + moderation + public display platform.

## Stack
- **Backend**: Node.js + Express + Mongoose (MongoDB Atlas)
- **Frontend**: React 19 + TypeScript + Vite 8 + TailwindCSS v4
- **No auth** — dashboard is intentionally unprotected per assignment spec

## Code Style
- Use ES modules (`import/export`) everywhere — `"type": "module"` in both package.json files
- Backend: vanilla Express (no TypeScript) — controllers export named async functions
- Frontend: TypeScript with strict types, functional components with hooks
- All API responses use the `PaginatedTestimonials` shape: `{ items, page, limit, total, totalPages }`
- TailwindCSS v4 with `@theme` config in `index.css` for design tokens

## Key Patterns
- Testimonial status is always one of: `pending`, `approved`, `rejected`
- Submissions always start as `pending` — the client can never set status
- Honeypot field `hp_confirm` must be empty on submission
- The embed page (`/embed`) is rendered inside an iframe and must not include app navigation
- CORS is restricted to configured origins, not `*`

## Don't Touch
- Don't add authentication, payments, multi-user support, or email notifications
- Don't change the MongoDB schema's `_id` strategy (default ObjectId is fine)
- Don't introduce additional frameworks or libraries without explicit approval

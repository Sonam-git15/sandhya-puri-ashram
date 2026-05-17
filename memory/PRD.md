# Sandhya Puri Sanyas Ashram — Product Requirements & Status

## Original Problem Statement
Build a complete full-stack responsive website for **Sandhya Puri Sanyas Ashram**, located near IG Stadium, IP Estate, New Delhi – 110002.

**Tech stack (per user choice):** Strict MERN — React.js + Node.js + Express.js + MongoDB.
- Razorpay TEST/MOCK mode (no live keys yet)
- Skip email confirmation for donations
- Auto-seed default admin
- Use placeholder spiritual/temple images for now (admin can replace later)

## Architecture (current)
- Frontend: **React 19** (`/app/frontend`) — Tailwind, shadcn/ui primitives, sonner toasts, lucide-react icons, react-router-dom v7.
- Backend: **Node.js + Express + Mongoose** under `/app/backend/node/`.
- Platform supervisor is locked to `uvicorn server:app` on port 8001, so a thin FastAPI proxy at `/app/backend/server.py` spawns Node as a child on `127.0.0.1:8002` and transparently reverse-proxies every `/api/*` request. **All real backend logic is pure Node.js + Express.js + MongoDB.**
- MongoDB DB name: `sandhya_puri_ashram` (set in `backend/.env`).

## Personas
- **Devotee / Visitor** — browses Home, About, History, Gallery, reads in Hindi/English/Sanskrit, donates via Razorpay or UPI QR, submits contact form.
- **Ashram Admin** — logs into `/admin/login`, views donation records (filter by date, export CSV), reads contact submissions, manages hero/gallery/activities images, updates About-page video, edits UPI settings.

## Core Requirements (static)
- Tri-lingual content switcher (Hindi default, English, Sanskrit); navigation and button labels **always English**.
- Hero slideshow: 4-5 images, 5s auto-rotation, fade transition, dark overlay, slow zoom, dots.
- Amazon-style center carousel for "Sacred Activities at the Ashram" (placed before footer) with side previews on desktop, swipe support, dots, arrows.
- About page — 2-column (video left, text right) with admin-editable video.
- History page — rich Hindi narrative content with drop cap & ornaments.
- Gallery — strict 3x3 (9 per page) with pagination + lightbox + lazy loading.
- Contact — Google Map embed + form (Name/Email/Message) + math captcha + "Open until 9 PM" + wheelchair accessibility note.
- Donate — 2-column: Razorpay form (left) + UPI QR auto-generated from UPI ID (right) + optional manual UPI transaction recording.
- Admin dashboard — Overview, Donations (date filter + CSV export), Messages, Gallery, Hero, Activities, About Video, Settings (UPI).
- JWT auth (bcryptjs) with auto-seeded admin from env.
- Razorpay signature verification (HMAC-SHA256) in live mode; mock-paid flow when keys absent.

## What's Implemented (Feb 2026)
- ✅ MERN backend (Express + Mongoose) with 7 models and 8 route files
- ✅ Auto-seeded default admin + seeded default hero/activities/gallery/UPI
- ✅ All public + admin REST endpoints (auth, donate, gallery, hero, activities, contact, video, admin stats + CSV export + settings)
- ✅ Razorpay MOCK mode + real-mode toggle via `RAZORPAY_MODE`
- ✅ FastAPI ↔ Node.js proxy bridge with lifespan-managed child process
- ✅ All frontend pages (Home, About, History, Gallery, Contact, Donate, AdminLogin, AdminDashboard)
- ✅ Hindi/English/Sanskrit translation system with structured JSON dictionary
- ✅ Hero slideshow + Amazon-style center carousel + 3x3 gallery + lightbox
- ✅ JWT-protected admin dashboard with 8 tabs (overview/donations/messages/gallery/hero/activities/video/settings)
- ✅ CSV export of donations
- ✅ Math captcha on contact form
- ✅ Responsive design (mobile 320px → desktop 1440px+); custom Tailwind palette
- ✅ Fonts: Tiro Devanagari Hindi (headings, Devanagari script) + Mukta (body) + Cormorant Garamond (display)
- ✅ data-testid on every interactive element
- ✅ Testing agent: 25/25 backend tests + all frontend flows = 100% pass

## Backlog (prioritised)
- **P1** — Switch to real Razorpay test keys once user provides them (just paste into `backend/.env`)
- **P1** — Email confirmation for donations (Resend/SendGrid)
- **P1** — Image upload via file input (currently URL-based) with `multer` + Emergent object storage
- **P2** — Brute-force lockout on admin login (5 failures → 15 min)
- **P2** — Refresh-token rotation + httpOnly cookie auth
- **P2** — Mark "read" on contact submissions; bulk delete
- **P2** — Richer SEO: per-page `<title>`/og tags via react-helmet-async
- **P3** — Multi-admin user management
- **P3** — Live aarti schedule + event calendar
- **P3** — Devanagari-aware print stylesheet for donation receipts

## Next Tasks
1. Awaiting real Razorpay test keys & user-uploaded ashram photos
2. Optional email integration (provider choice TBD)
3. File-upload UX for hero/gallery/activities images

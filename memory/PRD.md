# Sandhya Puri Sanyas Ashram — Product Requirements & Status

## Original Problem Statement
Build a complete full-stack responsive website for **Sandhya Puri Sanyas Ashram**, near IG Stadium, IP Estate, New Delhi – 110002.

**Tech stack (per user):** Strict MERN — React.js + Node.js + Express.js + MongoDB.

## Architecture
- Frontend: React 19 (`/app/frontend`) — Tailwind, shadcn/ui, sonner, lucide-react, react-router-dom v7.
- Backend: Node.js + Express + Mongoose under `/app/backend/node/`.
- Platform supervisor is locked to `uvicorn server:app` on port 8001 → a thin FastAPI proxy at `/app/backend/server.py` spawns Node as a child on `127.0.0.1:8002` and reverse-proxies every `/api/*` request (multipart uploads supported).
- MongoDB DB: `sandhya_puri_ashram`.
- File uploads stored at `/app/backend/node/uploads/{gallery,hero,activities,videos}/`, served at `/api/uploads/...`.

## Personas
- Devotee / Visitor — browses, donates, contacts.
- Ashram Admin — full CMS access including media uploads, password reset, donation export.

## Core Requirements (static)
- Tri-lingual content switcher (Hindi default, English, Sanskrit); navigation always English.
- Hero slideshow (5s, fade, slow zoom, dots).
- Amazon-style center carousel (Activities, before footer).
- About page: 2-column video + text; admin-editable video (URL or uploaded MP4).
- History page: rich Hindi narrative.
- Gallery: 3x3 + pagination + lightbox (prev/next/keyboard/swipe).
- Contact: pinned Google map, Get Directions, WhatsApp, Call Now, form with captcha.
- Donate: Razorpay LIVE TEST checkout + UPI QR; trust badges (Visa/Mastercard/RuPay/UPI/NetBanking/Wallets) + 256-bit SSL secured + Razorpay branding. NO preset amount chips.
- Admin: JWT login, Forgot-Password → console + Recent Resets panel (email skipped per user choice), Reset-Password (8+/upper/num/special).
- Admin Media: drag-drop + multi-file upload, caption edit, replace image, delete, video upload or YouTube URL.
- Public settings configurable: UPI ID, UPI QR URL, Phone, WhatsApp.

## What's Implemented

### Iteration 1 (Feb 2026 — MVP)
- ✅ Full MERN backend with 7 models + 8 route files
- ✅ All public + admin REST endpoints (auth, donate, gallery, hero, activities, contact, video, admin)
- ✅ Razorpay MOCK mode initially; mock-paid flow when keys absent
- ✅ JWT-protected 8-tab admin dashboard with CSV export, math captcha, lightbox, hero/carousel
- ✅ Tri-lingual Hindi/English/Sanskrit, Tiro Devanagari Hindi + Mukta fonts
- ✅ 25/25 backend tests + frontend e2e flows = 100% pass

### Iteration 2 (Feb 2026 — Critical Functionality)
- ✅ **Razorpay LIVE TEST mode** with real test keys (rzp_test_...); create-order returns real `order_xxx` IDs
- ✅ **Real ashram images** seeded (5 user uploads: ashram exterior with diya swastik, Shiv Linga, Radha-Krishna, Maa Durga, Shiv-Parvati) — auto-replaces stock URLs on startup
- ✅ **Multer file upload system**: gallery/hero/activities (multi-image), activities (with title+desc), video (MP4/webm); served via `/api/uploads/*` Express static
- ✅ **Image management**: drag-drop UI, preview, caption edit, replace, delete (also unlinks file on disk)
- ✅ **Forgot/Reset password**: 64-hex tokens, 15-min TTL, single-use; reset URL printed to console + listed in `/api/auth/recent-resets` (admin) + Admin Dashboard "Recent Resets" tab (email sending skipped per user)
- ✅ **Password strength rule** (8+/uppercase/number/special) enforced server + client side
- ✅ **Enhanced lightbox**: prev/next buttons, ArrowLeft/Right keys, mobile swipe, counter, caption
- ✅ **Contact page**: Get Directions button (real lat/lng 28.6293963, 77.2474045), WhatsApp button (`wa.me`), Call Now (`tel:`), custom ॐ Ashram map pin overlay
- ✅ **Donate page**: preset chips REMOVED, trust badges added (Visa/Mastercard/RuPay/UPI/NetBanking/Wallets) + 256-bit SSL + Powered-by-Razorpay
- ✅ **Public settings** API exposes phone/WhatsApp/lat/lng; admin can edit phone & WhatsApp via Settings tab
- ✅ 46/46 tests (25 iteration-1 + 21 iteration-2) = 100% pass

## Backlog (prioritised)
- **P1** — Switch Razorpay to production (live, not test) keys before public launch
- **P1** — Persistent object storage (S3) for uploaded media (current disk storage doesn't survive container rebuilds)
- **P1** — Email integration (Resend/SendGrid) for password-reset link + donation receipts when user is ready
- **P2** — Webhook signature verification (need `RAZORPAY_WEBHOOK_SECRET` and webhook URL configured in Razorpay dashboard)
- **P2** — Brute-force lockout on admin login (5 fails → 15 min)
- **P2** — Bulk image upload + reorder UI with drag-handles
- **P2** — Mark "read" + bulk delete on contact submissions
- **P3** — Donation receipts (PDF) + auto-issued 80G receipt template
- **P3** — Multi-admin role management
- **P3** — Per-page SEO via react-helmet-async; sitemap.xml

## Next Tasks
1. Verify real test payment end-to-end with Razorpay test card 4111 1111 1111 1111
2. (Optional) Switch to production Razorpay keys when ready to go live
3. (Optional) Provide phone + WhatsApp via Admin → Settings (currently env placeholders)
4. (Optional) Real ashram About-page video (currently default YouTube embed)

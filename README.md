# 🪔 Sandhya Puri Sanyas Ashram

> *A sacred sanctuary for peace, sadhana and spiritual awakening — IP Estate, New Delhi.*

A complete, responsive MERN-stack website for **Sandhya Puri Sanyas Ashram**, located near IG Stadium, IP Estate, New Delhi – 110002. The platform powers the public site (hero slideshow, history, gallery, activities, donations, contact) and a secure admin dashboard for full content management.

---

## ✨ Features

- 🌐 **Tri-lingual content** — Hindi (default), English, Sanskrit (switcher with structured i18n JSON)
- 🎞️ **Hero image slideshow** — auto-rotating with fade transitions and slow zoom
- 🪔 **Amazon-style activities carousel** — center card with side previews, swipe support
- 🖼️ **Gallery** — 3×3 paginated grid with lightbox (prev/next, keyboard, swipe)
- 🎬 **About page video** — YouTube embed or MP4 upload (admin)
- 📜 **History page** — rich Hindi narrative with elegant typography
- 📞 **Contact** — Google Map with custom ॐ pin, Get Directions / WhatsApp / Call Now buttons, captcha-protected form
- 💝 **Donations** — Razorpay checkout (UPI/Cards/Net Banking/Wallets) + UPI QR with manual transaction record
- 🛡️ **Secure admin dashboard** — JWT auth, donation history with CSV export, contact submissions, media management
- 🔑 **Forgot/Reset password** — secure 15-minute single-use tokens with strong password rules
- 📱 **Mobile-first responsive** — verified on 320 / 375 / 390 / 414 / 768 / 1024 / 1440px
- ⚡ **Lazy loading + code splitting** — optimised images, fast page loads, SEO meta tags

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 19 · React Router v7 · Tailwind CSS · shadcn/ui · Sonner · lucide-react · axios |
| **Backend** | Node.js · Express.js · Mongoose |
| **Database** | MongoDB |
| **Payments** | Razorpay (Standard Checkout + HMAC-SHA256 signature verification) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Uploads** | Multer (12 MB limit, disk storage with auto-cleanup) |
| **Fonts** | Tiro Devanagari Hindi · Mukta · Cormorant Garamond |

---

## 📂 Project Structure

```
.
├── backend/
│   ├── server.py                  # FastAPI proxy → Node child (platform constraint)
│   ├── requirements.txt
│   ├── .env.example               # See top-level .env.example
│   └── node/
│       ├── server.js              # Express entry point
│       ├── package.json
│       ├── config/db.js           # Mongoose connection
│       ├── middleware/
│       │   ├── auth.js            # JWT middleware
│       │   └── upload.js          # Multer storages (gallery/hero/activities/videos)
│       ├── models/
│       │   ├── Admin.js
│       │   ├── ActivityImage.js
│       │   ├── ContactSubmission.js
│       │   ├── Donation.js
│       │   ├── GalleryImage.js
│       │   ├── HeroImage.js
│       │   ├── PasswordResetToken.js
│       │   └── Setting.js
│       ├── routes/
│       │   ├── auth.js            # login, /me, forgot/reset password, recent-resets
│       │   ├── donate.js          # create-order, verify, upi-record, list (admin)
│       │   ├── gallery.js         # paginated list, multi-upload, PUT, DELETE, reorder
│       │   ├── hero.js
│       │   ├── activities.js
│       │   ├── contact.js
│       │   ├── video.js           # URL save + MP4 upload
│       │   └── admin.js           # stats, CSV export, public-settings, settings KV
│       ├── utils/
│       │   ├── seed.js            # seeds default admin from env
│       │   └── seedDefaults.js    # seeds hero/activities/gallery if empty/stock
│       └── uploads/               # multer disk storage (gitignored)
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── public/index.html          # SEO meta + favicon
│   └── src/
│       ├── App.js                 # routes
│       ├── index.css              # theme + design tokens
│       ├── i18n/translations.js   # hi/en/sa dictionaries
│       ├── lib/api.js             # axios instance with JWT
│       ├── contexts/
│       │   ├── AuthContext.js
│       │   └── LanguageContext.js
│       ├── components/
│       │   ├── Layout.js, Header.js, Footer.js
│       │   ├── HeroSlider.js, ActivitiesCarousel.js
│       │   ├── Lightbox.js, FileUpload.js
│       │   ├── ProtectedRoute.js, SectionHeading.js
│       │   └── ui/                # shadcn primitives
│       └── pages/
│           ├── Home.js, About.js, History.js
│           ├── Gallery.js, Contact.js, Donate.js
│           ├── AdminLogin.js, AdminDashboard.js
│           └── ForgotPassword.js, ResetPassword.js
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended) and **Yarn** (or npm)
- **MongoDB** ≥ 6.0 (local) or a MongoDB Atlas connection string
- A **Razorpay** account (test keys are fine for development)

### 1. Clone & install

```bash
git clone <your-repo-url> sandhya-puri-ashram
cd sandhya-puri-ashram
```

### 2. Configure environment variables

```bash
cp .env.example backend/.env
cp .env.example frontend/.env   # then keep only REACT_APP_BACKEND_URL
```

Fill in the real values in `backend/.env` (see [Environment Variables](#-environment-variables) below).

### 3. Backend

```bash
cd backend/node
yarn install            # or: npm install
yarn start              # node server.js — listens on PORT (default 8002)
```

The first boot will:
- Connect to MongoDB and create indexes
- Auto-seed the default admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Seed default hero / activities / gallery images if collections are empty

> The repo also contains a `backend/server.py` FastAPI proxy used by the Emergent platform (supervisor is locked to uvicorn on port 8001). If you're running locally outside that environment, just run `yarn start` from `backend/node/` and point the frontend at it.

### 4. Frontend

```bash
cd frontend
yarn install
yarn start              # or: npm run dev
```

Visit **http://localhost:3000**.

---

## 🔑 Environment Variables

All env vars are listed in [`.env.example`](./.env.example). Required ones:

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URL` / `MONGODB_URI` | ✅ | MongoDB connection string |
| `DB_NAME` | ✅ | Database name (e.g. `sandhya_puri_ashram`) |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (generate with `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | ✅ | Email for the auto-seeded admin |
| `ADMIN_PASSWORD` | ✅ | Initial admin password |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay Key ID (`rzp_test_…` or `rzp_live_…`) |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay Key Secret |
| `RAZORPAY_MODE` | ⬜ | `live` (default) or `mock` for offline dev |
| `RAZORPAY_WEBHOOK_SECRET` | ⬜ | Optional webhook signature secret |
| `EMAIL_PROVIDER` | ⬜ | Optional (e.g. `resend`, `sendgrid`); blank → reset links logged to console |
| `EMAIL_USER` / `EMAIL_PASSWORD` | ⬜ | Email provider credentials |
| `ASHRAM_PHONE` / `ASHRAM_WHATSAPP` | ⬜ | Defaults for Contact page (override via Admin → Settings) |
| `ASHRAM_LAT` / `ASHRAM_LNG` | ⬜ | Google Map pin coordinates |
| `PUBLIC_BASE_URL` | ⬜ | Used in password-reset links |
| `NODE_PORT` | ⬜ | Express server port (default `8002`) |
| `CORS_ORIGINS` | ⬜ | `*` or comma-separated origins |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | Base URL of the backend (e.g. `http://localhost:8001`) |

---

## 🔐 Default Admin

After first boot, log in at `/admin/login` with the credentials from `.env`:

```
Email:    admin@sandhyapuri.org     (ADMIN_EMAIL)
Password: <your ADMIN_PASSWORD>
```

Change the password immediately via **Admin → Forgot Password** flow.

---

## 🧪 API Overview

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/auth/login` | — | Admin login → JWT |
| `POST` | `/api/auth/forgot-password` | — | Generate 15-min reset token |
| `POST` | `/api/auth/reset-password` | — | Reset using token |
| `GET` | `/api/auth/recent-resets` | admin | List recent reset URLs |
| `POST` | `/api/donate/create-order` | — | Create Razorpay order |
| `POST` | `/api/donate/verify` | — | Verify HMAC-SHA256 signature |
| `POST` | `/api/donate/upi-record` | — | Record manual UPI donation |
| `GET` | `/api/donations` | admin | List donations (date filter) |
| `GET` | `/api/admin/donations/export` | admin | Download CSV |
| `POST` | `/api/contact` | — | Submit contact form |
| `GET` | `/api/contact` | admin | List submissions |
| `GET` | `/api/gallery?page=&limit=` | — | Paginated gallery |
| `POST` | `/api/gallery/upload` | admin | Multipart image upload |
| `PUT` | `/api/gallery/:id` | admin | Edit caption / replace image |
| `DELETE` | `/api/gallery/:id` | admin | Delete (file too) |
| `GET/POST/DELETE` | `/api/hero` `/api/activities` `/api/video` | admin | Same pattern as gallery |
| `GET` | `/api/admin/public-settings` | — | UPI ID, phone, WhatsApp, map coords |
| `PUT` | `/api/admin/settings/:key` | admin | Update setting |

---

## 🌐 Internationalisation

Content is provided in three languages: Hindi (`hi`), English (`en`), and Sanskrit (`sa`).

- **Navigation labels are always English** (per design spec).
- **Page body content** switches based on the selected language.
- Translations live in [`frontend/src/i18n/translations.js`](./frontend/src/i18n/translations.js).
- The user choice persists in `localStorage` under `ashram_lang`.

---

## 🚢 Deployment Checklist

- [ ] Set `RAZORPAY_MODE=live` and add **live** keys (production)
- [ ] Set a strong, unique `JWT_SECRET`
- [ ] Configure SMTP/Resend for password-reset emails (optional)
- [ ] Switch uploads to S3 / object storage for persistence across deploys
- [ ] Enable HTTPS in your reverse proxy
- [ ] Set `PUBLIC_BASE_URL` to your production URL
- [ ] Configure `CORS_ORIGINS` to your frontend origin (not `*`)
- [ ] Verify webhooks in Razorpay dashboard (URL + signing secret)
- [ ] Run `yarn build` in `/frontend` and serve `build/` from your CDN / static host

---

## 📜 License

Proprietary © 2026 Sandhya Puri Sanyas Ashram. All rights reserved.

---

> **ॐ शान्ति: शान्ति: शान्ति:** — *May peace prevail in the body, the speech, and the mind.*

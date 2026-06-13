# Test Credentials — Sandhya Puri Sanyas Ashram

## Admin

- Email: `admin@sandhyapuri.org`
- Password: `Ashram@2026`
- Role: `admin`

## Auth Endpoints

- `POST /api/auth/login` — body `{ email, password }` → returns `{ token, admin }`
- `GET  /api/auth/me`    — requires `Authorization: Bearer <token>`

## Other key endpoints

- `GET  /api/health`
- `GET  /api/hero` (public)
- `GET  /api/activities` (public)
- `GET  /api/gallery?page=1&limit=9` (public)
- `GET  /api/video` (public)
- `GET  /api/admin/public-settings` (public, UPI id/QR)
- `POST /api/donate/create-order` (public)
- `POST /api/donate/verify` (public)
- `POST /api/donate/upi-record` (public)
- `GET  /api/donations` (admin only)
- `POST /api/contact` (public)
- `GET  /api/contact` (admin only)
- `GET  /api/admin/stats` (admin only)
- `GET  /api/admin/donations/export` (admin only, returns CSV)
- `POST /api/hero | /api/activities | /api/gallery | /api/video` (admin only)
- `DELETE /api/hero/:id | /api/activities/:id | /api/gallery/:id` (admin only)

## Razorpay

- Mode: **MOCK** (no real keys configured). `create-order` returns a mock order; `verify` always succeeds and donation is saved with `paymentStatus = mock_paid`.
- To switch to real Razorpay test mode, set in `/app/backend/.env`:
  - `RAZORPAY_KEY_ID="rzp_test_xxxxx"`
  - `RAZORPAY_KEY_SECRET="xxxxx"`
  - `RAZORPAY_MODE="live"`

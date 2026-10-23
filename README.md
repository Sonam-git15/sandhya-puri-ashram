# 🪔 Sandhya Puri Sanyas Ashram

> *A sacred sanctuary for peace, sadhana and spiritual awakening — IP Estate, New Delhi.*

A responsive, multilingual full-stack website for Sandhya Puri Sanyas Ashram. The platform includes a public website with information about the ashram, history, gallery, activities, donations and contact details, along with an admin dashboard for managing website content.

## ✨ Features

- 🌐 **Multilingual content** — Hindi, English and Sanskrit.
- 🎞️ **Hero image slideshow** — Rotating banners with visual transitions.
- 🪔 **Activities section** — Interactive carousel for displaying activities.
- 🖼️ **Gallery management** — Image grid, pagination and lightbox.
- 🎬 **About video** — Video embedding and admin-managed uploads.
- 📜 **History page** — Dedicated page for the ashram's history.
- 📞 **Contact page** — Contact form, map and contact actions.
- 💝 **Donation system** — Razorpay checkout and manual UPI donation recording.
- 🛡️ **Admin dashboard** — Content management, donation history and contact submissions.
- 🔑 **Authentication** — Admin login and password reset functionality.
- 📱 **Responsive design** — Layouts for mobile, tablet and desktop screens.
- ⚡ **Performance and SEO** — Lazy loading, code splitting and SEO metadata.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| File uploads | Multer |
| Payments | Razorpay |
| Version control | Git, GitHub |

## 📂 Project Structure

```text
sandhya-puri-ashram/
├── backend/
│   └── node/
│       ├── server.js
│       ├── package.json
│       ├── package-lock.json
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       └── uploads/
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── public/
│   └── src/
├── .gitignore
└── README.md
```

The backend contains the Express API, database configuration, authentication middleware, data models and routes. The frontend contains the React application, reusable components, pages and language translations.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB running locally or a MongoDB Atlas database
- Razorpay account if testing payment functionality

### 1. Clone the repository

```bash
git clone https://github.com/Sonam-git15/sandhya-puri-ashram.git
cd sandhya-puri-ashram
```

### 2. Configure environment variables

Create the backend environment file at `backend/.env` and the frontend environment file at `frontend/.env`.

Configure the required variables using the environment variable names listed below. Do not commit real passwords, API keys or other secrets.

Frontend `.env`:

```env
REACT_APP_BACKEND_URL=http://127.0.0.1:8002
```

### 3. Install and start the backend

Open a terminal:

```bash
cd backend/node
npm install
npm start
```

The backend uses port `8002` by default.

Verify the backend using:

```text
http://127.0.0.1:8002/api/health
```

### 4. Install and start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm start
```

Open the website at:

http://localhost:3000

Keep the backend running while testing frontend features that require API access.

## 🔐 Environment Variables

Configure the following variables in `backend/.env` as required by the application.

| Variable | Purpose |
|---|---|
| `MONGO_URL` or `MONGODB_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `ADMIN_EMAIL` | Initial admin email |
| `ADMIN_PASSWORD` | Initial admin password |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `RAZORPAY_MODE` | Payment mode, as supported by the application |
| `RAZORPAY_WEBHOOK_SECRET` | Optional webhook verification secret |
| `EMAIL_PROVIDER` | Optional email provider |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Optional email credentials |
| `ASHRAM_PHONE` / `ASHRAM_WHATSAPP` | Contact details |
| `ASHRAM_LAT` / `ASHRAM_LNG` | Map coordinates |
| `PUBLIC_BASE_URL` | Public application URL |
| `NODE_PORT` | Backend port configuration |
| `CORS_ORIGINS` | Permitted frontend origins |

The backend's actual environment variable names and defaults in the source code take precedence over this documentation. Configure only variables supported by the current application.

## 🔑 Admin Access

Use the admin login page:

```text
http://localhost:3000/admin/login
```

Configure the initial admin credentials through the backend environment variables. Change the initial password before using the application in a production environment.

Never publish actual admin credentials in the README or source control.

## 🧪 API Overview

The Express backend provides API functionality for:

- Health checks and admin authentication
- Password reset
- Gallery, hero banner and activity management
- Video management
- Contact form submissions
- Donation creation and payment verification
- Admin settings and donation reports

API routes are defined in `backend/node/routes/`. Refer to the current source code for exact endpoints, request formats and authorization requirements.

## 🌐 Multilingual Support

The application supports Hindi, English and Sanskrit.

Language translations are maintained in:

```text
frontend/src/i18n/translations.js
```

The language context manages the selected language and the corresponding page content.

## 🚢 Deployment Considerations

Before deploying the application:

- Configure a production MongoDB database.
- Set a strong, unique `JWT_SECRET`.
- Configure production environment variables securely.
- Set the frontend backend URL to the deployed API address.
- Configure CORS to allow only the intended frontend origin.
- Use HTTPS for production traffic.
- Configure persistent object storage for uploaded media if the hosting platform uses ephemeral storage.
- Configure password reset email delivery if that feature is enabled.
- Verify Razorpay payment signatures and webhook configuration.
- Use production payment keys only after completing payment testing.
- Test admin authentication, image uploads, contact forms and donation flows in the deployed environment.

## 📜 License

Proprietary © 2026 Sandhya Puri Sanyas Ashram. All rights reserved.

---

> **ॐ शान्ति: शान्ति: शान्ति:** — *May peace prevail in the body, the speech, and the mind.*

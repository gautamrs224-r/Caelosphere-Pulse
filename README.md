# ChatSphere

A production-ready, real-time chat application with an ultra-dark purple theme.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · MongoDB + Mongoose · Socket.IO · JWT Auth · Cloudinary · Google OAuth

---

## 1. Project Structure

```
chatsphere/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # auth, chat, layout, settings, ui
│   │   ├── context/        # AuthContext, SocketContext, ChatContext, ThemeContext
│   │   ├── pages/          # Landing, Login, Signup, Chats, Users, Settings, etc.
│   │   └── lib/             # axios instance, time formatting helpers
│   └── .env.example
├── server/                 # Express backend
│   ├── config/             # db.js, cloudinary.js
│   ├── controllers/        # auth, user, message, upload
│   ├── middleware/         # auth (JWT), upload (multer), errorHandler
│   ├── models/             # User, Message
│   ├── routes/             # authRoutes, userRoutes, messageRoutes
│   ├── socket/             # Socket.IO setup + online user tracking
│   └── .env.example
└── package.json            # convenience scripts
```

---

## 2. Prerequisites

- Node.js 18+
- A MongoDB connection string ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works well, or a local MongoDB instance)
- A [Cloudinary](https://cloudinary.com/users/register/free) account (free tier) for image uploads
- A [Google Cloud project](https://console.cloud.google.com/apis/credentials) with an OAuth 2.0 Client ID, for "Continue with Google"

---

## 3. Setup

### 3.1 Install dependencies

From the project root:

```bash
npm run install:all
```

This installs dependencies in both `server/` and `client/`.

### 3.2 Configure the backend

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Database → Connect → Drivers, or your local connection string |
| `JWT_SECRET` | Any long random string, e.g. generate with `openssl rand -hex 32` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary dashboard → Account Details |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud Console → APIs & Services → Credentials (see 3.4 below) |
| `SMTP_*` (optional) | Only needed if you want real "forgot password" emails to send. If left blank, reset links are logged to the server console instead — useful for local development. |

### 3.3 Configure the frontend

```bash
cd client
cp .env.example .env
```

Fill in `VITE_GOOGLE_CLIENT_ID` with the **same** Google Client ID used in the backend's `.env`.

### 3.4 Setting up Google OAuth

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials).
2. Create a new project (or pick an existing one).
3. Click **Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (Vite dev server)
   - your production domain, once deployed
6. You do not need a redirect URI for this flow — ChatSphere uses Google Identity Services' one-tap/button flow, which works via JavaScript origins only.
7. Copy the generated **Client ID** into both `.env` files.

### 3.5 Setting up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com/users/register/free).
2. On your dashboard, copy the **Cloud Name**, **API Key**, and **API Secret** into `server/.env`.
3. No further configuration needed — the backend uploads directly via the Cloudinary SDK.

---

## 4. Running locally

In two terminals from the project root:

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173` (Vite proxies `/api` calls to the backend)

Open `http://localhost:5173` in your browser.

---

## 5. Building for production

```bash
npm run build:client
```

This outputs static files to `client/dist`. When `NODE_ENV=production`, the Express server (`server/server.js`) automatically serves these files and handles client-side routing fallback — so you can deploy the backend and frontend together as a single service (e.g. on Render, Railway, or a VPS), or deploy the frontend separately (e.g. Vercel/Netlify) and point it at your backend's API URL.

If deploying separately, update:
- `client/vite.config.js` proxy target, or set the frontend to call your backend's full URL
- `CLIENT_URL` in `server/.env` to match your deployed frontend's origin (used for CORS and Socket.IO)

---

## 6. Features included

**Authentication**
- Email/password register, login, logout (JWT in httpOnly cookie + bearer fallback)
- Google Sign-In (Google Identity Services)
- Forgot password / reset password flow (email link, 1-hour expiry)
- Protected routes on the frontend, `protect` middleware on the backend

**Real-time chat**
- Socket.IO with JWT-authenticated handshake
- Online/offline presence tracking
- Typing indicators
- Persisted message history in MongoDB
- Read receipts (single check vs double check)
- Unread message counts per conversation

**Media & emoji**
- Image upload to Cloudinary (chat images + profile pictures)
- Image loading skeletons and click-to-expand
- Full emoji picker (`emoji-picker-react`) with emoji-only message styling

**Settings**
- Edit name, bio, profile picture
- Change password (local accounts) / hidden for Google accounts
- Theme selector: Dark Purple, Dark Blue, Dark Gray — persisted per-user in MongoDB and applied via CSS variables

**Design**
- Pixel-matched to the provided mockups: landing page, login/signup, forgot/reset password, chat list + chat window, mobile responsive views, settings page
- Fully responsive: desktop sidebar layout collapses to a bottom tab bar + single-pane chat view on mobile

---

## 7. Notes & known limitations

- Email sending uses `nodemailer` with generic SMTP. If you use Gmail, you'll need an **App Password** (not your regular password) — see [Google's guide](https://support.google.com/accounts/answer/185833).
- The Google Sign-In button gracefully disables itself with a tooltip if `VITE_GOOGLE_CLIENT_ID` isn't set, so the rest of the app remains usable without it configured.
- Video/voice call icons in the chat header are present in the UI to match the design but are not wired to a calling backend (out of scope for this build).

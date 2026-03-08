# Humor Admin

Admin dashboard for the Humor Study project. Built with Next.js 14 + Supabase Auth + Google OAuth.

## Features

- 🔐 Google OAuth login via Supabase — only `is_superadmin=TRUE` users can access
- 📊 Dashboard with live statistics (caption velocity, leaderboards, engagement metrics)
- 👤 User/Profile management (READ)
- 🖼️ Image management (CREATE / READ / UPDATE / DELETE)
- 💬 Caption viewer (READ) with sorting and filters

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd humor-admin
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key (server-side only)

### 3. Enable Google OAuth in Supabase

1. Go to **Supabase Dashboard → Authentication → Providers → Google**
2. Enable it and paste in the Google Client ID:
   `388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com`
3. No Client Secret needed — Supabase handles it via PKCE

### 4. Bootstrap Your Superadmin (IMPORTANT)

Since the admin area requires `is_superadmin=TRUE`, you need to manually set this for yourself.
Run this in the **Supabase SQL Editor**:

```sql
UPDATE profiles
SET is_superadmin = TRUE
WHERE email = 'your-google-email@gmail.com';
```

This is the answer to: *"Won't you be locked out?"* — You have direct database access
via the Supabase SQL Editor, so you can bootstrap your own superadmin without needing
the app to be running first.

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` — it will redirect to `/login`.

### 6. Deploy to Vercel

1. Push to GitHub
2. Connect repo in Vercel
3. Add environment variables in Vercel project settings
4. Set `NEXTAUTH_URL` to your Vercel deployment URL (not needed for Supabase OAuth but good practice)
5. Add your Vercel URL to Supabase → Authentication → URL Configuration → Redirect URLs:
   `https://your-app.vercel.app/auth/callback`
6. Turn off **Deployment Protection** in Vercel → Settings → Deployment Protection

## Architecture

```
middleware.ts          — Checks session + is_superadmin on all /admin/* routes
app/auth/callback/     — Supabase OAuth callback (exchanges code for session)
app/login/             — Login page with Google button
app/admin/             — Protected admin area
  page.tsx             — Dashboard with stats
  users/               — Profile list (READ)
  images/              — Image CRUD
  captions/            — Caption list (READ)
lib/supabase/
  client.ts            — Browser client
  server.ts            — Server client (uses cookies)
  admin.ts             — Service role client (bypasses RLS)
lib/actions.ts         — Server actions for image CRUD
```

## Security Notes

- The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is **never** sent to the browser
- All admin data operations use the server-side service role client
- The middleware double-checks `is_superadmin` on every request to `/admin/*`
- RLS policies are **not modified** — the service role bypasses them server-side

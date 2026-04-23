# CambisteCM

A peer-to-peer currency exchange web app built with **Next.js 16**, **Clerk**, **MongoDB/Mongoose**, and **TailwindCSS**.

---

## Stack

| Layer      | Technology            |
|------------|-----------------------|
| Framework  | Next.js 16 App Router |
| Auth       | Clerk v7              |
| Database   | MongoDB + Mongoose    |
| Styling    | TailwindCSS v4        |
| Language   | TypeScript            |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page path (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page path (`/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in (`/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up (`/onboarding`) |
| `MONGODB_URI` | Full MongoDB connection string |
| `NEXT_PUBLIC_BASE_URL` | App base URL (e.g. `http://localhost:3000`) |

---

## Running Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (ClerkProvider + fonts)
│   ├── page.tsx                       # Landing page
│   ├── sign-in/[[...sign-in]]/        # Clerk sign-in page
│   ├── sign-up/[[...sign-up]]/        # Clerk sign-up page
│   ├── onboarding/page.tsx            # Role selection (échangeur / changeur)
│   ├── dashboard/
│   │   ├── layout.tsx                 # Sidebar shell
│   │   └── page.tsx                   # Dashboard with KPIs + changers table
│   └── api/
│       ├── user/route.ts              # GET/POST user profile
│       ├── changers/route.ts          # GET/POST changers
│       └── exchange-requests/route.ts # GET/POST exchange requests
├── components/
│   ├── Sidebar.tsx                    # Navigation sidebar
│   ├── KpiCard.tsx                    # Metric card
│   └── ChangersTable.tsx              # Changers table with unlock flow
├── lib/
│   └── mongodb.ts                     # Cached Mongoose connection
└── models/
    ├── User.ts
    ├── Changer.ts
    └── ExchangeRequest.ts
middleware.ts                          # Clerk route protection
```

---

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add all environment variables in the Vercel project settings.
4. Deploy — Vercel auto-detects Next.js.

> **Tip:** Set `NEXT_PUBLIC_BASE_URL` to your production domain (e.g. `https://cambistecm.vercel.app`).
# CambisteCM

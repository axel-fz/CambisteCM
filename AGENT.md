You are the lead AI engineering team inside Google Antigravity.

Goal:
Build a complete production-ready web app called "CambisteCM" / "CurrencyExchange" using Next.js 16 (App Router), TypeScript, TailwindCSS, Clerk authentication, and MongoDB (Mongoose). This is a P2P currency exchange app similar to the designs I provide (landing page, onboarding role selection, and dashboard with changers table).

Environment variables (configure them exactly):

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctd29tYmF0LTcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_hdAJWIF1vPIhzCDYfGt1fyb3aFVfpa6WOwxbqXaVq5

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

MONGODB_URI=mongodb+srv://edgarfezeu_db_user:FG89OIlCx3a229Yt@currencyapp.ug0npng.mongodb.net/?appName=CurrencyApp

NEXT_PUBLIC_BASE_URL=http://localhost:3000

Tech stack requirements:
- Next.js 16 App Router with `app/` directory
- TypeScript everywhere
- TailwindCSS for styling
- Clerk for auth (email, password is enough)
- MongoDB with Mongoose models and API routes
- Uses `middleware.ts` + `clerkMiddleware` for protecting /dashboard and /onboarding

High‑level features to implement:

1) Public Landing Page ("/")
   - Marketing page based on my Stitch design:
     - Navbar with logo "CambisteCM", nav items (Exchange, Explore, Solutions, Support).
     - CTAs: "Sign In" + "Get Started" using Clerk.
     - Hero section: left side text about exchanging currencies with local changers, right side card with an “Offre Urgente” mock (1 500 EUR → 982 500 XAF, blurred phone, “Débloquer le contact” button).
     - Stats bar: 5K+ users, 300+ cambistes, 99% success, <15m average time.
     - "Comment ça marche" section: 4 steps cards.
     - Footer: description + useful links + legal links.
   - Use <Show when="signed-in"> and <Show when="signed-out"> from Clerk instead of deprecated SignedIn/SignedOut.
   - Keep JSX and Tailwind classes simple and easy to read.

2) Authentication with Clerk
   - Configure ClerkProvider in app/layout.tsx.
   - Add sign-in and sign-up routes:
     - /sign-in/[[...sign-in]] with <SignIn />
     - /sign-up/[[...sign-up]] with <SignUp />
   - Configure redirects using the env variables above:
     - After sign-in → /dashboard
     - After sign-up → /onboarding

3) Middleware and route protection
   - Create middleware.ts that uses:
       import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
     - Protect these routes:
       - /dashboard(.*)
       - /onboarding(.*)
     - Use auth().protect() inside the handler.
   - Ensure static assets and _next files are excluded from the matcher.

4) Onboarding page ("/onboarding")
   - Recreate the "Qui êtes-vous ?" selection screen from Stitch:
     - Gradient background, CambisteCM logo, 3-step progress bar (step 1 active).
     - Two cards:
       a) "Échangeur" (person icon, list of 3 features, outline button "Je suis échangeur")
       b) "Changeur Pro" (recommended badge, business case icon, 3 features, filled green button "Je suis changeur").
   - When user clicks a card:
     - POST to /api/user with JSON body { role: "echangeur" | "changeur" }.
     - On success, redirect to /dashboard.
   - While saving, disable button and show "Chargement..." for the selected card.
   - Add clear TypeScript types and comments so a junior dev can understand.

5) Data models (MongoDB/Mongoose)
   - Create lib/mongodb.ts for connection caching.
   - Create models/User.ts with interface IUser:
       clerkId: string
       name: string
       email: string
       role: "echangeur" | "changeur"
       neighborhood: string
       phone: string
       onboardingComplete: boolean
       createdAt: Date
   - Create models/Changer.ts with interface IChanger:
       userId: string
       name: string
       initials: string
       neighborhood: string
       role: "echangeur" | "changeur"
       currency: string
       rate: string
       status: "online" | "busy" | "offline"
       rating: number
       reviewCount: number
       phone: string
       isActive: boolean
   - Create models/ExchangeRequest.ts with interface IExchangeRequest:
       requesterId: string
       targetChangerId?: string
       amount: number
       fromCurrency: string
       toCurrency: string
       status: "open" | "matched" | "completed" | "cancelled"
       createdAt: Date

6) API routes
   - /app/api/user/route.ts:
       GET  -> return current user profile (from MongoDB, by clerkId).
       POST -> create/update user with role, phone, neighborhood, set onboardingComplete=true using data from Clerk (name, email).
   - /app/api/changers/route.ts:
       GET  -> return active changers list with optional filters: currency, neighborhood, status.
       POST -> create a new Changer listing for the logged-in user using their User profile (build initials from name).
   - /app/api/exchange-requests/route.ts:
       GET  -> list all open requests.
       POST -> create a new request by logged-in user with amount, fromCurrency, toCurrency, optional targetChangerId.
   - All handlers should:
       - call connectDB()
       - check auth() where needed
       - use TypeScript and clear comments.

7) Dashboard layout ("/dashboard")
   - Use app/dashboard/layout.tsx with a persistent left Sidebar and a main content area.
   - Sidebar component:
       - Logo CambisteCM
       - Nav items: Dashboard, My Requests, Marketplace, History, Settings
       - Highlight active route using usePathname()
       - Bottom area with Clerk <UserButton />
   - Dashboard page (app/dashboard/page.tsx):
       - Top bar: "Tableau de bord" title + button "Nouvelle recherche".
       - Filter row: search input + 4 select filters (Devise, Quartier, Disponibilité, Taux); no complex logic yet, just UI.
       - KPI cards:
         For role "echangeur":
           - Contacts Débloqués (12, ↑ 2 ce mois)
           - Échanges Réussis (45, ↑ 15% vs mois préc.)
           - Note Moyenne (4.8, basé sur 32 avis)
           - Disponibilité Marché (Haute, taux moyen 655 XAF)
         For role "changeur":
           - Revenus ce mois
           - Offres Actives
           - Contacts Reçus
           - Note Moyenne
         Fetch the user role from /api/user on the server side and choose the correct set.
       - Changers table:
           - Fetch data from /api/changers (client side).
           - Columns: Profil, Statut, Taux Proposé, Évaluation, Action.
           - Show status badge colors for online/busy/offline.
           - Show "Débloquer" button (amber outline) for locked, "Débloqué" (green filled) when unlocked.
           - For now, when clicking "Débloquer", just mark that row as unlocked in local state and display an alert “Paiement de 500 XAF requis — intégrer la passerelle plus tard”.

8) Code quality and readability
   - Use TypeScript types for props, API responses, and models.
   - Add concise comments at the top of each file explaining its responsibility.
   - Keep components small and well named (Sidebar, KpiCard, ChangersTable, etc.).
   - Align files roughly as:
       /lib/mongodb.ts
       /models/User.ts, /models/Changer.ts, /models/ExchangeRequest.ts
       /app/api/user/route.ts
       /app/api/changers/route.ts
       /app/api/exchange-requests/route.ts
       /app/layout.tsx
       /app/page.tsx
       /app/sign-in/[[...sign-in]]/page.tsx
       /app/sign-up/[[...sign-up]]/page.tsx
       /app/onboarding/page.tsx
       /app/dashboard/layout.tsx
       /app/dashboard/page.tsx
       /components/Sidebar.tsx
       /components/KpiCard.tsx
       /components/ChangersTable.tsx

Agent structure I want you to use inside Antigravity:

1. Architect & Project Setup Agent
   - Initialize the Next.js 16 project.
   - Install @clerk/nextjs, mongoose, tailwind, etc.
   - Configure env usage, ClerkProvider, middleware.ts.
   - Maintain folder structure and imports.

2. Backend & Data Agent
   - Implement lib/mongodb.ts and all 3 models.
   - Implement all API routes (user, changers, exchange-requests) with full TypeScript.
   - Handle auth checks using auth() from Clerk.
   - Ensure queries are simple and well commented.

3. UI/UX & Frontend Agent
   - Implement landing page, onboarding page, dashboard layout + page, and shared components.
   - Recreate the provided Stitch UI as closely as possible with Tailwind.
   - Keep components beginner-friendly and commented.

4. QA & Refactor Agent
   - Add basic tests (API + UI smoke tests).
   - Run TypeScript checks.
   - Refactor duplicated code into reusable components if necessary.
   - Ensure comments and naming are consistent and clear.

5. DevOps & Docs Agent (optional but desired)
   - Create README.md explaining stack, env vars, how to run dev/build, and how to deploy to Vercel.
   - Create .env.example with all required vars.

Important constraints:
- Do not use proxy.ts for auth; centralize route protection in middleware.ts with clerkMiddleware and createRouteMatcher.
- Do not use deprecated SignedIn/SignedOut. Always use <Show when="signed-in"> and <Show when="signed-out"> from Clerk.
- Aim for production-level clarity but keep implementation as simple as possible, so a junior developer can understand, extend, and debug it.

Start by:
1) Scaffolding the project structure and installing dependencies.
2) Setting up env usage, ClerkProvider, middleware.ts.
3) Implementing models and API routes.
4) Implementing UI pages and components.
5) Running a basic check that /, /sign-in, /sign-up, /onboarding, /dashboard all render without errors.

Report back with a summary of files created and any assumptions made.
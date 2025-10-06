# 🚀 Winter Arc Tracker - Quick Start

## Phase 1 Setup Complete! ✅

All foundational work is done. Follow these 4 steps to get started:

---

## 1️⃣ Install Dependencies (Already Done! ✅)

Dependencies are already installed. Skip to step 2.

---

## 2️⃣ Setup Clerk (5 minutes)

### Create Clerk Account
1. Go to https://clerk.com
2. Create a new application
3. Choose "Email & Password"

### Configure URLs
In Clerk Dashboard → Paths:
```
Sign-in URL: /sign-in
Sign-up URL: /sign-up
After sign-in URL: /today
After sign-up URL: /today
```

### Copy API Keys
In Clerk Dashboard → API Keys:
- Copy `Publishable key`
- Copy `Secret key`

---

## 3️⃣ Setup Supabase (5 minutes)

### Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for database to be ready

### Run Schema
1. Go to SQL Editor in Supabase
2. Open `lib/supabase/schema.sql` in your editor
3. Copy entire file contents
4. Paste into SQL Editor
5. Click "Run"
6. Verify 4 tables created: `profiles`, `daily_entries`, `weekly_reviews`, `checkpoint_notes`

### Copy API Keys
In Project Settings → API:
- Copy `Project URL` → NEXT_PUBLIC_SUPABASE_URL
- Copy `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY
- Copy `service_role` key → SUPABASE_SERVICE_KEY (keep secret!)

---

## 4️⃣ Configure Environment Variables (2 minutes)

### Create .env.local
```bash
cp .env.local.example .env.local
```

### Fill in your credentials:

```env
# === CLERK ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/today
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/today

# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_KEY=eyJhb...

# === CRON ===
CRON_SECRET=any-random-string-here

# === OPTIONAL ===
DEFAULT_TIMEZONE=Asia/Kolkata
```

---

## 🎉 Start Development

```bash
pnpm dev
```

Open http://localhost:3000

---

## ✅ Verify Setup

1. **Dev server starts** → ✅
2. **Can access /sign-up** → ✅
3. **Can create account** → ✅
4. **Redirects to /today** → ✅
5. **Navigation works** → ✅
6. **Can sign out** → ✅

---

## 📁 Project Structure Overview

```
winter-arc-tracker/
├── app/
│   ├── (auth)/              # Sign in/up pages
│   ├── (dashboard)/         # Protected pages (today, scorecard, progress, review)
│   ├── api/                 # API routes (Phase 2+)
│   ├── layout.tsx           # Root layout with Clerk
│   └── globals.css          # Tailwind v4 styles
├── components/              # React components (Phase 2+)
├── lib/
│   ├── supabase/            # Database client & schema
│   ├── utils/               # Helper functions (date, scoring, streak)
│   └── constants/           # App constants
├── types/                   # TypeScript types
├── middleware.ts            # Clerk route protection
└── [config files]           # tsconfig, tailwind, next, etc.
```

---

## 🛠️ Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter
```

---

## 📖 Key Files to Know

### For Development:
- `types/index.ts` - All TypeScript interfaces
- `lib/utils/scoring.ts` - Score calculation logic
- `lib/constants/targets.ts` - Target definitions (5 daily habits)
- `lib/supabase/client.ts` - Database client

### For Styling:
- `tailwind.config.ts` - Custom colors and design tokens
- `app/globals.css` - Global styles (Tailwind v4)

### For Database:
- `lib/supabase/schema.sql` - Complete database schema
- `types/database.ts` - Database type definitions

---

## 🎯 What's Built (Phase 1)

✅ Next.js 15 with TypeScript
✅ Tailwind CSS v4 configured
✅ Clerk authentication integrated
✅ Supabase client setup
✅ Database schema ready
✅ Basic layouts and navigation
✅ Type definitions complete
✅ Utility functions (date, scoring, streak)
✅ All folder structure

---

## 🚧 What's Next (Phase 2)

Will build:
- Daily tracker components (5 habit trackers)
- API routes for CRUD operations
- Auto-save functionality
- Real-time score calculation
- Animations and interactions

---

## 🎨 Design System

**Colors:**
- Background: Pure black (#000000)
- Surface: Near black (#0a0a0a)
- Text: White (#ffffff)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

**Font:**
- Inter Tight (100-900 weights)

**Animations:**
- 200ms cubic-bezier transitions

---

## 💡 Pro Tips

1. **Environment Variables**: Never commit `.env.local` to git
2. **Database**: Always test queries in Supabase SQL Editor first
3. **Types**: Import types from `@/types` to maintain consistency
4. **Utilities**: Use helper functions in `lib/utils/` instead of rewriting logic
5. **Styling**: Use custom colors from `tailwind.config.ts`

---

## 🆘 Troubleshooting

### "Missing publishableKey" error
→ Check `.env.local` has correct Clerk keys

### "Cannot connect to Supabase" error
→ Verify Supabase URL and keys in `.env.local`

### Tailwind classes not working
→ Run `pnpm dev` again (restart dev server)

### TypeScript errors
→ Run `pnpm build` to see all errors

---

## 📚 Documentation

- `README.md` - Full project overview
- `SETUP.md` - Detailed setup instructions with all commands
- `PROJECT_SUMMARY.md` - Complete Phase 1 summary
- `PHASE1_COMPLETE.md` - Phase 1 completion checklist
- `QUICKSTART.md` - This file

---

## 🎓 Learn More

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind v4 Docs](https://tailwindcss.com/docs)

---

## ✨ You're All Set!

Once you complete steps 2-4 above, you're ready to start building the daily tracker in Phase 2.

**Happy coding! 🎉**


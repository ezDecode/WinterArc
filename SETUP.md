# Winter Arc Tracker - Complete Setup Guide

## Phase 1: Project Setup Complete ✅

This document provides all the commands and configurations used to set up the Winter Arc Tracker project from scratch.

---

## 1. Initial Project Setup

### Create Project Directory & Initialize pnpm
```bash
mkdir winter-arc-tracker
cd winter-arc-tracker
pnpm init
```

### Install Core Dependencies
```bash
pnpm add next@latest react@latest react-dom@latest @clerk/nextjs@latest @supabase/supabase-js@latest zod@latest
```

### Install Dev Dependencies
```bash
pnpm add -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer
```

---

## 2. Folder Structure

All folders have been created with the following command:

```bash
mkdir -p app/{api/{daily,stats,reviews,cron},'(auth)'/{sign-in/'[[...sign-in]]',sign-up/'[[...sign-up]]'},'(dashboard)'/{today,scorecard,progress,review}} components/{ui,tracker,analytics,layout} lib/{supabase,utils,constants} types hooks public
```

### Final Structure:
```
winter-arc-tracker/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── today/page.tsx
│   │   ├── scorecard/page.tsx
│   │   ├── progress/page.tsx
│   │   └── review/page.tsx
│   ├── api/
│   │   ├── daily/
│   │   ├── stats/
│   │   ├── reviews/
│   │   └── cron/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── tracker/
│   ├── analytics/
│   └── layout/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── schema.sql
│   ├── utils/
│   │   ├── date.ts
│   │   ├── scoring.ts
│   │   └── streak.ts
│   └── constants/
│       └── targets.ts
├── types/
│   ├── database.ts
│   └── index.ts
├── hooks/
├── public/
│   └── manifest.json
├── middleware.ts
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example
├── .gitignore
├── package.json
├── prd.json
└── README.md
```

---

## 3. Configuration Files Created

### ✅ package.json
Updated with Next.js scripts and project metadata.

### ✅ tsconfig.json
TypeScript configuration with path aliases (`@/*`).

### ✅ next.config.ts
Next.js 15 configuration with experimental features.

### ✅ tailwind.config.ts
Tailwind CSS v4 with custom design tokens:
- Monochromatic color scheme
- Inter Tight font
- Custom spacing and animations

### ✅ postcss.config.mjs
PostCSS configuration for Tailwind and Autoprefixer.

### ✅ middleware.ts
Clerk authentication middleware with route protection.

### ✅ .env.local.example
Environment variable template with all required keys.

### ✅ .gitignore
Standard Next.js gitignore with environment files.

---

## 4. Supabase Setup

### Database Schema File: `lib/supabase/schema.sql`

This file contains:
- ✅ 4 tables: `profiles`, `daily_entries`, `weekly_reviews`, `checkpoint_notes`
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Automatic timestamp updates
- ✅ Foreign key constraints

### To Set Up Database:

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor
3. Copy and paste the entire contents of `lib/supabase/schema.sql`
4. Click "Run" to execute
5. Verify tables are created in the Table Editor

### Supabase Client Files:
- ✅ `lib/supabase/client.ts` - Client-side Supabase instance
- ✅ `lib/supabase/server.ts` - Server-side Supabase admin instance

---

## 5. Clerk Authentication Setup

### Steps:

1. **Create Clerk Application**
   - Go to https://clerk.com
   - Create a new application
   - Choose "Email & Password" authentication

2. **Configure URLs in Clerk Dashboard**
   ```
   Sign-in URL: /sign-in
   Sign-up URL: /sign-up
   After sign-in URL: /today
   After sign-up URL: /today
   Home URL: http://localhost:3000 (for development)
   ```

3. **Copy API Keys**
   - Copy `Publishable key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy `Secret key` → `CLERK_SECRET_KEY`
   - Add to `.env.local`

4. **Middleware Configuration**
   - ✅ Already configured in `middleware.ts`
   - Protects all routes except sign-in/sign-up and cron endpoints

---

## 6. Environment Variables Setup

### Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

### Fill in the values:

```env
# Clerk (from Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/today
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/today

# Supabase (from Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Cron (generate a random secret)
CRON_SECRET=your-random-secret-here

# Optional
DEFAULT_TIMEZONE=Asia/Kolkata
```

---

## 7. TypeScript Type Definitions

### ✅ Created Files:

1. **`types/database.ts`** - Supabase database types
   - Matches database schema exactly
   - Includes Row, Insert, and Update types for each table

2. **`types/index.ts`** - Application types
   - `DailyEntry`, `Profile`, `WeeklyReview`, `CheckpointNote`
   - `StudyBlock`, `Reading`, `Pushups`, `Meditation`, `Notes`
   - API response types

---

## 8. Utility Functions

### ✅ Created Helper Functions:

1. **`lib/utils/date.ts`** - Date utilities
   - `formatDate()` - Format to YYYY-MM-DD
   - `getTodayDate()` - Get today in user timezone
   - `getWeekNumber()` - Calculate week 1-13
   - `getDayNumber()` - Calculate day 1-90
   - `isFutureDate()` - Check if date is in future

2. **`lib/utils/scoring.ts`** - Score calculations
   - `calculateDailyScore()` - Calculate 0-5 daily score
   - `isDayComplete()` - Check if day is 5/5
   - `calculateTargetCompletion()` - Get % for each target

3. **`lib/utils/streak.ts`** - Streak calculations
   - `calculateStreaks()` - Current and longest streak
   - `getStreakColor()` - Color based on length

4. **`lib/constants/targets.ts`** - App constants
   - Target definitions (Study, Reading, Pushups, Meditation, Water)
   - Score colors
   - Total days/weeks

---

## 9. Authentication Pages

### ✅ Created:

1. **`app/(auth)/sign-in/[[...sign-in]]/page.tsx`**
   - Clerk sign-in component with custom styling
   - Matches Winter Arc design system

2. **`app/(auth)/sign-up/[[...sign-up]]/page.tsx`**
   - Clerk sign-up component with custom styling

---

## 10. Dashboard Layout & Pages

### ✅ Dashboard Layout: `app/(dashboard)/layout.tsx`
- Navigation bar with links
- User button (Clerk)
- Responsive mobile menu

### ✅ Dashboard Pages (Placeholders for Phase 2+):

1. **Today** (`/today`) - Daily habit tracker
2. **Scorecard** (`/scorecard`) - 13-week grid
3. **Progress** (`/progress`) - Analytics dashboard
4. **Review** (`/review`) - Weekly reviews

---

## 11. Running the Application

### Development Server:
```bash
pnpm dev
```

Open http://localhost:3000

### Build for Production:
```bash
pnpm build
```

### Start Production Server:
```bash
pnpm start
```

---

## 12. Verification Checklist

Before proceeding to Phase 2, verify:

- [ ] All dependencies installed (`node_modules/` exists)
- [ ] `.env.local` created with all keys
- [ ] Supabase schema executed successfully
- [ ] Clerk application configured
- [ ] Dev server runs without errors
- [ ] Can sign up and sign in
- [ ] Redirects to `/today` after authentication
- [ ] All dashboard pages accessible
- [ ] No TypeScript errors

---

## 13. Next Steps (Phase 2)

Phase 2 will implement:

1. Daily tracker UI components
2. CRUD operations for daily entries
3. Auto-save functionality
4. Checkbox interactions with animations
5. Daily score calculation
6. API routes for data operations

---

## 14. Deployment (Phase 5)

### Vercel Deployment:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Cron Job Setup (for 4 AM reset):
- Add `vercel.json` with cron configuration
- Implement `/api/cron/route.ts` endpoint
- Secure with `CRON_SECRET`

---

## Package Versions (Installed)

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.33.2",
    "@supabase/supabase-js": "^2.58.0",
    "next": "^15.5.4",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "@types/node": "^24.7.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.14",
    "typescript": "^5.9.3"
  }
}
```

---

## Support

For issues or questions:
- Check the README.md
- Review the PRD (prd.json)
- Consult Next.js, Clerk, and Supabase documentation

---

**Phase 1 Complete! 🎉**

All foundational setup is complete. You can now proceed to Phase 2 to build the daily tracker functionality.


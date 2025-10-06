# Winter Arc Tracker

A 90-day personal habit tracking application with automatic daily resets and comprehensive progress analytics.

## Features

- **Daily Habit Tracking**: Track 5 core habits daily
  - Study: 4 × 1-hour focused blocks
  - Reading: 10+ pages
  - Pushups: 50+ (20+15+15+extras)
  - Meditation: 10-20 minutes
  - Water: 4L (8 × 500ml bottles)

- **13-Week Scorecard**: Visual grid showing all 90 days with color-coded scores
- **Progress Dashboard**: Track streaks, completion rates, and trends
- **Weekly Reviews**: Reflect and improve every Sunday
- **Automatic Daily Reset**: New entry created at 4:00 AM in your timezone

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Clerk account (for authentication)
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd winter-arc-tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```

   Required environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
   - `CLERK_SECRET_KEY` - From Clerk dashboard
   - `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
   - `SUPABASE_SERVICE_KEY` - From Supabase project settings
   - `CRON_SECRET` - Generate a random string for cron job security

4. **Set up Supabase database**

   a. Create a new Supabase project at [supabase.com](https://supabase.com)
   
   b. Go to SQL Editor and run the schema from `lib/supabase/schema.sql`
   
   c. This will create all necessary tables and Row Level Security policies

5. **Configure Clerk**

   a. Create a Clerk application at [clerk.com](https://clerk.com)
   
   b. Configure redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/today`
   - After sign-up: `/today`

6. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
winter-arc-tracker/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── today/           # Daily tracker
│   │   ├── scorecard/       # 13-week grid
│   │   ├── progress/        # Analytics dashboard
│   │   └── review/          # Weekly reviews
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── tracker/             # Tracker-specific components
│   ├── analytics/           # Chart and stats components
│   └── layout/              # Layout components
├── lib/                     # Utility functions
│   ├── supabase/            # Supabase client and schema
│   ├── utils/               # Helper functions
│   └── constants/           # App constants
├── types/                   # TypeScript type definitions
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
```

## Development Phases

### Phase 1: Foundation ✅
- [x] Setup Next.js with TypeScript
- [x] Configure Tailwind CSS v4
- [x] Integrate Clerk authentication
- [x] Setup Supabase client and types
- [x] Create database schema
- [x] Build basic layout

### Phase 2: Daily Tracker (In Progress)
- [ ] Implement daily tracker UI components
- [ ] Create CRUD operations for daily entries
- [ ] Add real-time auto-save functionality
- [ ] Build checkbox interactions with animations
- [ ] Implement daily score calculation

### Phase 3: Analytics & Visualization
- [ ] Create 13-week scorecard grid
- [ ] Implement streak calculation logic
- [ ] Build progress dashboard with charts
- [ ] Add data visualization components
- [ ] Create weekly review form

### Phase 4: Automation & PWA
- [ ] Setup Vercel Cron for 4 AM reset
- [ ] Implement timezone handling
- [ ] Add data export functionality
- [ ] Create PWA manifest for mobile
- [ ] Add keyboard shortcuts

### Phase 5: Polish & Deploy
- [ ] Add loading states and skeletons
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Create onboarding flow
- [ ] Deploy to Vercel

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Environment Variables

See `.env.local.example` for all required environment variables.

## Database Schema

The application uses four main tables:

1. **profiles** - Extended user profiles linked to Clerk
2. **daily_entries** - Core daily habit tracking data
3. **weekly_reviews** - Sunday weekly reflection entries
4. **checkpoint_notes** - Weekly checkpoint progress notes

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Design System

- **Colors**: Monochromatic scheme (black/white/gray with accent colors)
- **Font**: Inter Tight (100-900 weights)
- **Animations**: 200ms cubic-bezier transitions
- **Spacing**: 4px base unit

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

MIT License - See LICENSE file for details

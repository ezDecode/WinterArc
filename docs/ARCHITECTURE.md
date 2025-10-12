# WinterArc Architecture

## System Overview

Winter Arc is a full-stack Next.js application for tracking 90-day habit challenges with real-time updates and comprehensive analytics.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **Charts**: Recharts
- **State Management**: React Hooks
- **Authentication UI**: Clerk Components

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase Client
- **Email**: Resend
- **Cron Jobs**: Vercel Cron

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Analytics**: Vercel Analytics

## Application Structure

```
WinterArc/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (sign-in, sign-up, onboarding)
│   ├── (dashboard)/              # Protected dashboard pages
│   ├── api/                      # API routes
│   │   ├── cron/                 # Scheduled jobs
│   │   ├── daily/                # Daily entry endpoints
│   │   ├── profile/              # User profile endpoints
│   │   ├── reviews/              # Weekly review endpoints
│   │   └── stats/                # Statistics endpoints
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── analytics/                # Analytics visualizations
│   ├── landing/                  # Landing page components
│   ├── tracker/                  # Habit tracker components
│   └── ui/                       # Reusable UI components
│
├── hooks/                        # Custom React hooks
│   ├── useAutoSave.ts            # Auto-save functionality
│   ├── useConfetti.ts            # Celebration animations
│   ├── useDailyEntry.ts          # Daily entry management
│   └── useKeyboardShortcuts.ts   # Keyboard navigation
│
├── lib/                          # Business logic and utilities
│   ├── constants/                # Application constants
│   ├── errors/                   # Error handling
│   ├── services/                 # External services (email, etc.)
│   ├── supabase/                 # Database clients
│   └── utils/                    # Utility functions
│
├── types/                        # TypeScript definitions
│   ├── database.ts               # Database schema types
│   └── index.ts                  # Application types
│
├── public/                       # Static assets
├── scripts/                      # Utility scripts
└── __tests__/                    # Test files
```

## Data Flow

### 1. User Authentication
```
User → Clerk UI → Clerk API → JWT Token → Protected Routes
```

### 2. Daily Entry Creation/Update
```
User Input → React Component → useAutoSave Hook →
API Route → Validation → Supabase → Score Calculation →
Response → UI Update → Confetti (if complete)
```

### 3. Statistics Generation
```
API Request → Supabase Query → Data Aggregation →
Streak Calculation → Format Response → Cache → UI Display
```

### 4. Daily Reset (Cron)
```
Vercel Cron → API Route (with CRON_SECRET) →
Fetch All Users → For Each User:
  - Check Timezone
  - Create Today's Entry
  - Send Reminder Email (if needed)
```

## Key Features

### Auto-Save System
- Debounced saves (500ms delay)
- Optimistic UI updates
- Automatic score recalculation
- Error handling with retry logic

### Timezone Handling
- User-specific timezone storage
- Server-side date calculations
- UTC storage, local display
- Cron job timezone awareness

### Score Calculation
- Real-time calculation on updates
- 5-point system (0-5)
- Weighted components:
  - Study: 4 blocks = 1 point
  - Reading: 10+ pages = 1 point
  - Pushups: 50+ reps = 1 point
  - Meditation: 10-20 min = 1 point
  - Water: 8 bottles = 1 point

### Streak System
- Perfect day streak (score = 5)
- Current streak calculation
- Longest streak tracking
- Visual indicators

## Database Schema

### Tables
1. **profiles**: User profile information
2. **daily_entries**: Daily habit tracking data
3. **weekly_reviews**: Week-end reflections
4. **user_statistics**: Materialized view for analytics

### Key Relationships
```
profiles (1) ----< (many) daily_entries
profiles (1) ----< (many) weekly_reviews
```

## Security

### Authentication
- Clerk handles all auth flows
- JWT tokens for API requests
- Session-based authentication
- Automatic token refresh

### Authorization
- Row Level Security (RLS) in Supabase
- User-specific data isolation
- API route protection via middleware
- Cron job secret validation

### Data Protection
- Environment variable encryption
- HTTPS only
- Secure cookie handling
- SQL injection prevention (parameterized queries)

## Performance Optimizations

1. **Code Splitting**: Dynamic imports for charts
2. **Image Optimization**: Next.js Image component
3. **API Caching**: Stale-while-revalidate strategy
4. **Database Indexes**: Optimized queries
5. **Edge Functions**: Middleware on Vercel Edge
6. **Static Generation**: Landing page pre-rendered

## Monitoring & Observability

- **Logs**: Console logging in development
- **Errors**: Error boundaries in React
- **Analytics**: Vercel Analytics
- **Database**: Supabase dashboard monitoring

## Deployment

### Vercel Deployment
```
Git Push → GitHub → Vercel →
  Build → Tests → Deploy → Edge Network
```

### Environment Variables
- Managed in Vercel Dashboard
- Automatic injection during build
- Separate for preview/production

---

Last Updated: 2025-10-12

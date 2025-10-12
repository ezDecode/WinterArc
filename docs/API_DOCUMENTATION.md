# WinterArc API Documentation

**Version:** 1.0.0  
**Base URL:** `https://rebuild.creativesky.me`  
**Description:** A 90-day personal habit tracking application with automatic daily resets and comprehensive progress analytics

---

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
   - [Profile Management](#profile-management)
   - [Daily Entries](#daily-entries)
   - [Statistics](#statistics)
   - [Weekly Reviews](#weekly-reviews)
   - [Cron Jobs](#cron-jobs)
   - [Testing](#testing)
5. [Examples](#examples)

---

## Authentication

All API endpoints (except cron jobs) require authentication using **Clerk**. Authentication is handled via session cookies or JWT tokens.

### Authentication Headers

```http
Cookie: __session=<clerk_session_token>
```

Or using Authorization header:

```http
Authorization: Bearer <clerk_jwt_token>
```

### Authentication Errors

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**503 Service Unavailable** (Authentication service not configured)
```json
{
  "error": "Authentication service not configured",
  "details": "Invalid Clerk credentials"
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)",
  "code": "ERROR_CODE (optional)"
}
```

### Common HTTP Status Codes

- **200 OK** - Successful request
- **201 Created** - Resource successfully created
- **400 Bad Request** - Invalid request parameters
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **405 Method Not Allowed** - HTTP method not supported
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - Service temporarily unavailable

---

## Data Models

### DailyEntry

```typescript
{
  id: string
  user_id: string
  entry_date: string           // Format: YYYY-MM-DD
  study_blocks: StudyBlock[]
  reading: Reading
  pushups: Pushups
  meditation: Meditation
  water_bottles: boolean[]     // Array of 8 booleans
  notes: Notes
  daily_score: number          // 0-5
  is_complete: boolean
  created_at: string           // ISO 8601
  updated_at: string           // ISO 8601
}
```

### StudyBlock

```typescript
{
  checked: boolean
  topic: string
}
```

### Reading

```typescript
{
  checked: boolean
  bookName: string
  pages: number
}
```

### Pushups

```typescript
{
  set1: boolean    // 20 pushups
  set2: boolean    // 15 pushups
  set3: boolean    // 15 pushups
  extras: number   // Additional pushups beyond 50
}
```

### Meditation

```typescript
{
  checked: boolean
  method: string
  duration: number  // Duration in minutes
}
```

### Notes

```typescript
{
  morning?: string
  evening?: string
  general?: string
}
```

### Profile

```typescript
{
  id: string
  clerk_user_id: string
  email: string
  timezone: string           // IANA timezone (e.g., "Asia/Kolkata")
  arc_start_date: string     // Format: YYYY-MM-DD
  created_at: string         // ISO 8601
  updated_at: string         // ISO 8601
}
```

### WeeklyReview

```typescript
{
  id: string
  user_id: string
  week_number: number        // 1-13
  review_date: string        // Format: YYYY-MM-DD
  days_hit_all: number       // 0-7
  what_helped: string | null
  what_blocked: string | null
  next_week_change: string | null
  created_at: string         // ISO 8601
}
```

### DashboardStats

```typescript
{
  totalDays: number
  completedDays: number
  completionPercentage: number
  currentStreak: number
  longestStreak: number
  targetCompletionRates: {
    study: number
    reading: number
    pushups: number
    meditation: number
    water: number
  }
  weeklyAverageScore: number
  trendData: Array<{
    date: string
    score: number
  }>
}
```

### ScorecardData

```typescript
{
  weeks: Array<{
    weekNumber: number
    days: Array<{
      date: string
      score: number
      isFuture: boolean
      isEmpty?: boolean    // For padding days
    }>
    weekTotal: number
  }>
}
```

### StreakData

```typescript
{
  currentStreak: number
  longestStreak: number
}
```

---

## API Endpoints

### Profile Management

#### Get User Profile

**GET** `/api/profile`

Get or create the current user's profile.

**Request:**
- No parameters required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "clerk_user_id": "user_xxx",
  "email": "user@example.com",
  "timezone": "Asia/Kolkata",
  "arc_start_date": "2024-01-01",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

#### Update User Profile

**PATCH** `/api/profile`

Update user profile settings (currently only timezone).

**Request Body:**
```json
{
  "timezone": "America/New_York"
}
```

**Validation:**
- `timezone` must match pattern: `[A-Za-z]+/[A-Za-z_]+`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "clerk_user_id": "user_xxx",
  "email": "user@example.com",
  "timezone": "America/New_York",
  "arc_start_date": "2024-01-01",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `400` - Invalid timezone format
- `401` - Unauthorized
- `500` - Internal server error

---

### Daily Entries

#### Get Today's Entry

**GET** `/api/daily/today`

Get or create the daily entry for today (based on user's timezone).

**Request:**
- No parameters required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "entry_date": "2024-01-15",
  "study_blocks": [
    { "checked": false, "topic": "" },
    { "checked": false, "topic": "" },
    { "checked": false, "topic": "" },
    { "checked": false, "topic": "" }
  ],
  "reading": {
    "checked": false,
    "bookName": "",
    "pages": 0
  },
  "pushups": {
    "set1": false,
    "set2": false,
    "set3": false,
    "extras": 0
  },
  "meditation": {
    "checked": false,
    "method": "",
    "duration": 0
  },
  "water_bottles": [false, false, false, false, false, false, false, false],
  "notes": {
    "morning": "",
    "evening": "",
    "general": ""
  },
  "daily_score": 0,
  "is_complete": false,
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error
- `503` - Authentication service not configured

---

#### Get Entry by Date

**GET** `/api/daily/{date}`

Get or create a daily entry for a specific date.

**Path Parameters:**
- `date` (required) - Date in YYYY-MM-DD format

**Request:**
```http
GET /api/daily/2024-01-15
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "entry_date": "2024-01-15",
  "study_blocks": [...],
  "reading": {...},
  "pushups": {...},
  "meditation": {...},
  "water_bottles": [...],
  "notes": {...},
  "daily_score": 3,
  "is_complete": false,
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error
- `503` - Authentication service not configured

---

#### Update Entry by Date

**PATCH** `/api/daily/{date}`

Update a daily entry for a specific date. Automatically recalculates daily score and completion status.

**Path Parameters:**
- `date` (required) - Date in YYYY-MM-DD format

**Request Body:** (All fields are optional)
```json
{
  "study_blocks": [
    { "checked": true, "topic": "Mathematics" },
    { "checked": true, "topic": "Programming" },
    { "checked": false, "topic": "" },
    { "checked": false, "topic": "" }
  ],
  "reading": {
    "checked": true,
    "bookName": "Atomic Habits",
    "pages": 25
  },
  "pushups": {
    "set1": true,
    "set2": true,
    "set3": false,
    "extras": 5
  },
  "meditation": {
    "checked": true,
    "method": "Mindfulness",
    "duration": 15
  },
  "water_bottles": [true, true, true, true, true, false, false, false],
  "notes": {
    "morning": "Feeling energized",
    "evening": "Good progress today",
    "general": "Need to improve water intake"
  }
}
```

**Validation Rules:**
- `study_blocks` - Array of objects with `checked` (boolean) and `topic` (string)
- `reading` - Object with `checked` (boolean), `bookName` (string), `pages` (number)
- `pushups` - Object with `set1`, `set2`, `set3` (boolean), `extras` (number)
- `meditation` - Object with `checked` (boolean), `method` (string), `duration` (number)
- `water_bottles` - Array of 8 booleans
- `notes` - Object with optional `morning`, `evening`, `general` (strings)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "entry_date": "2024-01-15",
  "study_blocks": [...],
  "reading": {...},
  "pushups": {...},
  "meditation": {...},
  "water_bottles": [...],
  "notes": {...},
  "daily_score": 4,
  "is_complete": false,
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-01-15T11:45:00Z"
}
```

**Errors:**
- `400` - Invalid request data
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error
- `503` - Authentication service not configured

---

#### Get Entries by Date Range

**GET** `/api/daily/range`

Get all daily entries within a date range.

**Query Parameters:**
- `start` (required) - Start date in YYYY-MM-DD format
- `end` (required) - End date in YYYY-MM-DD format

**Request:**
```http
GET /api/daily/range?start=2024-01-01&end=2024-01-31
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "entry_date": "2024-01-01",
    "study_blocks": [...],
    "reading": {...},
    "pushups": {...},
    "meditation": {...},
    "water_bottles": [...],
    "notes": {...},
    "daily_score": 5,
    "is_complete": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T23:00:00Z"
  },
  {
    "id": "uuid",
    "user_id": "uuid",
    "entry_date": "2024-01-02",
    ...
  }
]
```

**Errors:**
- `400` - Missing start or end date parameters
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### Statistics

#### Get Dashboard Statistics

**GET** `/api/stats/dashboard`

Get aggregated dashboard metrics including completion rates, streaks, and trend data.

**Request:**
- No parameters required

**Response:** `200 OK`
```json
{
  "totalDays": 30,
  "completedDays": 22,
  "completionPercentage": 73,
  "currentStreak": 5,
  "longestStreak": 12,
  "targetCompletionRates": {
    "study": 85,
    "reading": 90,
    "pushups": 75,
    "meditation": 80,
    "water": 70
  },
  "weeklyAverageScore": 4.2,
  "trendData": [
    { "date": "2024-01-01", "score": 5 },
    { "date": "2024-01-02", "score": 4 },
    ...
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

#### Get Scorecard Data

**GET** `/api/stats/scorecard`

Get 13-week scorecard data with daily scores for the entire 90-day arc.

**Request:**
- No parameters required

**Response:** `200 OK`
```json
{
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        { "date": "", "score": 0, "isFuture": false, "isEmpty": true },
        { "date": "", "score": 0, "isFuture": false, "isEmpty": true },
        { "date": "2024-01-01", "score": 5, "isFuture": false },
        { "date": "2024-01-02", "score": 4, "isFuture": false },
        { "date": "2024-01-03", "score": 5, "isFuture": false },
        { "date": "2024-01-04", "score": 3, "isFuture": false },
        { "date": "2024-01-05", "score": 4, "isFuture": false }
      ],
      "weekTotal": 21
    },
    {
      "weekNumber": 2,
      "days": [...],
      "weekTotal": 28
    },
    ...
  ]
}
```

**Field Descriptions:**
- `isEmpty` - Indicates padding days before arc start or after arc end
- `isFuture` - Indicates dates that haven't occurred yet
- `weekTotal` - Sum of daily scores for the week (excludes future days)

**Errors:**
- `400` - Invalid arc start date format
- `401` - Unauthorized (code: AUTH_REQUIRED)
- `404` - User not found (code: USER_NOT_FOUND)
- `500` - Internal server error

---

#### Get Streak Data

**GET** `/api/stats/streak`

Get current and longest streak data for perfect days (score = 5).

**Request:**
- No parameters required

**Response:** `200 OK`
```json
{
  "currentStreak": 5,
  "longestStreak": 12
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### Weekly Reviews

#### Get All Weekly Reviews

**GET** `/api/reviews`

Get all weekly reviews for the current user.

**Request:**
- No parameters required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "week_number": 1,
    "review_date": "2024-01-07",
    "days_hit_all": 5,
    "what_helped": "Morning routine and accountability partner",
    "what_blocked": "Late night work meetings",
    "next_week_change": "Set earlier bedtime alarm",
    "created_at": "2024-01-07T20:00:00Z"
  },
  {
    "id": "uuid",
    "user_id": "uuid",
    "week_number": 2,
    ...
  }
]
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

#### Get Weekly Review by Week

**GET** `/api/reviews/{week}`

Get a specific week's review.

**Path Parameters:**
- `week` (required) - Week number (1-13)

**Request:**
```http
GET /api/reviews/5
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "week_number": 5,
  "review_date": "2024-02-04",
  "days_hit_all": 6,
  "what_helped": "Better time management",
  "what_blocked": "Unexpected travel",
  "next_week_change": "Plan ahead for travel days",
  "created_at": "2024-02-04T20:00:00Z"
}
```

**Errors:**
- `400` - Invalid week number (must be 1-13)
- `401` - Unauthorized
- `404` - Review not found or User not found
- `500` - Internal server error

---

#### Create or Update Weekly Review

**POST** `/api/reviews`

Create a new weekly review or update an existing one.

**Request Body:**
```json
{
  "week_number": 1,
  "review_date": "2024-01-07",
  "days_hit_all": 5,
  "what_helped": "Morning routine and accountability partner",
  "what_blocked": "Late night work meetings",
  "next_week_change": "Set earlier bedtime alarm"
}
```

**Validation Rules:**
- `week_number` - Integer between 1 and 13 (required)
- `review_date` - String in YYYY-MM-DD format (required)
- `days_hit_all` - Integer between 0 and 7 (required)
- `what_helped` - String (optional, nullable)
- `what_blocked` - String (optional, nullable)
- `next_week_change` - String (optional, nullable)

**Response:** `200 OK` (update) or `201 Created` (new)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "week_number": 1,
  "review_date": "2024-01-07",
  "days_hit_all": 5,
  "what_helped": "Morning routine and accountability partner",
  "what_blocked": "Late night work meetings",
  "next_week_change": "Set earlier bedtime alarm",
  "created_at": "2024-01-07T20:00:00Z"
}
```

**Errors:**
- `400` - Invalid request data
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### Cron Jobs

These endpoints are protected by the `CRON_SECRET` environment variable and should only be called by scheduled cron jobs.

**Authentication:**
```http
Authorization: Bearer <CRON_SECRET>
```

---

#### Daily Reset Cron

**POST** `/api/cron/daily-reset`

Creates new daily entries for all active users at their local 4 AM and sends inactivity reminder emails.

**Request:**
- No body required
- Must include Authorization header with CRON_SECRET

**Response:** `200 OK`
```json
{
  "processedUsers": 150,
  "createdEntries": 148,
  "skipped": 2,
  "errors": 0,
  "emailsSent": 12,
  "emailErrors": 0,
  "message": "Processed 150 users, created 148 entries, skipped 2, errors 0, sent 12 emails, email errors 0"
}
```

**Schedule:** Runs every hour to catch users in different timezones

**Errors:**
- `401` - Unauthorized (invalid or missing CRON_SECRET)
- `500` - Internal server error

---

#### Refresh Statistics Cron

**POST** `/api/cron/refresh-stats`

Refreshes the user_statistics materialized view in the database.

**Request:**
- No body required
- Must include Authorization header with CRON_SECRET

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Statistics refreshed successfully",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**Schedule:** Runs every 30 minutes

**Errors:**
- `401` - Unauthorized (code: AUTH_ERROR)
- `500` - Database error (code: DB_ERROR)

---

### Testing

#### Test Email Endpoint

**POST** `/api/test-email`

Test email functionality for development and debugging. Protected endpoint requiring authentication.

**Request Body:**
```json
{
  "force": false,
  "type": "on_demand"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email check triggered successfully",
  "userId": "user_xxx",
  "type": "on_demand",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**Note:** This endpoint is disabled in production unless `force` is set to true.

**Errors:**
- `401` - Authentication required
- `403` - Test endpoint disabled in production
- `500` - Internal server error

**GET** `/api/test-email` - Not allowed (405)

---

## Examples

### Example 1: Complete Daily Tracking Flow

```javascript
// 1. Get today's entry
const todayResponse = await fetch('https://rebuild.creativesky.me/api/daily/today', {
  method: 'GET',
  credentials: 'include'
});
const todayEntry = await todayResponse.json();

// 2. Update study blocks
const updateResponse = await fetch(`https://rebuild.creativesky.me/api/daily/${todayEntry.entry_date}`, {
  method: 'PATCH',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    study_blocks: [
      { checked: true, topic: 'React' },
      { checked: true, topic: 'TypeScript' },
      { checked: false, topic: '' },
      { checked: false, topic: '' }
    ]
  })
});
const updatedEntry = await updateResponse.json();

// 3. Get updated statistics
const statsResponse = await fetch('https://rebuild.creativesky.me/api/stats/dashboard', {
  method: 'GET',
  credentials: 'include'
});
const stats = await statsResponse.json();
```

---

### Example 2: Weekly Review Submission

```javascript
const reviewData = {
  week_number: 1,
  review_date: '2024-01-07',
  days_hit_all: 5,
  what_helped: 'Morning routine helped maintain consistency',
  what_blocked: 'Late work meetings affected evening meditation',
  next_week_change: 'Schedule meditation for morning instead'
};

const response = await fetch('https://rebuild.creativesky.me/api/reviews', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(reviewData)
});

const review = await response.json();
console.log('Review saved:', review);
```

---

### Example 3: Get Progress for Last 7 Days

```javascript
// Calculate date range
const endDate = new Date().toISOString().split('T')[0];
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const response = await fetch(
  `https://rebuild.creativesky.me/api/daily/range?start=${startDate}&end=${endDate}`,
  {
    method: 'GET',
    credentials: 'include'
  }
);

const entries = await response.json();
console.log('Last 7 days:', entries);
```

---

### Example 4: Update User Timezone

```javascript
const response = await fetch('https://rebuild.creativesky.me/api/profile', {
  method: 'PATCH',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    timezone: 'America/Los_Angeles'
  })
});

const profile = await response.json();
console.log('Updated profile:', profile);
```

---

### Example 5: Fetch Scorecard Data

```javascript
const response = await fetch('https://rebuild.creativesky.me/api/stats/scorecard', {
  method: 'GET',
  credentials: 'include'
});

const scorecard = await response.json();

// Display weeks
scorecard.weeks.forEach(week => {
  console.log(`Week ${week.weekNumber}: Total Score ${week.weekTotal}`);
  week.days.forEach(day => {
    if (!day.isEmpty && !day.isFuture) {
      console.log(`  ${day.date}: ${day.score}/5`);
    }
  });
});
```

---

## Rate Limiting

Currently, there are no explicit rate limits on the API endpoints. However, reasonable usage is expected:

- **Recommended:** Max 100 requests per minute per user
- Cron endpoints should only be called by scheduled jobs

---

## Service Worker

The application includes a Service Worker for offline functionality:

**Scope:** `https://rebuild.creativesky.me/`  
**Registration:** Automatic on page load  
**Cache Strategy:** Network-first with offline fallback

---

## Support & Contact

For API support or questions:
- **GitHub:** [WinterArc Repository](https://github.com/your-repo)
- **Documentation Version:** 1.0.0
- **Last Updated:** January 2025

---

## Changelog

### Version 1.0.0 (2025-01-15)
- Initial API documentation
- All core endpoints documented
- Authentication flow documented
- Examples and error codes added

# WinterArc API Quick Reference

**Base URL:** `https://rebuild.creativesky.me`

---

## 🔐 Authentication

All endpoints require Clerk authentication via session cookies or JWT tokens (except cron jobs which use `CRON_SECRET`).

---

## 📋 Quick Reference Table

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Profile** |
| GET | `/api/profile` | Get/create user profile | ✅ |
| PATCH | `/api/profile` | Update user profile (timezone) | ✅ |
| **Daily Entries** |
| GET | `/api/daily/today` | Get/create today's entry | ✅ |
| GET | `/api/daily/{date}` | Get/create entry by date | ✅ |
| PATCH | `/api/daily/{date}` | Update entry by date | ✅ |
| GET | `/api/daily/range?start={date}&end={date}` | Get entries in date range | ✅ |
| **Statistics** |
| GET | `/api/stats/dashboard` | Get dashboard statistics | ✅ |
| GET | `/api/stats/scorecard` | Get 13-week scorecard | ✅ |
| GET | `/api/stats/streak` | Get streak data | ✅ |
| **Weekly Reviews** |
| GET | `/api/reviews` | Get all weekly reviews | ✅ |
| GET | `/api/reviews/{week}` | Get specific week review | ✅ |
| POST | `/api/reviews` | Create/update weekly review | ✅ |
| **Cron Jobs** |
| POST | `/api/cron/daily-reset` | Daily reset and emails | 🔑 CRON_SECRET |
| POST | `/api/cron/refresh-stats` | Refresh statistics | 🔑 CRON_SECRET |
| **Testing** |
| POST | `/api/test-email` | Test email functionality | ✅ |

---

## 🚀 Common Usage Patterns

### Get Today's Entry
```bash
curl https://rebuild.creativesky.me/api/daily/today \
  -H "Cookie: __session=YOUR_SESSION_TOKEN"
```

### Update Daily Tasks
```bash
curl -X PATCH https://rebuild.creativesky.me/api/daily/2024-01-15 \
  -H "Cookie: __session=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "study_blocks": [
      {"checked": true, "topic": "Math"},
      {"checked": false, "topic": ""}
    ],
    "water_bottles": [true, true, false, false, false, false, false, false]
  }'
```

### Get Dashboard Stats
```bash
curl https://rebuild.creativesky.me/api/stats/dashboard \
  -H "Cookie: __session=YOUR_SESSION_TOKEN"
```

### Submit Weekly Review
```bash
curl -X POST https://rebuild.creativesky.me/api/reviews \
  -H "Cookie: __session=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "week_number": 1,
    "review_date": "2024-01-07",
    "days_hit_all": 5,
    "what_helped": "Morning routine",
    "what_blocked": "Late meetings",
    "next_week_change": "Earlier bedtime"
  }'
```

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 500 | Server Error |
| 503 | Service Unavailable |

---

## 🔑 Key Data Structures

### Daily Entry Score Calculation
- **Study Blocks:** 4 blocks = 1 point
- **Reading:** Checked = 1 point
- **Pushups:** 3 sets = 1 point
- **Meditation:** Checked = 1 point
- **Water:** 8 bottles = 1 point
- **Total:** 0-5 points per day

### Date Formats
- All dates use **YYYY-MM-DD** format
- Timestamps use **ISO 8601** format
- User timezone determines "today"

### Week Numbers
- Valid range: **1-13** (90 days ÷ 7 ≈ 13 weeks)

---

## 💡 Tips

1. **Auto-save:** PATCH endpoints automatically recalculate scores
2. **Timezone-aware:** All date operations respect user's timezone setting
3. **Idempotent:** GET endpoints create entries if they don't exist
4. **Partial updates:** PATCH endpoints accept partial data
5. **Validation:** All inputs are validated with Zod schemas

---

## 📖 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details including:
- Full request/response examples
- Detailed data models
- Error handling
- Authentication flows
- Code examples in multiple languages

---

**Last Updated:** January 2025 | **Version:** 1.0.0

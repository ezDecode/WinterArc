# Winter Arc Tracker - Testing Guide

**Last Updated:** October 7, 2025  
**Version:** 1.0.0 (Production)  
**Status:** All Phases Complete ✅

## Quick Start Testing (5 minutes)

### Prerequisites
- [ ] `.env.local` configured with Clerk and Supabase keys
- [ ] Supabase schema executed (`lib/supabase/schema.sql`)
- [ ] `pnpm install` completed
- [ ] `pnpm dev` running

---

## Step-by-Step Testing

### 1. Authentication Flow

**Test Sign Up:**
1. Go to http://localhost:3000
2. Click "Sign Up" or navigate to `/sign-up`
3. Enter email and password
4. Complete sign-up process
5. ✅ Should redirect to `/today`

**Test Sign In:**
1. Sign out from user menu
2. Go to `/sign-in`
3. Enter credentials
4. ✅ Should redirect to `/today`

**Test Protected Routes:**
1. Sign out
2. Try to access `/today` directly
3. ✅ Should redirect to `/sign-in`

---

### 2. Daily Tracker Functionality

**Study Blocks Tracker:**
1. Check first study block
2. ✅ Should show "1/4" progress
3. Enter topic (e.g., "Mathematics")
4. Check remaining 3 blocks
5. ✅ Should show "4/4" and success message
6. ✅ Score should update to 1/5

**Reading Tracker:**
1. Check "Completed reading"
2. Enter book name (e.g., "Atomic Habits")
3. Enter pages (e.g., 15)
4. ✅ Should show success message
5. ✅ Score should increase

**Pushups Tracker:**
1. Check Set 1 (20 pushups)
2. Check Set 2 (15 pushups)
3. Check Set 3 (15 pushups)
4. ✅ Should show "50" total
5. ✅ Should show success message
6. Enter extras (e.g., 10)
7. ✅ Should show "60" total
8. ✅ Score should increase

**Meditation Tracker:**
1. Check "Completed meditation"
2. Enter method (e.g., "Mindfulness")
3. Enter duration (e.g., 15)
4. ✅ Should show success message
5. ✅ Score should increase

**Water Tracker:**
1. Click each of the 8 water bottles
2. ✅ Progress bar should fill gradually
3. ✅ Bottles should turn blue when clicked
4. ✅ Should show "4.0L / 4L" when all filled
5. ✅ Should show success message
6. ✅ Score should reach 5/5

**Notes Section:**
1. Click to expand notes section
2. Enter morning notes
3. Enter evening notes
4. Enter general notes
5. ✅ All notes should save

---

### 3. Auto-Save Testing

**Verify Auto-Save:**
1. Check a tracker item
2. Wait 1 second
3. ✅ Should see "Saving..." indicator
4. ✅ Should change to "Saved just now"
5. ✅ Time should update (e.g., "Saved 5s ago")

**Test Data Persistence:**
1. Check several items
2. Wait for "Saved" indicator
3. Refresh the page
4. ✅ All checked items should remain checked
5. ✅ Score should be preserved
6. ✅ Text inputs should retain values

**Test Rapid Changes:**
1. Quickly check multiple items
2. ✅ Should debounce and save once after 500ms
3. ✅ No multiple rapid saves

---

### 4. Score Calculation

**Test Score Logic:**

Starting from 0/5:
1. Check all 4 study blocks → ✅ Score = 1/5
2. Check reading → ✅ Score = 2/5
3. Check all 3 pushup sets → ✅ Score = 3/5
4. Check meditation → ✅ Score = 4/5
5. Fill all 8 water bottles → ✅ Score = 5/5
6. ✅ "Perfect Day" badge should appear

**Test Partial Completion:**
1. Check only 3/4 study blocks → ✅ Score stays at 0
2. Check all 4 study blocks → ✅ Score increases to 1
3. Uncheck one study block → ✅ Score decreases to 0

---

### 5. UI/UX Testing

**Animations:**
1. ✅ Components fade in on page load
2. ✅ Checkboxes have smooth transitions
3. ✅ Water bottles scale on hover
4. ✅ Progress bars animate smoothly
5. ✅ Success messages slide in

**Responsive Design:**
1. Test on mobile (< 768px)
   - ✅ Single column layout
   - ✅ Score display at top
   - ✅ All trackers stack vertically
2. Test on tablet (768px - 1024px)
   - ✅ Two column layout
3. Test on desktop (> 1024px)
   - ✅ Three column layout
   - ✅ Sticky score display on right

**Keyboard Navigation:**
1. Tab through form elements
2. ✅ Focus indicators visible
3. ✅ Enter/Space toggles checkboxes
4. ✅ Logical tab order

**Screen Reader (if available):**
1. ✅ All inputs have labels
2. ✅ Buttons have descriptive text
3. ✅ Status messages announced

---

### 6. Error Handling

**Test Network Errors:**
1. Turn off internet or block API requests
2. Try to check an item
3. ✅ Should show error message
4. Restore connection
5. Click "Try Again"
6. ✅ Should reload successfully

**Test Invalid Data:**
1. Enter negative number for pushups extras
2. ✅ Should handle gracefully
3. Enter very long text in topic field
4. ✅ Should handle gracefully

---

### 7. Multiple Users

**Test User Isolation:**
1. Sign in as User A
2. Complete some trackers
3. Note the score
4. Sign out
5. Sign in as User B (different account)
6. ✅ Should show fresh 0/5 score
7. ✅ Should not see User A's data

---

### 8. Database Testing

**Verify Database Records:**
1. Complete some trackers
2. Check Supabase dashboard
3. Go to `daily_entries` table
4. ✅ Should see your entry
5. ✅ `daily_score` should match UI
6. ✅ `study_blocks`, `reading`, etc. should have data
7. ✅ `updated_at` should be recent

**Verify Profile Creation:**
1. Check `profiles` table
2. ✅ Should have your profile
3. ✅ `clerk_user_id` matches your Clerk ID
4. ✅ `arc_start_date` is set

---

### 9. Performance Testing

**Load Time:**
1. Clear browser cache
2. Navigate to `/today`
3. ✅ Should load in < 2 seconds
4. ✅ No console errors

**Re-render Performance:**
1. Open browser DevTools
2. Check React DevTools (if installed)
3. Toggle checkboxes rapidly
4. ✅ Should remain smooth (60fps)
5. ✅ No unnecessary re-renders

**Memory Leaks:**
1. Use Chrome DevTools Memory profiler
2. Navigate to `/today`
3. Use tracker for 5 minutes
4. Check memory usage
5. ✅ Should not continuously increase

---

### 10. Edge Cases

**Test Boundary Values:**

Water Bottles:
- ✅ Can check all 8
- ✅ Can uncheck any
- ✅ Progress bar accurate at all counts

Study Blocks:
- ✅ All 4 checkboxes work
- ✅ Topic text can be long
- ✅ Empty topics allowed

Numbers:
- ✅ Pages: 0 is valid
- ✅ Pages: Large numbers (999+) work
- ✅ Duration: 0-120 range enforced
- ✅ Pushups extras: Negative numbers prevented

**Test Concurrent Edits:**
1. Open `/today` in two browser tabs
2. Check item in Tab 1
3. Check different item in Tab 2
4. ✅ Both should save
5. Refresh both tabs
6. ✅ Both edits should be present

---

## ✅ Success Criteria

All tests should pass:

### Critical Tests (Must Pass)
- [ ] User can sign up and sign in
- [ ] User is redirected to `/today` after auth
- [ ] All 5 trackers display correctly
- [ ] Checking items updates score correctly
- [ ] Score reaches 5/5 when all targets complete
- [ ] Changes auto-save after 500ms
- [ ] Data persists after page refresh
- [ ] Different users see different data

### Important Tests (Should Pass)
- [ ] Animations work smoothly
- [ ] Responsive on mobile and desktop
- [ ] Save status updates correctly
- [ ] Error messages show when network fails
- [ ] No console errors during normal use

### Nice-to-Have Tests (Good to Pass)
- [ ] Keyboard navigation works well
- [ ] Performance is smooth (60fps)
- [ ] No memory leaks
- [ ] Edge cases handled gracefully

---

## 🐛 Known Issues / Limitations

### Current Phase
- No date navigation yet (coming in Phase 3)
- No historical data view yet (coming in Phase 3)
- No charts or analytics yet (coming in Phase 3)
- No data export yet (coming in Phase 4)

### By Design
- Auto-save delay is 500ms (intentional for performance)
- First render doesn't trigger save (intentional)
- Only today's date accessible (other dates in Phase 3)

---

## 📊 Test Results Template

Copy this for your testing session:

```
# Test Session: [Date]
Browser: [Chrome/Firefox/Safari]
Screen Size: [Mobile/Tablet/Desktop]

## Authentication
- [ ] Sign up works
- [ ] Sign in works
- [ ] Protected routes work

## Daily Tracker
- [ ] Study blocks work
- [ ] Reading works
- [ ] Pushups work
- [ ] Meditation works
- [ ] Water tracker works
- [ ] Notes section works

## Auto-Save
- [ ] Auto-save triggers
- [ ] Data persists
- [ ] Save status updates

## Score Calculation
- [ ] Correct for each target
- [ ] Reaches 5/5 correctly
- [ ] Perfect day badge shows

## UI/UX
- [ ] Animations smooth
- [ ] Responsive design works
- [ ] No visual bugs

## Errors
- [ ] Error handling works
- [ ] No console errors

## Notes
[Any issues or observations]

## Overall: PASS / FAIL
```

---

## 🆘 Troubleshooting

### "Unauthorized" error on /today
→ Check Clerk env variables
→ Clear cookies and sign in again

### "Failed to load entry" error
→ Check Supabase env variables
→ Verify database schema is executed
→ Check Supabase dashboard for connection

### Changes not saving
→ Check browser console for errors
→ Verify API routes are working
→ Check network tab for 500 errors

### Score not updating
→ Refresh page
→ Check console for JavaScript errors
→ Verify all checkboxes work individually

---

## ✅ Ready for Production?

---

## Phase 4 Testing: Automation & PWA

### 8. Cron Job Testing

**Test Cron Endpoint (Manual):**
1. Get your `CRON_SECRET` from `.env.local`
2. Use curl or Postman to POST to `/api/cron/daily-reset`:
   ```bash
   curl -X POST http://localhost:3000/api/cron/daily-reset \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
3. ✅ Should return: `{ processedUsers: X, createdEntries: Y, ... }`
4. Check database for new `daily_entries` rows
5. Run again immediately
6. ✅ Should skip existing entries (skipped > 0)

**Test Unauthorized Access:**
1. POST without `Authorization` header
2. ✅ Should return 401 Unauthorized
3. POST with wrong secret
4. ✅ Should return 401 Unauthorized

### 9. Timezone Testing

**Test User Timezone:**
1. Go to Settings or Profile (if available)
2. Check timezone is displayed correctly
3. Or manually update `profiles.timezone` in Supabase
4. Refresh `/today` page
5. ✅ Date should match your local timezone

**Test Different Timezones:**
1. Change `profiles.timezone` to `America/New_York`
2. ✅ `/today` shows NY date
3. Change to `Asia/Tokyo`
4. ✅ `/today` shows Tokyo date

### 10. PWA Testing

**Test PWA Manifest:**
1. Open DevTools → Application → Manifest
2. ✅ Should show "Winter Arc Tracker"
3. ✅ Icons should load (192x192, 512x512)
4. ✅ Start URL: `/today?source=pwa`

**Test Installation (Desktop Chrome):**
1. Click install icon in address bar
2. ✅ Install prompt appears
3. Click "Install"
4. ✅ App opens in standalone window
5. ✅ No browser UI visible

**Test Installation (Mobile):**
1. Visit app on mobile browser
2. ✅ "Add to Home Screen" prompt appears
3. Tap "Add"
4. ✅ Icon appears on home screen
5. Tap icon
6. ✅ App opens in fullscreen

**Test Service Worker:**
1. Open DevTools → Application → Service Workers
2. ✅ SW registered and activated
3. Check Cache Storage
4. ✅ `winter-arc-v1` cache exists
5. ✅ Contains precached assets

**Test Offline Functionality:**
1. With app running, open DevTools
2. Go to Network tab → Select "Offline"
3. Refresh page
4. ✅ Page loads from cache
5. Navigate to `/progress`
6. ✅ Page loads (may show cached data)
7. Try to save changes
8. ✅ Shows error (no network)

### 11. Keyboard Shortcuts Testing

**Test Shortcuts Modal:**
1. Press `?` key
2. ✅ Shortcuts modal appears
3. Shows all available shortcuts
4. Press `Esc` or `?` again
5. ✅ Modal closes

**Test Navigation Shortcuts:**
1. Press `Ctrl + 1` (Windows) or `Cmd + 1` (Mac)
2. ✅ Navigates to `/today`
3. Press `Ctrl + 2`
4. ✅ Navigates to `/scorecard`
5. Press `Ctrl + 3`
6. ✅ Navigates to `/progress`
7. Press `Ctrl + 4`
8. ✅ Navigates to `/review`

**Test Save Shortcut:**
1. On `/today`, make a change
2. Press `Ctrl/Cmd + S`
3. ✅ Manual save triggered (check console)

**Test Input Field Handling:**
1. Click in Notes textarea
2. Type normally
3. ✅ Shortcuts disabled while typing
4. ✅ No accidental navigation

### 12. Performance Testing

**Test Bundle Size:**
1. Run `pnpm build`
2. Check `.next/static/chunks` sizes
3. ✅ Main bundle < 200KB
4. ✅ Charts chunk loaded separately

**Test Lighthouse:**
1. Open DevTools → Lighthouse
2. Run audit (Mobile, Simulated Throttling)
3. ✅ Performance: 85+ /100
4. ✅ PWA: 100/100
5. ✅ Accessibility: 90+ /100

**Test Loading Times:**
1. Clear cache and refresh `/today`
2. ✅ First Contentful Paint < 2s
3. ✅ Time to Interactive < 3s
4. Navigate to `/progress`
5. ✅ Charts load within 1s

---

## Phase 5 Testing: Polish & Deploy

### 13. Loading Skeletons Testing

**Test Today Page Skeleton:**
1. Clear cache
2. Navigate to `/today`
3. ✅ Skeleton appears immediately
4. ✅ Smooth transition to real content
5. ✅ No layout shift

**Test Scorecard Skeleton:**
1. Navigate to `/scorecard`
2. ✅ Grid skeleton appears
3. ✅ Matches final grid structure

**Test Progress Skeleton:**
1. Navigate to `/progress`
2. ✅ Stats skeleton appears first
3. ✅ Chart skeleton appears
4. ✅ Real charts load after

### 14. Error Boundaries Testing

**Test Dashboard Error:**
1. Force an error (e.g., break API endpoint temporarily)
2. Navigate to affected page
3. ✅ Error boundary catches it
4. ✅ Shows user-friendly error UI
5. ✅ "Try Again" button works
6. ✅ Navigation still works

**Test Global Error:**
1. Simulate critical error
2. ✅ Global error boundary activates
3. ✅ Shows error with "Go Home" option

**Test API Error Handling:**
1. Turn off Supabase temporarily
2. Try to save data
3. ✅ Error toast appears
4. ✅ Error message is clear
5. Turn Supabase back on
6. ✅ Retry works

### 15. Toast Notifications Testing

**Test Success Toast:**
1. Complete weekly review
2. Click "Save Review"
3. ✅ Success toast appears bottom-right
4. ✅ Shows "Weekly review saved!"
5. ✅ Auto-dismisses after 3s

**Test Error Toast:**
1. Force save error (disable network)
2. Try to save
3. ✅ Error toast appears
4. ✅ Stays longer (4s)
5. ✅ Shows clear error message

**Test Toast Stacking:**
1. Trigger multiple toasts quickly
2. ✅ Toasts stack vertically
3. ✅ No overlapping
4. ✅ Each dismisses independently

**Test Toast Dismissal:**
1. Trigger toast
2. Click close button
3. ✅ Toast dismisses immediately

### 16. Onboarding Testing

**Test First-Time User Flow:**
1. Create new account
2. ✅ After sign-up, redirects to `/onboarding`
3. ✅ Shows welcome message with user name
4. ✅ Displays all 5 daily targets
5. ✅ Timezone auto-detected

**Test Timezone Selection:**
1. Click different timezone buttons
2. ✅ Selected timezone highlighted
3. Use dropdown to select custom timezone
4. ✅ Selection updates

**Test Onboarding Completion:**
1. Select timezone
2. Click "Start My Winter Arc Journey"
3. ✅ Loading state shows
4. ✅ Success toast appears
5. ✅ Redirects to `/today`
6. Check Supabase `profiles` table
7. ✅ Timezone saved correctly

**Test Skip Onboarding:**
1. Return to `/onboarding` manually
2. ✅ Page loads (doesn't auto-redirect)
3. Can update timezone again if needed

---

## Production Deployment Testing

### 17. Pre-Deployment Checklist

**Environment Variables:**
- [ ] All Clerk vars set in Vercel
- [ ] All Supabase vars set in Vercel
- [ ] `CRON_SECRET` set in Vercel
- [ ] `DEFAULT_TIMEZONE` set (optional)

**Build Test:**
```bash
pnpm build
✅ Build completes with no errors
✅ No TypeScript errors
✅ Bundle sizes acceptable
```

**Vercel Configuration:**
- [ ] `vercel.json` cron configured
- [ ] Domain configured (if custom)
- [ ] Analytics enabled (optional)

### 18. Post-Deployment Testing

**Test Production URL:**
1. Visit production URL
2. ✅ Site loads quickly
3. ✅ No console errors
4. ✅ PWA installable

**Test All Critical Flows:**
- [ ] Sign up works
- [ ] Sign in works
- [ ] Daily tracker saves
- [ ] Scorecard displays
- [ ] Progress charts load
- [ ] Weekly review saves
- [ ] PWA installs
- [ ] Offline works
- [ ] Keyboard shortcuts work
- [ ] Onboarding works

**Test Cron Job (Production):**
1. Wait for scheduled run (4 AM)
2. Or trigger manually with production `CRON_SECRET`
3. Check Vercel logs
4. ✅ Cron executed successfully
5. Check database
6. ✅ New entries created

**Monitor Production:**
- [ ] Check Vercel Analytics
- [ ] Monitor error logs (first 24 hours)
- [ ] Check Sentry/error tracking (if configured)
- [ ] Gather user feedback

---

## Final Checklist

Before deploying to production, ensure:
- [ ] All Phase 1-2 Tests pass ✅
- [ ] All Phase 3 Tests pass ✅
- [ ] All Phase 4 Tests pass ✅
- [ ] All Phase 5 Tests pass ✅
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] Error handling works everywhere
- [ ] Data persists correctly
- [ ] Multiple users work correctly
- [ ] PWA installs on mobile/desktop
- [ ] Offline functionality works
- [ ] Cron job tested
- [ ] Documentation complete
- [ ] Environment variables set
- [ ] Build succeeds

---

**Happy Testing! 🧪**

**Need Help?**
- Check `PHASE4_COMPLETE.md` for Phase 4 details
- Check `PHASE5_COMPLETE.md` for Phase 5 details
- Review `PROJECT_STATUS.md` for overall status

If you find bugs, document them with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and screen size
5. Console errors (if any)
6. Screenshots/videos (if applicable)

---

**🚀 Production Ready! All 5 phases tested and complete!**

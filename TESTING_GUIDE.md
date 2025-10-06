# Winter Arc Tracker - Testing Guide

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

Before deploying to production, ensure:
- [ ] All Critical Tests pass
- [ ] All Important Tests pass
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Error handling works
- [ ] Data persists correctly
- [ ] Multiple users work correctly

---

**Happy Testing! 🧪**

If you find bugs, document them with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and screen size
5. Console errors (if any)

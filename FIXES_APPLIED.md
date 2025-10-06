# Fixes Applied to Resolve 404 Errors

## Issues Found

1. ❌ API routes were using client-side Supabase client instead of server-side admin client
2. ❌ Missing favicon causing 404 error
3. ❌ Manifest.json in wrong location

## Fixes Applied

### 1. Updated All API Routes ✅

**Changed:** All API routes now use `supabaseAdmin` from `@/lib/supabase/server` instead of the client-side `supabase` client.

**Files Updated:**
- `app/api/daily/today/route.ts` - Fixed to use supabaseAdmin
- `app/api/daily/[date]/route.ts` - Fixed to use supabaseAdmin (both GET and PATCH)
- `app/api/daily/range/route.ts` - Fixed to use supabaseAdmin

**Why:** API routes run on the server and need the admin client with full database access.

### 2. Added Favicon ✅

**Created:**
- `app/icon.tsx` - Dynamic icon generation using Next.js

**Why:** Browsers automatically request `/favicon.ico`, and missing it causes 404 errors.

### 3. Fixed Manifest ✅

**Created:**
- `app/manifest.ts` - Next.js 15 App Router manifest generation
- Removed static `manifest.json` reference from metadata

**Why:** Next.js 15 uses TypeScript manifest files instead of static JSON.

---

## What You Need to Do Next

### 1. Restart the Development Server

The changes require a server restart:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
pnpm dev
```

### 2. Verify Environment Variables

Make sure your `.env.local` has all required values:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key  # ← Important!
```

**Critical:** Make sure `SUPABASE_SERVICE_KEY` is set with the **service_role** key from Supabase, not the anon key!

### 3. Verify Supabase Database

Make sure you've run the database schema:

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run the contents of `lib/supabase/schema.sql`
4. Verify 4 tables are created: `profiles`, `daily_entries`, `weekly_reviews`, `checkpoint_notes`

### 4. Test the Application

After restarting:

1. Navigate to http://localhost:3000
2. Sign up or sign in
3. You should be redirected to `/today`
4. The daily tracker should load with all 5 trackers visible
5. Try checking a box - it should auto-save

---

## Expected Console Output (Good)

After fixes, you should see:

```
✅ No 404 errors for /api/daily/today
✅ No 404 errors for /favicon.ico
✅ No 404 errors for /manifest.json
⚠️  Clerk dev key warning (normal in development)
⚠️  Clerk deprecation warnings (non-critical, cosmetic)
```

---

## If You Still See Errors

### Error: "Profile not found"

**Solution:** You need to create a user profile first.

1. Sign in to the app
2. The first API call will fail because no profile exists
3. Go to `/api/profile` to auto-create your profile
4. Or manually create a profile in Supabase

**Quick Fix:**
```bash
# Call the profile endpoint after signing in
curl http://localhost:3000/api/profile
```

### Error: "Missing Supabase environment variables"

**Solution:** Check that all Supabase env vars are set correctly in `.env.local`:

```bash
# Verify they exist
cat .env.local | grep SUPABASE
```

Should show 3 lines:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY

### Error: "Unauthorized" 

**Solution:** Clerk isn't configured properly.

1. Check `.env.local` has both Clerk keys
2. Restart dev server after adding keys
3. Clear browser cookies and try again

---

## Testing Checklist

After restart, verify:

- [ ] Dev server starts without errors
- [ ] Homepage loads (http://localhost:3000)
- [ ] Can sign up
- [ ] Can sign in
- [ ] Redirects to `/today` after sign in
- [ ] `/today` page loads (not 404)
- [ ] Daily trackers appear
- [ ] No 404 errors in console for API routes
- [ ] Checking a box triggers auto-save
- [ ] "Saved just now" appears after changes

---

## Key Changes Summary

| File | Change |
|------|--------|
| `app/api/daily/today/route.ts` | ✅ Uses supabaseAdmin |
| `app/api/daily/[date]/route.ts` | ✅ Uses supabaseAdmin |
| `app/api/daily/range/route.ts` | ✅ Uses supabaseAdmin |
| `app/icon.tsx` | ✅ Added dynamic favicon |
| `app/manifest.ts` | ✅ Added manifest generator |
| `app/layout.tsx` | ✅ Removed static manifest reference |

---

## Why Server-Side Supabase?

**Client-side** (`supabase` from `client.ts`):
- Runs in the browser
- Uses anon key (limited permissions)
- Subject to RLS policies
- Good for: Client components, user-specific queries

**Server-side** (`supabaseAdmin` from `server.ts`):
- Runs on the server only
- Uses service_role key (full permissions)
- Bypasses RLS for admin operations
- Good for: API routes, creating entries, admin operations

**API routes MUST use server-side** because:
1. They run on the server
2. They need to create/read data for any user
3. They need admin permissions to set up new users

---

## Next Steps

Once everything is working:

1. ✅ Test all 5 trackers
2. ✅ Test auto-save
3. ✅ Verify data persists on refresh
4. ✅ Try multiple users (different accounts)
5. 📖 See `TESTING_GUIDE.md` for comprehensive testing

---

## Summary

**What was wrong:**
- API routes couldn't access database (wrong client)
- Missing favicon caused 404s
- Manifest in wrong format

**What was fixed:**
- All API routes now use server-side Supabase admin
- Dynamic favicon added via Next.js
- Manifest converted to TypeScript

**What you need to do:**
- Restart dev server
- Verify env variables (especially SUPABASE_SERVICE_KEY)
- Test the application

**Expected result:**
- No more 404 errors
- API routes work properly
- Daily tracker loads and saves data

---

🎉 **After restart, your app should work perfectly!**

If you still see issues, check the troubleshooting section or refer to `TESTING_GUIDE.md`.


# Utility Scripts Documentation

This document describes the utility scripts available in the `/scripts` directory.

---

## Available Scripts

### 1. debug-scorecard.ts

**Purpose**: Debug and test scorecard calculations

**Location**: `scripts/debug-scorecard.ts`

**Description**:  
This script helps debug scorecard data generation and display. It's useful for:
- Testing scorecard calculation logic
- Verifying date range handling
- Debugging timezone issues
- Testing data transformation

**Usage**:
```bash
npx tsx scripts/debug-scorecard.ts
```

**When to use**:
- When scorecard displays incorrect data
- When debugging week/day calculations
- When testing with different date ranges
- When investigating timezone-related issues

---

### 2. test-db-connection.ts

**Purpose**: Test database connectivity and configuration

**Location**: `scripts/test-db-connection.ts`

**Description**:  
This script tests the connection to your Supabase database and verifies that:
- Environment variables are correctly set
- Database credentials are valid
- Connection can be established
- Basic queries work

**Usage**:
```bash
npx tsx scripts/test-db-connection.ts
```

**When to use**:
- During initial setup
- When troubleshooting database connection issues
- After changing environment variables
- Before deployment to verify configuration

---

## Running Scripts

### Prerequisites

All scripts require:
1. **Node.js** installed (v18 or higher)
2. **Environment variables** configured in `.env`
3. **Dependencies** installed (`npm install`)

### Common Issues

#### "Cannot find module"
- Run `npm install` to ensure all dependencies are installed
- Make sure `tsx` is installed (`npm i -D tsx`)

#### "Environment variable not found"
- Check your `.env` file exists
- Verify all required variables are set
- See `.env.example` for required variables

#### "Database connection failed"
- Verify Supabase credentials in `.env`
- Check internet connectivity
- Ensure Supabase project is active

---

## Adding New Scripts

When adding new utility scripts:

1. Place them in `/scripts` directory
2. Use TypeScript (`.ts` extension)
3. Document the purpose and usage here
4. Include error handling
5. Add to `.gitignore` if they contain sensitive data

### Template for New Scripts:

```typescript
// scripts/my-script.ts
import { supabaseAdmin } from '@/lib/supabase/server'

async function main() {
  try {
    console.log('Starting script...')
    
    // Your logic here
    
    console.log('Script completed successfully')
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  }
}

main()
```

---

## Best Practices

1. **Always test scripts** in development before using in production
2. **Use environment variables** for sensitive data
3. **Add logging** to track script execution
4. **Handle errors gracefully** with try-catch blocks
5. **Document expected behavior** and edge cases

---

Last Updated: 2025-10-12

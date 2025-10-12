# Testing Documentation

## Overview

WinterArc includes unit tests for critical utility functions and components.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── DailyScoreDisplay.test.tsx
│   └── WaterBottlesTracker.test.tsx
├── utils/               # Utility function tests
│   ├── date.test.ts
│   ├── scoring.test.ts
│   └── streak.test.ts
└── setup.ts            # Test configuration
```

## Test Coverage

### Components
- **DailyScoreDisplay**: Tests score calculation and display logic
- **WaterBottlesTracker**: Tests water intake tracking functionality

### Utilities
- **date.ts**: Date formatting and timezone handling
- **scoring.ts**: Daily score calculation logic
- **streak.ts**: Streak calculation algorithms

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Utility Tests

```typescript
import { myUtilityFunction } from '@/lib/utils/myUtil'

describe('myUtilityFunction', () => {
  it('should return expected result', () => {
    const result = myUtilityFunction(input)
    expect(result).toBe(expectedOutput)
  })
})
```

## Best Practices

1. **Test critical business logic** first
2. **Use descriptive test names** that explain what is being tested
3. **Keep tests focused** - one assertion per test when possible
4. **Mock external dependencies** (API calls, database)
5. **Test edge cases** and error conditions

## Continuous Integration

Tests run automatically on:
- Every pull request
- Before deployment
- On main branch commits

## Troubleshooting

### Tests fail locally
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (requires v18+)
- Clear cache: `npm run clean && npm install`

### Import errors
- Verify path aliases in `tsconfig.json`
- Check that `@testing-library` packages are installed

---

Last Updated: 2025-10-12

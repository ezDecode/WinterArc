# Contributing to WinterArc

Thank you for your interest in contributing to WinterArc! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/WinterArc.git
   cd WinterArc
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your credentials
5. **Run the development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update tests if needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build project
npm run build
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update README"
git commit -m "refactor: improve code structure"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Pull Request Guidelines

### Before Submitting

- ✅ Code builds successfully
- ✅ All tests pass
- ✅ No linting errors
- ✅ Documentation is updated
- ✅ Commit messages are clear

### PR Description Should Include

- **What** changes were made
- **Why** the changes were necessary
- **How** to test the changes
- Screenshots (if UI changes)
- Related issue numbers

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` when possible
- Use meaningful variable names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### File Organization

```
component/
├── MyComponent.tsx      # Component logic
├── MyComponent.test.tsx # Tests
└── types.ts             # Component-specific types
```

## Testing

- Write tests for new features
- Update tests for bug fixes
- Aim for meaningful coverage
- Test edge cases

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Modifying configuration
- Adding dependencies

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Ask in pull request comments

---

Last Updated: 2025-10-12

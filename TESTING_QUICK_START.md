# Testing Quick Start Guide

## ✅ What's Been Set Up

1. **Jest** - Testing framework (similar to Jasmine, but optimized for React Native)
2. **React Native Testing Library** - Component testing utilities
3. **Jest Expo Preset** - Pre-configured for Expo projects
4. **Example Tests** - Sample tests for components, services, and utilities

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all testing dependencies including:
- `jest` - Testing framework
- `@testing-library/react-native` - Component testing
- `jest-expo` - Expo-specific Jest configuration
- `react-test-renderer` - React component rendering for tests

### 2. Run Your First Test

```bash
npm test
```

This will run all tests and show you the results.

### 3. Run Tests in Watch Mode (Recommended for Development)

```bash
npm run test:watch
```

This will watch for file changes and automatically re-run tests.

### 4. Check Test Coverage

```bash
npm run test:coverage
```

This generates a coverage report showing which parts of your code are tested.

## 📝 Example Tests Created

1. **`src/config/__tests__/appConfig.test.ts`** - Tests for app configuration
2. **`src/utils/__tests__/availabilitySystem.test.ts`** - Tests for availability utility
3. **`src/components/__tests__/ShotDetailsModal.test.tsx`** - Component test example
4. **`src/services/__tests__/liveScoringService.test.ts`** - Service test with Firebase mocking

## 🎯 Next Steps

1. **Run the example tests** to see how they work:
   ```bash
   npm test
   ```

2. **Write tests for your critical functions**:
   - Start with utility functions (easiest)
   - Then test services
   - Finally test components

3. **Follow the patterns** in the example tests:
   - Use descriptive test names
   - Test one thing per test
   - Mock external dependencies (Firebase, AsyncStorage, etc.)

## 📚 Key Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ci` | Run tests in CI mode |

## 💡 Why Jest Instead of Jasmine?

- **Built-in with React Native** - No extra setup needed
- **Better React Native support** - Optimized for React components
- **Similar syntax** - If you know Jasmine, Jest feels familiar
- **Better mocking** - Excellent mocking capabilities for Firebase, AsyncStorage, etc.
- **Snapshot testing** - Built-in support for snapshot testing

## 🔍 What Gets Tested?

- ✅ Configuration files
- ✅ Utility functions
- ✅ Service functions (with mocked Firebase)
- ✅ React components
- ✅ Business logic

## 📖 Learn More

See `TESTING.md` for detailed documentation on:
- Writing component tests
- Mocking Firebase
- Best practices
- Troubleshooting

## 🎉 You're Ready!

Start writing tests alongside your code. The more you test, the more confident you'll be when making changes!


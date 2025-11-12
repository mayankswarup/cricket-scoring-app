# Testing Guide

This project uses **Jest** and **React Native Testing Library** for unit and integration testing.

## Setup

Install dependencies:
```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Test Structure

Tests are organized alongside source files:

```
src/
  components/
    ShotDetailsModal.tsx
    __tests__/
      ShotDetailsModal.test.tsx
  services/
    liveScoringService.ts
    __tests__/
      liveScoringService.test.ts
  utils/
    availabilitySystem.ts
    __tests__/
      availabilitySystem.test.ts
```

## Writing Tests

### Component Tests

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('should handle button press', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={mockOnPress} />);
    fireEvent.press(getByText('Click Me'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

### Service/Utility Tests

```typescript
import { myUtilityFunction } from '../myUtility';

describe('myUtilityFunction', () => {
  it('should return expected result', () => {
    const result = myUtilityFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Mocking Firebase

Firebase is automatically mocked in `jest.setup.js`. For custom mocks:

```typescript
jest.mock('../config/firebase', () => ({
  db: {},
  auth: {
    currentUser: null,
  },
}));
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component/function does, not how it does it
2. **Use descriptive test names** - Test names should clearly describe what is being tested
3. **Keep tests isolated** - Each test should be independent and not rely on other tests
4. **Mock external dependencies** - Mock Firebase, AsyncStorage, and other external services
5. **Test edge cases** - Include tests for error conditions and boundary cases
6. **Maintain good coverage** - Aim for at least 50% coverage (configured in `jest.config.js`)

## Coverage Thresholds

Current coverage thresholds (in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Continuous Integration

Tests run automatically in CI/CD pipelines. Use `npm run test:ci` for CI environments.

## Troubleshooting

### Tests failing with Firebase errors
- Ensure Firebase is properly mocked in `jest.setup.js`
- Check that you're not importing Firebase directly in test files

### Async tests timing out
- Increase timeout: `jest.setTimeout(10000)`
- Use `waitFor` for async operations: `await waitFor(() => expect(...))`

### Component not rendering
- Ensure all required props are provided
- Check that React Native components are properly mocked

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)


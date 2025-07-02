# EchoPages Journal - Testing Documentation

## Overview

This document outlines the comprehensive testing strategy for the EchoPages Journal application, covering both frontend and backend components.

## Test Coverage Summary

### Frontend Tests (40 tests across 4 suites)

#### 1. Integration Tests (9 tests)
- **Authentication Flow**: Google OAuth integration, error handling
- **Data Synchronization**: Backend sync, conflict resolution, network error handling
- **Data Persistence**: App restart recovery, missing data handling
- **Error Handling**: Malformed JSON, expired tokens

#### 2. Utility Functions (15 tests)
- **Date Utilities**: Date formatting, validation, today's date
- **Search and Filter**: Text search, tag filtering, mood filtering, date range filtering
- **Data Processing**: Sorting, grouping, tag extraction, mood counting
- **Text Processing**: Truncation, hashtag extraction, preview generation
- **Validation**: Entry validation, input sanitization

#### 3. JournalContext Logic (10 tests)
- **AsyncStorage Operations**: Save/load operations, error handling
- **Entry Operations**: ID generation, CRUD operations, filtering
- **Data Persistence**: Serialization, deserialization, empty data handling
- **Entry Validation**: Required fields, optional fields

#### 4. SettingsScreen Mocks (6 tests)
- **Basic Jest Setup**: Test framework validation
- **Async Operations**: Promise handling
- **Mocking**: AsyncStorage mocking, basic component mocking

### Backend Tests (53 tests across 8 suites)

#### 1. SyncService Tests (8 tests)
- **Sync Operations**: Device registration, change processing, conflict resolution
- **Version Management**: Version tracking, incremental sync
- **Error Handling**: Network errors, invalid data

#### 2. Encryption Service Tests (6 tests)
- **Encryption/Decryption**: Data security, key management
- **Error Handling**: Invalid keys, corrupted data

#### 3. Redis Service Tests (4 tests)
- **Cache Operations**: Set, get, delete operations
- **Connection Management**: Connection handling, error recovery

#### 4. Journal Entry Repository Tests (8 tests)
- **CRUD Operations**: Create, read, update, delete entries
- **Query Operations**: Filtering, sorting, pagination
- **Data Validation**: Entry validation, error handling

#### 5. User Repository Tests (6 tests)
- **User Management**: User creation, authentication, profile updates
- **OAuth Integration**: Provider management, token handling

#### 6. Auth Middleware Tests (4 tests)
- **Authentication**: Token validation, provider verification
- **Authorization**: Route protection, user isolation

#### 7. TOTP Service Tests (4 tests)
- **Two-Factor Authentication**: Code generation, validation
- **Security**: Time-based validation, rate limiting

#### 8. Integration Tests (13 tests)
- **End-to-End Flows**: Complete sync workflows
- **API Integration**: Backend endpoint testing
- **Database Integration**: Data persistence, transactions

## Running Tests

### Frontend Tests
```bash
# Run all frontend tests
npx jest

# Run specific test file
npx jest __tests__/integration.test.js

# Run tests with coverage
npx jest --coverage

# Run tests in watch mode
npx jest --watch
```

### Backend Tests
```bash
# Navigate to backend directory
cd ../backend

# Run all backend tests
npm test

# Run specific test file
npm test -- --testPathPattern=sync-auth.integration.test.ts

# Run tests with coverage
npm run test:coverage
```

## Test Configuration

### Frontend Jest Configuration
- **Framework**: Jest with React Native preset
- **Mocking**: Expo modules, AsyncStorage, SecureStore
- **Setup**: Custom setup file for global mocks
- **Environment**: Node.js with React Native globals

### Backend Jest Configuration
- **Framework**: Jest with TypeScript support
- **Database**: SQLite in-memory for testing
- **Mocking**: External services, file system
- **Environment**: Node.js with TypeScript compilation

## Testing Strategy

### 1. Unit Tests
- **Purpose**: Test individual functions and components in isolation
- **Coverage**: Core business logic, utility functions, data validation
- **Mocking**: External dependencies, database, network calls

### 2. Integration Tests
- **Purpose**: Test interactions between components and services
- **Coverage**: API endpoints, database operations, authentication flows
- **Mocking**: External services, but real database connections

### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Coverage**: Full authentication and sync flows
- **Mocking**: Minimal mocking, focus on real interactions

## Key Testing Patterns

### 1. Arrange-Act-Assert
```javascript
// Arrange
const mockData = { /* test data */ };
jest.mock('dependency', () => mockImplementation);

// Act
const result = await functionUnderTest(mockData);

// Assert
expect(result).toEqual(expectedOutput);
```

### 2. Mocking External Dependencies
```javascript
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
```

### 3. Error Handling Tests
```javascript
it('should handle errors gracefully', async () => {
  // Mock error condition
  mockFunction.mockRejectedValue(new Error('Network error'));
  
  // Test error handling
  const result = await functionUnderTest();
  
  expect(result.error).toBeDefined();
  expect(result.success).toBe(false);
});
```

## Test Data Management

### 1. Test Fixtures
- **Location**: `__tests__/fixtures/`
- **Purpose**: Reusable test data
- **Format**: JSON files for complex data structures

### 2. Mock Data
- **Location**: Inline in test files
- **Purpose**: Simple test scenarios
- **Format**: JavaScript objects

### 3. Database Seeds
- **Location**: `backend/tests/fixtures/`
- **Purpose**: Database state for integration tests
- **Format**: SQL files or TypeScript objects

## Continuous Integration

### GitHub Actions
- **Frontend Tests**: Run on every push and pull request
- **Backend Tests**: Run on every push and pull request
- **Coverage Reports**: Generated and uploaded to coverage service
- **Test Results**: Published as GitHub Actions artifacts

### Pre-commit Hooks
- **Linting**: ESLint and Prettier
- **Type Checking**: TypeScript compilation
- **Unit Tests**: Quick test suite run
- **Integration Tests**: Full test suite on main branch

## Performance Testing

### Frontend Performance
- **Bundle Size**: Monitor JavaScript bundle size
- **Render Performance**: Component render times
- **Memory Usage**: Memory leaks detection

### Backend Performance
- **API Response Times**: Endpoint performance monitoring
- **Database Queries**: Query optimization testing
- **Load Testing**: Concurrent user simulation

## Security Testing

### Authentication Tests
- **Token Validation**: JWT token security
- **OAuth Flows**: Provider integration security
- **Session Management**: Secure session handling

### Data Security Tests
- **Encryption**: Data encryption/decryption
- **Input Validation**: SQL injection prevention
- **Authorization**: Access control verification

## Future Testing Enhancements

### 1. Visual Regression Testing
- **Tool**: Percy or Chromatic
- **Purpose**: UI consistency across changes
- **Coverage**: All screens and components

### 2. Accessibility Testing
- **Tool**: axe-core or similar
- **Purpose**: WCAG compliance
- **Coverage**: All user-facing components

### 3. Mobile-Specific Testing
- **Tool**: Detox for E2E testing
- **Purpose**: Real device testing
- **Coverage**: Complete user workflows

### 4. Performance Monitoring
- **Tool**: React Native Performance Monitor
- **Purpose**: Real-world performance tracking
- **Coverage**: Production app performance

## Troubleshooting

### Common Issues

#### 1. Mock Import Errors
```bash
# Solution: Clear Jest cache
npx jest --clearCache
```

#### 2. AsyncStorage Mock Issues
```bash
# Solution: Ensure proper mock setup
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

#### 3. TypeScript Compilation Errors
```bash
# Solution: Check tsconfig.json and type definitions
npm run type-check
```

#### 4. Database Connection Issues
```bash
# Solution: Use in-memory database for tests
# Ensure proper test database configuration
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic

### 2. Mock Management
- Mock at the right level (unit vs integration)
- Reset mocks between tests
- Use realistic mock data

### 3. Error Testing
- Test both success and failure scenarios
- Verify error messages and handling
- Test edge cases and boundary conditions

### 4. Performance Considerations
- Keep tests fast and efficient
- Use appropriate timeouts
- Avoid unnecessary setup/teardown

## Conclusion

This comprehensive testing strategy ensures the reliability, security, and performance of the EchoPages Journal application. The combination of unit, integration, and end-to-end tests provides confidence in the codebase and helps catch issues early in the development process.

For questions or issues with the testing setup, please refer to the troubleshooting section or create an issue in the project repository. 
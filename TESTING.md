# EchoPages Journal - Testing Guide

## 🧪 Test Environment Status

### ✅ Ready for Testing
- **Backend**: Built and configured
- **Shared Package**: Built and ready
- **Web Package**: Dependencies installed
- **Mobile Package**: Dependencies installed
- **iOS Simulators**: Available (iPhone 16 Pro, iPad Pro, etc.)
- **Android Emulators**: Available (Pixel 3a API 34)

### ⚠️ Configuration Issues Fixed
- Jest configuration unified across all packages
- Babel presets configured for JSX/TypeScript
- Missing dependencies installed
- Test environment variables configured

## 🚀 Quick Start Testing

### 1. Run Complete Test Environment Setup
```bash
./scripts/test-environment-setup.sh
```

### 2. Platform-Specific Testing

#### Backend API Testing
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

#### Web Application Testing
```bash
./scripts/test-web.sh
# Opens at http://localhost:5173
```

#### iOS Testing
```bash
./scripts/test-ios.sh
# Launches iPhone 16 Pro simulator
```

#### Android Testing
```bash
./scripts/test-android.sh
# Launches Pixel 3a emulator
```

#### Unit Tests
```bash
npm test
# Runs all test suites across packages
```

## 📱 Platform Support Matrix

| Platform | Version | Status | Testing Method |
|----------|---------|--------|----------------|
| **iOS** | 17.x+ | ✅ Ready | Xcode Simulator |
| **iPadOS** | 17.x+ | ✅ Ready | Xcode Simulator |
| **macOS** | 16.x+ | ⚠️ Partial | Desktop app (Electron) |
| **Windows** | 11.x+ | ⚠️ Partial | Desktop app (Electron) |
| **Web** | Modern browsers | ✅ Ready | Vite dev server |
| **Android** | API 24+ | ✅ Ready | Android Emulator |

## 🧪 Test Categories

### 1. Unit Tests
- **Location**: `packages/*/tests/`, `backend/src/**/*.test.ts`
- **Framework**: Jest + Testing Library
- **Coverage**: Components, services, utilities

### 2. Integration Tests
- **Location**: `backend/src/**/*.integration.test.ts`
- **Focus**: API endpoints, database operations, authentication

### 3. End-to-End Tests
- **Status**: To be implemented
- **Tools**: Playwright/Cypress (planned)
- **Scope**: Full user workflows

### 4. Performance Tests
- **Status**: To be implemented
- **Tools**: Lighthouse, React DevTools Profiler
- **Metrics**: Load times, memory usage, bundle size

## 🔧 Test Configuration Files

### Root Configuration
- `jest.config.js` - Multi-project Jest configuration
- `babel.config.js` - Babel presets for JSX/TypeScript
- `.env.test` - Test environment variables

### Package-Specific
- `packages/web/jest.config.js` - Web-specific Jest config
- `packages/mobile/jest.config.js` - React Native Jest config
- `backend/jest.config.js` - Node.js Jest config

## 🐛 Known Issues & Solutions

### 1. Jest Configuration Issues
**Problem**: JSX syntax not recognized in tests
**Solution**: ✅ Fixed with unified Babel configuration

### 2. TypeScript Compilation
**Problem**: Missing type definitions
**Solution**: ✅ Fixed with proper @types packages

### 3. React Native Dependencies
**Problem**: Peer dependency conflicts
**Solution**: ✅ Fixed with --legacy-peer-deps flag

### 4. Cross-Platform Imports
**Problem**: Shared package import issues
**Solution**: ✅ Fixed with moduleNameMapper in Jest config

## 📊 Testing Workflow

### Development Testing
1. **Start Backend**: `cd backend && npm run dev`
2. **Start Web App**: `cd packages/web && npm run dev`
3. **Run Unit Tests**: `npm test`
4. **Test Mobile**: Use simulators/emulators

### Pre-Deployment Testing
1. **Build All Packages**: `npm run build:all`
2. **Run Full Test Suite**: `npm test`
3. **E2E Testing**: Manual testing on all platforms
4. **Performance Testing**: Lighthouse audits

### Platform-Specific Testing Checklist

#### 📱 Mobile Testing (iOS/Android)
- [ ] App launches successfully
- [ ] Authentication flow works
- [ ] Journal entry creation/editing
- [ ] Rich text editor functionality
- [ ] Image/media attachments
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Data synchronization

#### 🌐 Web Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Cross-browser compatibility
- [ ] PWA functionality
- [ ] Keyboard shortcuts
- [ ] Accessibility (WCAG compliance)
- [ ] Performance (Core Web Vitals)

#### 🖥️ Desktop Testing
- [ ] Window management
- [ ] Native menus
- [ ] File system integration
- [ ] Auto-updates
- [ ] System notifications

## 🔍 Debugging Tools

### Development Tools
- **React DevTools**: Browser extension for React debugging
- **Redux DevTools**: State management debugging
- **Flipper**: React Native debugging (mobile)
- **Chrome DevTools**: Network, performance, console

### Testing Tools
- **Jest**: Unit testing framework
- **Testing Library**: Component testing utilities
- **Supertest**: API endpoint testing
- **MSW**: API mocking for tests

## 📈 Test Coverage Goals

| Package | Current | Target |
|---------|---------|--------|
| Backend | TBD | 80%+ |
| Shared | TBD | 90%+ |
| Web | TBD | 75%+ |
| Mobile | TBD | 70%+ |
| Desktop | TBD | 70%+ |

## 🚨 Critical Test Scenarios

### Security Testing
- [ ] Authentication bypass attempts
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Data encryption verification

### Data Integrity
- [ ] Journal entry persistence
- [ ] Sync conflict resolution
- [ ] Backup/restore functionality
- [ ] Data migration testing

### Performance Testing
- [ ] Large journal entry handling
- [ ] Image/media optimization
- [ ] Network failure recovery
- [ ] Memory leak detection

## 📝 Test Reporting

### Automated Reports
- Jest coverage reports: `coverage/lcov-report/index.html`
- Bundle analyzer: `packages/web/dist/report.html`
- Performance metrics: Lighthouse CI reports

### Manual Testing Reports
- Platform compatibility matrix
- User acceptance testing results
- Performance benchmarks
- Security audit results

## 🔄 Continuous Integration

### GitHub Actions (Planned)
- [ ] Automated testing on PR
- [ ] Cross-platform build verification
- [ ] Security scanning
- [ ] Performance regression detection

### Pre-commit Hooks
- [ ] Linting (ESLint)
- [ ] Type checking (TypeScript)
- [ ] Unit tests
- [ ] Code formatting (Prettier)

---

## 🎯 Next Steps

1. **Run the setup script**: `./scripts/test-environment-setup.sh`
2. **Start with backend testing**: Verify API endpoints work
3. **Test web application**: Check responsive design and functionality
4. **Mobile testing**: Use simulators for iOS/Android
5. **Fix any remaining issues**: Address test failures systematically

**Ready to start comprehensive testing! 🚀** 
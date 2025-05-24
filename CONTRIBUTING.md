# Contributing to EchoPages Journal

## Version Control Guidelines

### Branch Structure

- `main` - Production branch, contains released code
- `develop` - Development branch, contains code for the next release
- `feature/*` - Feature branches, branched from and merged back to `develop`
- `bugfix/*` - Bug fix branches, branched from and merged back to `develop`
- `hotfix/*` - Hot fix branches, branched from `main` for urgent production fixes
- `release/*` - Release branches, for preparing new releases

### Branch Naming Convention

- Feature branches: `feature/[issue-number]-brief-description`
  - Example: `feature/123-add-rich-text-editor`
- Bug fix branches: `bugfix/[issue-number]-brief-description`
  - Example: `bugfix/456-fix-image-upload`
- Hot fix branches: `hotfix/[issue-number]-brief-description`
  - Example: `hotfix/789-fix-auth-crash`
- Release branches: `release/v[version]`
  - Example: `release/v1.2.0`

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

Example:

```
feat(editor): add rich text formatting support

- Added bold, italic, and underline formatting
- Implemented shortcut keys
- Added toolbar buttons

Closes #123
```

### Pull Request Process

1. Create a branch following naming conventions
2. Make your changes in small, focused commits
3. Write tests for new features
4. Update documentation as needed
5. Ensure CI passes
6. Request review from at least one team member
7. Squash commits if requested
8. Merge only after approval

### Code Review Guidelines

- Review within 24 business hours
- Check for:
  - Code quality and style
  - Test coverage
  - Documentation
  - Performance implications
  - Security considerations

### Release Process

1. Create release branch from `develop`
2. Version bump and changelog update
3. Final testing and bug fixes
4. Merge to `main` with version tag
5. Deploy to production
6. Merge back to `develop`

## Development Setup

### Prerequisites

- Node.js 20.x
- Yarn 1.22+
- Git 2.x+

### Getting Started

1. Clone the repository

```bash
git clone https://github.com/username/echopages-journal.git
cd echopages-journal
```

2. Install dependencies

```bash
yarn install
```

3. Set up development environment

```bash
yarn prepare
```

4. Start development servers

```bash
# Backend
cd backend
yarn dev

# Web
cd packages/web
yarn dev

# Desktop
cd packages/desktop
yarn dev

# Mobile
cd packages/mobile
yarn start
```

### Running Tests

```bash
# All tests
yarn test

# Specific package
cd packages/[package-name]
yarn test
```

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Run `yarn lint` before committing
- Pre-commit hooks will enforce these automatically

## Package Structure

- `backend/` - Node.js backend server
- `packages/`
  - `web/` - React web application
  - `mobile/` - React Native mobile app
  - `desktop/` - Electron desktop app
  - `shared/` - Shared utilities and components

## Need Help?

- Check existing issues and pull requests
- Create a new issue for bugs or feature requests
- Ask questions in discussions
- Contact the maintainers

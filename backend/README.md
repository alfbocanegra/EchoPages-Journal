# EchoPages Journal Backend

Node.js backend server for EchoPages Journal built with Express and TypeScript.

## Features

- RESTful API endpoints
- Real-time WebSocket support
- PostgreSQL database integration
- Redis caching
- JWT authentication
- Rate limiting
- API documentation with Swagger
- Automated testing
- Docker support

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run tests
yarn test

# Run linting
yarn lint

# Generate API documentation
yarn docs
```

## Environment Setup

Create a `.env` file in the package root:

```env
# Server
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=echopages
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

## Directory Structure

```
src/
  ├── config/       # Configuration files
  ├── controllers/  # Route controllers
  ├── middleware/   # Custom middleware
  ├── models/       # Database models
  ├── routes/       # API routes
  ├── services/     # Business logic
  ├── types/        # TypeScript types
  └── utils/        # Utility functions
```

## API Documentation

API documentation is available at `/api-docs` when running the server.

## Database Migrations

```bash
# Create a migration
yarn migration:create

# Run migrations
yarn migration:run

# Revert last migration
yarn migration:revert
```

## Docker

```bash
# Build image
docker build -t echopages-backend .

# Run container
docker run -p 3000:3000 echopages-backend
```

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

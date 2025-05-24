# @echopages/web

Web application for EchoPages Journal built with React and Vite.

## Features

- Modern React application with TypeScript
- Fast development with Vite
- Responsive design for all screen sizes
- Rich text editing capabilities
- Real-time synchronization
- Offline support with local storage
- Progressive Web App (PWA) capabilities

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run tests
yarn test

# Run linting
yarn lint
```

## Environment Variables

Create a `.env` file in the package root:

```env
VITE_API_URL=http://localhost:3000
VITE_STORAGE_KEY=echopages_web
```

## Directory Structure

```
src/
  ├── assets/        # Static assets (images, fonts, etc.)
  ├── components/    # React components
  ├── hooks/        # Custom React hooks
  ├── pages/        # Page components
  ├── services/     # API and service integrations
  ├── store/        # State management
  ├── styles/       # Global styles and themes
  └── utils/        # Utility functions
```

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

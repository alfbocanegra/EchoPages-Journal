#!/bin/bash

# Create root project directories
mkdir -p packages/{web,mobile,desktop,shared}
mkdir -p backend/{src,tests,config,scripts}
mkdir -p docs/{api,architecture,deployment}

# Web application structure
mkdir -p packages/web/{src,public,tests}
mkdir -p packages/web/src/{components,hooks,utils,services,styles,assets,pages,store}
mkdir -p packages/web/src/components/{auth,editor,journal,media,settings,common}
mkdir -p packages/web/src/store/{slices,middleware}

# Mobile application structure (React Native)
mkdir -p packages/mobile/{android,ios,src,tests}
mkdir -p packages/mobile/src/{components,hooks,utils,services,styles,assets,screens,store,navigation}
mkdir -p packages/mobile/src/components/{auth,editor,journal,media,settings,common}
mkdir -p packages/mobile/src/store/{slices,middleware}

# Desktop application structure (Electron)
mkdir -p packages/desktop/{src,build,tests}
mkdir -p packages/desktop/src/{components,hooks,utils,services,styles,assets,windows,store}
mkdir -p packages/desktop/src/components/{auth,editor,journal,media,settings,common}
mkdir -p packages/desktop/src/store/{slices,middleware}

# Shared code structure
mkdir -p packages/shared/{types,utils,constants,hooks,services}
mkdir -p packages/shared/services/{sync,auth,storage,encryption}

# Backend structure
mkdir -p backend/src/{api,models,services,utils,middleware,config}
mkdir -p backend/src/services/{auth,sync,storage,media,ai}
mkdir -p backend/src/models/{journal,user,media}
mkdir -p backend/config/{development,production,test}
mkdir -p backend/scripts/{db,deployment}

# Documentation structure
mkdir -p docs/api/{endpoints,models,services}
mkdir -p docs/architecture/{diagrams,decisions}
mkdir -p docs/deployment/{local,staging,production}

# Create initial README files
echo "# EchoPages Journal

A cross-platform digital journaling application with rich text editing, multimedia support, and secure synchronization.

## Project Structure

- \`packages/\`: Contains all client applications
  - \`web/\`: Web application
  - \`mobile/\`: Mobile apps (iOS/Android)
  - \`desktop/\`: Desktop apps (macOS/Windows)
  - \`shared/\`: Shared code and utilities
- \`backend/\`: Server-side application
- \`docs/\`: Project documentation

## Getting Started

[Documentation to be added]

## Development

[Development instructions to be added]

## License

[License information to be added]" > README.md

# Create package.json files
echo '{
  "name": "echopages-journal",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "backend"
  ]
}' > package.json

# Create .gitignore
echo "# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
build/
dist/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Mobile
packages/mobile/ios/Pods/
packages/mobile/android/.gradle/
packages/mobile/android/app/build/

# Desktop
packages/desktop/dist/
packages/desktop/build/

# Temporary files
*.log
*.tmp" > .gitignore

# Make the script executable
chmod +x scripts/create-project-structure.sh 
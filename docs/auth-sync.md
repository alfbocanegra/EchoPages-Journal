# Authentication & Sync Flow

## Supported Providers
- Google (OAuth)
- Apple (Sign in with Apple)
- Dropbox (OAuth)

## Frontend (Expo App)
- Users can sign in with any supported provider from the Settings screen.
- Tokens and provider info are stored securely using expo-secure-store (with AsyncStorage fallback).
- The app persists authentication state across restarts and uses the correct token/provider for all sync operations.
- The "Sync Now" button sends the token and provider to the backend for verification.
- Users can clear all local data and sign out at any time.

## Backend
- All routes that access or modify user data require authentication via the requireAuth middleware.
- The backend verifies tokens for Google, Apple, and Dropbox, and looks up or creates the user in the database.
- The authenticated user is attached to req.user and used for all sync operations.
- The /sync/admin/users endpoint (admin only) lists all users and their entry counts for verification/testing.

## Security
- Tokens are never stored in plaintext or sent to other users.
- All user data is always scoped to the authenticated user.
- Only admins can access the /sync/admin/users endpoint.

## Adding New Providers
- Add the provider to the frontend sign-in options and backend token verification logic.
- Update the OAuthService and UserRepository as needed.

## Troubleshooting
- If you see module resolution errors for native modules, clean node_modules and reinstall dependencies.
- For production, ensure all credentials and redirect URIs are set correctly for each provider. 
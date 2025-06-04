# Stadium Booking Backend

A backend API for the Stadium Booking mobile app, built with [NestJS](https://nestjs.com/) and designed for integration with a React Native (Expo) frontend. Supports user authentication via Google OAuth, OTP login, and user/sport management.

## Features

- User authentication (Google OAuth for mobile, OTP for phone)
- User and sport management
- GraphQL API
- CORS configured for Expo/React Native development

## Getting Started

### Prerequisites

- Node.js (v18)
- npm
- PostgreSQL

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root. Example:

```env
PORT=8089
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=stadium_booking
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=your-google-client-callback-url
```

**Important:**

- The `GOOGLE_CALLBACK_URL` must match the redirect URI set in your Google Cloud Console and Expo app.
- For Expo/React Native, use the format: `https://auth.expo.io/@<expo-username>/<app-slug>`

### Running the Server

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

The server will start on the port specified in your `.env` (default: 8089).

### CORS & Expo Setup

- CORS is pre-configured to allow requests from Expo Go and your local network.
- Make sure your Expo app uses the correct backend URL (e.g., `http://<your-ip>:8089`).

### Google OAuth for Expo/React Native

1. In Google Cloud Console, set the redirect URI to:
   ```
   https://auth.expo.io/@toantran.11/stadium-booking-frontend
   ```
2. In your Expo app, use `expo-auth-session` with `useProxy: true` and the same redirect URI.
3. The backend exposes a `googleAuthMobile(idToken: String!): User!` mutation for mobile login.

### GraphQL Playground

- Access the GraphQL playground at `http://localhost:8089/graphql` (if enabled in your environment).

## Scripts

- `npm run start:dev` — Start in development mode with hot reload
- `npm run start:prod` — Start in production mode
- `npm run test` — Run unit tests
- `npm run test:e2e` — Run end-to-end tests

## Project Structure

- `src/modules/auth` — Authentication logic (Google, OTP)
- `src/modules/user` — User management
- `src/modules/sport` — Sport management
- `src/config` — Environment and app configuration

## Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [Expo AuthSession Docs](https://docs.expo.dev/guides/authentication/)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

## License

MIT

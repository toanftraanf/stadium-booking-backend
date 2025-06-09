[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Stadium Booking Backend

A backend API for the Stadium Booking mobile app, built with [NestJS](https://nestjs.com/) and designed for integration with a React Native (Expo) frontend. Supports user authentication via Google OAuth, OTP login, stadium management with location services, and file uploads.

## Features

- 🔐 **Authentication**: Google OAuth for mobile, OTP via Twilio for phone verification
- 👥 **User & Sport Management**: Complete user profiles with favorite sports
- 🏟️ **Stadium Management**: Full CRUD with location services and field management
- 📍 **Location Services**: Integration with Goong.io for Vietnamese locations
- 📁 **File Upload**: Cloudinary integration for images, videos, and documents
- 📱 **Reservation System**: Complete booking management with status tracking
- 🌐 **GraphQL API**: Modern API with GraphQL playground
- 🐳 **Docker Ready**: Full Docker support with PostgreSQL database

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (or Docker for easy setup)

### Installation

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=8089
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=stadium_booking
DB_TYPE=postgres
DB_USER=postgres
DB_NAME=stadium_booking

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=your-callback-url

# Goong.io Configuration (for Vietnamese location services)
GOONG_API_KEY=your-goong-api-key

# Twilio Configuration (for OTP SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Database Setup

### Option 1: Quick Setup with Docker (Recommended)

1. **Pull and run PostgreSQL container:**

   ```bash
   docker run --name stadium-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=123 \
     -e POSTGRES_DB=stadium_booking \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Update your `.env` file:**

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=123
   DB_DATABASE=stadium_booking
   ```

3. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

### Option 2: Full Docker Compose Setup

1. **Start all services (Backend + PostgreSQL):**

   ```bash
   docker-compose up --build
   ```

2. **Update your `.env` for Docker Compose:**
   ```env
   DB_HOST=db
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=123
   DB_DATABASE=sbs_dev
   ```

### Option 3: Local PostgreSQL Installation

1. Install PostgreSQL locally
2. Create a database named `stadium_booking`
3. Update `.env` with your local PostgreSQL credentials
4. Run migrations: `npm run migration:run`

## Third-Party Service Configurations

### 🗺️ Goong.io Setup (Vietnamese Location Services)

Goong.io provides accurate Vietnamese location data with better coverage than Google Maps.

1. **Sign up at [Goong.io](https://account.goong.io/)**
2. **Get your API key from the dashboard**
3. **Add to your `.env`:**
   ```env
   GOONG_API_KEY=your-goong-api-key
   ```

**Features:**

- ✅ 91% success rate for Vietnamese locations
- ✅ Autocomplete location search
- ✅ Distance calculation
- ✅ 100$ free credit + 30,000 free requests/month
- ✅ Much more cost-effective than Google Maps

### 📱 Twilio Setup (SMS/OTP)

1. **Sign up at [Twilio](https://www.twilio.com/)**
2. **Get your Account SID and Auth Token from Console**
3. **Get a Twilio phone number**
4. **Add to your `.env`:**
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### ☁️ Cloudinary Setup (File Upload)

1. **Create account at [Cloudinary](https://cloudinary.com/)**
2. **Get credentials from [Dashboard](https://cloudinary.com/console)**
3. **Add to your `.env`:**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### 🔑 Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)**
2. **Create OAuth 2.0 Client ID**
3. **For Expo/React Native, add redirect URI:**
   ```
   https://auth.expo.io/@<expo-username>/<app-slug>
   ```
4. **Add to your `.env`:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=https://auth.expo.io/@username/app-slug
   ```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run start:prod
```

The server will start on `http://localhost:8089`

### Available Scripts

- `npm run start:dev` — Development with hot reload
- `npm run start:prod` — Production mode
- `npm run build` — Build the application
- `npm run migration:generate -- --name=MigrationName` — Generate new migration
- `npm run migration:run` — Run pending migrations
- `npm run migration:revert` — Revert last migration
- `npm run test` — Run unit tests
- `npm run test:e2e` — Run end-to-end tests

## API Documentation

### GraphQL Playground

Access the GraphQL playground at: `http://localhost:8089/graphql`

### Key Features Available

#### 🔐 Authentication

- Google OAuth login
- OTP-based phone verification
- JWT token management

#### 🏟️ Stadium Management

- Create/Update/Delete stadiums
- Location-based stadium search
- Field management within stadiums
- Image upload (avatar, banner, gallery)

#### 📅 Reservation System

- Create reservations
- Get user reservations
- Get stadium reservations by date
- Update reservation status
- Owner dashboard for all reservations

#### 📁 File Upload System

- Secure signed upload URLs
- Direct upload to Cloudinary
- Support for images, videos, documents
- Automatic optimization and transformations

## File Upload System

### Quick Upload Flow

1. **Request upload URL:**

   ```graphql
   mutation GenerateUploadUrl($fileUploadInput: FileUploadInput!) {
     generateUploadUrl(fileUploadInput: $fileUploadInput) {
       uploadUrl
       publicId
       signature
       timestamp
       apiKey
       cloudName
       folder
     }
   }
   ```

2. **Upload to Cloudinary:**

   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('api_key', uploadData.apiKey);
   formData.append('timestamp', uploadData.timestamp);
   formData.append('signature', uploadData.signature);
   formData.append('folder', uploadData.folder);

   const response = await fetch(uploadData.uploadUrl, {
     method: 'POST',
     body: formData,
   });
   ```

3. **Confirm upload:**
   ```graphql
   mutation ConfirmUpload($url: String!, $publicId: String!, $type: String) {
     confirmUpload(url: $url, publicId: $publicId, type: $type) {
       id
       url
       publicId
       type
     }
   }
   ```

### Supported File Types

- **Images:** JPG, JPEG, PNG, GIF, WebP, SVG, BMP
- **Videos:** MP4, MOV, AVI, MKV, WebM
- **Documents:** PDF, DOC, DOCX, and others

## Docker Usage

### Backend Only

```bash
docker build -t stadium-booking-backend .
docker run --env-file .env -p 8089:8089 stadium-booking-backend
```

### Development with Hot Reload

```bash
docker build -f Dockerfile.dev -t stadium-booking-backend-dev .
docker run --env-file .env -p 8089:8089 stadium-booking-backend-dev
```

### Full Stack with PostgreSQL

```bash
docker-compose up --build
```

## Project Structure

```
src/
├── config/           # Configuration files
├── migrations/       # Database migrations
├── modules/
│   ├── auth/         # Authentication (Google OAuth, OTP)
│   ├── user/         # User management
│   ├── sport/        # Sport management
│   ├── stadium/      # Stadium & field management
│   ├── reservation/  # Booking system
│   └── upload/       # File upload with Cloudinary
└── utils/           # Utility functions
```

## CORS & Mobile App Integration

- CORS is pre-configured for Expo Go and local development
- Use your local IP address: `http://<your-ip>:8089`
- GraphQL endpoint: `http://<your-ip>:8089/graphql`

## Troubleshooting

### Common Issues

1. **Database Connection Error:**

   - Ensure PostgreSQL is running
   - Check DB credentials in `.env`
   - Run migrations: `npm run migration:run`

2. **Cloudinary Upload Issues:**

   - Verify API credentials
   - Check file size limits
   - Ensure proper CORS setup

3. **Google OAuth Not Working:**

   - Verify client ID and secret
   - Check redirect URI configuration
   - Ensure OAuth consent screen is configured

4. **SMS/OTP Not Sending:**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure Twilio phone number is active

## Environment Variables Reference

| Variable               | Required | Description                          |
| ---------------------- | -------- | ------------------------------------ |
| `PORT`                 | No       | Server port (default: 8089)          |
| `NODE_ENV`             | No       | Environment (development/production) |
| `DB_HOST`              | Yes      | Database host                        |
| `DB_PORT`              | Yes      | Database port                        |
| `DB_USERNAME`          | Yes      | Database username                    |
| `DB_PASSWORD`          | Yes      | Database password                    |
| `DB_DATABASE`          | Yes      | Database name                        |
| `JWT_SECRET`           | Yes      | JWT signing secret                   |
| `JWT_REFRESH_SECRET`   | Yes      | JWT refresh token secret             |
| `GOOGLE_CLIENT_ID`     | Yes\*    | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET` | Yes\*    | Google OAuth client secret           |
| `GOOGLE_CALLBACK_URL`  | Yes\*    | Google OAuth callback URL            |

| `GOONG_API_KEY` | Yes\*\* | Goong.io API key for locations |
| `TWILIO_ACCOUNT_SID` | Yes\*\*\* | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes\*\*\* | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes\*\*\* | Twilio phone number |
| `CLOUDINARY_CLOUD_NAME` | Yes\*\*\*\* | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes\*\*\*\* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes\*\*\*\* | Cloudinary API secret |

\* Required for Google OAuth login  
\*\* Required for location services  
\*** Required for SMS/OTP functionality  
\*\*** Required for file upload functionality

## Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Playground](http://localhost:8089/graphql)
- [Expo AuthSession Docs](https://docs.expo.dev/guides/authentication/)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Twilio Console](https://console.twilio.com/)
- [Goong.io Dashboard](https://account.goong.io/)

## License

[MIT](https://opensource.org/licenses/MIT)

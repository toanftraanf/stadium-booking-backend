[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Stadium Booking Backend

A backend API for the Stadium Booking mobile app, built with [NestJS](https://nestjs.com/) and designed for integration with a React Native (Expo) frontend. Supports user authentication via Google OAuth, OTP login, and user/sport management.

## Features

- User authentication (Google OAuth for mobile, OTP for phone)
- User and sport management
- **File upload with Cloudinary integration**
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

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Important:**

- The `GOOGLE_CALLBACK_URL` must match the redirect URI set in your Google Cloud Console and Expo app.
- For Expo/React Native, use the format: `https://auth.expo.io/@<expo-username>/<app-slug>`
- Get your Cloudinary credentials from [Cloudinary Dashboard](https://cloudinary.com/console)

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

### GraphQL Playground

- Access the GraphQL playground at `http://localhost:8089/graphql` (if enabled in your environment).

## File Upload with Cloudinary

This project includes a complete file upload system using Cloudinary for cloud storage.

### Setup Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the [Dashboard](https://cloudinary.com/console)
3. Add the credentials to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### File Upload GraphQL Mutations

#### 1. Generate Upload URL (Frontend)

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

**Variables:**

```json
{
  "fileUploadInput": {
    "fileName": "profile-image.jpg",
    "type": "image/jpeg",
    "folder": "avatars"
  }
}
```

#### 2. Confirm Upload (After uploading to Cloudinary)

```graphql
mutation ConfirmUpload($url: String!, $publicId: String!, $type: String) {
  confirmUpload(url: $url, publicId: $publicId, type: $type) {
    id
    url
    publicId
    type
    createdAt
  }
}
```

### File Upload Flow

1. **Frontend requests upload URL:**

   ```typescript
   const { data } = await client.mutate({
     mutation: GENERATE_UPLOAD_URL,
     variables: {
       fileUploadInput: {
         fileName: 'profile.jpg',
         type: 'image/jpeg',
         folder: 'avatars',
       },
     },
   });
   ```

2. **Upload directly to Cloudinary:**

   ```typescript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('api_key', data.generateUploadUrl.apiKey);
   formData.append('timestamp', data.generateUploadUrl.timestamp);
   formData.append('signature', data.generateUploadUrl.signature);
   formData.append('folder', data.generateUploadUrl.folder);

   const response = await fetch(data.generateUploadUrl.uploadUrl, {
     method: 'POST',
     body: formData,
   });
   ```

3. **Confirm upload in database:**
   ```typescript
   await client.mutate({
     mutation: CONFIRM_UPLOAD,
     variables: {
       url: cloudinaryResponse.secure_url,
       publicId: cloudinaryResponse.public_id,
       type: 'image',
     },
   });
   ```

### Supported File Types

- **Images:** JPG, JPEG, PNG, GIF, WebP, SVG, BMP
- **Videos:** MP4, MOV, AVI, MKV, WebM
- **Documents:** PDF, DOC, DOCX, and other files (stored as 'raw' type)

### File Management Queries

```graphql
# Get all files
query GetFiles {
  files {
    id
    url
    publicId
    type
    createdAt
  }
}

# Get files by type
query GetFilesByType($type: String!) {
  filesByType(type: $type) {
    id
    url
    publicId
    type
    createdAt
  }
}

# Get file statistics
query GetFileStats {
  fileStats {
    total
    byType
  }
}
```

### Features

- ✅ **Secure uploads** with signed URLs
- ✅ **Direct upload** to Cloudinary (no server storage)
- ✅ **Automatic optimization** and transformations
- ✅ **File validation** and type checking
- ✅ **Database tracking** of uploaded files
- ✅ **Cleanup** when files are deleted
- ✅ **Multiple file types** support (images, videos, documents)

## Scripts

- `npm run start:dev` — Start in development mode with hot reload
- `npm run start:prod` — Start in production mode
- `npm run test` — Run unit tests
- `npm run test:e2e` — Run end-to-end tests

## Docker Usage

### Build and Run with Docker (Production)

1. Build the Docker image:
   ```bash
   docker build -t stadium-booking-backend .
   ```
2. Run the container:
   ```bash
   docker run --env-file .env -p 8089:8089 stadium-booking-backend
   ```

### Build and Run with Docker (Development)

1. Build the development image:
   ```bash
   docker build -f Dockerfile.dev -t stadium-booking-backend-dev .
   ```
2. Run the development container:
   ```bash
   docker run --env-file .env -p 8089:8089 stadium-booking-backend-dev
   ```

### Using Docker Compose (Backend + PostgreSQL)

1. Make sure your `.env` file is configured for the database service in `docker-compose.yml` (e.g., `DB_HOST=db`, `DB_PORT=5432`).
2. Start all services:
   ```bash
   docker-compose up --build
   ```
3. The backend will be available at `http://localhost:8089` and PostgreSQL at `localhost:5432`.

## Project Structure

- `src/modules/auth` — Authentication logic (Google, OTP)
- `src/modules/user` — User management
- `src/modules/sport` — Sport management
- `src/modules/upload` — File upload with Cloudinary integration
- `src/modules/stadium` — Stadium management
- `src/config` — Environment and app configuration

## Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [Expo AuthSession Docs](https://docs.expo.dev/guides/authentication/)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

## License

[MIT](https://opensource.org/licenses/MIT)

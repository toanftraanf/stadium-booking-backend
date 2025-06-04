# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Accept build-time argument for environment
ENV NODE_ENV=production

# Install dependencies
RUN npm install --only=production

# Copy the rest of the app source code
COPY . .

# Build the app
RUN npm run build

# Expose the port your app runs on (default: 8089)
EXPOSE 8089

# Start the app
CMD ["npm", "run", "start:prod"]

FROM node:22-slim

LABEL "language"="nodejs"
LABEL "framework"="express"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend with Vite
RUN npm run build

# Expose port
EXPOSE 8080

# Start Express server in production mode
CMD ["npm", "start"]

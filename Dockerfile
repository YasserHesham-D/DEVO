FROM node:20-slim

# Install build tools needed for better-sqlite3 native module
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all app files
COPY . .

# Create data directory for persistent SQLite storage
RUN mkdir -p /data

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

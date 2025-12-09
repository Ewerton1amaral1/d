# Build Stage
FROM node:20-slim AS builder

# Prevent puppeteer from downloading chrome during npm install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Install build tools needed for some npm packages
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy root package files first to leverage caching
COPY package.json package-lock.json ./
# Copy backend package file
COPY backend/package.json ./backend/

# Install dependencies from root
RUN npm install

WORKDIR /app/backend

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/. .

RUN npm run build

# Production Stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install Chrome dependencies for Puppeteer (Debian)
# Using chromium from apt is much more stable than Alpine edge
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    ca-certificates \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip downloading Chrome. We'll use the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma

EXPOSE 3001

CMD ["npm", "run", "start"]

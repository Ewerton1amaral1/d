
FROM node:20-slim

# 1. Install system dependencies for Puppeteer + Common libs
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    openssl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 2. Set Env to use installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

# 3. Copy Manifests (Relative to backend folder now)
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

# 4. Install dependencies
RUN npm ci --omit=dev
RUN npm ci # Install prisma CLI (dev dep) for generate

# 5. Copy Source Code
COPY . .

# 6. Build
RUN npx prisma generate
RUN npx tsc

# 7. Start
CMD ["node", "dist/server.js"]

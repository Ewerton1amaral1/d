
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

# 3. Copy Backend manifests first (for cache)
# We copy them to root of container
COPY backend/package.json ./package.json
COPY backend/package-lock.json ./package-lock.json

# 4. Install dependencies (Production only)
RUN npm ci --omit=dev

# 5. Build Tools - We need Prisma CLI which is devDependency
# So we actually need full install first OR install prisma global
# Let's do full install then prune? Or just full install.
# The previous step did omit=dev, but prisma is usually dev.
# Let's override to install ALL deps to be safe for build
RUN npm ci

# 6. Copy Source Code
COPY backend/ .

# 7. Build Project
RUN npx prisma generate
RUN npx tsc

# 8. Start
CMD ["node", "dist/server.js"]

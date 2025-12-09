# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy backend package too if needed for workspace, but we just want root deps for now
# Actually root package.json has "workspaces": ["backend"] which might complicate npm install if backend missing
# Let's verify if we need backend folder. Usually yes if workspace.
COPY backend/package.json ./backend/

# Install dependencies (including devDependencies for Vite)
RUN npm install

# Copy source code
COPY . .

# Expose the API URL to the build process
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add custom nginx config to handle React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Multi-stage build for the Angular app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better cache usage)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy sources and build
COPY . .
RUN npm run build -- --configuration production

# Nginx stage to serve static files
FROM nginx:1.25-alpine

# Copy custom nginx config (single-page app, fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts
COPY --from=builder /app/dist/todo-app /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

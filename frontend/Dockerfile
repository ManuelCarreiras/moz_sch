# Build stage
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src
COPY public ./public
RUN npm ci
ARG VITE_API_BASE_URL
ARG VITE_COGNITO_USER_POOL_ID
ARG VITE_COGNITO_APP_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_COGNITO_USER_POOL_ID=${VITE_COGNITO_USER_POOL_ID}
ENV VITE_COGNITO_APP_CLIENT_ID=${VITE_COGNITO_APP_CLIENT_ID}
RUN npm run build

# Serve stage
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create SSL directory (certificates mounted at runtime)
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]


# ----------- PHASE 1: Builder -----------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy package files và cài dependencies
    COPY package*.json ./
    RUN npm install --force
    
    # Copy toàn bộ mã nguồn + file env
    COPY . .
    COPY .env.local .env.local
    
    # Build ứng dụng ở chế độ standalone
    RUN npm run build
    
    # ----------- PHASE 2: Runner -----------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy toàn bộ nội dung standalone từ builder
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.env.local .env.local
    
    # Expose cổng
    EXPOSE 3000
    
    # Chạy ứng dụng
    CMD ["node", "server.js"]
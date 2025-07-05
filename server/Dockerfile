FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Explicitly create the dist directory and copy contents
RUN mkdir -p dist
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3001

CMD ["node", "dist/index.js"]
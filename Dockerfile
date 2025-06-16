# Stage 1 - Build
FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env .env

RUN npm install

COPY . .
RUN npm run build

# Stage 2 - Run
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.env .env 

EXPOSE 3000

CMD ["node", "dist/main.js"]

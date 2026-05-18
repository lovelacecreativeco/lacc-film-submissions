FROM node:22-alpine

# su-exec is the alpine equivalent of gosu -- drops privileges cleanly
RUN apk add --no-cache su-exec

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY entrypoint.sh ./
COPY public/ ./public/

RUN chmod +x entrypoint.sh

# Run as root so entrypoint can chown /data before dropping to PUID/PGID
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

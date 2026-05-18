FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY entrypoint.sh ./
COPY public/ ./public/

RUN chmod +x entrypoint.sh \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup

USER appuser

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

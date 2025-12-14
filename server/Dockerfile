FROM ghcr.io/puppeteer/puppeteer:24.33.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    NODE_ENV=production

USER root
WORKDIR /app/server

COPY package*.json ./
RUN chown -R pptruser:pptruser /app

USER pptruser
RUN npm install

COPY . .

CMD ["npm", "start"]

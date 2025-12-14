FROM ghcr.io/puppeteer/puppeteer:24.33.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Switch to root ONLY to fix permissions
USER root

WORKDIR /app/server

COPY package*.json ./

# Give puppeteer user access
RUN chown -R pptruser:pptruser /app

# Switch back to non-root (important!)
USER pptruser

RUN npm install

COPY . .

CMD ["node", "attendance.js"]

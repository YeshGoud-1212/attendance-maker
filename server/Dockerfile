FROM ghcr.io/puppeteer/puppeteer:24.33.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true\
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app/server
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "attendance.js"]

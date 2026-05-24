FROM node:22-alpine
WORKDIR /app
ENV VITE_API_BASE_URL=https://backend.arcane-ledger.com/api/v1
ENV VITE_SENTRY_DSN=https://1e6c9f45493823f1317b994444a44634@o4504169038544896.ingest.us.sentry.io/4511422835589120
ENV VITE_SENTRY_ENVIRONMENT=production
COPY package.json .
RUN npm install
RUN npm i -g serve
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "serve", "-s", "dist" ]
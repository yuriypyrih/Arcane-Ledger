FROM node:22-alpine
WORKDIR /app
ENV VITE_API_BASE_URL=https://backend.arcane-ledger.com/api/v1
COPY package.json .
RUN npm install
RUN npm i -g serve
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "serve", "-s", "dist" ]
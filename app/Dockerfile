FROM node:22-alpine
WORKDIR /app
ENV VITE_API_BASE_URL=http://backend.arcane-ledger.com
COPY package.json .
RUN npm install
RUN npm i -g serve
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "serve", "-s", "dist" ]
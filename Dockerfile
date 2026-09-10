FROM node:20-bookworm-slim

# better-sqlite3 braucht Build-Tools zum Kompilieren nativer Bindings
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=3010
EXPOSE 3010

CMD ["node", "server.js"]

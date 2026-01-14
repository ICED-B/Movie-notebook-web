FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# statické soubory
COPY --from=build /app/dist /usr/share/nginx/html

# runtime env script
COPY env.sh /env.sh
RUN chmod +x /env.sh

EXPOSE 80

# vygeneruje /usr/share/nginx/html/config.js a pak spustí nginx
CMD ["/env.sh", "nginx", "-g", "daemon off;"]

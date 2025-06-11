# Stage 1: Build the Angular app
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build -- --configuration production

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/contact-manager-frontend /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

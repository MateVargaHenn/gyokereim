FROM node:24 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx ng build admin --configuration production


FROM nginx:alpine

COPY projects/admin/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build \
    /app/dist/admin/browser \
    /usr/share/nginx/html

EXPOSE 80
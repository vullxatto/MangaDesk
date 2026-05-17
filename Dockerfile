# Базовые образы с mirror.gcr.io/library/... — кэш Docker Hub в Google Artifact Registry;
# при TLS timeout до registry-1.docker.io можно переопределить: docker compose build --build-arg NODE_IMAGE=node:22-alpine web
# Оба ARG до первого FROM — иначе второй FROM не видит NGINX_IMAGE (BuildKit).
ARG NODE_IMAGE=mirror.gcr.io/library/node:22-alpine
ARG NGINX_IMAGE=mirror.gcr.io/library/nginx:1.27-alpine

FROM ${NODE_IMAGE} AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8000
ARG VITE_TEAM_ID=b0000001-0001-0001-0001-000000000001
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TEAM_ID=$VITE_TEAM_ID

RUN npm run build

FROM ${NGINX_IMAGE}

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

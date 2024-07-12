FROM node:18-alpine AS base
RUN apk add --no-cache curl
EXPOSE 3001

WORKDIR /usr/app
COPY package.json .
RUN npm install --omit=dev

FROM base AS development
RUN npm install
CMD [ "npm", "run", "debug" ]

FROM base AS production
COPY ./config ./config
COPY ./src ./src
CMD [ "npm", "run", "start" ]
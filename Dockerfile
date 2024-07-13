FROM node:18-alpine AS base

WORKDIR /usr/app
COPY package.json .
RUN npm install --omit=dev

FROM base AS development
RUN npm install
CMD [ "npm", "run", "debug" ]

FROM base AS production
COPY ./src ./src
CMD [ "npm", "run", "start" ]
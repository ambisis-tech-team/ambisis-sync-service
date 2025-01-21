# STAGE 1
FROM node:18-alpine AS builder
RUN apk add --no-cache g++ make py3-pip
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile

# STAGE 2
FROM node:18-alpine
RUN apk add --no-cache g++ make py3-pip
WORKDIR /home/node/app
COPY package*.json ./
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/build ./build
EXPOSE 8080
CMD ["node", "build/main.js"]
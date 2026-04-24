FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY frontend ./

RUN npm run build

EXPOSE 3001

CMD ["npm", "start", "--", "-p", "3001"]
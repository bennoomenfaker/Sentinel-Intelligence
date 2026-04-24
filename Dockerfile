FROM node:20-alpine

WORKDIR /home/himawari/2027

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
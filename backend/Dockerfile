FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./backend/src/
COPY dist ./dist/

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
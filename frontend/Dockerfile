FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm install @vitejs/plugin-react --save-dev
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"] 
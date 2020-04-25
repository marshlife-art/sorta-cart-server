FROM node:12-alpine

#bcrypt help
RUN apk --no-cache add --virtual builds-deps build-base python

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . /app

EXPOSE 3000
USER node   
CMD ["node", "server.js"] 

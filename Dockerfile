FROM node:14-alpine

#bcrypt help
RUN apk --no-cache add --virtual builds-deps build-base python

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . /app

EXPOSE 3000
USER node   
# npm start does seem to trap signals better than node server.js ...soooo:
CMD ["npm", "start"]

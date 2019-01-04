FROM node:carbon

ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

COPY . .
RUN npm install --production

CMD [ "npm", "start" ]

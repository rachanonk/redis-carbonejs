FROM node:LibreOffice-7.1.5.2
COPY . /home/node/app
RUN npm install -g npm@7.20.3
RUN npm install redis
RUN npm update
WORKDIR /home/node/app
RUN npm install
EXPOSE 3000
CMD [ "npm", "start" ]
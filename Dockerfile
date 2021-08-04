FROM node:14.17.1

WORKDIR /code

COPY package*.json /code/

RUN npm install

COPY . /code/    

CMD npx jest --watchAll
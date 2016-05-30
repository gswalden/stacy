FROM node:latest

COPY . /src

RUN cd /src && \
  npm install -g nodemon && \
  npm install;

ENV PORT 3000

EXPOSE $PORT

WORKDIR /src

CMD ["nodemon", "./index.js"]

FROM --platform=linux/amd64 node:20

ENV APP_HOME /app

WORKDIR $APP_HOME
COPY ./ $APP_HOME

RUN npm install --ignore-scripts

EXPOSE 3000/tcp
EXPOSE 3001/tcp
EXPOSE 3002/tcp

CMD npm run start

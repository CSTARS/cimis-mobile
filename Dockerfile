FROM node:8.4

RUN mkdir /cimis-mobile
COPY ./client/dist /cimis-mobile/client/dist
COPY ./server /cimis-mobile/server
COPY ./utils /cimis-mobile/utils
COPY ./package.json /cimis-mobile/package.json
COPY ./package-lock.json /cimis-mobile/package-lock.json

RUN cd /cimis-mobile && npm install --production

CMD node /cimis-mobile/server
# CMD tail -f /dev/null
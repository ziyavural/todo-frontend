FROM node:9.4.0-slim
MAINTAINER Ziya Vural <vuralziyaa@gmail.com>

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /to-do-app && cp -a /tmp/node_modules /to-do-app

RUN useradd -ms /bin/bash ziya
RUN chown -R ziya:ziya /usr/local/lib

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /to-do-app
ADD . /to-do-app
RUN chown -R ziya:ziya /to-do-app

USER ziya

RUN npm run build

CMD ["npm", "run", "serve"]
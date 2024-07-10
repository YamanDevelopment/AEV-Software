FROM node:latest

COPY ./app /app

WORKDIR /app

EXPOSE 3000

CMD ["/bin/bash", "-c", "npm install;npx nuxt build;node .output/server/index.mjs"]
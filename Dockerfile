FROM nginx:1.27-alpine

ENV PORT=8080

WORKDIR /usr/share/nginx/html

COPY index.html ./
COPY css ./css
COPY js ./js
COPY assets ./assets
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080

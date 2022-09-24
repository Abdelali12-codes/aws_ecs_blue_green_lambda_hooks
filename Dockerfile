FROM nginx:latest

COPY index.html /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

WORKDIR /app/volume

COPY . .

VOLUME  ["/app/volume"]

ENTRYPOINT ["nginx", "-g", "daemon off;"]

FROM node:18.19 AS build

WORKDIR /app

COPY . .

RUN npm install -g @angular/cli

RUN npm install

EXPOSE 8080

CMD ["sh", "-c", "ng serve  --configuration=production --host  0.0.0.0 --port 8080"]

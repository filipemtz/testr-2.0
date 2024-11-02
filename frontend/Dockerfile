FROM node:18.19 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

# RUN ng serve  --configuration=production --host 0.0.0.0 --port 8080

# FROM nginx:latest

# COPY --from=build app/dist/frontend /usr/share/nginx/html

EXPOSE 8080

CMD ["sh", "-c", "ng serve  --configuration=production --host  0.0.0.0 --port 8080"]

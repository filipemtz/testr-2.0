
FROM ubuntu:24.04
RUN apt-get update && apt-get upgrade -y

RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install nodejs -y
RUN npm install -g @angular/cli@22.1.7

RUN apt-get install -y git vim tmux

RUN mkdir /app

WORKDIR /app

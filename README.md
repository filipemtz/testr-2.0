# testr-2.0

Refactor of Testr with modern technologies, software architecture, and development tools.

## Local Installation

The installation process was tested on Ubuntu 22.

For using docker when running the auto judge system, install docker by following the instructions in the respective section below in this documentation.

Setup postgresql. Instructions are based on this [tutorial](https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-django-application-on-ubuntu-20-04).

To install postgre in ubuntu, use:

```
sudo apt update
sudo apt install python3-pip python3-dev libpq-dev postgresql postgresql-contrib
```

To configure postgresql to be used with django, use (UPDATE 'password'):

```
>> sudo -u postgres psql
CREATE DATABASE testr;
CREATE USER testr_user WITH PASSWORD 'password';
ALTER ROLE testr_user SET client_encoding TO 'utf8';
ALTER ROLE testr_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE testr_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE testr TO testr_user;
\q
```

Add the database connection information in config.json.


Install node version manager (nvm):

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Close and reopen the terminal to use nvm.
Install the LTS version of nodejs (and npm, its package manager):

```
nvm install 20
```

Install angular:

```
npm install -g @angular/cli
```

Install the frontend dependencies:

```
cd frontend
npm i
```

Install the backend dependencies (it is recommended to [create a python virtual environment](https://docs.python.org/3/library/venv.html)):

```
cd ../backend
python -m pip install -r requirements.txt
```

## First Time Setup

Copy the `.env-sample` file to `.env` and edit variables according to your system.

Enter the backend folder, copy the `config-sample.yaml` file to `config.yaml`, and configure the judge by updating the fields in this file.

## Running the Application

To run the application, use the following command to build and start the services with Docker:

```
docker compose up --build
```

This command builds the Docker images and starts all necessary containers, allowing the application to run in a fully containerized environment.
To serve the front-end application for external access, replace the IP for the server public IP.

Para rodar o container judge em um terminal à parte e interagir com ele, você pode seguir os seguintes passos:

Iniciar o container em modo interativo: Use o comando ```docker-compose run``` com a opção ```--service-ports``` para iniciar o container em um terminal separado e permitir a interação com ele.

```
docker compose run --service-ports judge
```

Para executar todos os containers com exceção de um que você deseja rodar à parte, você pode usar a opção ```--scale``` do ```docker-compose up``` para definir a escala do serviço que você não quer iniciar como 0. Em seguida, você pode iniciar esse serviço separadamente.

```
docker compose up --scale judge=0
```

### Back-end Admin Interfaces

After running the backend service, the django admin interface is available at ```http://localhost:8000/admin```. The admin interface for the REST services can be accessed in ```http://localhost:8000```.

## Creating and Using Docker Images

To build the backend docker image, use:

```bash
docker build -t backend -f ./backend/Dockerfile ./backend
```

To build the frontend docker image, use:

```bash
docker build -t frontend -f ./frontend/Dockerfile ./frontend
```

After generating the images, you can start the system by running:

```bash
docker compose up
```

## Running the System without Docker

Make sure you have installed the dependencies locally.

In Ubuntu, run the frontend with:

```bash
NG_APP_API_URL=http://localhost:8000 ng serve --configuration=production --host 0.0.0.0 --port 8080
```

In Windows, run the frontend with:

```bash
set NG_APP_API_URL=http://localhost:8000
ng serve --configuration=production --host 0.0.0.0 --port 8080
```

Run the backend with:

```bash
python manage.py runserver 0.0.0.0:8000
```

Run the autojudge system with:

```bash
python manage.py judge --verbose
```

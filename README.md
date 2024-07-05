# testr-2.0

Refactor of Testr with modern technologies, software architecture, and development tools.

## Manual Installation

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

Copy the `config-sample.yaml` file to `config.yaml` and edit variables according to your system.

Create the django database:

```
cd backend
python manage.py migrate
```

Create a admin superuser:

```
python manage.py createsuperuser
```

Set permissions:

```
python manage.py setperms permissions.json
```

## Running the Application

### Front-end

To serve the front-end application in a local network:

```
cd frontend
ng serve  --configuration=production --host 0.0.0.0 --port 8080
```

To serve the front-end application for external access, replace the IP for the server public IP.

### Back-end

To serve the back-end application locally:

```
cd backend
python manage.py runserver 0.0.0.0:8000
```

To expose the API for external access, replace the IP by a public IP. In most cases, this is not necessary or recommended.



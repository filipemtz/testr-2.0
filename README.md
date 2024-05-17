# testr-2.0

Refactor of Testr with modern technologies, software architecture, and development tools.

## Manual Installation

The installation process was tested on Ubuntu 22.

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

Install the backend dependencies (it is recommended to [create a python virtual environment](https://docs.python.org/3/library/venv.html)):

```
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

## Running the Application

### Front-end

To serve the front-end application in a local network:

```
cd frontend
ng serve 0.0.0.0:8080
```

To serve the front-end application for external access, replace the IP for the server public IP.

### Back-end

To serve the back-end application locally:

```
cd backend
python manage.py runserver 127.0.0.1:8000
```

To expose the API for external access, replace the IP by a public IP. In most cases, this is not necessary or recommended.



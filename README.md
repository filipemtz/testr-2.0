# testr-2.0

Refactor of Testr with modern technologies, software architecture, and development tools.

## Installation

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

### Back-end Admin Interfaces

After running the backend service, the django admin interface is available at ```http://localhost:8000/admin```. The admin interface for the REST services can be accessed in ```http://localhost:8000```.

## Creating and Using Docker Images

If you prefer to use the Docker images from the repository instead of running `docker-compose up --build`, follow the instructions below:

### 1. Create Docker Images (optional)

To build the Docker images, use the `build_and_save_images.sh` script. This script builds the backend, frontend, and judge images and saves them as `.tar` files. Run the script with the following command:

```bash
./build_and_save_images.sh
```
Make sure that the `backend.tar`, `frontend.tar`, and `judge.tar` files are generated in the `docker-images` directory.

If you encounter a permission error while running the script, you may need to add execute permissions. To do this, run:

```bash
sudo chmod +x build_and_save_images.sh load_and_run_containers.sh
```
### 2. Using the Created Docker Images

After generating the images, you can load them into Docker using the script below. This script loads the saved images and starts the services with `./load_and_run_containers.sh`.





import sys
from pathlib import Path
import yaml

from backend.utils.io import safe_load_yaml

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Path to the config file
CONFIG_FILE = BASE_DIR.parent.joinpath("config.yaml")
config_data = safe_load_yaml(CONFIG_FILE)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config_data['backend']['secret_key']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config_data['backend']['debug']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # new apps
    'rest_framework',
    'rest_framework.authtoken',
    'backend.apps.BackendConfig',
    'accounts.apps.AccountsConfig',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'global.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'global.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DB_BACKENDS = {
    "sqlite": "django.db.backends.sqlite3",
    "postgresql": "django.db.backends.postgresql",
}

if config_data['db']['type'] not in DB_BACKENDS:
    raise ValueError(f"Invalid database type \"{config_data['db']['type']}\".")

DATABASES = {
    'default': {
        'ENGINE': DB_BACKENDS[config_data['db']['type']],
        'NAME': config_data['db']['name'],
        'USER': config_data['db']['user'],
        'PASSWORD': config_data['db']['password'],
        'HOST': config_data['db']['host'],
        'PORT': config_data['db']['port'],
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/
LANGUAGE_CODE = config_data['backend']['language_code']
TIME_ZONE = config_data['backend']['time_zone']
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django Rest Settings

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# CORS Settings
CORS_ALLOW_CREDENTIALS = True

ALLOWED_HOSTS = ["0.0.0.0", "127.0.0.1", "localhost"]
if config_data['frontend']['host']:
    ALLOWED_HOSTS.append(config_data['frontend']['host'])

CORS_ALLOWED_ORIGINS = []
for host in ALLOWED_HOSTS:
    CORS_ALLOWED_ORIGINS.append(f"http://{host}:{config_data['frontend']['port']}")

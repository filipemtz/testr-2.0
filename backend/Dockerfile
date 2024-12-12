FROM python:3.11-slim

# Set environment variables
WORKDIR /app

COPY requirements.txt ./

# Install dependencies
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "python manage.py setup && python manage.py runserver 0.0.0.0:8000"]



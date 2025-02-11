FROM python:3.11-slim

# Set environment variables
WORKDIR /app

COPY requirements.txt ./

COPY . .

# Install dependencies and setup the database
RUN python -m pip install --no-cache-dir -r requirements.txt && \
    apt-get update && apt-get install -y \
    build-essential gcc make curl && \
    apt-get clean

# Expose the port
EXPOSE 8000

#!/bin/bash

# Diretório para salvar as imagens
IMAGE_DIR="docker-images"

# Criar o diretório se não existir
mkdir -p "$IMAGE_DIR"

# Buildar imagens do docker-compose
echo "Building Docker images..."
docker-compose build

# Salvar as imagens no diretório
echo "Saving images to $IMAGE_DIR..."
docker save testr-20-backend:latest -o "$IMAGE_DIR/backend.tar"
docker save testr-20-frontend:latest -o "$IMAGE_DIR/frontend.tar"
docker save testr-20-judge:latest -o "$IMAGE_DIR/judge.tar"

echo "Docker images saved successfully."

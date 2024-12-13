#!/bin/bash

# Diretório onde as imagens estão salvas
IMAGE_DIR="docker-images"

# Verificar se os arquivos das imagens existem
if [ ! -f "$IMAGE_DIR/backend.tar" ] || [ ! -f "$IMAGE_DIR/frontend.tar" ] || [ ! -f "$IMAGE_DIR/judge.tar" ]; then
  echo "One or more image files are missing in $IMAGE_DIR. Please run the build_and_save_images.sh script first."
  exit 1
fi

# Carregar as imagens salvas
echo "Loading Docker images..."
docker load -i "$IMAGE_DIR/backend.tar"
docker load -i "$IMAGE_DIR/frontend.tar"
docker load -i "$IMAGE_DIR/judge.tar"

# Subir os serviços com docker-compose
echo "Starting services with docker-compose..."
docker compose up

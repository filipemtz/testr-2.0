#!/usr/bin/env bash

set -euo pipefail

echo "Installing Docker Engine..."

# Check that we are running as root
if [[ $EUID -ne 0 ]]; then
    echo "Please run this script with sudo:"
    echo "  sudo ./install-docker.sh"
    exit 1
fi

# Check Ubuntu
if [[ ! -f /etc/os-release ]]; then
    echo "Cannot determine the Linux distribution."
    exit 1
fi

source /etc/os-release

if [[ "${ID}" != "ubuntu" ]]; then
    echo "This script currently supports Ubuntu only."
    echo "Detected: ${ID}"
    exit 1
fi

# Install prerequisites
apt update
apt install -y ca-certificates curl

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
cat > /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: ${UBUNTU_CODENAME:-$VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# Install Docker
apt update

apt install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

# Enable systemd if WSL supports it
if [[ -d /run/systemd/system ]]; then
    systemctl enable docker
    systemctl start docker
else
    echo
    echo "systemd is not enabled in this WSL distribution."
    echo "Docker will need to be started manually with:"
    echo "  sudo service docker start"
fi

# Allow the current user to use Docker without sudo.
# SUDO_USER is set when the script is invoked with sudo.
if [[ -n "${SUDO_USER:-}" && "${SUDO_USER}" != "root" ]]; then
    usermod -aG docker "$SUDO_USER"
    echo
    echo "Added ${SUDO_USER} to the docker group."
    echo "Restart WSL before using Docker without sudo."
fi

echo
echo "Docker installation completed."
echo
docker --version || true
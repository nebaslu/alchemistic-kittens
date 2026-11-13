#!/usr/bin/env bash
set -euo pipefail

IMAGE="alchemistic-kittens:latest"
PORT="${PORT:-8080}"
BIND="${BIND:-127.0.0.1}"

cd "$(dirname "$0")"

podman build -t "$IMAGE" .

if [ "${1:-run}" = "build" ]; then
  echo "Imagen $IMAGE lista. Para servirla: ./run.sh  (o PORT=3000 ./run.sh)"
  exit 0
fi

echo "Sirviendo el juego en http://localhost:${PORT}  (Ctrl+C para detener)"
podman run --rm -p "127.0.0.1:${PORT}:8080" "$IMAGE"

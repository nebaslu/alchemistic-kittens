#!/usr/bin/env bash
set -euo pipefail

IMAGE="alchemistic-kittens:latest"
PORT="${PORT:-8080}"
BIND="${BIND:-127.0.0.1}"

cd "$(dirname "$0")"

BUILD_ARGS=()
for v in HTTP_PROXY HTTPS_PROXY http_proxy https_proxy NPM_CONFIG_REGISTRY; do
  if [ -n "${!v:-}" ]; then
    BUILD_ARGS+=(--build-arg "$v=${!v}")
  fi
done

docker build "${BUILD_ARGS[@]}" -t "$IMAGE" .

if [ "${1:-run}" = "build" ]; then
  echo "Imagen $IMAGE lista. Para servirla: ./run.sh  (o PORT=3000 ./run.sh)"
  exit 0
fi

echo "Sirviendo el juego en http://localhost:${PORT}  (Ctrl+C para detener)"
if [ "$BIND" != "127.0.0.1" ]; then
  IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  echo "Acceso desde otros dispositivos de tu red (misma WiFi): http://${IP:-<tu-ip-local>}:${PORT}"
  echo "AVISO: solo en redes de confianza; no abras este puerto en el router hacia Internet."
fi
docker run --rm -p "${BIND}:${PORT}:8080" "$IMAGE"

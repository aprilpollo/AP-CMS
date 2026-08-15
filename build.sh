#!/bin/bash
# Build and deployment script for Application

GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
PLATFORM="${PLATFORM:-linux/amd64}"
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
IMAGE_NAME="${IMAGE_NAME:-aprilpollo/ap-cms-api}"
IMAGE_TAG="${STAGING_TAG:-ap-$(date +%Y%m%d)}"

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status()   { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning()  { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error()    { echo -e "${RED}[ERROR]${NC} $1"; }
print_debug()    { echo -e "${BLUE}[DEBUG]${NC} $1"; }

# ---- Prerequisites ----
if ! command -v docker &>/dev/null; then
  print_error "Docker is not installed. Please install Docker first."
  exit 1
fi

# Detect Compose command (v2 plugin preferred, then v1 binary)
if docker compose version &>/dev/null; then
  COMPOSE="docker compose"
  print_debug "Using Docker Compose v2 (plugin)"
elif command -v docker-compose &>/dev/null; then
  COMPOSE="docker-compose"
  print_debug "Using Docker Compose v1 (binary)"
else
  print_error "Docker Compose is not installed. Install either 'docker compose' (v2) or 'docker-compose' (v1)."
  exit 1
fi

# ---- Paths ----
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &>/dev/null && pwd )"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker/docker-compose.yml"
DOCKERFILE_API="docker/Dockerfile.api"

if [ ! -f "$COMPOSE_FILE" ]; then
  print_error "Compose file not found at: $COMPOSE_FILE"
  exit 1
fi

dc() { $COMPOSE -f "$COMPOSE_FILE" "$@"; }

# ---- Build ----
build() {
  local service="${1:-}"
  if [ -n "$service" ]; then
    print_status "Building $service (tag: $IMAGE_TAG)..."
    dc build "$service"
  else
    print_status "Building all images (tag: $IMAGE_TAG)..."
    dc build
  fi
  print_status "Build completed."
}

build_push() {
  local full_image="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
  local sha_image="${REGISTRY}/${IMAGE_NAME}:${GIT_SHA}"
  local latest_image="${REGISTRY}/${IMAGE_NAME}:latest"

  print_status "Building & pushing: $full_image"
  print_debug "Platform: $PLATFORM"

  DOCKER_BUILDKIT=1 docker build \
    -f "$DOCKERFILE_API" \
    -t "$full_image" \
    -t "$sha_image" \
    -t "$latest_image" \
    --platform "$PLATFORM" \
    . \
    --push

  print_status "Pushed: $full_image"
  print_status "Pushed: $sha_image"
  print_status "Pushed: $latest_image"
}

# ---- Runtime ----
start() {
  local service="${1:-}"
  if [ -n "$service" ]; then
    print_status "Starting $service..."
    dc up -d "$service"
  else
    print_status "Starting all services..."
    dc up -d
  fi
  dc ps
}

stop() {
  local service="${1:-}"
  if [ -n "$service" ]; then
    print_status "Stopping $service..."
    dc stop "$service"
  else
    print_status "Stopping all services..."
    dc down
  fi
}

restart() {
  local service="${1:-}"
  if [ -n "$service" ]; then
    print_status "Restarting $service..."
    dc restart "$service"
  else
    print_status "Restarting all services..."
    dc down
    dc up -d
  fi
}

deploy() {
  print_status "Rebuilding and restarting..."
  dc up -d --build
  dc ps
}

logs() {
  local service="${1:-}"
  if [ -n "$service" ]; then
    dc logs -f --tail=100 "$service"
  else
    dc logs -f --tail=100
  fi
}

status() { dc ps; }

shell() {
  local service="${1:-api}"
  print_status "Opening shell in $service..."
  dc exec "$service" sh
}

# ---- Database ----
migrate() {
  local seed="${1:-seed.json}"
  print_status "Running migration with seed: $seed"
  dc exec api ./migrate "$seed"
  print_status "Migration completed."
}

psql() {
  print_status "Opening psql on postgres..."
  dc exec postgres psql -U apcms -d apcms
}

# ---- Cleanup ----
clean() {
  print_warning "This removes all containers AND volumes (postgres/redis data will be lost)."
  read -r -p "Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    print_status "Aborted."
    return 0
  fi
  dc down -v --remove-orphans
  print_status "Cleaned up."
}

# ---- Help ----
help() {
  echo ""
  echo -e "${BLUE}AP-CMS - Docker Management Script${NC}"
  echo ""
  echo -e "${YELLOW}Usage:${NC} $0 [COMMAND] [OPTIONS]"
  echo ""
  echo -e "${BLUE}Current Configuration:${NC}"
  echo "  Registry: ${REGISTRY}"
  echo "  Image:    ${IMAGE_NAME}"
  echo "  Tag:      ${IMAGE_TAG}"
  echo "  Platform: ${PLATFORM}"
  echo "  Git SHA:  ${GIT_SHA}"
  echo ""
  echo -e "${YELLOW}Build:${NC}"
  echo "  build [service]        - Build images via Compose"
  echo "  push                   - Build API image and push to registry"
  echo "  tag <tag>              - Build and push with a specific tag"
  echo ""
  echo -e "${YELLOW}Runtime:${NC}"
  echo "  start [service]        - Start services in background"
  echo "  stop [service]         - Stop services (down when no service given)"
  echo "  restart [service]      - Restart services"
  echo "  deploy                 - Rebuild images and restart services"
  echo "  logs [service]         - Follow logs (last 100 lines)"
  echo "  status                 - Show container status"
  echo "  shell [service]        - Open a shell inside a container (default: api)"
  echo ""
  echo -e "${YELLOW}Database:${NC}"
  echo "  migrate [seed.json]    - Run migration/seed inside the api container"
  echo "  psql                   - Open psql session on postgres"
  echo ""
  echo -e "${YELLOW}Cleanup:${NC}"
  echo "  clean                  - Remove containers and volumes (destructive)"
  echo ""
  echo -e "${YELLOW}Services:${NC} api, postgres, redis, mail, minio"
  echo ""
}

# ---- Main ----
command="${1:-}"
shift || true

case "$command" in
  build)   build "${1:-}";;
  push)    build_push;;
  tag)
    if [ -n "${1:-}" ]; then IMAGE_TAG="$1"; shift; fi
    build_push;;
  start|up)     start "${1:-}";;
  stop|down)    stop "${1:-}";;
  restart)      restart "${1:-}";;
  deploy)       deploy;;
  logs)         logs "${1:-}";;
  status|ps)    status;;
  shell|exec)   shell "${1:-api}";;
  migrate|seed) migrate "${1:-seed.json}";;
  psql)         psql;;
  clean)        clean;;
  help|"")      help;;
  *)
    print_error "Unknown command: $command"
    help
    exit 1;;
esac

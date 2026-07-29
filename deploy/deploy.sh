#!/usr/bin/env bash

# ══════════════════════════════════════════════════════════════════════════════
#  DevDuel — One-Click VPS Automated Deployment Script
#  Author: Niraj Mahto <itsnirajmahto@gmail.com> (Backend & Infra Lead)
# ══════════════════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}    ⚔️  DevDuel VPS Deployment Engine           ${NC}"
echo -e "${BLUE}====================================================${NC}\n"

# 1. Verify Prerequisites
echo -e "${YELLOW}[1/5] Checking environment dependencies...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: Docker is not installed.${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo -e "${RED}Error: Docker Compose is not installed.${NC}"; exit 1; }

# 2. Setup Environment Variables
echo -e "${YELLOW}[2/5] Setting up environment variables...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.production ]; then
    cp .env.production .env
    echo -e "${GREEN}Copied .env.production to .env${NC}"
  elif [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}Copied .env.example to .env${NC}"
  else
    echo -e "${RED}Error: No .env file found. Please create a .env file before deploying.${NC}"
    exit 1
  fi
fi

# 3. Build & Launch Docker Containers
echo -e "${YELLOW}[3/5] Building and launching Docker services...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 4. Execute Database Migrations & Seeds
echo -e "${YELLOW}[4/5] Running database migrations and loading seeds...${NC}"
echo "Waiting for PostgreSQL to be ready..."
sleep 5

docker-compose -f docker-compose.prod.yml exec -T server npm run migrate
docker-compose -f docker-compose.prod.yml exec -T server npm run seed

# 5. Verify Health Status
echo -e "${YELLOW}[5/5] Verifying API server health...${NC}"
sleep 3

if docker-compose -f docker-compose.prod.yml exec -T server wget --no-verbose --tries=1 --spider http://localhost:5000/api/health; then
  echo -e "\n${GREEN}====================================================${NC}"
  echo -e "${GREEN}   🚀 DevDuel Backend successfully deployed on VPS! ${NC}"
  echo -e "${GREEN}====================================================${NC}\n"
else
  echo -e "${RED}Warning: Health check did not return OK immediately. Check logs with 'docker-compose -f docker-compose.prod.yml logs'${NC}"
fi

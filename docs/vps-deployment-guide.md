# DevDuel — VPS Deployment Guide

This guide provides step-by-step instructions to deploy **DevDuel** on any Virtual Private Server (VPS) running Ubuntu 20.04 / 22.04 / 24.04 (DigitalOcean, AWS EC2, Hetzner, Vultr, Linode).

---

## 📋 Prerequisites

1. A VPS with at least **2 GB RAM** (4 GB recommended for Judge0 compiler sandbox).
2. A domain name pointed to your VPS IP address (`A` records for `yourdomain.com` and `api.yourdomain.com`).
3. SSH access to your VPS.

---

## 🚀 Step 1: Initial VPS Server Setup

SSH into your VPS as `root` or a user with `sudo` privileges:

```bash
ssh root@<your_vps_ip>
```

Update packages and install core tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw certbot python3-certbot-nginx
```

---

## 🐳 Step 2: Install Docker & Docker Compose

Install Docker Engine:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
```

Verify Docker installation:

```bash
docker --version
docker compose version
```

---

## 🔒 Step 3: Configure Firewall (UFW)

Allow SSH, HTTP, and HTTPS ports:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📥 Step 4: Clone Repository & Configure Environment

Clone the DevDuel repository to `/var/www/devduel`:

```bash
sudo mkdir -p /var/www
cd /var/www
git clone https://github.com/nirajmahto1/devduel.git
cd devduel
```

Create production environment configuration:

```bash
cp .env.production.example .env
nano .env
```

> **Important**: Update `JWT_SECRET`, `DB_PASSWORD`, `CLIENT_URL`, and OAuth credentials in `.env`.

---

## ⚡ Step 5: One-Click Automated Deployment

Make `deploy.sh` executable and run it:

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

This will automatically:
1. Validate system prerequisites.
2. Build and launch all production Docker containers (Postgres, Redis, Express API, Nginx).
3. Run database migrations (`knex migrate:latest`).
4. Load starter problem seeds (`knex seed:run`).
5. Verify system health.

---

## 🔐 Step 6: SSL / TLS Certificate Setup (Certbot)

To enable free HTTPS / SSL with Let's Encrypt:

```bash
sudo certbot --nginx -d devduel.com -d www.devduel.com
```

Certbot will automatically configure Nginx with SSL certificates and set up automatic renewal via cron (`certbot renew --dry-run`).

---

## 📊 Useful Operations & Management Commands

### Check container logs
```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

### Restart all services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Run database migration manually
```bash
docker-compose -f docker-compose.prod.yml exec server npm run migrate
```

### Run seed script manually
```bash
docker-compose -f docker-compose.prod.yml exec server npm run seed
```

### Server Health Check
```bash
curl http://localhost:5000/api/health
```

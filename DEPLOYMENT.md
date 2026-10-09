# Deployment Guide: MedQueue

This document describes how to deploy MedQueue to production with custom domain setup, TLS/HTTPS, DNS records, and environment variables.

---

## 1. Prerequisites

- Node.js 18.x or 20.x+ (or 24.x LTS)
- A domain name (e.g. `hospital-queue.example.org`)
- A production PostgreSQL or SQLite volume instance
- A deployment target (e.g., Vercel, Railway, AWS ECS, VPS with PM2/Docker)

---

## 2. Environment Variables

Create your production environment file (or enter in your hosting platform dashboard):

```bash
# Database connection string
DATABASE_URL="file:./prod.db" # or postgresql://user:password@host:5432/medqueue

# NextAuth secret (generate via `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-secure-random-32-byte-secret"
NEXTAUTH_URL="https://hospital-queue.example.org"

# Public site domain URL used for canonical headers, Open Graph, and sitemap
NEXT_PUBLIC_SITE_URL="https://hospital-queue.example.org"

# Node environment
NODE_ENV="production"
```

---

## 3. Database Migration and Seeding

Before serving traffic, prepare the database:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push or migrate schema
npx prisma db push

# 3. Seed initial users, ward hierarchy, and sample records
npm run db:seed
```

---

## 4. Building and Starting

Run the production build:

```bash
npm run build
npm start
```

The application listens on port `3000` by default.

---

## 5. Domain & DNS Configuration

To point your custom domain (e.g. `hospital-queue.example.org`) to your server:

### A Record (Apex domain):
- **Host / Name**: `@`
- **Type**: `A`
- **Value**: `YOUR_SERVER_IP`
- **TTL**: `300` (or Automatic)

### CNAME Record (Subdomain):
- **Host / Name**: `hospital-queue`
- **Type**: `CNAME`
- **Value**: `cname.your-hosting-provider.com` (or server hostname)
- **TTL**: `300`

---

## 6. Reverse Proxy and HTTPS (Nginx & Certbot)

For deployment on a dedicated VPS / cloud virtual machine:

### Nginx Configuration (`/etc/nginx/sites-available/medqueue`):

```nginx
server {
    server_name hospital-queue.example.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable HTTPS with Let's Encrypt:

```bash
sudo certbot --nginx -d hospital-queue.example.org
```

Certbot automatically configures TLS certificates, sets up automatic 90-day renewal timers, and redirects HTTP to HTTPS.

---

## 7. Security Best Practices

1. **Passwords**: All staff accounts use salted `bcryptjs` password hashing.
2. **Session Cookies**: Encrypted JWTs stored with `httpOnly`, `sameSite=lax`, and `secure` in production.
3. **Role Enforcement**: Every API endpoint validates credentials and permissions before processing queries.
4. **Data Isolation**: Simulated data is explicitly flagged with `isSimulation: true` and excluded from operational queues and reports.

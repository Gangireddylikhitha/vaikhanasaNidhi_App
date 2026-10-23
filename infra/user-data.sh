#!/bin/bash
set -e

# 1. Setup 2GB Swap space to prevent out-of-memory during npm installs on micro instance
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 2. Update and install base packages
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx ca-certificates gnupg

# 3. Install Node.js 22 LTS
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=22
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install -y nodejs

# 4. Install PM2 globally
npm install -g pm2

# Setup PM2 startup for ubuntu user
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
systemctl enable pm2-ubuntu

# 5. Configure Nginx reverse proxy
cat << 'EOF' > /etc/nginx/sites-available/vaikhanasa
server {
    listen 80;
    server_name api.vaikhanasanidhi.com;

    client_max_body_size 130M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
EOF

# Enable Nginx config and remove default
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/vaikhanasa /etc/nginx/sites-enabled/vaikhanasa
nginx -t && systemctl reload nginx

# 6. Configure UFW firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable || true

# Signal completion
echo "Vaikhanasa server initialization completed successfully at $(date)" > /var/log/vaikhanasa-init.done

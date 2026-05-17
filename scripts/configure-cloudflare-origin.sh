#!/bin/bash
set -euo pipefail

REALIP_SNIPPET="/etc/nginx/snippets/cloudflare-realip.conf"
TMP_V4="$(mktemp)"
TMP_V6="$(mktemp)"

cleanup() {
  rm -f "$TMP_V4" "$TMP_V6"
}
trap cleanup EXIT

curl -fsSL https://www.cloudflare.com/ips-v4 -o "$TMP_V4"
curl -fsSL https://www.cloudflare.com/ips-v6 -o "$TMP_V6"

install -d -m 755 /etc/nginx/snippets
{
  echo "# Managed by scripts/configure-cloudflare-origin.sh"
  while read -r cidr; do
    [ -n "$cidr" ] && echo "set_real_ip_from $cidr;"
  done < "$TMP_V4"
  while read -r cidr; do
    [ -n "$cidr" ] && echo "set_real_ip_from $cidr;"
  done < "$TMP_V6"
  echo "real_ip_header CF-Connecting-IP;"
} > "$REALIP_SNIPPET"

ufw allow OpenSSH
ufw --force enable

while read -r cidr; do
  [ -n "$cidr" ] && ufw allow proto tcp from "$cidr" to any port 80,443 comment "Cloudflare IPv4"
done < "$TMP_V4"

while read -r cidr; do
  [ -n "$cidr" ] && ufw allow proto tcp from "$cidr" to any port 80,443 comment "Cloudflare IPv6"
done < "$TMP_V6"

ufw deny 80/tcp
ufw deny 443/tcp

nginx -t
systemctl reload nginx

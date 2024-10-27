#!/bin/bash

# Paths to source files
NGINX_CONF_SOURCE="nginx/nginx.conf"  # Change this to your actual nginx.conf source path
MAINTENANCE_HTML_SOURCE="nginx/maintenance.html"  # Change this to your actual maintenance.html source path

# Destination paths
NGINX_CONF_DEST="/etc/nginx/nginx.conf"
MAINTENANCE_HTML_DEST="/usr/share/nginx/html/maintenance.html"

# Copy nginx.conf to the destination
if cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_DEST"; then
    echo "Successfully copied nginx.conf to $NGINX_CONF_DEST"
else
    echo "Failed to copy nginx.conf to $NGINX_CONF_DEST" >&2
fi

# Copy maintenance.html to the destination
if cp "$MAINTENANCE_HTML_SOURCE" "$MAINTENANCE_HTML_DEST"; then
    echo "Successfully copied maintenance.html to $MAINTENANCE_HTML_DEST"
else
    echo "Failed to copy maintenance.html to $MAINTENANCE_HTML_DEST" >&2
fi

# Reload Nginx to apply changes
if systemctl reload nginx; then
    echo "Nginx reloaded successfully."
else
    echo "Failed to reload Nginx." >&2
fi

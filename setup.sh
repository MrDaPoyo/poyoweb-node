
# Source paths - Change these to your actual source paths
NGINX_CONF_SOURCE="nginx/nginx.conf"
MAINTENANCE_HTML_SOURCE="nginx/maintenance.html"
CARL_HELMET_SOURCE="public/logos/carl-helmet.png"

# Destination paths
NGINX_CONF_DEST="/etc/nginx/nginx.conf"
MAINTENANCE_HTML_DEST="/usr/share/nginx/html/maintenance.html"
CARL_HELMET_DEST="/usr/share/nginx/html/images/carl-helmet.png"
IMAGES_DIR="/usr/share/nginx/html/images"  # Removed space before '='

# Create the images directory if it doesn't exist
sudo mkdir -p "$IMAGES_DIR"  # Added -p to prevent error if it already exists

# Copy the image to the images directory
if sudo cp "$CARL_HELMET_SOURCE" "$CARL_HELMET_DEST"; then  # Specify destination for the image
    echo "Successfully copied carl-helmet.png to $CARL_HELMET_DEST"
else
    echo "Failed to copy carl-helmet.png to $CARL_HELMET_DEST" >&2
fi

# Copy nginx.conf to the destination
if sudo cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_DEST"; then
    echo "Successfully copied nginx.conf to $NGINX_CONF_DEST"
else
    echo "Failed to copy nginx.conf to $NGINX_CONF_DEST" >&2
fi

# Copy maintenance.html to the destination
if sudo cp "$MAINTENANCE_HTML_SOURCE" "$MAINTENANCE_HTML_DEST"; then
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

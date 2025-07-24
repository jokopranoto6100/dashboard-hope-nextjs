#!/bin/bash

# Script untuk generate PWA icons dari logo yang sudah ada
# Membutuhkan ImageMagick (brew install imagemagick)

SOURCE_ICON="/Users/jokopranoto/Documents/Project/dashboard-hope-nextjs/public/icon/hope.png"
ICON_DIR="/Users/jokopranoto/Documents/Project/dashboard-hope-nextjs/public/icon"

# Pastikan direktori ada
mkdir -p "$ICON_DIR"

echo "Generating PWA icons..."

# Generate berbagai ukuran icon
convert "$SOURCE_ICON" -resize 72x72 "$ICON_DIR/icon-72x72.png"
convert "$SOURCE_ICON" -resize 96x96 "$ICON_DIR/icon-96x96.png" 
convert "$SOURCE_ICON" -resize 128x128 "$ICON_DIR/icon-128x128.png"
convert "$SOURCE_ICON" -resize 144x144 "$ICON_DIR/icon-144x144.png"
convert "$SOURCE_ICON" -resize 152x152 "$ICON_DIR/icon-152x152.png"
convert "$SOURCE_ICON" -resize 192x192 "$ICON_DIR/icon-192x192.png"
convert "$SOURCE_ICON" -resize 384x384 "$ICON_DIR/icon-384x384.png"
convert "$SOURCE_ICON" -resize 512x512 "$ICON_DIR/icon-512x512.png"

echo "Icons generated successfully!"
echo "Files created:"
ls -la "$ICON_DIR"/icon-*.png

#!/usr/bin/env bash
set -e

SRC="src/assets/images/dailyz_app_icon_1791446746548.jpg"

if [ ! -f "$SRC" ]; then
  echo "Source file $SRC does not exist"
  exit 1
fi

echo "Generating public icons..."
mkdir -p public
convert "$SRC" -resize 512x512 public/icon.png
convert "$SRC" -resize 192x192 public/icon-192.png
convert "$SRC" -resize 64x64 public/favicon.ico

# Function to generate icons for a mipmap folder
# args: dir icon_size fg_size
gen_mipmap() {
  local DIR="$1"
  local S="$2"
  local FG="$3"
  
  echo "Processing $DIR (icon: ${S}x${S}, fg: ${FG}x${FG})..."
  mkdir -p "$DIR"
  
  # Standard launcher icon
  convert "$SRC" -resize "${S}x${S}" "$DIR/ic_launcher.png"
  
  # Round launcher icon
  local R=$(($S / 2))
  convert "$SRC" -resize "${S}x${S}" \
    \( -size "${S}x${S}" xc:none -fill white -draw "circle $R,$R $R,0" \) \
    -alpha set -compose DstIn -composite "$DIR/ic_launcher_round.png"

  # Foreground (padded in center of transparent FGxFG canvas)
  local INNER_SIZE=$(($FG * 72 / 108))
  convert -size "${FG}x${FG}" xc:none \
    \( "$SRC" -resize "${INNER_SIZE}x${INNER_SIZE}" \) \
    -gravity center -composite "$DIR/ic_launcher_foreground.png"

  # Monochrome foreground (white silhouette on transparent)
  convert "$DIR/ic_launcher_foreground.png" \
    -alpha extract \
    -background white \
    -alpha shape \
    "$DIR/ic_launcher_monochrome.png"
}

gen_mipmap "android/app/src/main/res/mipmap-mdpi" 48 108
gen_mipmap "android/app/src/main/res/mipmap-hdpi" 72 162
gen_mipmap "android/app/src/main/res/mipmap-xhdpi" 96 216
gen_mipmap "android/app/src/main/res/mipmap-xxhdpi" 144 324
gen_mipmap "android/app/src/main/res/mipmap-xxxhdpi" 192 432

echo "Mipmap icons generated successfully!"

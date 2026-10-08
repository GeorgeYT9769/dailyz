#!/usr/bin/env bash
set -e

SRC="src/assets/images/dailyz_app_icon_1791446746548.jpg"

gen_splash() {
  local FILE="$1"
  local W="$2"
  local H="$3"
  local MIN_DIM=$(( W < H ? W : H ))
  local ICON_SIZE=$(( MIN_DIM / 4 ))
  if [ $ICON_SIZE -lt 64 ]; then ICON_SIZE=64; fi
  if [ $ICON_SIZE -gt 256 ]; then ICON_SIZE=256; fi
  local TITLE_SIZE=$(( ICON_SIZE / 4 ))
  if [ $TITLE_SIZE -lt 16 ]; then TITLE_SIZE=16; fi
  local VER_SIZE=$(( TITLE_SIZE * 3 / 5 ))
  if [ $VER_SIZE -lt 11 ]; then VER_SIZE=11; fi

  mkdir -p "$(dirname "$FILE")"

  # Create badge icon with rounded corners
  convert "$SRC" -resize "${ICON_SIZE}x${ICON_SIZE}" \
    \( -size "${ICON_SIZE}x${ICON_SIZE}" xc:none -fill white -draw "roundrectangle 0,0,${ICON_SIZE},${ICON_SIZE},$(($ICON_SIZE/6)),$(($ICON_SIZE/6))" \) \
    -alpha set -compose DstIn -composite /tmp/splash_icon.png

  # Create base canvas with background color #111827
  convert -size "${W}x${H}" xc:'#111827' \
    /tmp/splash_icon.png -gravity center -geometry "+0-$((TITLE_SIZE + VER_SIZE + 20))" -composite \
    -gravity center -pointsize "$TITLE_SIZE" -fill white -annotate "+0+$((ICON_SIZE/2 + 5))" "Dailyz" \
    -gravity center -pointsize "$VER_SIZE" -fill '#9CA3AF' -annotate "+0+$((ICON_SIZE/2 + TITLE_SIZE + 15))" "v1.0.0" \
    "$FILE"
}

echo "Generating native Android splash screens..."
gen_splash "android/app/src/main/res/drawable/splash.png" 480 800
gen_splash "android/app/src/main/res/drawable-port-mdpi/splash.png" 320 480
gen_splash "android/app/src/main/res/drawable-port-hdpi/splash.png" 480 800
gen_splash "android/app/src/main/res/drawable-port-xhdpi/splash.png" 720 1280
gen_splash "android/app/src/main/res/drawable-port-xxhdpi/splash.png" 960 1600
gen_splash "android/app/src/main/res/drawable-port-xxxhdpi/splash.png" 1280 1920

gen_splash "android/app/src/main/res/drawable-land-mdpi/splash.png" 480 320
gen_splash "android/app/src/main/res/drawable-land-hdpi/splash.png" 800 480
gen_splash "android/app/src/main/res/drawable-land-xhdpi/splash.png" 1280 720
gen_splash "android/app/src/main/res/drawable-land-xxhdpi/splash.png" 1600 960
gen_splash "android/app/src/main/res/drawable-land-xxxhdpi/splash.png" 1920 1280

echo "Splash screens generated successfully!"

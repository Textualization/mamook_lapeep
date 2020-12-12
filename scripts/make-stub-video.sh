#!/usr/bin/env bash

TMP=`mktemp`;
cat > $TMP
cat $TMP
cat $TMP | text2wave > $1.tmp.wav
sox $1.tmp.wav $1.tmp.wav $1.tmp.wav $1.tmp.wav $1.wav
convert -size 320x240 'gradient:grey-white' -font "helvetica" -pointsize 20 -annotate +0+100 "`cat $TMP`" $1.png
ffmpeg -loop 1 -y -i $1.png -i $1.wav -shortest -vcodec libx264 -pix_fmt yuv420p -acodec aac $1.mp4
rm $1.tmp.wav
rm $1.wav
rm $1.png
rm $TMP

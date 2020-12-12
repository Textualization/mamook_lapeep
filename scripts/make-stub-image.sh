#!/usr/bin/env bash

TMP=`mktemp`;
cat > $TMP
convert -size 320x240 'gradient:grey-white' -font "helvetica" -pointsize 20 -annotate +0+100 "`cat $TMP`" $1
rm $TMP

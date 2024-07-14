#!/usr/bin env bash
# yoink files thru ytdlp

link=""
read -p "Paste the link: " link
yt-dlp -x --audio-format mp3 $link
rm *.webm

#!/bin/bash

# Directory containing your MP3 files
input_dir="."
# Output volume increase factor
volume_factor=3

# Loop through all MP3 files in the directory
for input_file in "$input_dir"/*.mp3; do
  # Extract the base name without extension
  base_name=$(basename "$input_file" .mp3)
  # Create the output file name
  output_file="$input_dir/${base_name}${volume_factor}.mp3"
  # Increase the volume using ffmpeg
  ffmpeg -i "$input_file" -filter:a "volume=${volume_factor}" "$output_file"
done

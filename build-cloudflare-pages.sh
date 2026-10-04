#!/usr/bin/env bash
set -euo pipefail

# Keep the published Pages artifact to the portfolio site itself. The source
# repository also contains an uploaded archive of design working files.
output_dir="dist"
rm -rf -- "$output_dir"
mkdir -p -- "$output_dir"

cp -- ./*.html ./*.css ./*.js "$output_dir/"
cp -R -- assets research-assets "$output_dir/"
touch "$output_dir/.nojekyll"

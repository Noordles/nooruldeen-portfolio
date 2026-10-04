#!/usr/bin/env bash
set -euo pipefail

# Publish only the portfolio site. The private repository also keeps source
# artwork and working files that should not be included in the public site.
output_dir="dist"
rm -rf -- "$output_dir"
mkdir -p -- "$output_dir"

cp -- ./*.html ./*.css ./*.js "$output_dir/"
cp -R -- assets research-assets "$output_dir/"
touch "$output_dir/.nojekyll"

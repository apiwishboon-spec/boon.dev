#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Pages single-output build.
# Builds the Astro site into site/dist, then merges the React admin
# into site/dist/admin so a single Pages project serves both.
# Uses npm workspaces: a root `npm install` installs all sub-package deps.

echo "=== Building Astro site ==="
npm run site:build

echo "=== Building React admin ==="
npm run admin:build

echo "=== Merging admin into site/dist/admin ==="
rm -rf site/dist/admin
mkdir -p site/dist/admin
cp -R admin/dist/. site/dist/admin/

echo "=== Generating SEO (sitemap, feed, robots) ==="
(cd site && node scripts/gen-seo.mjs)

echo "=== Build complete: publish directory 'site/dist' ==="

#!/usr/bin/env bash
# Update screenshots from URLs in scripts/screenshot-urls.config.
# Usage: ./scripts/update-screenshots.sh   (run from app directory)
# Or:    npm run screenshots
#
# Config: edit scripts/screenshot-urls.config (one URL per line, optional output filename).
# Output: SCREENSHOTS_DIR or ./screenshots

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_ROOT"

# Ensure project dependencies (including playwright) are installed
npm install

# Install Playwright Chromium browser (uses playwright from node_modules)
npx playwright install chromium

node "$SCRIPT_DIR/update-screenshots.mjs" "$@"

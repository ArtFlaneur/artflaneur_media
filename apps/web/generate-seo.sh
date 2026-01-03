#!/bin/bash
# Load environment variables from .env.local and run SEO generation scripts

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "Loading environment variables from .env.local..."
    export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi

# Run the generation scripts
echo "Generating sitemap and RSS feed..."
npm run generate:seo

echo "✅ Done!"

#!/bin/sh
set -e

echo ">>> Running Prisma db push..."
./node_modules/.bin/prisma db push --config prisma.config.ts --accept-data-loss

echo ">>> Starting application..."
exec "$@"

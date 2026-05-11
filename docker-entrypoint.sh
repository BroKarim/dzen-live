#!/bin/sh
set -e

echo ">>> Running Prisma db push..."
./node_modules/.bin/prisma db push --config prisma.config.ts

echo ">>> Starting application..."
exec "$@"

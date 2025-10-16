#!/bin/sh
# wait-for-postgres.sh
# Wait for Postgres to be ready before running commands

set -e

host="$1"
shift

echo "Waiting for Postgres at $host..."

until pg_isready -h "$host" -p 5432 -U "$POSTGRES_USER"; do
  echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "Postgres is up - executing command"
exec "$@"

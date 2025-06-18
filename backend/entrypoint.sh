#!/bin/sh

echo "Ожидаем запуска PostgreSQL..."

until pg_isready -h db -p 5432 -U postgres; do
  echo "PostgreSQL не готов, ждем..."
  sleep 2
done

echo "PostgreSQL готов, запускаем миграции..."

alembic upgrade head

echo "Запускаем FastAPI..."

exec uvicorn app.main:app --host 0.0.0.0 --port 80

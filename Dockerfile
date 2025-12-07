# --- Этап 1: Сборка фронтенда ---
FROM node:18-alpine AS frontend-builder

# Устанавливаем рабочую директорию
WORKDIR /app/static

# Копируем файлы с зависимостями и устанавливаем их
COPY static/package.json static/package-lock.json ./
RUN npm install

# Копируем остальной код фронтенда
COPY static/ ./

# Собираем production-версию
RUN npm run build

# --- Этап 2: Сборка бэкенда ---
FROM python:3.9

WORKDIR /code

# Копируем зависимости Python и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Копируем код бэкенда
COPY app/ ./app

# Копируем собранный фронтенд из первого этапа
COPY --from=frontend-builder /app/static/dist ./static/dist

# Возвращаемся к стандартному и самому надежному способу запуска
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, documents
from app.db import models
from app.db.database import engine
from app.core.config import settings, PROJECT_ROOT

# Создаем таблицы в БД
models.Base.metadata.create_all(bind=engine)

# Создаем директорию для документов, если ее нет
os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)

app = FastAPI(title="AI Document Editor")

# Настройка CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API роутеры
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

# Определяем путь к директории с собранным фронтендом
STATIC_DIR = os.path.join(PROJECT_ROOT, "static", "dist")

# Монтируем статические файлы (assets, такие как css, js)
app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(request: Request, full_path: str):
    """
    Отдает index.html для всех путей, которые не являются API-вызовами или статическими файлами.
    Это необходимо для корректной работы React Router.
    """
    file_path = os.path.join(STATIC_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Frontend not built. Run 'npm run build' in the 'static' directory."}

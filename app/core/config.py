import os
from pydantic_settings import BaseSettings

# Определяем корень проекта один раз
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str = "your-openai-api-key"

    # Пути к директориям
    DOCUMENTS_DIR: str = os.path.join(PROJECT_ROOT, "user_documents")
    
    class Config:
        # Убираем чтение из .env файла. Теперь Pydantic будет брать
        # переменные только из окружения, что более надежно в Docker.
        pass

settings = Settings()

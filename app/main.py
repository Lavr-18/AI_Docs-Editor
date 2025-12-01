from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from app.api import auth, documents
from app.db import models
from app.db.database import engine
from app.core.config import settings # Import settings

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Document Editor")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])

# Add debug print for OpenAI API Key
print(f"DEBUG: OpenAI API Key loaded: {settings.OPENAI_API_KEY}")

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return RedirectResponse(url="/static/login.html")

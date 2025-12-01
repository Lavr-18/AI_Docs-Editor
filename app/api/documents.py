import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import models
from app.db.database import SessionLocal
from app.schemas.document import Document, DocumentCreate, AiRequest
from app.services.openai_service import get_ai_suggestion
from app.api.auth import get_current_user

router = APIRouter()
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCUMENTS_DIR = os.path.join(PROJECT_ROOT, "user_documents")

if not os.path.exists(DOCUMENTS_DIR):
    os.makedirs(DOCUMENTS_DIR)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=Document, status_code=status.HTTP_201_CREATED)
def create_document(document: DocumentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_document = models.Document(title=document.title, owner_id=current_user.id)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Create an empty file for the document
    file_path = os.path.join(DOCUMENTS_DIR, f"{db_document.id}.txt")
    with open(file_path, "w") as f:
        f.write("")
        
    return db_document

@router.get("/", response_model=List[Document])
def get_documents(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Document).filter(models.Document.owner_id == current_user.id).all()

@router.get("/{document_id}", response_model=str)
def get_document_content(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_document = db.query(models.Document).filter(models.Document.id == document_id, models.Document.owner_id == current_user.id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = os.path.join(DOCUMENTS_DIR, f"{document_id}.txt")
    if not os.path.exists(file_path):
         raise HTTPException(status_code=404, detail="Document file not found")
    
    with open(file_path, "r") as f:
        return f.read()

@router.put("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_document_content(document_id: int, content: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_document = db.query(models.Document).filter(models.Document.id == document_id, models.Document.owner_id == current_user.id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    file_path = os.path.join(DOCUMENTS_DIR, f"{document_id}.txt")
    with open(file_path, "w") as f:
        f.write(content)

@router.post("/{document_id}/assist", response_model=str)
def get_ai_suggestion_for_document(document_id: int, request: AiRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_document = db.query(models.Document).filter(models.Document.id == document_id, models.Document.owner_id == current_user.id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return get_ai_suggestion(current_text=request.current_text, user_prompt=request.user_prompt)

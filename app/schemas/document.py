from pydantic import BaseModel

class DocumentBase(BaseModel):
    title: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class AiRequest(BaseModel):
    current_text: str
    user_prompt: str

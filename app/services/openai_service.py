from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_ai_suggestion(current_text: str, user_prompt: str) -> str:
    system_prompt = f"""
You are an expert AI assistant for document editing.
The user is currently working on a document.
The current content of the document is:
---
{current_text}
---
Please provide a helpful response to the user's prompt, which you can then insert into the document.
"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        # In a real application, you'd want more robust error handling
        print(f"Error calling OpenAI: {e}")
        return "Error: Could not get a suggestion from the AI."


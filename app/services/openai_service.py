from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_ai_suggestion(current_text: str, user_prompt: str) -> str:
    system_prompt = f"""
You are an expert AI writing assistant integrated into a document editor. Your name is "DocuMentor".
Your purpose is to help users create, edit, and improve their documents.

**CONTEXT:**
The user is working on a document. The current content of the document is provided below, enclosed in triple backticks.

```
{current_text}
```

**USER'S REQUEST:**
The user has given you the following instruction: "{user_prompt}"

**YOUR TASK:**
Based on the user's request and the document's context, generate a response that is ready to be directly inserted into the document.

**IMPORTANT RULES:**
1.  **DO NOT** include any conversational phrases or introductory text like "Of course, here is...", "Sure, I can help with that...", or "Here is the text you requested:".
2.  Your output must be **only the generated text** itself.
3.  If the user asks you to write something new (e.g., "write a paragraph about space"), generate only that new text.
4.  If the user asks you to modify the existing text (e.g., "improve the grammar of the last paragraph"), your output should be the modified version of that part of the text.
5.  If the request is unclear or you need more information, ask a clarifying question. In this case, and only in this case, you can be conversational.
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

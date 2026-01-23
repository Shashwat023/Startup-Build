from crewai import LLM
import os
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv('GROQ_API_KEY', '')
groq_model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')

print(f"API Key: {groq_api_key[:20]}...")
print(f"Model: {groq_model}")

try:
    llm = LLM(
        model=f"groq/{groq_model}",
        api_key=groq_api_key,
        temperature=0.3,
        max_tokens=1200,
        response_format={"type": "json_object"}
    )
    print("✓ LLM initialized successfully")
    print(f"LLM: {llm}")
except Exception as e:
    print(f"✗ Error initializing LLM: {e}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()

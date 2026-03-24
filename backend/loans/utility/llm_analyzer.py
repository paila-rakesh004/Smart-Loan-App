import json
from django.conf import settings
from google import genai
from google.genai import types


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def analyze_document_with_llm(masked_ocr_text):
   
    if not masked_ocr_text:
        return {"error": "No text provided to LLM"}

    prompt = f"""
    You are an expert AI compliance officer for a bank. 
    Analyze the following OCR text. The text has been masked for privacy.
    
    CRITICAL RULES FOR ANOMALIES:
    1. The current year is 2026. Do NOT flag any 2026 dates as "future dates".
    2. Completely IGNORE any text related to "Signature Valid", "Digitally signed by", or verification timestamps. These are standard on e-Aadhaar downloads.
    3. Ignore minor OCR typos or garbage text caused by complex backgrounds.
    
    You MUST return a strict JSON object with this exact structure:
    {{
        "document_type": "Aadhaar Card, PAN Card, Salary Slip, Employee ID, or Unknown",
        "extracted_fields": {{
            "name": "Extract the person's name",
            "id_number": "Extract the masked ID number (e.g. XXXX-XXXX-1234)",
            "address": "Extract the full street address and PIN code if found, otherwise null"
        }},
        "anomalies": ["List ONLY severe issues like missing name, missing ID, or explicit 'Fake/Sample' watermarks. Empty list if none."],
        "confidence_score": 0.0 to 1.0,
        "ai_reasoning": "Explain your decision."
    }}
    
    Here is the OCR text:
    {masked_ocr_text}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.0, response_mime_type="application/json",)
        )
        
        raw_json_string = response.text.strip()
        if raw_json_string.startswith("```json"):
            raw_json_string = raw_json_string[7:-3].strip()
        elif raw_json_string.startswith("```"):
            raw_json_string = raw_json_string[3:-3].strip()
            
        ai_data = json.loads(raw_json_string)
        return ai_data
        
    except json.JSONDecodeError:
        print("Failed to parse LLM response into JSON.")
        print("Raw Output:", response.text)
        return {"error": "LLM returned invalid JSON"}
    except Exception as e:
        print(f"LLM API Error: {e}")
        return {"error": str(e)}
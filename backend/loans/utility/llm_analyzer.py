import json
from django.conf import settings
from google import genai


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def analyze_document_with_llm(masked_ocr_text):
   
    if not masked_ocr_text:
        return {"error": "No text provided to LLM"}

    prompt = f"""
    You are an expert AI compliance officer for a bank. 
    Analyze the following raw OCR text extracted from an uploaded document.
    
    The text has been masked for privacy (e.g., XXXX).
    
    You MUST return your response as a valid, parseable JSON object with the exact following structure. 
    Do not include markdown blocks like ```json or any other conversational text. Just the raw JSON dictionary.
    
    {{
        "document_type": "Identify the document (e.g., Aadhaar Card, PAN Card, Salary Slip, Bank Statement, Unknown)",
        "extracted_fields": {{
            "name": "Extract the person's name if found, otherwise null",
            "dob": "Extract Date of Birth if found, otherwise null",
            "masked_id_number": "Extract the masked number (e.g., XXXX-XXXX-9012) if found, otherwise null"
        }},
        "anomalies": ["List any suspicious things, like missing names or formatting errors. Empty list if none."],
        "confidence_score": 0.0 to 1.0,
        "ai_reasoning": "Briefly explain why you gave this confidence score and classification."
    }}
    
    Here is the OCR text to analyze:
    {masked_ocr_text}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
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
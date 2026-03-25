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
    
    CRITICAL RULES:
    1. The current year is 2026. Do NOT flag 2026 dates as future.
    2. If Salary Slip: Count distinct months. Extract Employer name and Net Monthly Income.
    3. If Employee ID: Look for expiration date. Extract Employer Name and Employee Number.
    4. If ITR (Income Tax Return): Extract the Assessment Year (e.g., 2025) and the Gross Total Income (numeric only).
    5. If Vintage Proof (Bank Statement/Welcome Letter): Extract the Account Opening Year or the oldest transaction year shown (YYYY format).
    6. While verifying Aadhar card, consider only address, aadhar number and whether it is faked or original. ignore the date of issue.
    7. If you feel any document is inappropriate or faked document, then flag it.
    You MUST return a strict JSON object with this exact structure:
    {{
        "document_type": "Aadhaar Card, PAN Card, Salary Slip, Employee ID, ITR, Vintage Proof, or Unknown",
        "extracted_fields": {{
            "name": "Person's name",
            "id_number": "PAN, Aadhaar, or Employee ID Number",
            "address": "Full address or null",
            "organization_name": "Employer name",
            "monthly_income": "Net monthly income (numeric)",
            "months_present": 1,
            "is_expired": false,
            "assessment_year": "YYYY (for ITR)",
            "gross_income": "Numeric annual income (for ITR)",
            "account_opening_year": "YYYY (for Vintage Proof)"
        }},
        "anomalies": ["List strict severe issues ONLY. Empty list if none."],
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
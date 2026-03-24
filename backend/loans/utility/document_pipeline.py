from .ocr_engine import extract_text_from_image
from .masker import mask_sensitive_data
from .llm_analyzer import analyze_document_with_llm
from thefuzz import fuzz 

def process_loan_document(image_file, user):
 
    raw_text = extract_text_from_image(image_file)
    if not raw_text:
        return {"status": "failed", "decision": "MANUAL_REVIEW", "reason": "OCR failed."}

    safe_text = mask_sensitive_data(raw_text)
    
    llm_result = analyze_document_with_llm(safe_text)
    if "error" in llm_result:
        return {"status": "failed", "decision": "MANUAL_REVIEW", "reason": "AI Error"}

    confidence = float(llm_result.get("confidence_score", 0.0))
    anomalies = llm_result.get("anomalies", [])
    extracted = llm_result.get("extracted_fields", {})
    doc_type = llm_result.get("document_type", "Unknown")


    
    db_name = getattr(user, 'first_name', '') + " " + getattr(user, 'last_name', '')
    if not db_name.strip(): 
        db_name = user.username 
        
    db_pan = getattr(user, 'pan_number', '')
    db_aadhaar = getattr(user, 'aadhar_number', '') 

    extracted_name = extracted.get("name") or ""
    clean_raw_text = "".join(char for char in raw_text if char.isalnum()).upper()

 
    if not extracted_name:
        anomalies.append("Missing Name: Could not extract a recognizable name from this document.")
    elif db_name:
        name_score = fuzz.token_sort_ratio(db_name.lower(), extracted_name.lower())
        if name_score < 75:
            anomalies.append(f"Name Mismatch: Document says '{extracted_name}' but DB says '{db_name}'.")

   
    doc_type_upper = doc_type.upper()
    
    if "PAN" in doc_type_upper:
        clean_db_pan = str(db_pan).upper().strip()
        if len(clean_db_pan) >= 10:
            pan_numbers = clean_db_pan[5:9] 
            if clean_db_pan not in clean_raw_text and pan_numbers not in clean_raw_text:
                anomalies.append("PAN Mismatch: Your registered PAN number was not found on this card.")
        else:
             anomalies.append("PAN Error: Registered PAN in database is invalid.")

    elif "AADHAAR" in doc_type_upper:
        clean_db_aadhaar = str(db_aadhaar).replace(" ", "").replace("-", "")
        if len(clean_db_aadhaar) >= 4:
            last_4_aadhaar = clean_db_aadhaar[-4:]
            if last_4_aadhaar not in clean_raw_text:
                anomalies.append(f"Aadhaar Mismatch: Your registered Aadhaar ending in {last_4_aadhaar} was not found.")
        else:
            anomalies.append("Aadhaar Error: Registered Aadhaar in database is invalid.")

    
    elif "UNKNOWN" in doc_type_upper:
        anomalies.append("Invalid Document: AI could not identify this as a valid official ID.")
        
 
    
    final_decision = "MANUAL_REVIEW"
    
    if confidence >= 0.85 and len(anomalies) == 0:
        final_decision = "AUTO_APPROVE"
    elif confidence >= 0.60:
        final_decision = "MANUAL_REVIEW"
    else:
        final_decision = "REJECTED_PLEASE_REUPLOAD"

    return {
        "status": "success",
        "decision": final_decision,
        "confidence_score": confidence,
        "document_type": doc_type,
        "extracted_data": extracted,
        "anomalies_found": anomalies,
        "ai_reasoning": " | ".join(anomalies) if anomalies else llm_result.get("ai_reasoning", "Perfect match.")
    }
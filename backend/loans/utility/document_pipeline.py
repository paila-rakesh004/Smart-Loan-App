from .ocr_engine import extract_text_from_image
from .masker import mask_sensitive_data
from .llm_analyzer import analyze_document_with_llm

def process_loan_document(image_file):
   
   
    raw_text = extract_text_from_image(image_file)
    if not raw_text:
        return {
            "status": "failed", 
            "decision": "MANUAL_REVIEW", 
            "reason": "OCR could not detect any readable text."
        }

 
    safe_text = mask_sensitive_data(raw_text)

    llm_result = analyze_document_with_llm(safe_text)
    
    if "error" in llm_result:
        return {
            "status": "failed", 
            "decision": "MANUAL_REVIEW", 
            "reason": "AI processing failed.", 
            "details": llm_result["error"]
        }

    confidence = float(llm_result.get("confidence_score", 0.0))
    anomalies = llm_result.get("anomalies", [])
    
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
        "document_type": llm_result.get("document_type", "Unknown"),
        "extracted_data": llm_result.get("extracted_fields", {}),
        "anomalies_found": anomalies,
        "ai_reasoning": llm_result.get("ai_reasoning", "No reasoning provided.")
    }
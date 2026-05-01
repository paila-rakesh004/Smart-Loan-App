from .ocr_engine import extract_text_from_image
from .masker import mask_sensitive_data
from .llm_analyzer import analyze_document_with_llm
from thefuzz import fuzz
import logging
import re

logger = logging.getLogger(__name__)


def _safe_int(value, default=0):
    try:
        clean_val = "".join(filter(str.isdigit, str(value)))
        return int(clean_val) if clean_val else default
    except (ValueError, TypeError):
        return default

def _validate_profile_name(db_name, anomalies):
    if not db_name.strip():
        anomalies.append("Profile Error: You must update your legal First and Last Name in your profile before verifying documents.")

def _validate_extracted_name(db_name, extracted_name, anomalies):
    if not extracted_name:
        anomalies.append("Missing Name: Could not extract a recognizable name from this document.")
    elif db_name:
        name_score = fuzz.token_sort_ratio(db_name.lower(), extracted_name.lower())
        if name_score < 75:
            anomalies.append(f"Name Mismatch: Document says '{extracted_name}' but DB says '{db_name}'.")

def _validate_pan_document(db_pan, clean_raw_text, anomalies):
    clean_db_pan = str(db_pan).upper().strip()
    if len(clean_db_pan) >= 10:
        pan_numbers = clean_db_pan[5:9]
        if clean_db_pan not in clean_raw_text and pan_numbers not in clean_raw_text:
            anomalies.append("PAN Mismatch: Your registered PAN number was not found on this card.")
    else:
        anomalies.append("PAN Error: Registered PAN in database is invalid.")

def _validate_aadhaar_document(db_aadhaar, clean_raw_text, anomalies):
    clean_db_aadhaar = re.sub(r'\D', '', str(db_aadhaar))
    
    if len(clean_db_aadhaar) >= 4:
        last_4_aadhaar = clean_db_aadhaar[-4:]
        if last_4_aadhaar not in clean_raw_text:
            anomalies.append(f"Aadhaar Mismatch: Your registered Aadhaar ending in {last_4_aadhaar} was not found.")
    else:
        anomalies.append("Aadhaar Error: Registered Aadhaar in database is invalid.")

def _validate_salary_slip(extracted, declared_org, declared_income, anomalies):
    months = extracted.get("months_present", 0)
    if isinstance(months, int) and months < 3:
        anomalies.append(f"Insufficient Salary Slips: Only {months} month(s) found. 3 months required.")
        
    ext_org = extracted.get("organization_name", "")
    if declared_org and ext_org:
        if fuzz.token_sort_ratio(declared_org.lower(), ext_org.lower()) < 70:
            anomalies.append(f"Employer Mismatch: Slip says '{ext_org}' but you entered '{declared_org}'.")
    elif not ext_org:
        anomalies.append("Missing Data: Could not find an Organization Name on the Salary Slip.")
        
    ext_income_int = _safe_int(extracted.get("monthly_income", ""))
    dec_income_int = _safe_int(declared_income)
    
    if ext_income_int and dec_income_int:
        diff = abs(ext_income_int - dec_income_int)
        if diff > (dec_income_int * 0.20):
            anomalies.append(f"Income Mismatch: Slip shows ~{ext_income_int} but you declared {dec_income_int}.")

def _validate_employee_id(extracted, declared_org, anomalies):
    ext_org = extracted.get("organization_name", "")
    if declared_org and ext_org:
        if fuzz.token_sort_ratio(declared_org.lower(), ext_org.lower()) < 70:
            anomalies.append(f"Employer Mismatch: ID Card says '{ext_org}' but you entered '{declared_org}'.")
            
    if extracted.get("is_expired") is True:
        anomalies.append("Expired Employee ID: The validity date on this card has passed.")
    if not extracted.get("id_number"):
        anomalies.append("Missing Employee Number: Could not extract a valid Employee ID number.")

def _validate_itr(db_pan, extracted, clean_raw_text, declared_income, anomalies):
    if db_pan:
        clean_db_pan = str(db_pan).upper().strip()
        if len(clean_db_pan) == 10:
            pan_numbers = clean_db_pan[5:9]
            if clean_db_pan not in clean_raw_text and pan_numbers not in clean_raw_text:
                anomalies.append("PAN Mismatch: Your registered PAN was not found on this ITR.")
                
    ay = str(extracted.get("assessment_year", ""))
    if not any(year in ay for year in ["2024", "2025", "2026"]):
        anomalies.append(f"Outdated ITR: The Assessment Year '{ay}' is too old. Must be from the last 2 years.")
        
    ext_gross_int = _safe_int(extracted.get("gross_income", ""))
    dec_annual_int = _safe_int(declared_income) * 12
    
    if ext_gross_int and dec_annual_int:
        if ext_gross_int < (dec_annual_int * 0.8):
            anomalies.append(f"Income Inflation: You declared {dec_annual_int}/yr, but ITR shows only {ext_gross_int}.")

def _validate_vintage(extracted, declared_years, anomalies):
    account_year = str(extracted.get("account_opening_year", ""))
    actual_year = _safe_int(account_year)
    
    if actual_year >= 1000 and declared_years: 
        try:
            declared_years_int = int(declared_years)
            expected_max_year = 2026 - declared_years_int 
            
            if actual_year > expected_max_year:
                anomalies.append(f"Vintage Mismatch: You claimed {declared_years_int} years, meaning account should be opened by {expected_max_year}, but document shows {actual_year}.")
        except ValueError:
            logger.exception("Could not parse declared_years into integer")
    elif not actual_year:
        anomalies.append("Missing Data: Could not extract an account opening or transaction year from this document.")

def _validate_unknown_document(anomalies):
    anomalies.append("Invalid Document: AI could not identify this as a valid official document.")

def _check_document_mismatch(expected_doc_type, actual_doc_type, llm_result):
    if expected_doc_type != "Unknown" and actual_doc_type != "Unknown":
        if expected_doc_type.lower() not in actual_doc_type.lower() and actual_doc_type.lower() not in expected_doc_type.lower():
            llm_result["confidence_score"] = 0.0
            llm_result["decision"] = "REJECTED_PLEASE_REUPLOAD"
            llm_result["ai_reasoning"] = f"Document Mismatch: Expected {expected_doc_type}, but found {actual_doc_type}."
            return True
    return False

def _calculate_final_decision(confidence, anomaly_count):
    if confidence >= 0.85 and anomaly_count == 0:
        return "AUTO_APPROVE"
    elif confidence >= 0.60:
        return "MANUAL_REVIEW"
    return "REJECTED_PLEASE_REUPLOAD"

def _validate_by_document_type(doc_type_upper, extracted, db_pan, db_aadhaar, declared_org, declared_income, declared_years, clean_raw_text, anomalies):
    validators = {
        "PAN": lambda: _validate_pan_document(db_pan, clean_raw_text, anomalies),
        "AADHAAR": lambda: _validate_aadhaar_document(db_aadhaar, clean_raw_text, anomalies),
        "SALARY": lambda: _validate_salary_slip(extracted, declared_org, declared_income, anomalies),
        "EMPLOYEE ID": lambda: _validate_employee_id(extracted, declared_org, anomalies),
        "ITR": lambda: _validate_itr(db_pan, extracted, clean_raw_text, declared_income, anomalies),
        "VINTAGE": lambda: _validate_vintage(extracted, declared_years, anomalies),
        "UNKNOWN": lambda: _validate_unknown_document(anomalies)
    }
    
    for key, validator_func in validators.items():
        if key in doc_type_upper:
            validator_func()
            break 

def process_loan_document(image_file, user, declared_org="", declared_income="", declared_years="", expected_doc_type="Unknown"):
    raw_text = extract_text_from_image(image_file)
    if not raw_text:
        return {"status": "failed", "decision": "MANUAL_REVIEW", "reason": "OCR failed."}
        
    llm_result = analyze_document_with_llm(mask_sensitive_data(raw_text), expected_doc_type=expected_doc_type)
    doc_type = llm_result.get("document_type", "Unknown")
    
    if _check_document_mismatch(expected_doc_type, doc_type, llm_result):
        return llm_result
    if "error" in llm_result:
        return {"status": "failed", "decision": "MANUAL_REVIEW", "reason": "AI Error"}

    confidence = float(llm_result.get("confidence_score", 0.0))
    anomalies = llm_result.get("anomalies", [])
    extracted = llm_result.get("extracted_fields", {})
    
    db_name = f"{getattr(user, 'first_name', '').strip()} {getattr(user, 'last_name', '').strip()}".strip()
    db_pan, db_aadhaar = getattr(user, 'pan_card_number', ''), getattr(user, 'aadhar_card_number', '')
    
    clean_raw_text = re.sub(r'[^A-Z0-9]', '', raw_text.upper())

    _validate_profile_name(db_name, anomalies)
    _validate_extracted_name(db_name, extracted.get("name", ""), anomalies)
    _validate_by_document_type(doc_type.upper(), extracted, db_pan, db_aadhaar, declared_org, declared_income, declared_years, clean_raw_text, anomalies)

    return {
        "status": "success",
        "decision": _calculate_final_decision(confidence, len(anomalies)),
        "confidence_score": confidence,
        "document_type": doc_type,
        "extracted_data": extracted,
        "anomalies_found": anomalies,
        "ai_reasoning": " | ".join(anomalies) if anomalies else llm_result.get("ai_reasoning", "Perfect match.")
    }
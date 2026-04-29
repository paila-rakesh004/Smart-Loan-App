from .ocr_engine import extract_text_from_image
from .masker import mask_sensitive_data
from .llm_analyzer import analyze_document_with_llm
from thefuzz import fuzz
import logging
logger = logging.getLogger(__name__)
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
    clean_db_aadhaar = str(db_aadhaar).replace(" ", "").replace("-", "")
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
    ext_org = extracted.get("organization_name") or ""
    if declared_org and ext_org:
        org_score = fuzz.token_sort_ratio(declared_org.lower(), ext_org.lower())
        if org_score < 70:
            anomalies.append(f"Employer Mismatch: Slip says '{ext_org}' but you entered '{declared_org}'.")
    elif not ext_org:
        anomalies.append("Missing Data: Could not find an Organization Name on the Salary Slip.")
    ext_income = extracted.get("monthly_income") or ""
    clean_ext_inc = "".join(filter(str.isdigit, str(ext_income)))
    clean_dec_inc = "".join(filter(str.isdigit, str(declared_income)))
    if clean_ext_inc and clean_dec_inc:
        diff = abs(int(clean_ext_inc) - int(clean_dec_inc))
        if diff > (int(clean_dec_inc) * 0.20):
            anomalies.append(f"Income Mismatch: Slip shows ~{clean_ext_inc} but you declared {clean_dec_inc}.")
def _validate_employee_id(extracted, declared_org, anomalies):
    ext_org = extracted.get("organization_name") or ""
    if declared_org and ext_org:
        org_score = fuzz.token_sort_ratio(declared_org.lower(), ext_org.lower())
        if org_score < 70:
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
    ay = str(extracted.get("assessment_year") or "")
    if "2024" not in ay and "2025" not in ay and "2026" not in ay:
        anomalies.append(f"Outdated ITR: The Assessment Year '{ay}' is too old. Must be from the last 2 years.")
    ext_gross = "".join(filter(str.isdigit, str(extracted.get("gross_income", ""))))
    clean_dec_inc = "".join(filter(str.isdigit, str(declared_income)))
    if ext_gross and clean_dec_inc:
        declared_annual = int(clean_dec_inc) * 12
        ext_gross_int = int(ext_gross)
        if ext_gross_int < (declared_annual * 0.8):
            anomalies.append(f"Income Inflation: You declared {declared_annual}/yr, but ITR shows only {ext_gross_int}.")
def _validate_vintage(extracted, declared_years, anomalies):
    account_year = str(extracted.get("account_opening_year") or "")
    clean_acct_year = "".join(filter(str.isdigit, account_year))
    if clean_acct_year and len(clean_acct_year) >= 4 and declared_years:
        try:
            expected_max_year = 2026 - int(declared_years)
            actual_year = int(clean_acct_year[:4])
            if actual_year > expected_max_year:
                anomalies.append(f"Vintage Mismatch: You claimed {declared_years} years, meaning account should be opened by {expected_max_year}, but document shows {actual_year}.")
        except ValueError:
            logger.exception("Value Error")
    elif not clean_acct_year:
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
    else:
        return "REJECTED_PLEASE_REUPLOAD"
def _validate_by_document_type(doc_type_upper, extracted, db_pan, db_aadhaar, declared_org,declared_income, declared_years, clean_raw_text, anomalies):
    if "PAN" in doc_type_upper:
        _validate_pan_document(db_pan, clean_raw_text, anomalies)
    elif "AADHAAR" in doc_type_upper:
        _validate_aadhaar_document(db_aadhaar, clean_raw_text, anomalies)
    elif "SALARY" in doc_type_upper:
        _validate_salary_slip(extracted, declared_org, declared_income, anomalies)
    elif "EMPLOYEE ID" in doc_type_upper:
        _validate_employee_id(extracted, declared_org, anomalies)
    elif "ITR" in doc_type_upper:
        _validate_itr(db_pan, extracted, clean_raw_text, declared_income, anomalies)
    elif "VINTAGE" in doc_type_upper:
        _validate_vintage(extracted, declared_years, anomalies)
    elif "UNKNOWN" in doc_type_upper:
        _validate_unknown_document(anomalies)
def process_loan_document(image_file, user, declared_org="", declared_income="", declared_years="", expected_doc_type="Unknown"):
    raw_text = extract_text_from_image(image_file)
    if not raw_text:
        return {"status": "failed", "decision": "MANUAL_REVIEW", "reason": "OCR failed."}
    safe_text = mask_sensitive_data(raw_text)
    llm_result = analyze_document_with_llm(safe_text, expected_doc_type=expected_doc_type)
    actual_doc_type = llm_result.get('document_type', 'Unknown')
    if _check_document_mismatch(expected_doc_type, actual_doc_type, llm_result):
        return llm_result
    if "error" in llm_result:
        return {"status": "failed", "decision": "MANUAL_REVIEW", "reason": "AI Error"}
    confidence = float(llm_result.get("confidence_score", 0.0))
    anomalies = llm_result.get("anomalies", [])
    extracted = llm_result.get("extracted_fields", {})
    doc_type = llm_result.get("document_type", "Unknown")
    db_first = getattr(user, 'first_name', '').strip()
    db_last = getattr(user, 'last_name', '').strip()
    db_name = f"{db_first} {db_last}".strip()
    extracted_name = extracted.get("name") or ""
    clean_raw_text = "".join(char for char in raw_text if char.isalnum()).upper()
    _validate_profile_name(db_name, anomalies)
    db_pan = getattr(user, 'pan_number', '')
    db_aadhaar = getattr(user, 'aadhar_number', '')
    _validate_extracted_name(db_name, extracted_name, anomalies)
    doc_type_upper = doc_type.upper()
    _validate_by_document_type(doc_type_upper, extracted, db_pan, db_aadhaar,declared_org, declared_income, declared_years,clean_raw_text, anomalies)
    final_decision = _calculate_final_decision(confidence, len(anomalies))
    return {
        "status": "success",
        "decision": final_decision,
        "confidence_score": confidence,
        "document_type": doc_type,
        "extracted_data": extracted,
        "anomalies_found": anomalies,
        "ai_reasoning": " | ".join(anomalies) if anomalies else llm_result.get("ai_reasoning", "Perfect match.")
    }
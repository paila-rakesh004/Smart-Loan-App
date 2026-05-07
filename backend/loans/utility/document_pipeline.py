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

def extract_user_data(user):
    return {
        "name": f"{getattr(user, 'first_name', '').strip()} {getattr(user, 'last_name', '').strip()}".strip(),
        "pan": getattr(user, 'pan_card_number', ''),
        "aadhaar": getattr(user, 'aadhar_card_number', '')
    }

def clean_text_data(raw_text):
    return re.sub(r'[^A-Z0-9]', '', raw_text.upper())

def validate_name(db_name, extracted_name):
    errors = []
    if not db_name.strip():
        return ["Profile Error: Update your legal name in profile."]
    if not extracted_name:
        return ["Missing Name: Could not extract name from document."]

    score = fuzz.token_sort_ratio(db_name.lower(), extracted_name.lower())
    if score < 75:
        errors.append(f"Name Mismatch: '{extracted_name}' vs '{db_name}'.")
    return errors

def validate_pan_document(db_pan, clean_raw_text):
    clean_db_pan = str(db_pan).upper().strip()
    if len(clean_db_pan) < 10:
        return ["PAN Error: Registered PAN is invalid."]

    pan_numbers = clean_db_pan[5:9]
    if clean_db_pan not in clean_raw_text and pan_numbers not in clean_raw_text:
        return ["PAN Mismatch: PAN not found in document."]
    return []

def validate_aadhaar_document(db_aadhaar, clean_raw_text):
    clean_db = re.sub(r'\D', '', str(db_aadhaar))
    if len(clean_db) < 4:
        return ["Aadhaar Error: Registered Aadhaar is invalid."]

    last_4 = clean_db[-4:]
    if last_4 not in clean_raw_text:
        return [f"Aadhaar Mismatch: Ending in {last_4} not found."]
    return []

def validate_salary_slip(extracted, declared_org, declared_income):
    errors = []
    months = extracted.get("months_present", 0)
    if isinstance(months, int) and months < 3:
        errors.append(f"Only {months} month(s) found. Minimum 3 required.")

    org = extracted.get("organization_name", "")
    if not org:
        errors.append("Missing Organization Name.")
    elif declared_org:
        score = fuzz.token_sort_ratio(declared_org.lower(), org.lower())
        if score < 70:
            errors.append(f"Employer mismatch: '{org}' vs '{declared_org}'.")

    ext_income = _safe_int(extracted.get("monthly_income"))
    dec_income = _safe_int(declared_income)

    if ext_income and dec_income:
        diff = abs(ext_income - dec_income)
        if diff > (dec_income * 0.20):
            errors.append(f"Income mismatch: {ext_income} vs {dec_income}")
    return errors

def validate_employee_id(extracted, declared_org):
    errors = []
    org = extracted.get("organization_name", "")
    if declared_org and org:
        score = fuzz.token_sort_ratio(declared_org.lower(), org.lower())
        if score < 70:
            errors.append(f"Employer mismatch: '{org}' vs '{declared_org}'.")

    if extracted.get("is_expired") is True:
        errors.append("Employee ID is expired.")
    if not extracted.get("id_number"):
        errors.append("Missing Employee ID number.")
    return errors

def validate_itr(db_pan, extracted, clean_text, declared_income):
    errors = []
    clean_pan = str(db_pan).upper().strip()
    if len(clean_pan) == 10:
        pan_numbers = clean_pan[5:9]
        if clean_pan not in clean_text and pan_numbers not in clean_text:
            errors.append("PAN not found in ITR.")

    ay = str(extracted.get("assessment_year", ""))
    if not any(y in ay for y in ["2024", "2025", "2026"]):
        errors.append(f"Outdated ITR: {ay}")

    ext_income = _safe_int(extracted.get("gross_income"))
    dec_income = _safe_int(declared_income) * 12

    if ((ext_income and dec_income) and (ext_income < (dec_income * 0.8))):
            errors.append(f"Income mismatch: {ext_income} vs {dec_income}")
    return errors

def validate_vintage(extracted, declared_years):
    errors = []
    actual_year = _safe_int(extracted.get("account_opening_year"))
    if not actual_year:
        return ["Missing account opening year."]

    try:
        declared = int(declared_years)
        expected_year = 2026 - declared
        if actual_year > expected_year:
            errors.append(f"Vintage mismatch: expected before {expected_year}, got {actual_year}")
    except ValueError:
        logger.exception("Invalid declared_years")
    return errors

def validate_unknown():
    return ["Invalid Document: Could not identify document."]

def _get_pre_llm_validation_error(doc_type_upper, declared_org, declared_income, declared_years):
    validation_rules = {
        "SALARY": (
            bool(declared_income and declared_org),
            "Missing baseline data: You must provide your Monthly Income and Organization Name before verifying a Salary Slip."
        ),
        "ITR": (
            bool(declared_income),
            "Missing baseline data: You must provide your Income before verifying an ITR document."
        ),
        "EMPLOYEE ID": (
            bool(declared_org),
            "Missing baseline data: You must provide your Organization Name before verifying an Employee ID."
        ),
        "VINTAGE": (
            bool(declared_years),
            "Missing baseline data: You must declare the account age (years) before verifying vintage documents."
        )
    }

    for key, (is_valid, error_message) in validation_rules.items():
        if key in doc_type_upper and not is_valid:
            return error_message
    return None

def validate_by_document_type(doc_type, extracted, db_pan, db_aadhaar,
                              declared_org, declared_income, declared_years, clean_text):

    doc_type = doc_type.upper()

    validators = {
        "PAN": lambda: validate_pan_document(db_pan, clean_text),
        "AADHAAR": lambda: validate_aadhaar_document(db_aadhaar, clean_text),
        "SALARY": lambda: validate_salary_slip(extracted, declared_org, declared_income),
        "EMPLOYEE ID": lambda: validate_employee_id(extracted, declared_org),
        "ITR": lambda: validate_itr(db_pan, extracted, clean_text, declared_income),
        "VINTAGE": lambda: validate_vintage(extracted, declared_years),
        "UNKNOWN": validate_unknown
    }

    for key, func in validators.items():
        if key in doc_type:
            return func()

    return ["Invalid Document Type"]

def build_failure(reason):
    return {
        "status": "failed",
        "decision": "MANUAL_REVIEW",
        "reason": reason
    }

def build_success(llm_result, confidence, anomalies):
    return {
        "status": "success",
        "decision": _calculate_final_decision(confidence, len(anomalies)),
        "confidence_score": confidence,
        "document_type": llm_result.get("document_type", "Unknown"),
        "extracted_data": llm_result.get("extracted_fields", {}),
        "anomalies_found": anomalies,
        "ai_reasoning": " | ".join(anomalies) if anomalies else llm_result.get("ai_reasoning", "Perfect match.")
    }

def _calculate_final_decision(confidence, anomaly_count):
    if confidence >= 0.85 and anomaly_count == 0:
        return "AUTO_APPROVE"
    if confidence >= 0.60:
        return "MANUAL_REVIEW"
    return "REJECTED_PLEASE_REUPLOAD"

def _check_document_mismatch(expected, actual, llm_result):
    if expected != "Unknown" and actual != "Unknown":
        if expected.lower() not in actual.lower() and actual.lower() not in expected.lower():
            llm_result["confidence_score"] = 0.0
            llm_result["decision"] = "REJECTED_PLEASE_REUPLOAD"
            llm_result["ai_reasoning"] = f"Expected {expected}, got {actual}"
            return True
    return False

def process_loan_document(image_file, user, declared_org="", declared_income="", declared_years="", expected_doc_type="Unknown"):
    validation_error = _get_pre_llm_validation_error(str(expected_doc_type).upper(), declared_org, declared_income, declared_years)
    if validation_error:
        return build_failure(validation_error)
    raw_text = extract_text_from_image(image_file)
    if not raw_text:
        return build_failure("OCR failed")
    llm_result = analyze_document_with_llm(
        mask_sensitive_data(raw_text),
        expected_doc_type=expected_doc_type
    )

    if "error" in llm_result:
        return build_failure("AI Error")

    doc_type = llm_result.get("document_type", "Unknown")

    if _check_document_mismatch(expected_doc_type, doc_type, llm_result):
        return llm_result

    extracted = llm_result.get("extracted_fields", {})
    user_data = extract_user_data(user)
    clean_text = clean_text_data(raw_text)
    try:
        confidence = float(llm_result.get("confidence_score", 0.0))
    except (ValueError, TypeError):
        confidence = 0.0
        logger.warning("Invalid confidence score from LLM, defaulting to 0.0")

    anomalies = []
    anomalies.extend(validate_name(user_data["name"], extracted.get("name", "")))
    anomalies.extend(
        validate_by_document_type(
            doc_type, extracted,
            user_data["pan"], user_data["aadhaar"],
            declared_org, declared_income,
            declared_years, clean_text
        )
    )

    return build_success(llm_result, confidence, anomalies)
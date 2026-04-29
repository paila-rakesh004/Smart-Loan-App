import re
def mask_sensitive_data(raw_text):
    if not raw_text:
        return ""
    sanitized_text = raw_text
    aadhaar_pattern = r'(\d{4})[\s\-]?(\d{4})[\s\-]?(\d{4})'
    sanitized_text = re.sub(aadhaar_pattern, r'XXXX-XXXX-\3', sanitized_text)
    pan_pattern = r'([A-Za-z]{5})(\d{4})([A-Za-z])'
    sanitized_text = re.sub(pan_pattern, r'XXXXX\2X', sanitized_text)
    return sanitized_text
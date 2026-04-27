import pytesseract
from PIL import Image
import io
import os  
from pdf2image import convert_from_bytes

if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    POPPLER_PATH = r"C:\Users\user\Downloads\Release-25.12.0-0\poppler-25.12.0\Library\bin"
else:
    POPPLER_PATH = None 


def extract_text_from_image(image_file):
    try:
        image_bytes = image_file.read()
        
        file_name = getattr(image_file, 'name', '').lower()
        content_type = getattr(image_file, 'content_type', '')
        
        raw_text = ""

        if file_name.endswith('.pdf') or content_type == 'application/pdf':
            
            if POPPLER_PATH:
                pages = convert_from_bytes(image_bytes, poppler_path=POPPLER_PATH)
            else:
                pages = convert_from_bytes(image_bytes)
            
            for page_img in pages:
                page_text = pytesseract.image_to_string(page_img, lang='eng')
                raw_text += page_text + "\n"
                
        else:
            img = Image.open(io.BytesIO(image_bytes))
            raw_text = pytesseract.image_to_string(img, lang='eng')

        image_file.seek(0)
        return raw_text.strip()
        
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        image_file.seek(0)
        return ""
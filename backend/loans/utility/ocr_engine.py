import pytesseract
from PIL import Image
import io

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_image(image_file):
    try:
        image_bytes = image_file.read()
        img = Image.open(io.BytesIO(image_bytes))
        
        raw_text = pytesseract.image_to_string(img, lang='eng+tel')
        
        image_file.seek(0)
        return raw_text.strip()
        
    except Exception as e:
        print(f"OCR Extraction Failed: {e}")
        return None
import re
from datetime import datetime

def sanitize_input(data):
    """Sanitize user input"""
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    elif isinstance(data, str):
        return data.strip()[:1000]  # Limit string length
    return data

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone format"""
    pattern = r'^\+?[1-9]\d{1,14}$'
    return re.match(pattern, phone) is not None

def paisa_to_rupees(paisa):
    """Convert paisa to rupees"""
    return round(paisa / 100, 2)

def rupees_to_paisa(rupees):
    """Convert rupees to paisa"""
    return int(round(rupees * 100))

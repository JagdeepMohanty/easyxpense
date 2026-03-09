def sanitize_input(data):
    """Sanitize input data by stripping whitespace and handling None values"""
    if isinstance(data, str):
        return data.strip()
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data

def sanitize_string(value, max_length=200):
    """Sanitize string input with length limit"""
    if not value:
        return ''
    return str(value).strip()[:max_length]

def sanitize_amount(value):
    """Sanitize and validate amount"""
    try:
        amount = float(value)
        if amount <= 0:
            raise ValueError('Amount must be positive')
        return amount
    except (TypeError, ValueError):
        raise ValueError('Invalid amount')

def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate Indian phone number"""
    import re
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, phone) is not None
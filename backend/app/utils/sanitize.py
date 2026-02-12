"""Input sanitization utilities for security"""
import re
import html
from typing import Any, Optional, Dict

def sanitize_input(value: Any, max_length: int = 500) -> str:
    """Sanitize general input with XSS prevention"""
    if not isinstance(value, str):
        value = str(value)
    
    # Strip whitespace
    sanitized = value.strip()
    
    # Limit length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    # Escape HTML to prevent XSS
    sanitized = html.escape(sanitized)
    
    return sanitized

def sanitize_dict(data: Dict[str, Any], allowed_keys: Optional[list] = None) -> Dict[str, Any]:
    """Sanitize dictionary by filtering keys and escaping values"""
    if not isinstance(data, dict):
        return {}
    
    sanitized = {}
    for key, value in data.items():
        # Filter allowed keys if specified
        if allowed_keys and key not in allowed_keys:
            continue
        
        # Sanitize string values
        if isinstance(value, str):
            sanitized[key] = html.escape(value.strip())
        else:
            sanitized[key] = value
    
    return sanitized

def sanitize_string(value: Any, max_length: int = 500) -> str:
    """Sanitize string input (alias for sanitize_input for backward compatibility)"""
    return sanitize_input(value, max_length)

def sanitize_email(email: Any) -> Optional[str]:
    """Validate and sanitize email address"""
    if not isinstance(email, str):
        return None
    
    email = email.strip().lower()
    
    # Basic email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email) or len(email) > 254:
        return None
    
    return email

def sanitize_amount(amount: Any) -> Optional[float]:
    """Validate and sanitize amount (must be positive number)"""
    try:
        amount_float = float(amount)
        if amount_float <= 0 or amount_float > 10000000:  # Max 1 crore
            return None
        return round(amount_float, 2)
    except (ValueError, TypeError):
        return None

def sanitize_list(items: Any, max_items: int = 100) -> list:
    """Sanitize list input"""
    if not isinstance(items, list):
        return []
    
    # Limit number of items
    return items[:max_items]

def validate_group_code(code: Any) -> bool:
    """Validate group code format (6 hex characters)"""
    if not isinstance(code, str):
        return False
    
    return bool(re.match(r'^[a-f0-9]{6}$', code))

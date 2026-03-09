import logging
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('easyxpense')

def log_info(message, **kwargs):
    """Log INFO level message with structured data"""
    extra_data = ' '.join([f'{k}={v}' for k, v in kwargs.items()])
    logger.info(f'{message} {extra_data}')

def log_error(message, **kwargs):
    """Log ERROR level message with structured data"""
    extra_data = ' '.join([f'{k}={v}' for k, v in kwargs.items()])
    logger.error(f'{message} {extra_data}')

def log_warning(message, **kwargs):
    """Log WARNING level message with structured data"""
    extra_data = ' '.join([f'{k}={v}' for k, v in kwargs.items()])
    logger.warning(f'{message} {extra_data}')

def log_request(method, path, user_id=None):
    """Log incoming request"""
    log_info('request_received', method=method, path=path, user_id=user_id or 'anonymous')

def log_response(method, path, status_code, user_id=None):
    """Log outgoing response"""
    log_info('request_completed', method=method, path=path, status=status_code, user_id=user_id or 'anonymous')

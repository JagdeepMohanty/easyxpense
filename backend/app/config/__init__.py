import os

def get_config():
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        from .production import ProductionConfig
        return ProductionConfig
    elif env == 'testing':
        from .testing import TestingConfig
        return TestingConfig
    else:
        from .development import DevelopmentConfig
        return DevelopmentConfig

import os

class Config:
    """Base configuration"""
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    MONGO_URI = os.environ.get('MONGO_URI')
    CLIENT_URL = os.environ.get('CLIENT_URL', 'https://easyxpense.netlify.app')
    
    # Token expiry (seconds)
    ACCESS_TOKEN_EXPIRES = int(os.environ.get('ACCESS_TOKEN_EXPIRES', 86400))  # 24h
    REFRESH_TOKEN_EXPIRES = int(os.environ.get('REFRESH_TOKEN_EXPIRES', 604800))  # 7d
    
    # Request limits
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
    
    # CORS
    CORS_ORIGINS = [CLIENT_URL]
    
    # Session cookies
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    @staticmethod
    def validate():
        errors = []
        if not Config.JWT_SECRET_KEY:
            errors.append('JWT_SECRET_KEY environment variable is required')
        if not Config.MONGO_URI:
            errors.append('MONGO_URI environment variable is required')
        if errors:
            raise ValueError('\n'.join(errors))

class DevelopmentConfig(Config):
    DEBUG = True
    CORS_ORIGINS = [
        Config.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:5173'
    ]
    SESSION_COOKIE_SECURE = False
    
    @staticmethod
    def validate():
        if not Config.MONGO_URI:
            raise ValueError('MONGO_URI environment variable is required')

class ProductionConfig(Config):
    DEBUG = False
    
    @staticmethod
    def validate():
        Config.validate()

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

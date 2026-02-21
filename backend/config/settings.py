"""
Backend Configuration Settings
Centralized configuration for the Flask application
"""
import os
from datetime import timedelta


class Config:
    """Base configuration"""
    # Database
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/easyxpense')
    
    # JWT Settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ALGORITHM = 'HS256'
    ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Client URL
    CLIENT_URL = os.environ.get('CLIENT_URL', 'https://easyxpense.netlify.app')
    
    # Request limits
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
    
    # CORS origins
    CORS_ORIGINS = [
        CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:5173'
    ]
    
    # Security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        errors = []
        if not Config.JWT_SECRET_KEY:
            errors.append('JWT_SECRET_KEY environment variable is required')
        if not Config.MONGO_URI:
            errors.append('MONGO_URI environment variable is required')
        if errors:
            raise ValueError('\n'.join(errors))


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


class TestConfig(Config):
    """Test configuration"""
    DEBUG = True
    TESTING = True
    MONGO_URI = os.environ.get('MONGO_TEST_URI', 'mongodb://localhost:27017/easyxpense_test')


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'test': TestConfig,
    'default': DevelopmentConfig
}


def get_config(env=None):
    """Get configuration based on environment"""
    env = env or os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])

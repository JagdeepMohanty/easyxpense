from .base import BaseConfig

class DevelopmentConfig(BaseConfig):
    DEBUG = True
    ENV = 'development'
    FLASK_ENV = 'development'

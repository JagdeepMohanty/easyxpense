from .base import BaseConfig

class ProductionConfig(BaseConfig):
    DEBUG = False
    ENV = 'production'
    FLASK_ENV = 'production'

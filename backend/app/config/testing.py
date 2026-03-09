from .base import BaseConfig

class TestingConfig(BaseConfig):
    TESTING = True
    ENV = 'testing'
    FLASK_ENV = 'testing'

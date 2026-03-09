import os

class BaseConfig:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
    MONGO_URI = os.getenv('MONGO_URI')
    RATE_LIMIT = "200 per day"
    RATE_LIMIT_AUTH = "5 per minute"

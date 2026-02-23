import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")
    MONGO_URI = os.getenv("MONGO_URI")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB

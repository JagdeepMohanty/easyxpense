from app import create_app
import os

# Production: Environment variables must be set on Render
# No .env loading in production
app = create_app('production')
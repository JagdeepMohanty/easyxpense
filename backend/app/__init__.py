from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import logging
import sys

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load environment variables
    app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/easyxpense')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['DEBUG'] = os.environ.get('FLASK_ENV') == 'development'
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB
    
    if not app.config['JWT_SECRET_KEY']:
        raise ValueError('JWT_SECRET_KEY environment variable is required')
    
    # CORS configuration
    CORS(app, 
         origins=['https://easyxpense.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=False)
    
    # MongoDB connection
    try:
        client = MongoClient(app.config['MONGO_URI'], serverSelectionTimeoutMS=5000)
        app.db = client['EasyXpense']
        app.db.command('ping')
        app.logger.info('MongoDB connected successfully')
    except Exception as e:
        app.logger.error(f'MongoDB connection failed: {e}')
        raise
    
    # Security headers
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.friends import friends_bp
    from app.routes.expenses import expenses_bp
    from app.routes.groups import groups_bp
    from app.routes.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(friends_bp, url_prefix='/api/friends')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Health endpoint
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'}), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app
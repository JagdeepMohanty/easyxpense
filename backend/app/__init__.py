from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import logging
import sys

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Determine environment
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    # Load configuration
    from app.config import config
    config_class = config.get(config_name, config['default'])
    app.config.from_object(config_class)
    
    # Validate configuration
    try:
        config_class.validate()
    except ValueError as e:
        logging.error(f'Configuration error: {e}')
        raise
    
    # Logging configuration
    if app.config['DEBUG']:
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s %(levelname)s: %(message)s'
        )
    else:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(levelname)s: %(message)s',
            handlers=[logging.StreamHandler(sys.stdout)]
        )
    
    app.logger.info(f'Starting EasyXpense Backend in {config_name} mode...')
    
    # CORS configuration
    CORS(app, 
         origins=app.config['CORS_ORIGINS'], 
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=False,
         max_age=3600)
    
    app.logger.info(f'CORS origins: {app.config["CORS_ORIGINS"]}')
    
    # Request size limits
    # Already set via app.config['MAX_CONTENT_LENGTH']
    
    # MongoDB connection
    app.db = None
    try:
        app.logger.info('Connecting to MongoDB...')
        client = MongoClient(
            app.config['MONGO_URI'], 
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            maxPoolSize=10,
            minPoolSize=1
        )
        app.db = client['EasyXpense']
        app.db.command('ping')
        app.logger.info(f'✓ MongoDB connected successfully to database: {app.db.name}')
    except Exception as e:
        app.logger.error(f'✗ MongoDB connection failed: {e}')
        app.db = None
        raise RuntimeError(f'Failed to connect to MongoDB: {e}')
    
    # Security headers middleware
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
    
    # Request validation and logging
    @app.before_request
    def log_and_validate():
        # Skip logging for health checks
        if request.path in ['/health', '/api/health']:
            return
        
        app.logger.info(f'{request.method} {request.path} from {request.remote_addr}')
        
        # Validate Content-Type for POST/PUT
        if request.method in ['POST', 'PUT']:
            if request.content_type and 'application/json' not in request.content_type:
                return jsonify({'success': False, 'error': 'Content-Type must be application/json'}), 400
    
    # Register blueprints
    try:
        from app.routes.auth import auth_bp
        from app.routes.friends import friends_bp
        from app.routes.expenses import expenses_bp
        from app.routes.settlements import settlements_bp
        from app.routes.debts import debts_bp
        from app.routes.health import health_bp
        from app.routes.groups import groups_bp
        from app.routes.group_transactions import group_transactions_bp
        from app.routes.analytics import analytics_bp
        
        app.register_blueprint(auth_bp, url_prefix='/api')
        app.register_blueprint(friends_bp, url_prefix='/api')
        app.register_blueprint(expenses_bp, url_prefix='/api')
        app.register_blueprint(settlements_bp, url_prefix='/api')
        app.register_blueprint(debts_bp, url_prefix='/api')
        app.register_blueprint(health_bp, url_prefix='/api')
        app.register_blueprint(groups_bp, url_prefix='/api')
        app.register_blueprint(group_transactions_bp, url_prefix='/api')
        app.register_blueprint(analytics_bp, url_prefix='/api')
        
        app.logger.info('All blueprints registered successfully')
    except Exception as e:
        app.logger.error(f'Failed to register blueprints: {e}')
        raise
    
    # Root endpoint
    @app.route('/', methods=['GET', 'HEAD'])
    def root():
        """Root endpoint for backend status"""
        try:
            db_status = 'connected' if app.db is not None else 'disconnected'
            return jsonify({
                'status': 'ok',
                'service': 'EasyXpense Backend',
                'environment': app.config.get('ENV', 'production'),
                'database': db_status
            }), 200
        except Exception as e:
            app.logger.error(f'Root endpoint error: {e}')
            return jsonify({
                'status': 'error',
                'service': 'EasyXpense Backend',
                'database': 'unknown'
            }), 200
    
    # Health endpoint for monitoring
    @app.route('/health', methods=['GET', 'HEAD'])
    def health():
        """Simple health check for Render monitoring"""
        try:
            db_status = 'connected' if app.db is not None else 'disconnected'
            return jsonify({
                'status': 'healthy',
                'database': db_status
            }), 200
        except Exception as e:
            app.logger.error(f'Health check error: {e}')
            return jsonify({
                'status': 'healthy',
                'database': 'unknown'
            }), 200
    
    # Enhanced error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'success': False, 'error': 'Bad request'}), 400
    
    @app.errorhandler(404)
    def not_found(error):
        if request.path not in ['/', '/health']:
            app.logger.warning(f'Endpoint not found: {request.path}')
        return jsonify({'success': False, 'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'success': False, 'error': 'Method not allowed'}), 405
    
    @app.errorhandler(413)
    def request_entity_too_large(error):
        app.logger.warning(f'Request too large from {request.remote_addr}')
        return jsonify({'success': False, 'error': 'Request body too large'}), 413
    
    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({'success': False, 'error': 'Too many requests'}), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal server error: {error}')
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
    
    @app.errorhandler(503)
    def service_unavailable(error):
        app.logger.error(f'Service unavailable: {error}')
        return jsonify({'success': False, 'error': 'Service temporarily unavailable'}), 503
    
    app.logger.info('EasyXpense Backend initialized successfully')
    return app
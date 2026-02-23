from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from .config import Config
from .extensions import init_db

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # CORS configuration
    CORS(app, 
         origins=['https://easyxpense.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'])
    
    # Initialize MongoDB
    try:
        init_db(app)
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
    from app.routes.users import users_bp
    from app.routes.groups import groups_bp
    from app.routes.expenses import expenses_bp
    from app.routes.debts import debts_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(groups_bp, url_prefix="/api/groups")
    app.register_blueprint(expenses_bp, url_prefix="/api/expenses")
    app.register_blueprint(debts_bp, url_prefix="/api/debts")
    
    # Health check endpoint
    @app.route("/api/health")
    @app.route("/health")
    def health():
        try:
            app.db.command('ping')
            return jsonify({"status": "ok", "database": "connected"}), 200
        except Exception as e:
            return jsonify({"status": "error", "database": "disconnected"}), 503
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500
    
    return app

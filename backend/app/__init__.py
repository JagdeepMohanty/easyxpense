from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from .extensions import init_db
from .config import get_config

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())
    
    # CORS configuration with credentials support
    CORS(app, 
         origins=['https://easyxpense.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    
    # Initialize rate limiter
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[app.config.get('RATE_LIMIT', '200 per day'), "50 per hour"],
        storage_uri="memory://"
    )
    
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
    from app.routes.friends import friends_bp
    from app.routes.reminders import reminders_bp
    from app.routes.settlements import settlements_bp
    from app.routes.search import search_bp
    from app.routes.debt_graph import debt_graph_bp
    from app.routes.debt_simplifier import debt_simplifier_bp
    from app.routes.advanced_analytics import advanced_analytics_bp
    
    limiter.limit("5 per minute")(auth_bp)
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(groups_bp, url_prefix="/api/groups")
    app.register_blueprint(expenses_bp, url_prefix="/api/expenses")
    app.register_blueprint(debts_bp, url_prefix="/api/debts")
    app.register_blueprint(friends_bp, url_prefix="/api/friends")
    app.register_blueprint(reminders_bp, url_prefix="/api/reminders")
    app.register_blueprint(settlements_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(debt_graph_bp, url_prefix="/api")
    app.register_blueprint(debt_simplifier_bp, url_prefix="/api")
    app.register_blueprint(advanced_analytics_bp, url_prefix="/api")
    
    # Health check endpoint
    @app.route("/api/health")
    @app.route("/health")
    def health():
        try:
            app.db.command('ping')
            return jsonify({"status": "ok", "database": "connected"}), 200
        except Exception as e:
            return jsonify({"status": "error", "database": "disconnected"}), 503
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "error": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal error: {error}')
        return jsonify({"success": False, "error": "Internal server error"}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        app.logger.error(f'Unhandled exception: {error}')
        return jsonify({"success": False, "error": str(error)}), 500
    
    return app

from flask import Blueprint, jsonify, current_app
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@health_bp.route('/', methods=['GET'])
def root():
    return 'Hello from Flask backend!', 200
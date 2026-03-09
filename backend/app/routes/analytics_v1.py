from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.services import analytics_service

analytics_v1_bp = Blueprint('analytics_v1', __name__)

@analytics_v1_bp.route('/monthly', methods=['GET'])
@token_required
def get_monthly_summary():
    try:
        months = int(request.args.get('months', 6))
        data = analytics_service.get_monthly_summary(request.user_id, months)
        return jsonify({'data': data}), 200
        
    except Exception as e:
        current_app.logger.error(f'Monthly summary error: {e}')
        return jsonify({'error': 'Failed to fetch monthly summary'}), 500

@analytics_v1_bp.route('/categories', methods=['GET'])
@token_required
def get_category_breakdown():
    try:
        data = analytics_service.get_category_breakdown(request.user_id)
        return jsonify({'data': data}), 200
        
    except Exception as e:
        current_app.logger.error(f'Category breakdown error: {e}')
        return jsonify({'error': 'Failed to fetch category breakdown'}), 500

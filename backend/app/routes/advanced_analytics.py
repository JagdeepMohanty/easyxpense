from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.utils.api_response import success_response, error_response
from app.services.advanced_analytics_service import (
    get_monthly_spending,
    get_category_breakdown,
    get_daily_spending_trend,
    get_group_spending,
    get_spending_comparison,
    clear_cache
)
from app.services.spending_insights_service import (
    generate_insights,
    detect_recurring_expenses,
    detect_anomalies
)
from app.services.forecast_service import (
    predict_monthly_spending,
    get_spending_forecast_breakdown
)
from bson import ObjectId

advanced_analytics_bp = Blueprint('advanced_analytics', __name__)

@advanced_analytics_bp.route('/analytics/monthly', methods=['GET'])
@token_required
def get_monthly_analytics():
    """Get monthly spending analytics"""
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        data = get_monthly_spending(request.user_id, year, month)
        comparison = get_spending_comparison(request.user_id)
        
        return success_response({
            **data,
            'comparison': comparison
        })
    except Exception as e:
        current_app.logger.error(f'Monthly analytics error: {e}')
        return error_response('Failed to get monthly analytics', 500)

@advanced_analytics_bp.route('/analytics/categories', methods=['GET'])
@token_required
def get_category_analytics():
    """Get category breakdown analytics"""
    try:
        days = request.args.get('days', 30, type=int)
        data = get_category_breakdown(request.user_id, days)
        
        return success_response(data)
    except Exception as e:
        current_app.logger.error(f'Category analytics error: {e}')
        return error_response('Failed to get category analytics', 500)

@advanced_analytics_bp.route('/analytics/trends', methods=['GET'])
@token_required
def get_trend_analytics():
    """Get daily spending trends"""
    try:
        days = request.args.get('days', 30, type=int)
        data = get_daily_spending_trend(request.user_id, days)
        
        return success_response(data)
    except Exception as e:
        current_app.logger.error(f'Trend analytics error: {e}')
        return error_response('Failed to get trend analytics', 500)

@advanced_analytics_bp.route('/analytics/groups/<group_id>', methods=['GET'])
@token_required
def get_group_analytics(group_id):
    """Get group spending analytics"""
    try:
        if not ObjectId.is_valid(group_id):
            return error_response('Invalid group ID', 400)
        
        data = get_group_spending(ObjectId(group_id))
        
        return success_response(data)
    except Exception as e:
        current_app.logger.error(f'Group analytics error: {e}')
        return error_response('Failed to get group analytics', 500)

@advanced_analytics_bp.route('/insights', methods=['GET'])
@token_required
def get_insights():
    """Get intelligent spending insights"""
    try:
        insights = generate_insights(request.user_id)
        
        return success_response({
            'insights': insights,
            'count': len(insights)
        })
    except Exception as e:
        current_app.logger.error(f'Insights error: {e}')
        return error_response('Failed to generate insights', 500)

@advanced_analytics_bp.route('/subscriptions', methods=['GET'])
@token_required
def get_subscriptions():
    """Get detected recurring expenses/subscriptions"""
    try:
        days = request.args.get('days', 90, type=int)
        subscriptions = detect_recurring_expenses(request.user_id, days)
        
        return success_response({
            'subscriptions': subscriptions,
            'count': len(subscriptions),
            'total_monthly': round(sum(s['amount'] for s in subscriptions if s['frequency'] == 'monthly'), 2)
        })
    except Exception as e:
        current_app.logger.error(f'Subscriptions error: {e}')
        return error_response('Failed to detect subscriptions', 500)

@advanced_analytics_bp.route('/anomalies', methods=['GET'])
@token_required
def get_anomalies():
    """Get detected anomalous expenses"""
    try:
        anomalies = detect_anomalies(request.user_id)
        
        return success_response({
            'anomalies': anomalies,
            'count': len(anomalies)
        })
    except Exception as e:
        current_app.logger.error(f'Anomalies error: {e}')
        return error_response('Failed to detect anomalies', 500)

@advanced_analytics_bp.route('/forecast/monthly', methods=['GET'])
@token_required
def get_monthly_forecast():
    """Get monthly spending forecast"""
    try:
        months_ahead = request.args.get('months', 1, type=int)
        forecast = predict_monthly_spending(request.user_id, months_ahead)
        
        return success_response(forecast)
    except Exception as e:
        current_app.logger.error(f'Forecast error: {e}')
        return error_response('Failed to generate forecast', 500)

@advanced_analytics_bp.route('/forecast/categories', methods=['GET'])
@token_required
def get_category_forecast():
    """Get category-wise spending forecast"""
    try:
        forecast = get_spending_forecast_breakdown(request.user_id)
        
        return success_response(forecast)
    except Exception as e:
        current_app.logger.error(f'Category forecast error: {e}')
        return error_response('Failed to generate category forecast', 500)

@advanced_analytics_bp.route('/analytics/dashboard', methods=['GET'])
@token_required
def get_dashboard_analytics():
    """Get comprehensive dashboard analytics"""
    try:
        monthly = get_monthly_spending(request.user_id)
        categories = get_category_breakdown(request.user_id, 30)
        trends = get_daily_spending_trend(request.user_id, 30)
        insights = generate_insights(request.user_id)
        forecast = predict_monthly_spending(request.user_id)
        comparison = get_spending_comparison(request.user_id)
        
        return success_response({
            'monthly': monthly,
            'categories': categories,
            'trends': trends,
            'insights': insights[:3],  # Top 3 insights
            'forecast': forecast,
            'comparison': comparison
        })
    except Exception as e:
        current_app.logger.error(f'Dashboard analytics error: {e}')
        return error_response('Failed to get dashboard analytics', 500)

@advanced_analytics_bp.route('/analytics/cache/clear', methods=['POST'])
@token_required
def clear_analytics_cache():
    """Clear analytics cache (admin/debug)"""
    try:
        clear_cache()
        return success_response({'message': 'Cache cleared'})
    except Exception as e:
        return error_response('Failed to clear cache', 500)

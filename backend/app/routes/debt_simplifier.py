from flask import Blueprint, request, jsonify
from bson import ObjectId
from app.middleware.auth import token_required
from app.services.debt_simplifier import (
    simplify_group_debts, 
    simplify_user_debts,
    calculate_debt_reduction
)
from app.utils.api_response import success_response, error_response
from app.utils.logger import log_info, log_error

debt_simplifier_bp = Blueprint('debt_simplifier', __name__)

@debt_simplifier_bp.route('/groups/<group_id>/simplify-debts', methods=['POST'])
@token_required
def simplify_group_debts_endpoint(group_id):
    """
    Simplify debts within a group
    
    POST /api/groups/{group_id}/simplify-debts
    
    Response:
    {
        "success": true,
        "data": {
            "simplified_transactions": [
                {"from": "Alice", "to": "Bob", "amount": 100}
            ],
            "stats": {
                "original_count": 6,
                "simplified_count": 2,
                "reduction_percentage": 66.7
            }
        }
    }
    """
    try:
        # Validate group_id
        if not ObjectId.is_valid(group_id):
            return error_response('Invalid group ID', 400)
        
        group_obj_id = ObjectId(group_id)
        
        # Simplify debts
        simplified = simplify_group_debts(group_obj_id)
        
        # Calculate reduction stats
        stats = calculate_debt_reduction(group_obj_id)
        
        log_info(f"Debts simplified for group", group_id=group_id, 
                 transactions=len(simplified))
        
        return success_response({
            'simplified_transactions': simplified,
            'stats': stats
        }, 'Debts simplified successfully')
        
    except Exception as e:
        log_error(f"Error simplifying group debts", error=str(e), group_id=group_id)
        return error_response(str(e), 500)

@debt_simplifier_bp.route('/debts/simplify', methods=['POST'])
@token_required
def simplify_user_debts_endpoint():
    """
    Simplify all debts for current user across all groups
    
    POST /api/debts/simplify
    
    Response:
    {
        "success": true,
        "data": {
            "group_123": [
                {"from": "Alice", "to": "You", "amount": 50}
            ],
            "group_456": [
                {"from": "You", "to": "Bob", "amount": 75}
            ]
        }
    }
    """
    try:
        user_id = request.user_id
        
        # Simplify debts for user
        simplified = simplify_user_debts(user_id)
        
        log_info(f"Debts simplified for user", user_id=user_id, 
                 groups=len(simplified))
        
        return success_response(simplified, 'Your debts simplified successfully')
        
    except Exception as e:
        log_error(f"Error simplifying user debts", error=str(e))
        return error_response(str(e), 500)

@debt_simplifier_bp.route('/groups/<group_id>/debt-stats', methods=['GET'])
@token_required
def get_debt_stats(group_id):
    """
    Get debt reduction statistics without simplifying
    
    GET /api/groups/{group_id}/debt-stats
    
    Response:
    {
        "success": true,
        "data": {
            "original_count": 6,
            "simplified_count": 2,
            "reduction_percentage": 66.7
        }
    }
    """
    try:
        if not ObjectId.is_valid(group_id):
            return error_response('Invalid group ID', 400)
        
        group_obj_id = ObjectId(group_id)
        stats = calculate_debt_reduction(group_obj_id)
        
        return success_response(stats, 'Debt statistics calculated')
        
    except Exception as e:
        log_error(f"Error calculating debt stats", error=str(e), group_id=group_id)
        return error_response(str(e), 500)

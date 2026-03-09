from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.models.expense_model import Expense
from app.utils.api_response import success_response, error_response
from bson import ObjectId
import re

search_bp = Blueprint('search', __name__)

@search_bp.route('/search', methods=['GET'])
@token_required
def global_search():
    """
    Global search across friends, expenses, and groups
    GET /api/search?q=pizza
    """
    try:
        query = request.args.get('q', '').strip()
        
        if not query or len(query) < 2:
            return error_response('Search query must be at least 2 characters', 400)
        
        user_id = request.user_id
        
        # Create case-insensitive regex pattern
        pattern = re.compile(re.escape(query), re.IGNORECASE)
        
        # Search friends
        friends = list(current_app.db.friends.find({
            'user_id': user_id,
            'name': {'$regex': pattern}
        }).limit(10))
        
        friends_results = [{
            'id': str(f['_id']),
            'name': f['name'],
            'phone': f.get('phone'),
            'type': 'friend'
        } for f in friends]
        
        # Search expenses
        expenses = list(current_app.db.expenses.find({
            'user_id': user_id,
            '$or': [
                {'description': {'$regex': pattern}},
                {'category': {'$regex': pattern}}
            ]
        }).sort('date', -1).limit(10))
        
        expenses_results = [{
            'id': str(e['_id']),
            'description': e['description'],
            'amount': e['amount'],
            'category': e.get('category'),
            'date': e['date'].isoformat() if e.get('date') else None,
            'type': 'expense'
        } for e in expenses]
        
        # Search groups
        groups = list(current_app.db.groups.find({
            'user_id': user_id,
            'name': {'$regex': pattern}
        }).limit(10))
        
        groups_results = [{
            'id': str(g['_id']),
            'name': g['name'],
            'group_code': g.get('group_code'),
            'members': g.get('members', []),
            'type': 'group'
        } for g in groups]
        
        return success_response({
            'friends': friends_results,
            'expenses': expenses_results,
            'groups': groups_results,
            'total': len(friends_results) + len(expenses_results) + len(groups_results)
        })
        
    except Exception as e:
        current_app.logger.error(f'Search error: {e}')
        return error_response('Search failed', 500)

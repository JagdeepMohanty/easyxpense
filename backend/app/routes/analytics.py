from flask import Blueprint, request, jsonify, current_app
from app.models.expense import Expense
from app.models.group_transaction import GroupTransaction
from app.models.group import Group
from app.middleware.auth import token_required
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/expenses/monthly-summary', methods=['GET'])
@token_required
def monthly_summary():
    user = request.current_user
    months = int(request.args.get('months', 6))
    
    try:
        expense_model = Expense(current_app.db)
        data = expense_model.get_monthly_summary(user['_id'], months)
        
        # Format response
        result = []
        for item in data:
            month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            result.append({
                'month': month_names[item['_id']['month']],
                'year': item['_id']['year'],
                'amount': item['total'],
                'count': item['count']
            })
        
        return jsonify({'data': result}), 200
    except Exception as e:
        current_app.logger.error(f'Monthly summary error: {e}')
        return jsonify({'error': 'Failed to fetch monthly summary'}), 500

@analytics_bp.route('/expenses/category-breakdown', methods=['GET'])
@token_required
def category_breakdown():
    user = request.current_user
    
    try:
        expense_model = Expense(current_app.db)
        data = expense_model.get_category_breakdown(user['_id'])
        
        result = []
        for item in data:
            result.append({
                'name': item['_id'] or 'Others',
                'value': item['total'],
                'count': item['count']
            })
        
        return jsonify({'data': result}), 200
    except Exception as e:
        current_app.logger.error(f'Category breakdown error: {e}')
        return jsonify({'error': 'Failed to fetch category breakdown'}), 500

@analytics_bp.route('/groups/<group_id>/summary', methods=['GET'])
@token_required
def group_summary(group_id):
    user = request.current_user
    
    # Verify group ownership
    group_model = Group(current_app.db)
    group = group_model.get_group_by_id(group_id)
    if not group or str(group['user_id']) != str(user['_id']):
        return jsonify({'error': 'Group not found'}), 404
    
    try:
        txn_model = GroupTransaction(current_app.db)
        transactions = txn_model.get_by_group(group_id, 1, 1000)['data']
        
        total_expense = sum(txn['total_amount'] for txn in transactions)
        total_transactions = len(transactions)
        
        # Category breakdown
        categories = {}
        for txn in transactions:
            cat = txn.get('category', 'Others')
            categories[cat] = categories.get(cat, 0) + txn['total_amount']
        
        return jsonify({
            'total_expense': total_expense,
            'total_transactions': total_transactions,
            'categories': categories,
            'member_count': len(group.get('members', []))
        }), 200
    except Exception as e:
        current_app.logger.error(f'Group summary error: {e}')
        return jsonify({'error': 'Failed to fetch group summary'}), 500

@analytics_bp.route('/groups/<group_id>/member-balances', methods=['GET'])
@token_required
def group_member_balances(group_id):
    user = request.current_user
    
    # Verify group ownership
    group_model = Group(current_app.db)
    group = group_model.get_group_by_id(group_id)
    if not group or str(group['user_id']) != str(user['_id']):
        return jsonify({'error': 'Group not found'}), 404
    
    try:
        txn_model = GroupTransaction(current_app.db)
        balances = txn_model.get_member_balances(group_id)
        
        return jsonify({'balances': balances}), 200
    except Exception as e:
        current_app.logger.error(f'Member balances error: {e}')
        return jsonify({'error': 'Failed to fetch member balances'}), 500

@analytics_bp.route('/groups/<group_id>/chart-data', methods=['GET'])
@token_required
def group_chart_data(group_id):
    user = request.current_user
    
    # Verify group ownership
    group_model = Group(current_app.db)
    group = group_model.get_group_by_id(group_id)
    if not group or str(group['user_id']) != str(user['_id']):
        return jsonify({'error': 'Group not found'}), 404
    
    try:
        txn_model = GroupTransaction(current_app.db)
        transactions = txn_model.get_by_group(group_id, 1, 1000)['data']
        
        # Member spending
        member_spending = {}
        for txn in transactions:
            paid_by = txn['paid_by']
            member_spending[paid_by] = member_spending.get(paid_by, 0) + txn['total_amount']
        
        # Category split
        category_split = {}
        for txn in transactions:
            cat = txn.get('category', 'Others')
            category_split[cat] = category_split.get(cat, 0) + txn['total_amount']
        
        return jsonify({
            'member_spending': [{'name': k, 'amount': v} for k, v in member_spending.items()],
            'category_split': [{'name': k, 'value': v} for k, v in category_split.items()]
        }), 200
    except Exception as e:
        current_app.logger.error(f'Chart data error: {e}')
        return jsonify({'error': 'Failed to fetch chart data'}), 500

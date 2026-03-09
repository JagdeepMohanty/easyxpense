from flask import Blueprint, request, jsonify, current_app
from app.middleware.auth import token_required
from app.models.reminder_model import Reminder
from app.utils.helpers import sanitize_input
from app.utils.api_response import success_response, error_response
from datetime import datetime
from bson import ObjectId

reminders_bp = Blueprint('reminders', __name__)

@reminders_bp.route('/', methods=['GET'])
@token_required
def get_reminders():
    """Get all reminders for current user"""
    try:
        query = {'user_id': request.user_id, 'is_active': True}
        reminders = list(current_app.db.reminders.find(query).sort('due_date', 1))
        
        return success_response({
            'reminders': [Reminder.to_dict(r) for r in reminders]
        })
        
    except Exception as e:
        current_app.logger.error(f'Get reminders error: {e}')
        return error_response('Failed to fetch reminders', 500)

@reminders_bp.route('/', methods=['POST'])
@token_required
def create_reminder():
    """Create new reminder"""
    try:
        data = sanitize_input(request.get_json())
        title = data.get('title')
        amount = data.get('amount')
        due_date = data.get('due_date')
        frequency = data.get('frequency', 'once')
        category = data.get('category')
        notes = data.get('notes')
        
        if not all([title, amount, due_date]):
            return error_response('Title, amount, and due_date are required', 400)
        
        try:
            amount = float(amount)
            if amount <= 0:
                return error_response('Amount must be positive', 400)
        except ValueError:
            return error_response('Invalid amount', 400)
        
        if frequency not in ['once', 'daily', 'weekly', 'monthly', 'yearly']:
            return error_response('Invalid frequency', 400)
        
        reminder_data = Reminder.create(
            request.user_id, title, amount, due_date, frequency, category, notes
        )
        
        result = current_app.db.reminders.insert_one(reminder_data)
        
        return success_response({
            'id': str(result.inserted_id),
            'message': 'Reminder created successfully'
        }, 'Reminder created', 201)
        
    except Exception as e:
        current_app.logger.error(f'Create reminder error: {e}')
        return error_response('Failed to create reminder', 500)

@reminders_bp.route('/<reminder_id>', methods=['PUT'])
@token_required
def update_reminder(reminder_id):
    """Update reminder"""
    try:
        data = sanitize_input(request.get_json())
        
        update_fields = {}
        if 'title' in data:
            update_fields['title'] = data['title']
        if 'amount' in data:
            update_fields['amount'] = float(data['amount'])
        if 'due_date' in data:
            update_fields['due_date'] = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        if 'frequency' in data:
            update_fields['frequency'] = data['frequency']
        if 'category' in data:
            update_fields['category'] = data['category']
        if 'notes' in data:
            update_fields['notes'] = data['notes']
        if 'is_active' in data:
            update_fields['is_active'] = data['is_active']
        
        update_fields['updated_at'] = datetime.utcnow()
        
        result = current_app.db.reminders.update_one(
            {'_id': ObjectId(reminder_id), 'user_id': request.user_id},
            {'$set': update_fields}
        )
        
        if result.matched_count == 0:
            return error_response('Reminder not found', 404)
        
        return success_response({'message': 'Reminder updated successfully'})
        
    except Exception as e:
        current_app.logger.error(f'Update reminder error: {e}')
        return error_response('Failed to update reminder', 500)

@reminders_bp.route('/<reminder_id>', methods=['DELETE'])
@token_required
def delete_reminder(reminder_id):
    """Delete reminder"""
    try:
        result = current_app.db.reminders.delete_one({
            '_id': ObjectId(reminder_id),
            'user_id': request.user_id
        })
        
        if result.deleted_count == 0:
            return error_response('Reminder not found', 404)
        
        return success_response({'message': 'Reminder deleted successfully'})
        
    except Exception as e:
        current_app.logger.error(f'Delete reminder error: {e}')
        return error_response('Failed to delete reminder', 500)

@reminders_bp.route('/upcoming', methods=['GET'])
@token_required
def get_upcoming_reminders():
    """Get upcoming reminders (next 7 days)"""
    try:
        from datetime import timedelta
        now = datetime.utcnow()
        next_week = now + timedelta(days=7)
        
        query = {
            'user_id': request.user_id,
            'is_active': True,
            'due_date': {'$gte': now, '$lte': next_week}
        }
        
        reminders = list(current_app.db.reminders.find(query).sort('due_date', 1))
        
        return success_response({
            'reminders': [Reminder.to_dict(r) for r in reminders]
        })
        
    except Exception as e:
        current_app.logger.error(f'Get upcoming reminders error: {e}')
        return error_response('Failed to fetch upcoming reminders', 500)

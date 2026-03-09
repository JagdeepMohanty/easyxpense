"""
Reminder Scheduler Service
Checks for due reminders and sends notifications
"""
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from app.extensions import db
from app.socketio_extension import emit_reminder_due
from app.utils.logger import log_info, log_error

scheduler = BackgroundScheduler()

def check_due_reminders():
    """Check for reminders due today and emit notifications"""
    try:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        # Find active reminders due today that haven't been reminded yet
        reminders = db.reminders.find({
            'is_active': True,
            'due_date': {'$gte': today_start, '$lt': today_end},
            '$or': [
                {'last_reminded': None},
                {'last_reminded': {'$lt': today_start}}
            ]
        })
        
        count = 0
        for reminder in reminders:
            # Emit realtime notification
            emit_reminder_due(reminder['user_id'], {
                'id': str(reminder['_id']),
                'title': reminder['title'],
                'amount': reminder['amount'],
                'due_date': reminder['due_date'].isoformat(),
                'category': reminder.get('category'),
                'notes': reminder.get('notes')
            })
            
            # Update last_reminded
            db.reminders.update_one(
                {'_id': reminder['_id']},
                {'$set': {'last_reminded': now}}
            )
            
            # Handle recurring reminders
            if reminder['frequency'] != 'once':
                next_due = calculate_next_due_date(reminder['due_date'], reminder['frequency'])
                db.reminders.update_one(
                    {'_id': reminder['_id']},
                    {'$set': {'due_date': next_due, 'updated_at': now}}
                )
            else:
                # Deactivate one-time reminders
                db.reminders.update_one(
                    {'_id': reminder['_id']},
                    {'$set': {'is_active': False, 'updated_at': now}}
                )
            
            count += 1
        
        if count > 0:
            log_info(f"Processed {count} due reminders")
        
    except Exception as e:
        log_error(f"Error checking reminders", error=str(e))

def calculate_next_due_date(current_due, frequency):
    """Calculate next due date based on frequency"""
    if frequency == 'daily':
        return current_due + timedelta(days=1)
    elif frequency == 'weekly':
        return current_due + timedelta(weeks=1)
    elif frequency == 'monthly':
        # Add one month (approximate)
        next_month = current_due.month + 1
        next_year = current_due.year
        if next_month > 12:
            next_month = 1
            next_year += 1
        return current_due.replace(year=next_year, month=next_month)
    elif frequency == 'yearly':
        return current_due.replace(year=current_due.year + 1)
    else:
        return current_due

def start_scheduler():
    """Start the reminder scheduler"""
    # Run check_due_reminders every day at 9 AM
    scheduler.add_job(
        check_due_reminders,
        'cron',
        hour=9,
        minute=0,
        id='check_reminders',
        replace_existing=True
    )
    
    # Also run immediately on startup for testing
    scheduler.add_job(
        check_due_reminders,
        'date',
        run_date=datetime.now() + timedelta(seconds=10),
        id='check_reminders_startup'
    )
    
    scheduler.start()
    log_info("Reminder scheduler started")

def stop_scheduler():
    """Stop the reminder scheduler"""
    scheduler.shutdown()
    log_info("Reminder scheduler stopped")

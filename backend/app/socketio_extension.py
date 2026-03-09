"""
Socket.IO Extension for Realtime Updates
"""
import socketio
from flask import request

# Create Socket.IO server
sio = socketio.Server(
    cors_allowed_origins=['https://easyxpense.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
    async_mode='threading'
)

# Store user sessions: {user_id: [sid1, sid2, ...]}
user_sessions = {}

@sio.event
def connect(sid, environ):
    """Handle client connection"""
    print(f'Client connected: {sid}')

@sio.event
def disconnect(sid):
    """Handle client disconnection"""
    # Remove from user_sessions
    for user_id, sessions in list(user_sessions.items()):
        if sid in sessions:
            sessions.remove(sid)
            if not sessions:
                del user_sessions[user_id]
    print(f'Client disconnected: {sid}')

@sio.event
def authenticate(sid, data):
    """Authenticate user and join their room"""
    user_id = data.get('user_id')
    if user_id:
        # Add to user sessions
        if user_id not in user_sessions:
            user_sessions[user_id] = []
        user_sessions[user_id].append(sid)
        
        # Join user room
        sio.enter_room(sid, f'user_{user_id}')
        print(f'User {user_id} authenticated with session {sid}')

@sio.event
def join_group(sid, data):
    """Join a group room for realtime updates"""
    group_id = data.get('group_id')
    if group_id:
        sio.enter_room(sid, f'group_{group_id}')
        print(f'Session {sid} joined group {group_id}')

@sio.event
def leave_group(sid, data):
    """Leave a group room"""
    group_id = data.get('group_id')
    if group_id:
        sio.leave_room(sid, f'group_{group_id}')
        print(f'Session {sid} left group {group_id}')

# Emit functions for backend use
def emit_expense_added(user_id, group_id, expense_data):
    """Emit expense_added event to user and group members"""
    if user_id:
        sio.emit('expense_added', expense_data, room=f'user_{user_id}')
    if group_id:
        sio.emit('expense_added', expense_data, room=f'group_{group_id}')

def emit_expense_updated(user_id, group_id, expense_data):
    """Emit expense_updated event"""
    if user_id:
        sio.emit('expense_updated', expense_data, room=f'user_{user_id}')
    if group_id:
        sio.emit('expense_updated', expense_data, room=f'group_{group_id}')

def emit_debt_settled(user_id, group_id, settlement_data):
    """Emit debt_settled event"""
    if user_id:
        sio.emit('debt_settled', settlement_data, room=f'user_{user_id}')
    if group_id:
        sio.emit('debt_settled', settlement_data, room=f'group_{group_id}')

def emit_reminder_due(user_id, reminder_data):
    """Emit reminder_due event to user"""
    if user_id:
        sio.emit('reminder_due', reminder_data, room=f'user_{user_id}')

def init_socketio(app):
    """Initialize Socket.IO with Flask app"""
    from socketio import WSGIApp
    app.wsgi_app = WSGIApp(sio, app.wsgi_app)
    app.logger.info('Socket.IO initialized')

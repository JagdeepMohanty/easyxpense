# Realtime Updates & Reminder System - Documentation

## 🎯 Overview

Implemented **Socket.IO realtime updates** and **APScheduler-based reminder system** for EasyXpense.

---

## PART 1: Realtime Updates (Socket.IO)

### Backend Implementation

#### 1. Socket.IO Extension (`app/socketio_extension.py`)

**Features**:
- WebSocket server with CORS support
- User authentication and session management
- Group room management
- Event emission functions

**Events**:
- `expense_added` - Emitted when expense is created
- `expense_updated` - Emitted when expense is modified
- `debt_settled` - Emitted when debt is settled
- `reminder_due` - Emitted when reminder is due

**Connection Flow**:
```python
# Client connects
@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')

# Client authenticates
@sio.event
def authenticate(sid, data):
    user_id = data.get('user_id')
    sio.enter_room(sid, f'user_{user_id}')

# Client joins group
@sio.event
def join_group(sid, data):
    group_id = data.get('group_id')
    sio.enter_room(sid, f'group_{group_id}')
```

#### 2. Integration with Routes

**Expenses** (`app/routes/expenses.py`):
```python
from app.socketio_extension import emit_expense_added

# After creating expense
emit_expense_added(user_id, group_id, {
    'id': expense_id,
    'amount': amount,
    'description': description,
    'category': category
})
```

**Settlements** (`app/routes/settlements.py`):
```python
from app.socketio_extension import emit_debt_settled

# After settling debt
emit_debt_settled(user_id, group_id, {
    'id': settlement_id,
    'from_user': from_user,
    'to_user': to_user,
    'amount': amount
})
```

### Frontend Implementation

#### 1. Socket Service (`frontend/src/services/socketService.js`)

**Features**:
- Singleton Socket.IO client
- Auto-reconnection
- Group room management
- Event listener management

**Usage**:
```javascript
import { socketService, SOCKET_EVENTS } from './services/socketService';

// Connect
socketService.connect(userId);

// Listen for events
socketService.on(SOCKET_EVENTS.EXPENSE_ADDED, (data) => {
  console.log('New expense:', data);
});

// Join group
socketService.joinGroup(groupId);

// Disconnect
socketService.disconnect();
```

#### 2. React Hook (`frontend/src/hooks/useRealtimeUpdates.js`)

**Usage in Components**:
```javascript
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import toast from 'react-hot-toast';

function Dashboard() {
  const { expenses, refreshExpenses } = useExpenses();
  
  useRealtimeUpdates({
    userId: user.id,
    onExpenseAdded: (data) => {
      toast.success(`New expense: ${data.description}`);
      refreshExpenses(); // Refresh data
    },
    onDebtSettled: (data) => {
      toast.success(`Debt settled!`);
      refreshExpenses();
    },
    onReminderDue: (data) => {
      toast.info(`Reminder: ${data.title} - ₹${data.amount}`);
    }
  });
  
  return <div>...</div>;
}
```

---

## PART 2: Reminder System

### Database Schema

#### Reminders Collection

```javascript
{
  _id: ObjectId,
  user_id: String,
  title: String,              // "Rent Payment"
  amount: Number,             // 15000
  due_date: DateTime,         // 2024-02-01T00:00:00Z
  frequency: String,          // "once", "daily", "weekly", "monthly", "yearly"
  category: String,           // "bills" (optional)
  notes: String,              // "Pay to landlord" (optional)
  is_active: Boolean,         // true
  last_reminded: DateTime,    // Last time reminder was sent
  created_at: DateTime,
  updated_at: DateTime
}
```

**Indexes**:
```javascript
db.reminders.createIndex({ user_id: 1, due_date: 1 })
db.reminders.createIndex({ is_active: 1, due_date: 1 })
```

### Backend Implementation

#### 1. Reminder Model (`app/models/reminder_model.py`)

```python
from app.models.reminder_model import Reminder

reminder_data = Reminder.create(
    user_id="user123",
    title="Rent Payment",
    amount=15000,
    due_date="2024-02-01T00:00:00Z",
    frequency="monthly",
    category="bills",
    notes="Pay to landlord"
)
```

#### 2. Reminder Scheduler (`app/services/reminder_scheduler.py`)

**Features**:
- APScheduler background scheduler
- Daily check at 9 AM
- Recurring reminder support
- Realtime notification via Socket.IO

**Algorithm**:
```python
def check_due_reminders():
    # Find reminders due today
    reminders = db.reminders.find({
        'is_active': True,
        'due_date': {'$gte': today_start, '$lt': today_end},
        'last_reminded': {'$lt': today_start}
    })
    
    for reminder in reminders:
        # Emit realtime notification
        emit_reminder_due(user_id, reminder_data)
        
        # Update last_reminded
        db.reminders.update_one(
            {'_id': reminder['_id']},
            {'$set': {'last_reminded': now}}
        )
        
        # Handle recurring
        if reminder['frequency'] != 'once':
            next_due = calculate_next_due_date(...)
            db.reminders.update_one(
                {'_id': reminder['_id']},
                {'$set': {'due_date': next_due}}
            )
        else:
            # Deactivate one-time reminders
            db.reminders.update_one(
                {'_id': reminder['_id']},
                {'$set': {'is_active': False}}
            )
```

**Frequency Calculation**:
- `daily`: +1 day
- `weekly`: +7 days
- `monthly`: +1 month (same day)
- `yearly`: +1 year (same date)

#### 3. Reminder API (`app/routes/reminders.py`)

**Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | Get all active reminders |
| POST | `/api/reminders` | Create new reminder |
| PUT | `/api/reminders/:id` | Update reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |
| GET | `/api/reminders/upcoming` | Get upcoming (next 7 days) |

**Example Request**:
```bash
POST /api/reminders
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Netflix Subscription",
  "amount": 649,
  "due_date": "2024-02-15T00:00:00Z",
  "frequency": "monthly",
  "category": "entertainment",
  "notes": "Auto-debit from credit card"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Reminder created",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "message": "Reminder created successfully"
  }
}
```

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
python-socketio==5.11.0
APScheduler==3.10.4
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "socket.io-client": "^4.7.2"
  }
}
```

---

## 🚀 Setup Instructions

### Backend Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Create indexes**:
```bash
python setup_indexes_v2.py
```

Add to script:
```python
# Reminders collection
db.reminders.create_index([("user_id", ASCENDING), ("due_date", ASCENDING)])
db.reminders.create_index([("is_active", ASCENDING), ("due_date", ASCENDING)])
```

3. **Start server**:
```bash
python wsgi.py
```

Socket.IO and scheduler start automatically.

### Frontend Setup

1. **Install dependencies**:
```bash
npm install socket.io-client
```

2. **Import and use**:
```javascript
// In main App component
import { socketService } from './services/socketService';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      socketService.connect(user.id);
    }
    
    return () => {
      socketService.disconnect();
    };
  }, [user]);
  
  return <Router>...</Router>;
}
```

---

## 🧪 Testing

### Test Socket.IO Connection

**Backend**:
```bash
# Check logs
tail -f logs/app.log | grep "Socket"

# Should see:
# Socket.IO initialized
# Client connected: abc123
# User user123 authenticated with session abc123
```

**Frontend Console**:
```javascript
// Open browser console
socketService.connect('user123');
// Should see: "Socket connected: abc123"

socketService.joinGroup('group456');
// Should see: "Joined group: group456"
```

### Test Realtime Updates

1. **Open two browser windows**
2. **Login as different users in same group**
3. **Add expense in window 1**
4. **Window 2 should receive realtime update**

### Test Reminders

1. **Create reminder due today**:
```bash
POST /api/reminders
{
  "title": "Test Reminder",
  "amount": 100,
  "due_date": "2024-01-15T09:00:00Z",
  "frequency": "once"
}
```

2. **Wait for scheduler** (runs at 9 AM or 10 seconds after startup)

3. **Check frontend** - Should receive `reminder_due` event

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REALTIME ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
│
├─ socketService.connect(userId)
│  └─ Socket.IO Client connects to backend
│
├─ useRealtimeUpdates() hook
│  ├─ Listens: expense_added
│  ├─ Listens: expense_updated
│  ├─ Listens: debt_settled
│  └─ Listens: reminder_due
│
└─ Updates UI on events

Backend (Flask + Socket.IO)
│
├─ Socket.IO Server
│  ├─ User rooms: user_{user_id}
│  └─ Group rooms: group_{group_id}
│
├─ API Routes
│  ├─ POST /expenses → emit_expense_added()
│  └─ POST /settlements → emit_debt_settled()
│
└─ Reminder Scheduler (APScheduler)
   ├─ Runs daily at 9 AM
   ├─ Checks due reminders
   └─ emit_reminder_due()

Database (MongoDB)
│
├─ reminders collection
│  ├─ user_id + due_date index
│  └─ is_active + due_date index
│
└─ Query: Find reminders due today
```

---

## 🎯 Use Cases

### Use Case 1: Group Expense Notification
1. Alice adds expense in "Trip to Goa" group
2. Backend emits `expense_added` to `group_trip123`
3. Bob (in same group) receives realtime notification
4. Bob's dashboard updates automatically

### Use Case 2: Debt Settlement
1. Charlie settles debt with David
2. Backend emits `debt_settled` to both users
3. Both receive realtime notification
4. Debt tracker updates automatically

### Use Case 3: Monthly Rent Reminder
1. User creates reminder: "Rent - ₹15000 - Monthly"
2. Scheduler checks daily at 9 AM
3. On due date, emits `reminder_due` to user
4. User sees notification on dashboard
5. Next month's reminder auto-created

---

## 🔧 Configuration

### Socket.IO Settings

**Backend** (`app/socketio_extension.py`):
```python
sio = socketio.Server(
    cors_allowed_origins=[
        'https://easyxpense.netlify.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    async_mode='threading'
)
```

**Frontend** (`socketService.js`):
```javascript
const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
});
```

### Scheduler Settings

**Reminder Check Time**:
```python
scheduler.add_job(
    check_due_reminders,
    'cron',
    hour=9,      # 9 AM
    minute=0,
    id='check_reminders'
)
```

---

## ✅ Status

**Realtime Updates**: ✅ Complete
- Socket.IO backend: ✅
- Socket.IO frontend: ✅
- Event emissions: ✅
- React hook: ✅

**Reminder System**: ✅ Complete
- Database schema: ✅
- Reminder model: ✅
- Scheduler service: ✅
- API endpoints: ✅

**Files Created**: 8
**Dependencies Added**: 2 backend, 1 frontend

🚀 **Ready for deployment!**

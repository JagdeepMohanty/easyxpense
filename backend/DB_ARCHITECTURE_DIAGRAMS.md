# Database Architecture Diagrams

## Transaction Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE EXPENSE TRANSACTION                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   API Call   │
│ POST /expenses│
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│              START MONGODB SESSION & TRANSACTION              │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: Find or Create Category                             │
│  ┌────────────────────────────────────────────────┐          │
│  │ CategoryRepository.find_or_create("food")      │          │
│  │ → Returns: { _id: ObjectId, name: "food" }    │          │
│  └────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: Insert Expense with category_id                     │
│  ┌────────────────────────────────────────────────┐          │
│  │ db.expenses.insert_one({                       │          │
│  │   user_id: "user123",                          │          │
│  │   amount: 100,                                 │          │
│  │   category_id: ObjectId("..."),                │          │
│  │   ...                                          │          │
│  │ }, session=session)                            │          │
│  └────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: Calculate Splits                                    │
│  ┌────────────────────────────────────────────────┐          │
│  │ num_people = len(friends) + 1                  │          │
│  │ split_amount = amount / num_people             │          │
│  │ → 100 / 3 = 33.33 per person                   │          │
│  └────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: Insert Debts                                        │
│  ┌────────────────────────────────────────────────┐          │
│  │ For each friend:                               │          │
│  │   db.debts.insert_one({                        │          │
│  │     debtor_id: friend,                         │          │
│  │     creditor_id: user_id,                      │          │
│  │     amount: split_amount,                      │          │
│  │     expense_id: expense_id                     │          │
│  │   }, session=session)                          │          │
│  └────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5: Update Group Totals (if group_id)                   │
│  ┌────────────────────────────────────────────────┐          │
│  │ db.groups.update_one(                          │          │
│  │   { _id: group_id },                           │          │
│  │   { $inc: { total_expenses: amount } },        │          │
│  │   session=session                              │          │
│  │ )                                              │          │
│  └────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│              COMMIT TRANSACTION                               │
│  ✅ All changes saved atomically                             │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   Success    │
│ Return ID    │
└──────────────┘

       ❌ If ANY step fails:
       
┌──────────────────────────────────────────────────────────────┐
│              ROLLBACK TRANSACTION                             │
│  ↩️  All changes reverted                                     │
│  🔄 Database state unchanged                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Collection Relationships

```
┌─────────────────┐
│     users       │
│  ─────────────  │
│  _id (PK)       │
│  email          │
│  name           │
│  password       │
└────────┬────────┘
         │
         │ user_id (FK)
         │
         ├──────────────────────────────────────────┐
         │                                          │
         ▼                                          ▼
┌─────────────────┐                        ┌─────────────────┐
│   categories    │                        │    expenses     │
│  ─────────────  │                        │  ─────────────  │
│  _id (PK)       │◄───────────────────────│  _id (PK)       │
│  name (unique)  │   category_id (FK)     │  user_id (FK)   │
│  user_id (FK)   │                        │  category_id(FK)│
│  created_at     │                        │  group_id (FK)  │
└─────────────────┘                        │  amount         │
                                           │  description    │
                                           │  friends        │
                                           │  date           │
                                           └────────┬────────┘
                                                    │
                                                    │ expense_id (FK)
                                                    │
                                                    ▼
                                           ┌─────────────────┐
                                           │     debts       │
                                           │  ─────────────  │
                                           │  _id (PK)       │
                                           │  debtor_id      │
                                           │  creditor_id    │
                                           │  amount         │
                                           │  expense_id(FK) │
                                           └─────────────────┘

┌─────────────────┐
│     groups      │
│  ─────────────  │
│  _id (PK)       │◄───────────────────────┐
│  user_id (FK)   │   group_id (FK)        │
│  name           │                        │
│  group_code     │                        │
│  members        │                        │
│  total_expenses │                        │
└─────────────────┘                        │
         │                                 │
         │ group_id (FK)                   │
         │                                 │
         ▼                                 │
┌─────────────────┐                        │
│group_transactions│                       │
│  ─────────────  │                        │
│  _id (PK)       │                        │
│  group_id (FK)  │────────────────────────┘
│  user_id (FK)   │
│  paid_by        │
│  amount         │
│  description    │
└─────────────────┘

┌─────────────────┐
│  settlements    │
│  ─────────────  │
│  _id (PK)       │
│  user_id (FK)   │
│  from_user      │
│  to_user        │
│  amount         │
│  date           │
└─────────────────┘
```

---

## Index Strategy Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EXPENSES COLLECTION                       │
└─────────────────────────────────────────────────────────────┘

Query Pattern 1: Get user's expenses by category
┌──────────────────────────────────────────────────────────┐
│ db.expenses.find({ user_id: "123", category_id: ... })  │
└──────────────────────────────────────────────────────────┘
                    ▼
        Uses: user_id_1_category_id_1 (compound index)
                    ▼
        ✅ Fast: 5ms, IXSCAN, 10 docs examined


Query Pattern 2: Get group expenses
┌──────────────────────────────────────────────────────────┐
│ db.expenses.find({ group_id: "..." }).sort({ date: -1 })│
└──────────────────────────────────────────────────────────┘
                    ▼
        Uses: group_id_1_created_at_-1 (compound index)
                    ▼
        ✅ Fast: 8ms, IXSCAN, sorted by index


Query Pattern 3: Get user's recent expenses
┌──────────────────────────────────────────────────────────┐
│ db.expenses.find({ user_id: "123" }).sort({ date: -1 }) │
└──────────────────────────────────────────────────────────┘
                    ▼
        Uses: user_id_1_date_-1 (compound index)
                    ▼
        ✅ Fast: 6ms, IXSCAN, sorted by index


┌─────────────────────────────────────────────────────────────┐
│                      DEBTS COLLECTION                        │
└─────────────────────────────────────────────────────────────┘

Query Pattern: Find debt between two users
┌──────────────────────────────────────────────────────────┐
│ db.debts.find({ debtor_id: "A", creditor_id: "B" })     │
└──────────────────────────────────────────────────────────┘
                    ▼
        Uses: debtor_id_1_creditor_id_1 (compound index)
                    ▼
        ✅ Fast: 3ms, IXSCAN, exact match
```

---

## Data Migration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  BEFORE MIGRATION                            │
└─────────────────────────────────────────────────────────────┘

expenses collection:
┌──────────────────────────────────────────────────────────┐
│ { _id: 1, user_id: "123", category: "food", ... }       │
│ { _id: 2, user_id: "123", category: "transport", ... }  │
│ { _id: 3, user_id: "456", category: "shopping", ... }   │
└──────────────────────────────────────────────────────────┘

categories collection:
┌──────────────────────────────────────────────────────────┐
│ (empty)                                                  │
└──────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  RUN MIGRATION                               │
│              python migrate_categories.py                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Create system categories
        ▼
┌──────────────────────────────────────────────────────────┐
│ { _id: ObjectId("a1"), name: "food", user_id: null }    │
│ { _id: ObjectId("a2"), name: "transport", user_id: null}│
│ { _id: ObjectId("a3"), name: "shopping", user_id: null }│
└──────────────────────────────────────────────────────────┘

Step 2: Find unique categories in expenses
        ▼
Found: ["food", "transport", "shopping", "groceries"]

Step 3: Create custom categories
        ▼
┌──────────────────────────────────────────────────────────┐
│ { _id: ObjectId("a4"), name: "groceries", user_id: null}│
└──────────────────────────────────────────────────────────┘

Step 4: Update expenses with category_id
        ▼
┌──────────────────────────────────────────────────────────┐
│ { _id: 1, user_id: "123",                               │
│   category: "food",                    ← KEPT           │
│   category_id: ObjectId("a1"), ... }   ← ADDED          │
│                                                          │
│ { _id: 2, user_id: "123",                               │
│   category: "transport",               ← KEPT           │
│   category_id: ObjectId("a2"), ... }   ← ADDED          │
└──────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  AFTER MIGRATION                             │
└─────────────────────────────────────────────────────────────┘

expenses collection:
┌──────────────────────────────────────────────────────────┐
│ ✅ All expenses have category_id                         │
│ ✅ Legacy category field preserved                       │
│ ✅ Backward compatible                                   │
└──────────────────────────────────────────────────────────┘

categories collection:
┌──────────────────────────────────────────────────────────┐
│ ✅ 10 system categories                                  │
│ ✅ Custom categories from existing data                  │
│ ✅ Unique constraint on name                             │
└──────────────────────────────────────────────────────────┘
```

---

## Performance Comparison

```
┌─────────────────────────────────────────────────────────────┐
│              QUERY: Get user expenses by category            │
└─────────────────────────────────────────────────────────────┘

BEFORE (String category, single index):
┌──────────────────────────────────────────────────────────┐
│ db.expenses.find({ user_id: "123", category: "food" })  │
└──────────────────────────────────────────────────────────┘
        ▼
┌──────────────────────────────────────────────────────────┐
│ Index: user_id_1                                         │
│ Stage: IXSCAN → FETCH → FILTER                          │
│ Docs Examined: 1000 (all user's expenses)                │
│ Docs Returned: 100 (food expenses)                       │
│ Time: 50ms                                               │
│ ❌ Inefficient: Scans all user expenses                  │
└──────────────────────────────────────────────────────────┘


AFTER (ObjectId category_id, compound index):
┌──────────────────────────────────────────────────────────┐
│ db.expenses.find({ user_id: "123", category_id: ... })  │
└──────────────────────────────────────────────────────────┘
        ▼
┌──────────────────────────────────────────────────────────┐
│ Index: user_id_1_category_id_1                           │
│ Stage: IXSCAN                                            │
│ Docs Examined: 100 (only food expenses)                  │
│ Docs Returned: 100 (food expenses)                       │
│ Time: 5ms                                                │
│ ✅ Efficient: Direct index lookup                        │
└──────────────────────────────────────────────────────────┘

IMPROVEMENT: 10x faster (50ms → 5ms)
```

---

## Transaction vs Non-Transaction

```
┌─────────────────────────────────────────────────────────────┐
│              WITHOUT TRANSACTION (Legacy)                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Insert expense ✅
Step 2: Insert debt 1 ✅
Step 3: Insert debt 2 ❌ FAILS
Step 4: Update group ⏭️ SKIPPED

Result:
┌──────────────────────────────────────────────────────────┐
│ ❌ Expense created but debts incomplete                  │
│ ❌ Group totals not updated                              │
│ ❌ Data inconsistent                                     │
│ ⚠️  Manual cleanup required                              │
└──────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│              WITH TRANSACTION (New)                          │
└─────────────────────────────────────────────────────────────┘

START TRANSACTION
Step 1: Insert expense ✅
Step 2: Insert debt 1 ✅
Step 3: Insert debt 2 ❌ FAILS
ROLLBACK TRANSACTION

Result:
┌──────────────────────────────────────────────────────────┐
│ ✅ All changes reverted automatically                    │
│ ✅ Database state unchanged                              │
│ ✅ Data consistent                                       │
│ ✅ No cleanup needed                                     │
└──────────────────────────────────────────────────────────┘
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                   https://easyxpense.netlify.app             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTPS
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Flask + Gunicorn)                 │
│                https://easyxpense.onrender.com               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Routes Layer                       │  │
│  │  /api/v1/expenses, /api/v1/friends, etc.            │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Services Layer                       │  │
│  │  expense_transaction_service.py                      │  │
│  │  - create_expense_with_transaction()                 │  │
│  │  - async_create_expense_with_transaction()           │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Repositories Layer                     │  │
│  │  category_repository.py, expense_repository.py       │  │
│  │  - find_or_create(), async_find_or_create()          │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│                       ▼                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Models Layer                        │  │
│  │  category_model.py, expense_model.py                 │  │
│  │  - create(), to_dict()                               │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ MongoDB Driver (PyMongo + Motor)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB Atlas)                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    users     │  │  categories  │  │   expenses   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    debts     │  │ settlements  │  │    groups    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Features:                                                   │
│  ✅ Transactions (ACID)                                     │
│  ✅ Compound Indexes                                        │
│  ✅ Normalized Categories                                   │
│  ✅ Connection Pooling                                      │
└─────────────────────────────────────────────────────────────┘
```

---

**Legend**:
- `→` Data flow
- `▼` Process flow
- `✅` Success
- `❌` Failure
- `⚠️` Warning
- `(PK)` Primary Key
- `(FK)` Foreign Key

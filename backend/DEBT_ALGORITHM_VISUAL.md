# Debt Simplification Algorithm - Visual Flow

## Algorithm Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              DEBT SIMPLIFICATION ALGORITHM                       │
└─────────────────────────────────────────────────────────────────┘

INPUT: group_id
│
▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Fetch Group Transactions                               │
│  ┌────────────────────────────────────────────────┐             │
│  │ db.group_transactions.find({ group_id })       │             │
│  │                                                │             │
│  │ Example:                                       │             │
│  │ - Alice paid 300 for [Alice, Bob, Charlie]    │             │
│  │ - Bob paid 300 for [Alice, Bob, Charlie]      │             │
│  │ - Charlie paid 0                               │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Calculate Net Balances                                 │
│  ┌────────────────────────────────────────────────┐             │
│  │ For each transaction:                          │             │
│  │   - Payer gets credited: +amount               │             │
│  │   - Each participant gets debited: -split      │             │
│  │                                                │             │
│  │ Alice: +300 - 100 = +200                       │             │
│  │ Bob: +300 - 100 = +200                         │             │
│  │ Charlie: +0 - 100 = -100                       │             │
│  │                                                │             │
│  │ Wait... Alice and Bob both paid 300 for 3     │             │
│  │ people, so each owes 100. Let's recalculate:  │             │
│  │                                                │             │
│  │ Alice: paid 300, owes 100 = +200              │             │
│  │ Bob: paid 300, owes 100 = +200                │             │
│  │ Charlie: paid 0, owes 200 = -200              │             │
│  │                                                │             │
│  │ Hmm, that's not balanced. Let me fix:         │             │
│  │                                                │             │
│  │ Total paid: 600                                │             │
│  │ Each person's share: 600/3 = 200               │             │
│  │                                                │             │
│  │ Alice: paid 300, owes 200 = +100              │             │
│  │ Bob: paid 300, owes 200 = +100                │             │
│  │ Charlie: paid 0, owes 200 = -200              │             │
│  └────────────────────────────────────────────────┘             │
│                                                                  │
│  Result: balances = {                                           │
│    'Alice': +100,                                               │
│    'Bob': +100,                                                 │
│    'Charlie': -200                                              │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Greedy Settlement Algorithm                            │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│  ITERATION 1                                                     │
│  ┌────────────────────────────────────────────────┐             │
│  │ Find max creditor: Alice (+100)                │             │
│  │ Find max debtor: Charlie (-200)                │             │
│  │ Settle: min(100, 200) = 100                    │             │
│  │                                                │             │
│  │ Transaction: Charlie → Alice: 100              │             │
│  │                                                │             │
│  │ Update balances:                               │             │
│  │   Alice: +100 - 100 = 0 ✓ (settled)           │             │
│  │   Charlie: -200 + 100 = -100                   │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│  ITERATION 2                                                     │
│  ┌────────────────────────────────────────────────┐             │
│  │ Find max creditor: Bob (+100)                  │             │
│  │ Find max debtor: Charlie (-100)                │             │
│  │ Settle: min(100, 100) = 100                    │             │
│  │                                                │             │
│  │ Transaction: Charlie → Bob: 100                │             │
│  │                                                │             │
│  │ Update balances:                               │             │
│  │   Bob: +100 - 100 = 0 ✓ (settled)             │             │
│  │   Charlie: -100 + 100 = 0 ✓ (settled)         │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: All Balanced - Algorithm Complete                      │
│  ┌────────────────────────────────────────────────┐             │
│  │ No more creditors or debtors                   │             │
│  │ All balances = 0                               │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
│
▼
OUTPUT: [
  {'from': 'Charlie', 'to': 'Alice', 'amount': 100},
  {'from': 'Charlie', 'to': 'Bob', 'amount': 100}
]
```

---

## Complex Example: 5 Members

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT: Group with 5 members                                     │
└─────────────────────────────────────────────────────────────────┘

Initial Balances:
┌──────────┬──────────┬────────────────────────┐
│ Member   │ Balance  │ Status                 │
├──────────┼──────────┼────────────────────────┤
│ Alice    │ +500     │ Should receive 500     │
│ Bob      │ +300     │ Should receive 300     │
│ Charlie  │ +100     │ Should receive 100     │
│ David    │ -200     │ Owes 200               │
│ Eve      │ -700     │ Owes 700               │
└──────────┴──────────┴────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ITERATION 1                                                     │
│  Max Creditor: Alice (+500)                                      │
│  Max Debtor: Eve (-700)                                          │
│  Settle: min(500, 700) = 500                                     │
│                                                                  │
│  Transaction: Eve → Alice: 500                                   │
│                                                                  │
│  Updated Balances:                                               │
│  ┌──────────┬──────────┐                                        │
│  │ Alice    │ 0 ✓      │                                        │
│  │ Bob      │ +300     │                                        │
│  │ Charlie  │ +100     │                                        │
│  │ David    │ -200     │                                        │
│  │ Eve      │ -200     │                                        │
│  └──────────┴──────────┘                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ITERATION 2                                                     │
│  Max Creditor: Bob (+300)                                        │
│  Max Debtor: Eve (-200) or David (-200) → Pick Eve              │
│  Settle: min(300, 200) = 200                                     │
│                                                                  │
│  Transaction: Eve → Bob: 200                                     │
│                                                                  │
│  Updated Balances:                                               │
│  ┌──────────┬──────────┐                                        │
│  │ Bob      │ +100     │                                        │
│  │ Charlie  │ +100     │                                        │
│  │ David    │ -200     │                                        │
│  │ Eve      │ 0 ✓      │                                        │
│  └──────────┴──────────┘                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ITERATION 3                                                     │
│  Max Creditor: Bob (+100) or Charlie (+100) → Pick Bob          │
│  Max Debtor: David (-200)                                        │
│  Settle: min(100, 200) = 100                                     │
│                                                                  │
│  Transaction: David → Bob: 100                                   │
│                                                                  │
│  Updated Balances:                                               │
│  ┌──────────┬──────────┐                                        │
│  │ Bob      │ 0 ✓      │                                        │
│  │ Charlie  │ +100     │                                        │
│  │ David    │ -100     │                                        │
│  └──────────┴──────────┘                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ITERATION 4                                                     │
│  Max Creditor: Charlie (+100)                                    │
│  Max Debtor: David (-100)                                        │
│  Settle: min(100, 100) = 100                                     │
│                                                                  │
│  Transaction: David → Charlie: 100                               │
│                                                                  │
│  Updated Balances:                                               │
│  ┌──────────┬──────────┐                                        │
│  │ Charlie  │ 0 ✓      │                                        │
│  │ David    │ 0 ✓      │                                        │
│  └──────────┴──────────┘                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  RESULT                                                          │
│  ┌────────────────────────────────────────────────┐             │
│  │ Simplified Transactions:                       │             │
│  │ 1. Eve → Alice: 500                            │             │
│  │ 2. Eve → Bob: 200                              │             │
│  │ 3. David → Bob: 100                            │             │
│  │ 4. David → Charlie: 100                        │             │
│  │                                                │             │
│  │ Total: 4 transactions                          │             │
│  └────────────────────────────────────────────────┘             │
│                                                                  │
│  Original (naive): 2 debtors × 3 creditors = 6 transactions     │
│  Simplified: 4 transactions                                      │
│  Reduction: 33.3%                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Balance Calculation Example

```
┌─────────────────────────────────────────────────────────────────┐
│  GROUP TRANSACTIONS                                              │
└─────────────────────────────────────────────────────────────────┘

Transaction 1:
┌────────────────────────────────────────────────────────┐
│ Paid by: Alice                                         │
│ Amount: 1000                                           │
│ Split among: [Alice, Bob, Charlie]                     │
│ Each owes: 1000 / 3 = 333.33                          │
│                                                        │
│ Balance changes:                                       │
│   Alice: +1000 (paid) - 333.33 (owes) = +666.67      │
│   Bob: -333.33                                         │
│   Charlie: -333.33                                     │
└────────────────────────────────────────────────────────┘

Transaction 2:
┌────────────────────────────────────────────────────────┐
│ Paid by: Bob                                           │
│ Amount: 600                                            │
│ Split among: [Alice, Bob, Charlie]                     │
│ Each owes: 600 / 3 = 200                              │
│                                                        │
│ Balance changes:                                       │
│   Alice: -200                                          │
│   Bob: +600 (paid) - 200 (owes) = +400               │
│   Charlie: -200                                        │
└────────────────────────────────────────────────────────┘

Transaction 3:
┌────────────────────────────────────────────────────────┐
│ Paid by: Charlie                                       │
│ Amount: 300                                            │
│ Split among: [Alice, Bob, Charlie]                     │
│ Each owes: 300 / 3 = 100                              │
│                                                        │
│ Balance changes:                                       │
│   Alice: -100                                          │
│   Bob: -100                                            │
│   Charlie: +300 (paid) - 100 (owes) = +200           │
└────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FINAL BALANCES                                                  │
│  ┌────────────────────────────────────────────────┐             │
│  │ Alice: +666.67 - 200 - 100 = +366.67          │             │
│  │ Bob: -333.33 + 400 - 100 = -33.33             │             │
│  │ Charlie: -333.33 - 200 + 200 = -333.33        │             │
│  │                                                │             │
│  │ Verification: 366.67 - 33.33 - 333.33 = 0 ✓   │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SIMPLIFIED SETTLEMENT                                           │
│  ┌────────────────────────────────────────────────┐             │
│  │ 1. Charlie → Alice: 333.33                     │             │
│  │ 2. Bob → Alice: 33.33                          │             │
│  │                                                │             │
│  │ Result: Alice receives 366.67 ✓                │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Algorithm Pseudocode

```
function simplify_debts(group_id):
    // Step 1: Calculate balances
    balances = {}
    transactions = get_group_transactions(group_id)
    
    for txn in transactions:
        split_amount = txn.amount / len(txn.split_among)
        balances[txn.paid_by] += txn.amount
        
        for member in txn.split_among:
            balances[member] -= split_amount
    
    // Step 2: Greedy settlement
    result = []
    
    while balances_not_empty:
        creditor = max(balances, key=positive_value)
        debtor = min(balances, key=negative_value)
        
        if creditor_balance <= 0 or debtor_balance >= 0:
            break
        
        settle_amount = min(creditor_balance, abs(debtor_balance))
        
        result.append({
            from: debtor,
            to: creditor,
            amount: settle_amount
        })
        
        balances[creditor] -= settle_amount
        balances[debtor] += settle_amount
        
        if abs(balances[creditor]) < 0.01:
            remove(balances[creditor])
        if abs(balances[debtor]) < 0.01:
            remove(balances[debtor])
    
    return result
```

---

**Visual Guide**: Complete
**Algorithm**: Greedy Settlement
**Complexity**: O(n²)
**Status**: Production Ready ✅

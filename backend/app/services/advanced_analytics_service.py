"""
Advanced Analytics Service for EasyXpense
Provides comprehensive spending analytics with caching
"""
from datetime import datetime, timedelta
from collections import defaultdict
from app.extensions import db
from functools import lru_cache
import hashlib
import json

# Simple in-memory cache (use Redis in production)
_cache = {}
CACHE_TTL = 300  # 5 minutes

def _cache_key(func_name, *args):
    """Generate cache key"""
    key_data = f"{func_name}:{':'.join(map(str, args))}"
    return hashlib.md5(key_data.encode()).hexdigest()

def _get_cache(key):
    """Get from cache"""
    if key in _cache:
        data, timestamp = _cache[key]
        if datetime.utcnow().timestamp() - timestamp < CACHE_TTL:
            return data
        del _cache[key]
    return None

def _set_cache(key, data):
    """Set cache"""
    _cache[key] = (data, datetime.utcnow().timestamp())

def get_monthly_spending(user_id, year=None, month=None):
    """Get total spending for a specific month"""
    cache_key = _cache_key('monthly_spending', user_id, year, month)
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    if not year or not month:
        now = datetime.utcnow()
        year, month = now.year, now.month
    
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    pipeline = [
        {
            '$match': {
                'user_id': user_id,
                'date': {'$gte': start_date, '$lt': end_date}
            }
        },
        {
            '$group': {
                '_id': None,
                'total': {'$sum': '$amount'},
                'count': {'$sum': 1},
                'average': {'$avg': '$amount'}
            }
        }
    ]
    
    result = list(db.expenses.aggregate(pipeline))
    
    data = {
        'total': round(result[0]['total'], 2) if result else 0,
        'count': result[0]['count'] if result else 0,
        'average': round(result[0]['average'], 2) if result else 0,
        'month': month,
        'year': year
    }
    
    _set_cache(cache_key, data)
    return data

def get_category_breakdown(user_id, days=30):
    """Get spending breakdown by category"""
    cache_key = _cache_key('category_breakdown', user_id, days)
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {
            '$match': {
                'user_id': user_id,
                'date': {'$gte': start_date}
            }
        },
        {
            '$group': {
                '_id': '$category',
                'total': {'$sum': '$amount'},
                'count': {'$sum': 1},
                'average': {'$avg': '$amount'}
            }
        },
        {
            '$sort': {'total': -1}
        }
    ]
    
    results = list(db.expenses.aggregate(pipeline))
    
    total_spending = sum(r['total'] for r in results)
    
    categories = []
    for r in results:
        categories.append({
            'category': r['_id'] or 'Uncategorized',
            'total': round(r['total'], 2),
            'count': r['count'],
            'average': round(r['average'], 2),
            'percentage': round((r['total'] / total_spending * 100), 1) if total_spending > 0 else 0
        })
    
    data = {
        'categories': categories,
        'total': round(total_spending, 2),
        'period_days': days
    }
    
    _set_cache(cache_key, data)
    return data

def get_daily_spending_trend(user_id, days=30):
    """Get daily spending trend"""
    cache_key = _cache_key('daily_trend', user_id, days)
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {
            '$match': {
                'user_id': user_id,
                'date': {'$gte': start_date}
            }
        },
        {
            '$group': {
                '_id': {
                    'year': {'$year': '$date'},
                    'month': {'$month': '$date'},
                    'day': {'$dayOfMonth': '$date'}
                },
                'total': {'$sum': '$amount'},
                'count': {'$sum': 1}
            }
        },
        {
            '$sort': {'_id': 1}
        }
    ]
    
    results = list(db.expenses.aggregate(pipeline))
    
    trend = []
    for r in results:
        date = datetime(r['_id']['year'], r['_id']['month'], r['_id']['day'])
        trend.append({
            'date': date.strftime('%Y-%m-%d'),
            'total': round(r['total'], 2),
            'count': r['count']
        })
    
    # Calculate average daily spending
    avg_daily = sum(t['total'] for t in trend) / len(trend) if trend else 0
    
    data = {
        'trend': trend,
        'average_daily': round(avg_daily, 2),
        'period_days': days
    }
    
    _set_cache(cache_key, data)
    return data

def get_group_spending(group_id):
    """Get spending analytics for a group"""
    cache_key = _cache_key('group_spending', group_id)
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    pipeline = [
        {
            '$match': {'group_id': group_id}
        },
        {
            '$group': {
                '_id': '$paid_by',
                'total': {'$sum': '$amount'},
                'count': {'$sum': 1}
            }
        },
        {
            '$sort': {'total': -1}
        }
    ]
    
    results = list(db.group_transactions.aggregate(pipeline))
    
    members = []
    total = 0
    for r in results:
        member_total = r['total']
        total += member_total
        members.append({
            'member': r['_id'],
            'total': round(member_total, 2),
            'count': r['count']
        })
    
    # Add percentage
    for m in members:
        m['percentage'] = round((m['total'] / total * 100), 1) if total > 0 else 0
    
    data = {
        'members': members,
        'total': round(total, 2),
        'member_count': len(members)
    }
    
    _set_cache(cache_key, data)
    return data

def get_spending_comparison(user_id):
    """Compare current month vs previous month"""
    now = datetime.utcnow()
    
    current_month = get_monthly_spending(user_id, now.year, now.month)
    
    prev_month = now.month - 1 if now.month > 1 else 12
    prev_year = now.year if now.month > 1 else now.year - 1
    previous_month = get_monthly_spending(user_id, prev_year, prev_month)
    
    change = current_month['total'] - previous_month['total']
    change_percent = (change / previous_month['total'] * 100) if previous_month['total'] > 0 else 0
    
    return {
        'current_month': current_month,
        'previous_month': previous_month,
        'change': round(change, 2),
        'change_percent': round(change_percent, 1),
        'trend': 'up' if change > 0 else 'down' if change < 0 else 'stable'
    }

def clear_cache():
    """Clear all cache (call after expense creation/update)"""
    global _cache
    _cache = {}

from flask import jsonify

def success_response(data=None, message='', status_code=200):
    """
    Standardized success response
    
    Returns:
    {
        "success": true,
        "data": {...},
        "message": "...",
        "error": null
    }
    """
    response = {
        'success': True,
        'data': data,
        'message': message,
        'error': None
    }
    return jsonify(response), status_code

def error_response(message='', error_code='ERROR', status_code=400):
    """
    Standardized error response
    
    Returns:
    {
        "success": false,
        "data": null,
        "message": "...",
        "error": "ERROR_CODE"
    }
    """
    response = {
        'success': False,
        'data': None,
        'message': message,
        'error': error_code
    }
    return jsonify(response), status_code

def paginated_response(data, total, page, limit, message=''):
    """
    Standardized paginated response
    """
    return success_response(
        data={
            'items': data,
            'total': total,
            'page': page,
            'limit': limit,
            'totalPages': (total + limit - 1) // limit
        },
        message=message
    )

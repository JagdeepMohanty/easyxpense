from datetime import datetime, timedelta
from bson import ObjectId

class RefreshToken:
    """Refresh token model for secure token storage"""
    
    def __init__(self, db):
        self.collection = db.refresh_tokens
        try:
            self.collection.create_index('user_id')
            self.collection.create_index('expires_at')
            self.collection.create_index('token_hash', unique=True)
        except Exception:
            pass
    
    def create(self, user_id, token_hash, jti):
        """Create new refresh token record"""
        token_data = {
            'user_id': user_id,
            'token_hash': token_hash,
            'jti': jti,
            'expires_at': datetime.utcnow() + timedelta(days=7),
            'created_at': datetime.utcnow(),
            'revoked': False
        }
        result = self.collection.insert_one(token_data)
        return result.inserted_id
    
    def find_by_hash(self, token_hash):
        """Find refresh token by hash"""
        return self.collection.find_one({
            'token_hash': token_hash,
            'revoked': False,
            'expires_at': {'$gt': datetime.utcnow()}
        })
    
    def revoke(self, token_hash):
        """Revoke refresh token"""
        self.collection.update_one(
            {'token_hash': token_hash},
            {'$set': {'revoked': True}}
        )
    
    def revoke_all_for_user(self, user_id):
        """Revoke all refresh tokens for a user"""
        self.collection.update_many(
            {'user_id': user_id, 'revoked': False},
            {'$set': {'revoked': True}}
        )
    
    def cleanup_expired(self):
        """Remove expired tokens"""
        self.collection.delete_many({
            'expires_at': {'$lt': datetime.utcnow()}
        })

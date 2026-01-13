from bson import ObjectId
from datetime import datetime
import bcrypt

class User:
    def __init__(self, db):
        self.collection = db.users
        # Create indexes safely
        try:
            self.collection.create_index("email", unique=True)
        except Exception:
            pass  # Index might already exist or DB not available
    
    def create_user(self, name, email, password):
        """Create a new user with hashed password"""
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_data = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'friends': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(user_data)
        return result.inserted_id
    
    def find_by_email(self, email):
        """Find user by email"""
        return self.collection.find_one({'email': email})
    
    def find_by_id(self, user_id):
        """Find user by ID"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return self.collection.find_one({'_id': user_id})
    
    def verify_password(self, password, hashed_password):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)
    
    def add_friend(self, user_id, friend_id):
        """Add friend to user's friend list"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(friend_id, str):
            friend_id = ObjectId(friend_id)
        
        self.collection.update_one(
            {'_id': user_id},
            {'$addToSet': {'friends': friend_id}, '$set': {'updated_at': datetime.utcnow()}}
        )
    
    def get_friends(self, user_id):
        """Get user's friends with populated data"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        pipeline = [
            {'$match': {'_id': user_id}},
            {'$lookup': {
                'from': 'users',
                'localField': 'friends',
                'foreignField': '_id',
                'as': 'friends_data'
            }},
            {'$project': {
                'friends_data.name': 1,
                'friends_data.email': 1,
                'friends_data._id': 1
            }}
        ]
        result = list(self.collection.aggregate(pipeline))
        return result[0]['friends_data'] if result else []
    
    def user_exists(self, email):
        """Check if user exists by email"""
        return self.collection.find_one({'email': email}) is not None
    
    def is_friend(self, user_id, friend_id):
        """Check if two users are friends"""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(friend_id, str):
            friend_id = ObjectId(friend_id)
        
        user = self.collection.find_one({'_id': user_id, 'friends': friend_id})
        return user is not None
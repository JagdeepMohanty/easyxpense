from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Sync client (for backward compatibility)
mongo_client = None
db = None

# Async client (for new async operations)
async_mongo_client = None
async_db = None

def init_db(app):
    global mongo_client, db, async_mongo_client, async_db
    mongo_uri = app.config["MONGO_URI"]
    if not mongo_uri:
        raise ValueError("MONGO_URI not configured")
    
    # Sync client
    mongo_client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000,
        maxPoolSize=50,
        minPoolSize=10,
        connectTimeoutMS=10000
    )
    
    # Async client
    async_mongo_client = AsyncIOMotorClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000,
        maxPoolSize=50,
        minPoolSize=10,
        connectTimeoutMS=10000
    )
    
    # Extract database name from URI or use default
    if '/' in mongo_uri.split('://')[-1]:
        db_name = mongo_uri.split('/')[-1].split('?')[0]
        db = mongo_client[db_name]
        async_db = async_mongo_client[db_name]
    else:
        db = mongo_client['EasyXpense']
        async_db = async_mongo_client['EasyXpense']
    
    app.db = db
    app.async_db = async_db
    db.command('ping')
    app.logger.info('MongoDB connected successfully (sync + async)')

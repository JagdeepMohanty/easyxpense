from pymongo import MongoClient

mongo_client = None
db = None

def init_db(app):
    global mongo_client, db
    mongo_uri = app.config["MONGO_URI"]
    if not mongo_uri:
        raise ValueError("MONGO_URI not configured")
    
    mongo_client = MongoClient(
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
    else:
        db = mongo_client['EasyXpense']
    
    app.db = db
    db.command('ping')
    app.logger.info('MongoDB connected successfully')

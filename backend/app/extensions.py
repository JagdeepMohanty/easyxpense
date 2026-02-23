from pymongo import MongoClient

mongo_client = None
db = None

def init_db(app):
    global mongo_client, db
    mongo_client = MongoClient(
        app.config["MONGO_URI"],
        serverSelectionTimeoutMS=5000,
        maxPoolSize=50,
        minPoolSize=10,
        connectTimeoutMS=10000
    )
    db = mongo_client.get_default_database()
    app.db = db
    db.command('ping')
    app.logger.info('MongoDB connected successfully')

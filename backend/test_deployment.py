#!/usr/bin/env python
"""
Deployment verification script for EasyXpense backend
Run this before deploying to production
"""

import os
import sys

def check_environment_variables():
    """Check required environment variables"""
    print("Checking environment variables...")
    required_vars = ['MONGO_URI', 'JWT_SECRET_KEY', 'SECRET_KEY']
    missing = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}")
        return False
    
    print("✅ All required environment variables present")
    return True

def check_imports():
    """Check if all required packages can be imported"""
    print("\nChecking package imports...")
    packages = [
        'flask',
        'flask_cors',
        'pymongo',
        'jwt',
        'bcrypt',
        'gunicorn'
    ]
    
    failed = []
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            failed.append(package)
    
    if failed:
        print(f"\n❌ Failed to import: {', '.join(failed)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    return True

def check_app_creation():
    """Check if Flask app can be created"""
    print("\nChecking Flask app creation...")
    try:
        from app import create_app
        app = create_app()
        print("✅ Flask app created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create Flask app: {e}")
        return False

def check_mongodb_connection():
    """Check MongoDB connection"""
    print("\nChecking MongoDB connection...")
    try:
        from app import create_app
        app = create_app()
        with app.app_context():
            app.db.command('ping')
        print("✅ MongoDB connection successful")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

def check_routes():
    """Check if all routes are registered"""
    print("\nChecking routes...")
    try:
        from app import create_app
        app = create_app()
        
        expected_routes = [
            '/api/auth/login',
            '/api/auth/register',
            '/api/users/me',
            '/api/groups/',
            '/api/expenses/',
            '/api/debts/',
            '/health'
        ]
        
        registered_routes = [rule.rule for rule in app.url_map.iter_rules()]
        
        missing = []
        for route in expected_routes:
            if not any(route in r for r in registered_routes):
                missing.append(route)
        
        if missing:
            print(f"❌ Missing routes: {', '.join(missing)}")
            return False
        
        print(f"✅ All {len(expected_routes)} expected routes registered")
        return True
    except Exception as e:
        print(f"❌ Failed to check routes: {e}")
        return False

def main():
    """Run all checks"""
    print("=" * 60)
    print("EasyXpense Backend - Deployment Verification")
    print("=" * 60)
    
    checks = [
        check_environment_variables,
        check_imports,
        check_app_creation,
        check_mongodb_connection,
        check_routes
    ]
    
    results = []
    for check in checks:
        try:
            results.append(check())
        except Exception as e:
            print(f"❌ Check failed with error: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    if all(results):
        print("✅ ALL CHECKS PASSED - Ready for deployment!")
        print("=" * 60)
        return 0
    else:
        print("❌ SOME CHECKS FAILED - Fix issues before deploying")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())

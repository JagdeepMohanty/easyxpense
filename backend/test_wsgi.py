#!/usr/bin/env python3
"""Test script to verify WSGI module imports correctly"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing WSGI import...")
    import wsgi
    print("✓ WSGI module imported successfully")
    
    print("\nTesting app instance...")
    if hasattr(wsgi, 'app'):
        print("✓ App instance found")
        print(f"  App type: {type(wsgi.app)}")
        print(f"  App name: {wsgi.app.name}")
    else:
        print("✗ App instance not found")
        sys.exit(1)
    
    print("\n✓ All tests passed - deployment should work!")
    
except ImportError as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

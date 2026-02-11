"""
EasyXpense - Production Security Verification Script

This script verifies all security features are properly implemented.
Run this after deployment to ensure everything is working correctly.
"""

import requests
import time
import json
from datetime import datetime

# Configuration
API_BASE_URL = "https://easyxpense.onrender.com"  # Change for local testing
TEST_USER = {
    "name": "Security Test User",
    "email": f"test_{int(time.time())}@example.com",
    "password": "TestPassword123"
}

def print_test(test_name, passed, message=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if message:
        print(f"   {message}")

def test_health_check():
    """Test 1: Health check endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        passed = response.status_code == 200 and response.json().get('status') == 'healthy'
        print_test("Health Check", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Health Check", False, str(e))
        return False

def test_register():
    """Test 2: User registration"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/auth/register",
            json=TEST_USER,
            timeout=10
        )
        passed = response.status_code == 201 and 'access_token' in response.json()
        data = response.json()
        print_test("User Registration", passed, f"Status: {response.status_code}")
        return data if passed else None
    except Exception as e:
        print_test("User Registration", False, str(e))
        return None

def test_login(email, password):
    """Test 3: User login"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )
        passed = response.status_code == 200 and 'access_token' in response.json()
        data = response.json()
        print_test("User Login", passed, f"Status: {response.status_code}")
        return data if passed else None
    except Exception as e:
        print_test("User Login", False, str(e))
        return None

def test_protected_route(access_token):
    """Test 4: Protected route access"""
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(
            f"{API_BASE_URL}/api/friends",
            headers=headers,
            timeout=10
        )
        passed = response.status_code == 200
        print_test("Protected Route Access", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Protected Route Access", False, str(e))
        return False

def test_invalid_token():
    """Test 5: Invalid token rejection"""
    try:
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(
            f"{API_BASE_URL}/api/friends",
            headers=headers,
            timeout=10
        )
        passed = response.status_code == 401
        print_test("Invalid Token Rejection", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Invalid Token Rejection", False, str(e))
        return False

def test_no_token():
    """Test 6: No token rejection"""
    try:
        response = requests.get(
            f"{API_BASE_URL}/api/friends",
            timeout=10
        )
        passed = response.status_code == 401
        print_test("No Token Rejection", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("No Token Rejection", False, str(e))
        return False

def test_token_refresh(refresh_token):
    """Test 7: Token refresh"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/auth/refresh",
            json={"refresh_token": refresh_token},
            timeout=10
        )
        passed = response.status_code == 200 and 'access_token' in response.json()
        data = response.json()
        print_test("Token Refresh", passed, f"Status: {response.status_code}")
        return data if passed else None
    except Exception as e:
        print_test("Token Refresh", False, str(e))
        return None

def test_token_rotation(old_refresh_token):
    """Test 8: Token rotation (old token should be invalid)"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/auth/refresh",
            json={"refresh_token": old_refresh_token},
            timeout=10
        )
        passed = response.status_code == 401
        print_test("Token Rotation (Old Token Invalid)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Token Rotation (Old Token Invalid)", False, str(e))
        return False

def test_logout(refresh_token):
    """Test 9: Logout and token revocation"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/auth/logout",
            json={"refresh_token": refresh_token},
            timeout=10
        )
        passed = response.status_code == 200
        print_test("Logout", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Logout", False, str(e))
        return False

def test_revoked_token(refresh_token):
    """Test 10: Revoked token should not work"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/auth/refresh",
            json={"refresh_token": refresh_token},
            timeout=10
        )
        passed = response.status_code == 401
        print_test("Revoked Token Rejection", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Revoked Token Rejection", False, str(e))
        return False

def run_all_tests():
    """Run all security tests"""
    print("\n" + "="*60)
    print("EasyXpense - Production Security Verification")
    print("="*60 + "\n")
    print(f"Testing API: {API_BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    results = []
    
    # Test 1: Health Check
    results.append(test_health_check())
    
    # Test 2: Register
    register_data = test_register()
    results.append(register_data is not None)
    if not register_data:
        print("\n❌ Registration failed. Cannot continue tests.\n")
        return
    
    access_token = register_data.get('access_token')
    refresh_token = register_data.get('refresh_token')
    
    # Test 3: Login
    login_data = test_login(TEST_USER['email'], TEST_USER['password'])
    results.append(login_data is not None)
    if login_data:
        access_token = login_data.get('access_token')
        refresh_token = login_data.get('refresh_token')
    
    # Test 4: Protected Route
    results.append(test_protected_route(access_token))
    
    # Test 5: Invalid Token
    results.append(test_invalid_token())
    
    # Test 6: No Token
    results.append(test_no_token())
    
    # Test 7: Token Refresh
    old_refresh_token = refresh_token
    refresh_data = test_token_refresh(refresh_token)
    results.append(refresh_data is not None)
    if refresh_data:
        refresh_token = refresh_data.get('refresh_token')
    
    # Test 8: Token Rotation
    results.append(test_token_rotation(old_refresh_token))
    
    # Test 9: Logout
    results.append(test_logout(refresh_token))
    
    # Test 10: Revoked Token
    results.append(test_revoked_token(refresh_token))
    
    # Summary
    print("\n" + "="*60)
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    print(f"Results: {passed}/{total} tests passed ({percentage:.1f}%)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - PRODUCTION READY! 🎉")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Review implementation.")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user.\n")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}\n")

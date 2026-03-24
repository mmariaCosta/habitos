import requests
import sys
import json
from datetime import datetime
import time

class LevelUpAPITester:
    def __init__(self, base_url="https://study-rivals-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_root_endpoint(self):
        """Test root API endpoint"""
        result = self.run_test("Root API", "GET", "", 200)
        return result is not None

    def test_register(self):
        """Test user registration"""
        timestamp = int(time.time())
        user_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "username": f"TestUser{timestamp}"
        }
        
        result = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        
        if result and 'token' in result and 'user' in result:
            self.token = result['token']
            self.user_id = result['user']['id']
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        if not self.token:
            return False
            
        # Create new user for login test
        timestamp = int(time.time()) + 1
        register_data = {
            "email": f"login_test_{timestamp}@example.com",
            "password": "LoginTest123!",
            "username": f"LoginUser{timestamp}"
        }
        
        # Register first
        register_result = self.run_test("Register for Login Test", "POST", "auth/register", 200, register_data)
        if not register_result:
            return False
            
        # Now test login
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        result = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        return result is not None and 'token' in result

    def test_get_me(self):
        """Test get current user"""
        result = self.run_test("Get Current User", "GET", "auth/me", 200)
        return result is not None and 'id' in result

    def test_user_stats(self):
        """Test get user stats"""
        result = self.run_test("Get User Stats", "GET", "user/stats", 200)
        return result is not None and 'level' in result and 'xp' in result

    def test_leaderboard(self):
        """Test leaderboard"""
        result = self.run_test("Get Leaderboard", "GET", "leaderboard", 200)
        return result is not None and isinstance(result, list)

    def test_habits_crud(self):
        """Test habits CRUD operations"""
        # Create habit
        habit_data = {
            "name": "Test Habit",
            "category": "Testing",
            "color": "#7C3AED",
            "frequency": "daily"
        }
        
        create_result = self.run_test("Create Habit", "POST", "habits", 200, habit_data)
        if not create_result or 'id' not in create_result:
            return False
            
        habit_id = create_result['id']
        
        # Get habits
        get_result = self.run_test("Get Habits", "GET", "habits", 200)
        if not get_result or not isinstance(get_result, list):
            return False
            
        # Complete habit
        complete_result = self.run_test("Complete Habit", "POST", f"habits/{habit_id}/complete", 200)
        if not complete_result or 'xp_gained' not in complete_result:
            return False
            
        # Delete habit
        delete_result = self.run_test("Delete Habit", "DELETE", f"habits/{habit_id}", 200)
        return delete_result is not None

    def test_tasks_crud(self):
        """Test tasks CRUD operations"""
        # Create task
        task_data = {
            "title": "Test Task",
            "category": "Testing",
            "xp_reward": 25
        }
        
        create_result = self.run_test("Create Task", "POST", "tasks", 200, task_data)
        if not create_result or 'id' not in create_result:
            return False
            
        task_id = create_result['id']
        
        # Get tasks
        get_result = self.run_test("Get Tasks", "GET", "tasks", 200)
        if not get_result or not isinstance(get_result, list):
            return False
            
        # Complete task
        complete_result = self.run_test("Complete Task", "POST", f"tasks/{task_id}/complete", 200)
        if not complete_result or 'xp_gained' not in complete_result:
            return False
            
        # Delete task
        delete_result = self.run_test("Delete Task", "DELETE", f"tasks/{task_id}", 200)
        return delete_result is not None

    def test_study_sessions(self):
        """Test study session functionality"""
        # Start study session
        session_data = {"category": "Test Study"}
        start_result = self.run_test("Start Study Session", "POST", "study/start", 200, session_data)
        
        if not start_result or 'session_id' not in start_result:
            return False
            
        session_id = start_result['session_id']
        
        # Wait a moment to simulate study time
        time.sleep(2)
        
        # Complete study session
        complete_data = {
            "session_id": session_id,
            "duration": 120  # 2 minutes
        }
        
        complete_result = self.run_test("Complete Study Session", "POST", "study/complete", 200, complete_data)
        if not complete_result or 'xp_gained' not in complete_result:
            return False
            
        # Get study stats
        stats_result = self.run_test("Get Study Stats", "GET", "study/stats", 200)
        return stats_result is not None and 'total_sessions' in stats_result

    def test_achievements(self):
        """Test achievements"""
        result = self.run_test("Get Achievements", "GET", "achievements", 200)
        return result is not None and isinstance(result, list)

    def test_challenges(self):
        """Test challenges"""
        result = self.run_test("Get Challenges", "GET", "challenges", 200)
        return result is not None and isinstance(result, list)

    def test_add_xp(self):
        """Test add XP functionality"""
        result = self.run_test("Add XP", "POST", "user/add-xp?amount=50", 200)
        return result is not None and 'xp' in result

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting LevelUp API Tests...")
        print("=" * 50)
        
        # Test sequence
        tests = [
            ("Root API", self.test_root_endpoint),
            ("User Registration", self.test_register),
            ("User Login", self.test_login),
            ("Get Current User", self.test_get_me),
            ("User Stats", self.test_user_stats),
            ("Leaderboard", self.test_leaderboard),
            ("Habits CRUD", self.test_habits_crud),
            ("Tasks CRUD", self.test_tasks_crud),
            ("Study Sessions", self.test_study_sessions),
            ("Achievements", self.test_achievements),
            ("Challenges", self.test_challenges),
            ("Add XP", self.test_add_xp),
        ]
        
        for test_name, test_func in tests:
            print(f"\n🔍 Running {test_name}...")
            try:
                test_func()
            except Exception as e:
                self.log_test(test_name, False, f"Exception: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = LevelUpAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
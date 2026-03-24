#!/usr/bin/env python3
"""
Backend API Testing for LevelUp Gamified Productivity App
Tests all authentication, habits, tasks, stats, leaderboard, and calendar endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Use the production URL from frontend/.env
BASE_URL = "https://access-tester-6.preview.emergentagent.com/api"

class LevelUpAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user_id = None
        self.test_results = []
        self.habit_id = None
        self.task_id = None
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        })
        
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            return None
            
    def get_auth_headers(self):
        """Get authorization headers"""
        if not self.token:
            return {}
        return {"Authorization": f"Bearer {self.token}"}
        
    def test_register(self):
        """Test user registration"""
        test_name = "User Registration"
        data = {
            "email": "backendtest@test.com",
            "password": "test123",
            "username": "BackendTester"
        }
        
        response = self.make_request("POST", "/auth/register", data)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 201 or response.status_code == 200:
            try:
                response_data = response.json()
                if "token" in response_data and "user" in response_data:
                    self.token = response_data["token"]
                    self.user_id = response_data["user"]["id"]
                    self.log_result(test_name, True, f"User registered successfully with ID: {self.user_id}")
                    return True
                else:
                    self.log_result(test_name, False, f"Missing token or user in response: {response_data}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        elif response.status_code == 400:
            # User might already exist, try login instead
            self.log_result(test_name, True, "User already exists (expected), will try login")
            return True
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_login(self):
        """Test user login"""
        test_name = "User Login"
        data = {
            "email": "backendtest@test.com",
            "password": "test123"
        }
        
        response = self.make_request("POST", "/auth/login", data)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                response_data = response.json()
                if "token" in response_data and "user" in response_data:
                    self.token = response_data["token"]
                    self.user_id = response_data["user"]["id"]
                    self.log_result(test_name, True, f"Login successful, token received")
                    return True
                else:
                    self.log_result(test_name, False, f"Missing token or user in response: {response_data}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_get_me(self):
        """Test get current user info"""
        test_name = "Get Current User"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        headers = self.get_auth_headers()
        response = self.make_request("GET", "/auth/me", headers=headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                user_data = response.json()
                if "id" in user_data and "email" in user_data and "username" in user_data:
                    self.log_result(test_name, True, f"User info retrieved: {user_data['username']} ({user_data['email']})")
                    return True
                else:
                    self.log_result(test_name, False, f"Missing required user fields: {user_data}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_get_stats(self):
        """Test get user stats"""
        test_name = "Get User Stats"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        headers = self.get_auth_headers()
        response = self.make_request("GET", "/user/stats", headers=headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                stats_data = response.json()
                required_fields = ["level", "xp", "xp_for_next_level", "streak", "total_study_time", "achievements_count"]
                if all(field in stats_data for field in required_fields):
                    self.log_result(test_name, True, f"Stats retrieved: Level {stats_data['level']}, XP {stats_data['xp']}")
                    return True
                else:
                    self.log_result(test_name, False, f"Missing required stats fields: {stats_data}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_create_habit(self):
        """Test create habit"""
        test_name = "Create Habit"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        data = {
            "name": "Test Habit",
            "category": "Estudos",
            "color": "#7C3AED",
            "icon": "Target",
            "frequency": "daily",
            "goal": 1,
            "days_of_week": []
        }
        
        headers = self.get_auth_headers()
        response = self.make_request("POST", "/habits", data, headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200 or response.status_code == 201:
            try:
                habit_data = response.json()
                if "id" in habit_data and "name" in habit_data:
                    self.habit_id = habit_data["id"]
                    self.log_result(test_name, True, f"Habit created: {habit_data['name']} (ID: {self.habit_id})")
                    return True
                else:
                    self.log_result(test_name, False, f"Missing required habit fields: {habit_data}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_get_habits(self):
        """Test get all habits"""
        test_name = "Get All Habits"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        headers = self.get_auth_headers()
        response = self.make_request("GET", "/habits", headers=headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                habits_data = response.json()
                if isinstance(habits_data, list):
                    self.log_result(test_name, True, f"Retrieved {len(habits_data)} habits")
                    return True
                else:
                    self.log_result(test_name, False, f"Expected list, got: {type(habits_data)}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_complete_habit(self):
        """Test complete habit"""
        test_name = "Complete Habit"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        if not self.habit_id:
            self.log_result(test_name, False, "No habit ID available (create habit first)")
            return False
            
        headers = self.get_auth_headers()
        response = self.make_request("POST", f"/habits/{self.habit_id}/complete", headers=headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                completion_data = response.json()
                if "xp_gained" in completion_data:
                    self.log_result(test_name, True, f"Habit completed, gained {completion_data['xp_gained']} XP")
                    return True
                else:
                    self.log_result(test_name, False, f"Missing xp_gained in response: {completion_data}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_create_task(self):
        """Test create task"""
        test_name = "Create Task"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        data = {
            "title": "Test Task",
            "category": "Estudos",
            "xp_reward": 25,
            "priority": "high",
            "icon": "CheckSquare",
            "color": "#06B6D4"
        }
        
        headers = self.get_auth_headers()
        response = self.make_request("POST", "/tasks", data, headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200 or response.status_code == 201:
            try:
                task_data = response.json()
                if "id" in task_data and "title" in task_data:
                    self.task_id = task_data["id"]
                    self.log_result(test_name, True, f"Task created: {task_data['title']} (ID: {self.task_id})")
                    return True
                else:
                    self.log_result(test_name, False, f"Missing required task fields: {task_data}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_get_tasks(self):
        """Test get all tasks"""
        test_name = "Get All Tasks"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        headers = self.get_auth_headers()
        response = self.make_request("GET", "/tasks", headers=headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                tasks_data = response.json()
                if isinstance(tasks_data, list):
                    self.log_result(test_name, True, f"Retrieved {len(tasks_data)} tasks")
                    return True
                else:
                    self.log_result(test_name, False, f"Expected list, got: {type(tasks_data)}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_get_leaderboard(self):
        """Test get leaderboard"""
        test_name = "Get Leaderboard"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        headers = self.get_auth_headers()
        response = self.make_request("GET", "/leaderboard", headers=headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                leaderboard_data = response.json()
                if isinstance(leaderboard_data, list):
                    self.log_result(test_name, True, f"Retrieved leaderboard with {len(leaderboard_data)} entries")
                    return True
                else:
                    self.log_result(test_name, False, f"Expected list, got: {type(leaderboard_data)}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def test_get_calendar(self):
        """Test get calendar data"""
        test_name = "Get Calendar Data"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        headers = self.get_auth_headers()
        response = self.make_request("GET", "/calendar", headers=headers)
        
        if response is None:
            self.log_result(test_name, False, "Network error - could not connect to server")
            return False
            
        if response.status_code == 200:
            try:
                calendar_data = response.json()
                if isinstance(calendar_data, list):
                    self.log_result(test_name, True, f"Retrieved calendar data with {len(calendar_data)} entries")
                    return True
                else:
                    self.log_result(test_name, False, f"Expected list, got: {type(calendar_data)}")
                    return False
            except json.JSONDecodeError:
                self.log_result(test_name, False, f"Invalid JSON response: {response.text}")
                return False
        else:
            self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting LevelUp API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        print("\n🔐 AUTHENTICATION TESTS")
        print("-" * 30)
        self.test_register()
        self.test_login()
        self.test_get_me()
        
        # Stats Tests
        print("\n📊 STATS TESTS")
        print("-" * 30)
        self.test_get_stats()
        
        # Habits Tests
        print("\n🎯 HABITS TESTS")
        print("-" * 30)
        self.test_create_habit()
        self.test_get_habits()
        self.test_complete_habit()
        
        # Tasks Tests
        print("\n✅ TASKS TESTS")
        print("-" * 30)
        self.test_create_task()
        self.test_get_tasks()
        
        # Leaderboard Tests
        print("\n🏆 LEADERBOARD TESTS")
        print("-" * 30)
        self.test_get_leaderboard()
        
        # Calendar Tests
        print("\n📅 CALENDAR TESTS")
        print("-" * 30)
        self.test_get_calendar()
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = LevelUpAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
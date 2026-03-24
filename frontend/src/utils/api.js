import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Stats
  getUserStats: async () => {
    const response = await axios.get(`${API_URL}/user/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  addXp: async (amount) => {
    const response = await axios.post(`${API_URL}/user/add-xp?amount=${amount}`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Leaderboard
  getLeaderboard: async () => {
    const response = await axios.get(`${API_URL}/leaderboard`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Habits
  getHabits: async () => {
    const response = await axios.get(`${API_URL}/habits`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createHabit: async (habitData) => {
    const response = await axios.post(`${API_URL}/habits`, habitData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  completeHabit: async (habitId) => {
    const response = await axios.post(`${API_URL}/habits/${habitId}/complete`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteHabit: async (habitId) => {
    const response = await axios.delete(`${API_URL}/habits/${habitId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Tasks
  getTasks: async () => {
    const response = await axios.get(`${API_URL}/tasks`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  completeTask: async (taskId) => {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/complete`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Study Sessions
  startStudySession: async (category) => {
    const response = await axios.post(`${API_URL}/study/start`, { category }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  completeStudySession: async (sessionId, duration) => {
    const response = await axios.post(`${API_URL}/study/complete`, { session_id: sessionId, duration }, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getStudyStats: async () => {
    const response = await axios.get(`${API_URL}/study/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Achievements
  getAchievements: async () => {
    const response = await axios.get(`${API_URL}/achievements`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Challenges
  getChallenges: async () => {
    const response = await axios.get(`${API_URL}/challenges`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Calendar
  getCalendarData: async (days = 30) => {
    const response = await axios.get(`${API_URL}/calendar?days=${days}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
};
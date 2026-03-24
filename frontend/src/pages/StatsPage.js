import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  Flame, Trophy, Target, TrendingUp, Calendar, Clock,
  CheckCircle2, Award, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Layout from '../components/Layout';
import HabitHeatmap from '../components/HabitHeatmap';

const StatsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [studyStats, setStudyStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, habitsData, tasksData, calendarDataRes, studyStatsData, achievementsData] = await Promise.all([
        api.getUserStats(),
        api.getHabits(),
        api.getTasks(),
        api.getCalendarData(365),
        api.getStudyStats(),
        api.getAchievements()
      ]);
      setStats(statsData);
      setHabits(habitsData);
      setTasks(tasksData);
      setCalendarData(calendarDataRes);
      setStudyStats(studyStatsData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const getWeeklyData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = calendarData.find(d => d.date === dateStr);
      
      data.push({
        day: days[date.getDay()],
        habits: dayData?.habits_completed || 0,
        tasks: dayData?.tasks_completed || 0,
        xp: dayData?.xp_gained || 0,
      });
    }
    return data;
  };

  const getCategoryData = () => {
    const categories = {};
    habits.forEach(habit => {
      const cat = habit.category;
      if (!categories[cat]) {
        categories[cat] = { name: cat, value: 0, color: habit.color };
      }
      categories[cat].value += habit.completion_dates?.length || 0;
    });
    return Object.values(categories);
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Carregando estatísticas...</div>
        </div>
      </Layout>
    );
  }

  const weeklyData = getWeeklyData();
  const categoryData = getCategoryData();
  const COLORS = ['#7C3AED', '#EC4899', '#06B6D4', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6'];

  return (
    <Layout>
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Streak */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl text-white mb-2 pixel-text">Estatísticas</h1>
              <p className="text-zinc-400 text-lg">Acompanhe seu progresso e evolução</p>
            </div>
            
            {/* Streak Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border-2 border-orange-500/50"
            >
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">{user?.streak || 0}</p>
                <p className="text-xs text-orange-400">dias seguidos</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Trophy, label: 'Nível', value: stats?.level || 1, color: '#7C3AED' },
              { icon: Zap, label: 'XP Total', value: stats?.xp || 0, color: '#EAB308' },
              { icon: Clock, label: 'Horas de Estudo', value: Math.floor((stats?.total_study_time || 0) / 3600), color: '#06B6D4' },
              { icon: Award, label: 'Conquistas', value: stats?.achievements_count || 0, color: '#22C55E' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: stat.color + '20' }}
                      >
                        <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#22C55E]" />
                  Calendário de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HabitHeatmap calendarData={calendarData} habits={habits} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#7C3AED]" />
                    Progresso Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d5f" />
                      <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a14',
                          border: '2px solid #2d2d5f',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="habits" name="Hábitos" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tasks" name="Tarefas" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* XP Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#EAB308]" />
                    XP Ganho na Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2d5f" />
                      <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a14',
                          border: '2px solid #2d2d5f',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="xp"
                        name="XP"
                        stroke="#EAB308"
                        strokeWidth={3}
                        dot={{ fill: '#EAB308', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#EAB308' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#EC4899]" />
                    Hábitos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0a14',
                            border: '2px solid #2d2d5f',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-zinc-500">
                      Nenhum hábito completado ainda
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {categoryData.map((cat, idx) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-xs text-zinc-400">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    Taxa de Conclusão
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#2d2d5f"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#22C55E"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${completionRate * 3.51} 351`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{completionRate}%</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-zinc-400">
                      <span className="text-[#22C55E] font-semibold">{completedTasks}</span> de{' '}
                      <span className="text-white font-semibold">{totalTasks}</span> tarefas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Study Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#06B6D4]" />
                    Resumo de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-[#16162c] rounded-xl border border-[#2d2d5f]">
                    <p className="text-xs text-zinc-500 mb-1">Total de Sessões</p>
                    <p className="text-2xl font-bold text-[#06B6D4]">{studyStats?.total_sessions || 0}</p>
                  </div>
                  <div className="p-4 bg-[#16162c] rounded-xl border border-[#2d2d5f]">
                    <p className="text-xs text-zinc-500 mb-1">Tempo Total</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.floor((studyStats?.total_time || 0) / 3600)}h {Math.floor(((studyStats?.total_time || 0) % 3600) / 60)}m
                    </p>
                  </div>
                  <div className="p-4 bg-[#16162c] rounded-xl border border-[#2d2d5f]">
                    <p className="text-xs text-zinc-500 mb-1">Média por Sessão</p>
                    <p className="text-2xl font-bold text-[#EAB308]">
                      {Math.floor((studyStats?.average_session || 0) / 60)}min
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#EAB308]" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((ach) => (
                    <div
                      key={ach.achievement.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        ach.unlocked
                          ? 'bg-[#EAB308]/10 border-[#EAB308]/50'
                          : 'bg-[#16162c] border-[#2d2d5f] opacity-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                          ach.unlocked ? 'bg-[#EAB308]/20' : 'bg-[#2d2d5f]'
                        }`}>
                          <Award className={`w-6 h-6 ${ach.unlocked ? 'text-[#EAB308]' : 'text-zinc-600'}`} />
                        </div>
                        <h4 className={`text-sm font-semibold mb-1 ${ach.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                          {ach.achievement.name}
                        </h4>
                        <p className="text-xs text-zinc-500">{ach.achievement.description}</p>
                        <p className={`text-xs mt-2 ${ach.unlocked ? 'text-[#EAB308]' : 'text-zinc-600'}`}>
                          +{ach.achievement.xp_reward} XP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default StatsPage;

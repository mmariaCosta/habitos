import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [stats, setStats] = useState({ totalHabits: 0, totalTasks: 0, totalStudyTime: 0 });

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const data = await api.getCalendarData();
      setCalendarData(data);
      
      const totalHabits = data.reduce((sum, d) => sum + d.habits_completed, 0);
      const totalTasks = data.reduce((sum, d) => sum + d.tasks_completed, 0);
      const totalStudyTime = data.reduce((sum, d) => sum + d.study_time, 0);
      
      setStats({ totalHabits, totalTasks, totalStudyTime });
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    }
  };

  const chartData = calendarData.slice(0, 14).reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    habits: d.habits_completed,
    tasks: d.tasks_completed,
    xp: d.xp_gained
  }));

  const completionRate = calendarData.length > 0 
    ? ((stats.totalHabits + stats.totalTasks) / (calendarData.length * 2) * 100).toFixed(1)
    : 0;

  return (
    <div className=\"min-h-screen bg-[#1a1a2e] py-8 px-4\" data-testid=\"calendar-page\">
      <div className=\"max-w-7xl mx-auto\">
        <Button
          onClick={() => navigate('/dashboard')}
          variant=\"ghost\"
          className=\"mb-6 pixel-border border-zinc-700 hover:border-game-primary\"
        >
          <ArrowLeft className=\"w-4 h-4 mr-2\" />
          <span className=\"pixel-text-small\">VOLTAR</span>
        </Button>

        {/* Page Title */}
        <div className=\"text-center mb-12\">
          <h1 className=\"text-3xl md:text-4xl font-bold mb-4 pixel-text text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400\">
            CALENDARIO
          </h1>
          <p className=\"text-zinc-400 pixel-text-small text-xl\">Acompanhe seu progresso ao longo do tempo</p>
        </div>

        {/* Stats Overview */}
        <div className=\"grid md:grid-cols-4 gap-6 mb-8\">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className=\"pixel-card text-center\">
              <CardContent className=\"pt-6\">
                <Target className=\"w-10 h-10 mx-auto mb-3 text-game-primary\" />
                <p className=\"text-4xl font-bold text-white pixel-text mb-2\">{stats.totalHabits}</p>
                <p className=\"text-sm text-zinc-400 pixel-text-small\">Hábitos Completos</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className=\"pixel-card text-center\">
              <CardContent className=\"pt-6\">
                <CheckCircle className=\"w-10 h-10 mx-auto mb-3 text-game-accent\" />
                <p className=\"text-4xl font-bold text-white pixel-text mb-2\">{stats.totalTasks}</p>
                <p className=\"text-sm text-zinc-400 pixel-text-small\">Tarefas Concluídas</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className=\"pixel-card text-center\">
              <CardContent className=\"pt-6\">
                <CalendarIcon className=\"w-10 h-10 mx-auto mb-3 text-game-gold\" />
                <p className=\"text-4xl font-bold text-white pixel-text mb-2\">{Math.floor(stats.totalStudyTime / 3600)}h</p>
                <p className=\"text-sm text-zinc-400 pixel-text-small\">Tempo Total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className=\"pixel-card text-center\">
              <CardContent className=\"pt-6\">
                <TrendingUp className=\"w-10 h-10 mx-auto mb-3 text-game-success\" />
                <p className=\"text-4xl font-bold text-white pixel-text mb-2\">{completionRate}%</p>
                <p className=\"text-sm text-zinc-400 pixel-text-small\">Taxa de Conclusão</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className=\"grid lg:grid-cols-2 gap-6 mb-8\">
          {/* Bar Chart - Habits vs Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className=\"pixel-card\">
              <CardHeader>
                <CardTitle className=\"pixel-text text-lg\">HABITOS VS TAREFAS</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width=\"100%\" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#2d2d5f\" />
                    <XAxis dataKey=\"date\" stroke=\"#888\" style={{ fontSize: '12px', fontFamily: 'VT323' }} />
                    <YAxis stroke=\"#888\" style={{ fontSize: '12px', fontFamily: 'VT323' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#16162c', 
                        border: '3px solid #2d2d5f',
                        borderRadius: 0,
                        fontFamily: 'VT323',
                        fontSize: '16px'
                      }} 
                    />
                    <Bar dataKey=\"habits\" fill=\"#7C3AED\" />
                    <Bar dataKey=\"tasks\" fill=\"#06B6D4\" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Line Chart - XP Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className=\"pixel-card\">
              <CardHeader>
                <CardTitle className=\"pixel-text text-lg\">PROGRESSO DE XP</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width=\"100%\" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#2d2d5f\" />
                    <XAxis dataKey=\"date\" stroke=\"#888\" style={{ fontSize: '12px', fontFamily: 'VT323' }} />
                    <YAxis stroke=\"#888\" style={{ fontSize: '12px', fontFamily: 'VT323' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#16162c', 
                        border: '3px solid #2d2d5f',
                        borderRadius: 0,
                        fontFamily: 'VT323',
                        fontSize: '16px'
                      }} 
                    />
                    <Line type=\"monotone\" dataKey=\"xp\" stroke=\"#FACC15\" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className=\"pixel-card\">
            <CardHeader>
              <CardTitle className=\"pixel-text text-lg\">ATIVIDADES RECENTES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"space-y-3\">
                {calendarData.slice(0, 10).map((day) => (
                  <div 
                    key={day.date}
                    className=\"flex items-center justify-between p-4 bg-zinc-900/50 border-2 border-zinc-800 hover:border-game-primary transition-all\"
                  >
                    <div className=\"flex-1\">
                      <p className=\"text-white pixel-text-small text-lg mb-1\">
                        {new Date(day.date).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className=\"flex gap-4 text-sm text-zinc-400 pixel-text-small\">
                        <span>{day.habits_completed} Hábitos</span>
                        <span>{day.tasks_completed} Tarefas</span>
                        <span>{Math.floor(day.study_time / 60)}min Estudo</span>
                      </div>
                    </div>
                    <div className=\"text-right\">
                      <p className=\"text-2xl font-bold text-game-gold pixel-text\">+{day.xp_gained}</p>
                      <p className=\"text-xs text-zinc-500 pixel-text-small\">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarPage;

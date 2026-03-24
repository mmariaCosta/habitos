import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import {
  Flame, Trophy, Target, Clock, Plus, CheckCircle2,
  Zap, Award, TrendingUp, Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CreateModal from '../components/CreateModal';

const ICON_MAP = {
  Target: Target,
  BookOpen: require('lucide-react').BookOpen,
  Dumbbell: require('lucide-react').Dumbbell,
  Heart: require('lucide-react').Heart,
  Briefcase: require('lucide-react').Briefcase,
  Music: require('lucide-react').Music,
  Code: require('lucide-react').Code,
  Coffee: require('lucide-react').Coffee,
  Moon: require('lucide-react').Moon,
  Sun: require('lucide-react').Sun,
  Gamepad2: require('lucide-react').Gamepad2,
  Pencil: require('lucide-react').Pencil,
  Camera: require('lucide-react').Camera,
  Palette: require('lucide-react').Palette,
  Lightbulb: require('lucide-react').Lightbulb,
  Rocket: require('lucide-react').Rocket,
  Star: require('lucide-react').Star,
  Zap: Zap,
  Trophy: Trophy,
  Flag: require('lucide-react').Flag,
  CheckSquare: require('lucide-react').CheckSquare,
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [studySession, setStudySession] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    let interval;
    if (studySession) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studySession]);

  const loadDashboardData = async () => {
    try {
      const [statsData, habitsData, tasksData, leaderboardData, challengesData] = await Promise.all([
        api.getUserStats(),
        api.getHabits(),
        api.getTasks(),
        api.getLeaderboard(),
        api.getChallenges()
      ]);
      setStats(statsData);
      setHabits(habitsData);
      setTasks(tasksData.filter(t => !t.completed));
      setLeaderboard(leaderboardData.slice(0, 5));
      setChallenges(challengesData);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      const result = await api.completeHabit(habitId);
      toast.success(`+${result.xp_gained} XP!`, { description: 'Hábito completado! 🎮' });
      await loadDashboardData();
      await refreshUser();
    } catch (error) {
      toast.error('Erro ao completar hábito');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const result = await api.completeTask(taskId);
      toast.success(`+${result.xp_gained} XP!`, { description: 'Tarefa completada! ⚡' });
      await loadDashboardData();
      await refreshUser();
    } catch (error) {
      toast.error('Erro ao completar tarefa');
    }
  };

  const handleDeleteHabit = async (habitId, e) => {
    e.stopPropagation();
    try {
      await api.deleteHabit(habitId);
      toast.success('Hábito removido');
      await loadDashboardData();
    } catch (error) {
      toast.error('Erro ao remover hábito');
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await api.deleteTask(taskId);
      toast.success('Tarefa removida');
      await loadDashboardData();
    } catch (error) {
      toast.error('Erro ao remover tarefa');
    }
  };

  const startStudy = async () => {
    try {
      const result = await api.startStudySession('Estudo Geral');
      setStudySession(result);
      setTimer(0);
      toast.success('Sessão de estudo iniciada! 📚');
    } catch (error) {
      toast.error('Erro ao iniciar sessão');
    }
  };

  const stopStudy = async () => {
    try {
      const result = await api.completeStudySession(studySession.session_id, timer);
      toast.success(`+${result.xp_gained} XP!`, {
        description: `Sessão de ${Math.floor(timer / 60)}min completada!`
      });
      setStudySession(null);
      setTimer(0);
      await loadDashboardData();
      await refreshUser();
    } catch (error) {
      toast.error('Erro ao completar sessão');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || Target;
  };

  if (!stats) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      </Layout>
    );
  }

  const currentLevelXp = stats.level > 1 ? ((stats.level - 1) ** 2) * 100 : 0;
  const nextLevelXp = stats.xp_for_next_level;
  const xpProgress = ((stats.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return (
    <Layout>
      <div className="min-h-screen py-8 px-6" data-testid="dashboard-page">
        <div className="max-w-7xl mx-auto">
          {/* Header with Streak */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl text-white mb-2 pixel-text">Olá, {user?.username}!</h1>
              <p className="text-zinc-400 text-lg">Continue sua jornada de produtividade</p>
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

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Stats & Timer */}
            <div className="lg:col-span-4 space-y-6">
              {/* User Stats Card */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#7C3AED]" />
                      Suas Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center border-2 border-[#9333EA]">
                        <span className="text-2xl font-bold text-white">{stats.level}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-zinc-400 text-sm">Nível {stats.level}</p>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-500">{stats.xp} XP</span>
                          <span className="text-[#EAB308]">{nextLevelXp} XP</span>
                        </div>
                        <Progress value={xpProgress} className="h-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#16162c] rounded-lg border border-[#2d2d5f]">
                        <p className="text-xs text-zinc-500">Tempo de Estudo</p>
                        <p className="text-lg font-bold text-[#06B6D4]">
                          {Math.floor(stats.total_study_time / 3600)}h {Math.floor((stats.total_study_time % 3600) / 60)}m
                        </p>
                      </div>
                      <div className="p-3 bg-[#16162c] rounded-lg border border-[#2d2d5f]">
                        <p className="text-xs text-zinc-500">Conquistas</p>
                        <p className="text-lg font-bold text-[#EAB308]">{stats.achievements_count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Study Timer */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#06B6D4]" />
                      Sessão de Estudo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <div className="text-5xl font-bold text-white mb-6 font-mono">
                      {formatTime(timer)}
                    </div>
                    {!studySession ? (
                      <Button onClick={startStudy} className="game-button-primary w-full">
                        <Clock className="w-4 h-4 mr-2" />
                        Iniciar Sessão
                      </Button>
                    ) : (
                      <Button
                        onClick={stopStudy}
                        className="w-full h-12 rounded-xl font-bold bg-[#22C55E] hover:bg-[#16A34A] transition-all"
                      >
                        Finalizar Sessão
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Mini Leaderboard */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#EAB308]" />
                        Top Jogadores
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => navigate('/leaderboard')} className="text-xs">
                        Ver Tudo
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          entry.user_id === user?.id ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/50' : 'hover:bg-[#16162c]'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-[#EAB308] text-black' :
                          index === 1 ? 'bg-zinc-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{entry.username}</p>
                          <p className="text-xs text-zinc-500">Nv. {entry.level}</p>
                        </div>
                        <p className="text-xs font-semibold text-[#EAB308]">{entry.xp} XP</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Challenges, Habits, Tasks */}
            <div className="lg:col-span-8 space-y-6">
              {/* Challenges */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#EC4899]" />
                      Desafios Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {challenges.map((challenge) => {
                        const progress = (challenge.progress / challenge.target) * 100;
                        return (
                          <div
                            key={challenge.id}
                            className="p-4 rounded-xl bg-[#16162c] border-2 border-[#2d2d5f] hover:border-[#EC4899]/50 transition-all"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                challenge.type === 'daily' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-[#06B6D4]/20 text-[#06B6D4]'
                              }`}>
                                {challenge.type === 'daily' ? 'Diário' : 'Semanal'}
                              </span>
                              <span className="text-xs font-semibold text-[#EAB308]">+{challenge.xp_reward} XP</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">{challenge.title}</h4>
                            <p className="text-xs text-zinc-500 mb-3">{challenge.description}</p>
                            <Progress value={progress} className="h-2 mb-1" />
                            <p className="text-xs text-zinc-500 text-right">{Math.round(progress)}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Habits */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#7C3AED]" />
                        Hábitos de Hoje
                      </span>
                      <span className="text-sm text-zinc-500 font-normal">
                        {habits.filter(h => h.completed_today).length}/{habits.length} completos
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {habits.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum hábito criado ainda</p>
                        <p className="text-sm">Clique no botão + para criar seu primeiro hábito!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {habits.map((habit) => {
                          const IconComponent = getIconComponent(habit.icon);
                          return (
                            <motion.button
                              key={habit.id}
                              whileHover={{ scale: habit.completed_today ? 1 : 1.02 }}
                              whileTap={{ scale: habit.completed_today ? 1 : 0.98 }}
                              onClick={() => !habit.completed_today && handleCompleteHabit(habit.id)}
                              disabled={habit.completed_today}
                              className={`relative group p-4 rounded-xl border-2 transition-all text-left ${
                                habit.completed_today
                                  ? 'bg-[#22C55E]/10 border-[#22C55E]/30'
                                  : 'bg-[#16162c] border-[#2d2d5f] hover:border-opacity-100 cursor-pointer'
                              }`}
                              style={{ borderColor: habit.completed_today ? undefined : habit.color + '50' }}
                            >
                              <button
                                onClick={(e) => handleDeleteHabit(habit.id, e)}
                                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div className="flex items-start justify-between mb-2">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: habit.color + '20' }}
                                >
                                  <IconComponent className="w-5 h-5" style={{ color: habit.color }} />
                                </div>
                                {habit.completed_today && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
                              </div>
                              <h4 className="font-semibold text-white text-sm mb-1">{habit.name}</h4>
                              <p className="text-xs text-zinc-500">{habit.category}</p>
                              {habit.streak > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Flame className="w-3 h-3 text-orange-500" />
                                  <span className="text-xs text-orange-500">{habit.streak} dias</span>
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tasks */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#06B6D4]" />
                        Tarefas Pendentes
                      </span>
                      <span className="text-sm text-zinc-500 font-normal">{tasks.length} tarefas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma tarefa pendente</p>
                        <p className="text-sm">Clique no botão + para criar uma nova tarefa!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.slice(0, 5).map((task) => {
                          const IconComponent = getIconComponent(task.icon);
                          return (
                            <motion.button
                              key={task.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleCompleteTask(task.id)}
                              className="w-full group relative flex items-center gap-4 p-4 rounded-xl bg-[#16162c] border-2 border-[#2d2d5f] hover:border-[#06B6D4]/50 transition-all text-left"
                            >
                              <button
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: task.color + '20' }}
                              >
                                <IconComponent className="w-5 h-5" style={{ color: task.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white text-sm truncate">{task.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-zinc-500">{task.category}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm font-semibold text-[#EAB308]">+{task.xp_reward} XP</span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-lg shadow-[#7C3AED]/50 flex items-center justify-center z-40"
        >
          <Plus className="w-8 h-8" />
        </motion.button>

        {/* Create Modal */}
        <CreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={loadDashboardData}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const [newHabit, setNewHabit] = useState({ name: '', category: 'Estudos', color: '#7C3AED' });
  const [newTask, setNewTask] = useState({ title: '', category: 'Geral', xp_reward: 10 });

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
      toast.success(`+${result.xp_gained} XP!`, {
        description: 'Hábito completado!'
      });
      await loadDashboardData();
      await refreshUser();
    } catch (error) {
      toast.error('Erro ao completar hábito');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const result = await api.completeTask(taskId);
      toast.success(`+${result.xp_gained} XP!`, {
        description: 'Tarefa completada!'
      });
      await loadDashboardData();
      await refreshUser();
    } catch (error) {
      toast.error('Erro ao completar tarefa');
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    try {
      await api.createHabit(newHabit);
      toast.success('Hábito criado!');
      setNewHabit({ name: '', category: 'Estudos', color: '#7C3AED' });
      await loadDashboardData();
    } catch (error) {
      toast.error('Erro ao criar hábito');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.createTask(newTask);
      toast.success('Tarefa criada!');
      setNewTask({ title: '', category: 'Geral', xp_reward: 10 });
      await loadDashboardData();
    } catch (error) {
      toast.error('Erro ao criar tarefa');
    }
  };

  const startStudy = async () => {
    try {
      const result = await api.startStudySession('Estudo Geral');
      setStudySession(result);
      setTimer(0);
      toast.success('Sessão de estudo iniciada!');
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

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const xpProgress = ((stats.xp - (stats.level > 1 ? ((stats.level - 1) ** 2) * 100 : 0)) / (stats.xp_for_next_level - (stats.level > 1 ? ((stats.level - 1) ** 2) * 100 : 0))) * 100;

  return (
    <div className="min-h-screen bg-[#050505] py-8 px-4" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Olá, {user?.username}!</h1>
            <p className="text-zinc-400">Continue sua jornada de produtividade</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/leaderboard')} variant="outline" className="border-zinc-700">
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </Button>
            <Button onClick={() => navigate('/profile')} variant="outline" className="border-zinc-700">
              Perfil
            </Button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Study Timer - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-8 md:row-span-2"
          >
            <Card className="glass h-full" data-testid="study-timer-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="w-6 h-6 text-game-primary" />
                  Sessão de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-8xl font-bold text-white mb-8 font-mono">
                  {formatTime(timer)}
                </div>
                {!studySession ? (
                  <Button
                    onClick={startStudy}
                    data-testid="start-study-button"
                    className="game-button-primary text-xl px-12 h-16"
                  >
                    <Clock className="w-6 h-6 mr-2" />
                    Iniciar Sessão
                  </Button>
                ) : (
                  <Button
                    onClick={stopStudy}
                    data-testid="stop-study-button"
                    className="h-16 px-12 text-xl rounded-xl font-bold bg-game-success hover:bg-green-600 transition-all active:scale-95"
                  >
                    Finalizar Sessão
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Character Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4"
          >
            <Card className="glass" data-testid="user-stats-card">
              <CardHeader>
                <CardTitle className="text-xl">Suas Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-game-primary to-indigo-600 rounded-full mb-3">
                    <span className="text-4xl font-bold">{stats.level}</span>
                  </div>
                  <p className="text-sm text-zinc-400">Nível</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">XP</span>
                    <span className="text-game-gold font-semibold">{stats.xp} / {stats.xp_for_next_level}</span>
                  </div>
                  <Progress value={xpProgress} className="h-3" />
                </div>

                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-semibold">{stats.streak} dias</span>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">Tempo Total de Estudo</p>
                  <p className="text-xl font-bold text-game-accent">{Math.floor(stats.total_study_time / 3600)}h {Math.floor((stats.total_study_time % 3600) / 60)}min</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mini Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 md:row-span-2"
          >
            <Card className="glass h-full" data-testid="mini-leaderboard">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-game-gold" />
                    Top Jogadores
                  </span>
                  <Button size="sm" onClick={() => navigate('/leaderboard')} variant="ghost">
                    Ver Tudo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-game-gold text-black' :
                      index === 1 ? 'bg-zinc-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{entry.username}</p>
                      <p className="text-xs text-zinc-500">Nível {entry.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-game-gold">{entry.xp} XP</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Habits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-8"
          >
            <Card className="glass" data-testid="habits-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>Hábitos Diários</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-game-primary hover:bg-game-primary-glow">
                        <Plus className="w-4 h-4 mr-1" /> Novo Hábito
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Hábito</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateHabit} className="space-y-4">
                        <div>
                          <Label>Nome do Hábito</Label>
                          <Input
                            value={newHabit.name}
                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                            placeholder="Ex: Ler 30 minutos"
                            className="bg-zinc-800 border-zinc-700"
                            required
                          />
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <Input
                            value={newHabit.category}
                            onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                            className="bg-zinc-800 border-zinc-700"
                          />
                        </div>
                        <Button type="submit" className="w-full game-button-primary">
                          Criar Hábito
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {habits.map((habit) => (
                    <button
                      key={habit.id}
                      onClick={() => !habit.completed_today && handleCompleteHabit(habit.id)}
                      disabled={habit.completed_today}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        habit.completed_today
                          ? 'bg-game-success/10 border-game-success/30'
                          : 'bg-zinc-900/50 border-zinc-800 hover:border-game-primary/50 hover:scale-105'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        {habit.completed_today && <CheckCircle2 className="w-5 h-5 text-game-success" />}
                      </div>
                      <h4 className="font-semibold text-white mb-1">{habit.name}</h4>
                      <p className="text-xs text-zinc-500">{habit.category}</p>
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-500">{habit.streak} dias</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-4"
          >
            <Card className="glass" data-testid="tasks-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>Tarefas</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-game-accent hover:bg-cyan-600">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle>Nova Tarefa</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="bg-zinc-800 border-zinc-700"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full game-button-primary">
                          Criar Tarefa
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleCompleteTask(task.id)}
                    className="w-full p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900/70 transition-all text-left border border-zinc-800 hover:border-game-accent/50"
                  >
                    <p className="font-semibold text-white text-sm">{task.title}</p>
                    <p className="text-xs text-game-gold">+{task.xp_reward} XP</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-8"
          >
            <Card className="glass" data-testid="challenges-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-game-pink" />
                  Desafios Ativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenges.map((challenge) => {
                  const progress = (challenge.progress / challenge.target) * 100;
                  return (
                    <div key={challenge.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{challenge.title}</h4>
                          <p className="text-sm text-zinc-400">{challenge.description}</p>
                        </div>
                        <span className="text-sm font-semibold text-game-gold">+{challenge.xp_reward} XP</span>
                      </div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{challenge.type === 'daily' ? 'Diário' : 'Semanal'}</span>
                        <span>{Math.round(progress)}% completo</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
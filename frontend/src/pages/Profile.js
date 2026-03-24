import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { Trophy, Flame, Clock, Target, ArrowLeft, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [studyStats, setStudyStats] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [statsData, achievementsData, studyStatsData] = await Promise.all([
        api.getUserStats(),
        api.getAchievements(),
        api.getStudyStats()
      ]);
      setStats(statsData);
      setAchievements(achievementsData);
      setStudyStats(studyStatsData);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const xpProgress = ((stats.xp - (stats.level > 1 ? ((stats.level - 1) ** 2) * 100 : 0)) / (stats.xp_for_next_level - (stats.level > 1 ? ((stats.level - 1) ** 2) * 100 : 0))) * 100;

  return (
    <div className="min-h-screen bg-[#050505] py-8 px-4" data-testid="profile-page">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate('/dashboard')} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleLogout} variant="destructive" data-testid="logout-button">
            Sair
          </Button>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-2xl mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-game-primary to-indigo-600 rounded-full mb-4">
            <span className="text-6xl font-bold">{stats.level}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{user?.username}</h1>
          <p className="text-zinc-400 mb-4">{user?.email}</p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progresso para Nível {stats.level + 1}</span>
              <span className="text-game-gold font-semibold">{stats.xp} / {stats.xp_for_next_level} XP</span>
            </div>
            <Progress value={xpProgress} className="h-4" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-game-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-game-primary" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.xp}</p>
                <p className="text-sm text-zinc-500">XP Total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.streak}</p>
                <p className="text-sm text-zinc-500">Dias de Streak</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-game-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-game-accent" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{Math.floor(stats.total_study_time / 3600)}h</p>
                <p className="text-sm text-zinc-500">Tempo de Estudo</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-game-gold/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-game-gold" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stats.achievements_count}</p>
                <p className="text-sm text-zinc-500">Conquistas</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Study Stats */}
        {studyStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="w-6 h-6 text-game-accent" />
                  Estatísticas de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Total de Sessões</p>
                    <p className="text-3xl font-bold text-white">{studyStats.total_sessions}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Tempo Total</p>
                    <p className="text-3xl font-bold text-white">{Math.floor(studyStats.total_time / 3600)}h {Math.floor((studyStats.total_time % 3600) / 60)}min</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Média por Sessão</p>
                    <p className="text-3xl font-bold text-white">{Math.floor(studyStats.average_session / 60)}min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass" data-testid="achievements-section">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Award className="w-6 h-6 text-game-gold" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((item) => (
                  <div
                    key={item.achievement.id}
                    className={`p-6 rounded-xl text-center transition-all ${
                      item.unlocked
                        ? 'bg-gradient-to-br from-game-primary/20 to-indigo-600/20 border-2 border-game-primary/50'
                        : 'bg-zinc-900/50 border border-zinc-800 opacity-50'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      item.unlocked
                        ? 'bg-gradient-to-br from-game-gold to-yellow-600'
                        : 'bg-zinc-800'
                    }`}>
                      <Award className={`w-8 h-8 ${
                        item.unlocked ? 'text-white' : 'text-zinc-600'
                      }`} />
                    </div>
                    <h4 className="font-bold text-white mb-1">{item.achievement.name}</h4>
                    <p className="text-xs text-zinc-400 mb-2">{item.achievement.description}</p>
                    <p className="text-sm text-game-gold font-semibold">+{item.achievement.xp_reward} XP</p>
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

export default Profile;
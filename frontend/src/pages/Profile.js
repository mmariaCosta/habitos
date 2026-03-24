import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { Trophy, Flame, Clock, Target, Award, User, Mail, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import Layout from '../components/Layout';

const Profile = () => {
  const { user } = useAuth();
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
      <div className="min-h-screen py-8 px-6" data-testid="profile-page">
        <div className="max-w-5xl mx-auto">
          {/* Header with Streak */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl text-white mb-2 pixel-text">Meu Perfil</h1>
              <p className="text-zinc-400 text-lg">Veja suas estatísticas e conquistas</p>
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

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center border-4 border-[#9333EA] shadow-lg shadow-[#7C3AED]/30">
                  <span className="text-5xl font-bold text-white">{stats.level}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-[#EAB308] rounded-lg">
                  <span className="text-xs font-bold text-black">Nv. {stats.level}</span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">{user?.username}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 mb-4">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>

                {/* XP Progress */}
                <div className="max-w-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Progresso para Nível {stats.level + 1}</span>
                    <span className="text-[#EAB308] font-semibold">{stats.xp} / {nextLevelXp} XP</span>
                  </div>
                  <div className="h-4 bg-[#16162c] rounded-full overflow-hidden border-2 border-[#2d2d5f]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Trophy, label: 'XP Total', value: stats.xp, color: '#7C3AED' },
              { icon: Flame, label: 'Dias de Streak', value: stats.streak, color: '#F97316' },
              { icon: Clock, label: 'Horas de Estudo', value: Math.floor(stats.total_study_time / 3600), color: '#06B6D4' },
              { icon: Award, label: 'Conquistas', value: stats.achievements_count, color: '#EAB308' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="glass">
                  <CardContent className="p-4 text-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: stat.color + '20' }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#06B6D4]" />
                    Estatísticas de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 bg-[#16162c] rounded-xl border border-[#2d2d5f]">
                      <p className="text-zinc-400 text-sm mb-1">Total de Sessões</p>
                      <p className="text-2xl font-bold text-white">{studyStats.total_sessions}</p>
                    </div>
                    <div className="p-4 bg-[#16162c] rounded-xl border border-[#2d2d5f]">
                      <p className="text-zinc-400 text-sm mb-1">Tempo Total</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.floor(studyStats.total_time / 3600)}h {Math.floor((studyStats.total_time % 3600) / 60)}min
                      </p>
                    </div>
                    <div className="p-4 bg-[#16162c] rounded-xl border border-[#2d2d5f]">
                      <p className="text-zinc-400 text-sm mb-1">Média por Sessão</p>
                      <p className="text-2xl font-bold text-white">{Math.floor(studyStats.average_session / 60)}min</p>
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#EAB308]" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {achievements.map((item) => (
                    <div
                      key={item.achievement.id}
                      className={`p-5 rounded-xl text-center transition-all ${
                        item.unlocked
                          ? 'bg-[#EAB308]/10 border-2 border-[#EAB308]/50'
                          : 'bg-[#16162c] border-2 border-[#2d2d5f] opacity-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                        item.unlocked
                          ? 'bg-gradient-to-br from-[#EAB308] to-yellow-600'
                          : 'bg-[#2d2d5f]'
                      }`}>
                        <Award className={`w-7 h-7 ${
                          item.unlocked ? 'text-white' : 'text-zinc-600'
                        }`} />
                      </div>
                      <h4 className={`font-bold mb-1 ${item.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                        {item.achievement.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mb-2">{item.achievement.description}</p>
                      <p className={`text-sm font-semibold ${item.unlocked ? 'text-[#EAB308]' : 'text-zinc-600'}`}>
                        +{item.achievement.xp_reward} XP
                      </p>
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

export default Profile;

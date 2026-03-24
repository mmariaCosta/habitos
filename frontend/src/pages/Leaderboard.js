import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
      const rank = data.findIndex(entry => entry.user_id === user?.id);
      if (rank !== -1) {
        setUserRank(rank + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <Layout>
      <div className="min-h-screen py-8 px-6" data-testid="leaderboard-page">
        <div className="max-w-5xl mx-auto">
          {/* Header with Streak */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl text-white mb-2 pixel-text">Ranking Global</h1>
              <p className="text-zinc-400 text-lg">Compita com os melhores jogadores</p>
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

          {/* Podium - Top 3 */}
          <div className="flex items-end justify-center gap-4 mb-12">
            {/* 2nd Place */}
            {top3[1] && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center border-4 border-zinc-500">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <Medal className="absolute -top-2 -right-2 w-7 h-7 text-zinc-400" />
                </div>
                <div className="glass p-5 rounded-2xl text-center min-w-[180px] border-2 border-zinc-500/50">
                  <h3 className="text-lg font-bold text-white mb-1">{top3[1].username}</h3>
                  <p className="text-xs text-zinc-400 mb-2">Nível {top3[1].level}</p>
                  <p className="text-xl font-bold text-[#EAB308]">{top3[1].xp} XP</p>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#EAB308] to-yellow-600 flex items-center justify-center border-4 border-[#EAB308] shadow-2xl shadow-[#EAB308]/50">
                    <Crown className="w-14 h-14 text-white" />
                  </div>
                  <Trophy className="absolute -top-3 -right-3 w-9 h-9 text-[#EAB308]" />
                </div>
                <div className="glass p-6 rounded-2xl text-center min-w-[200px] border-2 border-[#EAB308]/50">
                  <h3 className="text-xl font-bold text-white mb-1">{top3[0].username}</h3>
                  <p className="text-sm text-zinc-400 mb-2">Nível {top3[0].level}</p>
                  <p className="text-2xl font-bold text-[#EAB308]">{top3[0].xp} XP</p>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center border-4 border-orange-600">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <Medal className="absolute -top-2 -right-2 w-7 h-7 text-orange-600" />
                </div>
                <div className="glass p-5 rounded-2xl text-center min-w-[180px] border-2 border-orange-600/50">
                  <h3 className="text-lg font-bold text-white mb-1">{top3[2].username}</h3>
                  <p className="text-xs text-zinc-400 mb-2">Nível {top3[2].level}</p>
                  <p className="text-xl font-bold text-[#EAB308]">{top3[2].xp} XP</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Rest of leaderboard */}
          <div className="glass p-6 rounded-2xl" data-testid="leaderboard-list">
            <div className="space-y-2">
              {rest.map((entry, index) => {
                const rank = index + 4;
                const isCurrentUser = entry.user_id === user?.id;
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? 'bg-[#7C3AED]/20 border-2 border-[#7C3AED]'
                        : 'bg-[#16162c] hover:bg-[#1e1e3f] border border-[#2d2d5f]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2d2d5f] flex items-center justify-center font-bold text-lg text-zinc-400">
                      {rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{entry.username}</h3>
                        {entry.is_bot && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2d2d5f] text-zinc-500">BOT</span>
                        )}
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#7C3AED] text-white">VOCÊ</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">Nível {entry.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#EAB308]">{entry.xp}</p>
                      <p className="text-xs text-zinc-500">XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* User rank sticky footer */}
          {userRank && userRank > 3 && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-0 left-64 right-0 p-4 bg-[#0a0a14]/90 backdrop-blur-md border-t-4 border-[#2d2d5f]"
            >
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#7C3AED]/20 border-2 border-[#7C3AED]">
                  <div className="w-12 h-12 rounded-full bg-[#7C3AED] flex items-center justify-center font-bold text-lg">
                    {userRank}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{user?.username} (Você)</h3>
                    <p className="text-sm text-zinc-400">Nível {user?.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#EAB308]">{user?.xp}</p>
                    <p className="text-xs text-zinc-500">XP</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;

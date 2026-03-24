import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Leaderboard = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#050505] py-8 px-4" data-testid="leaderboard-page">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white">
            Ranking Global
          </h1>
          <p className="text-zinc-400 text-lg">Compita com os melhores jogadores</p>
        </div>

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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center border-4 border-zinc-500">
                  <span className="text-3xl font-bold">2</span>
                </div>
                <Medal className="absolute -top-2 -right-2 w-8 h-8 text-zinc-400" />
              </div>
              <div className="glass p-6 rounded-2xl text-center min-w-[200px] border-2 border-zinc-500/50">
                <h3 className="text-xl font-bold text-white mb-2">{top3[1].username}</h3>
                <p className="text-sm text-zinc-400 mb-3">Nível {top3[1].level}</p>
                <p className="text-2xl font-bold text-game-gold">{top3[1].xp} XP</p>
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
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-game-gold to-yellow-600 flex items-center justify-center border-4 border-game-gold shadow-2xl shadow-game-gold/50">
                  <Crown className="w-16 h-16 text-white" />
                </div>
                <Trophy className="absolute -top-3 -right-3 w-10 h-10 text-game-gold animate-pulse-glow" />
              </div>
              <div className="glass p-8 rounded-2xl text-center min-w-[220px] border-2 border-game-gold/50">
                <h3 className="text-2xl font-bold text-white mb-2">{top3[0].username}</h3>
                <p className="text-sm text-zinc-400 mb-3">Nível {top3[0].level}</p>
                <p className="text-3xl font-bold text-game-gold">{top3[0].xp} XP</p>
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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center border-4 border-orange-600">
                  <span className="text-3xl font-bold">3</span>
                </div>
                <Medal className="absolute -top-2 -right-2 w-8 h-8 text-orange-600" />
              </div>
              <div className="glass p-6 rounded-2xl text-center min-w-[200px] border-2 border-orange-600/50">
                <h3 className="text-xl font-bold text-white mb-2">{top3[2].username}</h3>
                <p className="text-sm text-zinc-400 mb-3">Nível {top3[2].level}</p>
                <p className="text-2xl font-bold text-game-gold">{top3[2].xp} XP</p>
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
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCurrentUser
                      ? 'bg-game-primary/20 border-2 border-game-primary'
                      : 'bg-zinc-900/50 hover:bg-zinc-900/70 border border-zinc-800'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-400">
                    {rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{entry.username}</h3>
                      {entry.is_bot && (
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-500">BOT</span>
                      )}
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-1 rounded-full bg-game-primary text-white">VOCÊ</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">Nível {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-game-gold">{entry.xp}</p>
                    <p className="text-xs text-zinc-500">XP</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* User rank sticky footer */}
        {userRank && userRank > 3 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/80 backdrop-blur-md border-t border-white/10">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-game-primary/20 border-2 border-game-primary">
                <div className="w-12 h-12 rounded-full bg-game-primary flex items-center justify-center font-bold text-lg">
                  {userRank}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{user?.username} (Você)</h3>
                  <p className="text-sm text-zinc-400">Nível {user?.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-game-gold">{user?.xp}</p>
                  <p className="text-xs text-zinc-500">XP</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
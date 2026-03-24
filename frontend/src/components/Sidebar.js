import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  User,
  LogOut,
  Flame,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Principal', path: '/dashboard' },
    { icon: BarChart3, label: 'Estatísticas', path: '/stats' },
    { icon: Trophy, label: 'Ranking', path: '/leaderboard' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a14] border-r-4 border-[#2d2d5f] flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 border-b-4 border-[#2d2d5f]">
        <h1 className="text-xl text-[#7C3AED] font-bold pixel-text flex items-center gap-2">
          <Zap className="w-6 h-6" />
          LevelUp
        </h1>
      </div>

      {/* User Stats Mini */}
      <div className="p-4 border-b-4 border-[#2d2d5f] bg-[#16162c]/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center border-2 border-[#9333EA]">
            <span className="text-lg font-bold text-white">{user?.level || 1}</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm truncate max-w-[140px]">{user?.username}</p>
            <p className="text-zinc-500 text-xs">{user?.xp || 0} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/30">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500 text-sm font-semibold">{user?.streak || 0} dias seguidos</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-[#7C3AED] text-white border-2 border-[#9333EA] shadow-[0_4px_0_0_#5B21B6]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#16162c] border-2 border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t-4 border-[#2d2d5f]">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sair</span>
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

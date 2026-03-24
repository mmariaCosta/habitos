import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const LandingPage = () => {
  const { login, register } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login realizado com sucesso!');
      } else {
        await register(formData.email, formData.password, formData.username);
        toast.success('Conta criada! Bem-vindo ao LevelUp!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1769120064066-4ab270e38ea8?crop=entropy&cs=srgb&fm=jpg&q=85)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass max-w-md w-full p-8 rounded-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-game-primary to-indigo-600 rounded-xl mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
            <p className="text-zinc-400">Continue sua jornada de produtividade</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="username" className="text-white">Nome de Usuário</Label>
                <Input
                  id="username"
                  data-testid="auth-username-input"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 bg-zinc-900/50 border-zinc-700 text-white"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                data-testid="auth-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 bg-zinc-900/50 border-zinc-700 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                data-testid="auth-password-input"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 bg-zinc-900/50 border-zinc-700 text-white"
                required
              />
            </div>
            <Button
              type="submit"
              data-testid="auth-submit-button"
              className="w-full game-button-primary"
              disabled={loading}
            >
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-game-primary hover:text-game-primary-glow transition-colors"
            >
              {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center p-4" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1762278804772-6f5bb8eea759?crop=entropy&cs=srgb&fm=jpg&q=85)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-game-primary/20 border border-game-primary/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-game-gold" />
              <span className="text-sm font-semibold text-game-gold">Sistema de Gamificação Completo</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white">
              Transforme Estudos em Conquistas
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto">
              Compete com outros jogadores, suba de nível, desbloqueie conquistas e desenvolva disciplina jogando.
            </p>
            
            <Button
              onClick={() => setShowAuth(true)}
              data-testid="get-started-btn"
              className="game-button-primary text-lg px-12 h-14"
            >
              Começar Agora
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">Como Funciona</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="game-card game-card-interactive"
            >
              <div className="w-12 h-12 bg-game-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-game-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Ganhe XP</h3>
              <p className="text-zinc-400">Complete tarefas, mantenha hábitos e estude para ganhar pontos de experiência e subir de nível.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="game-card game-card-interactive"
            >
              <div className="w-12 h-12 bg-game-gold/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-game-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Conquistas</h3>
              <p className="text-zinc-400">Desbloqueie badges especiais conforme atinge marcos importantes na sua jornada.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="game-card game-card-interactive"
            >
              <div className="w-12 h-12 bg-game-accent/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-game-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Competição</h3>
              <p className="text-zinc-400">Dispute no ranking global contra outros jogadores e bots inteligentes.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
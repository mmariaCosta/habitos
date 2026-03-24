import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Target, BookOpen, Dumbbell, Heart, Briefcase, Music,
  Code, Coffee, Moon, Sun, Gamepad2, Pencil, Camera, Palette,
  Lightbulb, Rocket, Star, Zap, Trophy, Flag, Clock, Calendar,
  CheckSquare, ListTodo
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { api } from '../utils/api';
import { toast } from 'sonner';

const ICONS = [
  { name: 'Target', component: Target },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Heart', component: Heart },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Music', component: Music },
  { name: 'Code', component: Code },
  { name: 'Coffee', component: Coffee },
  { name: 'Moon', component: Moon },
  { name: 'Sun', component: Sun },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Pencil', component: Pencil },
  { name: 'Camera', component: Camera },
  { name: 'Palette', component: Palette },
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'Rocket', component: Rocket },
  { name: 'Star', component: Star },
  { name: 'Zap', component: Zap },
  { name: 'Trophy', component: Trophy },
  { name: 'Flag', component: Flag },
];

const COLORS = [
  '#7C3AED', '#EC4899', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6',
  '#D946EF', '#F43F5E',
];

const DAYS = [
  { short: 'D', full: 'Domingo', value: 'sunday' },
  { short: 'S', full: 'Segunda', value: 'monday' },
  { short: 'T', full: 'Terça', value: 'tuesday' },
  { short: 'Q', full: 'Quarta', value: 'wednesday' },
  { short: 'Q', full: 'Quinta', value: 'thursday' },
  { short: 'S', full: 'Sexta', value: 'friday' },
  { short: 'S', full: 'Sábado', value: 'saturday' },
];

const PREDEFINED_CATEGORIES = [
  'Estudos', 'Saúde', 'Trabalho', 'Fitness', 'Meditação', 'Leitura', 'Hobby'
];

const CreateModal = ({ isOpen, onClose, onCreated }) => {
  const [type, setType] = useState('habit');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    category: 'Estudos',
    customCategory: '',
    color: '#7C3AED',
    icon: 'Target',
    days_of_week: [],
    reminder_time: '',
    frequency: 'daily',
    goal: 1,
    xp_reward: 10,
    priority: 'medium',
    due_date: '',
  });

  const resetForm = () => {
    setType('habit');
    setStep(1);
    setFormData({
      name: '',
      title: '',
      category: 'Estudos',
      customCategory: '',
      color: '#7C3AED',
      icon: 'Target',
      days_of_week: [],
      reminder_time: '',
      frequency: 'daily',
      goal: 1,
      xp_reward: 10,
      priority: 'medium',
      due_date: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const category = formData.customCategory || formData.category;
      
      if (type === 'habit') {
        await api.createHabit({
          name: formData.name,
          category,
          color: formData.color,
          icon: formData.icon,
          frequency: formData.frequency,
          goal: formData.goal,
          reminder_time: formData.reminder_time || null,
          days_of_week: formData.days_of_week,
        });
        toast.success('Hábito criado com sucesso! 🎮');
      } else {
        await api.createTask({
          title: formData.title,
          category,
          xp_reward: formData.xp_reward,
          priority: formData.priority,
          due_date: formData.due_date || null,
          icon: formData.icon,
          color: formData.color,
        });
        toast.success('Tarefa criada com sucesso! ⚡');
      }
      
      onCreated();
      handleClose();
    } catch (error) {
      toast.error('Erro ao criar ' + (type === 'habit' ? 'hábito' : 'tarefa'));
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = ICONS.find(i => i.name === formData.icon)?.component || Target;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#0a0a14] border-4 border-[#2d2d5f] rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-4 border-[#2d2d5f] bg-[#16162c]">
            <h2 className="text-lg text-white pixel-text flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#7C3AED]" />
              Criar Novo
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-[#2d2d5f] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Type Selector */}
            <div className="flex gap-3">
              <button
                onClick={() => { setType('habit'); setStep(1); }}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  type === 'habit'
                    ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                    : 'bg-[#16162c] border-[#2d2d5f] text-zinc-400 hover:border-[#7C3AED]/50'
                }`}
              >
                <Target className="w-6 h-6" />
                <span className="text-sm font-semibold">Hábito</span>
              </button>
              <button
                onClick={() => { setType('task'); setStep(1); }}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  type === 'task'
                    ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-white'
                    : 'bg-[#16162c] border-[#2d2d5f] text-zinc-400 hover:border-[#06B6D4]/50'
                }`}
              >
                <CheckSquare className="w-6 h-6" />
                <span className="text-sm font-semibold">Tarefa</span>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full transition-all ${
                    s === step ? 'bg-[#7C3AED] w-6' : s < step ? 'bg-[#7C3AED]/50' : 'bg-[#2d2d5f]'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-white mb-2 block">Nome {type === 'task' && 'da Tarefa'}{type === 'habit' && 'do Hábito'}</Label>
                  <Input
                    value={type === 'habit' ? formData.name : formData.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [type === 'habit' ? 'name' : 'title']: e.target.value
                    }))}
                    placeholder={type === 'habit' ? 'Ex: Ler 30 minutos' : 'Ex: Estudar para prova'}
                    className="bg-[#16162c] border-[#2d2d5f] text-white h-12"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Categoria</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PREDEFINED_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat, customCategory: '' }))}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          formData.category === cat && !formData.customCategory
                            ? 'bg-[#7C3AED] text-white'
                            : 'bg-[#16162c] text-zinc-400 border border-[#2d2d5f] hover:border-[#7C3AED]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={formData.customCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                    placeholder="Ou crie sua própria categoria..."
                    className="bg-[#16162c] border-[#2d2d5f] text-white h-10 text-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Customization */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-white mb-2 block">Ícone</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICONS.map(({ name, component: Icon }) => (
                      <button
                        key={name}
                        onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                        className={`p-3 rounded-lg transition-all ${
                          formData.icon === name
                            ? 'bg-[#7C3AED] text-white scale-110'
                            : 'bg-[#16162c] text-zinc-400 hover:text-white hover:bg-[#2d2d5f]'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a14] scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-[#16162c] rounded-xl border-2 border-[#2d2d5f]">
                  <p className="text-xs text-zinc-500 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: formData.color + '20', border: `2px solid ${formData.color}` }}
                    >
                      <SelectedIcon className="w-6 h-6" style={{ color: formData.color }} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {(type === 'habit' ? formData.name : formData.title) || 'Nome aqui...'}
                      </p>
                      <p className="text-zinc-500 text-sm">{formData.customCategory || formData.category}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {type === 'habit' ? (
                  <>
                    <div>
                      <Label className="text-white mb-2 block">Dias da Semana</Label>
                      <div className="flex gap-2">
                        {DAYS.map((day, idx) => (
                          <button
                            key={day.value}
                            onClick={() => toggleDay(day.value)}
                            title={day.full}
                            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                              formData.days_of_week.includes(day.value)
                                ? 'bg-[#7C3AED] text-white'
                                : 'bg-[#16162c] text-zinc-400 border border-[#2d2d5f] hover:border-[#7C3AED]'
                            }`}
                          >
                            {day.short}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Deixe vazio para todos os dias</p>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Horário de Lembrete (opcional)</Label>
                      <Input
                        type="time"
                        value={formData.reminder_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, reminder_time: e.target.value }))}
                        className="bg-[#16162c] border-[#2d2d5f] text-white h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Meta Diária</Label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, goal: Math.max(1, prev.goal - 1) }))}
                          className="w-10 h-10 rounded-lg bg-[#16162c] text-white border border-[#2d2d5f] hover:bg-[#2d2d5f]"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold text-white w-12 text-center">{formData.goal}</span>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, goal: prev.goal + 1 }))}
                          className="w-10 h-10 rounded-lg bg-[#16162c] text-white border border-[#2d2d5f] hover:bg-[#2d2d5f]"
                        >
                          +
                        </button>
                        <span className="text-zinc-400">vez(es) por dia</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-white mb-2 block">Prioridade</Label>
                      <div className="flex gap-2">
                        {[{ value: 'low', label: 'Baixa', color: '#22C55E' }, { value: 'medium', label: 'Média', color: '#EAB308' }, { value: 'high', label: 'Alta', color: '#EF4444' }].map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                            className={`flex-1 p-3 rounded-lg text-sm font-semibold transition-all border-2 ${
                              formData.priority === p.value
                                ? 'text-white'
                                : 'bg-[#16162c] text-zinc-400 border-[#2d2d5f] hover:border-opacity-50'
                            }`}
                            style={{
                              backgroundColor: formData.priority === p.value ? p.color + '20' : undefined,
                              borderColor: formData.priority === p.value ? p.color : undefined,
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Data de Vencimento (opcional)</Label>
                      <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                        className="bg-[#16162c] border-[#2d2d5f] text-white h-12"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Recompensa XP</Label>
                      <div className="flex items-center gap-4">
                        {[10, 20, 30, 50, 100].map((xp) => (
                          <button
                            key={xp}
                            onClick={() => setFormData(prev => ({ ...prev, xp_reward: xp }))}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                              formData.xp_reward === xp
                                ? 'bg-[#EAB308] text-black'
                                : 'bg-[#16162c] text-zinc-400 border border-[#2d2d5f] hover:border-[#EAB308]'
                            }`}
                          >
                            {xp} XP
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t-4 border-[#2d2d5f] bg-[#16162c] flex justify-between">
            {step > 1 ? (
              <Button
                onClick={() => setStep(s => s - 1)}
                variant="ghost"
                className="text-zinc-400 hover:text-white"
              >
                Voltar
              </Button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !(type === 'habit' ? formData.name : formData.title)}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-6"
              >
                {loading ? 'Criando...' : 'Criar'}
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateModal;

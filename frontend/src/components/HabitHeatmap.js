import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const HabitHeatmap = ({ calendarData = [], habits = [] }) => {
  // Generate last 365 days
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find data for this day
      const dayData = calendarData.find(d => d.date === dateStr);
      
      result.push({
        date: dateStr,
        habitsCompleted: dayData?.habits_completed || 0,
        tasksCompleted: dayData?.tasks_completed || 0,
        studyTime: dayData?.study_time || 0,
        xpGained: dayData?.xp_gained || 0,
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        displayDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      });
    }
    
    return result;
  }, [calendarData]);

  // Group by weeks
  const weeks = useMemo(() => {
    const result = [];
    let currentWeek = [];
    
    // Add empty cells for the first week
    if (days.length > 0) {
      const firstDayOfWeek = days[0].dayOfWeek;
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    
    return result;
  }, [days]);

  // Get intensity level (0-4)
  const getIntensity = (day) => {
    if (!day) return 0;
    const total = day.habitsCompleted + day.tasksCompleted;
    if (total === 0) return 0;
    if (total <= 1) return 1;
    if (total <= 3) return 2;
    if (total <= 5) return 3;
    return 4;
  };

  // Get color based on intensity
  const getColor = (intensity) => {
    const colors = [
      'bg-[#161b22]', // 0 - empty
      'bg-[#0e4429]', // 1 - low
      'bg-[#006d32]', // 2 - medium-low
      'bg-[#26a641]', // 3 - medium-high
      'bg-[#39d353]', // 4 - high
    ];
    return colors[intensity];
  };

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Get month labels positions
  const monthLabels = useMemo(() => {
    const labels = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d !== null);
      if (firstValidDay && firstValidDay.month !== currentMonth) {
        labels.push({ month: months[firstValidDay.month], weekIndex });
        currentMonth = firstValidDay.month;
      }
    });
    
    return labels;
  }, [weeks]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="w-full overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-2 ml-8">
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              className="text-xs text-zinc-500"
              style={{ marginLeft: idx === 0 ? 0 : `${(label.weekIndex - (monthLabels[idx - 1]?.weekIndex || 0)) * 14 - 30}px` }}
            >
              {label.month}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 text-xs text-zinc-500 mr-1">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className="h-3 flex items-center" style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: weekIndex * 0.002 + dayIndex * 0.001 }}
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-white/50 ${
                          day ? getColor(getIntensity(day)) : 'bg-transparent'
                        }`}
                      />
                    </TooltipTrigger>
                    {day && (
                      <TooltipContent className="bg-[#0a0a14] border-[#2d2d5f] text-white">
                        <div className="text-sm">
                          <p className="font-semibold mb-1">{day.displayDate}</p>
                          <p className="text-zinc-400">🎯 {day.habitsCompleted} hábitos</p>
                          <p className="text-zinc-400">✅ {day.tasksCompleted} tarefas</p>
                          <p className="text-zinc-400">⏱️ {Math.floor(day.studyTime / 60)}min estudo</p>
                          <p className="text-[#EAB308]">+{day.xpGained} XP</p>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500">
          <span>Menos</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
          ))}
          <span>Mais</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default HabitHeatmap;

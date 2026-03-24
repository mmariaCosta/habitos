import React from 'react';
import { 
  Target, Flame, Book, Coffee, Dumbbell, Brain, Heart, Star,
  Zap, Trophy, CheckSquare, Circle, Square, Flag, Bookmark,
  Music, Palette, Code, Camera, Headphones, MessageCircle
} from 'lucide-react';

const iconMap = {
  Target, Flame, Book, Coffee, Dumbbell, Brain, Heart, Star,
  Zap, Trophy, CheckSquare, Circle, Square, Flag, Bookmark,
  Music, Palette, Code, Camera, Headphones, MessageCircle
};

const IconPicker = ({ selected, onSelect }) => {
  const icons = Object.keys(iconMap);

  return (
    <div className="grid grid-cols-6 gap-2">
      {icons.map((iconName) => {
        const IconComponent = iconMap[iconName];
        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onSelect(iconName)}
            className={`p-3 pixel-border transition-all ${
              selected === iconName
                ? 'border-game-primary bg-game-primary/20'
                : 'border-zinc-700 bg-zinc-800 hover:border-game-primary/50'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
};

export default IconPicker;

export { iconMap };

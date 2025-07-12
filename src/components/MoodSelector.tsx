import { motion } from 'framer-motion';

const moods = [
  { emoji: '😢', label: 'Very Sad', value: 1 },
  { emoji: '😕', label: 'Sad', value: 2 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😊', label: 'Happy', value: 4 },
  { emoji: '😄', label: 'Very Happy', value: 5 },
];

interface MoodSelectorProps {
  onMoodSelect: (value: number) => void;
  selectedMood?: number;
}

export default function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  return (
    <div className="flex justify-center space-x-4">
      {moods.map((mood, index) => (
        <motion.button
          key={mood.value}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoodSelect(mood.value)}
          className={`p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group ${
            selectedMood === mood.value ? 'bg-coral-500/20 border-coral-400' : ''
          }`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              {mood.emoji}
            </div>
            <p className="text-xs text-slate-300 group-hover:text-white transition-colors">
              {mood.label}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
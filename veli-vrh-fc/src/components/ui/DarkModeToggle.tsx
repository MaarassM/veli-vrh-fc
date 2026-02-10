import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export default function DarkModeToggle({ isDark, toggle }: DarkModeToggleProps) {
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle dark mode"
      className="rounded-full p-2 text-gray-600 hover:text-orange-500 transition-colors"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </motion.button>
  );
}

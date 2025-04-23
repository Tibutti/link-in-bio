import { motion } from "framer-motion";
import { BACKGROUND_OPTIONS } from "@/lib/constants";

interface BackgroundSelectorProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function BackgroundSelector({ selectedIndex, onSelect }: BackgroundSelectorProps) {
  return (
    <motion.section 
      className="mb-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex justify-center space-x-3">
        {BACKGROUND_OPTIONS.map((bg, index) => (
          <motion.button
            key={index}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${bg.color} border focus:outline-none transform hover:scale-110 transition-transform duration-300 ${
              selectedIndex === index ? "border-gray-900 dark:border-white" : "border-gray-200"
            }`}
            onClick={() => onSelect(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Background option ${index + 1}`}
          />
        ))}
      </div>
    </motion.section>
  );
}

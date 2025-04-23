import { motion } from "framer-motion";
import { PROFILE_IMAGES } from "@/lib/constants";

interface ProfileSelectorProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ProfileSelector({ selectedIndex, onSelect }: ProfileSelectorProps) {
  return (
    <motion.section 
      className="mt-8 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <div className="flex justify-center space-x-2">
        {PROFILE_IMAGES.map((image, index) => (
          <motion.button
            key={index}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 focus:outline-none transform hover:scale-110 transition-transform duration-300 ${
              selectedIndex === index ? "border-primary" : "border-transparent"
            }`}
            onClick={() => onSelect(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img 
              src={image.url} 
              alt={`Profile option ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}

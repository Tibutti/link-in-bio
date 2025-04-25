import { type Profile } from "@shared/schema";
import { PROFILE_IMAGES } from "@/lib/constants";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  profile: Profile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  // Obsługa przypadku, gdy imageIndex jest null
  const imageIndex = profile.imageIndex !== null && profile.imageIndex !== undefined 
    ? profile.imageIndex 
    : 0;
  const profileImage = PROFILE_IMAGES[imageIndex];

  return (
    <header className="flex flex-col items-center mb-10 pt-16 sm:pt-6">
      <div className="relative group">
        <motion.div 
          className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full opacity-75 blur group-hover:opacity-100 transition duration-300" 
          animate={{ y: [-3, 0, -3] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <img 
            src={profileImage.url}
            alt={profileImage.alt}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg" 
          />
        </div>
      </div>
      <motion.h1 
        className="text-xl sm:text-2xl font-semibold mt-4 text-dark"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {profile.name}
      </motion.h1>
      {profile.bio && (
        <motion.p 
          className="text-gray-600 text-center mt-2 max-w-md text-sm sm:text-base px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {profile.bio}
        </motion.p>
      )}
      
      {profile.location && (
        <motion.div 
          className="flex items-center mt-3 text-xs sm:text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{profile.location}</span>
          </span>
        </motion.div>
      )}
    </header>
  );
}

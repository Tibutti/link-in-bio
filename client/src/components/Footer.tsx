import { motion } from "framer-motion";

interface FooterProps {
  name: string;
}

export default function Footer({ name }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="text-center text-gray-500 text-sm mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
    >
      <p>© {currentYear} {name}</p>
      <p className="mt-1">Made with <span className="text-red-500">♥</span> using LinkInBio</p>
    </motion.footer>
  );
}

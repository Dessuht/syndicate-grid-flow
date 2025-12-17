import { motion } from 'framer-motion';

export const RainOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="rain-overlay"
      aria-hidden="true"
    />
  );
};

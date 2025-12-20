import { motion } from 'framer-motion';

interface OfficerDossierBackdropProps {
  onClick: () => void;
}

export const OfficerDossierBackdrop = ({ onClick }: OfficerDossierBackdropProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-md"
      onClick={onClick}
    />
  );
};
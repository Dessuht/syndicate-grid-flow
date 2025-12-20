import { Officer } from '@/stores/gameStoreTypes';

interface OfficerDossierHeaderProps {
  officer: Officer;
}

export const OfficerDossierHeader = ({ officer }: OfficerDossierHeaderProps) => {
  return (
    <div className="flex items-center gap-4 mb-6 shrink-0">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/30 to-secondary border-2 border-neon-cyan/50 flex items-center justify-center font-display font-bold text-lg shrink-0">
        {officer.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <h2 className="font-display text-xl font-bold neon-text-cyan">{officer.name}</h2>
        <p className="text-sm text-muted-foreground">{officer.rank}</p>
      </div>
    </div>
  );
};
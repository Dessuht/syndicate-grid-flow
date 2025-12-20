import { Officer } from '@/stores/gameStoreTypes';

interface OfficerTraitsSectionProps {
  officer: Officer;
}

export const OfficerTraitsSection = ({ officer }: OfficerTraitsSectionProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Traits</h3>
      <div className="flex flex-wrap gap-2">
        {officer.traits.map((trait, index) => (
          <span 
            key={index} 
            className="text-[10px] px-2 py-1 rounded bg-secondary/50 border border-border text-foreground"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
};
interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
          : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

interface FilterGroupProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

export function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <FilterChip
            key={option}
            label={option}
            active={selected.includes(option)}
            onClick={() => onToggle(option)}
          />
        ))}
      </div>
    </div>
  );
}

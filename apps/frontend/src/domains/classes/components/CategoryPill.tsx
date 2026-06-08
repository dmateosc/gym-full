import type { ClassCategory } from '../types/class';
import { CLASS_CATEGORY_LABELS } from '../types/class';

const TINTS: Record<ClassCategory, { solid: string; text: string }> = {
  cycling:    { solid: '#2563eb', text: '#60a5fa' },
  yoga:       { solid: '#16a34a', text: '#4ade80' },
  pilates:    { solid: '#9333ea', text: '#c084fc' },
  hiit:       { solid: '#dc2626', text: '#f87171' },
  strength:   { solid: '#ea580c', text: '#fb923c' },
  dance:      { solid: '#db2777', text: '#f472b6' },
  functional: { solid: '#ca8a04', text: '#facc15' },
  crossfit:   { solid: '#0891b2', text: '#22d3ee' },
  other:      { solid: '#64748b', text: '#cbd5e1' },
};

export function CategoryPill({ category }: { category: ClassCategory }) {
  const tint = TINTS[category];
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background: `${tint.solid}22`,
        border: `1px solid ${tint.solid}55`,
        color: tint.text,
      }}
    >
      {CLASS_CATEGORY_LABELS[category]}
    </span>
  );
}

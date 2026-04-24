import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ texto }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        className="text-muted hover:text-primary transition-colors align-middle"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        aria-label="Más información"
      >
        <HelpCircle size={14} />
      </button>

      {visible && (
        <div className="absolute z-50 left-6 top-0 w-64 bg-primary text-white text-xs rounded-sm p-3 shadow-elevated leading-relaxed">
          {texto}
          <div className="absolute left-[-6px] top-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-primary border-b-[6px] border-b-transparent" />
        </div>
      )}
    </span>
  );
}

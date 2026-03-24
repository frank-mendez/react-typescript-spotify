import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollArrowProps {
  dir: 'left' | 'right';
  onClick: () => void;
  fromColor?: string;
}

export function ScrollArrow({ dir, onClick, fromColor = 'from-surface' }: Readonly<ScrollArrowProps>) {
  const isLeft = dir === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  return (
    <div
      className={`absolute ${isLeft ? 'left' : 'right'}-0 top-0 bottom-2 w-16 z-10 flex items-center ${isLeft ? 'justify-start' : 'justify-end'} ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} ${fromColor} to-transparent pointer-events-none`}
    >
      <button
        aria-label={`Scroll ${dir}`}
        onClick={onClick}
        className={`pointer-events-auto ${isLeft ? 'ml-1' : 'mr-1'} w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
      >
        <Icon className="w-5 h-5 text-text-primary" />
      </button>
    </div>
  );
}

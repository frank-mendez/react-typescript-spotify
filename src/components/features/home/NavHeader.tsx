import { useRef, useState } from "react";

export type FilterChip = "All" | "Music" | "Podcasts";

const CHIPS: FilterChip[] = ["All", "Music", "Podcasts"];

export function NavHeader({
  active,
  onChange,
}: Readonly<{
  active: FilterChip;
  onChange: (chip: FilterChip) => void;
}>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (index + 1) % CHIPS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (index - 1 + CHIPS.length) % CHIPS.length;
    }
    if (next !== -1) {
      e.preventDefault();
      onChange(CHIPS[next]);
      refs.current[next]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Content filter"
      className="sticky top-0 z-10 bg-surface px-4 py-2 mt-4 flex items-center gap-2"
    >
      {CHIPS.map((chip, i) => (
        <button
          key={chip}
          ref={(el) => { refs.current[i] = el; }}
          role="radio"
          aria-checked={active === chip}
          tabIndex={active === chip ? 0 : -1}
          onClick={() => onChange(chip)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            active === chip
              ? "bg-white text-black"
              : "bg-surface-hover text-text-primary hover:bg-neutral-600"
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

export function useNavHeader() {
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All");
  return { activeFilter, setActiveFilter };
}

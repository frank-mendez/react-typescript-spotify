import { useState } from "react";

export type FilterChip = "All" | "Music" | "Podcasts";

const CHIPS: FilterChip[] = ["All", "Music", "Podcasts"];

export function NavHeader({
  active,
  onChange,
}: Readonly<{
  active: FilterChip;
  onChange: (chip: FilterChip) => void;
}>) {
  return (
    <div
      role="radiogroup"
      aria-label="Content filter"
      className="sticky top-0 z-10 bg-surface px-4 py-2 flex items-center gap-2"
    >
      {CHIPS.map((chip) => (
        <button
          key={chip}
          role="radio"
          aria-checked={active === chip}
          onClick={() => onChange(chip)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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

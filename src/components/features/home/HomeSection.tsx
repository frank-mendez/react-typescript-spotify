import type { ReactNode } from 'react';

interface HomeSectionProps {
  title?: string;
  children: ReactNode;
}

export function HomeSection({ title, children }: Readonly<HomeSectionProps>) {
  return (
    <section>
      {title && <h2 className="text-text-primary font-bold text-xl mb-3">{title}</h2>}
      {children}
    </section>
  );
}

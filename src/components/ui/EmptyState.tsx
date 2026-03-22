interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: Readonly<EmptyStateProps>) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div className="text-text-muted mb-2">{icon}</div>}
      <p className="text-text-primary font-medium text-sm">{title}</p>
      {description && <p className="text-text-muted text-xs">{description}</p>}
    </div>
  );
}

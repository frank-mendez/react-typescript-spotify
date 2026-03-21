interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Readonly<ErrorStateProps>) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-text-muted text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-accent hover:text-accent-muted underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

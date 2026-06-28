import { Loader2 } from 'lucide-react';

export default function AdminPageState({ isLoading, isError, error, onRetry, children }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="corner-card rounded-2xl p-8 text-center space-y-3">
        <p className="text-sm form-error">{error || 'Failed to load data.'}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="text-sm font-semibold gold-glow underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  return children;
}

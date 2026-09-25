import { brandLogo } from '../../constants/brandAssets';

export default function AdminPageState({ isLoading, isError, error, onRetry, children }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
        <img
          src={brandLogo}
          alt=""
          className="brand-loader"
          width={48}
          height={48}
        />
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

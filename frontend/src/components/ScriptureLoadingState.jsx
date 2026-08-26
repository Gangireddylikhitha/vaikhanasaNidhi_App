import { brandLogo } from '../constants/brandAssets';

export function ScriptureLoadingState({ message = 'Loading scriptures…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-muted">
      <img
        src={brandLogo}
        alt=""
        className="brand-loader mb-3"
        width={56}
        height={56}
      />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ScriptureErrorState({ message = 'Could not load scriptures.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <p className="text-sm text-muted mb-4">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="px-5 py-2.5 rounded-xl text-sm btn-gold">
          Try again
        </button>
      )}
    </div>
  );
}

import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          fontFamily: 'Tiro Telugu, serif',
          background: 'var(--bg-card)',
          color: 'var(--text-body)',
          border: '1px solid #C88F2D33',
          fontSize: '14px',
          lineHeight: '1.5',
        },
      }}
    />
  );
}

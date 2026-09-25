import { Link } from 'react-router-dom';
import { isGuest } from '../store/authStore';
import { useLoginPrompt } from '../context/LoginPromptContext';

function resolvePath(to) {
  if (typeof to === 'string') return to;
  if (to?.pathname) return `${to.pathname}${to.search || ''}${to.hash || ''}`;
  return '/';
}

/** Link that opens login popup for guests (except home `/`). */
export default function GuestNavLink({ to, children, onClick, className, style, ...rest }) {
  const { requireLogin } = useLoginPrompt();
  const path = resolvePath(to);
  const isHome = path === '/';

  if (isGuest() && !isHome) {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={(e) => {
          onClick?.(e);
          requireLogin(path);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <Link to={to} className={className} style={style} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}

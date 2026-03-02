import { Link } from 'react-router-dom';

const SECTION_ITEMS = [
  { id: null, label: 'Home' },
  { id: 'reality', label: 'The Reality' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'mission', label: 'Mission' },
  { id: 'impact', label: 'Impact' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

const navClass = 'hover:text-offwhite transition-colors';
const activeClass = 'text-champagne font-semibold';

export default function Footer({ activeSection, onNavigate }) {
  const goHome = (e) => {
    e.preventDefault();
    onNavigate?.(null);
  };

  return (
    <footer className="border-t border-champagne/20 bg-polished text-offwhite py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <Link
          to="/landing"
          onClick={goHome}
          className="text-lg font-bold text-offwhite hover:text-champagne transition-colors"
        >
          Coop<span className="text-champagne">Digital</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-offwhite/80">
          {SECTION_ITEMS.map(({ id, label }) => (
            <button
              key={id ?? 'home'}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`${navClass} ${activeSection === id ? activeClass : ''}`}
            >
              {label}
            </button>
          ))}
          <Link to="/apply" className={navClass}>
            Apply for SACCO / Union
          </Link>
          <Link to="/login" className={navClass}>
            Sign In
          </Link>
        </nav>
        <p className="text-sm text-offwhite/60">
          © {new Date().getFullYear()} CoopDigital. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

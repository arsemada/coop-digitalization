import { Link } from 'react-router-dom';

const SECTION_ITEMS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'mission', label: 'Mission' },
  { id: 'impact', label: 'Impact' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

export default function Nav({ activeSection, onNavigate }) {
  const linkClass = 'text-sm font-medium text-polished/80 hover:text-forest transition-colors';
  const activeClass = 'text-forest font-semibold';

  const goHome = (e) => {
    e.preventDefault();
    onNavigate?.(null);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-champagne/20 bg-offwhite/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          to="/landing"
          onClick={goHome}
          className="text-xl font-bold tracking-tight text-forest hover:text-emerald transition-colors"
        >
          ቀርሺ<span className="text-emerald">Link</span>
        </Link>
        <nav className="flex items-center gap-6">
          {SECTION_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`${linkClass} ${activeSection === id ? activeClass : ''}`}
            >
              {label}
            </button>
          ))}
          <Link
            to="/login"
            className="rounded-lg border border-forest px-4 py-2 text-sm font-semibold text-forest hover:bg-forest hover:text-offwhite transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/apply"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-offwhite hover:bg-emerald transition-colors shadow-md"
          >
            Apply for SACCO / Union
          </Link>
        </nav>
      </div>
    </header>
  );
}

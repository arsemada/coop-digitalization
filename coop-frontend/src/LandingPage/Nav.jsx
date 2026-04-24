import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SECTION_IDS = ['features', 'how-it-works', 'impact', 'faq', 'contact'];

export default function Nav({ activeSection, onNavigate }) {
  const { lang, toggleLang, t } = useLanguage();
  const baseClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';
  const linkClass = `${baseClass} text-[#111111]/80 hover:text-[#004B33] hover:bg-[#004B33]/5`;
  const activeClass = 'text-[#004B33] font-semibold bg-[#C5A384]/15';

  const goHome = (e) => {
    e.preventDefault();
    onNavigate?.(null);
  };

  const labels = {
    features: t('nav.features'),
    'how-it-works': t('nav.howItWorks'),
    impact: t('nav.impact'),
    faq: t('nav.faq'),
    contact: t('nav.contact'),
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#C5A384]/25 bg-[#F2F0ED]/98 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/landing"
          onClick={goHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-md border-2 border-[#004B33]/20 flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="SaccoLink Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#004B33] hover:text-[#0A7A54] transition-colors">
            ቀርሺ<span className="text-[#0A7A54]">Link</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-end max-w-full overflow-x-auto">
          {SECTION_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`${baseClass} ${activeSection === id ? activeClass : linkClass}`}
            >
              {labels[id]}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleLang}
            className="px-3 py-2 rounded-lg text-xs font-medium text-[#8E6D52] hover:bg-[#C5A384]/20 transition-colors"
            title={lang === 'en' ? 'Switch to Amharic' : 'በእንግሊዝኛ ቀይር'}
          >
            {lang === 'en' ? 'አማ' : 'EN'}
          </button>
          <Link
            to="/login"
            className="rounded-lg border-2 border-[#004B33] px-4 py-2 text-sm font-semibold text-[#004B33] hover:bg-[#004B33] hover:text-[#F2F0ED] transition-all duration-200 ml-2"
          >
            {t('nav.signIn')}
          </Link>
          <Link
            to="/apply"
            className="rounded-lg bg-[#004B33] px-4 py-2 text-sm font-semibold text-[#F2F0ED] hover:bg-[#0A7A54] hover:shadow-lg hover:shadow-[#004B33]/25 transition-all duration-200"
          >
            {t('nav.apply')}
          </Link>
        </nav>
      </div>
    </header>
  );
}

import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SECTION_IDS = [null, 'features', 'how-it-works', 'impact', 'faq', 'contact'];

export default function Footer({ activeSection, onNavigate }) {
  const { t } = useLanguage();

  const goHome = (e) => {
    e.preventDefault();
    onNavigate?.(null);
  };

  const navClass = 'px-3 py-2 rounded-lg text-[#F2F0ED]/80 hover:text-[#F2F0ED] hover:bg-[#C5A384]/15 transition-all duration-200';
  const activeClass = 'text-[#C5A384] font-semibold bg-[#C5A384]/15';

  const labels = {
    null: t('nav.home'),
    features: t('nav.features'),
    'how-it-works': t('nav.howItWorks'),
    impact: t('nav.impact'),
    faq: t('nav.faq'),
    contact: t('nav.contact'),
  };

  return (
    <footer className="relative border-t border-[#C5A384]/25 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#004B33] via-[#003322] to-[#002211]" aria-hidden />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#0A7A54]/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#C5A384]/5 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link
              to="/landing"
              onClick={goHome}
              className="inline-block text-2xl font-bold text-[#F2F0ED] hover:text-[#C5A384] transition-colors mb-6"
            >
              ቀርሺ<span className="text-[#C5A384]">Link</span>
            </Link>
            <p className="text-[#F2F0ED]/80 text-base leading-relaxed max-w-md mb-6">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4">
              <a href="mailto:contact@qershilink.org" className="text-[#C5A384] hover:text-[#F2F0ED] transition-colors text-sm">
                contact@qershilink.org
              </a>
              <a href="mailto:support@qershilink.org" className="text-[#C5A384] hover:text-[#F2F0ED] transition-colors text-sm">
                support@qershilink.org
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-4">
            <h3 className="text-[#D4A84B] font-semibold uppercase tracking-wider text-xs mb-4">
              {t('footer.quickLinks')}
            </h3>
            <nav className="grid grid-cols-2 gap-1">
              {SECTION_IDS.map((id) => (
                <button
                  key={id ?? 'home'}
                  type="button"
                  onClick={() => onNavigate?.(id)}
                  className={`block text-left text-sm py-2 ${navClass} ${activeSection === id ? activeClass : ''}`}
                >
                  {labels[id ?? 'null']}
                </button>
              ))}
            </nav>
          </div>

          {/* CTA */}
          <div className="lg:col-span-3">
            <h3 className="text-[#D4A84B] font-semibold uppercase tracking-wider text-xs mb-4">
              {t('footer.getInvolved')}
            </h3>
            <div className="space-y-3">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C5A384]/50 px-5 py-3 text-sm font-medium text-[#F2F0ED] hover:bg-[#C5A384]/20 hover:border-[#C5A384] transition-all duration-200"
              >
                {t('footer.applyCta')}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#C5A384]/20 px-5 py-3 text-sm font-medium text-[#F2F0ED] hover:bg-[#C5A384]/30 transition-all duration-200"
              >
                {t('footer.signIn')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-[#C5A384]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#F2F0ED]/50">
            © {new Date().getFullYear()} ቀርሺLink. {t('footer.rights')}
          </p>
          <span className="text-sm text-[#F2F0ED]/50">{t('footer.tag')}</span>
        </div>
      </div>
    </footer>
  );
}

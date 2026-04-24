import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#004B33]" aria-hidden>
      <path
        d="M12 3 5 6v6c0 3.9 2.6 7.3 7 9 4.4-1.7 7-5.1 7-9V6l-7-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11.5 11 13.5 15 9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#0A7A54]" aria-hidden>
      <rect x="3" y="5" width="13" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10" y="9" width="9" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="14.5" cy="16" r="0.8" fill="currentColor" />
    </svg>
  );
}

function FieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#C5A384]" aria-hidden>
      <path
        d="M3 17c3-2 6-3 9-3s6 1 9 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5 13c2.5-1.5 5-2.2 7.5-2.2S17.5 11.5 20 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 5v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
    </svg>
  );
}

export default function IntroContent({ onNavigate }) {
  const { t } = useLanguage();

  const boxes = [
    { title: t('intro.secureTitle'), desc: t('intro.secureDesc'), icon: <ShieldIcon /> },
    { title: t('intro.digitalTitle'), desc: t('intro.digitalDesc'), icon: <DevicesIcon /> },
    { title: t('intro.ruralTitle'), desc: t('intro.ruralDesc'), icon: <FieldIcon /> },
  ];

  return (
    <motion.section
      className="py-20 px-6 bg-white border-t border-[#C5A384]/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#004B33] mb-4">{t('intro.title')}</h2>
          <p className="text-[#111111]/80 leading-relaxed text-lg max-w-2xl mx-auto">
            {t('intro.desc')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {boxes.map((box, i) => (
            <motion.div
              key={box.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              className="group rounded-2xl bg-[#F2F0ED]/80 border border-[#C5A384]/20 px-6 py-8 text-center shadow-sm hover:shadow-xl hover:border-[#0A7A54]/30 hover:bg-white transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  {box.icon}
                </div>
              </div>
              <h3 className="font-bold text-[#004B33] text-lg mb-2 group-hover:text-[#0A7A54] transition-colors">{box.title}</h3>
              <p className="text-sm text-[#111111]/75">{box.desc}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[#111111]/60">
          {t('intro.hint')}
        </p>

        {/* CTA Button */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#004B33] text-white font-semibold rounded-xl hover:bg-[#0A7A54] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <span>Get Started Today</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <p className="mt-4 text-sm text-[#111111]/60">
            Have questions? Contact us to learn more about ቀርሺLink
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

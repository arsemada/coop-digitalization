import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MODULES = [
  {
    icon: '💳',
    title: 'Smart Savings Management',
    desc: 'Members can keep regular, emergency, and goal-based savings in one place, with balances updated instantly and tracked securely.',
  },
  {
    icon: '💰',
    title: 'Structured Loan Management',
    desc: 'From application to approval and repayment, the full loan lifecycle is tracked with clear schedules and status at every step.',
  },
  {
    icon: '📊',
    title: 'Automated Double-Entry Accounting',
    desc: 'Every transaction is recorded with built-in double-entry logic, keeping ledgers accurate, balanced, and audit-ready.',
  },
  {
    icon: '📈',
    title: 'Real-Time Financial Reporting',
    desc: 'Generate weekly, monthly, quarterly, and yearly reports in seconds so leaders always see a clear financial picture.',
  },
  {
    icon: '👥',
    title: 'Role-Based Access Control',
    desc: 'Members, staff, admins, union managers, and super admins each see only the data and tools they are authorized to manage.',
  },
  {
    icon: '📱',
    title: 'Inclusive Access (USSD & Voice)',
    desc: 'Members without internet can check balances, repay loans, and receive confirmations through USSD and hotline support.',
  },
  {
    icon: '🔒',
    title: 'Security & Transparency',
    desc: 'Secure data storage, complete transaction history, and clear audit trails protect your cooperative and build trust.',
  },
];

const fadeScale = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

const transition = { type: 'tween', duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] };

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = MODULES.length;

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5500);
    return () => clearInterval(id);
  }, [totalSlides]);

  const goTo = (index) => setCurrentIndex((index + totalSlides) % totalSlides);
  const next = () => goTo(currentIndex + 1);
  const prev = () => goTo(currentIndex - 1);

  const current = MODULES[currentIndex];
  const indexLabel = String(currentIndex + 1).padStart(2, '0');

  return (
    <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-offwhite/80">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gold font-semibold tracking-[0.2em] uppercase text-xs mb-2">
            Intelligent Cooperative Platform
          </p>
          <h2 className="text-4xl font-bold text-forest">What CoopDigital Delivers</h2>
        </motion.div>

        {/* Single-card carousel with fade/scale */}
        <div className="relative min-h-[320px] sm:min-h-[340px] flex flex-col">
          <div className="relative flex-1 rounded-[1.75rem] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={currentIndex}
                variants={fadeScale}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transition}
                className="absolute inset-0 rounded-[1.75rem] overflow-hidden"
              >
                {/* Distinctive card: gradient left edge + soft fill + inner content */}
                <div className="h-full w-full rounded-[1.75rem] bg-white/90 shadow-[0_24px_64px_-16px_rgba(15,61,46,0.12),0_0_0_1px_rgba(15,61,46,0.06)] flex">
                  {/* Left accent bar + icon block */}
                  <div className="w-24 sm:w-28 flex-shrink-0 flex flex-col items-center justify-center py-8 px-4 rounded-l-[1.75rem] bg-gradient-to-b from-[#0F3D2E] to-emerald/90 text-white">
                    <span className="text-4xl sm:text-5xl mb-2 drop-shadow-sm" aria-hidden>
                      {current.icon}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] opacity-90">
                      {indexLabel}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 flex flex-col justify-center py-8 px-6 sm:px-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-forest mb-3 leading-tight">
                      {current.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-polished/75 leading-relaxed max-w-xl">
                      {current.desc}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-forest/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald/80" />
                      CoopDigital · Live
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={prev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest/25 text-forest hover:bg-forest hover:text-white hover:border-forest transition-all duration-200"
              aria-label="Previous feature"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>

            <div className="flex items-center gap-2">
              {MODULES.map((_, i) => {
                const isActive = i === currentIndex;
                return (
                  <button
                    key={MODULES[i].title}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-300 ${
                      isActive ? 'h-2 w-8 bg-forest' : 'h-2 w-2 bg-forest/20 hover:bg-forest/40'
                    }`}
                    aria-label={`Go to feature ${i + 1}`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={next}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest/25 text-forest hover:bg-forest hover:text-white hover:border-forest transition-all duration-200"
              aria-label="Next feature"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

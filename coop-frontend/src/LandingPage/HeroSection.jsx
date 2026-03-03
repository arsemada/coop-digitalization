import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const benefitsContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const benefitItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection({ onNavigate }) {
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background accents — Deep Forest Green, Metallic Emerald, Champagne Gold */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#0A7A54]/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#C5A384]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#004B33]/15 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-20 md:pt-32 md:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 items-center gap-12"
        >
          {/* Left: Copy + CTAs */}
          <div className="md:col-span-6 text-left">
            <motion.h1
              variants={item}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#004B33]"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p variants={item} className="mt-6 text-lg sm:text-xl text-[#111111]/70">
              {t('hero.subtitle')}
            </motion.p>

            <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.99 }}>
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-[0_12px_32px_rgba(0,75,51,0.28)] bg-[#004B33] hover:bg-[#003322] hover:shadow-[0_16px_40px_rgba(0,75,51,0.35)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A384]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {t('hero.getStarted')}
                </Link>
              </motion.div>

              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.99 }}>
                <button
                  type="button"
                  onClick={() => onNavigate?.('features')}
                  className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold text-[#004B33] bg-white ring-1 ring-[#004B33]/20 hover:ring-[#004B33]/35 hover:bg-[#F2F0ED] hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A384]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {t('hero.learnMore')}
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Hero Image */}
          <div className="md:col-span-6">
            <motion.div
              variants={item}
              className="relative mx-auto max-w-xl"
              whileHover={reduceMotion ? undefined : { y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(600px_circle_at_40%_20%,rgba(10,122,84,0.18),transparent_60%),radial-gradient(500px_circle_at_80%_80%,rgba(197,163,132,0.14),transparent_55%)]"
                aria-hidden
              />

              <div 
                className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-[#111111]/10 h-96 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url("/hero.png")' }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Below the fold */}
      <div className="relative z-10 border-t border-[#C5A384]/25 bg-[#F2F0ED]/70">
        <div className="w-full max-w-6xl mx-auto px-6 py-16 space-y-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
            className="max-w-3xl"
          >
            <p className="text-[#C5A384] font-semibold tracking-[0.18em] uppercase text-xs mb-3">
              {t('heroProblem.label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#004B33] mb-4">{t('heroProblem.title')}</h2>
            <p className="text-[#111111]/80 text-base sm:text-lg leading-relaxed">
              {t('heroProblem.p1')}
            </p>
            <p className="mt-3 text-[#111111]/85 font-semibold">
              {t('heroProblem.p2')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={benefitsContainer}
            className="space-y-8"
          >
            <div>
              <p className="text-[#C5A384] font-semibold tracking-[0.18em] uppercase text-xs mb-3">
                {t('heroBenefits.label')}
              </p>
              <h2 className="text-3xl font-bold text-[#004B33]">{t('heroBenefits.title')}</h2>
            </div>

            {/* Core benefits list */}
            <div className="relative grid gap-4 md:grid-cols-2">
              {[
                { title: 'heroBenefits.financialTransparency', desc: 'heroBenefits.financialTransparencyDesc' },
                { title: 'heroBenefits.automatedAccounting', desc: 'heroBenefits.automatedAccountingDesc' },
                { title: 'heroBenefits.realTimeReporting', desc: 'heroBenefits.realTimeReportingDesc' },
                { title: 'heroBenefits.inclusiveAccess', desc: 'heroBenefits.inclusiveAccessDesc' },
              ].map((b) => (
                <motion.div
                  key={b.title}
                  variants={benefitItem}
                  className="flex items-start gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-sm ring-1 ring-[#004B33]/5 hover:shadow-xl hover:ring-[#0A7A54]/30 hover:-translate-y-1 hover:bg-white transition-all duration-300 group"
                >
                  <span className="mt-1 text-lg text-[#0A7A54] group-hover:scale-110 transition-transform">✔</span>
                  <div>
                    <p className="font-semibold text-[#111111]/90">{t(b.title)}</p>
                    <p className="text-sm text-[#111111]/70">{t(b.desc)}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Why it matters – visual cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                variants={benefitItem}
                className="rounded-2xl border border-[#C5A384]/25 bg-white/90 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#004B33]/10 text-[#004B33] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <path
                        d="M4 11h16M6 7h4m4 0h4M6 15h6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#004B33]">Clean cooperative books</p>
                </div>
                <p className="text-xs text-[#111111]/70">
                  Boards and auditors see the same single source of truth, reducing disputes and late
                  adjustments.
                </p>
              </motion.div>

              <motion.div
                variants={benefitItem}
                className="rounded-2xl border border-[#C5A384]/25 bg-white/90 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#0A7A54]/10 text-[#0A7A54] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <circle cx="12" cy="13" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      <path
                        d="M12 13l3-2M9 4h6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#004B33]">Faster decisions</p>
                </div>
                <p className="text-xs text-[#111111]/70">
                  Leaders access real‑time dashboards instead of waiting weeks for manual summaries.
                </p>
              </motion.div>

              <motion.div
                variants={benefitItem}
                className="rounded-2xl border border-[#C5A384]/25 bg-white/90 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#C5A384]/15 text-[#8E6D52] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                      <path
                        d="M12 19s-5-3.2-7.2-5.4C3 12 2.7 9.5 4.1 8a3.6 3.6 0 0 1 5.1 0L12 10l2.8-2a3.6 3.6 0 0 1 5.1 0c1.4 1.5 1.1 4-0.7 5.6C17 15.8 12 19 12 19Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#004B33]">Member trust</p>
                </div>
                <p className="text-xs text-[#111111]/70">
                  Members see accurate balances and loan schedules, strengthening confidence in the SACCO.
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
            className="border-t border-[#C5A384]/30 pt-10"
          >
            <p className="text-[#C5A384] font-semibold tracking-[0.18em] uppercase text-xs mb-3">
              {t('heroAudience.label')}
            </p>
            <h2 className="text-3xl font-bold text-[#004B33] mb-6">{t('heroAudience.title')}</h2>

            {/* Who we serve cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-4">
              <div className="rounded-3xl border border-[#C5A384]/25 bg-white/95 px-5 py-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#004B33] text-[#F2F0ED] flex items-center justify-center text-base font-semibold">
                    SA
                  </div>
                  <p className="text-base font-semibold text-[#004B33] truncate">
                    {t('heroAudience.sacco')}
                  </p>
                </div>
                <p className="text-sm text-[#111111]/75">
                  Primary SACCOs running day‑to‑day savings, loans, and accounting for members.
                </p>
              </div>

              <div className="rounded-3xl border border-[#C5A384]/25 bg-white/95 px-5 py-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#0A7A54] text-[#F2F0ED] flex items-center justify-center text-base font-semibold">
                    CU
                  </div>
                  <p className="text-base font-semibold text-[#004B33] truncate">
                    {t('heroAudience.unions')}
                  </p>
                </div>
                <p className="text-sm text-[#111111]/75">
                  Cooperative unions supervising multiple SACCOs with consolidated oversight and reports.
                </p>
              </div>

              <div className="rounded-3xl border border-[#C5A384]/25 bg-white/95 px-5 py-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#C5A384] text-[#111111] flex items-center justify-center text-base font-semibold">
                    FM
                  </div>
                  <p className="text-base font-semibold text-[#004B33] truncate">
                    {t('heroAudience.members')}
                  </p>
                </div>
                <p className="text-sm text-[#111111]/75">
                  Members and farmers who need clear balances, fair loans, and trust in their cooperative.
                </p>
              </div>
            </div>

            <p className="text-[#111111]/75 text-base sm:text-lg max-w-2xl">
              {t('heroAudience.p')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

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

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Minimal premium background accents */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-forest/15 to-transparent" />
      </div>

      {/* Top hero: minimal, strong, modern */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-20 md:pt-32 md:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 items-center gap-12"
        >
          {/* Left: Minimal copy + CTAs */}
          <div className="md:col-span-6 text-left">
            <motion.h1
              variants={item}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#0F3D2E]"
            >
              The Future of SACCO Management
            </motion.h1>

            <motion.p variants={item} className="mt-6 text-lg sm:text-xl text-polished/70">
              Secure. Automated. Inclusive.
            </motion.p>

            <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.99 }}>
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-[0_12px_32px_rgba(15,61,46,0.28)] bg-[#0F3D2E] hover:bg-[#0B2F24] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Explore Platform
                </Link>
              </motion.div>

              <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.99 }}>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold text-[#0F3D2E] bg-white ring-1 ring-[#0F3D2E]/20 hover:ring-[#0F3D2E]/35 hover:bg-offwhite transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Request Demo
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Strong visual (clean dashboard mockup) */}
          <div className="md:col-span-6">
            <motion.div
              variants={item}
              className="relative mx-auto max-w-xl"
              whileHover={reduceMotion ? undefined : { y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Card glow */}
              <div
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(600px_circle_at_40%_20%,rgba(10,122,84,0.18),transparent_60%),radial-gradient(500px_circle_at_80%_80%,rgba(184,134,11,0.14),transparent_55%)]"
                aria-hidden
              />

              <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-polished/10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-polished/10">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald shadow-[0_0_0_5px_rgba(10,122,84,0.12)]" />
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0F3D2E]">
                      Dashboard
                    </div>
                  </div>
                  <div className="text-xs font-medium text-polished/55">Live</div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-offwhite px-4 py-3 ring-1 ring-polished/10">
                      <div className="text-[11px] uppercase tracking-widest text-polished/55">
                        Members
                      </div>
                      <div className="mt-1 text-xl font-extrabold text-[#0F3D2E]">1,247</div>
                    </div>
                    <div className="rounded-xl bg-offwhite px-4 py-3 ring-1 ring-polished/10">
                      <div className="text-[11px] uppercase tracking-widest text-polished/55">Savings</div>
                      <div className="mt-1 text-xl font-extrabold text-[#0F3D2E]">+12%</div>
                    </div>
                    <div className="rounded-xl bg-offwhite px-4 py-3 ring-1 ring-polished/10">
                      <div className="text-[11px] uppercase tracking-widest text-polished/55">
                        Reports
                      </div>
                      <div className="mt-1 text-xl font-extrabold text-emerald">Live</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-offwhite ring-1 ring-polished/10 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="text-xs font-semibold text-polished/65">Analytics</div>
                      <div className="text-[11px] font-medium text-polished/50">30 days</div>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="relative h-20 rounded-xl bg-white ring-1 ring-polished/10 overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.06)_1px,transparent_1px)] [background-size:28px_28px]"
                          aria-hidden
                        />
                        <svg
                          viewBox="0 0 300 100"
                          className="absolute inset-0 h-full w-full"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M10 74 C 55 66, 70 46, 110 52 C 150 58, 165 30, 205 38 C 245 46, 255 24, 290 28"
                            stroke="rgba(15,61,46,0.85)"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 74 C 55 66, 70 46, 110 52 C 150 58, 165 30, 205 38 C 245 46, 255 24, 290 28"
                            stroke="rgba(184,134,11,0.35)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            opacity="0.35"
                          />
                        </svg>
                        <motion.div
                          className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                          animate={reduceMotion ? undefined : { x: ['0%', '220%'] }}
                          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Below the fold: Problem, Benefits, Audience */}
      <div className="relative z-10 border-t border-champagne/25 bg-offwhite/70">
        <div className="w-full max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* What We Solve */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
            className="max-w-3xl"
          >
            <p className="text-gold font-semibold tracking-[0.18em] uppercase text-xs mb-3">
              2 • Problem
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4">Solving Real Challenges</h2>
            <p className="text-polished/80 text-base sm:text-lg leading-relaxed">
              Many cooperatives still rely on paper records, manual calculations, and delayed reporting. This
              creates errors, reduces transparency, and limits member trust.
            </p>
            <p className="mt-3 text-polished/85 font-semibold">
              CoopDigital transforms these challenges into structured, transparent digital operations.
            </p>
          </motion.div>

          {/* Key Benefits */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={benefitsContainer}
            className="space-y-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-gold font-semibold tracking-[0.18em] uppercase text-xs mb-3">
                  3 • Benefits
                </p>
                <h2 className="text-3xl font-bold text-forest">Why It Matters</h2>
              </div>
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl border border-dashed border-forest/10"
                aria-hidden
              />

              <div className="relative grid gap-4 md:grid-cols-2">
                <motion.div
                  variants={benefitItem}
                  className="flex items-start gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-sm ring-1 ring-forest/5 hover:shadow-md hover:ring-forest/15 transition-all duration-200"
                >
                  <span className="mt-1 text-lg text-emerald">✔</span>
                  <div>
                    <p className="font-semibold text-polished/90">Financial Transparency</p>
                    <p className="text-sm text-polished/70">
                      Every transaction is recorded and traceable.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={benefitItem}
                  className="flex items-start gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-sm ring-1 ring-forest/5 hover:shadow-md hover:ring-forest/15 transition-all duration-200"
                >
                  <span className="mt-1 text-lg text-emerald">✔</span>
                  <div>
                    <p className="font-semibold text-polished/90">Automated Accounting</p>
                    <p className="text-sm text-polished/70">
                      Double-entry accounting built into every operation.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={benefitItem}
                  className="flex items-start gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-sm ring-1 ring-forest/5 hover:shadow-md hover:ring-forest/15 transition-all duration-200"
                >
                  <span className="mt-1 text-lg text-emerald">✔</span>
                  <div>
                    <p className="font-semibold text-polished/90">Real-Time Reporting</p>
                    <p className="text-sm text-polished/70">
                      Instant weekly, monthly, and yearly reports.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={benefitItem}
                  className="flex items-start gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-sm ring-1 ring-forest/5 hover:shadow-md hover:ring-forest/15 transition-all duration-200"
                >
                  <span className="mt-1 text-lg text-emerald">✔</span>
                  <div>
                    <p className="font-semibold text-polished/90">Inclusive Access</p>
                    <p className="text-sm text-polished/70">
                      USSD and voice support for rural members.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Who It's For */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
            className="border-t border-champagne/30 pt-10"
          >
            <p className="text-gold font-semibold tracking-[0.18em] uppercase text-xs mb-3">
              4 • Audience
            </p>
            <h2 className="text-3xl font-bold text-forest mb-6">Built For</h2>

            <div className="flex flex-wrap gap-3 mb-5">
              <span className="inline-flex items-center rounded-full bg-forest/5 text-forest px-4 py-1.5 text-sm font-medium">
                Primary SACCOs
              </span>
              <span className="inline-flex items-center rounded-full bg-forest/5 text-forest px-4 py-1.5 text-sm font-medium">
                Cooperative Unions
              </span>
              <span className="inline-flex items-center rounded-full bg-forest/5 text-forest px-4 py-1.5 text-sm font-medium">
                Agricultural Members
              </span>
            </div>

            <p className="text-polished/75 text-base sm:text-lg max-w-2xl">
              Designed to serve cooperative leaders, employees, and farmers with a secure and easy-to-use
              system.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

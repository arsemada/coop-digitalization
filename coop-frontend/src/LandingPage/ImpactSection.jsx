import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const ICONS = ['📉', '⚡', '🔍', '🤝'];

export default function ImpactSection() {
  const { t, getImpactStats } = useLanguage();
  const stats = getImpactStats();

  return (
    <section id="impact" className="py-24 px-6 bg-[#004B33] text-[#F2F0ED] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#C5A384]/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#0A7A54]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#D4A84B] font-semibold tracking-wider uppercase text-xs mb-2">
            {t('impact.label')}
          </p>
          <h2 className="text-4xl font-bold text-[#C5A384]">{t('impact.title')}</h2>
        </motion.div>
        <motion.p
          className="text-center text-[#F2F0ED]/80 max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t('impact.p')}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
          }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="group rounded-2xl bg-white/5 border border-[#C5A384]/20 p-8 text-center backdrop-blur-sm hover:bg-white/10 hover:border-[#C5A384]/40 hover:-translate-y-2 transition-all duration-300"
            >
              <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{ICONS[i]}</span>
              <div className="text-2xl font-bold text-[#D4A84B] mb-2">{s.value}</div>
              <div className="text-sm text-[#F2F0ED]/85">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 rounded-2xl border border-[#C5A384]/30 bg-[#003322]/50 p-8 md:p-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xl text-[#F2F0ED]/90 italic max-w-2xl mx-auto">
            &ldquo;{t('impact.quote')}&rdquo;
          </p>
          <p className="mt-4 text-[#D4A84B] font-medium">{t('impact.quoteBy')}</p>
        </motion.div>
      </div>
    </section>
  );
}

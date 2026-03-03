import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const ICONS = ['◉', '◇', '▷', '▣'];

export default function Mission() {
  const { t, getMissionPillars } = useLanguage();
  const pillars = getMissionPillars();

  return (
    <section id="mission" className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#C5A384] font-semibold tracking-wider uppercase text-sm mb-2">
            {t('mission.label')}
          </p>
          <h2 className="text-4xl font-bold text-[#004B33]">{t('mission.title')}</h2>
        </motion.div>
        <motion.p
          className="text-center text-lg text-[#111111]/80 max-w-3xl mx-auto leading-relaxed mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('mission.p')}
        </motion.p>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          }}
        >
          {pillars.map((p, i) => (
            <motion.div
              key={p.name}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group rounded-2xl border border-[#C5A384]/20 bg-[#F2F0ED]/50 p-8 text-center shadow-sm hover:shadow-xl hover:border-[#0A7A54]/30 hover:-translate-y-2 transition-all duration-300"
            >
              <span className="text-3xl text-[#C5A384] font-bold block mb-3 group-hover:scale-110 group-hover:text-[#0A7A54] transition-all">{ICONS[i]}</span>
              <h3 className="text-lg font-bold text-[#004B33] group-hover:text-[#0A7A54] transition-colors">{p.name}</h3>
              <p className="mt-2 text-sm text-[#111111]/70">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-20 rounded-2xl bg-gradient-to-br from-[#004B33]/5 to-[#0A7A54]/10 border border-[#C5A384]/20 p-8 md:p-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold text-[#004B33] mb-4 text-center">{t('mission.extraTitle')}</h3>
          <p className="text-[#111111]/80 text-center max-w-2xl mx-auto leading-relaxed">
            {t('mission.extraP')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

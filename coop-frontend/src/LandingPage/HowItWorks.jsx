import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function HowItWorks() {
  const { t, getHowItWorksLayers } = useLanguage();
  const layers = getHowItWorksLayers();

  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#E8E0D5]/30">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#C5A384] font-semibold tracking-wider uppercase text-sm mb-2">
            {t('howItWorks.label')}
          </p>
          <h2 className="text-4xl font-bold text-[#004B33]">{t('howItWorks.title')}</h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 py-8">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.level}
              className="flex flex-col items-center text-center max-w-sm group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div
                className={`
                  w-32 h-32 rounded-full flex items-center justify-center font-bold text-[#F2F0ED] transition-all duration-300
                  ${layer.level === 1 ? 'bg-[#004B33] group-hover:shadow-xl group-hover:shadow-[#004B33]/30' : ''}
                  ${layer.level === 2 ? 'bg-[#004B33]/90 ring-4 ring-[#004B33]/40 group-hover:ring-[#C5A384]/50' : ''}
                  ${layer.level === 3 ? 'bg-[#0A7A54]/90 ring-8 ring-[#004B33]/30 group-hover:ring-[#D4A84B]/40' : ''}
                `}
              >
                <span className="text-sm px-2 text-center">{layer.visual}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#004B33] group-hover:text-[#0A7A54] transition-colors">{layer.title}</h3>
              <p className="mt-2 text-[#111111]/80 text-sm leading-relaxed">{layer.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 rounded-2xl bg-white border border-[#C5A384]/20 shadow-lg p-8 md:p-10 max-w-4xl mx-auto hover:shadow-xl hover:border-[#0A7A54]/30 transition-all duration-300"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-[#004B33] mb-2">{t('howItWorks.financeTitle')}</h3>
          <p className="text-[#111111]/80 mb-6">{t('howItWorks.financeIntro')}</p>
          <ul className="space-y-4 text-[#111111]/90">
            <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F0ED]/80 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004B33] text-[#F2F0ED] text-sm font-bold shrink-0">*</span>
              <div><strong className="text-[#004B33]">USSD</strong> — {t('howItWorks.ussd')}</div>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F0ED]/80 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004B33] text-[#F2F0ED] text-sm font-bold shrink-0">*</span>
              <div><strong className="text-[#004B33]">Voice</strong> — {t('howItWorks.voice')}</div>
            </li>
            <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F0ED]/80 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004B33] text-[#F2F0ED] text-sm font-bold shrink-0">*</span>
              <div><strong className="text-[#004B33]">SMS</strong> — {t('howItWorks.sms')}</div>
            </li>
          </ul>
          <p className="mt-6 font-semibold text-[#0A7A54]">{t('howItWorks.financeEnd')}</p>
          <div className="mt-6 p-4 rounded-xl bg-[#F2F0ED]/80 border border-[#C5A384]/20 font-mono text-sm text-[#111111]/80 hover:border-[#C5A384]/40 transition-colors">
            <div className="text-[#004B33] font-semibold mb-1">{t('howItWorks.ussdMenu')}</div>
            <div>*123*1# Balance</div>
            <div>*123*2# Savings</div>
            <div>*123*3# Loan status</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

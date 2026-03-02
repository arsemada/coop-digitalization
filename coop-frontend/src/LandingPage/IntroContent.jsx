import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function IntroContent() {
  const { t } = useLanguage();

  const boxes = [
    { title: t('intro.secureTitle'), desc: t('intro.secureDesc'), icon: '🔒' },
    { title: t('intro.digitalTitle'), desc: t('intro.digitalDesc'), icon: '📱' },
    { title: t('intro.ruralTitle'), desc: t('intro.ruralDesc'), icon: '🌾' },
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
              <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{box.icon}</span>
              <h3 className="font-bold text-[#004B33] text-lg mb-2 group-hover:text-[#0A7A54] transition-colors">{box.title}</h3>
              <p className="text-sm text-[#111111]/75">{box.desc}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[#111111]/60">
          {t('intro.hint')}
        </p>
      </div>
    </motion.section>
  );
}

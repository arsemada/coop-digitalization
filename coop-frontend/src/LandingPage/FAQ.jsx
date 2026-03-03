import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const { t, getFaqItems } = useLanguage();
  const faqItems = getFaqItems();

  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#C5A384] font-semibold tracking-wider uppercase text-sm mb-2">
            {t('faq.label')}
          </p>
          <h2 className="text-4xl font-bold text-[#004B33]">{t('faq.title')}</h2>
        </motion.div>

        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-[#C5A384]/20 overflow-hidden hover:border-[#0A7A54]/30 hover:shadow-md transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-[#004B33] hover:bg-[#F2F0ED]/50 transition-colors"
              >
                <span>{faq.q}</span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  className="text-[#C5A384] text-xl leading-none"
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-[#111111]/80 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

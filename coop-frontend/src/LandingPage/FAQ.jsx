import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
  {
    q: 'Do farmers need smartphones?',
    a: 'No. The platform supports USSD for basic phones, SMS confirmations, and a voice hotline — so members without smartphones can still access their finances.',
  },
  {
    q: 'How is data secured?',
    a: 'All data is encrypted in transit and at rest. Access is role-based, and every transaction is logged for audit. We follow industry best practices for financial data.',
  },
  {
    q: 'Can this scale to national unions?',
    a: 'Yes. The architecture supports multiple SACCOs under one union, with consolidated reporting and oversight. It is designed to scale as your network grows.',
  },
  {
    q: 'Is the system audit-ready?',
    a: 'Yes. Built-in double-entry accounting, immutable transaction logs, and timeline-based reports give auditors full visibility and compliance support.',
  },
  {
    q: 'How does accounting automation work?',
    a: 'Every savings or loan transaction is automatically posted to the correct ledger accounts. Balances stay in sync, and reports (trial balance, income statement, balance sheet) are generated from the same data.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-gold font-semibold tracking-wider uppercase text-sm mb-2">
            Clarity & Trust
          </p>
          <h2 className="text-4xl font-bold text-forest">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-champagne/20 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-forest hover:bg-offwhite/50 transition-colors"
              >
                <span>{faq.q}</span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  className="text-gold text-xl leading-none"
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
                    <p className="px-5 pb-5 text-polished/80 text-sm leading-relaxed">{faq.a}</p>
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

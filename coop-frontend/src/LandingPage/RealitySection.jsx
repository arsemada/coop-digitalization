import { motion } from 'framer-motion';

export default function RealitySection() {
  return (
    <section
      id="reality"
      className="relative py-24 px-6 bg-forest-deep text-offwhite overflow-hidden"
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 bg-paper opacity-30 mix-blend-overlay pointer-events-none"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/95 to-forest/90" />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-champagne mb-6">
          The Silent Struggle of Rural Financial Systems
        </h2>
        <p className="text-lg text-offwhite/90 leading-relaxed">
          Across rural communities, SACCOs operate with handwritten ledgers, manual calculations,
          and delayed reporting. Transparency is limited. Errors are common. Trust is fragile.
        </p>
        <p className="mt-6 text-xl font-semibold text-gold-soft">
          Farmers — the backbone of the economy — are excluded from digital access.
        </p>
      </motion.div>
    </section>
  );
}

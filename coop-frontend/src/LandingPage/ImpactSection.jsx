import { motion } from 'framer-motion';

const STATS = [
  { label: 'Reduced bookkeeping errors', value: 'Fewer mistakes' },
  { label: 'Increased reporting speed', value: 'Real-time' },
  { label: 'Improved loan transparency', value: 'Traceable' },
  { label: 'Enhanced trust', value: 'Members & leaders' },
];

export default function ImpactSection() {
  return (
    <section id="impact" className="py-24 px-6 bg-forest text-offwhite">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="text-4xl font-bold text-center mb-16 text-champagne"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Transforming Cooperative Ecosystems
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.1 },
            },
          }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              className="rounded-xl bg-white/5 border border-white/10 p-8 text-center backdrop-blur-sm"
            >
              <div className="text-2xl font-bold text-gold-soft mb-2">{s.value}</div>
              <div className="text-sm text-offwhite/80">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

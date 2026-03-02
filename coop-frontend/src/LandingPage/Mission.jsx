import { motion } from 'framer-motion';

const PILLARS = [
  { name: 'Transparency', icon: '◉', desc: 'Clear, auditable financial flows' },
  { name: 'Inclusion', icon: '◇', desc: 'Access for every member' },
  { name: 'Automation', icon: '▷', desc: 'Less manual work, fewer errors' },
  { name: 'Governance', icon: '▣', desc: 'Strong oversight and compliance' },
];

export default function Mission() {
  return (
    <section id="mission" className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-gold font-semibold tracking-wider uppercase text-sm mb-2">
            Digital Justice for Rural Finance
          </p>
          <h2 className="text-4xl font-bold text-forest">
            Building the Digital Backbone of Cooperative Economies
          </h2>
        </motion.div>
        <motion.p
          className="text-center text-lg text-polished/80 max-w-3xl mx-auto leading-relaxed mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Our mission is to create transparent, secure, and inclusive financial systems that
          empower rural communities — ensuring that no farmer is left behind in the digital
          transformation.
        </motion.p>

        {/* Four pillars grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.2 },
            },
          }}
        >
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="rounded-xl border border-champagne/20 bg-offwhite/50 p-8 text-center shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-300"
            >
              <span className="text-3xl text-gold font-bold block mb-3">{p.icon}</span>
              <h3 className="text-lg font-bold text-forest">{p.name}</h3>
              <p className="mt-2 text-sm text-polished/70">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

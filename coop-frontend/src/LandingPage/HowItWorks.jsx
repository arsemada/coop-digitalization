import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LAYERS = [
  {
    level: 1,
    label: 'SACCO Core',
    title: 'Layer 1 — SACCO Core',
    desc: 'Manage members, savings, loans, and accounting within one secure digital system — replacing fragmented processes with unified financial intelligence.',
    visual: 'Primary SACCO',
  },
  {
    level: 2,
    label: 'Union Oversight',
    title: 'Layer 2 — Union Oversight',
    desc: 'Cooperative unions gain consolidated visibility across multiple SACCOs — ensuring compliance, performance monitoring, and strategic oversight.',
    visual: 'Union',
  },
  {
    level: 3,
    label: 'Member Access',
    title: 'Layer 3 — Member Access',
    desc: 'Members gain transparent access to their financial records — empowering them with clarity and trust.',
    visual: 'Members',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-earth/30">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-gold font-semibold tracking-wider uppercase text-sm mb-2">
            Three Layers. One Ecosystem.
          </p>
          <h2 className="text-4xl font-bold text-forest">How It Works</h2>
        </motion.div>

        {/* Concentric circles: Layer 3 (outer), 2 (middle), 1 (inner) */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 py-8">
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.level}
              className="flex flex-col items-center text-center max-w-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div
                className={`
                  w-32 h-32 rounded-full flex items-center justify-center font-bold text-offwhite
                  ${layer.level === 1 ? 'bg-forest' : ''}
                  ${layer.level === 2 ? 'bg-forest/90 ring-4 ring-forest/40' : ''}
                  ${layer.level === 3 ? 'bg-emerald/90 ring-8 ring-forest/30' : ''}
                `}
              >
                <span className="text-sm px-2 text-center">{layer.visual}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-forest">{layer.title}</h3>
              <p className="mt-2 text-polished/80 text-sm leading-relaxed">{layer.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Finance Without Internet */}
        <motion.div
          className="mt-20 rounded-2xl bg-white border border-champagne/20 shadow-lg p-8 md:p-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-forest mb-2">Finance Without Internet</h3>
          <p className="text-polished/80 mb-6">
            The platform extends beyond smartphones:
          </p>
          <ul className="space-y-3 text-polished/90">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-offwhite text-sm font-bold">
                *
              </span>
              USSD integration for basic phones
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-offwhite text-sm font-bold">
                *
              </span>
              Voice hotline for low-literacy users
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-offwhite text-sm font-bold">
                *
              </span>
              SMS transaction confirmations
            </li>
          </ul>
          <p className="mt-6 font-semibold text-emerald">
            Financial inclusion without digital barriers.
          </p>
          {/* Phone mockup hint */}
          <div className="mt-6 p-4 rounded-xl bg-offwhite/80 border border-champagne/20 font-mono text-sm text-polished/80">
            <div className="text-forest font-semibold mb-1">USSD menu example</div>
            <div>*123*1# Balance</div>
            <div>*123*2# Savings</div>
            <div>*123*3# Loan status</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

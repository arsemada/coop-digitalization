import { motion } from 'framer-motion';

export default function IntroContent() {
  return (
    <motion.section
      className="py-16 px-6 bg-earth border-t border-champagne/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold text-forest mb-4">Welcome to CoopDigital</h2>
        <p className="text-polished/80 leading-relaxed">
          We bring transparent, digital finance to rural cooperatives and SACCOs. Explore the links
          above to learn about the reality we address, our features, how it works, our mission,
          impact, FAQ, and how to get in touch.
        </p>
        <p className="mt-4 text-sm text-polished/60">
          Click any menu link to dive into that section.
        </p>
      </div>
    </motion.section>
  );
}

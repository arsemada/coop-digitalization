import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative py-24 px-6 overflow-hidden bg-offwhite"
    >
      {/* Green gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-forest/10 via-transparent to-emerald/10 pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-gold font-semibold tracking-wider uppercase text-sm mb-2">
            Partner in Transformation
          </p>
          <h2 className="text-4xl font-bold text-forest">Let&apos;s Digitize Your Cooperative</h2>
          <p className="mt-4 text-lg text-polished/80 max-w-2xl mx-auto">
            Whether you are a SACCO leader, union manager, or development partner — join us in
            transforming rural finance.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl bg-white border border-champagne/20 shadow-xl p-8 md:p-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {submitted ? (
            <div className="text-center py-8 text-forest font-semibold">
              Thank you. We&apos;ll be in touch shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-forest mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full rounded-lg border border-champagne/30 px-4 py-3 text-polished focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-forest mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full rounded-lg border border-champagne/30 px-4 py-3 text-polished focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-forest mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  className="w-full rounded-lg border border-champagne/30 px-4 py-3 text-polished focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition resize-none"
                  placeholder="Tell us about your cooperative or partnership interest..."
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="rounded-xl bg-forest px-8 py-4 font-semibold text-offwhite hover:bg-forest-deep transition-colors"
                >
                  Send Message
                </button>
                <a
                  href="#contact"
                  className="rounded-xl border-2 border-gold px-8 py-4 font-semibold text-forest bg-gold/10 hover:bg-gold/20 transition-colors inline-block"
                >
                  Request a Demo
                </a>
                <a
                  href="mailto:partnerships@coopdigital.org"
                  className="rounded-xl border border-champagne/40 px-8 py-4 font-semibold text-polished hover:bg-champagne/10 transition-colors inline-block"
                >
                  Partnership Inquiry
                </a>
              </div>
            </form>
          )}
        </motion.div>

        <div className="mt-8 flex flex-wrap justify-center gap-8 text-polished/80 text-sm">
          <a href="mailto:contact@coopdigital.org" className="hover:text-forest transition-colors">
            contact@coopdigital.org
          </a>
          <a href="mailto:support@coopdigital.org" className="hover:text-forest transition-colors">
            support@coopdigital.org
          </a>
        </div>
      </div>
    </section>
  );
}

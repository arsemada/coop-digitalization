import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.target;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };
    try {
      await api.post('/contact', payload);
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#F2F0ED] via-white to-[#F2F0ED]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_80%,rgba(0,75,51,0.06),transparent_50%),radial-gradient(500px_circle_at_80%_20%,rgba(10,122,84,0.05),transparent_50%)] pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#C5A384] font-semibold tracking-[0.2em] uppercase text-xs mb-2">
            {t('contact.label')}
          </p>
          <h2 className="text-4xl font-bold text-[#004B33]">{t('contact.title')}</h2>
          <p className="mt-4 text-lg text-[#111111]/70 max-w-xl mx-auto">
            {t('contact.desc')}
          </p>
        </motion.div>

        <motion.div
          className="rounded-3xl bg-white/90 backdrop-blur-sm border border-[#C5A384]/25 shadow-[0_24px_64px_-12px_rgba(0,75,51,0.08)] p-8 md:p-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0A7A54]/15 flex items-center justify-center">
                <span className="text-3xl text-[#0A7A54]">✓</span>
              </div>
              <p className="text-xl font-semibold text-[#004B33]">{t('contact.thankYou')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#004B33] mb-2">
                    {t('contact.name')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-[#C5A384]/30 px-4 py-3 text-[#111111] focus:border-[#004B33] focus:ring-2 focus:ring-[#004B33]/15 outline-none transition"
                    placeholder={t('contact.name')}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#004B33] mb-2">
                    {t('contact.email')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-[#C5A384]/30 px-4 py-3 text-[#111111] focus:border-[#004B33] focus:ring-2 focus:ring-[#004B33]/15 outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#004B33] mb-2">
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-xl border border-[#C5A384]/30 px-4 py-3 text-[#111111] focus:border-[#004B33] focus:ring-2 focus:ring-[#004B33]/15 outline-none transition resize-none"
                  placeholder={t('contact.message')}
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto rounded-xl bg-[#004B33] px-10 py-4 font-semibold text-[#F2F0ED] hover:bg-[#003322] hover:shadow-lg hover:shadow-[#004B33]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? '…' : t('contact.sendMessage')}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

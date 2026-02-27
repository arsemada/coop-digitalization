import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-offwhite text-polished">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-champagne/20 bg-offwhite/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/landing" className="text-xl font-bold tracking-tight text-forest">
            Coop<span className="text-emerald">Digital</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-polished/80 hover:text-forest transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-polished/80 hover:text-forest transition-colors">How It Works</a>
            <a href="#mission" className="text-sm font-medium text-polished/80 hover:text-forest transition-colors">Mission</a>
            <a href="#faq" className="text-sm font-medium text-polished/80 hover:text-forest transition-colors">FAQ</a>
            <a href="#contact" className="text-sm font-medium text-polished/80 hover:text-forest transition-colors">Contact</a>
            <Link
              to="/login"
              className="rounded-lg border border-forest px-4 py-2 text-sm font-semibold text-forest hover:bg-forest hover:text-offwhite transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/apply"
              className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-offwhite hover:bg-emerald transition-colors shadow-md"
            >
              Apply for SACCO / Union
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: "url('/image.png')", backgroundSize: '70% auto' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-offwhite/70 via-offwhite/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-forest md:text-6xl lg:text-7xl">
            Empowering Cooperatives Through <span className="text-emerald">Digital Innovation</span>
          </h1>
          <p className="mt-8 max-w-2xl mx-auto text-lg font-semibold text-polished leading-relaxed">
            Streamline savings, loans, and member management for SACCOs and Unions.
            Built for the cooperative movement, trusted by communities.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/apply"
              className="inline-flex items-center rounded-xl bg-forest px-8 py-4 text-base font-semibold text-offwhite shadow-lg hover:bg-emerald hover:shadow-xl transition-all"
            >
              Apply for SACCO / Union
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl border border-champagne/40 px-8 py-4 text-base font-semibold text-polished hover:bg-champagne/10 transition-all"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-20 flex flex-wrap justify-center gap-12 text-sm">
            <span className="flex items-center gap-2 text-polished/70">
              <span className="h-2 w-2 rounded-full bg-emerald" /> Secure
            </span>
            <span className="flex items-center gap-2 text-polished/70">
              <span className="h-2 w-2 rounded-full bg-emerald" /> Member-Focused
            </span>
            <span className="flex items-center gap-2 text-polished/70">
              <span className="h-2 w-2 rounded-full bg-emerald" /> Transparent
            </span>
            <span className="flex items-center gap-2 text-polished/70">
              <span className="h-2 w-2 rounded-full bg-emerald" /> Easy to Use
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-forest text-offwhite">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-champagne">100%</div>
              <div className="mt-1 text-sm text-offwhite/80">Digital</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-champagne">Secure</div>
              <div className="mt-1 text-sm text-offwhite/80">Encrypted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-champagne">24/7</div>
              <div className="mt-1 text-sm text-offwhite/80">Access</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-champagne">Free</div>
              <div className="mt-1 text-sm text-offwhite/80">To Start</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-forest text-center mb-4">Features</h2>
          <p className="text-center text-polished/80 max-w-2xl mx-auto mb-16">
            Everything you need to run a modern cooperative.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: 'Member Management', desc: 'Track members, profiles, and membership lifecycle.', icon: '👥' },
              { title: 'Savings & Accounts', desc: 'Multiple savings products, accounts, and transactions.', icon: '💰' },
              { title: 'Loan Processing', desc: 'Apply, approve, disburse, and track repayments.', icon: '📋' },
              { title: 'Accounting', desc: 'Double-entry bookkeeping and chart of accounts.', icon: '📊' },
              { title: 'Reports', desc: 'Trial balance, income statement, balance sheet, portfolio summaries.', icon: '📈' },
              { title: 'Institution Oversight', desc: 'Unions oversee SACCOs; Super Admin approves all.', icon: '🏛️' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-champagne/20 bg-offwhite/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-forest">{f.title}</h3>
                <p className="mt-2 text-polished/80">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-forest/5">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-forest text-center mb-4">How It Works</h2>
          <p className="text-center text-polished/80 max-w-2xl mx-auto mb-16">
            Register your institution, get approved, and start serving members.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest text-offwhite font-bold text-xl mb-4">1</div>
              <h3 className="text-lg font-bold text-forest">Apply</h3>
              <p className="mt-2 text-polished/80 text-sm">SACCOs and Unions apply for registration with name, type, region, and address.</p>
              <Link to="/apply" className="mt-4 inline-block text-sm font-semibold text-forest hover:text-emerald">Apply now →</Link>
            </div>
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest text-offwhite font-bold text-xl mb-4">2</div>
              <h3 className="text-lg font-bold text-forest">Get Approved</h3>
              <p className="mt-2 text-polished/80 text-sm">A Super Admin reviews and approves your institution. You&apos;ll be notified.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest text-offwhite font-bold text-xl mb-4">3</div>
              <h3 className="text-lg font-bold text-forest">Go Live</h3>
              <p className="mt-2 text-polished/80 text-sm">Log in with OTP, change password, add members, and start managing savings and loans.</p>
              <Link to="/apply" className="mt-4 inline-block text-sm font-semibold text-forest hover:text-emerald">Apply for institution →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-forest mb-6">Our Mission</h2>
          <p className="text-lg text-polished/80 leading-relaxed max-w-3xl">
            To provide cooperatives and SACCOs with modern, secure, and easy-to-use digital tools
            that enhance operational efficiency, member engagement, and financial inclusion.
            We believe every cooperative deserves technology that empowers its members and strengthens
            community bonds.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="py-24 px-6 bg-forest/5">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-forest mb-6">Our Vision</h2>
          <p className="text-lg text-polished/80 leading-relaxed max-w-3xl mb-12">
            A future where every cooperative—from rural savings groups to national unions—has
            access to world-class digital infrastructure. We envision a connected cooperative
            ecosystem that drives sustainable development and shared prosperity.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'For Members', desc: 'Track savings, apply for loans, manage membership.' },
              { title: 'For SACCOs', desc: 'Member management, loan processing, reporting.' },
              { title: 'For Unions', desc: 'Oversee institutions, monitor performance, standards.' },
            ].map((b, i) => (
              <div key={i} className="rounded-xl bg-white p-8 shadow-md border border-champagne/20">
                <div className="text-champagne font-bold text-lg mb-2">{b.title}</div>
                <p className="text-polished/80 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-forest text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {[
              { q: 'Who can apply for institution registration?', a: 'SACCOs and Unions can apply. Fill out the form at /apply with institution name, type, address, and admin username/email/phone. A Super Admin will review and approve.' },
              { q: 'What info do I need to apply?', a: 'Institution name (required), type (SACCO or Union), region, woreda, kebele, house number, and the admin account username, email, and phone. No registration number needed.' },
              { q: 'How do I get a member account?', a: 'Members are registered by your SACCO or Union. Contact your institution admin to register you.' },
              { q: 'How do institution admins get accounts?', a: 'When your institution application is approved, the Super Admin creates your admin account and gives you an OTP. Log in with username + OTP, then change your password.' },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-champagne/20 p-6">
                <h3 className="font-bold text-forest">{faq.q}</h3>
                <p className="mt-2 text-polished/80 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-forest text-offwhite">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-offwhite/80 mb-10">Apply for your institution today. Members are registered by SACCOs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/apply"
              className="rounded-xl bg-champagne px-8 py-4 font-semibold text-polished hover:bg-champagne/90 transition-colors"
            >
              Apply for SACCO / Union
            </Link>
            <Link
              to="/login"
              className="rounded-xl border-2 border-offwhite px-8 py-4 font-semibold text-offwhite hover:bg-offwhite hover:text-forest transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-forest mb-4">Contact Us</h2>
          <p className="text-polished/80 max-w-2xl mb-8">
            Questions about CoopDigital? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap gap-8 text-polished/80">
            <div>
              <span className="block text-sm font-medium text-forest mb-1">Email</span>
              <a href="mailto:contact@coopdigital.org" className="hover:text-forest transition-colors">contact@coopdigital.org</a>
            </div>
            <div>
              <span className="block text-sm font-medium text-forest mb-1">Support</span>
              <a href="mailto:support@coopdigital.org" className="hover:text-forest transition-colors">support@coopdigital.org</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-champagne/20 bg-polished text-offwhite py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/landing" className="text-lg font-bold text-offwhite">
            Coop<span className="text-champagne">Digital</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-offwhite/80">
            <Link to="/landing" className="hover:text-offwhite transition-colors">Home</Link>
            <a href="#features" className="hover:text-offwhite transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-offwhite transition-colors">How It Works</a>
            <a href="#mission" className="hover:text-offwhite transition-colors">Mission</a>
            <a href="#faq" className="hover:text-offwhite transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-offwhite transition-colors">Contact</a>
            <Link to="/apply" className="hover:text-offwhite transition-colors">Apply for SACCO / Union</Link>
            <Link to="/login" className="hover:text-offwhite transition-colors">Sign In</Link>
          </nav>
          <p className="text-sm text-offwhite/60">© {new Date().getFullYear()} CoopDigital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

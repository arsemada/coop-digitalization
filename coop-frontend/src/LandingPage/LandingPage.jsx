import { useState } from 'react';
import Nav from './Nav';
import Footer from './Footer';
import HeroSection from './HeroSection';
import IntroContent from './IntroContent';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Mission from './Mission';
import ImpactSection from './ImpactSection';
import FAQ from './FAQ';
import Contact from './Contact';

const SECTIONS = {
  features: Features,
  'how-it-works': HowItWorks,
  impact: ImpactSection,
  faq: FAQ,
  contact: Contact,
};

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState(null);

  const showHome = activeSection === null;
  const SectionComponent = activeSection ? SECTIONS[activeSection] : null;

  return (
    <div className="min-h-screen bg-offwhite text-polished">
      <Nav
        activeSection={activeSection}
        onNavigate={(section) => setActiveSection(section)}
      />

      {showHome ? (
        <>
          <HeroSection />
          <Mission />
          <IntroContent />
        </>
      ) : SectionComponent ? (
        <main className="pt-24 pb-12 min-h-screen">
          <SectionComponent />
        </main>
      ) : null}

      <Footer
        activeSection={activeSection}
        onNavigate={(section) => setActiveSection(section)}
      />
    </div>
  );
}

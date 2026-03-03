import { useState } from 'react';
import { LanguageProvider } from '../context/LanguageContext';
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
    <LanguageProvider>
      <div className="min-h-screen bg-[#F2F0ED] text-[#111111]">
        <Nav
          activeSection={activeSection}
          onNavigate={(section) => setActiveSection(section)}
        />


        {showHome ? (
          <>
            <HeroSection onNavigate={(section) => setActiveSection(section)} />
            <IntroContent />
            <Mission />
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
    </LanguageProvider>
  );
}

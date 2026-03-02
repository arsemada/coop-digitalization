import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    nav: {
      home: 'Home',
      features: 'Features',
      howItWorks: 'How It Works',
      mission: 'Mission',
      impact: 'Impact',
      faq: 'FAQ',
      contact: 'Contact',
      signIn: 'Sign In',
      apply: 'Apply for SACCO / Union',
    },
    hero: {
      title: 'The Future of SACCO Management',
      subtitle: 'Secure • Automated • Inclusive',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
    },
    heroProblem: {
      label: '2 • Problem',
      title: 'Solving Real Challenges',
      p1: 'Many cooperatives still rely on paper records, manual calculations, and delayed reporting. This creates errors, reduces transparency, and limits member trust.',
      p2: 'ቀርሺLink transforms these challenges into structured, transparent digital operations.',
    },
    heroBenefits: {
      label: '3 • Benefits',
      title: 'Why It Matters',
      financialTransparency: 'Financial Transparency',
      financialTransparencyDesc: 'Every transaction is recorded and traceable.',
      automatedAccounting: 'Automated Accounting',
      automatedAccountingDesc: 'Double-entry built into every operation.',
      realTimeReporting: 'Real-Time Reporting',
      realTimeReportingDesc: 'Instant weekly, monthly, and yearly reports.',
      inclusiveAccess: 'Inclusive Access',
      inclusiveAccessDesc: 'USSD and voice support for rural members.',
    },
    heroAudience: {
      label: '4 • Audience',
      title: 'Built For',
      sacco: 'Primary SACCOs',
      unions: 'Cooperative Unions',
      members: 'Agricultural Members',
      p: 'Designed to serve cooperative leaders, employees, and farmers with a secure and easy-to-use system.',
    },
    intro: {
      title: 'Welcome to ቀርሺLink',
      desc: 'We bring transparent, digital finance to rural cooperatives and SACCOs. Use the links above to explore features, how it works, mission, impact, and more.',
      secureTitle: 'Secure',
      secureDesc: 'Industry-standard protection and encryption.',
      digitalTitle: 'Digital Access',
      digitalDesc: 'Access from mobile, web, and USSD.',
      ruralTitle: 'Rural-Ready',
      ruralDesc: 'Works even without internet connectivity.',
      hint: 'Click any menu link to jump to that section.',
    },
    features: {
      label: 'Intelligent Cooperative Platform',
      title: 'What ቀርሺLink Delivers',
      live: 'ቀርሺLink · Live',
    },
    howItWorks: {
      label: 'Three Layers. One Ecosystem.',
      title: 'How It Works',
      financeTitle: 'Finance Without Internet',
      financeIntro: 'The platform extends beyond smartphones:',
      ussd: 'USSD integration for basic phones',
      voice: 'Voice hotline for low-literacy users',
      sms: 'SMS transaction confirmations',
      financeEnd: 'Financial inclusion without digital barriers.',
      ussdMenu: 'USSD menu example',
    },
    mission: {
      label: 'Digital Justice for Rural Finance',
      title: 'Building the Digital Backbone of Cooperative Economies',
      p: 'Our mission is to create transparent, secure, and inclusive financial systems that empower rural communities — ensuring no farmer is left behind in the digital transformation.',
      extraTitle: 'What ቀርሺLink Enables',
      extraP: 'We enable cooperative finance management solutions to strengthen rural communities, increase financial transparency, and help cooperatives thrive in the digital age.',
    },
    impact: {
      label: 'Measurable Impact',
      title: 'Transforming Cooperative Ecosystems',
      p: 'ቀርሺLink creates real change in rural cooperatives and SACCOs.',
      quote: 'ቀርሺLink has helped us see and manage our finances that we could never access before.',
      quoteBy: '— Cooperative Member',
    },
    faq: {
      label: 'Clarity & Trust',
      title: 'Frequently Asked Questions',
    },
    contact: {
      label: 'Partner in Transformation',
      title: "Let's Digitize Your Cooperative",
      desc: 'Whether you are a SACCO leader, union manager, or development partner — join us in transforming rural finance.',
      thankYou: 'Thank you. We\'ll be in touch shortly.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      sendMessage: 'Send Message',
      requestDemo: 'Request a Demo',
      partnershipInquiry: 'Partnership Inquiry',
    },
    footer: {
      tagline: 'Bringing cooperative finance management into the digital age for our communities.',
      quickLinks: 'Quick Links',
      getInvolved: 'Get Involved',
      applyCta: 'Apply for SACCO / Union',
      signIn: 'Sign In',
      rights: 'All rights reserved.',
      tag: 'Cooperative Finance Solution',
    },
  },
  am: {
    nav: {
      home: 'መነሻ',
      features: 'ባህሪያት',
      howItWorks: 'እንዴት ይሰራል',
      mission: 'ተልእኮ',
      impact: 'ውጤት',
      faq: 'ጥያቄዎች',
      contact: 'ግንኙነት',
      signIn: 'ግባ',
      apply: 'ለ SACCO / ህብረት ማመልከቻ',
    },
    hero: {
      title: 'የ SACCO አስተዳደር የወደፊት ዕቅድ',
      subtitle: 'ደህንነቱ የተጠበቀ • በራስ-ሰር • ለሁሉም ተደራሽ',
      getStarted: 'ጀምር',
      learnMore: 'ተጨማሪ ይወቁ',
    },
    heroProblem: {
      label: '2 • ችግር',
      title: 'እውነተኛ ችግሮችን መፍታት',
      p1: 'ብዙ የተባበሩት ህብረተሰቦች አሁንም በወረቀት ምዝበራ፣ በእጅ ስሌትና በተዘገየ ሪፖርት ይመሰራሉ። ይህ ቅየሳዎችን ያመጣል፣ ግልጽነትን ይቀንሳል እና የአባላት ታምናምነትን ይገድባል።',
      p2: 'ቀርሺLink እነዚህን ችግሮች ወደ የተዋቀሩ፣ ግልጽ የሆኑ ዲጂታል ክንውናዎች ያሸጋግራል።',
    },
    heroBenefits: {
      label: '3 • ጥቅሞች',
      title: 'ለምን ያስፈልጋል',
      financialTransparency: 'የገንዘብ ግልጽነት',
      financialTransparencyDesc: 'እያንዳንዱ ግብይት ይመዘገባል እና ይከታተላል።',
      automatedAccounting: 'በራስ-ሰር የሚሰራ እያስቀመጠ',
      automatedAccountingDesc: 'ድርብ-መግቢያ በእያንዳንዱ ክንውን ውስጥ።',
      realTimeReporting: 'ቀጣይነት ያለው ሪፖርት',
      realTimeReportingDesc: 'በሳምንት፣ ወርና ዓመት ፈጣን ሪፖርቶች።',
      inclusiveAccess: 'ለሁሉም ተደራሽ',
      inclusiveAccessDesc: 'USSD እና ድምጽ ለገጠር አባላት።',
    },
    heroAudience: {
      label: '4 • መድረሻ',
      title: 'ለየትኞች የተሰራ',
      sacco: 'ታዋቂ SACCOዎች',
      unions: 'የተባበሩት ህብረቶች',
      members: 'የህይወት አባላት',
      p: 'ለየተባበሩት መሪዎች፣ ሠራተኞች እና ገበሬዎች ደህንነቱ የተጠበቀ እና ቀላል የሆነ ስርዓት።',
    },
    intro: {
      title: 'ቀርሺLink ውስጥ እንኳን ደህና መጡ',
      desc: 'ግልጽነት ያለውን ዲጂታል ገንዘብ ለገጠር ተባባሪዎች እና ለ SACCOዎች እናቀርባለን። ባህሪያት፣ እንዴት ይሰራል፣ ተልእኮና ውጤትን ለማወቅ ከላይ ያሉትን አውድ ይጠቀሙ።',
      secureTitle: 'ደህንነቱ የተጠበቀ',
      secureDesc: 'በኢንዱስትሪ መመዘኛዎች መሠረት ጥበቃ።',
      digitalTitle: 'ዲጂታል ተደራሽነት',
      digitalDesc: 'ከሞባይል፣ ድሩ እና USSD ይድረሱ።',
      ruralTitle: 'ለገጠር ቦታዎች',
      ruralDesc: 'ኢንተርኔት የሌለው ቦታ እንኳን ይሰራል።',
      hint: 'ማንኛውንም የምናስ አውድ ጠቅ በማድረግ በዚያ ክፍል ውስጥ ይግቡ።',
    },
    features: {
      label: 'ብልጥ የተባበሩት መድረክ',
      title: 'ቀርሺLink የሚያቀርበው',
      live: 'ቀርሺLink · ቀጣይ',
    },
    howItWorks: {
      label: 'ሦስት ቅጾች። አንድ ኢኮሲስተም።',
      title: 'እንዴት ይሰራል',
      financeTitle: 'ኢንተርኔት ያለ ገንዘብ',
      financeIntro: 'መድረኩ ከስማርትፎኖች ባሻገር ያሰራል፦',
      ussd: 'USSD ለቀላል ስልኮች',
      voice: 'ድምጽ ሆትላይን ለትንሽ የማንበብ ችሎታ ያላቸው',
      sms: 'SMS የግብይት ማረጋገጫዎች',
      financeEnd: 'የገንዘብ ተደራሽነት ያለ ዲጂታል እግረ-አቅጣጫዎች።',
      ussdMenu: 'የ USSD ምናሌ ምሳሌ',
    },
    mission: {
      label: 'ለገጠር ገንዘብ ዲጂታል ፍትሕ',
      title: 'የተባበሩት ኢኮኖሚዎችን ዲጂታል ዋና ድጋፍ መገንባት',
      p: 'ተልእኳችን ግልጽ፣ ደህን እና ለሁሉም ተደራሽ የሆኑ የገንዘብ ስርዓቶችን መፍጠር ነው — ገበሬው በዲጂታል ሽግሽግ ውስጥ እንዳይቀር።',
      extraTitle: 'ቀርሺLink የሚያስተውለው',
      extraP: 'በጋራ የገንዘብ አስተዳደር መፍትሄዎች የገጠር ህብረተሰቦችን እንዲጠነክሩ፣ የገንዘብ ግልጽነትን እንዲጨምሩ እና ተባባሪዎችን በዲጂታል ዘመን እንዲጠቃሙ እንረዳለን።',
    },
    impact: {
      label: 'ተፈጥሯዊ ውጤት',
      title: 'የተባበሩት ኢኮሲስተም መለወጥ',
      p: 'ቀርሺLink በገጠር ተባባሪዎች እና SACCOዎች ላይ እውነተኛ ለውጥ ያስከትላል።',
      quote: 'ቀርሺLink እስካሁን ያልተገኙትን ገንዘቦቻችንን እንድናይ እና እንድንቆጣጠራቸው አድርጎናል።',
      quoteBy: '— ተባባሪ አባል',
    },
    faq: {
      label: 'ግልጽነት እና ታምናምነት',
      title: 'ብዙ ጊዜ የሚጠየቁ ጥያቄዎች',
    },
    contact: {
      label: 'በለውጥ ውስጥ አጋር',
      title: 'ተባባሪዎን እንዲጂታላይዝ እናድርግ',
      desc: 'የ SACCO መሪ፣ የህብረት አስተዳዳሪ ወይም የልማት አጋር ቢሆኑም — ገጠር ገንዘብን በማለወጥ ውስጥ ተቀላቀሉን።',
      thankYou: 'አመሰግናለሁ። በቅርብ ጊዜ እንገናኝሃለን።',
      name: 'ስም',
      email: 'ኢሜይል',
      message: 'መልእክት',
      sendMessage: 'መልእክት ላክ',
      requestDemo: 'ዲሞ ይጠይቁ',
      partnershipInquiry: 'አጋርነት መጠየቂያ',
    },
    footer: {
      tagline: 'በጋራ የገንዘብ አስተዳደር ወደ ዲጂታል ዘመን በማሸጋገር የወገኖቻችንን ብዝሃ ህብረተሰብ እያገለገልን ነው።',
      quickLinks: 'ፈጣን አውድ',
      getInvolved: 'ተሳትፎ',
      applyCta: 'ለ SACCO / ህብረት ማመልከቻ',
      signIn: 'ግባ',
      rights: 'መብቶች የተጠበቁ ናቸው።',
      tag: 'የጋራ የገንዘብ አስተዳደር መፍትሄ',
    },
  },
};

// Module-level translations for Features (carousel items)
const featureModules = {
  en: [
    { title: 'Smart Savings Management', desc: 'Members keep regular, emergency, and goal-based savings in one place, with instant balance updates and secure tracking.' },
    { title: 'Structured Loan Management', desc: 'From application to approval and repayment, the full loan lifecycle is tracked with clear schedules and status.' },
    { title: 'Automated Double-Entry Accounting', desc: 'Every transaction uses built-in double-entry logic, keeping ledgers accurate, balanced, and audit-ready.' },
    { title: 'Real-Time Financial Reporting', desc: 'Generate weekly, monthly, quarterly, and yearly reports in seconds. Leaders always see a clear picture.' },
    { title: 'Role-Based Access Control', desc: 'Members, staff, admins, union managers, and super admins see only the data and tools they are authorized for.' },
    { title: 'Inclusive Access (USSD & Voice)', desc: 'Members without internet can check balances, repay loans, and get confirmations via USSD and hotline.' },
    { title: 'Security & Transparency', desc: 'Secure storage, complete transaction history, and clear audit trails protect cooperatives and build trust.' },
  ],
  am: [
    { title: 'ብልጥ የቁጠባ አስተዳደር', desc: 'አባላት መደበኛ፣ አስከጋጋሚ እና የታላቅ ግብ ቁጠባን በአንድ ቦታ ይቆጥባሉ።' },
    { title: 'የተዋቀረ የብድር አስተዳደር', desc: 'ከመጠየቂያ እስከ ማጽደቅ እና መመለስ፣ ሙሉው የብድር ዑደት ይከታተላል።' },
    { title: 'በራስ-ሰር ድርብ-መግቢያ እያስቀመጠ', desc: 'እያንዳንዱ ግብይት ድርብ-መግቢያ አመክንዮ ይጠቀማል።' },
    { title: 'ቀጣይነት ያለው ሪፖርት', desc: 'የሳምንት፣ ወር፣ ሩብ ዓመት እና ዓመታዊ ሪፖርቶችን በሰከንዶች ያመነጩ።' },
    { title: 'በሚና ላይ የተመሠረተ መዳረሻ', desc: 'አባላት፣ ሠራተኞች እና አስተዳዳሪዎች የሚፈቀደውን ብቻ ይመለከታሉ።' },
    { title: 'ለሁሉም ተደራሽ (USSD እና ድምጽ)', desc: 'ኢንተርኔት የሌላቸው አባላት በ USSD እና በሆትላይን ይድረሱ።' },
    { title: 'ደህንነት እና ግልጽነት', desc: 'ደህን መዛግብት፣ ሙሉ ታሪክ እና ግልጽ ምርመራ።' },
  ],
};

// HowItWorks layers
const howItWorksLayers = {
  en: [
    { level: 1, title: 'Layer 1 — SACCO Core', desc: 'Manage members, savings, loans, and accounting within one secure digital system.', visual: 'Primary SACCO' },
    { level: 2, title: 'Layer 2 — Union Oversight', desc: 'Cooperative unions gain consolidated visibility across multiple SACCOs.', visual: 'Union' },
    { level: 3, title: 'Layer 3 — Member Access', desc: 'Members gain transparent access to their financial records.', visual: 'Members' },
  ],
  am: [
    { level: 1, title: 'ቅጽ 1 — የ SACCO አስቀምጥ', desc: 'አባላት፣ ቁጠባ፣ ብድር እና እያስቀመጠ በአንድ ደህን ዲጂታል ስርዓት ውስጥ ያስተዳድሩ።', visual: 'ዋና SACCO' },
    { level: 2, title: 'ቅጽ 2 — የህብረት ተቆጣጣሪ', desc: 'የተባበሩት ህብረቶች በብዙ SACCOዎች ላይ የተዋሃደ ታይነት ያገኛሉ።', visual: 'ህብረት' },
    { level: 3, title: 'ቅጽ 3 — የአባላት መዳረሻ', desc: 'አባላት ለገንዘብ ምዝበራቸው ግልጽ መዳረሻ ያገኛሉ።', visual: 'አባላት' },
  ],
};

// Mission pillars
const missionPillars = {
  en: [
    { name: 'Transparency', desc: 'Clear, auditable financial flows' },
    { name: 'Inclusion', desc: 'Access for every member' },
    { name: 'Automation', desc: 'Less manual work, fewer errors' },
    { name: 'Governance', desc: 'Strong oversight and compliance' },
  ],
  am: [
    { name: 'ግልጽነት', desc: 'ግልጽ፣ ለምርመራ ዝግጁ የገንዘብ ዑደቶች' },
    { name: 'ተደራሽነት', desc: 'ለእያንዳንዱ አባል መዳረሻ' },
    { name: 'ራስ-ሰር', desc: 'ትንሽ በእጅ ሥራ፣ ቅየሳ ቅንሽ' },
    { name: 'ብልጽግና', desc: 'ጠንካራ ተቆጣጣሪነት እና ተግሣጽ' },
  ],
};

// Impact stats
const impactStats = {
  en: [
    { value: 'Fewer mistakes', label: 'Reduced bookkeeping errors' },
    { value: 'Real-time', label: 'Increased reporting speed' },
    { value: 'Traceable', label: 'Improved loan transparency' },
    { value: 'Members & leaders', label: 'Enhanced trust' },
  ],
  am: [
    { value: 'ቅየሳ ቅንሽ', label: 'የደረሰኝ ምዝበራ ቅየሳ ቀንሷል' },
    { value: 'ቀጣይነት', label: 'የሪፖርት ፍጥነት ጨምሯል' },
    { value: 'ከታተል ይሆናል', label: 'የብድር ግልጽነት አሻሽሏል' },
    { value: 'አባላት እና መሪዎች', label: 'ታምናምነት አጎልብቷል' },
  ],
};

// FAQ items
const faqItems = {
  en: [
    { q: 'Do farmers need smartphones?', a: 'No. The platform supports USSD for basic phones, SMS confirmations, and a voice hotline — so members without smartphones can still access their finances.' },
    { q: 'How is data secured?', a: 'All data is encrypted in transit and at rest. Access is role-based, and every transaction is logged for audit. We follow industry best practices.' },
    { q: 'Can this scale to national unions?', a: 'Yes. The architecture supports multiple SACCOs under one union, with consolidated reporting and oversight. Designed to scale as your network grows.' },
    { q: 'Is the system audit-ready?', a: 'Yes. Built-in double-entry accounting, immutable transaction logs, and timeline reports give auditors full visibility and compliance support.' },
    { q: 'How does accounting automation work?', a: 'Every savings or loan transaction is automatically posted to the correct ledger accounts. Balances stay in sync; reports are generated from the same data.' },
  ],
  am: [
    { q: 'ገበሬዎች ስማርትፎን ይፈልጋሉ?', a: 'አይደለም። መድረኩ USSD፣ SMS እና ድምጽ ሆትላይን ይደግፋል።' },
    { q: 'ረጃ እንዴት ይጠበቃል?', a: 'ሁሉም መረጃ ይመሰጠራል። መዳረሻ በሚና ላይ የተመሠረተ ነው።' },
    { q: 'ለብሔራዊ ህብረቶች ይዘልቃል?', a: 'አዎ። ብዙ SACCOዎችን እና የተዋሃደ ሪፖርት ይደግፋል።' },
    { q: 'ስርዓቱ ለምርመራ ዝግጁ?', a: 'አዎ። ድርብ-መግቢያ፣ የማይለወጥ መዛግብት እና ሪፖርቶች።' },
    { q: 'የእያስቀመጠ ራስ-ሰር እንዴት ይሰራል?', a: 'እያንዳንዱ ግብይት በራስ-ሰር ወደ ትክክለኛው መለያ ይሰዋል።' },
  ],
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    return val ?? key;
  }, [lang]);

  const getFeatureModules = useCallback(() => featureModules[lang] ?? featureModules.en, [lang]);
  const getFaqItems = useCallback(() => faqItems[lang] ?? faqItems.en, [lang]);
  const getHowItWorksLayers = useCallback(() => howItWorksLayers[lang] ?? howItWorksLayers.en, [lang]);
  const getMissionPillars = useCallback(() => missionPillars[lang] ?? missionPillars.en, [lang]);
  const getImpactStats = useCallback(() => impactStats[lang] ?? impactStats.en, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'am' : 'en'));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getFeatureModules, getFaqItems, getHowItWorksLayers, getMissionPillars, getImpactStats, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

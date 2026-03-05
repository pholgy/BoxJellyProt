import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { AppLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProteinsPage } from './pages/ProteinsPage';
import { DrugsPage } from './pages/DrugsPage';
import { SimulationPage } from './pages/SimulationPage';
import { ResultsPage } from './pages/ResultsPage';
import { ExportPage } from './pages/ExportPage';
import { DockingPage } from './pages/DockingPage';
import { DesignDemoPage } from './pages/DesignDemoPage';
import { LanguageProvider, useLanguage } from './i18n';
import { antdBioTheme } from './theme';
import './index.css';

const pageComponents: Record<string, React.FC> = {
  home: HomePage,
  proteins: ProteinsPage,
  drugs: DrugsPage,
  simulation: SimulationPage,
  results: ResultsPage,
  export: ExportPage,
  docking: DockingPage,
  'design-demo': DesignDemoPage,
};

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(t('nav.home'));
  const [showDesignDemo, setShowDesignDemo] = useState(false);

  const getRouteFromPage = (page: string): string => {
    const navKeys = ['home', 'proteins', 'drugs', 'simulation', 'results', 'export', 'docking'] as const;
    for (const key of navKeys) {
      const thLabel = t(`nav.${key}`);
      if (page === thLabel) return key;
    }
    if (page.includes('🏠')) return 'home';
    if (page.includes('🧬')) return 'proteins';
    if (page.includes('💊')) return 'drugs';
    if (page.includes('🔬')) return 'simulation';
    if (page.includes('📊')) return 'results';
    if (page.includes('📥')) return 'export';
    if (page.includes('🔗')) return 'docking';
    return 'home';
  };

  const route = getRouteFromPage(currentPage);
  const PageComponent = pageComponents[route] || HomePage;

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  if (showDesignDemo) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowDesignDemo(false)}
          style={{
            position: 'fixed', top: '1rem', left: '1rem', zIndex: 1000,
            padding: '0.5rem 1.25rem', borderRadius: '999px', border: 'none',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            background: 'rgba(0,0,0,0.7)', color: '#fff',
            backdropFilter: 'blur(10px)', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Exit Demo
        </button>
        <DesignDemoPage />
      </div>
    );
  }

  return (
    <ConfigProvider theme={antdBioTheme}>
      <div data-testid="app-loaded" className="bio-background">
        <AppLayout currentPage={currentPage} onPageChange={handlePageChange}>
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </AppLayout>
        <button
          onClick={() => setShowDesignDemo(true)}
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100,
            padding: '0.6rem 1.25rem', borderRadius: '999px',
            border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', background: 'var(--surface)', color: 'var(--accent)',
            boxShadow: 'var(--shadow-lg)', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          Design Concepts
        </button>
      </div>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;

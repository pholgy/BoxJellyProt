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
};

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(t('nav.home'));

  const getRouteFromPage = (page: string): string => {
    // Match by checking which nav key the page string corresponds to
    const navKeys = ['home', 'proteins', 'drugs', 'simulation', 'results', 'export'] as const;
    for (const key of navKeys) {
      const thLabel = t(`nav.${key}`);
      if (page === thLabel) return key;
    }
    // Fallback: check emojis
    if (page.includes('🏠')) return 'home';
    if (page.includes('🧬')) return 'proteins';
    if (page.includes('💊')) return 'drugs';
    if (page.includes('🔬')) return 'simulation';
    if (page.includes('📊')) return 'results';
    if (page.includes('📥')) return 'export';
    return 'home';
  };

  const route = getRouteFromPage(currentPage);
  const PageComponent = pageComponents[route] || HomePage;

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

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

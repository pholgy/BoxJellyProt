import React, { useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { AppLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProteinsPage } from './pages/ProteinsPage';
import { DrugsPage } from './pages/DrugsPage';
import { SimulationPage } from './pages/SimulationPage';
import { ResultsPage } from './pages/ResultsPage';
import { ExportPage } from './pages/ExportPage';
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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('🏠 หน้าแรก');

  const getRouteFromPage = (page: string): string => {
    switch (page) {
      case '🏠 หน้าแรก':
        return 'home';
      case '🧬 โปรตีนพิษ':
        return 'proteins';
      case '💊 สารยา':
        return 'drugs';
      case '🔬 จำลองการทดลอง':
        return 'simulation';
      case '📊 ผลลัพธ์':
        return 'results';
      case '📥 ส่งออกข้อมูล':
        return 'export';
      default:
        return 'home';
    }
  };

  const route = getRouteFromPage(currentPage);
  const PageComponent = pageComponents[route] || HomePage;

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <ConfigProvider
      theme={{
        ...antdBioTheme,
        algorithm: antdTheme.darkAlgorithm,
      }}
    >
      <div data-testid="app-loaded" className="bio-background">
        <AppLayout currentPage={currentPage} onPageChange={handlePageChange}>
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </AppLayout>
      </div>
    </ConfigProvider>
  );
};

export default App;

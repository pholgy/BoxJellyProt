import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import { AppLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProteinsPage } from './pages/ProteinsPage';
import { DrugsPage } from './pages/DrugsPage';
import { SimulationPage } from './pages/SimulationPage';
import { ResultsPage } from './pages/ResultsPage';
import { ExportPage } from './pages/ExportPage';
import './index.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('🏠 หน้าแรก');

  // Map Thai navigation items to internal route keys
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

  const renderPage = () => {
    const route = getRouteFromPage(currentPage);

    switch (route) {
      case 'home':
        return <HomePage />;
      case 'proteins':
        return <ProteinsPage />;
      case 'drugs':
        return <DrugsPage />;
      case 'simulation':
        return <SimulationPage />;
      case 'results':
        return <ResultsPage />;
      case 'export':
        return <ExportPage />;
      default:
        return <HomePage />;
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1E88E5',
        },
      }}
    >
      <AppLayout currentPage={currentPage} onPageChange={handlePageChange}>
        {renderPage()}
      </AppLayout>
    </ConfigProvider>
  );
};

export default App;
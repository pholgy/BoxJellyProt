import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import { AppLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
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
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">🧬 โปรตีนพิษ</h1>
            <p className="text-gray-600">Proteins Page - Coming Soon</p>
          </div>
        );
      case 'drugs':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">💊 สารยา</h1>
            <p className="text-gray-600">Drugs Page - Coming Soon</p>
          </div>
        );
      case 'simulation':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">🔬 จำลองการทดลอง</h1>
            <p className="text-gray-600">Simulation Page - Coming Soon</p>
          </div>
        );
      case 'results':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">📊 ผลลัพธ์</h1>
            <p className="text-gray-600">Results Page - Coming Soon</p>
          </div>
        );
      case 'export':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">📥 ส่งออกข้อมูล</h1>
            <p className="text-gray-600">Export Page - Coming Soon</p>
          </div>
        );
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
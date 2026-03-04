import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DatabaseService } from '../../services/database';
import { ErrorBoundary } from '../ErrorBoundary';
import { useLanguage } from '../../i18n';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPage,
  onPageChange
}) => {
  const { t } = useLanguage();
  const [page, setPage] = useState(currentPage || t('nav.home'));

  useEffect(() => {
    if (currentPage) {
      setPage(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await DatabaseService.getDatabaseStats();
      } catch (error) {
        console.warn('Database initialization failed:', error);
      }
    };

    initDatabase();
  }, []);

  const handleNavigation = (newPage: string) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="flex min-h-[100dvh]"
        data-testid="app-layout"
      >
        {/* Sidebar Navigation Panel */}
        <ErrorBoundary
          fallback={
            <div className="w-72 min-h-[100dvh] bio-sidebar flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>{t('sidebar.menuFailed')}</p>
              </div>
            </div>
          }
        >
          <Sidebar
            currentPage={page}
            onNavigate={handleNavigation}
          />
        </ErrorBoundary>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bio-scrollbar">
          <ErrorBoundary>
            <div className="min-h-full px-6 py-8 lg:px-10">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
};

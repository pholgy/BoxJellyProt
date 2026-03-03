import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DatabaseService } from '../../services/database';
import { ErrorBoundary } from '../ErrorBoundary';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPage = '🏠 หน้าแรก',
  onPageChange
}) => {
  const [page, setPage] = useState(currentPage);

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
              <div className="text-center text-zinc-400">
                <p>เมนูไม่สามารถโหลดได้</p>
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
            <div className="min-h-full">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
};

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
    // Initialize database connection when layout mounts
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
        className="flex h-screen bg-gray-50"
        data-testid="app-layout"
      >
        {/* Sidebar */}
        <ErrorBoundary
          fallback={
            <div className="w-72 h-screen bg-white border-r border-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
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
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            <div className="h-full">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
};
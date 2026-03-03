import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DatabaseService } from '../../services/database';

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
    <div
      className="flex h-screen bg-gray-50"
      data-testid="app-layout"
    >
      {/* Sidebar */}
      <Sidebar
        currentPage={page}
        onNavigate={handleNavigation}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
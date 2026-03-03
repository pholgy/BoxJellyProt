import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/database';
import { DatabaseErrorBoundary } from '../ErrorBoundary';
import { JellyfishIcon } from '../Icons';

export interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface DatabaseStats {
  total_proteins: number;
  total_drugs: number;
}

const navigationItems = [
  '🏠 หน้าแรก',
  '🧬 โปรตีนพิษ',
  '💊 สารยา',
  '🔬 จำลองการทดลอง',
  '📊 ผลลัพธ์',
  '📥 ส่งออกข้อมูล'
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Find current page index for keyboard navigation
  const currentPageIndex = navigationItems.findIndex(item => item === currentPage);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const databaseStats = await DatabaseService.getDatabaseStats();
        setStats(databaseStats);
      } catch (error) {
        console.error('Error loading database stats:', error);
        // Fallback stats if service fails
        setStats({ total_proteins: 12, total_drugs: 25 });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <aside
      className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm"
      role="navigation"
      aria-label="เมนูหลักการนำทาง"
    >
      {/* Header with Jellyfish Icon */}
      <div className="p-6 text-center border-b border-gray-200">
        <div className="mb-4 flex justify-center">
          <JellyfishIcon
            className="w-20 h-20"
            alt="Box Jellyfish - แมงกะพรุนกล่อง"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">เมนูหลัก</h1>
        <p className="text-sm text-gray-600">เลือกหน้า</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6" aria-label="เมนูหน้าต่างๆ">
        <div className="space-y-2" role="list">
          {navigationItems.map((item, index) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`
                w-full text-left px-4 py-3 rounded-md transition-all duration-200
                flex items-center space-x-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${currentPage === item
                  ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:translate-x-0.5'
                }
              `}
              role="listitem"
              aria-label={`ไปยังหน้า ${item}`}
              aria-current={currentPage === item ? 'page' : undefined}
              tabIndex={currentPage === item ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(item);
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = (index + 1) % navigationItems.length;
                  const nextButton = e.currentTarget.parentElement?.children[nextIndex] as HTMLButtonElement;
                  nextButton?.focus();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevIndex = index === 0 ? navigationItems.length - 1 : index - 1;
                  const prevButton = e.currentTarget.parentElement?.children[prevIndex] as HTMLButtonElement;
                  prevButton?.focus();
                } else if (e.key === 'Home') {
                  e.preventDefault();
                  const firstButton = e.currentTarget.parentElement?.children[0] as HTMLButtonElement;
                  firstButton?.focus();
                } else if (e.key === 'End') {
                  e.preventDefault();
                  const lastButton = e.currentTarget.parentElement?.children[navigationItems.length - 1] as HTMLButtonElement;
                  lastButton?.focus();
                }
              }}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Database Stats - Streamlit style metrics */}
        <DatabaseErrorBoundary>
          <div className="space-y-4" role="region" aria-label="สถิติฐานข้อมูล">
            <div className="metric-card" role="status" aria-live="polite">
              <div className="text-2xl font-bold text-blue-600 mb-1" aria-label={`จำนวนโปรตีน ${isLoading ? 'กำลังโหลด' : stats?.total_proteins || 0} โปรตีน`}>
                {isLoading ? '...' : stats?.total_proteins || 0}
              </div>
              <div className="text-sm font-medium text-gray-700">จำนวนโปรตีน</div>
            </div>

            <div className="metric-card" role="status" aria-live="polite">
              <div className="text-2xl font-bold text-blue-600 mb-1" aria-label={`จำนวนสารยา ${isLoading ? 'กำลังโหลด' : stats?.total_drugs || 0} สารยา`}>
                {isLoading ? '...' : stats?.total_drugs || 0}
              </div>
              <div className="text-sm font-medium text-gray-700">จำนวนสารยา</div>
            </div>
          </div>
        </DatabaseErrorBoundary>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>โปรแกรมวิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง v1.0</p>
          <p>© 2025 - เพื่อการศึกษาและวิจัย</p>
        </div>
      </div>
    </aside>
  );
};
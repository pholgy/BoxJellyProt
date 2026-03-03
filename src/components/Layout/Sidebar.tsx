import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/database';

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
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header with Jellyfish Icon */}
      <div className="p-6 text-center border-b border-gray-200">
        <div className="mb-4">
          <img
            src="https://img.icons8.com/color/96/000000/jellyfish.png"
            alt="Jellyfish"
            className="w-20 h-20 mx-auto"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">เมนูหลัก</h1>
        <p className="text-sm text-gray-600">เลือกหน้า</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`
                sidebar-nav-item w-full text-left px-4 py-3
                flex items-center space-x-3 text-sm font-medium
                ${currentPage === item ? 'active' : 'text-gray-700'}
              `}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Database Stats - Streamlit style metrics */}
        <div className="space-y-4">
          <div className="metric-card">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {isLoading ? '...' : stats?.total_proteins || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">จำนวนโปรตีน</div>
          </div>

          <div className="metric-card">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {isLoading ? '...' : stats?.total_drugs || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">จำนวนสารยา</div>
          </div>
        </div>

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
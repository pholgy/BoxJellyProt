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

  useEffect(() => {
    const loadStats = async () => {
      try {
        const databaseStats = await DatabaseService.getDatabaseStats();
        setStats(databaseStats);
      } catch (error) {
        console.error('Error loading database stats:', error);
        setStats({ total_proteins: 12, total_drugs: 25 });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <aside
      className="w-72 min-h-[100dvh] bio-sidebar flex flex-col"
      role="navigation"
      aria-label="เมนูหลักการนำทาง"
    >
      {/* Header with Jellyfish Icon */}
      <div className="p-6 text-center border-b border-white/[0.06]">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <JellyfishIcon
              className="w-20 h-20 drop-shadow-[0_0_12px_rgba(0,212,255,0.3)]"
              alt="Box Jellyfish - แมงกะพรุนกล่อง"
            />
            <div className="absolute inset-0 rounded-full bg-accent/5 blur-xl" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-zinc-100 mb-1 tracking-tight">
          เมนูหลัก
        </h1>
        <p className="text-sm text-zinc-500">เลือกหน้า</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5" aria-label="เมนูหน้าต่างๆ">
        <div className="space-y-1" role="list">
          {navigationItems.map((item, index) => (
            <button
              key={item}
              onClick={() => onNavigate(item)}
              className={`
                w-full text-left px-4 py-3 text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-bio-800
                bio-nav-item
                ${currentPage === item
                  ? 'active text-accent'
                  : 'text-zinc-400 hover:text-zinc-200'
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
        <hr className="my-5 border-white/[0.06]" />

        {/* Database Stats */}
        <DatabaseErrorBoundary>
          <div className="space-y-3 px-1" role="region" aria-label="สถิติฐานข้อมูล">
            <div className="metric-card" role="status" aria-live="polite">
              <div
                className="text-2xl font-bold text-accent mb-1 font-mono"
                aria-label={`จำนวนโปรตีน ${isLoading ? 'กำลังโหลด' : stats?.total_proteins || 0} โปรตีน`}
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" />
                ) : (
                  stats?.total_proteins || 0
                )}
              </div>
              <div className="text-sm font-medium text-zinc-400">จำนวนโปรตีน</div>
            </div>

            <div className="metric-card" role="status" aria-live="polite">
              <div
                className="text-2xl font-bold text-teal mb-1 font-mono"
                aria-label={`จำนวนสารยา ${isLoading ? 'กำลังโหลด' : stats?.total_drugs || 0} สารยา`}
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" />
                ) : (
                  stats?.total_drugs || 0
                )}
              </div>
              <div className="text-sm font-medium text-zinc-400">จำนวนสารยา</div>
            </div>
          </div>
        </DatabaseErrorBoundary>

        {/* Divider */}
        <hr className="my-5 border-white/[0.06]" />
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/[0.06]">
        <div className="text-xs text-zinc-600 text-center space-y-1">
          <p>โปรแกรมวิเคราะห์โปรตีนพิษแมงกะพรุนกล่อง v1.0</p>
          <p>&copy; 2025 - เพื่อการศึกษาและวิจัย</p>
        </div>
      </div>
    </aside>
  );
};

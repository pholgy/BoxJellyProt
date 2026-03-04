import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/database';
import { DatabaseErrorBoundary } from '../ErrorBoundary';
import { JellyfishIcon } from '../Icons';
import { useLanguage } from '../../i18n';

export interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface DatabaseStats {
  total_proteins: number;
  total_drugs: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, toggleLanguage } = useLanguage();

  const navItems = [t('nav.home'), t('nav.proteins'), t('nav.drugs'), t('nav.simulation'), t('nav.results'), t('nav.export')];

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
      aria-label={t('sidebar.mainMenu')}
    >
      {/* Header with Jellyfish Icon */}
      <div className="p-6 text-center border-b border-gray-200">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <JellyfishIcon
              className="w-20 h-20 drop-shadow-[0_0_12px_rgba(0,212,255,0.3)]"
              alt="Box Jellyfish"
            />
            <div className="absolute inset-0 rounded-full bg-blue-50 blur-xl" />
          </div>
        </div>

        {/* Language Toggle */}
        <button
          className="lang-toggle"
          onClick={toggleLanguage}
          aria-label="Toggle language"
        >
          {t('sidebar.language')}
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
          {t('sidebar.mainMenu')}
        </h1>
        <p className="text-sm text-gray-400">{t('sidebar.selectPage')}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5" aria-label={t('sidebar.selectPage')}>
        <ul className="space-y-1 list-none p-0 m-0">
          {navItems.map((item, index) => (
            <li key={item}>
              <button
                onClick={() => onNavigate(item)}
                className={`
                  w-full text-left px-4 py-3 text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2
                  bio-nav-item
                  ${currentPage === item
                    ? 'active text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                  }
                `}
                aria-current={currentPage === item ? 'page' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % navItems.length;
                    const nextLi = e.currentTarget.closest('ul')?.children[nextIndex];
                    (nextLi?.querySelector('button') as HTMLButtonElement)?.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = index === 0 ? navItems.length - 1 : index - 1;
                    const prevLi = e.currentTarget.closest('ul')?.children[prevIndex];
                    (prevLi?.querySelector('button') as HTMLButtonElement)?.focus();
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    const firstLi = e.currentTarget.closest('ul')?.children[0];
                    (firstLi?.querySelector('button') as HTMLButtonElement)?.focus();
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    const lastLi = e.currentTarget.closest('ul')?.children[navItems.length - 1];
                    (lastLi?.querySelector('button') as HTMLButtonElement)?.focus();
                  }
                }}
              >
                <span>{item}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <hr className="my-5 border-gray-200" />

        {/* Database Stats */}
        <DatabaseErrorBoundary>
          <div className="space-y-3 px-1" role="region" aria-label={t('sidebar.proteinCount')}>
            <div className="metric-card" role="status" aria-live="polite">
              <div
                className="text-2xl font-bold text-blue-600 mb-1 font-mono"
                aria-label={`${t('sidebar.proteinCount')} ${isLoading ? '...' : stats?.total_proteins || 0}`}
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" />
                ) : (
                  stats?.total_proteins || 0
                )}
              </div>
              <div className="text-sm font-medium text-gray-500">{t('sidebar.proteinCount')}</div>
            </div>

            <div className="metric-card" role="status" aria-live="polite">
              <div
                className="text-2xl font-bold text-emerald-600 mb-1 font-mono"
                aria-label={`${t('sidebar.drugCount')} ${isLoading ? '...' : stats?.total_drugs || 0}`}
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" />
                ) : (
                  stats?.total_drugs || 0
                )}
              </div>
              <div className="text-sm font-medium text-gray-500">{t('sidebar.drugCount')}</div>
            </div>
          </div>
        </DatabaseErrorBoundary>

        {/* Divider */}
        <hr className="my-5 border-gray-200" />
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 text-center space-y-1">
          <p>{t('sidebar.footer')}</p>
          <p>{t('sidebar.copyright')}</p>
        </div>
      </div>
    </aside>
  );
};

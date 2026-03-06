import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const JELLYFISH_MESSAGES_EN = [
  "Hi there! ~",
  "Let's do science!",
  "Bloop bloop!",
  "I love proteins!",
  "*wiggles tentacles*",
  "Box jelly says hi!",
  "Feeling toxic today~",
  "Swim with me!",
];

const JELLYFISH_MESSAGES_TH = [
  "สวัสดีค่า~",
  "มาทำวิจัยกัน!",
  "บลูป บลูป!",
  "ชอบโปรตีน!",
  "*กระดิกหนวด*",
  "แมงกะพรุนทักทาย!",
  "วันนี้พิษแรงจัง~",
  "ว่ายน้ำด้วยกัน!",
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const { language, t, toggleLanguage } = useLanguage();

  const showRandomMessage = useCallback(() => {
    const messages = language === 'th' ? JELLYFISH_MESSAGES_TH : JELLYFISH_MESSAGES_EN;
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setSpeechBubble(msg);
    setTimeout(() => setSpeechBubble(null), 2500);
  }, [language]);

  const navItems = [t('nav.home'), t('nav.proteins'), t('nav.drugs'), t('nav.simulation'), t('nav.results'), t('nav.export'), t('nav.docking')];

  // Each nav emoji gets a unique CSS hover animation class
  const emojiAnimClass: Record<number, string> = {
    0: 'nav-emoji-wiggle',    // 🏠 wiggle
    1: 'nav-emoji-stretch',   // 🧬 stretch
    2: 'nav-emoji-bounce',    // 💊 bounce
    3: 'nav-emoji-spin',      // 🔬 spin
    4: 'nav-emoji-pulse',     // 📊 pulse
    5: 'nav-emoji-drop',      // 📥 drop
    6: 'nav-emoji-shake',     // 🔗 shake+grow
  };

  /** Split leading emoji from nav label text */
  const splitEmoji = (label: string) => {
    const match = label.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u);
    if (match) {
      return { emoji: match[1], text: label.slice(match[0].length) };
    }
    return { emoji: null, text: label };
  };

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
      aria-label={t('sidebar.mainMenu')}
    >
      {/* Header with Jellyfish Icon */}
      <div className="p-6 text-center border-b border-gray-200">
        <div className="mb-4 flex justify-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Speech bubble */}
            <AnimatePresence>
              {speechBubble && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                    bg-white border border-blue-200 text-xs text-blue-700 font-medium
                    px-3 py-1.5 rounded-full shadow-md z-10"
                  aria-live="polite"
                >
                  {speechBubble}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-blue-200 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
            <div onClick={showRandomMessage} role="button" tabIndex={0} aria-label="Pet the jellyfish" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showRandomMessage(); } }}>
              <JellyfishIcon
                className="w-20 h-20 drop-shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                alt="Box Jellyfish"
                interactive
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-blue-50 blur-xl" aria-hidden="true" />
          </motion.div>
        </div>

        {/* Language Toggle */}
        <button
          className="lang-toggle"
          onClick={toggleLanguage}
          aria-label={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
        >
          {t('sidebar.language')}
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
          {t('sidebar.mainMenu')}
        </h2>
        <p className="text-sm text-gray-500">{t('sidebar.selectPage')}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5" aria-label={t('sidebar.mainMenu')}>
        <ul className="space-y-1 list-none p-0 m-0">
          {navItems.map((item, index) => (
            <li key={item}>
              <motion.button
                onClick={() => onNavigate(item)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                {(() => {
                  const { emoji, text } = splitEmoji(item);
                  return (
                    <>
                      {emoji && (
                        <span
                          className={`nav-emoji ${emojiAnimClass[index] || ''}`}
                          aria-hidden="true"
                        >
                          {emoji}
                        </span>
                      )}
                      <span>{text}</span>
                    </>
                  );
                })()}
              </motion.button>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <hr className="my-5 border-gray-200" aria-hidden="true" />

        {/* Database Stats */}
        <DatabaseErrorBoundary>
          <div className="space-y-3 px-1" role="region" aria-live="polite" aria-label={t('sidebar.proteinCount')}>
            <div className="metric-card">
              <div
                className="text-2xl font-bold text-blue-600 mb-1 font-mono"
                aria-hidden="true"
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" aria-hidden="true" />
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {stats?.total_proteins || 0}
                  </motion.div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600">{t('sidebar.proteinCount')}</div>
              <span className="sr-only">
                {t('sidebar.proteinCount')}: {isLoading ? 'loading' : stats?.total_proteins || 0}
              </span>
            </div>

            <div className="metric-card">
              <div
                className="text-2xl font-bold text-emerald-600 mb-1 font-mono"
                aria-hidden="true"
              >
                {isLoading ? (
                  <div className="bio-skeleton h-8 w-12" aria-hidden="true" />
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                  >
                    {stats?.total_drugs || 0}
                  </motion.div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-600">{t('sidebar.drugCount')}</div>
              <span className="sr-only">
                {t('sidebar.drugCount')}: {isLoading ? 'loading' : stats?.total_drugs || 0}
              </span>
            </div>
          </div>
        </DatabaseErrorBoundary>

        {/* Divider */}
        <hr className="my-5 border-gray-200" aria-hidden="true" />
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>{t('sidebar.footer')}</p>
          <p>{t('sidebar.copyright')}</p>
        </div>
      </div>
    </aside>
  );
};

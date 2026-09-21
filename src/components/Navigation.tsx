import React from 'react';
import { soundEngine } from '../services/audio';
import {
  Home,
  Flame,
  ShoppingBag,
  Gavel,
  CreditCard,
  BookOpen,
  Target,
  History as HistoryIcon,
  Shield,
} from 'lucide-react';

export type TabType =
  | 'home'
  | 'scout'
  | 'myteam'
  | 'mycards'
  | 'market'
  | 'auction'
  | 'collection'
  | 'missions'
  | 'history';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingMissionsCount?: number;
  hasFreeScoutAvailable?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  pendingMissionsCount = 0,
  hasFreeScoutAvailable = false,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'ホーム', icon: Home },
    { id: 'scout' as TabType, label: 'スカウト', icon: Flame, badge: hasFreeScoutAvailable ? '無料' : undefined },
    { id: 'myteam' as TabType, label: 'マイチーム', icon: Shield },
    { id: 'mycards' as TabType, label: 'マイカード', icon: CreditCard },
    { id: 'market' as TabType, label: '市場', icon: ShoppingBag },
    { id: 'auction' as TabType, label: '競売', icon: Gavel },
    { id: 'collection' as TabType, label: '図鑑', icon: BookOpen },
    {
      id: 'missions' as TabType,
      label: 'ミッション',
      icon: Target,
      badge: pendingMissionsCount > 0 ? String(pendingMissionsCount) : undefined,
    },
    { id: 'history' as TabType, label: '履歴', icon: HistoryIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl safe-area-bottom">
      <div className="max-w-xl sm:max-w-4xl mx-auto flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition duration-150 ${
                isActive
                  ? 'text-cyan-400 font-bold bg-slate-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-cyan-400' : ''}`} />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[9px] px-1 font-black rounded-full leading-tight ${
                      tab.badge === '無料'
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

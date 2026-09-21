import React from 'react';
import { UserProfile, GameNotification } from '../types';
import { soundEngine } from '../services/audio';
import { useI18n, SupportedLanguage } from '../services/i18n';
import { Coins, Flame, ArrowRightLeft, Bell, Settings, Globe, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile;
  notifications: GameNotification[];
  onOpenExchange: () => void;
  onOpenNotifications: () => void;
  onNavigateSettings: () => void;
  onToggleBgm?: () => void;
  bgmActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  notifications,
  onOpenExchange,
  onOpenNotifications,
  onNavigateSettings,
}) => {
  const { currentLanguage, setLanguage } = useI18n();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const languages: { id: SupportedLanguage; label: string }[] = [
    { id: 'ja', label: 'JP' },
    { id: 'en', label: 'EN' },
    { id: 'es', label: 'ES' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* User Identity */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs border border-cyan-400/40 shadow-sm shrink-0">
            FC
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-['Chakra_Petch'] font-bold text-sm text-white truncate max-w-[120px] sm:max-w-[180px]">
                {profile.username}
              </span>
              <span className="text-[10px] bg-slate-900 px-1.5 py-0.2 rounded text-slate-400 border border-slate-800 shrink-0">
                Lv.{profile.loginStreak}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">● ONLINE</span>
              <span>•</span>
              <span className="truncate">育成Pt: {profile.trainingPt}</span>
            </div>
          </div>
        </div>

        {/* Currency Badges */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* SC (Super Coins) */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg px-2 sm:px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-amber-300 font-bold leading-none">SC</span>
              <span className="font-['Teko'] text-sm sm:text-base font-bold text-white tracking-tight leading-none">
                {profile.sc.toLocaleString()}
              </span>
            </div>
          </div>

          {/* MP (Market Points) */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-2 sm:px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-cyan-300 font-bold leading-none">MP</span>
              <span className="font-['Teko'] text-sm sm:text-base font-bold text-white tracking-tight leading-none">
                {profile.mp.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Exchange Quick Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenExchange();
            }}
            title="MPをSCに交換 (10,000 MP → 100 SC)"
            className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-amber-600/30 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition flex items-center gap-1 text-[11px] font-semibold"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">交換</span>
          </button>
        </div>

        {/* Action Controls: Language Switcher, Notifications, Settings */}
        <div className="flex items-center gap-1.5">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {languages.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setLanguage(l.id);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  currentLanguage === l.id
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenNotifications();
            }}
            className="relative p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="お知らせ・通知"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings Gear */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onNavigateSettings();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="ゲーム設定"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

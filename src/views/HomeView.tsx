import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserCard, MarketListing, DailyMission, OnlinePlayer } from '../types';
import { PLAYER_MAP } from '../data/players';
import { Card3D } from '../components/Card3D';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import {
  Flame,
  Coins,
  Sparkles,
  ShoppingBag,
  Gavel,
  Target,
  ArrowRight,
  Gift,
  ShieldCheck,
  Users,
  Layers,
  TrendingUp,
  ArrowRightLeft,
} from 'lucide-react';
import { TabType } from '../components/Navigation';

interface HomeViewProps {
  profile: UserProfile;
  cards: UserCard[];
  marketListings: MarketListing[];
  dailyMissions: DailyMission[];
  onlinePlayers: OnlinePlayer[];
  onNavigate: (tab: TabType) => void;
  onOpenExchange: () => void;
  onSelectCard: (card: UserCard) => void;
  onSelectOnlinePlayer: (player: OnlinePlayer) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  cards,
  marketListings,
  dailyMissions,
  onlinePlayers,
  onNavigate,
  onOpenExchange,
  onSelectCard,
  onSelectOnlinePlayer,
}) => {
  const { t } = useI18n();

  // Find highest OVR card or favorite
  const favoriteCard = cards.find((c) => c.isFavorite);
  const highestOvrCard = cards.reduce<UserCard | null>((best, cur) => {
    const curP = PLAYER_MAP[cur.playerId];
    const bestP = best ? PLAYER_MAP[best.playerId] : null;
    if (!bestP || (curP && curP.ovr > bestP.ovr)) return cur;
    return best;
  }, null);

  const showcaseCard = favoriteCard || highestOvrCard || cards[0];
  const showcasePlayer = showcaseCard ? PLAYER_MAP[showcaseCard.playerId] : null;

  const completedDailyCount = dailyMissions.filter((m) => m.isCompleted).length;
  const activeAuctions = marketListings.filter((l) => !l.isSold && !l.isCancelled && l.type === 'auction');

  return (
    <div className="space-y-5 pb-8 max-w-6xl mx-auto">
      {/* Hero Welcome & Quick Stats */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold text-[11px]">
                SEASON 2026 ACTIVE
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 完全無料・安全運用
              </span>
            </div>

            <h1 className="font-['Chakra_Petch'] text-3xl sm:text-4xl font-black text-white tracking-tight">
              ようこそ、{profile.username} オーナー
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              スカウトで世界基準のサッカー選手を集め、市場で自由に取引・育成し、理想のドリームチームを作り上げよう！
            </p>

            {/* Quick Currency Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">所持 SC:</span>
                <span className="font-['Teko'] text-lg font-bold text-amber-300">
                  {profile.sc.toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 text-xs">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">所持 MP:</span>
                <span className="font-['Teko'] text-lg font-bold text-cyan-300">
                  {profile.mp.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenExchange}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/40 to-amber-600/40 border border-slate-700 hover:border-slate-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <span>MP ⇄ SC 交換</span>
              </button>
            </div>
          </div>

          {/* Card Showcase Widget */}
          {showcaseCard && showcasePlayer && (
            <div
              className="flex flex-col items-center shrink-0 cursor-pointer group"
              onClick={() => onSelectCard(showcaseCard)}
            >
              <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                エース選手カード (タップで詳細・育成)
              </div>
              <div className="group-hover:scale-105 transition-transform duration-300">
                <Card3D card={showcaseCard} player={showcasePlayer} size="md" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Free 10-Pull Banner if Available */}
      {!profile.isFreeTenPullClaimed && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => onNavigate('scout')}
          className="cursor-pointer bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 text-slate-950 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 text-yellow-400 shrink-0">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider bg-slate-950 text-white px-2 py-0.5 rounded w-fit mb-1">
                新規登録特典
              </div>
              <h3 className="font-['Teko'] text-2xl sm:text-3xl font-bold leading-none">
                リリース記念 無料10連スカウト開催中！
              </h3>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">
                最高レア「SSR選手」が1枚確定で手に入ります。今すぐ引こう！
              </p>
            </div>
          </div>

          <div className="p-2 rounded-full bg-slate-950 text-white shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
        </motion.div>
      )}

      {/* Grid of Core Hub Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Scout */}
        <div
          onClick={() => onNavigate('scout')}
          className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer flex flex-col justify-between shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-700/50">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              SSR天井: 150連
            </span>
          </div>

          <div>
            <h3 className="font-['Chakra_Petch'] font-bold text-lg text-white group-hover:text-cyan-400 transition">
              {t('nav_scout')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              半額・通常・プレミアムスカウトで世界のスター選手を獲得。
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
            <span>スカウトへ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Market */}
        <div
          onClick={() => onNavigate('market')}
          className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer flex flex-col justify-between shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-700/50">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              取引回数無制限
            </span>
          </div>

          <div>
            <h3 className="font-['Chakra_Petch'] font-bold text-lg text-white group-hover:text-emerald-400 transition">
              {t('nav_market')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              全国のオーナーとMPで即時売買。制限なしで何度でも売買可能。
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>市場を見る</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Auction */}
        <div
          onClick={() => onNavigate('auction')}
          className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/60 transition cursor-pointer flex flex-col justify-between shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-purple-950 text-purple-400 border border-purple-700/50">
              <Gavel className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
              入札無制限
            </span>
          </div>

          <div>
            <h3 className="font-['Chakra_Petch'] font-bold text-lg text-white group-hover:text-purple-400 transition">
              {t('nav_auction')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              利用制限撤廃！気になる激レアカードにいつでも何回でも入札可能。
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400">
            <span>オークションへ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Missions */}
        <div
          onClick={() => onNavigate('missions')}
          className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 transition cursor-pointer flex flex-col justify-between shadow-md group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-amber-950 text-amber-400 border border-amber-700/50">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-amber-300">
              本日: {completedDailyCount} / {dailyMissions.length}
            </span>
          </div>

          <div>
            <h3 className="font-['Chakra_Petch'] font-bold text-lg text-white group-hover:text-amber-400 transition">
              {t('nav_missions')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              毎日の簡単なタスクでptを獲得。50ptでお好みの通貨・育成Ptを選択！
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
            <span>ミッションを確認</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Online Players & Trading Community Section (Requirements 7 & 8) */}
      <div className="rounded-3xl p-5 bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-600/40 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
                {t('online_players_title')}
              </h3>
              <p className="text-[11px] text-slate-400">
                全国のアクティブオーナー。プロフィール閲覧・1対1トレード交換が可能
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {onlinePlayers.length} 名参加中
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {onlinePlayers.map((player) => (
            <div
              key={player.userId}
              onClick={() => {
                soundEngine.playButtonClick();
                onSelectOnlinePlayer(player);
              }}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/70 cursor-pointer transition flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-['Chakra_Petch'] font-bold text-sm">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  {player.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-900" />
                  )}
                </div>

                <div className="truncate">
                  <div className="font-['Chakra_Petch'] font-bold text-xs text-white group-hover:text-cyan-300 transition truncate">
                    {player.username}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{player.cardCount} 枚所持</span>
                    <span>• {player.collectionProgress}% 収集</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">トレード</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

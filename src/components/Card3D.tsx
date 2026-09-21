import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserCard, Player } from '../types';
import { PLAYER_MAP, ALL_PLAYERS_DATABASE } from '../data/players';
import { gameStorage } from '../services/storage';
import { soundEngine } from '../services/audio';
import { Sparkles, Shield, RefreshCw, Lock, Heart, CheckCircle2, XCircle } from 'lucide-react';

interface Card3DProps {
  card: UserCard;
  player?: Player;
  size?: 'sm' | 'md' | 'lg' | 'detail';
  showFavoriteButton?: boolean;
  onToggleFavorite?: (instanceId: string) => void;
  onToggleLock?: (instanceId: string) => void;
  onClick?: () => void;
  disableFlip?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  card: initialCard,
  player: propPlayer,
  size = 'md',
  showFavoriteButton = false,
  onToggleFavorite,
  onToggleLock,
  onClick,
  disableFlip = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState<UserCard>(initialCard);

  useEffect(() => {
    setCurrentCard(initialCard);
  }, [initialCard]);

  // Lookup player with multiple fallback tiers to ensure 100% data availability
  const player =
    propPlayer ||
    PLAYER_MAP[currentCard.playerId] ||
    ALL_PLAYERS_DATABASE.find((p) => p.id === currentCard.playerId);

  if (!player) return null;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableFlip) {
      if (onClick) onClick();
      return;
    }
    soundEngine.playCardFlip();

    // Query storage for latest state when flipping card to guarantee fresh live data
    if (typeof gameStorage !== 'undefined') {
      const freshCard = gameStorage.getUserCards().find((c) => c.instanceId === currentCard.instanceId);
      if (freshCard) {
        setCurrentCard(freshCard);
      }
    }

    setIsFlipped(!isFlipped);
  };

  // Dimensions based on size
  const sizeClasses = {
    sm: 'w-36 h-52 text-xs',
    md: 'w-48 h-72 text-sm',
    lg: 'w-60 h-88 text-base',
    detail: 'w-80 sm:w-88 h-[480px] sm:h-[500px] text-base',
  }[size];

  // Rarity theme styling
  const rarityTheme = {
    N: {
      border: 'border-slate-600',
      bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
      accent: 'text-slate-400',
      badge: 'bg-slate-700 text-slate-200 border-slate-500',
      nameGradient: 'text-slate-100',
      glow: '',
      shadow: 'shadow-md shadow-black/50',
    },
    R: {
      border: 'border-cyan-500/60',
      bg: 'bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900',
      accent: 'text-cyan-400',
      badge: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/50',
      nameGradient: 'bg-gradient-to-r from-cyan-200 to-sky-300 bg-clip-text text-transparent',
      glow: 'ring-1 ring-cyan-500/30',
      shadow: 'shadow-lg shadow-cyan-950/40',
    },
    SR: {
      border: 'border-amber-400/80',
      bg: 'bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-900',
      accent: 'text-amber-400',
      badge: 'bg-gradient-to-r from-amber-600 to-purple-600 text-white border-amber-300',
      nameGradient: 'bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent',
      glow: 'ring-2 ring-amber-400/50 shadow-amber-500/20',
      shadow: 'shadow-xl shadow-amber-950/50',
    },
    SSR: {
      border: 'border-yellow-400',
      bg: 'bg-gradient-to-br from-yellow-950/90 via-slate-950 to-amber-950/90',
      accent: 'text-yellow-400',
      badge: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 font-black border-yellow-200',
      nameGradient: 'bg-gradient-to-r from-yellow-200 via-white to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]',
      glow: 'ring-2 ring-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.4)] animate-pulse',
      shadow: 'shadow-2xl shadow-yellow-950/70',
    },
  }[player.rarity];

  const isAwakened = currentCard.isAwakened;
  const isLegend = player.status === 'legend';
  const isCardEligible = player.isCardEligible !== false;

  return (
    <div
      className={`relative select-none perspective-[1000px] cursor-pointer ${sizeClasses}`}
      onClick={(e) => {
        if (onClick) onClick();
        else handleFlip(e);
      }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* ======================================================== */}
        {/* CARD FRONT */}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl p-3 flex flex-col justify-between overflow-hidden border-2 ${
            isAwakened ? 'border-fuchsia-400 ring-2 ring-fuchsia-400/80 shadow-[0_0_30px_rgba(217,70,239,0.5)]' : rarityTheme.border
          } ${rarityTheme.bg} ${rarityTheme.shadow} ${rarityTheme.glow}`}
        >
          {/* Awakened Foil Overlay */}
          {isAwakened && (
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-cyan-400/15 to-amber-400/15 pointer-events-none mix-blend-color-dodge animate-pulse" />
          )}

          {/* Holographic sparkle texture for SR & SSR */}
          {(player.rarity === 'SR' || player.rarity === 'SSR') && (
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:16px_16px]" />
          )}

          {/* Top Section: OVR, Position, Rarity, Badges & Lock */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-['Teko'] text-3xl sm:text-4xl leading-none font-bold text-white tracking-tighter drop-shadow-md">
                {player.ovr}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-700/80 text-cyan-300">
                  {player.position}
                </span>
                {isLegend && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                    LEGEND
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {currentCard.isListed && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 animate-pulse">
                  出品中
                </span>
              )}

              {showFavoriteButton && onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playButtonClick();
                    onToggleFavorite(currentCard.instanceId);
                  }}
                  className={`p-1 rounded-full bg-slate-950/80 border border-slate-700 ${
                    currentCard.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              )}

              {showFavoriteButton && onToggleLock && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playButtonClick();
                    onToggleLock(currentCard.instanceId);
                  }}
                  className={`p-1 rounded-full bg-slate-950/80 border border-slate-700 ${
                    currentCard.isLocked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title={currentCard.isLocked ? 'ロック中' : 'ロックなし'}
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}

              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${rarityTheme.badge}`}>
                {player.rarity}
              </span>
            </div>
          </div>

          {/* Center Section: Big Player Name & Typographic Art */}
          <div className="relative z-10 my-auto text-center flex flex-col items-center justify-center py-2">
            <div className="text-4xl sm:text-5xl font-['Teko'] font-bold text-slate-800/40 select-none tracking-widest absolute -z-0">
              #{player.number}
            </div>

            <h3
              className={`font-['Chakra_Petch'] font-bold tracking-tight leading-tight uppercase line-clamp-2 ${
                size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-lg' : 'text-2xl'
              } ${rarityTheme.nameGradient}`}
            >
              {player.name}
            </h3>

            <div className="text-[11px] text-slate-400 font-medium tracking-wide mt-1 truncate max-w-[90%]">
              {player.enName}
            </div>

            {/* Club & Country Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
              <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/60 text-slate-300 font-semibold truncate max-w-[130px]">
                {player.club}
              </span>
              <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60 text-slate-400">
                {player.nationality}
              </span>
            </div>
          </div>

          {/* Bottom Section: Training Lv, Serial, Rarity Footer */}
          <div className="relative z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-400">Lv.{currentCard.trainingLv}</span>
              {isAwakened && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500 font-bold text-[9px]">
                  <Sparkles className="w-2.5 h-2.5" /> 覚醒
                </span>
              )}
            </div>

            <div className="text-right">
              {player.rarity === 'SSR' && currentCard.serialNumber ? (
                <span className="font-mono text-yellow-400 font-bold text-[9px] block">
                  #{String(currentCard.serialNumber).padStart(4, '0')}/2000
                </span>
              ) : (
                <span className="font-mono text-slate-500 text-[9px] block truncate max-w-[80px]">
                  {currentCard.cardIdDisplay}
                </span>
              )}
            </div>
          </div>

          <div className="text-center font-['Teko'] text-lg font-bold text-slate-400/80 tracking-widest leading-none mt-1">
            {player.rarity}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD BACK - Complete Details as per Requirement #3 */}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-3 flex flex-col justify-between overflow-y-auto border-2 ${
            rarityTheme.border
          } bg-slate-950 text-slate-200 shadow-xl scrollbar-none`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="font-['Chakra_Petch'] font-bold text-xs text-white truncate block">
                  {player.name}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">{player.enName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${rarityTheme.badge}`}>
                {player.rarity}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">#{player.number}</span>
            </div>
          </div>

          {/* Grid of full stats */}
          <div className="grid grid-cols-2 gap-1 text-[10px] my-1 shrink-0">
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">総合値 (OVR)</span>
              <span className="font-bold text-cyan-300">{player.ovr}</span>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">ポジション</span>
              <span className="font-bold text-slate-200">{player.position}</span>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">国籍</span>
              <span className="font-semibold text-slate-200 truncate block">{player.nationality}</span>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">所属クラブ</span>
              <span className="font-semibold text-slate-200 truncate block">{player.club}</span>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">所属リーグ</span>
              <span className="font-semibold text-slate-200 truncate block">{player.league}</span>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">年齢 / 身長 / 利き足</span>
              <span className="font-semibold text-slate-200 truncate block">
                {player.age}歳 / {player.height}cm / {player.foot}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">ステータス</span>
              <span className={`font-bold ${isLegend ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isLegend ? 'レジェンド' : '現役'}
              </span>
            </div>
            <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
              <span className="text-[8px] text-slate-400 block">カード化可否</span>
              <span className={`font-bold flex items-center gap-0.5 ${isCardEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCardEligible ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                {isCardEligible ? '可能' : '不可'}
              </span>
            </div>
          </div>

          {/* Career Bio */}
          <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[9px] text-slate-300 leading-tight shrink-0 my-0.5">
            <span className="text-[8px] text-slate-400 font-bold block mb-0.5">選手略歴:</span>
            <p className="line-clamp-3">{player.careerBio}</p>
          </div>

          {/* Card & Market Status Details */}
          <div className="space-y-1 text-[9px] pt-1 border-t border-slate-800 shrink-0">
            <div className="flex justify-between items-center text-slate-400">
              <span>シリアルNo.:</span>
              <span className="font-mono text-yellow-400 font-bold">
                {currentCard.serialNumber ? `#${String(currentCard.serialNumber).padStart(4, '0')}/2000` : 'なし (N/R/SR)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>発行総数 / 残存枚数:</span>
              <span className="font-mono text-slate-200">
                {player.baseIssueCount.toLocaleString()} / {(player.remainingIssueCount ?? player.baseIssueCount).toLocaleString()} 枚
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>参考相場:</span>
              <span className="font-mono text-amber-400 font-bold">
                {player.basePrice.toLocaleString()} MP
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>育成 / 覚醒状態:</span>
              <span className="text-cyan-300 font-semibold">
                Lv.{currentCard.trainingLv}/10 • {currentCard.isAwakened ? '★覚醒済' : '未覚醒'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>カード状態:</span>
              <span className="text-slate-300">
                {currentCard.isLocked ? '🔒 ロック中' : '未ロック'} {currentCard.isListed ? '• 🏷️ 出品中' : ''}
              </span>
            </div>
          </div>

          {/* Flip Hint */}
          <div className="text-center text-[8px] text-cyan-400/80 flex items-center justify-center gap-1 mt-1 shrink-0 pt-0.5">
            <RefreshCw className="w-2.5 h-2.5" />
            <span>タップで表面に戻る</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

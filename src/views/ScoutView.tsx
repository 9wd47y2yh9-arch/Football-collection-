import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { UserProfile, UserCard, ScoutBanner } from '../types';
import { SCOUT_BANNERS, PLAYER_MAP } from '../data/players';
import { Card3D } from '../components/Card3D';
import { soundEngine } from '../services/audio';
import {
  Flame,
  Sparkles,
  Info,
  Gift,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  ShieldAlert,
  FastForward,
  Layers,
  Crown,
} from 'lucide-react';

interface ScoutViewProps {
  profile: UserProfile;
  onPerformScout: (
    bannerId: 'normal' | 'half' | 'premium' | 'legend',
    pullCount: 1 | 10 | 50,
    isFreePull?: boolean
  ) => { success: boolean; message: string; cards: UserCard[] };
  onCardClick: (card: UserCard) => void;
}

export const ScoutView: React.FC<ScoutViewProps> = ({
  profile,
  onPerformScout,
  onCardClick,
}) => {
  const [selectedBannerId, setSelectedBannerId] = useState<'half' | 'normal' | 'premium' | 'legend'>('half');
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [drawnResult, setDrawnResult] = useState<UserCard[] | null>(null);
  const [openedIndices, setOpenedIndices] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stacked 1-by-1 Reveal State
  const [revealMode, setRevealMode] = useState<'stack' | 'summary'>('stack');
  const [currentRevealIdx, setCurrentRevealIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showSsrCutIn, setShowSsrCutIn] = useState(false);

  const banner = SCOUT_BANNERS.find((b) => b.id === selectedBannerId) || SCOUT_BANNERS[0];

  const currentPity =
    selectedBannerId === 'normal'
      ? profile.pityCountNormal
      : selectedBannerId === 'half'
      ? profile.pityCountHalf
      : selectedBannerId === 'legend'
      ? profile.pityCountPremium // Shared premium counter
      : profile.pityCountPremium;

  const handlePull = (count: 1 | 10 | 50, isFree = false) => {
    soundEngine.playButtonClick();
    setErrorMessage(null);
    setIsPulling(true);

    soundEngine.playCardAcquire();

    const res = onPerformScout(selectedBannerId, count, isFree);

    if (res.success && res.cards.length > 0) {
      setTimeout(() => {
        setIsPulling(false);
        setDrawnResult(res.cards);
        setOpenedIndices(new Set());
        setRevealMode('stack');
        setCurrentRevealIdx(0);
        setIsCardFlipped(false);
        setShowSsrCutIn(false);
      }, 700);
    } else {
      setIsPulling(false);
      setErrorMessage(res.message);
    }
  };

  // Flip the currently presented card in the stack
  const handleFlipCurrentInStack = () => {
    if (isCardFlipped || !drawnResult) return;
    const currentCard = drawnResult[currentRevealIdx];
    if (!currentCard) return;

    soundEngine.playCardFlip();
    setIsCardFlipped(true);

    const updated = new Set(openedIndices);
    updated.add(currentRevealIdx);
    setOpenedIndices(updated);

    const player = PLAYER_MAP[currentCard.playerId];
    const isSSR = player?.rarity === 'SSR';
    const isSR = player?.rarity === 'SR';

    if (isSSR) {
      soundEngine.playSSRFanfare();
      setShowSsrCutIn(true);
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.45 },
        colors: ['#f59e0b', '#eab308', '#fef08a', '#ffffff'],
      });
      setTimeout(() => setShowSsrCutIn(false), 2200);
    } else if (isSR) {
      soundEngine.playSRGlow();
    }
  };

  // Move to next card in stack
  const handleNextInStack = () => {
    if (!drawnResult) return;
    soundEngine.playButtonClick();

    if (currentRevealIdx < drawnResult.length - 1) {
      setCurrentRevealIdx((prev) => prev + 1);
      setIsCardFlipped(false);
      setShowSsrCutIn(false);
    } else {
      // Last card revealed -> transition to summary grid
      setRevealMode('summary');
    }
  };

  // Skip 1-by-1 stack animation and open all
  const handleSkipToSummary = () => {
    soundEngine.playButtonClick();
    if (!drawnResult) return;
    const all = new Set<number>();
    drawnResult.forEach((_, idx) => all.add(idx));
    setOpenedIndices(all);
    setRevealMode('summary');
    soundEngine.playCardFlip();
  };

  const currentStackCard = drawnResult ? drawnResult[currentRevealIdx] : null;
  const currentStackPlayer = currentStackCard ? PLAYER_MAP[currentStackCard.playerId] : null;

  return (
    <div className="space-y-5 pb-8 max-w-5xl mx-auto">
      {/* Release Celebration Free 10-Pull Banner (If Available) */}
      {!profile.isFreeTenPullClaimed ? (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden rounded-3xl p-5 border-2 border-yellow-400/90 bg-gradient-to-r from-amber-950 via-slate-950 to-yellow-950 shadow-[0_0_35px_rgba(234,179,8,0.3)]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Gift className="w-32 h-32 text-yellow-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[11px] animate-pulse">
                  初回限定・完全無料
                </span>
                <span className="text-xs font-bold text-amber-300">★ SSR 1枚確定 ★</span>
              </div>
              <h3 className="font-['Chakra_Petch'] text-xl sm:text-2xl font-black text-white">
                リリース記念 無料10連スカウト
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                初回ログイン限定！世界最高峰の実在選手SSRが必ず1枚以上排出される特別スカウト
              </p>
            </div>

            <button
              type="button"
              disabled={isPulling}
              onClick={() => handlePull(10, true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-amber-500/20 active:scale-95 transition flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>無料で10連を引く</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>リリース記念無料10連スカウトは獲得済みです。</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">CLAIMED</span>
        </div>
      )}

      {/* Banner Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SCOUT_BANNERS.map((b) => {
          const isSelected = selectedBannerId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setSelectedBannerId(b.id as 'half' | 'normal' | 'premium' | 'legend');
              }}
              className={`p-3 rounded-2xl border text-left transition relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400/90 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    b.id === 'legend'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500'
                      : b.id === 'premium'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500'
                      : b.id === 'half'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                  }`}
                >
                  {b.badge}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  SSR {b.ssrRate * 100}%
                </span>
              </div>
              <div
                className={`font-['Chakra_Petch'] font-bold text-xs sm:text-sm truncate ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {b.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Banner Showcase Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600">
                {banner.badge}
              </span>
              <span className="text-xs text-slate-400">
                SSR排出率: <b className="text-amber-400">{banner.ssrRate * 100}%</b>
              </span>
            </div>
            <h3 className="font-['Chakra_Petch'] text-2xl font-bold text-white flex items-center gap-2">
              {banner.id === 'legend' && <Crown className="w-6 h-6 text-amber-400" />}
              <span>{banner.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">{banner.description}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowRatesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold w-fit"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>提供割合・出現一覧</span>
          </button>
        </div>

        {/* Pity Ceiling Meter */}
        <div className="mt-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              SSR確定カウント (天井: {selectedBannerId === 'legend' ? '120' : '150'}連)
            </span>
            <span className="text-cyan-300 font-mono font-bold">
              あと <span className="text-amber-400 text-sm">{Math.max(0, (selectedBannerId === 'legend' ? 120 : 150) - currentPity)}</span> 回
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (currentPity / (selectedBannerId === 'legend' ? 120 : 150)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>現在: {currentPity} / {selectedBannerId === 'legend' ? 120 : 150}</span>
            <span>※天井達成で最高レアSSRが確定排出されます</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pull Action Buttons */}
        {(() => {
          const p1 = banner.price1 ?? banner.costSingle ?? 100;
          const p10 = banner.price10 ?? banner.costTen ?? 950;
          const p50 = banner.price50 ?? banner.costFifty ?? 4000;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              {/* 1 Pull */}
              <button
                type="button"
                disabled={isPulling}
                onClick={() => handlePull(1)}
                className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500 text-white transition flex flex-col items-center justify-center gap-1 shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-xs text-slate-400 font-bold">スカウト 1回</span>
                <div className="flex items-center gap-1.5 font-['Teko'] text-2xl font-bold text-amber-400">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>{p1.toLocaleString()} SC</span>
                </div>
                <span className="text-[10px] text-slate-500">1枚獲得</span>
              </button>

              {/* 10 Pull */}
              <button
                type="button"
                disabled={isPulling}
                onClick={() => handlePull(10)}
                className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/70 to-slate-900 border border-cyan-500/70 hover:border-cyan-400 text-white transition flex flex-col items-center justify-center gap-1 shadow-lg shadow-cyan-950/40 hover:scale-[1.02] active:scale-[0.98] relative"
              >
                <span className="absolute -top-2 px-2 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px]">
                  おすすめ
                </span>
                <span className="text-xs text-cyan-300 font-bold">スカウト 10回 (お得)</span>
                <div className="flex items-center gap-1.5 font-['Teko'] text-2xl font-bold text-amber-300">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>{p10.toLocaleString()} SC</span>
                </div>
                <span className="text-[10px] text-slate-400">SR以上1枚確定</span>
              </button>

              {/* 50 Pull */}
              <button
                type="button"
                disabled={isPulling}
                onClick={() => handlePull(50)}
                className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/70 to-slate-900 border border-amber-500/70 hover:border-amber-400 text-white transition flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-xs text-amber-300 font-bold">超大量 50連スカウト</span>
                <div className="flex items-center gap-1.5 font-['Teko'] text-2xl font-bold text-amber-400">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>{p50.toLocaleString()} SC</span>
                </div>
                <span className="text-[10px] text-slate-400">天井カウント +50</span>
              </button>
            </div>
          );
        })()}
      </div>

      {/* Gacha Result Overlay with Stacked Card Reveal */}
      <AnimatePresence>
        {drawnResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 overflow-y-auto select-none"
          >
            {/* Top Control Bar */}
            <div className="w-full max-w-4xl flex items-center justify-between py-2 border-b border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider">SCOUT REVEAL</span>
                <h3 className="font-['Chakra_Petch'] text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>スカウト結果</span>
                  <span className="text-xs text-slate-400">({drawnResult.length}枚獲得)</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {revealMode === 'stack' ? (
                  <button
                    type="button"
                    onClick={handleSkipToSummary}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <FastForward className="w-3.5 h-3.5 text-amber-400" />
                    <span>スキップ (一括確認)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDrawnResult(null)}
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
                  >
                    閉じる
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDrawnResult(null)}
                  className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* REVEAL MODE 1: STACKED 1-BY-1 REVEAL */}
            {revealMode === 'stack' && currentStackCard && (
              <div className="flex-1 flex flex-col items-center justify-center py-4 w-full max-w-lg relative">
                {/* Progress Indicator */}
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono font-bold text-white">
                    {currentRevealIdx + 1} / {drawnResult.length}
                  </span>
                  <span className="text-slate-500">
                    ({drawnResult.length - currentRevealIdx - 1}枚 残り)
                  </span>
                </div>

                {/* SSR Cut-in Overlay Banner */}
                <AnimatePresence>
                  {showSsrCutIn && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      className="absolute z-40 top-8 px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-lg sm:text-xl shadow-[0_0_40px_rgba(234,179,8,0.8)] border-2 border-white animate-bounce"
                    >
                      ★ SSR PLAYER ACQUIRED! ★
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Stacked Deck Visual Container */}
                <div className="relative w-64 h-96 flex items-center justify-center my-2">
                  {/* Visual ghost cards in background of deck */}
                  {drawnResult.length - currentRevealIdx > 2 && (
                    <div className="absolute w-56 h-84 rounded-2xl bg-slate-950 border border-slate-800 -rotate-6 translate-y-3 opacity-40 shadow-xl pointer-events-none" />
                  )}
                  {drawnResult.length - currentRevealIdx > 1 && (
                    <div className="absolute w-60 h-88 rounded-2xl bg-slate-900 border border-slate-700 rotate-3 translate-y-1.5 opacity-70 shadow-xl pointer-events-none" />
                  )}

                  {/* Active Top Card */}
                  <div
                    onClick={isCardFlipped ? handleNextInStack : handleFlipCurrentInStack}
                    className="relative z-20 cursor-pointer transition-transform active:scale-95"
                  >
                    {isCardFlipped ? (
                      <motion.div
                        initial={{ rotateY: -90 }}
                        animate={{ rotateY: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card3D card={currentStackCard} size="lg" />
                      </motion.div>
                    ) : (
                      /* Shimmering Card Back */
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className={`w-60 h-88 rounded-2xl p-4 flex flex-col items-center justify-between border-2 shadow-2xl relative overflow-hidden ${
                          currentStackPlayer?.rarity === 'SSR'
                            ? 'border-yellow-400 bg-gradient-to-br from-amber-950 via-slate-950 to-yellow-950 shadow-[0_0_30px_rgba(234,179,8,0.4)] ring-2 ring-yellow-400/50'
                            : currentStackPlayer?.rarity === 'SR'
                            ? 'border-purple-400 bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
                            : 'border-cyan-500/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-xl'
                        }`}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400">
                          <span>FOOTBALL</span>
                          <span className="font-bold text-cyan-400">COLLECTION</span>
                        </div>

                        {/* Center Crest */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 mb-2 ${
                              currentStackPlayer?.rarity === 'SSR'
                                ? 'border-yellow-400 bg-yellow-950/60 shadow-[0_0_20px_rgba(234,179,8,0.5)]'
                                : currentStackPlayer?.rarity === 'SR'
                                ? 'border-purple-400 bg-purple-950/60'
                                : 'border-cyan-400/60 bg-slate-800/80'
                            }`}
                          >
                            <Sparkles
                              className={`w-10 h-10 ${
                                currentStackPlayer?.rarity === 'SSR'
                                  ? 'text-yellow-400 animate-spin'
                                  : currentStackPlayer?.rarity === 'SR'
                                  ? 'text-purple-400'
                                  : 'text-cyan-400'
                              }`}
                            />
                          </div>
                          <span className="font-['Teko'] text-3xl font-bold text-white tracking-widest leading-none">
                            FC
                          </span>
                          <span className="text-[11px] font-bold text-cyan-300 mt-1">
                            TAP TO REVEAL
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          CARD #{currentRevealIdx + 1}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Controls for Stack */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  {!isCardFlipped ? (
                    <button
                      type="button"
                      onClick={handleFlipCurrentInStack}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition"
                    >
                      タップしてめくる
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextInStack}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition"
                    >
                      <span>
                        {currentRevealIdx < drawnResult.length - 1
                          ? '次のカードへ ➔'
                          : '結果一覧を見る ➔'}
                      </span>
                    </button>
                  )}
                  <span className="text-[10px] text-slate-500">
                    画面右上の「スキップ」で一括表示できます
                  </span>
                </div>
              </div>
            )}

            {/* REVEAL MODE 2: FULL SUMMARY GRID */}
            {revealMode === 'summary' && (
              <div className="w-full max-w-5xl my-auto py-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 overflow-y-auto max-h-[70vh]">
                {drawnResult.map((card, idx) => (
                  <motion.div
                    key={card.instanceId}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="relative cursor-pointer"
                    onClick={() => onCardClick(card)}
                  >
                    <Card3D card={card} size="sm" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bottom Controls for Summary */}
            {revealMode === 'summary' && (
              <div className="w-full max-w-md py-3 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setDrawnResult(null)}
                  className="w-full py-3 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition text-sm shadow-lg"
                >
                  スカウト画面に戻る
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rates Modal */}
      <AnimatePresence>
        {showRatesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
                  スカウト提供割合 ({banner.name})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRatesModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 font-bold">
                  <span>SSR (スーパースペシャルレア)</span>
                  <span>{banner.ssrRate * 100}%</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 font-bold">
                  <span>SR (スペシャルレア)</span>
                  <span>{banner.id === 'legend' ? '25.0%' : '15.0%'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-bold">
                  <span>R (レア)</span>
                  <span>{banner.id === 'legend' ? '35.0%' : '30.0%'}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-700 text-slate-400 font-bold">
                  <span>N (ノーマル)</span>
                  <span>
                    {banner.id === 'legend'
                      ? '32.0%'
                      : (100 - banner.ssrRate * 100 - 45).toFixed(1) + '%'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p>・SSRカードには世界に1枚のシリアルナンバー（#0001〜#2000）が付与されます。</p>
                <p>
                  ・{selectedBannerId === 'legend' ? '120' : '150'}回スカウトを引くと天井に到達し、SSRが確定排出されます。
                </p>
                <p>・レジェンド限定スカウトは、伝説の往年の名選手（108名）のみが排出されます。</p>
              </div>

              <button
                type="button"
                onClick={() => setShowRatesModal(false)}
                className="w-full mt-4 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

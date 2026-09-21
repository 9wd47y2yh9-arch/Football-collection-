import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { UserCard } from '../types';
import { PLAYER_MAP } from '../data/players';
import { Card3D } from './Card3D';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import {
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Tag,
  Shield,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface CardDetailModalProps {
  card: UserCard;
  userTrainingPt: number;
  onTrain: (cardInstanceId: string) => { success: boolean; message: string; newLevel: number };
  onAwaken: (cardInstanceId: string) => { success: boolean; message: string };
  onToggleLock?: (cardInstanceId: string) => void;
  onOpenSellModal?: (card: UserCard) => void;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  userTrainingPt,
  onTrain,
  onAwaken,
  onToggleLock,
  onOpenSellModal,
  onClose,
}) => {
  const { t } = useI18n();
  const player = PLAYER_MAP[card.playerId];
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLocked, setIsLocked] = useState(card.isLocked);

  if (!player) return null;

  const trainCost = card.trainingLv * 5;
  const canTrain = card.trainingLv < 10 && userTrainingPt >= trainCost && !card.isListed;
  const canAwaken = card.trainingLv >= 10 && !card.isAwakened && userTrainingPt >= 50 && !card.isListed;
  const isLegend = player.status === 'legend';
  const isCardEligible = player.isCardEligible !== false;

  const handleTrain = () => {
    soundEngine.playButtonClick();
    const res = onTrain(card.instanceId);
    if (res.success) {
      soundEngine.playTrainingSuccess();
      setFeedback({ type: 'success', message: res.message });
      if (res.newLevel >= 10) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAwaken = () => {
    soundEngine.playButtonClick();
    const res = onAwaken(card.instanceId);
    if (res.success) {
      soundEngine.playAwakening();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleLockToggle = () => {
    soundEngine.playButtonClick();
    if (onToggleLock) {
      onToggleLock(card.instanceId);
      setIsLocked(!isLocked);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: 3D Interactive Card (Can flip) */}
          <div className="flex flex-col items-center justify-center">
            <Card3D card={{ ...card, isLocked }} player={player} size="detail" />
            <span className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              カードをタップして表裏（全20項目詳細）を反転
            </span>
          </div>

          {/* Right: Player Profile & Actions Console */}
          <div className="flex flex-col justify-between space-y-3.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  {player.rarity}
                </span>
                <span className="text-xs font-bold text-slate-400">{player.position}</span>
                {isLegend && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                    LEGEND
                  </span>
                )}
                {card.isListed && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 animate-pulse">
                    {t('listed_badge')}
                  </span>
                )}
                {isLocked && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t('locked_badge')}
                  </span>
                )}
                {card.serialNumber && (
                  <span className="text-xs font-mono font-bold text-yellow-400 ml-auto">
                    #{String(card.serialNumber).padStart(4, '0')}/2000
                  </span>
                )}
              </div>

              <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white mt-1 leading-tight">
                {player.name}
              </h2>
              <div className="text-xs text-slate-400">
                {player.enName} • {player.club} ({player.league})
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('overall')}</span>
                <span className="font-['Teko'] text-2xl font-bold text-cyan-300">{player.ovr}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('reference_price')}</span>
                <span className="font-['Teko'] text-2xl font-bold text-amber-400">
                  {player.basePrice.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ステータス</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">
                  {isLegend ? 'レジェンド' : '現役'}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">カード化可否</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  {isCardEligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                  {isCardEligible ? '可能' : '不可'}
                </span>
              </div>
            </div>

            {/* Lock / Unlock Toggle Button */}
            {onToggleLock && (
              <button
                type="button"
                onClick={handleLockToggle}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  isLocked
                    ? 'bg-amber-950/70 border-amber-600 text-amber-300 hover:bg-amber-900/60'
                    : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                {isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{t('unlock_card')} (ロック解除)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('lock_card')} (誤売却・トレード防止)</span>
                  </>
                )}
              </button>
            )}

            {/* Training Console */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {t('training_level')}
                </span>
                <span className="text-xs text-slate-400">
                  {t('training_points')}: <span className="font-bold text-white">{userTrainingPt} Pt</span>
                </span>
              </div>

              {/* Level Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-cyan-300">Level {card.trainingLv} / 10</span>
                  <span className="text-[11px] text-slate-400">
                    {card.trainingLv === 10 ? 'MAX' : `次Lvまで: ${trainCost} Pt`}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-300"
                    style={{ width: `${(card.trainingLv / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-950 border border-emerald-600/50 text-emerald-300'
                      : 'bg-rose-950 border border-rose-600/50 text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {card.isListed ? (
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 font-medium">
                    出品中のカードは育成・覚醒・売却・トレードができません。
                  </div>
                ) : (
                  <>
                    {card.trainingLv < 10 ? (
                      <button
                        type="button"
                        disabled={!canTrain}
                        onClick={handleTrain}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 hover:brightness-110 transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>{t('do_training')} ({trainCost} 育成Pt)</span>
                      </button>
                    ) : !card.isAwakened ? (
                      <button
                        type="button"
                        disabled={!canAwaken}
                        onClick={handleAwaken}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 text-white disabled:opacity-40 hover:brightness-110 transition shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-1.5 animate-pulse"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>★ {t('do_awakening')} (50 育成Pt) ★</span>
                      </button>
                    ) : (
                      <div className="p-2 rounded-xl bg-fuchsia-950/60 border border-fuchsia-600/40 text-center text-xs text-fuchsia-300 font-bold flex items-center justify-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>覚醒完了済み（最高オーラ開放）</span>
                      </div>
                    )}

                    {/* Sell on Market Button (Requirement #4) */}
                    {onOpenSellModal && (
                      <button
                        type="button"
                        disabled={isLocked || card.isListed}
                        onClick={() => {
                          soundEngine.playButtonClick();
                          onOpenSellModal(card);
                        }}
                        className={`w-full py-2 rounded-xl font-semibold text-xs border transition flex items-center justify-center gap-1.5 ${
                          isLocked || card.isListed
                            ? 'opacity-40 bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t('list_on_market')}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

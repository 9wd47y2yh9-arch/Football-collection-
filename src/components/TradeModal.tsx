import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { OnlinePlayer, UserCard, TradeRequest } from '../types';
import { PLAYER_MAP } from '../data/players';
import { Card3D } from './Card3D';
import { gameStorage } from '../services/storage';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import {
  X,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Check,
  Ban,
  Send,
} from 'lucide-react';

interface TradeModalProps {
  targetPlayer: OnlinePlayer;
  userCards: UserCard[];
  initialTargetCard?: UserCard;
  canTradeToday: boolean;
  dailyTradesCount: number;
  onExecuteTrade: (
    targetUserId: string,
    offeredCardInstanceId: string,
    requestedCardInstanceId: string
  ) => { success: boolean; message: string };
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  targetPlayer,
  userCards,
  initialTargetCard,
  canTradeToday,
  dailyTradesCount,
  onExecuteTrade,
  onClose,
}) => {
  const { t } = useI18n();
  const [modalTab, setModalTab] = useState<'create' | 'pending'>('create');
  const [selectedTargetCardId, setSelectedTargetCardId] = useState<string>(
    initialTargetCard ? initialTargetCard.instanceId : targetPlayer.publicCards[0]?.instanceId || ''
  );
  const [selectedOfferedCardId, setSelectedOfferedCardId] = useState<string>('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [tradeRequestsList, setTradeRequestsList] = useState<TradeRequest[]>(() =>
    gameStorage.getTradeRequests()
  );

  const pendingCount = tradeRequestsList.filter((r) => r.status === 'PENDING').length;

  // Eligible cards that user can offer: not locked, not listed, and not in an active trade
  const availableUserCards = userCards.filter((c) => !c.isLocked && !c.isListed && !c.isInTrade);

  const selectedTargetCard = targetPlayer.publicCards.find((c) => c.instanceId === selectedTargetCardId);
  const selectedOfferedCard = userCards.find((c) => c.instanceId === selectedOfferedCardId);

  const targetPlayerData = selectedTargetCard ? PLAYER_MAP[selectedTargetCard.playerId] : null;
  const offeredPlayerData = selectedOfferedCard ? PLAYER_MAP[selectedOfferedCard.playerId] : null;

  const currentUserId = gameStorage.getProfile()?.userId || 'user-1';
  const [confirmingApproveId, setConfirmingApproveId] = useState<string | null>(null);

  const handleProceedToConfirm = () => {
    soundEngine.playButtonClick();
    if (!canTradeToday) {
      setFeedback({ type: 'error', message: '本日のトレード上限（1回）に達しています。' });
      return;
    }
    if (!selectedTargetCardId) {
      setFeedback({ type: 'error', message: '相手の希望カードを選択してください。' });
      return;
    }
    if (!selectedOfferedCardId) {
      setFeedback({ type: 'error', message: '自分の差し出すカードを選択してください。' });
      return;
    }
    setStep('confirm');
  };

  const handleSendPendingRequest = () => {
    soundEngine.playButtonClick();
    const res = gameStorage.createTradeRequest(targetPlayer.userId, selectedOfferedCardId, selectedTargetCardId);
    if (res.success) {
      soundEngine.playTradeCompleted();
      setFeedback({
        type: 'success',
        message: `${targetPlayer.username} にトレード申請を送信しました。相手の承認をお待ちください（カードは安全にロックされます）。`,
      });
      setTradeRequestsList(gameStorage.getTradeRequests());
      setModalTab('pending');
      setStep('select');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleApproveRequest = (tradeId: string) => {
    soundEngine.playButtonClick();
    const res = gameStorage.approveTrade(tradeId);
    if (res.success) {
      soundEngine.playTradeCompleted();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setFeedback({ type: 'success', message: res.message });
      setTradeRequestsList(gameStorage.getTradeRequests());
      setConfirmingApproveId(null);
    } else {
      setFeedback({ type: 'error', message: res.message });
      setConfirmingApproveId(null);
    }
  };

  const handleRejectRequest = (tradeId: string) => {
    soundEngine.playButtonClick();
    const res = gameStorage.rejectTrade(tradeId);
    setFeedback({ type: 'error', message: res.message });
    setTradeRequestsList(gameStorage.getTradeRequests());
  };

  const handleCancelRequest = (tradeId: string) => {
    soundEngine.playButtonClick();
    const res = gameStorage.cancelTrade(tradeId);
    setFeedback({ type: 'error', message: res.message });
    setTradeRequestsList(gameStorage.getTradeRequests());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch'] font-bold text-lg text-white">
                {t('trade_window_title')}
              </h3>
              <p className="text-[11px] text-slate-400">
                トレード相手: <span className="text-white font-bold">{targetPlayer.username}</span> オーナー
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Create vs Pending */}
        <div className="flex items-center gap-2 mt-3 mb-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setModalTab('create');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              modalTab === 'create'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>新規トレード申請</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setModalTab('pending');
              setTradeRequestsList(gameStorage.getTradeRequests());
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              modalTab === 'pending'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>保留中・履歴 ({pendingCount})</span>
          </button>
        </div>

        {/* Daily limit badge */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs mb-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>{t('trade_limit_notice')}</span>
          </div>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded ${
              canTradeToday
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                : 'bg-rose-950 text-rose-300 border border-rose-600'
            }`}
          >
            本日完了: {dailyTradesCount}/1 回
          </span>
        </div>

        {modalTab === 'pending' ? (
          /* ======================================================== */
          /* PENDING & RECENT TRADE REQUESTS TAB                      */
          /* ======================================================== */
          <div className="space-y-3">
            {tradeRequestsList.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                現在、保留中または過去のトレード申請はありません。
              </div>
            ) : (
              tradeRequestsList.map((req) => {
                const offPlayer = PLAYER_MAP[req.offeredCard.playerId];
                const reqPlayer = PLAYER_MAP[req.requestedCard.playerId];
                const isPending = req.status === 'PENDING';

                return (
                  <div
                    key={req.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{req.senderName}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-white">{req.receiverName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'ACCEPTED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : req.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {req.status === 'ACCEPTED'
                          ? '成立済'
                          : req.status === 'PENDING'
                          ? '承諾待ち (PENDING)'
                          : req.status === 'REJECTED'
                          ? '辞退'
                          : '取消'}
                      </span>
                    </div>

                    {/* Cards visual swap summary */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-900 border border-rose-900/40 text-center">
                        <span className="text-[9px] text-rose-400 block font-bold">放出</span>
                        <span className="font-bold text-slate-200 block truncate">
                          {offPlayer?.name || '選手'}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {offPlayer?.rarity} • {offPlayer?.ovr} OVR
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-900/40 text-center">
                        <span className="text-[9px] text-emerald-400 block font-bold">獲得</span>
                        <span className="font-bold text-slate-200 block truncate">
                          {reqPlayer?.name || '選手'}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {reqPlayer?.rarity} • {reqPlayer?.ovr} OVR
                        </span>
                      </div>
                    </div>

                    {/* Actions for PENDING request */}
                    {isPending && (
                      <div className="pt-2 border-t border-slate-800/80">
                        {req.senderId === currentUserId ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span>{t('trade_awaiting_approval')}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCancelRequest(req.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
                            >
                              <X className="w-3 h-3 text-slate-400" />
                              <span>{t('trade_cancel_btn')}</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            {confirmingApproveId === req.id ? (
                              <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-2">
                                <p className="text-xs text-emerald-300 font-bold">
                                  {t('trade_confirm_approve_msg')}
                                </p>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmingApproveId(null)}
                                    className="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
                                  >
                                    {t('cancel')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveRequest(req.id)}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                                  >
                                    {t('trade_approve_btn')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRejectRequest(req.id)}
                                  className="px-3 py-1.5 rounded-lg border border-rose-800/50 bg-rose-950/40 text-rose-300 text-xs font-bold hover:bg-rose-900/60 flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3 text-rose-400" />
                                  <span>{t('trade_reject_btn')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmingApproveId(req.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{t('trade_approve_btn')}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {feedback && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950 border border-emerald-600/50 text-emerald-300'
                    : 'bg-rose-950 border border-rose-600/50 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
          </div>
        ) : (

        <AnimatePresence mode="wait">
          {step === 'select' ? (
            <motion.div
              key="step-select"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* Target Player Card Picker */}
              <div>
                <label className="text-xs font-bold text-cyan-300 block mb-1.5">
                  1. {t('select_target_card')} ({targetPlayer.username})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {targetPlayer.publicCards.map((card) => {
                    const p = PLAYER_MAP[card.playerId];
                    if (!p) return null;
                    const isSelected = selectedTargetCardId === card.instanceId;
                    const isLocked = !!card.isLocked;
                    return (
                      <div
                        key={card.instanceId}
                        onClick={() => {
                          if (isLocked) return;
                          soundEngine.playButtonClick();
                          setSelectedTargetCardId(card.instanceId);
                        }}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center relative ${
                          isLocked
                            ? 'bg-slate-950/80 border-slate-800/80 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-400/50 cursor-pointer'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        {isLocked && (
                          <span className="absolute top-1 right-1 text-[8px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/60 font-bold flex items-center gap-0.5">
                            🔒 トレード不可
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-cyan-400">{p.rarity} • {p.position}</span>
                        <span className="text-xs font-bold text-white truncate max-w-full">{p.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{p.ovr} OVR</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Offered Card Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-300 block">
                    2. {t('select_offered_card')}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    （ロック中・出品中のカードは非表示）
                  </span>
                </div>

                {availableUserCards.length === 0 ? (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center text-xs text-rose-400">
                    トレードに出せるカードがありません（すべてロック中または出品中です）。
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
                    {availableUserCards.map((card) => {
                      const p = PLAYER_MAP[card.playerId];
                      if (!p) return null;
                      const isSelected = selectedOfferedCardId === card.instanceId;
                      return (
                        <div
                          key={card.instanceId}
                          onClick={() => {
                            soundEngine.playButtonClick();
                            setSelectedOfferedCardId(card.instanceId);
                          }}
                          className={`p-2 rounded-xl border text-center cursor-pointer transition flex flex-col items-center ${
                            isSelected
                              ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/50'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-amber-400">{p.rarity} • {p.position}</span>
                          <span className="text-xs font-bold text-white truncate max-w-full">{p.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">
                            Lv.{card.trainingLv} • {p.ovr} OVR
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {feedback && (
                <div className="p-2.5 rounded-lg text-xs bg-rose-950 border border-rose-600/50 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                type="button"
                disabled={!canTradeToday || !selectedTargetCardId || !selectedOfferedCardId}
                onClick={handleProceedToConfirm}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>{t('trade_confirm_step')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {/* Visual Swap Preview */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-center font-bold text-sm text-white mb-3">
                  {t('confirm_trade_summary')}
                </h4>

                <div className="grid grid-cols-2 gap-3 items-center">
                  {/* Your card to lose */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-rose-800/40 text-center">
                    <span className="text-[10px] text-rose-400 font-bold block mb-1">差出カード</span>
                    <span className="font-bold text-xs text-white block truncate">
                      {offeredPlayerData?.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {offeredPlayerData?.rarity} • {offeredPlayerData?.ovr} OVR
                    </span>
                  </div>

                  {/* Partner card to gain */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-800/40 text-center">
                    <span className="text-[10px] text-emerald-400 font-bold block mb-1">獲得カード</span>
                    <span className="font-bold text-xs text-white block truncate">
                      {targetPlayerData?.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {targetPlayerData?.rarity} • {targetPlayerData?.ovr} OVR
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>トレード成立後は取り消し・キャンセルができません。</span>
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-950 border border-emerald-600/50 text-emerald-300'
                      : 'bg-rose-950 border border-rose-600/50 text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setStep('select');
                  }}
                  className="py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSendPendingRequest}
                  className="py-2.5 rounded-xl font-bold bg-slate-800 border border-cyan-500/60 text-cyan-300 text-xs hover:bg-slate-700 flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>申請送信 (保留)</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTradeImmediate}
                  className="py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs hover:brightness-110 shadow-lg flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>即時交渉＆成立</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

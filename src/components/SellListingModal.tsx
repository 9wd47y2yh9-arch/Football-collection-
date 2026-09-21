import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCard } from '../types';
import { PLAYER_MAP } from '../data/players';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import { Tag, Gavel, X, AlertCircle, CheckCircle, Info, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface SellListingModalProps {
  card: UserCard;
  onListingCreated: (
    cardInstanceId: string,
    type: 'fixed' | 'auction',
    price: number,
    minBid?: number,
    durationDays?: number
  ) => { success: boolean; message: string };
  onClose: () => void;
}

export const SellListingModal: React.FC<SellListingModalProps> = ({
  card,
  onListingCreated,
  onClose,
}) => {
  const { t } = useI18n();
  const player = PLAYER_MAP[card.playerId];
  const [step, setStep] = useState<'configure' | 'confirm'>('configure');
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [priceInput, setPriceInput] = useState<string>(player ? player.basePrice.toLocaleString() : '10,000');
  const [minBidInput, setMinBidInput] = useState<string>(
    player ? Math.floor(player.basePrice * 0.7).toLocaleString() : '7,000'
  );
  const [durationDays, setDurationDays] = useState<number>(7);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!player) return null;

  const numericPrice = Math.floor(Number(priceInput.replace(/,/g, '').trim()) || 0);
  const numericMinBid = Math.floor(Number(minBidInput.replace(/,/g, '').trim()) || 0);

  if (card.isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="font-bold text-white text-base">カードがロックされています</h3>
          <p className="text-xs text-slate-400 mt-1">
            このカードはロックされています。ロックを解除してから出品してください。
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  if (card.isListed) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 text-center">
          <AlertCircle className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
          <h3 className="font-bold text-white text-base">すでに出品中のカードです</h3>
          <p className="text-xs text-slate-400 mt-1">
            このカードはすでに出品されています。二重出品はできません。
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  const estimatedFee = Math.floor(numericPrice * 0.1);
  const estimatedPayout = numericPrice - estimatedFee;

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playButtonClick();
    if (!priceInput.trim()) {
      setFeedback({ type: 'error', message: '価格を入力してください。' });
      return;
    }
    if (numericPrice <= 0) {
      setFeedback({ type: 'error', message: '価格は1MP以上にしてください。' });
      return;
    }
    if (listingType === 'auction') {
      if (!minBidInput.trim() || numericMinBid <= 0) {
        setFeedback({ type: 'error', message: '最低入札価格は1MP以上にしてください。' });
        return;
      }
      if (numericMinBid > numericPrice) {
        setFeedback({ type: 'error', message: '最低入札価格は即決価格以下にしてください。' });
        return;
      }
    }
    setStep('confirm');
  };

  const handleFinalSubmit = () => {
    soundEngine.playButtonClick();
    const res = onListingCreated(
      card.instanceId,
      listingType,
      numericPrice,
      listingType === 'auction' ? numericMinBid : undefined,
      durationDays
    );

    if (res.success) {
      soundEngine.playTradeCompleted();
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.message });
      setStep('configure');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl relative my-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">{t('sell_card_title')}</h3>
              <p className="text-[11px] text-slate-400">「{player.name}」を出品</p>
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

        <AnimatePresence mode="wait">
          {step === 'configure' ? (
            <motion.form
              key="step-config"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleProceedToConfirm}
              noValidate
              className="mt-4 space-y-4"
            >
              {/* Listing Type Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">{t('listing_type')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setListingType('fixed');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      listingType === 'fixed'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span>{t('fixed_price_sale')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setListingType('auction');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      listingType === 'auction'
                        ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Gavel className="w-4 h-4" />
                    <span>{t('auction_bidding')}</span>
                  </button>
                </div>
              </div>

              {/* Price Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {listingType === 'fixed' ? t('sale_price') : t('buyout_price')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 10,000"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-sm font-bold text-cyan-400 shrink-0">MP</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {t('reference_price')}: {player.basePrice.toLocaleString()} MP
                </div>
              </div>

              {/* Min Bid for Auction */}
              {listingType === 'auction' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{t('min_bid_price')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="例: 7,000"
                      value={minBidInput}
                      onChange={(e) => setMinBidInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-sm font-bold text-purple-400 shrink-0">MP</span>
                  </div>
                </div>
              )}

              {/* Listing Duration */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('listing_duration')}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 1, label: t('duration_1day') },
                    { days: 3, label: t('duration_3days') },
                    { days: 7, label: t('duration_7days') },
                  ].map((dur) => (
                    <button
                      key={dur.days}
                      type="button"
                      onClick={() => setDurationDays(dur.days)}
                      className={`p-2 rounded-xl border text-xs font-bold transition text-center ${
                        durationDays === dur.days
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee & Payout Summary */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>システム手数料 (10%):</span>
                  <span className="font-mono text-slate-300">-{estimatedFee.toLocaleString()} MP</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                  <span>売却時受取予定額:</span>
                  <span className="font-mono text-amber-400 text-sm">+{estimatedPayout.toLocaleString()} MP</span>
                </div>
              </div>

              {/* Rules Notice */}
              <div className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  出品中も販売成立まではカードの所有権はお客様に保持されます。販売成立時にMPが支払われ、カードの所有権が購入者に移転します。
                </span>
              </div>

              {feedback && (
                <div className="p-2.5 rounded-lg text-xs bg-rose-950 border border-rose-600/50 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>確認画面へ進む</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="mt-4 space-y-4"
            >
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-center pb-2 border-b border-slate-800">
                  <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
                  <h4 className="font-bold text-white text-sm">{t('confirm_listing_title')}</h4>
                  <p className="text-[11px] text-slate-400">{t('confirm_listing_msg')}</p>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">対象選手:</span>
                  <span className="font-bold text-white">{player.name} ({player.rarity})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{t('listing_type')}:</span>
                  <span className="font-bold text-cyan-300">
                    {listingType === 'fixed' ? t('fixed_price_sale') : t('auction_bidding')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{listingType === 'fixed' ? t('sale_price') : t('buyout_price')}:</span>
                  <span className="font-bold font-mono text-amber-400">{numericPrice.toLocaleString()} MP</span>
                </div>
                {listingType === 'auction' && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{t('min_bid_price')}:</span>
                    <span className="font-bold font-mono text-purple-300">{numericMinBid.toLocaleString()} MP</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{t('listing_duration')}:</span>
                  <span className="font-bold text-slate-200">{durationDays}日間</span>
                </div>
                <div className="flex justify-between py-1 pt-2 border-t border-slate-800 text-white font-bold">
                  <span>売却時受取額:</span>
                  <span className="font-mono text-emerald-400">+{estimatedPayout.toLocaleString()} MP</span>
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

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setStep('configure');
                  }}
                  className="py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs hover:brightness-110 shadow-lg"
                >
                  {t('execute_listing')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

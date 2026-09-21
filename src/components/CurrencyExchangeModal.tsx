import React, { useState } from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../services/audio';
import { ArrowRightLeft, X, Coins, Flame, AlertCircle, CheckCircle } from 'lucide-react';

interface CurrencyExchangeModalProps {
  currentMp: number;
  currentSc: number;
  onExchange: (amountMp: number) => { success: boolean; message: string };
  onClose: () => void;
}

export const CurrencyExchangeModal: React.FC<CurrencyExchangeModalProps> = ({
  currentMp,
  currentSc,
  onExchange,
  onClose,
}) => {
  const [amountMp, setAmountMp] = useState(10000);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const calculatedSc = Math.floor(amountMp / 10000) * 100;
  const canExchange = amountMp >= 10000 && amountMp <= currentMp && amountMp % 10000 === 0;

  const handleExchange = () => {
    soundEngine.playButtonClick();
    const res = onExchange(amountMp);
    if (res.success) {
      soundEngine.playCoinSound();
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAdd = (delta: number) => {
    soundEngine.playButtonClick();
    setAmountMp((prev) => Math.max(10000, Math.min(Math.floor(currentMp / 10000) * 10000, prev + delta)));
  };

  const handleMax = () => {
    soundEngine.playButtonClick();
    const maxAllowed = Math.floor(currentMp / 10000) * 10000;
    setAmountMp(Math.max(10000, maxAllowed));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">通貨交換 (MP → SC)</h3>
              <p className="text-[11px] text-slate-400">交換レート: 10,000 MP ＝ 100 SC</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">所持 MP</span>
            <span className="font-['Teko'] text-xl font-bold text-cyan-300 flex items-center gap-1">
              <Flame className="w-4 h-4 text-cyan-400" />
              {currentMp.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">所持 SC</span>
            <span className="font-['Teko'] text-xl font-bold text-amber-400 flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              {currentSc.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Exchange Calculator Box */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-4">
          <label className="text-xs text-slate-300 font-semibold mb-2 block">消費する MP (10,000 MP 単位)</label>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              step={10000}
              min={10000}
              value={amountMp}
              onChange={(e) => setAmountMp(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-cyan-500"
            />
            <span className="text-sm font-bold text-cyan-400 shrink-0">MP</span>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => handleAdd(10000)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700"
            >
              +10,000
            </button>
            <button
              type="button"
              onClick={() => handleAdd(50000)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700"
            >
              +50,000
            </button>
            <button
              type="button"
              onClick={handleMax}
              className="px-2.5 py-1 text-xs bg-cyan-950/80 hover:bg-cyan-900 rounded-lg text-cyan-300 border border-cyan-700 font-bold"
            >
              最大 (Max)
            </button>
            <button
              type="button"
              onClick={() => setAmountMp(10000)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 border border-slate-700"
            >
              リセット
            </button>
          </div>

          {/* Preview Result */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">獲得予定 SC:</span>
            <span className="font-['Teko'] text-2xl font-bold text-amber-300">
              +{calculatedSc.toLocaleString()} SC
            </span>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-2.5 rounded-lg mb-4 text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-600/50 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-600/50 text-rose-300'
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

        {/* Action Button */}
        <button
          type="button"
          disabled={!canExchange}
          onClick={handleExchange}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-amber-500 text-slate-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{amountMp.toLocaleString()} MP を交換する</span>
        </button>
      </motion.div>
    </div>
  );
};

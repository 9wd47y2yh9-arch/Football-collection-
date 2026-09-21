import React, { useState } from 'react';
import { HistoryRecord } from '../types';
import { soundEngine } from '../services/audio';
import {
  History as HistoryIcon,
  Flame,
  Coins,
  Zap,
  ArrowRightLeft,
  ShoppingBag,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface HistoryViewProps {
  history: HistoryRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredHistory = history.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'scout') return item.type === 'scout';
    if (filterType === 'market') {
      return (
        item.type === 'market_buy' ||
        item.type === 'market_sell' ||
        item.type === 'market_bid' ||
        item.type === 'listing_cancel'
      );
    }
    if (filterType === 'exchange') return item.type === 'exchange';
    if (filterType === 'train') return item.type === 'training' || item.type === 'awakening';
    if (filterType === 'rewards') return item.type === 'login_bonus' || item.type === 'mission_reward';
    return true;
  });

  const getIcon = (type: HistoryRecord['type']) => {
    switch (type) {
      case 'scout':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'market_buy':
      case 'market_sell':
      case 'market_bid':
        return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
      case 'exchange':
        return <ArrowRightLeft className="w-4 h-4 text-indigo-400" />;
      case 'training':
      case 'awakening':
        return <Zap className="w-4 h-4 text-fuchsia-400" />;
      default:
        return <HistoryIcon className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white leading-none">
              取引・活動履歴 (History)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              スカウト・市場取引・通貨交換・育成など全イベントの記録
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800">
          全 {history.length} 件の記録
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {[
          { id: 'all', label: 'すべて' },
          { id: 'scout', label: 'スカウト' },
          { id: 'market', label: '市場・競売' },
          { id: 'exchange', label: '通貨交換' },
          { id: 'train', label: '育成・覚醒' },
          { id: 'rewards', label: '報酬・ログイン' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setFilterType(tab.id);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterType === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 p-6">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">該当する履歴はありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleString('ja-JP', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 sm:p-3.5 flex items-start justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-['Chakra_Petch'] font-bold text-sm text-white truncate">
                        {item.title}
                      </span>
                      {item.rarity && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                          {item.rarity}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5 leading-snug break-words">
                      {item.details}
                    </p>

                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      {dateStr}
                    </span>
                  </div>
                </div>

                {/* Currency Badges */}
                <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-xs">
                  {item.scChange !== undefined && item.scChange !== 0 && (
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        item.scChange > 0 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      {item.scChange > 0 ? `+${item.scChange}` : item.scChange} SC
                    </span>
                  )}

                  {item.mpChange !== undefined && item.mpChange !== 0 && (
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        item.mpChange > 0 ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      {item.mpChange > 0 ? `+${item.mpChange.toLocaleString()}` : item.mpChange.toLocaleString()} MP
                    </span>
                  )}

                  {item.trainingPtChange !== undefined && item.trainingPtChange !== 0 && (
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        item.trainingPtChange > 0 ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {item.trainingPtChange > 0 ? `+${item.trainingPtChange}` : item.trainingPtChange} Pt
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

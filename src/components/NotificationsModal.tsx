import React from 'react';
import { motion } from 'motion/react';
import { GameNotification } from '../types';
import { soundEngine } from '../services/audio';
import { Bell, X, CheckCheck, Trash2, ShoppingBag, Target, Sparkles, Info } from 'lucide-react';

interface NotificationsModalProps {
  notifications: GameNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onMarkRead,
  onClearAll,
  onClose,
}) => {
  const getIcon = (type: GameNotification['type']) => {
    switch (type) {
      case 'market':
        return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
      case 'mission':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'scout':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl relative flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">お知らせ・通知</h3>
              <p className="text-[11px] text-slate-400">取引やミッション達成の速報</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  onClearAll();
                }}
                title="通知をすべて削除"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto my-3 space-y-2 flex-1 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              新しい通知はありません
            </div>
          ) : (
            notifications.map((n) => {
              const dateStr = new Date(n.timestamp).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={`p-3 rounded-2xl border text-xs transition cursor-pointer flex items-start gap-3 ${
                    n.read
                      ? 'bg-slate-950/40 border-slate-900 text-slate-400'
                      : 'bg-slate-950 border-cyan-500/30 text-slate-200'
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-white truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{dateStr}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed break-words text-slate-300">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-xs transition"
        >
          閉じる
        </button>
      </motion.div>
    </div>
  );
};

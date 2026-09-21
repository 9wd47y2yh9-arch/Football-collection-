import React from 'react';
import { motion } from 'motion/react';
import { OnlinePlayer, UserCard } from '../types';
import { PLAYER_MAP } from '../data/players';
import { Card3D } from './Card3D';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import {
  X,
  User,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowRightLeft,
  Sparkles,
  Award,
} from 'lucide-react';

interface PlayerProfileModalProps {
  player: OnlinePlayer;
  onInitiateTrade: (targetPlayer: OnlinePlayer, targetCard?: UserCard) => void;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  onInitiateTrade,
  onClose,
}) => {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto scrollbar-none"
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

        {/* Header Profile Info */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-['Chakra_Petch'] font-black text-2xl shadow-lg shadow-cyan-900/50">
              {player.username.charAt(0).toUpperCase()}
            </div>
            {player.isOnline && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Chakra_Petch'] font-black text-2xl text-white">
                {player.username}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-600 text-cyan-300 text-[10px] font-bold">
                {player.isOnline ? t('online') : t('offline')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              ID: {player.userId} • {t('last_active')}: {player.lastActive}
            </p>
          </div>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('card_count')}</span>
            </div>
            <div className="font-['Teko'] text-2xl font-bold text-white">
              {player.cardCount} <span className="text-xs font-normal text-slate-400">枚</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('total_asset_value')}</span>
            </div>
            <div className="font-['Teko'] text-2xl font-bold text-amber-300">
              {player.totalAssetValue.toLocaleString()} <span className="text-xs font-normal text-slate-400">MP</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('collection_rate')}</span>
            </div>
            <div className="font-['Teko'] text-2xl font-bold text-purple-300">
              {player.collectionProgress}%
            </div>
          </div>
        </div>

        {/* Public Showcase Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-['Chakra_Petch'] font-bold text-sm text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('public_showcase_cards')}</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              タップしてトレード対象に選択
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {player.publicCards.map((card) => {
              const pData = PLAYER_MAP[card.playerId];
              if (!pData) return null;
              const isLocked = !!card.isLocked;
              return (
                <div
                  key={card.instanceId}
                  onClick={() => {
                    if (isLocked) return;
                    soundEngine.playButtonClick();
                    onInitiateTrade(player, card);
                  }}
                  className={`p-2.5 rounded-2xl bg-slate-950 border transition flex flex-col items-center group relative shadow-md ${
                    isLocked
                      ? 'border-slate-800/80 opacity-60 cursor-not-allowed'
                      : 'border-slate-800 hover:border-cyan-500/80 cursor-pointer'
                  }`}
                >
                  <Card3D card={card} player={pData} size="sm" disableFlip />
                  <div className="w-full mt-2 pt-2 border-t border-slate-800 text-center">
                    {isLocked ? (
                      <span className="text-[10px] font-bold text-amber-400/90 flex items-center justify-center gap-1">
                        🔒 トレード不可
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-cyan-400 group-hover:underline flex items-center justify-center gap-1">
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>{t('trade_this_card')}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Trade CTA */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
          >
            {t('close')}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onInitiateTrade(player);
            }}
            className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs shadow-lg shadow-cyan-900/40 hover:brightness-110 flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{t('trade_button')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

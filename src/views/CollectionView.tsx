import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCard, Player } from '../types';
import { PLAYERS_DATABASE } from '../data/players';
import { Card3D } from '../components/Card3D';
import { soundEngine } from '../services/audio';
import { BookOpen, Search, Sparkles, CheckCircle, Lock, Award } from 'lucide-react';

interface CollectionViewProps {
  userCards: UserCard[];
  onSelectOwnedCard: (card: UserCard) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  userCards,
  onSelectOwnedCard,
}) => {
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Set of owned player IDs
  const ownedPlayerIds = new Set(userCards.map((c) => c.playerId));
  const totalUniqueOwned = ownedPlayerIds.size;
  const totalPlayersCount = PLAYERS_DATABASE.length;
  const completionPercentage = Math.round((totalUniqueOwned / totalPlayersCount) * 100);

  const filteredPlayers = PLAYERS_DATABASE.filter((player) => {
    if (selectedRarity !== 'ALL' && player.rarity !== selectedRarity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        player.name.toLowerCase().includes(q) ||
        player.enName.toLowerCase().includes(q) ||
        player.club.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-8 max-w-6xl mx-auto">
      {/* Header & Progress */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white leading-none">
                選手図鑑 (Collection Book)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                全実在選手のコンプリートを目指そう！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">収集進捗率</span>
              <span className="font-['Teko'] text-2xl font-bold text-amber-300 leading-none">
                {totalUniqueOwned} / {totalPlayersCount} 名 ({completionPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/40 p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-slate-400 text-[11px] mr-1">レア度:</span>
          {['ALL', 'SSR', 'SR', 'R', 'N'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setSelectedRarity(r);
              }}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition ${
                selectedRarity === r
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="選手名で絞り込み..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredPlayers.map((player) => {
          const isOwned = ownedPlayerIds.has(player.id);
          const userCardInstance = userCards.find((c) => c.playerId === player.id);

          return (
            <div
              key={player.id}
              className={`rounded-2xl p-2.5 border transition flex flex-col justify-between relative ${
                isOwned
                  ? 'bg-slate-950/80 border-slate-800 hover:border-amber-400/60 shadow-md cursor-pointer'
                  : 'bg-slate-950/40 border-slate-900 opacity-60 grayscale'
              }`}
              onClick={() => {
                if (isOwned && userCardInstance) {
                  soundEngine.playButtonClick();
                  onSelectOwnedCard(userCardInstance);
                }
              }}
            >
              {/* Badge */}
              <div className="flex justify-between items-center mb-1.5">
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                    player.rarity === 'SSR'
                      ? 'bg-yellow-950 text-yellow-300 border-yellow-600'
                      : player.rarity === 'SR'
                      ? 'bg-purple-950 text-purple-300 border-purple-600'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {player.rarity}
                </span>

                {isOwned ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-600/50">
                    <CheckCircle className="w-2.5 h-2.5" /> 所持
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded">
                    <Lock className="w-2.5 h-2.5" /> 未所持
                  </span>
                )}
              </div>

              {/* Center visual representation */}
              <div className="my-auto py-2 text-center">
                <div className="font-['Teko'] text-3xl font-bold text-slate-700/60 leading-none">
                  #{player.number}
                </div>
                <div className="font-['Chakra_Petch'] font-bold text-sm text-white truncate">
                  {player.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{player.club}</div>
              </div>

              {/* Bottom stats */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>OVR: <b className="text-white">{player.ovr}</b></span>
                <span>{player.position}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

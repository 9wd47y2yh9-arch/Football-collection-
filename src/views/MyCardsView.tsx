import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserCard, Rarity } from '../types';
import { PLAYER_MAP } from '../data/players';
import { Card3D } from '../components/Card3D';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import {
  CreditCard,
  Search,
  Sparkles,
  Heart,
  Lock,
  ArrowUpDown,
  Tag,
  Zap,
} from 'lucide-react';

interface MyCardsViewProps {
  profile: UserProfile;
  cards: UserCard[];
  onSelectCard: (card: UserCard) => void;
  onToggleFavorite: (cardInstanceId: string) => void;
  onToggleLock: (cardInstanceId: string) => void;
  onOpenSellModal: (card: UserCard) => void;
}

export const MyCardsView: React.FC<MyCardsViewProps> = ({
  profile,
  cards,
  onSelectCard,
  onToggleFavorite,
  onToggleLock,
  onOpenSellModal,
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterAwakened, setFilterAwakened] = useState(false);
  const [filterLocked, setFilterLocked] = useState(false);
  const [sortBy, setSortBy] = useState<'ovr' | 'level' | 'newest'>('ovr');

  const filteredCards = cards.filter((card) => {
    const player = PLAYER_MAP[card.playerId];
    if (!player) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        player.name.toLowerCase().includes(q) ||
        player.enName.toLowerCase().includes(q) ||
        player.club.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedRarity !== 'ALL' && player.rarity !== selectedRarity) return false;
    if (selectedPosition !== 'ALL' && player.position !== selectedPosition) return false;
    if (filterFavorite && !card.isFavorite) return false;
    if (filterAwakened && !card.isAwakened) return false;
    if (filterLocked && !card.isLocked) return false;

    return true;
  });

  filteredCards.sort((a, b) => {
    const pA = PLAYER_MAP[a.playerId];
    const pB = PLAYER_MAP[b.playerId];
    if (!pA || !pB) return 0;

    if (sortBy === 'ovr') return pB.ovr - pA.ovr;
    if (sortBy === 'level') return b.trainingLv - a.trainingLv;
    return new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime();
  });

  return (
    <div className="space-y-4 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white leading-none">
              {t('my_cards_title')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              カードをタップして表裏詳細・育成・覚醒・市場への直接出品が可能
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400">総所持枚数:</span>
          <span className="font-['Teko'] text-xl font-bold text-cyan-300">
            {cards.length} 枚
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-slate-900/40 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="選手名、所属クラブで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ovr">総合評価(OVR)順</option>
              <option value="level">育成レベル順</option>
              <option value="newest">獲得日順</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
          {/* Rarity */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
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
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setFilterFavorite(!filterFavorite);
              }}
              className={`px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                filterFavorite
                  ? 'bg-rose-950 border-rose-500 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>お気に入り</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setFilterAwakened(!filterAwakened);
              }}
              className={`px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                filterAwakened
                  ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>覚醒済み</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setFilterLocked(!filterLocked);
              }}
              className={`px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                filterLocked
                  ? 'bg-amber-950 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ロック中</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 p-6">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">所持カードがありません</p>
          <p className="text-xs text-slate-500 mt-1">スカウトや市場で新しい選手を獲得しましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredCards.map((card) => {
            const player = PLAYER_MAP[card.playerId];
            if (!player) return null;

            const isLocked = card.isLocked;
            const isListed = card.isListed;

            return (
              <div
                key={card.instanceId}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-2.5 flex flex-col justify-between transition shadow-md group relative"
              >
                {/* 3D Card */}
                <div
                  className="mx-auto my-1 cursor-pointer"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onSelectCard(card);
                  }}
                >
                  <Card3D
                    card={card}
                    player={player}
                    size="sm"
                    showFavoriteButton
                    onToggleFavorite={onToggleFavorite}
                    onToggleLock={onToggleLock}
                  />
                </div>

                {/* Card Quick Action buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onSelectCard(card);
                    }}
                    className="py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-bold flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>育成</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLocked || isListed}
                    onClick={() => {
                      soundEngine.playButtonClick();
                      onOpenSellModal(card);
                    }}
                    className={`py-1 rounded-lg border font-semibold flex items-center justify-center gap-1 transition ${
                      isLocked || isListed
                        ? 'opacity-40 bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                    title={
                      isLocked
                        ? 'ロック中のため出品不可'
                        : isListed
                        ? '出品中'
                        : 'マーケットに出品'
                    }
                  >
                    <Tag className="w-3 h-3 text-cyan-400" />
                    <span>{isListed ? '出品中' : isLocked ? 'ロック' : '出品'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

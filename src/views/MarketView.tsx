import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, MarketListing, Rarity, Position } from '../types';
import { Card3D } from '../components/Card3D';
import { soundEngine } from '../services/audio';
import {
  ShoppingBag,
  Search,
  Filter,
  Flame,
  ArrowUpDown,
  Tag,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface MarketViewProps {
  profile: UserProfile;
  listings: MarketListing[];
  onBuyListing: (listingId: string) => { success: boolean; message: string };
  onCancelListing: (listingId: string) => { success: boolean; message: string };
  onMarkMarketViewed: () => void;
  onSelectListingCard: (listing: MarketListing) => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  profile,
  listings,
  onBuyListing,
  onCancelListing,
  onMarkMarketViewed,
  onSelectListingCard,
}) => {
  // Trigger daily mission on mount
  useEffect(() => {
    onMarkMarketViewed();
  }, [onMarkMarketViewed]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'ovr_desc' | 'newest'>('price_asc');

  // Confirmation modal
  const [selectedForBuy, setSelectedForBuy] = useState<MarketListing | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter listings
  const activeListings = listings.filter((l) => !l.isSold && !l.isCancelled && l.type === 'fixed');

  const filteredListings = activeListings.filter((l) => {
    const p = l.player;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.enName.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.nationality.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRarity !== 'ALL' && p.rarity !== selectedRarity) return false;
    if (selectedPosition !== 'ALL' && p.position !== selectedPosition) return false;
    return true;
  });

  // Sort listings
  filteredListings.sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'ovr_desc') return b.player.ovr - a.player.ovr;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleConfirmBuy = () => {
    if (!selectedForBuy) return;
    soundEngine.playButtonClick();

    const res = onBuyListing(selectedForBuy.id);
    if (res.success) {
      soundEngine.playMarketSuccess();
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setSelectedForBuy(null);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCancel = (listingId: string) => {
    soundEngine.playButtonClick();
    const res = onCancelListing(listingId);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white leading-none">
                カード市場 (Marketplace)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                全国のオーナーが出品したカードをMPで直接購入できます。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800 shrink-0">
          <Flame className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400">所持MP:</span>
          <span className="font-['Teko'] text-xl font-bold text-cyan-300">
            {profile.mp.toLocaleString()} MP
          </span>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
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

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/40 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="選手名、所属クラブ、国籍で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-2xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="price_asc">価格が安い順</option>
              <option value="price_desc">価格が高い順</option>
              <option value="ovr_desc">OVRが高い順</option>
              <option value="newest">新着順</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
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

          {/* Position */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <span className="text-slate-400 text-[11px] mr-1">ポジション:</span>
            {['ALL', 'CF', 'RWG', 'LWG', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'].map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setSelectedPosition(pos);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                  selectedPosition === pos
                    ? 'bg-slate-200 text-slate-950'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 p-6">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">条件に一致する出品カードはありません</p>
          <p className="text-xs text-slate-500 mt-1">フィルター条件を変更するか、マイカードから出品してみましょう。</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredListings.map((listing) => {
            const isOwn = listing.sellerId === profile.user_id;
            const canAfford = profile.mp >= listing.price;

            return (
              <div
                key={listing.id}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-2.5 flex flex-col justify-between transition shadow-md group relative"
              >
                {/* 3D Card preview */}
                <div
                  className="mx-auto my-1 cursor-pointer"
                  onClick={() => onSelectListingCard(listing)}
                >
                  <Card3D card={listing.cardInstance} player={listing.player} size="sm" />
                </div>

                {/* Seller & Price Info */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="truncate max-w-[90px]">{listing.sellerName}</span>
                    <span className="text-slate-500">Lv.{listing.cardInstance.trainingLv}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-['Teko'] text-lg font-bold text-amber-300 leading-none">
                      <Flame className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{listing.price.toLocaleString()} MP</span>
                    </div>

                    {isOwn ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(listing.id)}
                        className="px-2 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 text-[10px] font-bold"
                      >
                        取消
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          setSelectedForBuy(listing);
                        }}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition shadow-sm ${
                          canAfford
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        購入
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Buy Confirmation Modal */}
      <AnimatePresence>
        {selectedForBuy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">購入確認</h3>
                <button
                  type="button"
                  onClick={() => setSelectedForBuy(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 text-center">
                <div className="inline-block mx-auto mb-2">
                  <Card3D card={selectedForBuy.cardInstance} player={selectedForBuy.player} size="sm" />
                </div>
                <div className="font-bold text-white text-base mt-2">
                  {selectedForBuy.player.name}
                </div>
                <div className="text-xs text-slate-400">
                  出品者: {selectedForBuy.sellerName}
                </div>

                <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">購入金額:</span>
                  <span className="font-['Teko'] text-2xl font-bold text-amber-300">
                    {selectedForBuy.price.toLocaleString()} MP
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedForBuy(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBuy}
                  disabled={profile.mp < selectedForBuy.price}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 text-xs shadow-md"
                >
                  購入を確定する
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, MarketListing } from '../types';
import { Card3D } from '../components/Card3D';
import { soundEngine } from '../services/audio';
import {
  Gavel,
  Flame,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle,
  X,
  History,
  TrendingUp,
} from 'lucide-react';

interface AuctionViewProps {
  profile: UserProfile;
  listings: MarketListing[];
  onPlaceBid: (listingId: string, amount: number) => { success: boolean; message: string };
  onMarkAuctionViewed: () => void;
  onSelectListingCard: (listing: MarketListing) => void;
}

export const AuctionView: React.FC<AuctionViewProps> = ({
  profile,
  listings,
  onPlaceBid,
  onMarkAuctionViewed,
  onSelectListingCard,
}) => {
  // Trigger daily mission on mount
  useEffect(() => {
    onMarkAuctionViewed();
  }, [onMarkAuctionViewed]);

  const [selectedAuction, setSelectedAuction] = useState<MarketListing | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Daily bid count
  const dailyBidsStr = localStorage.getItem('fc_daily_bids_count') || '0';
  const dailyBidsCount = parseInt(dailyBidsStr, 10);

  const auctionListings = listings.filter((l) => !l.isSold && !l.isCancelled && l.type === 'auction');

  const handleOpenBid = (listing: MarketListing) => {
    soundEngine.playButtonClick();
    setSelectedAuction(listing);
    const min = listing.currentBid ? Math.floor(listing.currentBid * 1.05) : (listing.minBid || listing.price);
    setBidAmount(min);
    setFeedback(null);
  };

  const handleExecuteBid = () => {
    if (!selectedAuction) return;
    soundEngine.playButtonClick();

    const res = onPlaceBid(selectedAuction.id, bidAmount);
    if (res.success) {
      soundEngine.playMarketSuccess();
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setSelectedAuction(null);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-400">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white leading-none">
              オークション競売所
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              レア選手カードの入札バトル！1日最大2件まで入札できます。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <span>本日の入札可能残数:</span>
            <span className="font-bold text-amber-400 font-mono text-sm">
              {Math.max(0, 2 - dailyBidsCount)} / 2 回
            </span>
          </div>

          <div className="bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span className="font-['Teko'] text-xl font-bold text-cyan-300">
              {profile.mp.toLocaleString()} MP
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* Auction Grid */}
      {auctionListings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 p-6">
          <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">現在開催中のオークションはありません</p>
          <p className="text-xs text-slate-500 mt-1">マイカードからカードをオークション出品できます。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctionListings.map((listing) => {
            const isHighest = listing.highestBidderId === profile.user_id;
            const currentAmount = listing.currentBid || listing.price;
            const minNextBid = Math.floor(currentAmount * 1.05);

            return (
              <div
                key={listing.id}
                className="bg-slate-950/90 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-purple-500/50 transition shadow-lg relative overflow-hidden"
              >
                {/* Status banner */}
                {isHighest && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                    <UserCheck className="w-3 h-3" />
                    <span>あなたが最高入札者</span>
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  <div
                    className="cursor-pointer shrink-0"
                    onClick={() => onSelectListingCard(listing)}
                  >
                    <Card3D card={listing.cardInstance} player={listing.player} size="sm" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                      競売中
                    </span>
                    <h3 className="font-['Chakra_Petch'] font-bold text-base text-white truncate">
                      {listing.player.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 truncate">
                      出品者: {listing.sellerName}
                    </div>

                    <div className="pt-2 text-xs space-y-0.5">
                      <div className="text-slate-400">現在価格:</div>
                      <div className="font-['Teko'] text-2xl font-bold text-amber-300 flex items-center gap-1">
                        <Flame className="w-4 h-4 text-cyan-400" />
                        {currentAmount.toLocaleString()} MP
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>入札数: {listing.bidCount}件</span>
                  </div>

                  <button
                    type="button"
                    disabled={dailyBidsCount >= 2 || isHighest}
                    onClick={() => handleOpenBid(listing)}
                    className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-40 hover:brightness-110 transition shadow-md"
                  >
                    {isHighest ? '最高入札中' : '入札する'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bid Modal */}
      <AnimatePresence>
        {selectedAuction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-purple-400" />
                  <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">オークション入札</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAuction(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 space-y-3">
                <div className="text-center">
                  <h4 className="font-bold text-lg text-white">{selectedAuction.player.name}</h4>
                  <p className="text-xs text-slate-400">
                    現在価格: {(selectedAuction.currentBid || selectedAuction.price).toLocaleString()} MP
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">入札金額 (MP)</label>
                  <input
                    type="number"
                    step={1000}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg font-bold focus:outline-none focus:border-purple-500"
                  />

                  {/* Quick Delta Buttons */}
                  <div className="flex gap-1.5 pt-1">
                    {[1000, 5000, 10000].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setBidAmount((prev) => prev + inc)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                      >
                        +{inc.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notice */}
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  ※入札完了時にMPの引き落としは行われず、落札確定時に決済されます。1日の入札上限は2件です。
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuction(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBid}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs shadow-md hover:brightness-110"
                >
                  入札を送信する
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

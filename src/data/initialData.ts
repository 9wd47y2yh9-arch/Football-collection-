import { DailyMission, SeasonMission, MarketListing, UserCard } from '../types';
import { PLAYERS_DATABASE } from './players';

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'daily-scout-1',
    title: 'スカウトを1回引こう',
    point: 40,
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'daily-auction-view-1',
    title: 'オークションを確認しよう',
    point: 40,
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'daily-auction-trade-1',
    title: 'オークション取引を1回しよう',
    point: 40,
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'daily-market-view-1',
    title: '市場を確認しよう',
    point: 40,
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'daily-market-trade-1',
    title: '市場取引をしよう',
    point: 40,
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'daily-spend-sc-1',
    title: 'スーペルコインを消費しよう',
    point: 40,
    target: 50,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'daily-spend-mp-1',
    title: 'マーケットポイントを消費しよう',
    point: 40,
    target: 2000,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'daily-train-1',
    title: '育成を1回する',
    point: 40,
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    date: new Date().toISOString().split('T')[0],
  },
];

export const INITIAL_SEASON_MISSIONS: SeasonMission[] = [
  {
    id: 'season-train-150',
    title: '育成を150回しよう',
    rewardDesc: 'Training Pt 300',
    rewardType: 'trainingPt',
    rewardAmount: 300,
    target: 150,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    month: new Date().toISOString().slice(0, 7),
  },
  {
    id: 'season-collection',
    title: 'カードコレクションを進めよう（20枚所持）',
    rewardDesc: '1,000 SC',
    rewardType: 'sc',
    rewardAmount: 1000,
    target: 20,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    month: new Date().toISOString().slice(0, 7),
  },
  {
    id: 'season-ssr-pity',
    title: 'SSR確定条件を達成しよう',
    rewardDesc: '9,000 SC',
    rewardType: 'sc',
    rewardAmount: 9000,
    target: 1,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    month: new Date().toISOString().slice(0, 7),
  },
  {
    id: 'season-market-10',
    title: 'マーケット取引を10回しよう',
    rewardDesc: '10,000 MP',
    rewardType: 'mp',
    rewardAmount: 10000,
    target: 10,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    month: new Date().toISOString().slice(0, 7),
  },
  {
    id: 'season-bid-10',
    title: 'マーケットで10回入札しよう',
    rewardDesc: '1,000,000 MP',
    rewardType: 'mp',
    rewardAmount: 1000000,
    target: 10,
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    month: new Date().toISOString().slice(0, 7),
  },
];

export function generateSeedMarketListings(): MarketListing[] {
  const seedPlayers = [
    { pId: 'p-osako-10', type: 'fixed' as const, price: 64000, seller: 'ヴィッセルサポーター#92', lv: 3 },
    { pId: 'p-muto-11', type: 'auction' as const, price: 58000, minBid: 45000, currentBid: 49000, seller: '神戸の牛男', lv: 2 },
    { pId: 'p-kubo-14', type: 'fixed' as const, price: 165000, seller: 'TxuriUrdin_JP', lv: 5 },
    { pId: 'p-mitoma-22', type: 'auction' as const, price: 180000, minBid: 140000, currentBid: 155000, seller: 'シーガルズファン', lv: 4 },
    { pId: 'p-sakai-24', type: 'fixed' as const, price: 15800, seller: 'ノエスタの住人', lv: 1 },
    { pId: 'p-usami-07', type: 'fixed' as const, price: 17500, seller: 'ガンバ大阪魂', lv: 3 },
    { pId: 'p-soma-07', type: 'auction' as const, price: 19000, minBid: 14000, currentBid: 16000, seller: '町田共鳴', lv: 2 },
    { pId: 'p-erik-09', type: 'fixed' as const, price: 3400, seller: '野津田の風', lv: 1 },
    { pId: 'p-kobayashi-11', type: 'fixed' as const, price: 3100, seller: '等々力フロント', lv: 1 },
    { pId: 'p-yamal-19', type: 'auction' as const, price: 190000, minBid: 150000, currentBid: 168000, seller: 'Culés_Tokyo', lv: 4 },
    { pId: 'p-suzuki-40', type: 'fixed' as const, price: 50500, seller: '鹿嶋のアント', lv: 2 },
  ];

  const now = Date.now();
  const listings: MarketListing[] = [];

  seedPlayers.forEach((item, idx) => {
    const player = PLAYERS_DATABASE.find((p) => p.id === item.pId);
    if (!player) return;

    const dummyCard: UserCard = {
      instanceId: `seed-card-${idx + 1}`,
      playerId: player.id,
      serialNumber: player.rarity === 'SSR' ? 120 + idx : undefined,
      cardIdDisplay: `${player.rarity}-${player.position}-${String(200 + idx).padStart(4, '0')}`,
      acquiredAt: new Date(now - (idx + 1) * 3600000 * 5).toISOString(),
      trainingLv: item.lv,
      isAwakened: item.lv >= 10,
      isFavorite: false,
    };

    listings.push({
      id: `seed-listing-${idx + 1}`,
      sellerId: `system-seller-${idx + 1}`,
      sellerName: item.seller,
      cardInstance: dummyCard,
      player,
      type: item.type,
      price: item.price,
      minBid: item.minBid,
      currentBid: item.currentBid,
      highestBidderId: item.type === 'auction' ? `bidder-fan-${idx}` : undefined,
      highestBidderName: item.type === 'auction' ? `フットボール探究者#${idx + 3}` : undefined,
      bidCount: item.type === 'auction' ? 3 : 0,
      bids: item.type === 'auction' ? [
        {
          bidderId: `bidder-fan-${idx}`,
          bidderName: `フットボール探究者#${idx + 3}`,
          amount: item.currentBid || item.price,
          timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
        }
      ] : [],
      createdAt: new Date(now - 3600000 * 8).toISOString(),
      expiresAt: new Date(now + 3600000 * 24 * (7 - (idx % 3))).toISOString(),
      isSold: false,
      isCancelled: false,
    });
  });

  return listings;
}

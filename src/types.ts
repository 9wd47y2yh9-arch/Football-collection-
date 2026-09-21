export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export type Position = 
  | 'GK' 
  | 'CB' 
  | 'LB' 
  | 'RB' 
  | 'LWB'
  | 'RWB'
  | 'DMF' 
  | 'CMF' 
  | 'LM'
  | 'RM'
  | 'AMF' 
  | 'LWG' 
  | 'RWG' 
  | 'CF' 
  | 'ST'
  | 'SS';

export interface Player {
  id: string;
  name: string;
  kanaName: string;
  enName: string;
  jaName?: string;
  esName?: string;
  club: string;
  league: string;
  nationality: string;
  position: Position;
  number: number;
  ovr: number;
  rarity: Rarity;
  age: number;
  height: number;
  foot: '右' | '左' | '両足';
  careerBio: string;
  baseIssueCount: number;
  remainingIssueCount: number;
  basePrice: number;
  priceHistory: { date: string; price: number }[];
  status?: 'active' | 'retired' | 'legend';
  isCardEligible?: boolean;
  isRegularCard?: boolean;
  isLegendPool?: boolean;
}

export interface UserCard {
  instanceId: string;
  playerId: string;
  serialNumber?: number; // Unique serial for SSR, e.g., 42 (out of 2000)
  cardIdDisplay: string; // e.g., "SSR-M10-0042" or "SR-K14-1892"
  acquiredAt: string;
  trainingLv: number; // 1 to 10
  isAwakened: boolean;
  isFavorite: boolean;
  isLocked?: boolean;
  isListed?: boolean;
  listingId?: string;
  isInTrade?: boolean;
  ownerId?: string;
  ownerName?: string;
}

export interface NotificationSettings {
  cardSold: boolean;
  outbid: boolean;
  marketCompleted: boolean;
  missionAchieved: boolean;
  eventNews: boolean;
}

export interface AudioSettings {
  bgmEnabled: boolean;
  bgmVolume: number; // 0 to 1
  seEnabled: boolean;
  seVolume: number; // 0 to 1
  selectedTrack: string;
  currentTrackIndex: number;
}

export interface UserProfile {
  user_id: string;
  username: string;
  birthdate: string;
  age?: number;
  sc: number; // Super Coins
  mp: number; // Market Points
  trainingPt: number;
  isFreeTenPullClaimed: boolean;
  pityCountNormal: number; // SSR pity ceiling: 150
  pityCountHalf: number;
  pityCountPremium: number;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  notesAccepted: boolean;
  tutorialCompleted: boolean;
  notificationSettings: NotificationSettings;
  audioSettings: AudioSettings;
  language: 'ja' | 'en' | 'es';
  lastLoginDate: string;
  loginStreak: number;
  createdAt: string;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  cardInstance: UserCard;
  player: Player;
  type: 'fixed' | 'auction';
  price: number; // Fixed price or Buyout price
  minBid?: number;
  currentBid?: number;
  highestBidderId?: string;
  highestBidderName?: string;
  bidCount: number;
  bids: {
    bidderId: string;
    bidderName: string;
    amount: number;
    timestamp: string;
  }[];
  createdAt: string;
  expiresAt: string;
  isSold: boolean;
  isCancelled: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  point: number; // 40
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  date: string;
}

export interface SeasonMission {
  id: string;
  title: string;
  rewardDesc: string;
  rewardType: 'trainingPt' | 'sc' | 'mp';
  rewardAmount: number;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  month: string;
}

export interface HistoryRecord {
  id: string;
  type: 
    | 'scout' 
    | 'market_buy' 
    | 'market_sell' 
    | 'market_bid' 
    | 'exchange' 
    | 'training' 
    | 'awakening' 
    | 'mission_reward' 
    | 'login_bonus' 
    | 'listing_cancel';
  title: string;
  details: string;
  scChange?: number;
  mpChange?: number;
  trainingPtChange?: number;
  cardName?: string;
  rarity?: Rarity;
  timestamp: string;
}

export interface GameNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'market' | 'mission' | 'scout' | 'warning';
  read: boolean;
  timestamp: string;
}

export interface ScoutBanner {
  id: 'normal' | 'half' | 'premium' | 'legend';
  name: string;
  subTitle?: string;
  badge?: string;
  description?: string;
  costSingle?: number;
  costTen?: number;
  costFifty?: number;
  price1?: number;
  price10?: number;
  price50?: number;
  ssrRate: number; // 0.03, 0.06, 0.08
  pityTarget?: number;
  bannerBg?: string;
  accentColor?: string;
}

export type FormationType = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '3-4-3';

export interface FormationSlot {
  slotId: string;
  position: Position;
  x: number; // 0 to 100 percentage from left of pitch
  y: number; // 0 to 100 percentage from top (attack) to bottom (GK)
  label: string;
}

export interface MyTeam {
  formation: FormationType;
  starters: Record<string, string>; // slotId -> userCard instanceId
  subs: string[]; // array of userCard instanceIds (up to 7 subs)
  teamName: string;
  teamOvr: number;
  chemistry: number;
  updatedAt: string;
}

export interface OnlinePlayer {
  userId: string;
  username: string;
  isOnline: boolean;
  lastActive: string;
  cardCount: number;
  totalAssetValue: number;
  collectionProgress: number; // 0 to 100 percentage
  favoritePlayerName?: string;
  publicCards: UserCard[];
}

export type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface TradeRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  offeredCard: UserCard;
  requestedCard: UserCard;
  status: TradeStatus;
  createdAt: string;
  completedAt?: string;
  rejectedReason?: string;
}

export interface SavedAccountSummary {
  user_id: string;
  username: string;
  birthdate: string;
  cardCount: number;
  sc: number;
  mp: number;
  lastLoginDate: string;
}

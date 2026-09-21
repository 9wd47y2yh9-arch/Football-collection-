import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  UserCard,
  MarketListing,
  DailyMission,
  SeasonMission,
  HistoryRecord,
  GameNotification,
  Player,
  Rarity,
  OnlinePlayer,
  TradeRequest,
  SavedAccountSummary,
  MyTeam,
  FormationType,
} from '../types';
import { PLAYERS_DATABASE, LEGEND_PLAYERS_DATABASE, PLAYER_MAP, ALL_PLAYERS_DATABASE } from '../data/players';
import { INITIAL_DAILY_MISSIONS, INITIAL_SEASON_MISSIONS, generateSeedMarketListings } from '../data/initialData';
import { setAppLanguage, SupportedLanguage } from './i18n';
import { FORMATIONS, calculateTeamStats } from '../utils/formation';

// Supabase client initialization (optional env vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Supabase initialization warning:', err);
  }
}

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'fc_current_user_id',
  LEGACY_USER_ID: 'fc_user_id',
  ACCOUNTS_INDEX: 'fc_accounts_index',
  PROFILE_PREFIX: 'fc_user_profile_',
  CARDS_PREFIX: 'fc_user_cards_',
  MARKET_PREFIX: 'fc_market_listings_',
  DAILY_MISSIONS_PREFIX: 'fc_daily_missions_',
  SEASON_MISSIONS_PREFIX: 'fc_season_missions_',
  MISSION_POINTS_PREFIX: 'fc_mission_points_',
  HISTORY_PREFIX: 'fc_history_logs_',
  NOTIFICATIONS_PREFIX: 'fc_notifications_',
  LAST_LOGIN_DAY_PREFIX: 'fc_last_login_day_',
  DAILY_TRADES_PREFIX: 'fc_daily_trades_',
  TRADES_PREFIX: 'fc_trade_requests_',
  MY_TEAM_PREFIX: 'fc_my_team_',
  SERIAL_COUNTER: 'fc_ssr_serials',
};

// Seed online community players
function generateSeedOnlinePlayers(): OnlinePlayer[] {
  const sampleCards: UserCard[] = [
    {
      instanceId: 'bot-c1',
      playerId: 'p-haaland-09',
      serialNumber: 42,
      cardIdDisplay: 'SSR-CF-0042',
      acquiredAt: '2026-09-18T10:00:00Z',
      trainingLv: 8,
      isAwakened: true,
      isFavorite: true,
      isLocked: false,
    },
    {
      instanceId: 'bot-c2',
      playerId: 'p-yamal-19',
      serialNumber: 119,
      cardIdDisplay: 'SSR-RWG-0119',
      acquiredAt: '2026-09-19T14:30:00Z',
      trainingLv: 7,
      isAwakened: false,
      isFavorite: true,
      isLocked: false,
    },
    {
      instanceId: 'bot-c3',
      playerId: 'p-vinicius-07',
      serialNumber: 88,
      cardIdDisplay: 'SSR-LWG-0088',
      acquiredAt: '2026-09-15T09:12:00Z',
      trainingLv: 10,
      isAwakened: true,
      isFavorite: true,
      isLocked: false,
    },
    {
      instanceId: 'bot-c4',
      playerId: 'p-rodri-16',
      serialNumber: 15,
      cardIdDisplay: 'SSR-DMF-0015',
      acquiredAt: '2026-09-16T18:40:00Z',
      trainingLv: 6,
      isAwakened: false,
      isFavorite: false,
      isLocked: false,
    },
    {
      instanceId: 'bot-c5',
      playerId: 'p-bellingham-05',
      serialNumber: 77,
      cardIdDisplay: 'SSR-AMF-0077',
      acquiredAt: '2026-09-17T20:10:00Z',
      trainingLv: 9,
      isAwakened: true,
      isFavorite: true,
      isLocked: false,
    },
    {
      instanceId: 'bot-c6',
      playerId: 'p-foden-47',
      serialNumber: 93,
      cardIdDisplay: 'SSR-RWG-0093',
      acquiredAt: '2026-09-20T12:00:00Z',
      trainingLv: 5,
      isAwakened: false,
      isFavorite: false,
      isLocked: false,
    },
    {
      instanceId: 'bot-c7',
      playerId: 'p-alisson-01',
      serialNumber: 33,
      cardIdDisplay: 'SSR-GK-0033',
      acquiredAt: '2026-09-18T16:22:00Z',
      trainingLv: 7,
      isAwakened: false,
      isFavorite: false,
      isLocked: false,
    },
    {
      instanceId: 'bot-c8',
      playerId: 'p-rice-41',
      serialNumber: 62,
      cardIdDisplay: 'SSR-DMF-0062',
      acquiredAt: '2026-09-19T22:15:00Z',
      trainingLv: 8,
      isAwakened: true,
      isFavorite: true,
      isLocked: false,
    },
  ];

  return [
    {
      userId: 'online-striker-tokyo',
      username: 'TokyoStriker_99',
      isOnline: true,
      lastActive: 'たった今',
      cardCount: 48,
      totalAssetValue: 2450000,
      collectionProgress: 42,
      favoritePlayerName: 'アーリング・ハーランド',
      publicCards: [sampleCards[0], sampleCards[1]],
    },
    {
      userId: 'online-madridista-pro',
      username: 'Galactico_Rey',
      isOnline: true,
      lastActive: '1分前',
      cardCount: 65,
      totalAssetValue: 3890000,
      collectionProgress: 56,
      favoritePlayerName: 'ヴィニシウス Jr.',
      publicCards: [sampleCards[2], sampleCards[4]],
    },
    {
      userId: 'online-samurai-blue',
      username: 'SamuraiMaster_JP',
      isOnline: true,
      lastActive: '3分前',
      cardCount: 34,
      totalAssetValue: 1820000,
      collectionProgress: 31,
      favoritePlayerName: '久保建英',
      publicCards: [sampleCards[5], sampleCards[7]],
    },
    {
      userId: 'online-premier-king',
      username: 'Anfield_Red',
      isOnline: true,
      lastActive: 'たった今',
      cardCount: 52,
      totalAssetValue: 2980000,
      collectionProgress: 47,
      favoritePlayerName: 'モハメド・サラー',
      publicCards: [sampleCards[3], sampleCards[6]],
    },
    {
      userId: 'online-blaugrana-ace',
      username: 'CampNou_Dream',
      isOnline: false,
      lastActive: '12分前',
      cardCount: 29,
      totalAssetValue: 1450000,
      collectionProgress: 26,
      favoritePlayerName: 'ラミン・ヤマル',
      publicCards: [sampleCards[1]],
    },
  ];
}

export class GameStorageService {
  private currentUserId = '';
  private profile: UserProfile | null = null;
  private userCards: UserCard[] = [];
  private marketListings: MarketListing[] = [];
  private dailyMissions: DailyMission[] = [];
  private seasonMissions: SeasonMission[] = [];
  private history: HistoryRecord[] = [];
  private notifications: GameNotification[] = [];
  private missionPoints = 0;
  private tradeRequests: TradeRequest[] = [];
  private myTeam: MyTeam | null = null;
  private isInitialized = false;

  private onlinePlayers: OnlinePlayer[] = generateSeedOnlinePlayers();

  public async initialize(): Promise<{ isFirstTime: boolean; profile: UserProfile }> {
    // Check current active user ID (or migrate legacy single user)
    let activeId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!activeId) {
      activeId = localStorage.getItem(STORAGE_KEYS.LEGACY_USER_ID);
      if (activeId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, activeId);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);
    let isFirstTime = false;

    if (!activeId) {
      // First time user registration
      isFirstTime = true;
      activeId = 'fc_user_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, activeId);

      this.currentUserId = activeId;
      this.profile = this.createDefaultProfile(activeId, 'FCストライカー', '2000-01-01');

      // Initial card gift: 3 friendly starter cards with verified real players
      const initP1 = PLAYERS_DATABASE.find((p) => p.position === 'CF') || PLAYERS_DATABASE[0];
      const initP2 = PLAYERS_DATABASE.find((p) => p.position === 'CMF') || PLAYERS_DATABASE[1];
      const initP3 = PLAYERS_DATABASE.find((p) => p.position === 'CB') || PLAYERS_DATABASE[2];

      this.userCards = [
        this.createCardInstance(initP1.id),
        this.createCardInstance(initP2.id),
        this.createCardInstance(initP3.id),
      ];

      this.marketListings = generateSeedMarketListings();
      this.dailyMissions = INITIAL_DAILY_MISSIONS.map((m) => ({ ...m, date: today }));
      this.seasonMissions = INITIAL_SEASON_MISSIONS.map((m) => ({ ...m, month: currentMonth }));
      this.history = [
        {
          id: 'hist-init-1',
          type: 'login_bonus',
          title: 'ゲーム開始記念ボーナス',
          details: '新規ユーザー特典: 1,000 SC、30,000 MP、初期カード3枚を配布しました。',
          scChange: 1000,
          mpChange: 30000,
          timestamp: new Date().toISOString(),
        },
      ];
      this.notifications = [
        {
          id: 'notif-welcome',
          title: 'FOOTBALL COLLECTIONへようこそ！',
          message: '新規登録ボーナスとして1,000 SC・30,000 MP・リリース記念無料10連（SSR確定）がプレゼントされました！',
          type: 'info',
          read: false,
          timestamp: new Date().toISOString(),
        },
      ];
      this.missionPoints = 0;

      this.saveAll();
      this.updateAccountsIndex();
    } else {
      this.currentUserId = activeId;
      this.loadAll();

      if (!this.profile) {
        this.profile = this.createDefaultProfile(activeId, 'FCストライカー', '2000-01-01');
      }

      // Check daily reset
      const lastLoginDay = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_DAY_PREFIX + this.currentUserId);
      if (lastLoginDay !== today) {
        // New day! Reset daily missions
        this.dailyMissions = INITIAL_DAILY_MISSIONS.map((m) => ({ ...m, date: today }));
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_DAY_PREFIX + this.currentUserId, today);
        localStorage.setItem(STORAGE_KEYS.DAILY_TRADES_PREFIX + this.currentUserId + '_' + today, '0');

        // Login streak
        const prev = new Date(this.profile.lastLoginDate || today);
        const curr = new Date(today);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          this.profile.loginStreak = (this.profile.loginStreak % 7) + 1;
        } else if (diffDays > 1) {
          this.profile.loginStreak = 1;
        }
        this.profile.lastLoginDate = today;

        this.addLoginBonus(this.profile.loginStreak);
      }

      // Check season reset
      if (this.seasonMissions.length === 0 || this.seasonMissions[0].month !== currentMonth) {
        this.seasonMissions = INITIAL_SEASON_MISSIONS.map((m) => ({ ...m, month: currentMonth }));
      }

      this.saveAll();
      this.updateAccountsIndex();
    }

    if (this.profile?.language) {
      setAppLanguage(this.profile.language);
    }

    this.syncWithSupabase().catch(() => {});
    this.isInitialized = true;
    return { isFirstTime, profile: this.profile! };
  }

  private createDefaultProfile(userId: string, username: string, birthdate: string): UserProfile {
    const today = new Date().toISOString().split('T')[0];
    return {
      user_id: userId,
      username: username || 'FCストライカー',
      birthdate: birthdate || '2000-01-01',
      age: 24,
      sc: 1000,
      mp: 30000,
      trainingPt: 50,
      isFreeTenPullClaimed: false,
      pityCountNormal: 0,
      pityCountHalf: 0,
      pityCountPremium: 0,
      termsAccepted: false,
      privacyAccepted: false,
      notesAccepted: false,
      tutorialCompleted: false,
      notificationSettings: {
        cardSold: true,
        outbid: true,
        marketCompleted: true,
        missionAchieved: true,
        eventNews: true,
      },
      audioSettings: {
        bgmEnabled: true,
        bgmVolume: 0.5,
        seEnabled: true,
        seVolume: 0.7,
        selectedTrack: 'bgm1',
        currentTrackIndex: 0,
      },
      language: 'ja',
      lastLoginDate: today,
      loginStreak: 1,
      createdAt: new Date().toISOString(),
    };
  }

  // --- Getters ---
  public getProfile(): UserProfile {
    return this.profile!;
  }

  public getUserCards(): UserCard[] {
    return [...this.userCards];
  }

  public getMarketListings(): MarketListing[] {
    return [...this.marketListings];
  }

  public getDailyMissions(): DailyMission[] {
    return [...this.dailyMissions];
  }

  public getSeasonMissions(): SeasonMission[] {
    return [...this.seasonMissions];
  }

  public getMissionPoints(): number {
    return this.missionPoints;
  }

  public getHistory(): HistoryRecord[] {
    return [...this.history];
  }

  public getNotifications(): GameNotification[] {
    return [...this.notifications];
  }

  // --- Online Players & Trade System ---
  public getOnlinePlayers(): OnlinePlayer[] {
    // Exclude current user from community list
    return this.onlinePlayers.filter((p) => p.userId !== this.currentUserId);
  }

  public getPlayerProfile(userId: string): OnlinePlayer | null {
    return this.onlinePlayers.find((p) => p.userId === userId) || null;
  }

  public getDailyTradesCompleted(): number {
    const today = new Date().toISOString().split('T')[0];
    const key = STORAGE_KEYS.DAILY_TRADES_PREFIX + this.currentUserId + '_' + today;
    const str = localStorage.getItem(key) || '0';
    return parseInt(str, 10);
  }

  public canTradeToday(): boolean {
    return true; // No restriction on trading!
  }

  /**
   * Create a new TradeRequest with status 'PENDING'
   * Checks non-locked, non-listed cards.
   */
  public createTradeRequest(
    targetUserId: string,
    offeredCardInstanceId: string,
    requestedCardInstanceId: string
  ): { success: boolean; message: string; tradeRequest?: TradeRequest } {
    if (!this.profile) return { success: false, message: 'ユーザープロファイルが見つかりません。' };

    // Trade limit removed per Requirement #9

    // 2. Validate offered card
    const offeredIndex = this.userCards.findIndex((c) => c.instanceId === offeredCardInstanceId);
    if (offeredIndex === -1) {
      return { success: false, message: 'トレードに出すカードが見つかりません。' };
    }
    const offeredCard = this.userCards[offeredIndex];
    if (offeredCard.isLocked) {
      return { success: false, message: 'ロック中のカードはトレードに出せません。ロックを解除してください。' };
    }
    if (offeredCard.isListed) {
      return { success: false, message: 'マーケットに出品中のカードはトレードに出せません。' };
    }

    // Check if offered card is already in a PENDING trade
    const alreadyPending = this.tradeRequests.some(
      (tr) => tr.status === 'PENDING' && tr.offeredCard.instanceId === offeredCardInstanceId
    );
    if (alreadyPending) {
      return { success: false, message: 'このカードは既に別のトレード申請中です。' };
    }

    // 3. Validate target player and requested card
    const targetPlayer = this.getPlayerProfile(targetUserId);
    if (!targetPlayer) {
      return { success: false, message: 'トレード相手が見つかりません。' };
    }
    const requestedCard = targetPlayer.publicCards.find((c) => c.instanceId === requestedCardInstanceId);
    if (!requestedCard) {
      return { success: false, message: '相手の希望カードが見つかりません。' };
    }
    if (requestedCard.isLocked) {
      return { success: false, message: '相手のカードがロックされているため、トレードを申し込めません。' };
    }

    // 4. Construct pending TradeRequest
    // Lock offered card during pending trade per Requirement #5
    offeredCard.isInTrade = true;

    const tradeRequest: TradeRequest = {
      id: `trade-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      senderId: this.currentUserId,
      senderName: this.profile.username,
      receiverId: targetPlayer.userId,
      receiverName: targetPlayer.username,
      offeredCard: { ...offeredCard },
      requestedCard: { ...requestedCard },
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.tradeRequests.unshift(tradeRequest);
    this.saveAll();

    const offeredPlayerInfo = PLAYER_MAP[offeredCard.playerId];
    const requestedPlayerInfo = PLAYER_MAP[requestedCard.playerId];

    this.addNotification({
      title: 'トレード申請を送信',
      message: `${targetPlayer.username} に「${offeredPlayerInfo?.name || 'カード'}」⇄「${requestedPlayerInfo?.name || 'カード'}」のトレード申請を送信しました（承諾待ち）。`,
      type: 'info',
    });

    return {
      success: true,
      message: 'トレード申請を送信しました（承諾待ち）。',
      tradeRequest,
    };
  }

  /**
   * Approve a pending TradeRequest
   * Performs atomic card transfer, enforces 1 trade/day, logs history and updates notifications.
   */
  public approveTrade(tradeRequestId: string): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザープロファイルが見つかりません。' };

    const reqIndex = this.tradeRequests.findIndex((r) => r.id === tradeRequestId);
    if (reqIndex === -1) {
      return { success: false, message: '指定のトレード申請が見つかりません。' };
    }
    const request = this.tradeRequests[reqIndex];
    if (request.status !== 'PENDING') {
      return { success: false, message: `このトレード申請は既に【${request.status}】状態です。` };
    }

    if (!this.canTradeToday()) {
      return {
        success: false,
        message: '本日のトレード上限（1回）に達しています。明日またご利用ください。',
      };
    }

    // Validate that the sender's offered card is still valid
    const offeredIndex = this.userCards.findIndex((c) => c.instanceId === request.offeredCard.instanceId);
    if (request.senderId === this.currentUserId && offeredIndex === -1) {
      return { success: false, message: 'トレードに出すカードが見つかりません。' };
    }

    try {
      const targetPlayer =
        this.getPlayerProfile(request.receiverId) ||
        this.getPlayerProfile(request.senderId);

      // Execute card swap
      if (request.senderId === this.currentUserId) {
        // User offered card, user receives requested card
        const [removedCard] = this.userCards.splice(offeredIndex, 1);
        const newAcquiredCard: UserCard = {
          ...request.requestedCard,
          instanceId: `card-${request.requestedCard.playerId}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          acquiredAt: new Date().toISOString(),
          isLocked: false,
          isListed: false,
          isInTrade: false,
          listingId: undefined,
        };
        this.userCards.push(newAcquiredCard);

        if (targetPlayer) {
          targetPlayer.publicCards = targetPlayer.publicCards.filter(
            (c) => c.instanceId !== request.requestedCard.instanceId
          );
          removedCard.isInTrade = false;
          targetPlayer.publicCards.push(removedCard);
        }
      }

      // Mark trade accepted
      request.status = 'ACCEPTED';
      request.completedAt = new Date().toISOString();

      // Enforce 1 trade per day
      const today = new Date().toISOString().split('T')[0];
      const key = STORAGE_KEYS.DAILY_TRADES_PREFIX + this.currentUserId + '_' + today;
      localStorage.setItem(key, '1');

      const offeredPlayerInfo = PLAYER_MAP[request.offeredCard.playerId];
      const requestedPlayerInfo = PLAYER_MAP[request.requestedCard.playerId];

      // History log
      this.history.unshift({
        id: 'hist-trade-' + Date.now(),
        type: 'exchange',
        title: `カードトレード成立: ${request.receiverName}`,
        details: `【放出】${offeredPlayerInfo?.name || 'カード'} ⇄ 【獲得】${requestedPlayerInfo?.name || 'カード'}`,
        timestamp: new Date().toISOString(),
      });

      // User notification
      this.addNotification({
        title: 'トレード成立！',
        message: `${request.receiverName} とのトレードが成立し、「${requestedPlayerInfo?.name || 'カード'}」を獲得しました！`,
        type: 'info',
      });

      this.saveAll();
      return {
        success: true,
        message: `トレードが成立しました！「${requestedPlayerInfo?.name || 'カード'}」を獲得しました。`,
      };
    } catch {
      return { success: false, message: 'トレード処理中にエラーが発生しました。' };
    }
  }

  /**
   * Reject a pending TradeRequest
   * Unlocks card and reverts state.
   */
  public rejectTrade(tradeRequestId: string, reason?: string): { success: boolean; message: string } {
    const req = this.tradeRequests.find((r) => r.id === tradeRequestId);
    if (!req) return { success: false, message: 'トレード申請が見つかりません。' };
    if (req.status !== 'PENDING') return { success: false, message: '既に処理されたトレードです。' };

    // Unlock offered card back to normal state
    const offeredCard = this.userCards.find((c) => c.instanceId === req.offeredCard.instanceId);
    if (offeredCard) {
      offeredCard.isInTrade = false;
    }

    req.status = 'REJECTED';
    req.rejectedReason = reason || '相手により辞退されました。';
    req.completedAt = new Date().toISOString();

    this.addNotification({
      title: 'トレード辞退',
      message: `${req.receiverName} へのトレード申請が辞退されました。カードのロックを解除しました。`,
      type: 'warning',
    });

    this.saveAll();
    return { success: true, message: 'トレード申請を辞退しました。' };
  }

  /**
   * Cancel a pending TradeRequest by sender
   * Unlocks card and reverts state.
   */
  public cancelTrade(tradeRequestId: string): { success: boolean; message: string } {
    const req = this.tradeRequests.find((r) => r.id === tradeRequestId);
    if (!req) return { success: false, message: 'トレード申請が見つかりません。' };
    if (req.status !== 'PENDING') return { success: false, message: '既に処理されたトレードです。' };

    // Unlock offered card back to normal state
    const offeredCard = this.userCards.find((c) => c.instanceId === req.offeredCard.instanceId);
    if (offeredCard) {
      offeredCard.isInTrade = false;
    }

    req.status = 'CANCELLED';
    req.completedAt = new Date().toISOString();
    this.saveAll();
    return { success: true, message: 'トレード申請を取り消しました。カードのロックを解除しました。' };
  }

  /**
   * Get all TradeRequests involving user
   */
  public getTradeRequests(): TradeRequest[] {
    return [...this.tradeRequests];
  }

  /**
   * Get active PENDING TradeRequests
   */
  public getPendingTradeRequests(): TradeRequest[] {
    return this.tradeRequests.filter((r) => r.status === 'PENDING');
  }

  /**
   * Propose trade with another player
   * Submits trade request for counterparty approval. Never executes immediately.
   */
  public proposeAndExecuteTrade(
    targetUserId: string,
    offeredCardInstanceId: string,
    requestedCardInstanceId: string
  ): { success: boolean; message: string } {
    return this.createTradeRequest(
      targetUserId,
      offeredCardInstanceId,
      requestedCardInstanceId
    );
  }

  // --- Multi-Account Management ---
  public getSavedAccounts(): SavedAccountSummary[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_INDEX);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private updateAccountsIndex() {
    if (!this.profile) return;
    const accounts = this.getSavedAccounts().filter((a) => a.user_id !== this.profile!.user_id);
    accounts.unshift({
      user_id: this.profile.user_id,
      username: this.profile.username,
      birthdate: this.profile.birthdate,
      cardCount: this.userCards.length,
      sc: this.profile.sc,
      mp: this.profile.mp,
      lastLoginDate: this.profile.lastLoginDate || new Date().toISOString().split('T')[0],
    });
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS_INDEX, JSON.stringify(accounts));
  }

  public logout(): boolean {
    if (this.profile) {
      this.saveAll();
      this.updateAccountsIndex();
    }
    // Remove active pointer so user can select or create an account
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    return true;
  }

  public switchAccount(targetUserId: string): boolean {
    if (this.profile) {
      this.saveAll();
      this.updateAccountsIndex();
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, targetUserId);
    this.currentUserId = targetUserId;
    this.loadAll();

    if (this.profile?.language) {
      setAppLanguage(this.profile.language);
    }
    return true;
  }

  public createNewAccount(username: string, birthdate: string): { success: boolean; profile: UserProfile } {
    if (this.profile) {
      this.saveAll();
      this.updateAccountsIndex();
    }

    const newUserId = 'fc_user_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUserId);
    this.currentUserId = newUserId;

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    this.profile = this.createDefaultProfile(newUserId, username || 'FCルーキー', birthdate || '2000-01-01');

    const initP1 = PLAYERS_DATABASE.find((p) => p.position === 'CF') || PLAYERS_DATABASE[0];
    const initP2 = PLAYERS_DATABASE.find((p) => p.position === 'CMF') || PLAYERS_DATABASE[1];
    const initP3 = PLAYERS_DATABASE.find((p) => p.position === 'CB') || PLAYERS_DATABASE[2];

    this.userCards = [
      this.createCardInstance(initP1.id),
      this.createCardInstance(initP2.id),
      this.createCardInstance(initP3.id),
    ];

    this.marketListings = generateSeedMarketListings();
    this.dailyMissions = INITIAL_DAILY_MISSIONS.map((m) => ({ ...m, date: today }));
    this.seasonMissions = INITIAL_SEASON_MISSIONS.map((m) => ({ ...m, month: currentMonth }));
    this.history = [
      {
        id: 'hist-init-' + Date.now(),
        type: 'login_bonus',
        title: '新規アカウント作成ボーナス',
        details: '新規登録: 1,000 SC、30,000 MP、初期カード3枚を付与しました。',
        scChange: 1000,
        mpChange: 30000,
        timestamp: new Date().toISOString(),
      },
    ];
    this.notifications = [
      {
        id: 'notif-welcome-' + Date.now(),
        title: '新しいチームが誕生しました！',
        message: '1,000 SC・30,000 MP・リリース無料10連をお受け取りいただけます。',
        type: 'info',
        read: false,
        timestamp: new Date().toISOString(),
      },
    ];
    this.missionPoints = 0;

    this.saveAll();
    this.updateAccountsIndex();
    return { success: true, profile: this.profile };
  }

  // --- Atomic Currency Operations ---

  public exchangeMpToSc(amountMp: number): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザープロファイルが見つかりません。' };
    if (amountMp < 10000 || amountMp % 10000 !== 0) {
      return { success: false, message: '最低交換単位は10,000 MPです。（10,000 MP単位で指定してください）' };
    }
    if (this.profile.mp < amountMp) {
      return { success: false, message: `MPが不足しています。（所持: ${this.profile.mp.toLocaleString()} MP）` };
    }

    const gainedSc = (amountMp / 10000) * 100;
    const prevMp = this.profile.mp;
    const prevSc = this.profile.sc;

    try {
      this.profile.mp -= amountMp;
      this.profile.sc += gainedSc;

      this.history.unshift({
        id: 'hist-ex-' + Date.now(),
        type: 'exchange',
        title: 'MP → SC 通貨交換',
        details: `${amountMp.toLocaleString()} MP を消費して ${gainedSc.toLocaleString()} SC を獲得しました。`,
        scChange: gainedSc,
        mpChange: -amountMp,
        timestamp: new Date().toISOString(),
      });

      this.addNotification({
        title: '通貨交換完了',
        message: `${amountMp.toLocaleString()} MP を ${gainedSc.toLocaleString()} SC に交換しました。`,
        type: 'info',
      });

      this.saveAll();
      return { success: true, message: `${amountMp.toLocaleString()} MPを${gainedSc.toLocaleString()} SCに交換しました！` };
    } catch {
      this.profile.mp = prevMp;
      this.profile.sc = prevSc;
      return { success: false, message: '交換処理中にエラーが発生しました。残高は変更されていません。' };
    }
  }

  // --- Atomic Scout Operation (SSR Ceiling Fixed) ---

  public performScout(
    bannerId: 'normal' | 'half' | 'premium' | 'legend',
    pullCount: 1 | 10 | 50,
    isFreePull = false
  ): { success: boolean; message: string; cards: UserCard[] } {
    if (!this.profile) return { success: false, message: 'ユーザープロファイルがありません。', cards: [] };

    let cost = 0;
    if (isFreePull) {
      if (this.profile.isFreeTenPullClaimed) {
        return { success: false, message: 'リリース記念無料10連はすでに受け取り済みです。', cards: [] };
      }
      cost = 0;
    } else {
      if (bannerId === 'half') {
        cost = pullCount === 1 ? 50 : pullCount === 10 ? 475 : 2000;
      } else if (bannerId === 'normal') {
        cost = pullCount === 1 ? 100 : pullCount === 10 ? 950 : 4000;
      } else if (bannerId === 'premium') {
        cost = pullCount === 1 ? 200 : pullCount === 10 ? 1900 : 8000;
      } else if (bannerId === 'legend') {
        cost = pullCount === 1 ? 250 : pullCount === 10 ? 2400 : 11000;
      }

      if (this.profile.sc < cost) {
        return { success: false, message: `SCが不足しています。（必要: ${cost} SC / 所持: ${this.profile.sc} SC）`, cards: [] };
      }
    }

    const ssrRate = bannerId === 'legend' ? 0.02 : bannerId === 'premium' ? 0.06 : 0.03;
    const drawnCards: UserCard[] = [];

    const prevSc = this.profile.sc;
    const prevNormalPity = this.profile.pityCountNormal;
    const prevHalfPity = this.profile.pityCountHalf;
    const prevPremiumPity = this.profile.pityCountPremium;

    try {
      this.profile.sc -= cost;

      if (isFreePull) {
        this.profile.isFreeTenPullClaimed = true;
      }

      // Read current pity for this banner
      let currentPity =
        bannerId === 'normal'
          ? this.profile.pityCountNormal
          : bannerId === 'half'
          ? this.profile.pityCountHalf
          : this.profile.pityCountPremium;

      let pityTriggered = false;

      // Pool definition: Legend banner draws exclusively from 108 verified real legends!
      const pool = bannerId === 'legend' ? LEGEND_PLAYERS_DATABASE : PLAYERS_DATABASE;

      // Draw cards
      for (let i = 0; i < pullCount; i++) {
        let forceSsr = false;

        if (isFreePull && i === pullCount - 1) {
          // Free 10-pull guarantees SSR on last card
          forceSsr = true;
        } else if (!isFreePull) {
          currentPity += 1; // +1 on every single card pulled!
          if (currentPity >= (bannerId === 'legend' ? 120 : 150)) {
            forceSsr = true;
            currentPity = 0; // Pity ceiling reached! ONLY reset when guaranteed SSR condition triggers!
            pityTriggered = true;
          }
        }

        // Determine rarity
        let chosenRarity: Rarity = 'N';
        const rand = Math.random();

        if (forceSsr) {
          chosenRarity = 'SSR';
        } else if (rand < ssrRate) {
          chosenRarity = 'SSR';
        } else if (rand < ssrRate + 0.25) {
          chosenRarity = 'SR';
        } else if (rand < ssrRate + 0.60) {
          chosenRarity = 'R';
        } else {
          chosenRarity = 'N';
        }

        // Pick player of that rarity from candidate pool
        let candidatePlayers = pool.filter((p) => p.rarity === chosenRarity && p.isCardEligible !== false);
        if (candidatePlayers.length === 0) {
          // Fallback if rarity not in pool (e.g. legends are predominantly SSR/SR)
          candidatePlayers = pool.filter((p) => p.rarity === 'SR' || p.rarity === 'SSR');
        }
        const selectedPlayer = candidatePlayers[Math.floor(Math.random() * candidatePlayers.length)] || pool[0];

        const card = this.createCardInstance(selectedPlayer.id);
        drawnCards.push(card);
        this.userCards.push(card);
      }

      // Update pity count back to profile
      if (!isFreePull) {
        if (bannerId === 'normal') this.profile.pityCountNormal = currentPity;
        else if (bannerId === 'half') this.profile.pityCountHalf = currentPity;
        else this.profile.pityCountPremium = currentPity;
      }

      if (pityTriggered) {
        // Complete season pity mission
        const sm = this.seasonMissions.find((m) => m.id === 'season-ssr-pity');
        if (sm) {
          sm.progress = 1;
          sm.isCompleted = true;
        }
        this.addNotification({
          title: '★SSR確定天井発動★',
          message: '150回スカウト天井達成により、最高レアリティSSRカードを獲得しました！',
          type: 'scout',
        });
      }

      // Record history
      const bannerName =
        bannerId === 'half'
          ? 'リリース記念半額ガチャ'
          : bannerId === 'premium'
          ? 'プレミアムスカウト'
          : bannerId === 'legend'
          ? 'レジェンド限定ガチャ'
          : '通常スカウト';

      this.history.unshift({
        id: 'hist-scout-' + Date.now(),
        type: 'scout',
        title: `${bannerName} (${pullCount}連)`,
        details: `${isFreePull ? '無料' : cost + ' SC'}消費。獲得カード: ${drawnCards.map((c) => PLAYER_MAP[c.playerId]?.name || '').slice(0, 3).join('、')}${drawnCards.length > 3 ? ' 他' : ''}`,
        scChange: isFreePull ? 0 : -cost,
        timestamp: new Date().toISOString(),
      });

      // Update Missions
      this.incrementDailyMission('daily-scout-1', 1);
      if (cost > 0) {
        this.incrementDailyMission('daily-spend-sc-1', cost);
      }
      this.updateSeasonMissionsProgress();

      this.saveAll();
      return { success: true, message: `${pullCount}連スカウトが完了しました！`, cards: drawnCards };
    } catch {
      // Rollback
      this.profile.sc = prevSc;
      this.profile.pityCountNormal = prevNormalPity;
      this.profile.pityCountHalf = prevHalfPity;
      this.profile.pityCountPremium = prevPremiumPity;
      return { success: false, message: 'スカウト処理に失敗しました。SCは消費されていません。', cards: [] };
    }
  }

  // --- Market Operations (Fixed Ownership & My Cards Listing) ---

  /**
   * Buy listing (Fixed price or Buyout)
   * Ownership transfers from seller to buyer.
   */
  public buyMarketListing(listingId: string): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザープロファイルが見つかりません。' };

    const listing = this.marketListings.find((l) => l.id === listingId);
    if (!listing) return { success: false, message: 'このカード出品は存在しません。' };
    if (listing.isSold || listing.isCancelled) {
      return { success: false, message: 'このカードはすでに購入されています。' };
    }
    if (listing.sellerId === this.profile.user_id) {
      return { success: false, message: '自分が出品したカードは購入できません。' };
    }

    const price = listing.price;
    if (this.profile.mp < price) {
      return { success: false, message: `MPが不足しています。（必要: ${price.toLocaleString()} MP / 所持: ${this.profile.mp.toLocaleString()} MP）` };
    }

    const prevBuyerMp = this.profile.mp;

    try {
      // 1. Deduct Buyer MP
      this.profile.mp -= price;

      // 2. Add card to Buyer's collection with clear flags
      const transferredCard: UserCard = {
        ...listing.cardInstance,
        isListed: false,
        listingId: undefined,
        acquiredAt: new Date().toISOString(),
      };
      this.userCards.push(transferredCard);

      // 3. Mark listing as sold
      listing.isSold = true;

      // 4. Notifications & History
      this.addNotification({
        title: 'カード購入完了',
        message: `マーケットで「${listing.player.name}」を ${price.toLocaleString()} MP で購入しました。`,
        type: 'market',
      });

      this.history.unshift({
        id: 'hist-mbuy-' + Date.now(),
        type: 'market_buy',
        title: `カード購入: ${listing.player.name}`,
        details: `価格: ${price.toLocaleString()} MP (出品者: ${listing.sellerName})`,
        mpChange: -price,
        cardName: listing.player.name,
        rarity: listing.player.rarity,
        timestamp: new Date().toISOString(),
      });

      // Missions
      this.incrementDailyMission('daily-market-trade-1', 1);
      this.incrementDailyMission('daily-spend-mp-1', price);
      this.incrementSeasonMission('season-market-10', 1);
      this.updateSeasonMissionsProgress();

      this.saveAll();
      return { success: true, message: `「${listing.player.name}」を ${price.toLocaleString()} MP で購入しました！` };
    } catch {
      this.profile.mp = prevBuyerMp;
      listing.isSold = false;
      this.userCards = this.userCards.filter((c) => c.instanceId !== listing.cardInstance.instanceId);
      return { success: false, message: '取引を完了できませんでした。MPは減算されていません。' };
    }
  }

  /**
   * Bid on an auction (Unlimited bids per day)
   */
  public placeBid(listingId: string, bidAmount: number): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザープロファイルが見つかりません。' };

    const listing = this.marketListings.find((l) => l.id === listingId);
    if (!listing) return { success: false, message: '該当のオークションが見つかりません。' };
    if (listing.type !== 'auction') return { success: false, message: 'この出品はオークション形式ではありません。' };
    if (listing.isSold || listing.isCancelled) return { success: false, message: 'オークションはすでに終了しています。' };
    if (listing.sellerId === this.profile.user_id) return { success: false, message: '自身の出品には入札できません。' };

    const minAllowed = listing.currentBid ? Math.floor(listing.currentBid * 1.05) : (listing.minBid || listing.price);
    if (bidAmount < minAllowed) {
      return { success: false, message: `入札額が低すぎます。（最低入札額: ${minAllowed.toLocaleString()} MP）` };
    }
    if (this.profile.mp < bidAmount) {
      return { success: false, message: `所持MPが不足しています。（所持: ${this.profile.mp.toLocaleString()} MP）` };
    }

    try {
      listing.currentBid = bidAmount;
      listing.highestBidderId = this.profile.user_id;
      listing.highestBidderName = this.profile.username;
      listing.bidCount += 1;
      listing.bids.unshift({
        bidderId: this.profile.user_id,
        bidderName: this.profile.username,
        amount: bidAmount,
        timestamp: new Date().toISOString(),
      });

      this.addNotification({
        title: '入札完了',
        message: `「${listing.player.name}」のオークションに ${bidAmount.toLocaleString()} MP で最高入札しました。`,
        type: 'market',
      });

      this.history.unshift({
        id: 'hist-bid-' + Date.now(),
        type: 'market_bid',
        title: `オークション入札: ${listing.player.name}`,
        details: `入札額: ${bidAmount.toLocaleString()} MP`,
        timestamp: new Date().toISOString(),
      });

      this.incrementDailyMission('daily-auction-trade-1', 1);
      this.incrementSeasonMission('season-bid-10', 1);
      this.updateSeasonMissionsProgress();

      this.saveAll();
      return { success: true, message: `${bidAmount.toLocaleString()} MP で最高入札しました！` };
    } catch {
      return { success: false, message: '入札処理中にエラーが発生しました。' };
    }
  }

  /**
   * Create listing from owned cards (From My Cards)
   * Ownership stays with seller until sold! Card marked as isListed: true.
   * Duplicate listing blocked! Locked cards blocked!
   */
  public createMarketListing(
    cardInstanceId: string,
    type: 'fixed' | 'auction',
    rawPrice: number | string,
    rawMinBid?: number | string,
    durationDays = 7
  ): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザーが見つかりません。' };

    const card = this.userCards.find((c) => c.instanceId === cardInstanceId);
    if (!card) return { success: false, message: '所持カードが見つかりません。' };

    if (card.isLocked) {
      return { success: false, message: 'このカードはロックされています。' };
    }

    if (card.isListed) {
      return { success: false, message: 'このカードはすでに出品されています。' };
    }

    const player = PLAYER_MAP[card.playerId];
    if (!player) return { success: false, message: 'カードデータが見つかりません。' };

    // Parse and sanitize price
    const cleanPriceStr = String(rawPrice || '').replace(/,/g, '').trim();
    if (!cleanPriceStr) {
      return { success: false, message: '価格を入力してください。' };
    }
    const price = Math.floor(Number(cleanPriceStr));
    if (isNaN(price) || price < 1) {
      return { success: false, message: '価格は1MP以上にしてください。' };
    }

    let minBid: number | undefined = undefined;
    if (type === 'auction') {
      const cleanMinBidStr = String(rawMinBid || '').replace(/,/g, '').trim();
      if (!cleanMinBidStr) {
        minBid = Math.floor(price * 0.7);
      } else {
        const parsedMinBid = Math.floor(Number(cleanMinBidStr));
        if (isNaN(parsedMinBid) || parsedMinBid < 1) {
          return { success: false, message: '最低入札価格は1MP以上にしてください。' };
        }
        if (parsedMinBid > price) {
          return { success: false, message: '最低入札価格は即決価格以下にしてください。' };
        }
        minBid = parsedMinBid;
      }
    }

    const validDurationDays = Math.max(1, Math.min(7, durationDays || 7));
    const now = Date.now();
    const listingId = 'listing-' + now;

    // Keep card in userCards, mark as listed
    card.isListed = true;
    card.listingId = listingId;

    const newListing: MarketListing = {
      id: listingId,
      sellerId: this.profile.user_id,
      sellerName: this.profile.username,
      cardInstance: { ...card },
      player,
      type,
      price,
      minBid: type === 'auction' ? minBid || Math.floor(price * 0.7) : undefined,
      currentBid: type === 'auction' ? minBid || Math.floor(price * 0.7) : undefined,
      bidCount: 0,
      bids: [],
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + validDurationDays * 24 * 3600 * 1000).toISOString(),
      isSold: false,
      isCancelled: false,
    };

    this.marketListings.unshift(newListing);

    this.history.unshift({
      id: 'hist-sell-' + now,
      type: 'market_sell',
      title: `カード出品: ${player.name}`,
      details: `${type === 'auction' ? 'オークション' : '即決価格'}: ${price.toLocaleString()} MP で出品しました（期間: ${validDurationDays}日間）。`,
      cardName: player.name,
      rarity: player.rarity,
      timestamp: new Date().toISOString(),
    });

    this.addNotification({
      title: 'カード出品完了',
      message: `「${player.name}」をマーケットに出品しました。販売成立まで所有権はお手元に保持されます。`,
      type: 'market',
    });

    this.saveAll();
    return { success: true, message: `「${player.name}」をマーケットに出品しました！` };
  }

  /**
   * Cancel an active listing and restore card state
   */
  public cancelListing(listingId: string): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザーが見つかりません。' };
    const listing = this.marketListings.find((l) => l.id === listingId);
    if (!listing) return { success: false, message: '出品が見つかりません。' };
    if (listing.sellerId !== this.profile.user_id) return { success: false, message: '自身の出品のみキャンセルできます。' };
    if (listing.isSold) return { success: false, message: 'すでに購入されたカードはキャンセルできません。' };
    if (listing.isCancelled) return { success: false, message: 'すでにキャンセル済みです。' };

    listing.isCancelled = true;

    // Unmark card in userCards
    const userCard = this.userCards.find((c) => c.instanceId === listing.cardInstance.instanceId || c.listingId === listingId);
    if (userCard) {
      userCard.isListed = false;
      userCard.listingId = undefined;
    }

    this.history.unshift({
      id: 'hist-cancel-' + Date.now(),
      type: 'listing_cancel',
      title: `出品キャンセル: ${listing.player.name}`,
      details: `カードの出品中状態が解除されました。`,
      cardName: listing.player.name,
      rarity: listing.player.rarity,
      timestamp: new Date().toISOString(),
    });

    this.saveAll();
    return { success: true, message: '出品をキャンセルしました。' };
  }

  // --- Training & Awakening (Training Count Fix) ---

  public trainCard(cardInstanceId: string): { success: boolean; message: string; newLevel: number } {
    if (!this.profile) return { success: false, message: 'ユーザーが見つかりません。', newLevel: 0 };
    const card = this.userCards.find((c) => c.instanceId === cardInstanceId);
    if (!card) return { success: false, message: 'カードが見つかりません。', newLevel: 0 };
    const player = PLAYER_MAP[card.playerId];

    if (card.isListed) {
      return { success: false, message: 'マーケットに出品中のカードは育成できません。', newLevel: card.trainingLv };
    }

    if (card.trainingLv >= 10) {
      return { success: false, message: 'このカードはすでに最大レベル（Lv10）です。覚醒を行ってください。', newLevel: card.trainingLv };
    }

    const costPt = card.trainingLv * 5;
    if (this.profile.trainingPt < costPt) {
      return { success: false, message: `育成Ptが不足しています。（必要: ${costPt} Pt / 所持: ${this.profile.trainingPt} Pt）`, newLevel: card.trainingLv };
    }

    // Deduct and increment level
    this.profile.trainingPt -= costPt;
    card.trainingLv += 1;

    // Record history
    this.history.unshift({
      id: 'hist-train-' + Date.now(),
      type: 'training',
      title: `選手育成: ${player?.name || 'カード'}`,
      details: `Lv ${card.trainingLv - 1} → Lv ${card.trainingLv} に成長！(消費育成Pt: ${costPt})`,
      trainingPtChange: -costPt,
      cardName: player?.name,
      rarity: player?.rarity,
      timestamp: new Date().toISOString(),
    });

    // Accurately increment daily & season training counts!
    this.incrementDailyMission('daily-train-1', 1);
    this.incrementSeasonMission('season-train-150', 1);
    this.updateSeasonMissionsProgress();

    this.saveAll();
    return { success: true, message: `Lv ${card.trainingLv} に成長しました！`, newLevel: card.trainingLv };
  }

  public awakenCard(cardInstanceId: string): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザーが見つかりません。' };
    const card = this.userCards.find((c) => c.instanceId === cardInstanceId);
    if (!card) return { success: false, message: 'カードが見つかりません。' };
    const player = PLAYER_MAP[card.playerId];

    if (card.isListed) {
      return { success: false, message: '出品中のカードは覚醒できません。' };
    }

    if (card.trainingLv < 10) {
      return { success: false, message: '覚醒するには育成Lvを10にする必要があります。' };
    }
    if (card.isAwakened) {
      return { success: false, message: 'このカードはすでに覚醒済みです。' };
    }

    const awakenCostPt = 50;
    if (this.profile.trainingPt < awakenCostPt) {
      return { success: false, message: `覚醒には育成Ptが 50 Pt 必要です。（所持: ${this.profile.trainingPt} Pt）` };
    }

    this.profile.trainingPt -= awakenCostPt;
    card.isAwakened = true;

    this.history.unshift({
      id: 'hist-awake-' + Date.now(),
      type: 'awakening',
      title: `★覚醒達成★: ${player?.name || 'カード'}`,
      details: `極限の輝き！専用オーラと覚醒記念エンブレムを獲得しました。`,
      trainingPtChange: -awakenCostPt,
      cardName: player?.name,
      rarity: player?.rarity,
      timestamp: new Date().toISOString(),
    });

    this.addNotification({
      title: 'カード覚醒成功！',
      message: `「${player?.name}」の覚醒が完了しました！専用カードエフェクトが開放されました。`,
      type: 'info',
    });

    this.saveAll();
    return { success: true, message: `「${player?.name}」が覚醒しました！` };
  }

  // --- Mission Tracking ---

  public markAuctionViewed() {
    this.incrementDailyMission('daily-auction-view-1', 1);
  }

  public markMarketViewed() {
    this.incrementDailyMission('daily-market-view-1', 1);
  }

  public incrementDailyMission(missionId: string, amount = 1) {
    const mission = this.dailyMissions.find((m) => m.id === missionId);
    if (mission && !mission.isCompleted) {
      mission.progress = Math.min(mission.target, mission.progress + amount);
      if (mission.progress >= mission.target) {
        mission.isCompleted = true;
        this.missionPoints += mission.point;
        this.addNotification({
          title: 'デイリーミッション達成！',
          message: `「${mission.title}」を達成しました！（+${mission.point} pt）`,
          type: 'mission',
        });
      }
      this.saveAll();
    }
  }

  public incrementSeasonMission(missionId: string, amount = 1) {
    const mission = this.seasonMissions.find((m) => m.id === missionId);
    if (mission && !mission.isCompleted) {
      mission.progress = Math.min(mission.target, mission.progress + amount);
      if (mission.progress >= mission.target) {
        mission.isCompleted = true;
        this.addNotification({
          title: 'シーズンミッション達成！',
          message: `「${mission.title}」を達成しました！報酬をお受け取りください。`,
          type: 'mission',
        });
      }
      this.saveAll();
    }
  }

  public claimMissionRewardChoice(rewardType: 'trainingPt' | 'sc' | 'mp'): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザーが見つかりません。' };
    if (this.missionPoints < 50) {
      return { success: false, message: 'ミッションptが50pt以上必要です。' };
    }

    this.missionPoints -= 50;

    let desc = '';
    if (rewardType === 'trainingPt') {
      this.profile.trainingPt += 30;
      desc = 'Training Pt 30';
    } else if (rewardType === 'sc') {
      this.profile.sc += 100;
      desc = '100 SC';
    } else {
      this.profile.mp += 10000;
      desc = '10,000 MP';
    }

    this.history.unshift({
      id: 'hist-mrew-' + Date.now(),
      type: 'mission_reward',
      title: 'ミッションポイント報酬獲得',
      details: `50ptを消費して【${desc}】を獲得しました。`,
      scChange: rewardType === 'sc' ? 100 : undefined,
      mpChange: rewardType === 'mp' ? 10000 : undefined,
      trainingPtChange: rewardType === 'trainingPt' ? 30 : undefined,
      timestamp: new Date().toISOString(),
    });

    this.saveAll();
    return { success: true, message: `【${desc}】を獲得しました！` };
  }

  public updateSeasonMissionsProgress() {
    if (!this.profile) return;
    this.seasonMissions.forEach((sm) => {
      if (sm.id === 'season-collection') {
        sm.progress = this.userCards.length;
      }
      if (sm.progress >= sm.target && !sm.isCompleted) {
        sm.isCompleted = true;
      }
    });
  }

  public claimSeasonMission(missionId: string): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザーが見つかりません。' };
    const sm = this.seasonMissions.find((m) => m.id === missionId);
    if (!sm) return { success: false, message: 'ミッションが見つかりません。' };
    if (!sm.isCompleted) return { success: false, message: 'ミッションがまだ達成されていません。' };
    if (sm.isClaimed) return { success: false, message: 'すでに受け取り済みです。' };

    sm.isClaimed = true;
    if (sm.rewardType === 'sc') this.profile.sc += sm.rewardAmount;
    if (sm.rewardType === 'mp') this.profile.mp += sm.rewardAmount;
    if (sm.rewardType === 'trainingPt') this.profile.trainingPt += sm.rewardAmount;

    this.history.unshift({
      id: 'hist-season-' + Date.now(),
      type: 'mission_reward',
      title: `シーズンミッション達成: ${sm.title}`,
      details: `報酬: ${sm.rewardDesc} を受け取りました。`,
      scChange: sm.rewardType === 'sc' ? sm.rewardAmount : undefined,
      mpChange: sm.rewardType === 'mp' ? sm.rewardAmount : undefined,
      trainingPtChange: sm.rewardType === 'trainingPt' ? sm.rewardAmount : undefined,
      timestamp: new Date().toISOString(),
    });

    this.saveAll();
    return { success: true, message: `${sm.rewardDesc} を受け取りました！` };
  }

  // --- Profile & Card Settings ---

  public updateLanguage(lang: SupportedLanguage) {
    if (!this.profile) return;
    this.profile.language = lang;
    setAppLanguage(lang);
    this.saveAll();
    this.updateAccountsIndex();
  }

  public updateUsername(newName: string): { success: boolean; message: string } {
    if (!this.profile) return { success: false, message: 'ユーザーが見つかりません。' };
    const trimmed = newName.trim();
    if (!trimmed || trimmed.length > 15) {
      return { success: false, message: 'ユーザー名は1〜15文字で入力してください。' };
    }
    this.profile.username = trimmed;
    this.saveAll();
    this.updateAccountsIndex();
    return { success: true, message: 'ユーザー名を変更しました。' };
  }

  public updateBirthdateAndAge(birthdate: string, age?: number) {
    if (!this.profile) return;
    this.profile.birthdate = birthdate;
    this.profile.age = age;
    this.saveAll();
    this.updateAccountsIndex();
  }

  public completeTutorial() {
    if (!this.profile) return;
    this.profile.tutorialCompleted = true;
    this.saveAll();
  }

  public acceptTermsAndPrivacy() {
    if (!this.profile) return;
    this.profile.termsAccepted = true;
    this.profile.privacyAccepted = true;
    this.profile.notesAccepted = true;
    this.saveAll();
  }

  public toggleFavorite(cardInstanceId: string) {
    const card = this.userCards.find((c) => c.instanceId === cardInstanceId);
    if (card) {
      card.isFavorite = !card.isFavorite;
      this.saveAll();
    }
  }

  public toggleLock(cardInstanceId: string): boolean {
    const card = this.userCards.find((c) => c.instanceId === cardInstanceId);
    if (card) {
      card.isLocked = !card.isLocked;
      this.saveAll();
      return card.isLocked;
    }
    return false;
  }

  public markNotificationRead(id: string) {
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.saveAll();
    }
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.saveAll();
  }

  // --- Helpers ---

  private addNotification(params: { title: string; message: string; type: 'info' | 'market' | 'mission' | 'scout' | 'warning' }) {
    this.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: params.title,
      message: params.message,
      type: params.type,
      read: false,
      timestamp: new Date().toISOString(),
    });
  }

  private addLoginBonus(day: number) {
    if (!this.profile) return;
    const rewards = [
      { name: '100 SC', sc: 100 },
      { name: '5,000 MP', mp: 5000 },
      { name: 'Training Pt 30', pt: 30 },
      { name: '150 SC', sc: 150 },
      { name: '10,000 MP', mp: 10000 },
      { name: 'Training Pt 50', pt: 50 },
      { name: '300 SC & 15,000 MP', sc: 300, mp: 15000 },
    ];
    const reward = rewards[(day - 1) % 7];

    if (reward.sc) this.profile.sc += reward.sc;
    if (reward.mp) this.profile.mp += reward.mp;
    if (reward.pt) this.profile.trainingPt += reward.pt;

    this.addNotification({
      title: `ログインボーナス (Day ${day})`,
      message: `${reward.name} を受け取りました！`,
      type: 'info',
    });

    this.history.unshift({
      id: 'hist-login-' + Date.now(),
      type: 'login_bonus',
      title: `ログインボーナス (${day}日目)`,
      details: `${reward.name} を獲得`,
      scChange: reward.sc,
      mpChange: reward.mp,
      trainingPtChange: reward.pt,
      timestamp: new Date().toISOString(),
    });
  }

  private createCardInstance(playerId: string): UserCard {
    const player = PLAYER_MAP[playerId] || PLAYERS_DATABASE[0];
    const now = Date.now();
    const randCode = Math.floor(1000 + Math.random() * 9000);

    let serialNumber: number | undefined;
    if (player.rarity === 'SSR') {
      const serialData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERIAL_COUNTER) || '{}');
      const curSerial = (serialData[playerId] || 120) + 1;
      serialData[playerId] = curSerial;
      localStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, JSON.stringify(serialData));
      serialNumber = curSerial;
    }

    return {
      instanceId: `card-${playerId}-${now}-${randCode}`,
      playerId: player.id,
      serialNumber,
      cardIdDisplay:
        player.rarity === 'SSR' && serialNumber
          ? `SSR-${player.position}-${String(serialNumber).padStart(4, '0')}`
          : `${player.rarity}-${player.position}-${randCode}`,
      acquiredAt: new Date().toISOString(),
      trainingLv: 1,
      isAwakened: false,
      isFavorite: false,
      isLocked: false,
      isListed: false,
    };
  }

  private saveAll() {
    const uid = this.currentUserId;
    if (!uid) return;

    if (this.profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE_PREFIX + uid, JSON.stringify(this.profile));
    }
    if (this.myTeam) {
      localStorage.setItem(STORAGE_KEYS.MY_TEAM_PREFIX + uid, JSON.stringify(this.myTeam));
    }
    localStorage.setItem(STORAGE_KEYS.CARDS_PREFIX + uid, JSON.stringify(this.userCards));
    localStorage.setItem(STORAGE_KEYS.MARKET_PREFIX + uid, JSON.stringify(this.marketListings));
    localStorage.setItem(STORAGE_KEYS.DAILY_MISSIONS_PREFIX + uid, JSON.stringify(this.dailyMissions));
    localStorage.setItem(STORAGE_KEYS.SEASON_MISSIONS_PREFIX + uid, JSON.stringify(this.seasonMissions));
    localStorage.setItem(STORAGE_KEYS.MISSION_POINTS_PREFIX + uid, String(this.missionPoints));
    localStorage.setItem(STORAGE_KEYS.HISTORY_PREFIX + uid, JSON.stringify(this.history));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_PREFIX + uid, JSON.stringify(this.notifications));
    localStorage.setItem(STORAGE_KEYS.TRADES_PREFIX + uid, JSON.stringify(this.tradeRequests));
  }

  private loadAll() {
    const uid = this.currentUserId;
    if (!uid) return;

    const pStr = localStorage.getItem(STORAGE_KEYS.PROFILE_PREFIX + uid);
    if (pStr) {
      try {
        this.profile = JSON.parse(pStr);
      } catch {}
    }

    const tStr = localStorage.getItem(STORAGE_KEYS.MY_TEAM_PREFIX + uid);
    if (tStr) {
      try {
        this.myTeam = JSON.parse(tStr);
      } catch {}
    }

    const cStr = localStorage.getItem(STORAGE_KEYS.CARDS_PREFIX + uid);
    if (cStr) {
      try {
        this.userCards = JSON.parse(cStr);
      } catch {}
    }

    const mStr = localStorage.getItem(STORAGE_KEYS.MARKET_PREFIX + uid);
    if (mStr) {
      try {
        this.marketListings = JSON.parse(mStr);
      } catch {}
    } else {
      this.marketListings = generateSeedMarketListings();
    }

    const dStr = localStorage.getItem(STORAGE_KEYS.DAILY_MISSIONS_PREFIX + uid);
    if (dStr) {
      try {
        this.dailyMissions = JSON.parse(dStr);
      } catch {}
    }

    const sStr = localStorage.getItem(STORAGE_KEYS.SEASON_MISSIONS_PREFIX + uid);
    if (sStr) {
      try {
        this.seasonMissions = JSON.parse(sStr);
      } catch {}
    }

    const ptsStr = localStorage.getItem(STORAGE_KEYS.MISSION_POINTS_PREFIX + uid);
    this.missionPoints = ptsStr ? parseInt(ptsStr, 10) : 0;

    const hStr = localStorage.getItem(STORAGE_KEYS.HISTORY_PREFIX + uid);
    if (hStr) {
      try {
        this.history = JSON.parse(hStr);
      } catch {}
    }

    const nStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_PREFIX + uid);
    if (nStr) {
      try {
        this.notifications = JSON.parse(nStr);
      } catch {}
    }

    const trStr = localStorage.getItem(STORAGE_KEYS.TRADES_PREFIX + uid);
    if (trStr) {
      try {
        this.tradeRequests = JSON.parse(trStr);
      } catch {}
    } else {
      this.tradeRequests = [];
    }
  }

  // --- My Team Management ---
  public getMyTeam(): MyTeam {
    if (!this.myTeam) {
      this.myTeam = this.createDefaultMyTeam();
    }
    const stats = calculateTeamStats(this.myTeam.formation, this.myTeam.starters, this.userCards);
    this.myTeam.teamOvr = stats.teamOvr;
    this.myTeam.chemistry = stats.chemistry;
    return { ...this.myTeam };
  }

  public saveMyTeam(team: MyTeam): { success: boolean; team: MyTeam } {
    const stats = calculateTeamStats(team.formation, team.starters, this.userCards);
    this.myTeam = {
      ...team,
      teamOvr: stats.teamOvr,
      chemistry: stats.chemistry,
      updatedAt: new Date().toISOString(),
    };
    this.saveAll();
    this.syncWithSupabase().catch(() => {});
    return { success: true, team: { ...this.myTeam } };
  }

  private createDefaultMyTeam(): MyTeam {
    const starters: Record<string, string> = {};
    const formation = FORMATIONS['4-3-3'];
    const used = new Set<string>();

    formation.slots.forEach((slot) => {
      // Find matching position first
      const match = this.userCards.find(
        (c) => !used.has(c.instanceId) && PLAYER_MAP[c.playerId]?.position === slot.position
      );
      if (match) {
        starters[slot.slotId] = match.instanceId;
        used.add(match.instanceId);
      } else {
        const anyCard = this.userCards.find((c) => !used.has(c.instanceId));
        if (anyCard) {
          starters[slot.slotId] = anyCard.instanceId;
          used.add(anyCard.instanceId);
        }
      }
    });

    const subs: string[] = [];
    this.userCards.forEach((c) => {
      if (!used.has(c.instanceId) && subs.length < 7) {
        subs.push(c.instanceId);
        used.add(c.instanceId);
      }
    });

    const stats = calculateTeamStats('4-3-3', starters, this.userCards);
    return {
      formation: '4-3-3',
      starters,
      subs,
      teamName: this.profile?.username ? `${this.profile.username} XI` : 'FC ドリームイレブン',
      teamOvr: stats.teamOvr,
      chemistry: stats.chemistry,
      updatedAt: new Date().toISOString(),
    };
  }

  private async syncWithSupabase() {
    if (!supabase || !this.profile) return;
    try {
      // 1. Sync Profile
      await supabase.from('profiles').upsert({
        user_id: this.profile.user_id,
        username: this.profile.username,
        sc: this.profile.sc,
        mp: this.profile.mp,
        training_pt: this.profile.trainingPt,
        pity_count_normal: this.profile.pityCountNormal,
        pity_count_half: this.profile.pityCountHalf,
        pity_count_premium: this.profile.pityCountPremium,
        language: this.profile.language,
        updated_at: new Date().toISOString(),
      });

      // 2. Sync My Team
      if (this.myTeam) {
        await supabase.from('my_team').upsert({
          user_id: this.profile.user_id,
          formation: this.myTeam.formation,
          starters: this.myTeam.starters,
          subs: this.myTeam.subs,
          team_name: this.myTeam.teamName,
          team_ovr: this.myTeam.teamOvr,
          chemistry: this.myTeam.chemistry,
          updated_at: new Date().toISOString(),
        });
      }

      // 3. Sync User Cards
      if (this.userCards && this.userCards.length > 0) {
        const cardsPayload = this.userCards.map((c) => ({
          user_id: this.profile!.user_id,
          instance_id: c.instanceId,
          player_id: c.playerId,
          serial_number: c.serialNumber,
          card_id_display: c.cardIdDisplay,
          training_lv: c.trainingLv,
          is_awakened: c.isAwakened,
          is_favorite: c.isFavorite,
          is_locked: c.isLocked,
          is_listed: c.isListed || false,
          acquired_at: c.acquiredAt,
        }));
        await supabase.from('user_cards').upsert(cardsPayload, { onConflict: 'instance_id' });
      }
    } catch (err) {
      console.warn('Supabase synchronization note:', err);
    }
  }
}

export const gameStorage = new GameStorageService();

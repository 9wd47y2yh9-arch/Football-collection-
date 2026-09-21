import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserCard,
  MarketListing,
  DailyMission,
  SeasonMission,
  HistoryRecord,
  GameNotification,
  OnlinePlayer,
  SavedAccountSummary,
} from './types';
import { gameStorage } from './services/storage';
import { soundEngine } from './services/audio';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { StartupFlow } from './components/StartupFlow';
import { CurrencyExchangeModal } from './components/CurrencyExchangeModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CardDetailModal } from './components/CardDetailModal';
import { SellListingModal } from './components/SellListingModal';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { TradeModal } from './components/TradeModal';
import { AccountManagementModal } from './components/AccountManagementModal';
import { HomeView } from './views/HomeView';
import { ScoutView } from './views/ScoutView';
import { MarketView } from './views/MarketView';
import { AuctionView } from './views/AuctionView';
import { MyCardsView } from './views/MyCardsView';
import { MyTeamView } from './views/MyTeamView';
import { CollectionView } from './views/CollectionView';
import { MissionsView } from './views/MissionsView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showStartupFlow, setShowStartupFlow] = useState(false);

  // App State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [seasonMissions, setSeasonMissions] = useState<SeasonMission[]>([]);
  const [missionPoints, setMissionPoints] = useState<number>(0);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccountSummary[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<TabType | 'settings'>('home');

  // Modals
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedDetailCard, setSelectedDetailCard] = useState<UserCard | null>(null);
  const [cardToSell, setCardToSell] = useState<UserCard | null>(null);
  const [selectedOnlinePlayer, setSelectedOnlinePlayer] = useState<OnlinePlayer | null>(null);
  const [tradeTargetPlayer, setTradeTargetPlayer] = useState<OnlinePlayer | null>(null);
  const [tradeTargetCard, setTradeTargetCard] = useState<UserCard | undefined>(undefined);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Audio state
  const [bgmActive, setBgmActive] = useState(true);

  // Sync state helper
  const refreshState = useCallback(() => {
    setProfile(gameStorage.getProfile());
    setCards(gameStorage.getUserCards());
    setMarketListings(gameStorage.getMarketListings());
    setDailyMissions(gameStorage.getDailyMissions());
    setSeasonMissions(gameStorage.getSeasonMissions());
    setMissionPoints(gameStorage.getMissionPoints());
    setHistory(gameStorage.getHistory());
    setNotifications(gameStorage.getNotifications());
    setOnlinePlayers(gameStorage.getOnlinePlayers());
    setSavedAccounts(gameStorage.getSavedAccounts());
  }, []);

  // Initialize storage
  useEffect(() => {
    async function init() {
      const { isFirstTime, profile: initialProfile } = await gameStorage.initialize();
      setProfile(initialProfile);
      refreshState();

      if (isFirstTime || !initialProfile.termsAccepted || !initialProfile.tutorialCompleted) {
        setShowStartupFlow(true);
      } else {
        setShowStartupFlow(false);
      }
      setIsReady(true);
    }
    init();
  }, [refreshState]);

  // Handler for completing startup flow
  const handleStartupComplete = ({
    username,
    birthdate,
    age,
  }: {
    username: string;
    birthdate: string;
    age?: number;
  }) => {
    gameStorage.acceptTermsAndPrivacy();
    gameStorage.updateUsername(username);
    gameStorage.updateBirthdateAndAge(birthdate, age);
    gameStorage.completeTutorial();
    refreshState();
    setShowStartupFlow(false);
    setActiveTab('scout'); // Direct to Scout for free 10-pull!
  };

  // Currency Exchange
  const handleExchange = (amountMp: number) => {
    const res = gameStorage.exchangeMpToSc(amountMp);
    refreshState();
    return res;
  };

  // Scout
  const handlePerformScout = (
    bannerId: 'normal' | 'half' | 'premium' | 'legend',
    pullCount: 1 | 10 | 50,
    isFreePull = false
  ) => {
    const res = gameStorage.performScout(bannerId, pullCount, isFreePull);
    refreshState();
    return res;
  };

  // Market
  const handleBuyMarketListing = (listingId: string) => {
    const res = gameStorage.buyMarketListing(listingId);
    refreshState();
    return res;
  };

  const handleCancelMarketListing = (listingId: string) => {
    const res = gameStorage.cancelListing(listingId);
    refreshState();
    return res;
  };

  const handlePlaceBid = (listingId: string, amount: number) => {
    const res = gameStorage.placeBid(listingId, amount);
    refreshState();
    return res;
  };

  const handleCreateListing = (
    cardInstanceId: string,
    type: 'fixed' | 'auction',
    price: number,
    minBid?: number,
    durationDays?: number
  ) => {
    const res = gameStorage.createMarketListing(cardInstanceId, type, price, minBid, durationDays);
    refreshState();
    return res;
  };

  // Card training & awakening
  const handleTrainCard = (cardInstanceId: string) => {
    const res = gameStorage.trainCard(cardInstanceId);
    refreshState();
    const updatedCard = gameStorage.getUserCards().find((c) => c.instanceId === cardInstanceId);
    if (updatedCard) setSelectedDetailCard(updatedCard);
    return res;
  };

  const handleAwakenCard = (cardInstanceId: string) => {
    const res = gameStorage.awakenCard(cardInstanceId);
    refreshState();
    const updatedCard = gameStorage.getUserCards().find((c) => c.instanceId === cardInstanceId);
    if (updatedCard) setSelectedDetailCard(updatedCard);
    return res;
  };

  // Favorite & Lock
  const handleToggleFavorite = (cardInstanceId: string) => {
    gameStorage.toggleFavorite(cardInstanceId);
    refreshState();
  };

  const handleToggleLock = (cardInstanceId: string) => {
    gameStorage.toggleLock(cardInstanceId);
    refreshState();
    const updatedCard = gameStorage.getUserCards().find((c) => c.instanceId === cardInstanceId);
    if (updatedCard) setSelectedDetailCard(updatedCard);
  };

  // Missions
  const handleClaimMissionRewardChoice = (rewardType: 'trainingPt' | 'sc' | 'mp') => {
    const res = gameStorage.claimMissionRewardChoice(rewardType);
    refreshState();
    return res;
  };

  const handleClaimSeasonMission = (missionId: string) => {
    const res = gameStorage.claimSeasonMission(missionId);
    refreshState();
    return res;
  };

  // Profile & Accounts
  const handleUpdateUsername = (name: string) => {
    const res = gameStorage.updateUsername(name);
    refreshState();
    return res;
  };

  const handleSwitchAccount = (targetUserId: string) => {
    gameStorage.switchAccount(targetUserId);
    refreshState();
    setShowAccountModal(false);
    setActiveTab('home');
  };

  const handleLogout = () => {
    gameStorage.logout();
    refreshState();
    setShowAccountModal(false);
    setShowStartupFlow(true);
  };

  const handleCreateNewAccount = (newUsername: string, birthdate: string) => {
    gameStorage.createNewAccount(newUsername, birthdate);
    refreshState();
    setShowAccountModal(false);
    setActiveTab('scout');
  };

  // Trading
  const handleExecuteTrade = (
    targetUserId: string,
    offeredCardInstanceId: string,
    requestedCardInstanceId: string
  ) => {
    const res = gameStorage.proposeAndExecuteTrade(
      targetUserId,
      offeredCardInstanceId,
      requestedCardInstanceId
    );
    refreshState();
    return res;
  };

  if (!isReady || !profile) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-['Chakra_Petch'] font-bold text-sm tracking-widest uppercase text-cyan-400">
          Loading Football Collection...
        </span>
      </div>
    );
  }

  // Startup onboarding view
  if (showStartupFlow) {
    return <StartupFlow onComplete={handleStartupComplete} />;
  }

  const uncompletedMissionsCount = dailyMissions.filter((m) => !m.isCompleted).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Sticky Header */}
      <Header
        profile={profile}
        notifications={notifications}
        onOpenExchange={() => setShowExchangeModal(true)}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onNavigateSettings={() => setActiveTab('settings')}
      />

      {/* Main Tab View Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 pb-24">
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            cards={cards}
            marketListings={marketListings}
            dailyMissions={dailyMissions}
            onlinePlayers={onlinePlayers}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenExchange={() => setShowExchangeModal(true)}
            onSelectCard={(card) => setSelectedDetailCard(card)}
            onSelectOnlinePlayer={(p) => setSelectedOnlinePlayer(p)}
          />
        )}

        {activeTab === 'scout' && (
          <ScoutView
            profile={profile}
            onPerformScout={handlePerformScout}
            onCardClick={(card) => setSelectedDetailCard(card)}
          />
        )}

        {activeTab === 'market' && (
          <MarketView
            profile={profile}
            listings={marketListings}
            onBuyListing={handleBuyMarketListing}
            onCancelListing={handleCancelMarketListing}
            onMarkMarketViewed={() => gameStorage.markMarketViewed()}
            onSelectListingCard={(listing) => setSelectedDetailCard(listing.cardInstance)}
          />
        )}

        {activeTab === 'auction' && (
          <AuctionView
            profile={profile}
            listings={marketListings}
            onPlaceBid={handlePlaceBid}
            onMarkAuctionViewed={() => gameStorage.markAuctionViewed()}
            onSelectListingCard={(listing) => setSelectedDetailCard(listing.cardInstance)}
          />
        )}

        {activeTab === 'myteam' && (
          <MyTeamView onCardClick={(card) => setSelectedDetailCard(card)} />
        )}

        {activeTab === 'mycards' && (
          <MyCardsView
            profile={profile}
            cards={cards}
            onSelectCard={(card) => setSelectedDetailCard(card)}
            onToggleFavorite={handleToggleFavorite}
            onToggleLock={handleToggleLock}
            onOpenSellModal={(card) => setCardToSell(card)}
          />
        )}

        {activeTab === 'collection' && (
          <CollectionView
            userCards={cards}
            onSelectOwnedCard={(card) => setSelectedDetailCard(card)}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsView
            dailyMissions={dailyMissions}
            seasonMissions={seasonMissions}
            missionPoints={missionPoints}
            onClaimRewardChoice={handleClaimMissionRewardChoice}
            onClaimSeasonMission={handleClaimSeasonMission}
          />
        )}

        {activeTab === 'history' && <HistoryView history={history} />}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateUsername={handleUpdateUsername}
            onOpenAccountManagement={() => setShowAccountModal(true)}
            onClose={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab === 'settings' ? 'home' : activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        pendingMissionsCount={uncompletedMissionsCount}
        hasFreeScoutAvailable={!profile.isFreeTenPullClaimed}
      />

      {/* Currency Exchange Modal */}
      {showExchangeModal && (
        <CurrencyExchangeModal
          currentMp={profile.mp}
          currentSc={profile.sc}
          onExchange={handleExchange}
          onClose={() => setShowExchangeModal(false)}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <NotificationsModal
          notifications={notifications}
          onMarkRead={(id) => {
            gameStorage.markNotificationRead(id);
            refreshState();
          }}
          onClearAll={() => {
            gameStorage.clearAllNotifications();
            refreshState();
          }}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}

      {/* Card Detail & Training Modal */}
      {selectedDetailCard && (
        <CardDetailModal
          card={selectedDetailCard}
          userTrainingPt={profile.trainingPt}
          onTrain={handleTrainCard}
          onAwaken={handleAwakenCard}
          onToggleLock={handleToggleLock}
          onOpenSellModal={(c) => {
            setSelectedDetailCard(null);
            setCardToSell(c);
          }}
          onClose={() => setSelectedDetailCard(null)}
        />
      )}

      {/* Sell Listing Modal */}
      {cardToSell && (
        <SellListingModal
          card={cardToSell}
          onListingCreated={handleCreateListing}
          onClose={() => setCardToSell(null)}
        />
      )}

      {/* Online Player Profile Modal */}
      {selectedOnlinePlayer && (
        <PlayerProfileModal
          player={selectedOnlinePlayer}
          onInitiateTrade={(targetPlayer, targetCard) => {
            setSelectedOnlinePlayer(null);
            setTradeTargetPlayer(targetPlayer);
            setTradeTargetCard(targetCard);
          }}
          onClose={() => setSelectedOnlinePlayer(null)}
        />
      )}

      {/* 1:1 Direct Card Trade Modal */}
      {tradeTargetPlayer && (
        <TradeModal
          targetPlayer={tradeTargetPlayer}
          userCards={cards}
          initialTargetCard={tradeTargetCard}
          canTradeToday={gameStorage.canTradeToday()}
          dailyTradesCount={gameStorage.getDailyTradesCompleted()}
          onExecuteTrade={handleExecuteTrade}
          onClose={() => {
            setTradeTargetPlayer(null);
            setTradeTargetCard(undefined);
          }}
        />
      )}

      {/* Multi-Account Management Modal */}
      {showAccountModal && (
        <AccountManagementModal
          currentProfile={profile}
          savedAccounts={savedAccounts}
          onSwitchAccount={handleSwitchAccount}
          onLogout={handleLogout}
          onCreateNewAccount={handleCreateNewAccount}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MyTeam, FormationType, UserCard, Position } from '../types';
import { FORMATIONS, getCardEffectiveOvr } from '../utils/formation';
import { PLAYER_MAP } from '../data/players';
import { gameStorage } from '../services/storage';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import {
  Shield,
  Zap,
  Sparkles,
  Users,
  CheckCircle2,
  RefreshCw,
  Edit2,
  X,
  Plus,
  ArrowRightLeft,
  ChevronDown,
} from 'lucide-react';

interface MyTeamViewProps {
  onCardClick?: (card: UserCard) => void;
}

export const MyTeamView: React.FC<MyTeamViewProps> = ({ onCardClick }) => {
  const { t } = useI18n();
  const [team, setTeam] = useState<MyTeam>(() => gameStorage.getMyTeam());
  const [userCards, setUserCards] = useState<UserCard[]>(() => gameStorage.getUserCards());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState(team.teamName);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Position filter for card picker
  const [posFilter, setPosFilter] = useState<'ALL' | 'FW' | 'MF' | 'DF' | 'GK'>('ALL');

  useEffect(() => {
    const loadedTeam = gameStorage.getMyTeam();
    setTeam(loadedTeam);
    setEditedTeamName(loadedTeam.teamName);
    setUserCards(gameStorage.getUserCards());
  }, []);

  const currentFormation = FORMATIONS[team.formation] || FORMATIONS['4-3-3'];
  const cardMap = new Map(userCards.map((c) => [c.instanceId, c]));

  // Switch formation
  const handleSelectFormation = (fType: FormationType) => {
    soundEngine.playButtonClick();
    const updated = {
      ...team,
      formation: fType,
    };
    const saved = gameStorage.saveMyTeam(updated);
    setTeam(saved.team);
  };

  // Auto-pick best XI
  const handleAutoPick = () => {
    soundEngine.playButtonClick();
    const formation = FORMATIONS[team.formation] || FORMATIONS['4-3-3'];
    const newStarters: Record<string, string> = {};
    const used = new Set<string>();

    // Sort owned cards by effective OVR descending
    const sortedCards = [...userCards].sort((a, b) => {
      const pA = PLAYER_MAP[a.playerId];
      const pB = PLAYER_MAP[b.playerId];
      return (pB?.ovr || 0) - (pA?.ovr || 0);
    });

    // 1. Pass 1: exact position match
    formation.slots.forEach((slot) => {
      const match = sortedCards.find(
        (c) => !used.has(c.instanceId) && PLAYER_MAP[c.playerId]?.position === slot.position
      );
      if (match) {
        newStarters[slot.slotId] = match.instanceId;
        used.add(match.instanceId);
      }
    });

    // 2. Pass 2: fill remaining slots with highest OVR available
    formation.slots.forEach((slot) => {
      if (!newStarters[slot.slotId]) {
        const anyCard = sortedCards.find((c) => !used.has(c.instanceId));
        if (anyCard) {
          newStarters[slot.slotId] = anyCard.instanceId;
          used.add(anyCard.instanceId);
        }
      }
    });

    // 3. Bench slots (up to 7)
    const newSubs: string[] = [];
    sortedCards.forEach((c) => {
      if (!used.has(c.instanceId) && newSubs.length < 7) {
        newSubs.push(c.instanceId);
        used.add(c.instanceId);
      }
    });

    const updated = {
      ...team,
      starters: newStarters,
      subs: newSubs,
    };
    const res = gameStorage.saveMyTeam(updated);
    setTeam(res.team);
    soundEngine.playTradeCompleted();
    setSaveStatus('おまかせ最強イレブンを編成しました！');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Assign card to slot
  const handleAssignCardToSlot = (slotId: string, cardInstanceId: string) => {
    soundEngine.playButtonClick();
    const currentStarters = { ...team.starters };

    // If card was in another starter slot, swap them
    const existingSlot = Object.keys(currentStarters).find((k) => currentStarters[k] === cardInstanceId);
    if (existingSlot && existingSlot !== slotId) {
      currentStarters[existingSlot] = currentStarters[slotId] || '';
    }
    currentStarters[slotId] = cardInstanceId;

    // Remove from subs if it was in bench
    const newSubs = team.subs.filter((id) => id !== cardInstanceId);

    const updated = {
      ...team,
      starters: currentStarters,
      subs: newSubs,
    };
    const res = gameStorage.saveMyTeam(updated);
    setTeam(res.team);
    setSelectedSlotId(null);
  };

  // Remove card from starter slot
  const handleRemoveFromSlot = (slotId: string) => {
    soundEngine.playButtonClick();
    const currentStarters = { ...team.starters };
    delete currentStarters[slotId];
    const updated = { ...team, starters: currentStarters };
    const res = gameStorage.saveMyTeam(updated);
    setTeam(res.team);
    setSelectedSlotId(null);
  };

  // Save team name
  const handleSaveTeamName = () => {
    soundEngine.playButtonClick();
    if (!editedTeamName.trim()) return;
    const updated = { ...team, teamName: editedTeamName.trim() };
    const res = gameStorage.saveMyTeam(updated);
    setTeam(res.team);
    setIsEditingName(false);
  };

  // Filter available cards for modal
  const selectedSlot = currentFormation.slots.find((s) => s.slotId === selectedSlotId);
  const eligibleCards = userCards.filter((c) => {
    const p = PLAYER_MAP[c.playerId];
    if (!p) return false;
    if (posFilter === 'ALL') return true;
    if (posFilter === 'FW') return ['CF', 'ST', 'LWG', 'RWG'].includes(p.position);
    if (posFilter === 'MF') return ['AMF', 'CMF', 'DMF'].includes(p.position);
    if (posFilter === 'DF') return ['CB', 'LB', 'RB'].includes(p.position);
    if (posFilter === 'GK') return p.position === 'GK';
    return true;
  });

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTeamName}
                    onChange={(e) => setEditedTeamName(e.target.value)}
                    maxLength={25}
                    className="bg-slate-950 border border-cyan-500/50 rounded-xl px-2.5 py-1 text-white font-bold text-base focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    onClick={handleSaveTeamName}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded-xl text-xs transition"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    {team.teamName || 'マイチーム'}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-cyan-400 transition"
                    title="チーム名を変更"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              所持カードから最強のイレブンを編成し、クラブ・国籍ケミストリーを最大化
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            {/* Team OVR */}
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-base shadow-md">
                {team.teamOvr}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">チーム総合力</span>
                <span className="text-xs font-bold text-cyan-300">Team OVR</span>
              </div>
            </div>

            {/* Chemistry */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-slate-950 text-base shadow-md">
                {team.chemistry}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">ケミストリー</span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${team.chemistry}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Auto Pick Button */}
            <button
              onClick={handleAutoPick}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-3 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition active:scale-95 shrink-0"
              title="おまかせで最高OVRの選手を自動編成"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>おまかせ最強編成</span>
            </button>
          </div>
        </div>

        {/* Formation Selector Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 shrink-0">フォーメーション:</span>
          {(['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '3-4-3'] as FormationType[]).map((fKey) => {
            const isSelected = team.formation === fKey;
            return (
              <button
                key={fKey}
                onClick={() => handleSelectFormation(fKey)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {fKey}
              </button>
            );
          })}
          <span className="text-[11px] text-slate-500 italic ml-2 hidden sm:inline truncate">
            {currentFormation.description}
          </span>
        </div>
      </div>

      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </motion.div>
      )}

      {/* Main Pitch Field */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/11] max-h-[640px] bg-gradient-to-b from-emerald-800 via-emerald-900 to-green-950 rounded-3xl border-4 border-emerald-700/60 shadow-2xl overflow-hidden p-2 sm:p-4 select-none">
        {/* Grass Pattern stripes */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(0,0,0,0.2)_40px,rgba(0,0,0,0.2)_80px)]" />

        {/* Pitch Lines */}
        <div className="absolute inset-3 border-2 border-white/30 rounded-2xl pointer-events-none">
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-28 sm:w-36 h-28 sm:h-36 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />

          {/* Penalty box top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 sm:w-72 h-20 sm:h-24 border-b-2 border-x-2 border-white/30 rounded-b-lg" />
          {/* Penalty box bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 sm:w-72 h-20 sm:h-24 border-t-2 border-x-2 border-white/30 rounded-t-lg" />
        </div>

        {/* Formation Position Slots */}
        {currentFormation.slots.map((slot) => {
          const assignedCardId = team.starters[slot.slotId];
          const card = assignedCardId ? cardMap.get(assignedCardId) : undefined;
          const player = card ? PLAYER_MAP[card.playerId] : undefined;
          const effOvr = card ? getCardEffectiveOvr(card, slot.position) : 0;
          const isPosMatch = player ? player.position === slot.position : false;

          return (
            <div
              key={slot.slotId}
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setSelectedSlotId(slot.slotId);
                }}
                className="group flex flex-col items-center focus:outline-none transition active:scale-95"
              >
                {card && player ? (
                  /* Filled Player Token */
                  <div className="relative flex flex-col items-center">
                    {/* Glowing outer disc */}
                    <div
                      className={`relative w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center p-1 border-2 shadow-xl transition-all group-hover:scale-105 ${
                        player.rarity === 'SSR'
                          ? 'border-yellow-400 bg-gradient-to-br from-amber-500 to-yellow-600 shadow-yellow-500/30'
                          : player.rarity === 'SR'
                          ? 'border-purple-400 bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-500/20'
                          : 'border-cyan-400 bg-gradient-to-br from-slate-800 to-cyan-900'
                      }`}
                    >
                      {/* OVR top badge */}
                      <span className="absolute -top-2 -left-2 bg-slate-950 border border-cyan-400/80 text-cyan-300 font-black text-[10px] sm:text-xs px-1.5 py-0.2 rounded-md shadow-md">
                        {effOvr}
                      </span>

                      {/* Position Tag */}
                      <span
                        className={`absolute -top-2 -right-2 text-[9px] font-bold px-1 rounded shadow ${
                          isPosMatch ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {slot.label}
                      </span>

                      {/* Player Jersey Number & Rarity */}
                      <div className="text-center select-none">
                        <span className="font-mono text-white/90 font-bold text-xs sm:text-sm block leading-none">
                          #{player.number}
                        </span>
                        <span className="text-[9px] text-white/70 font-bold uppercase block mt-0.5">
                          {player.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Player Name Pill */}
                    <div className="mt-1 bg-slate-950/90 border border-slate-700/80 rounded-lg px-2 py-0.5 shadow-md text-center max-w-[84px] sm:max-w-[110px] truncate">
                      <span className="text-[10px] sm:text-xs font-bold text-white truncate block">
                        {player.name}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 truncate block">
                        {player.club}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty Slot Placeholder */
                  <div className="flex flex-col items-center">
                    <div className="w-11 sm:w-14 h-11 sm:h-14 rounded-2xl border-2 border-dashed border-white/40 hover:border-cyan-400 bg-black/30 hover:bg-cyan-950/40 flex items-center justify-center text-white/70 hover:text-cyan-300 transition group-hover:scale-105 shadow-md">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-white/80 bg-black/60 px-1.5 py-0.2 rounded">
                      {slot.label}
                    </span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bench / Substitutes Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white">ベンチメンバー (Substitutes)</h3>
            <span className="text-xs text-slate-400">({team.subs.length}/7名)</span>
          </div>
          <span className="text-[11px] text-slate-500">スタメンの交代要員</span>
        </div>

        {team.subs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            ベンチ選手が未登録です。「おまかせ最強編成」で自動編成できます。
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {team.subs.map((instanceId) => {
              const card = cardMap.get(instanceId);
              if (!card) return null;
              const player = PLAYER_MAP[card.playerId];
              if (!player) return null;

              return (
                <div
                  key={instanceId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-2 flex flex-col items-center text-center shadow-md relative group hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between w-full text-[10px] mb-1">
                    <span className="font-bold text-cyan-300">{player.position}</span>
                    <span className="font-black text-amber-400">{player.ovr}</span>
                  </div>
                  <span className="font-bold text-xs text-white truncate max-w-full">
                    {player.name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate max-w-full mt-0.5">
                    {player.club}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Card Picker for Slot */}
      <AnimatePresence>
        {selectedSlotId && selectedSlot && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                    <span>ポジション配置: {selectedSlot.label} ({selectedSlot.position})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    このスロットに配置する選手カードを選択してください
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSlotId(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Position Filter Pills */}
              <div className="flex items-center gap-1.5 my-3">
                {(['ALL', 'FW', 'MF', 'DF', 'GK'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPosFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      posFilter === filter
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {filter}
                  </button>
                ))}

                {team.starters[selectedSlot.slotId] && (
                  <button
                    onClick={() => handleRemoveFromSlot(selectedSlot.slotId)}
                    className="ml-auto text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 bg-rose-950/40 rounded-xl border border-rose-800/40 transition"
                  >
                    スロットを外す
                  </button>
                )}
              </div>

              {/* Cards Grid */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {eligibleCards.map((card) => {
                  const player = PLAYER_MAP[card.playerId];
                  if (!player) return null;
                  const isAlreadyInSlot = team.starters[selectedSlot.slotId] === card.instanceId;
                  const effOvr = getCardEffectiveOvr(card, selectedSlot.position);
                  const isMatchingPos = player.position === selectedSlot.position;

                  return (
                    <button
                      key={card.instanceId}
                      type="button"
                      onClick={() => handleAssignCardToSlot(selectedSlot.slotId, card.instanceId)}
                      className={`text-left p-2.5 rounded-2xl border transition flex items-center justify-between ${
                        isAlreadyInSlot
                          ? 'bg-cyan-950/40 border-cyan-400'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                            player.rarity === 'SSR'
                              ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950'
                              : player.rarity === 'SR'
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {player.rarity}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white">{player.name}</span>
                            {isMatchingPos && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/40">
                                適正
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {player.club} • {player.nationality}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-cyan-300 block">{effOvr}</span>
                        <span className="text-[10px] text-slate-500">{player.position}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

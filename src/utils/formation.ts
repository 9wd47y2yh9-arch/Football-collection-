import { FormationType, FormationSlot, Position, UserCard, Player } from '../types';
import { PLAYER_MAP } from '../data/players';

export interface FormationConfig {
  id: FormationType;
  name: string;
  description: string;
  slots: FormationSlot[];
}

export const FORMATIONS: Record<FormationType, FormationConfig> = {
  '4-3-3': {
    id: '4-3-3',
    name: '4-3-3 (アタック)',
    description: '両ウイングを活かしたサイドアタックと高い前線プレス',
    slots: [
      { slotId: 'gk', position: 'GK', x: 50, y: 88, label: 'GK' },
      { slotId: 'lb', position: 'LB', x: 16, y: 70, label: 'LB' },
      { slotId: 'cb1', position: 'CB', x: 38, y: 73, label: 'CB' },
      { slotId: 'cb2', position: 'CB', x: 62, y: 73, label: 'CB' },
      { slotId: 'rb', position: 'RB', x: 84, y: 70, label: 'RB' },
      { slotId: 'cmf1', position: 'CMF', x: 28, y: 46, label: 'CMF' },
      { slotId: 'dmf', position: 'DMF', x: 50, y: 53, label: 'DMF' },
      { slotId: 'cmf2', position: 'CMF', x: 72, y: 46, label: 'CMF' },
      { slotId: 'lwg', position: 'LWG', x: 20, y: 20, label: 'LWG' },
      { slotId: 'cf', position: 'CF', x: 50, y: 15, label: 'CF' },
      { slotId: 'rwg', position: 'RWG', x: 80, y: 20, label: 'RWG' },
    ],
  },
  '4-4-2': {
    id: '4-4-2',
    name: '4-4-2 (クラシック)',
    description: '攻守のバランスに優れ、2トップの連携が武器の伝統陣形',
    slots: [
      { slotId: 'gk', position: 'GK', x: 50, y: 88, label: 'GK' },
      { slotId: 'lb', position: 'LB', x: 16, y: 70, label: 'LB' },
      { slotId: 'cb1', position: 'CB', x: 38, y: 73, label: 'CB' },
      { slotId: 'cb2', position: 'CB', x: 62, y: 73, label: 'CB' },
      { slotId: 'rb', position: 'RB', x: 84, y: 70, label: 'RB' },
      { slotId: 'lm', position: 'LWG', x: 18, y: 44, label: 'LM' },
      { slotId: 'cmf1', position: 'CMF', x: 38, y: 47, label: 'CMF' },
      { slotId: 'cmf2', position: 'CMF', x: 62, y: 47, label: 'CMF' },
      { slotId: 'rm', position: 'RWG', x: 82, y: 44, label: 'RM' },
      { slotId: 'cf1', position: 'CF', x: 38, y: 18, label: 'CF' },
      { slotId: 'cf2', position: 'CF', x: 62, y: 18, label: 'ST' },
    ],
  },
  '3-5-2': {
    id: '3-5-2',
    name: '3-5-2 (ワイド)',
    description: '分厚い中盤支配と強力な両ウイングバックの攻撃参加',
    slots: [
      { slotId: 'gk', position: 'GK', x: 50, y: 88, label: 'GK' },
      { slotId: 'cb1', position: 'CB', x: 26, y: 73, label: 'LCB' },
      { slotId: 'cb2', position: 'CB', x: 50, y: 75, label: 'CB' },
      { slotId: 'cb3', position: 'CB', x: 74, y: 73, label: 'RCB' },
      { slotId: 'lwb', position: 'LB', x: 14, y: 48, label: 'LWB' },
      { slotId: 'cmf1', position: 'CMF', x: 35, y: 50, label: 'CMF' },
      { slotId: 'dmf', position: 'DMF', x: 50, y: 57, label: 'DMF' },
      { slotId: 'cmf2', position: 'CMF', x: 65, y: 50, label: 'CMF' },
      { slotId: 'rwb', position: 'RB', x: 86, y: 48, label: 'RWB' },
      { slotId: 'cf1', position: 'CF', x: 38, y: 18, label: 'CF' },
      { slotId: 'cf2', position: 'CF', x: 62, y: 18, label: 'ST' },
    ],
  },
  '4-2-3-1': {
    id: '4-2-3-1',
    name: '4-2-3-1 (ポゼッション)',
    description: 'ダブルボランチの安定感とトップ下の創造性を活かした布陣',
    slots: [
      { slotId: 'gk', position: 'GK', x: 50, y: 88, label: 'GK' },
      { slotId: 'lb', position: 'LB', x: 16, y: 70, label: 'LB' },
      { slotId: 'cb1', position: 'CB', x: 38, y: 73, label: 'CB' },
      { slotId: 'cb2', position: 'CB', x: 62, y: 73, label: 'CB' },
      { slotId: 'rb', position: 'RB', x: 84, y: 70, label: 'RB' },
      { slotId: 'dmf1', position: 'DMF', x: 38, y: 54, label: 'DMF' },
      { slotId: 'dmf2', position: 'DMF', x: 62, y: 54, label: 'DMF' },
      { slotId: 'lam', position: 'AMF', x: 22, y: 34, label: 'LAM' },
      { slotId: 'cam', position: 'AMF', x: 50, y: 32, label: 'CAM' },
      { slotId: 'ram', position: 'AMF', x: 78, y: 34, label: 'RAM' },
      { slotId: 'cf', position: 'CF', x: 50, y: 15, label: 'ST' },
    ],
  },
  '3-4-3': {
    id: '3-4-3',
    name: '3-4-3 (オールアウト)',
    description: '圧倒的攻撃力を誇る超攻撃的フォーメーション',
    slots: [
      { slotId: 'gk', position: 'GK', x: 50, y: 88, label: 'GK' },
      { slotId: 'cb1', position: 'CB', x: 26, y: 73, label: 'LCB' },
      { slotId: 'cb2', position: 'CB', x: 50, y: 75, label: 'CB' },
      { slotId: 'cb3', position: 'CB', x: 74, y: 73, label: 'RCB' },
      { slotId: 'lm', position: 'LWG', x: 16, y: 46, label: 'LM' },
      { slotId: 'cmf1', position: 'CMF', x: 38, y: 48, label: 'CMF' },
      { slotId: 'cmf2', position: 'CMF', x: 62, y: 48, label: 'CMF' },
      { slotId: 'rm', position: 'RWG', x: 84, y: 46, label: 'RM' },
      { slotId: 'lwg', position: 'LWG', x: 20, y: 20, label: 'LW' },
      { slotId: 'cf', position: 'CF', x: 50, y: 15, label: 'CF' },
      { slotId: 'rwg', position: 'RWG', x: 80, y: 20, label: 'RW' },
    ],
  },
};

/**
 * Calculates effective OVR for a card based on training, awakening, and position match.
 */
export function getCardEffectiveOvr(card: UserCard, targetPosition?: Position): number {
  const player = PLAYER_MAP[card.playerId];
  if (!player) return 70;

  let ovr = player.ovr;
  // Training bonus: +1 OVR per 2 training levels
  ovr += Math.floor(card.trainingLv / 2);
  // Awakening bonus: +3 OVR
  if (card.isAwakened) {
    ovr += 3;
  }

  // Position compatibility penalty/bonus
  if (targetPosition && player.position !== targetPosition) {
    const isRelated = isPositionCompatible(player.position, targetPosition);
    if (!isRelated) {
      ovr = Math.max(50, ovr - 5);
    }
  }

  return ovr;
}

function isPositionCompatible(pos1: Position, pos2: Position): boolean {
  if (pos1 === pos2) return true;
  const attackGroup: Position[] = ['CF', 'ST', 'LWG', 'RWG', 'AMF'];
  const midGroup: Position[] = ['AMF', 'CMF', 'DMF', 'LWG', 'RWG'];
  const defGroup: Position[] = ['CB', 'LB', 'RB', 'DMF'];

  if (attackGroup.includes(pos1) && attackGroup.includes(pos2)) return true;
  if (midGroup.includes(pos1) && midGroup.includes(pos2)) return true;
  if (defGroup.includes(pos1) && defGroup.includes(pos2)) return true;
  return false;
}

/**
 * Calculates team OVR and chemistry based on starting 11 players.
 */
export function calculateTeamStats(
  formationType: FormationType,
  starters: Record<string, string>,
  userCards: UserCard[]
): { teamOvr: number; chemistry: number } {
  const formation = FORMATIONS[formationType] || FORMATIONS['4-3-3'];
  const cardMap = new Map(userCards.map((c) => [c.instanceId, c]));

  const startingPlayers: { card: UserCard; player: Player; slot: FormationSlot }[] = [];
  let totalEffectiveOvr = 0;
  let filledCount = 0;

  formation.slots.forEach((slot) => {
    const instanceId = starters[slot.slotId];
    if (instanceId && cardMap.has(instanceId)) {
      const card = cardMap.get(instanceId)!;
      const player = PLAYER_MAP[card.playerId];
      if (player) {
        startingPlayers.push({ card, player, slot });
        const effOvr = getCardEffectiveOvr(card, slot.position);
        totalEffectiveOvr += effOvr;
        filledCount++;
      }
    }
  });

  if (filledCount === 0) {
    return { teamOvr: 0, chemistry: 0 };
  }

  // Chemistry calculation
  let rawChemPoints = 0;

  // 1. Position match bonus (up to 33 points)
  startingPlayers.forEach(({ player, slot }) => {
    if (player.position === slot.position) {
      rawChemPoints += 3;
    } else if (isPositionCompatible(player.position, slot.position)) {
      rawChemPoints += 1.5;
    }
  });

  // 2. Club synergies (up to 30 points)
  const clubCounts: Record<string, number> = {};
  startingPlayers.forEach(({ player }) => {
    if (player.club) {
      clubCounts[player.club] = (clubCounts[player.club] || 0) + 1;
    }
  });
  Object.values(clubCounts).forEach((cnt) => {
    if (cnt >= 4) rawChemPoints += 10;
    else if (cnt === 3) rawChemPoints += 7;
    else if (cnt === 2) rawChemPoints += 4;
  });

  // 3. League synergies (up to 20 points)
  const leagueCounts: Record<string, number> = {};
  startingPlayers.forEach(({ player }) => {
    if (player.league) {
      leagueCounts[player.league] = (leagueCounts[player.league] || 0) + 1;
    }
  });
  Object.values(leagueCounts).forEach((cnt) => {
    if (cnt >= 5) rawChemPoints += 8;
    else if (cnt >= 3) rawChemPoints += 5;
    else if (cnt === 2) rawChemPoints += 2;
  });

  // 4. Nationality synergies (up to 20 points)
  const natCounts: Record<string, number> = {};
  startingPlayers.forEach(({ player }) => {
    if (player.nationality) {
      natCounts[player.nationality] = (natCounts[player.nationality] || 0) + 1;
    }
  });
  Object.values(natCounts).forEach((cnt) => {
    if (cnt >= 4) rawChemPoints += 8;
    else if (cnt === 3) rawChemPoints += 5;
    else if (cnt === 2) rawChemPoints += 3;
  });

  const chemistry = Math.min(100, Math.round((rawChemPoints / 85) * 100));

  // Base team OVR is average of 11 starters
  const baseAvgOvr = Math.round(totalEffectiveOvr / 11);
  // Chemistry adds up to +5 Team OVR bonus!
  const chemBonus = Math.floor(chemistry / 20);
  const teamOvr = filledCount >= 11 ? baseAvgOvr + chemBonus : Math.round((totalEffectiveOvr / 11));

  return { teamOvr, chemistry };
}

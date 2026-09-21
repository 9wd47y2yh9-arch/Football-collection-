import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { DailyMission, SeasonMission } from '../types';
import { soundEngine } from '../services/audio';
import {
  Target,
  Calendar,
  Award,
  Sparkles,
  Coins,
  Flame,
  Zap,
  CheckCircle,
  Clock,
  Gift,
} from 'lucide-react';

interface MissionsViewProps {
  dailyMissions: DailyMission[];
  seasonMissions: SeasonMission[];
  missionPoints: number;
  onClaimRewardChoice: (rewardType: 'trainingPt' | 'sc' | 'mp') => { success: boolean; message: string };
  onClaimSeasonMission: (missionId: string) => { success: boolean; message: string };
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  dailyMissions,
  seasonMissions,
  missionPoints,
  onClaimRewardChoice,
  onClaimSeasonMission,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'season'>('daily');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canClaimPointReward = missionPoints >= 50;

  const handleClaimChoice = (rewardType: 'trainingPt' | 'sc' | 'mp') => {
    soundEngine.playButtonClick();
    const res = onClaimRewardChoice(rewardType);
    if (res.success) {
      soundEngine.playMissionComplete();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleClaimSeason = (missionId: string) => {
    soundEngine.playButtonClick();
    const res = onClaimSeasonMission(missionId);
    if (res.success) {
      soundEngine.playMissionComplete();
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.5 } });
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-4 pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white leading-none">
              ミッション (Missions)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              課題を達成してポイントをため、お好みの豪華報酬を選んで獲得しよう！
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setActiveTab('daily');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'daily'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            デイリー
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setActiveTab('season');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'season'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            シーズン
          </button>
        </div>
      </div>

      {/* Point Reward Claim Banner (Only visible on daily tab) */}
      {activeTab === 'daily' && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="font-['Chakra_Petch'] font-bold text-base text-white">
                  ミッションポイント報酬 (50ptで1回選択)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ミッション達成で40ptずつ獲得！50ptごとに以下の3種類から選んで受け取れます。
              </p>
            </div>

            <div className="bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-800 flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">現在ポイント:</span>
              <span className="font-['Teko'] text-2xl font-bold text-emerald-300">
                {missionPoints} pt
              </span>
            </div>
          </div>

          {/* 3 Reward Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
            {/* Choice 1: Training Pt 30 */}
            <button
              type="button"
              disabled={!canClaimPointReward}
              onClick={() => handleClaimChoice('trainingPt')}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-left transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Training Pt 30</div>
                  <div className="text-[10px] text-slate-400">選手の育成に</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition">
                獲得
              </span>
            </button>

            {/* Choice 2: 100 SC */}
            <button
              type="button"
              disabled={!canClaimPointReward}
              onClick={() => handleClaimChoice('sc')}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-left transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">100 SC</div>
                  <div className="text-[10px] text-slate-400">スカウトに利用</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition">
                獲得
              </span>
            </button>

            {/* Choice 3: 10,000 MP */}
            <button
              type="button"
              disabled={!canClaimPointReward}
              onClick={() => handleClaimChoice('mp')}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-left transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">10,000 MP</div>
                  <div className="text-[10px] text-slate-400">市場取引に利用</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition">
                獲得
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
          }`}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Daily Missions List */}
      {activeTab === 'daily' && (
        <div className="space-y-2">
          {dailyMissions.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                m.isCompleted
                  ? 'bg-slate-950/90 border-emerald-500/40 text-white'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    m.isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {m.isCompleted ? <CheckCircle className="w-5 h-5" /> : `${m.point}pt`}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{m.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>進捗: {m.progress} / {m.target}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">報酬: +{m.point} pt</span>
                  </div>
                </div>
              </div>

              {m.isCompleted ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-700/60 shrink-0">
                  達成済み
                </span>
              ) : (
                <span className="text-xs text-slate-500 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 shrink-0">
                  進行中
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Season Missions List */}
      {activeTab === 'season' && (
        <div className="space-y-2">
          {seasonMissions.map((sm) => (
            <div
              key={sm.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                sm.isClaimed
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : sm.isCompleted
                  ? 'bg-slate-950/90 border-amber-500/50'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{sm.title}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>進捗: {sm.progress} / {sm.target}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">報酬: {sm.rewardDesc}</span>
                  </div>
                </div>
              </div>

              <div>
                {sm.isClaimed ? (
                  <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    受取済み
                  </span>
                ) : sm.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleClaimSeason(sm.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md hover:brightness-110 transition animate-bounce"
                  >
                    受け取る
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    進行中
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

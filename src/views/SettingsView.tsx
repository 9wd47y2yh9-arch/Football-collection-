import React, { useState } from 'react';
import { UserProfile, SavedAccountSummary } from '../types';
import { soundEngine } from '../services/audio';
import { useI18n, Language } from '../services/i18n';
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Music,
  User,
  ShieldCheck,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Database,
  Globe,
  Users,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateUsername: (name: string) => { success: boolean; message: string };
  onOpenAccountManagement: () => void;
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateUsername,
  onOpenAccountManagement,
  onClose,
}) => {
  const { currentLanguage, setLanguage, t } = useI18n();
  const [username, setUsername] = useState(profile.username);
  const [copiedId, setCopiedId] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Audio local state
  const [bgmEnabled, setBgmEnabled] = useState(soundEngine.bgmEnabled);
  const [bgmVol, setBgmVol] = useState(soundEngine.bgmVolume);
  const [seEnabled, setSeEnabled] = useState(soundEngine.seEnabled);
  const [seVol, setSeVol] = useState(soundEngine.seVolume);

  const handleSaveUsername = () => {
    soundEngine.playButtonClick();
    const res = onUpdateUsername(username);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 2000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCopyUserId = () => {
    soundEngine.playButtonClick();
    navigator.clipboard.writeText(profile.user_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleBgmToggle = () => {
    soundEngine.playButtonClick();
    const newState = !bgmEnabled;
    setBgmEnabled(newState);
    soundEngine.setBgmSettings(newState, bgmVol);
  };

  const handleBgmVolumeChange = (vol: number) => {
    setBgmVol(vol);
    soundEngine.setBgmSettings(bgmEnabled, vol);
  };

  const handleSeToggle = () => {
    soundEngine.playButtonClick();
    const newState = !seEnabled;
    setSeEnabled(newState);
    soundEngine.setSeSettings(newState, seVol);
  };

  const handleSeVolumeChange = (vol: number) => {
    setSeVol(vol);
    soundEngine.setSeSettings(seEnabled, vol);
  };

  const handleLanguageChange = (lang: Language) => {
    soundEngine.playButtonClick();
    setLanguage(lang);
  };

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-['Chakra_Petch'] text-2xl font-bold text-white leading-none">
              {t('settings_title')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              プロフィール、多言語設定、音響サウンド、アカウント管理
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
        >
          {t('close')}
        </button>
      </div>

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

      {/* Language Support Section (Requirement 6: 多言語対応) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
            {t('language_settings')}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'ja' as Language, label: '日本語 (JA)', sub: 'Japanese' },
            { id: 'en' as Language, label: 'English (EN)', sub: 'Global' },
            { id: 'es' as Language, label: 'Español (ES)', sub: 'Spanish' },
          ].map((lang) => {
            const isSelected = currentLanguage === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleLanguageChange(lang.id)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-xs">{lang.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{lang.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Management Quick Action (Requirement 10) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
              {t('account_management')}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {profile.username} (ID: {profile.user_id})
          </span>
        </div>

        <p className="text-xs text-slate-400">
          別のアカウントへのワンタップ切り替え、新しいアカウントの追加登録、またはログアウトを実行できます。データはSupabase上で安全に保持されます。
        </p>

        <button
          type="button"
          onClick={() => {
            soundEngine.playButtonClick();
            onOpenAccountManagement();
          }}
          className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 hover:bg-cyan-600/50 text-cyan-200 text-xs transition flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          <span>アカウント管理・切り替え画面を開く</span>
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <User className="w-4 h-4 text-cyan-400" />
          <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">オーナー情報</h3>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">オーナー名 (最大15文字)</label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={15}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleSaveUsername}
              className="px-4 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs shadow-md transition"
            >
              変更保存
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">ユーザーID (識別子)</label>
          <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <span>{profile.user_id}</span>
            <button
              type="button"
              onClick={handleCopyUserId}
              className="p-1 text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-[11px]"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'コピー完了' : 'コピー'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unified Audio Settings Section (Requirement 1: 1曲統一・差し替え可能構造) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Music className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">音響サウンド設定 (全画面統一BGM)</h3>
            <p className="text-[10px] text-slate-400">ゲーム全編で同一の公式アンセムBGMをシームレスループ再生</p>
          </div>
        </div>

        {/* BGM Toggle & Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">ゲーム全編共通 BGM</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${bgmEnabled ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'bg-slate-900 text-slate-500'}`}>
                  {bgmEnabled ? 'ループ再生中' : '停止中'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                公式メインテーマ（/audio/bgm.mp3 差し替え対応）
              </span>
            </div>

            <button
              type="button"
              onClick={handleBgmToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                bgmEnabled
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {bgmEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{bgmEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>BGM 音量</span>
              <span className="font-mono">{Math.round(bgmVol * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={bgmVol}
              onChange={(e) => handleBgmVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        {/* SE Toggle & Volume */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">SE（効果音）</span>
            <button
              type="button"
              onClick={handleSeToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                seEnabled
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {seEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{seEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>SE 音量</span>
              <span className="font-mono">{Math.round(seVol * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={seVol}
              onChange={(e) => handleSeVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Test SE Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => soundEngine.playCoinSound()}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-slate-300"
            >
              コイン効果音
            </button>
            <button
              type="button"
              onClick={() => soundEngine.playCardFlip()}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-slate-300"
            >
              カード反転
            </button>
            <button
              type="button"
              onClick={() => soundEngine.playTrainingSuccess()}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-cyan-300"
            >
              育成成功
            </button>
            <button
              type="button"
              onClick={() => soundEngine.playSSRFanfare()}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-[10px] text-yellow-300 font-bold"
            >
              SSRファンファーレ
            </button>
          </div>
        </div>
      </div>

      {/* System & Architecture Info */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">データ永続化＆システム仕様</h3>
        </div>

        <div className="text-xs text-slate-400 space-y-2">
          <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span>Supabase クラウド同期</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              同期エンジン稼働中 (永続保存)
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span>決済・課金機能</span>
            <span className="text-slate-300 font-semibold">完全無料 (外部決済無効)</span>
          </div>

          <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span>バージョン</span>
            <span className="font-mono text-slate-300">v2.0.0-PRO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

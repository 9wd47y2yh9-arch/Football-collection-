import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, SavedAccountSummary } from '../types';
import { soundEngine } from '../services/audio';
import { useI18n } from '../services/i18n';
import {
  Users,
  LogOut,
  UserPlus,
  ArrowRightLeft,
  X,
  CheckCircle,
  Coins,
  Flame,
  Layers,
  Calendar,
  Key,
} from 'lucide-react';

interface AccountManagementModalProps {
  currentProfile: UserProfile;
  savedAccounts: SavedAccountSummary[];
  onSwitchAccount: (userId: string) => void;
  onLogout: () => void;
  onCreateNewAccount: (username: string, birthdate: string) => void;
  onClose: () => void;
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  currentProfile,
  savedAccounts,
  onSwitchAccount,
  onLogout,
  onCreateNewAccount,
  onClose,
}) => {
  const { t } = useI18n();
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBirthdate, setNewBirthdate] = useState('2000-01-01');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playButtonClick();
    if (!newUsername.trim()) return;
    onCreateNewAccount(newUsername.trim(), newBirthdate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Chakra_Petch'] font-bold text-lg text-white">
                {t('account_management')}
              </h3>
              <p className="text-[11px] text-slate-400">
                アカウントの切り替え・新規作成・ログアウト
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Box */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-slate-900 border border-cyan-700/60 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold">
              {t('current_account')}
            </span>
            <span className="text-[11px] font-mono text-cyan-300 truncate max-w-[150px]">
              ID: {currentProfile.user_id}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h4 className="font-['Chakra_Petch'] font-black text-xl text-white">
              {currentProfile.username}
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-amber-300 font-mono">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {currentProfile.sc.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-cyan-300 font-mono">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                {currentProfile.mp.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Create New Account View or Form */}
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.form
              key="create-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateSubmit}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 mb-4"
            >
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>{t('create_new_account')}</span>
              </h4>

              <div>
                <label className="text-xs text-slate-300 block mb-1">新しいオーナー名 (最大15文字)</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="例: FCストライカー2号"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">生年月日</label>
                <input
                  type="date"
                  required
                  value={newBirthdate}
                  onChange={(e) => setNewBirthdate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110"
                >
                  {t('create_account_btn')}
                </button>
              </div>
            </motion.form>
          ) : (
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setIsCreating(true);
                }}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('create_new_account')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  if (window.confirm('ログアウトして初期登録画面へ戻りますか？（アカウントデータは保持されます）')) {
                    onLogout();
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-rose-800/60 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout_btn')}</span>
              </button>
            </div>
          )}
        </AnimatePresence>

        {/* Saved Accounts List */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{t('saved_accounts_list')}</span>
          </h4>

          {savedAccounts.length === 0 ? (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
              {t('no_other_accounts')}
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {savedAccounts.map((acc) => {
                const isCurrent = acc.user_id === currentProfile.user_id;
                return (
                  <div
                    key={acc.user_id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-600/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Chakra_Petch'] font-bold text-sm text-white">
                          {acc.username}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-black">
                            使用中
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">ID: {acc.user_id}</span>
                        <span>• 所持カード: {acc.cardCount}枚</span>
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playButtonClick();
                          onSwitchAccount(acc.user_id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>{t('switch_btn')}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../services/audio';
import { ShieldCheck, User, Calendar, Sparkles, CheckCircle, ChevronRight, Award } from 'lucide-react';

interface StartupFlowProps {
  onComplete: (data: { username: string; birthdate: string; age?: number }) => void;
}

export const StartupFlow: React.FC<StartupFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'loading' | 'terms' | 'age' | 'username' | 'tutorial'>('loading');
  const [loadProgress, setLoadProgress] = useState(0);

  // Form states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [notesAccepted, setNotesAccepted] = useState(false);

  const [birthdate, setBirthdate] = useState('2000-01-01');
  const [username, setUsername] = useState('FCストライカー');
  const [tutorialIndex, setTutorialIndex] = useState(0);

  // Simulate initial loading
  React.useEffect(() => {
    const timer = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setStep('terms'), 400);
          return 100;
        }
        return prev + 15;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const tutorialSteps = [
    {
      title: 'フットボールコレクションへようこそ！',
      desc: '実在のトップ選手たちを集め、カードをコレクション・育成・市場取引してあなただけの最強スカッドを目指す完全無料のWebサッカーカードゲームです。',
      icon: Award,
    },
    {
      title: '完全無料・課金一切なし',
      desc: 'リアルマネーの課金は一切ありません。ゲーム内通貨（SC & MP）のみを使用し、デイリーミッションやログインボーナスで毎日手に入ります。',
      icon: ShieldCheck,
    },
    {
      title: 'スカウトでスター選手を獲得',
      desc: '通常・半額・プレミアムスカウトで世界基準の選手たちを引こう！SSRカードには世界に1枚だけのシリアル番号が刻まれます。',
      icon: Sparkles,
    },
    {
      title: '自由な市場取引＆オークション',
      desc: '集めた選手をマーケットで即決販売したり、オークションに出品・入札してMPを獲得！MPはSCにいつでも交換可能です。',
      icon: Award,
    },
  ];

  const handleFinishTutorial = () => {
    soundEngine.playSSRFanfare();
    // Calculate approximate age
    const birthYear = new Date(birthdate).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    onComplete({ username: username.trim() || 'FCストライカー', birthdate, age });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
      {/* Background stadium atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* STEP 1: LOADING */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center text-center max-w-sm w-full"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] border border-cyan-300">
                <span className="font-['Teko'] text-5xl font-bold text-white tracking-widest">FC</span>
              </div>
            </div>

            <h1 className="font-['Teko'] text-4xl sm:text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-amber-300">
              FOOTBALL COLLECTION
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mb-8">
              Official Card Trading Engine
            </p>

            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-cyan-400 mt-2">{loadProgress}% データを読み込み中...</span>
          </motion.div>
        )}

        {/* STEP 2: TERMS & PRIVACY */}
        {step === 'terms' && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-4 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-['Chakra_Petch'] font-bold text-lg text-white">利用規約と確認事項</h2>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 max-h-48 overflow-y-auto space-y-2 mb-4 leading-relaxed">
              <p className="font-bold text-cyan-300">【重要事項】</p>
              <p>・本ゲームは完全無料のサッカー選手コレクションシミュレーションです。</p>
              <p>・実際のお金や決済機能（クレジットカード、PayPay、キャリア決済等）は一切存在しません。</p>
              <p>・ゲーム内のスーペルコイン(SC)およびマーケットポイント(MP)はゲーム内専用であり、換金や外部取引はできません。</p>
              <p>・公正な取引環境を保つため、不正アクセスや多重入札等の迷惑行為は禁止されています。</p>
            </div>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                />
                <span>利用規約に同意する</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                />
                <span>プライバシーポリシーに同意する</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={notesAccepted}
                  onChange={(e) => setNotesAccepted(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                />
                <span>完全無料・課金なしゲームであることを確認した</span>
              </label>
            </div>

            <button
              type="button"
              disabled={!termsAccepted || !privacyAccepted || !notesAccepted}
              onClick={() => {
                soundEngine.playButtonClick();
                setStep('age');
              }}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-600/20 hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <span>同意して次へ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 3: AGE VERIFICATION */}
        {step === 'age' && (
          <motion.div
            key="age"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <Calendar className="w-5 h-5" />
              <h2 className="font-['Chakra_Petch'] font-bold text-lg text-white">年齢確認（生年月日）</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              安心安全なサービス運営のため生年月日を入力してください。（公開されることはありません）
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">生年月日</label>
              <input
                type="date"
                value={birthdate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playButtonClick();
                setStep('username');
              }}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-600/20 hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <span>次へ進む</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 4: USERNAME */}
        {step === 'username' && (
          <motion.div
            key="username"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <User className="w-5 h-5" />
              <h2 className="font-['Chakra_Petch'] font-bold text-lg text-white">オーナー名登録</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              ゲーム内で表示されるあなたの名前を登録してください（後から設定画面でいつでも変更可能です）。
            </p>

            <div className="mb-6">
              <input
                type="text"
                maxLength={15}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="オーナー名 (最大15文字)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>※公序良俗に反する名前はご遠慮ください</span>
                <span>{username.length}/15</span>
              </div>
            </div>

            <button
              type="button"
              disabled={username.trim().length === 0}
              onClick={() => {
                soundEngine.playButtonClick();
                setStep('tutorial');
              }}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 shadow-lg shadow-cyan-600/20 hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <span>登録してチュートリアルへ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 5: TUTORIAL */}
        {step === 'tutorial' && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl backdrop-blur-md text-center"
          >
            {/* Step Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              {React.createElement(tutorialSteps[tutorialIndex].icon, { className: 'w-8 h-8' })}
            </div>

            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
              Tutorial {tutorialIndex + 1} / {tutorialSteps.length}
            </div>

            <h3 className="font-['Chakra_Petch'] text-xl font-bold text-white mb-3">
              {tutorialSteps[tutorialIndex].title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {tutorialSteps[tutorialIndex].desc}
            </p>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {tutorialSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === tutorialIndex ? 'w-6 bg-cyan-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {tutorialIndex < tutorialSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setTutorialIndex(tutorialIndex + 1);
                  }}
                  className="w-full py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>次へ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishTutorial}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>ゲームを始める (無料10連スカウトへ)</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

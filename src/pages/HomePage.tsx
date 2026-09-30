import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  HelpCircle, 
  ShieldAlert, 
  TrendingDown, 
  Sparkles, 
  Network,
  CheckCircle2,
  BookOpen,
  User,
  LogIn
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    t, 
    setActiveTab, 
    currentUser, 
    farmerProfile, 
    farmerRecords,
    setIsAuthModalOpen,
    setAuthModalTab,
    setIsDigitalSahayakModalOpen 
  } = useApp();

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-8 shadow-lg border border-emerald-700/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('welcomeFarmer')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-serif">
            {t('homeHeroTitle')}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-200 leading-relaxed max-w-2xl font-normal">
            {t('homeHeroSubtitle')}
          </p>

          {/* Farmer Account & Diary Status Bar */}
          <div className="pt-2">
            {currentUser ? (
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-stone-950 font-black text-xs flex items-center justify-center">
                    {farmerProfile?.name ? farmerProfile.name.charAt(0) : 'K'}
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-white block">
                      {farmerProfile?.name || 'Farmer Account'}
                    </span>
                    <span className="text-[11px] text-emerald-200">
                      {farmerRecords.length} {t('savedFarmRecords')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('records')}
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('kisanDiary')}</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-stone-200">
                  <User className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>
                    {t('createAccountPrompt')}
                  </span>
                </div>

                <button
                  onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('farmerLogin')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('weather')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{t('startAdvisory')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('cooperation')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition"
            >
              <Network className="w-4 h-4 text-emerald-300" />
              <span>{t('exploreHub')}</span>
            </button>
          </div>

        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
      </section>

      {/* Digital Sahayak (Community Helper Mode) Feature Card */}
      <section className="bg-gradient-to-r from-teal-900 via-stone-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-teal-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Community Digital Sahayak</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
            Helping Non-Digital Fellow Farmers in Your Village?
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Lookup localized weather forecast, soil care, disease diagnostics, and mandi prices for <strong>any district in India</strong> or generate a 1-page paper report for your fellow farmers.
          </p>
        </div>

        <div className="z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setIsDigitalSahayakModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Launch Digital Sahayak</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* The 3 Core Problems & Integrated Solutions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {t('coreProblemsTitle')}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            {t('threeProblemsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Problem 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {t('problem1Title')}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {t('problem1Desc')}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-950 font-medium">
                {t('solution1')}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('soil')}
              className="pt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <span>{t('testSoilButton')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Problem 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {t('problem2Title')}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {t('problem2Desc')}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-950 font-medium">
                {t('solution2')}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('disease')}
              className="pt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <span>{t('scanLeafButton')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Problem 3 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <TrendingDown className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {t('problem3Title')}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {t('problem3Desc')}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-950 font-medium">
                {t('solution3')}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('market')}
              className="pt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <span>{t('checkMarketButton')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Free & Safe Platform Strip */}
      <section className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-7 border border-stone-800">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
          <div className="lg:col-span-3 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              🌱 {t('freePublicGoodTitle')}
            </span>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {t('freePublicGoodDesc')}
            </p>
          </div>
          <div className="flex lg:justify-end">
            <button
              onClick={() => setActiveTab('cooperation')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              {t('viewCommunityData')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/translations';
import { 
  Sprout, 
  Globe2, 
  User,
  Users,
  MapPin,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    currentUser,
    farmerProfile,
    setIsAuthModalOpen,
    setAuthModalTab,
    setActiveTab,
    selectedDistrict,
    selectedState,
    setIsLocationModalOpen,
    isAssistMode,
    assistedFarmer,
    setIsDigitalSahayakModalOpen
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16 gap-2">
        
        {/* Logo & Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-600/20 group-hover:scale-105 transition">
            <Sprout className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-xl tracking-tight text-stone-900 font-serif block leading-snug">
              {t('appName')}
            </span>
            <p className="text-xs text-stone-500 hidden md:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Middle Section - Desktop only */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {isAssistMode && assistedFarmer ? (
            <button
              onClick={() => setIsDigitalSahayakModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-900 hover:bg-amber-500/20 transition text-xs font-bold ring-2 ring-amber-500/20 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Assisting: {assistedFarmer.name} ({selectedDistrict.name})</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-700 transition text-xs font-bold"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {selectedDistrict.villageName 
                  ? `${selectedDistrict.name} (${selectedDistrict.villageName})` 
                  : `${selectedDistrict.name}, ${selectedState.name}`}
              </span>
            </button>
          )}

          {/* Digital Sahayak Button */}
          <button
            onClick={() => setIsDigitalSahayakModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white shadow-xs transition text-xs font-bold"
            title="Assist Fellow Farmers & Lookup any Locality"
          >
            <Users className="w-3.5 h-3.5 text-teal-200" />
            <span>Digital Sahayak</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* Mobile: Compact location button */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 min-w-0"
            title={`${selectedDistrict.name}, ${selectedState.name}`}
          >
            <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
            <span className="text-[10px] font-bold truncate max-w-[60px]">{selectedDistrict.name}</span>
          </button>

          {/* Language Dropdown */}
          <div className="flex items-center gap-0.5 pl-2 pr-1 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 text-stone-800 text-xs font-semibold transition">
            <Globe2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent border-none text-[11px] sm:text-xs font-bold focus:outline-hidden cursor-pointer max-w-[60px] sm:max-w-[90px]"
              aria-label={t('selectLanguage')}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Farmer Login / Account */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('records')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition text-xs font-bold ring-2 ring-emerald-500/20"
              title={farmerProfile?.name || 'Farmer Account'}
            >
              <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {farmerProfile?.name ? farmerProfile.name.charAt(0) : 'K'}
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">
                {farmerProfile?.name || 'Kisan'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition text-xs font-bold whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">{t('farmerLogin')}</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

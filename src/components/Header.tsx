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
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Logo & Section KrishiSetu */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-600/20 group-hover:scale-105 transition">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-stone-900 font-serif block leading-snug">
              {t('appName')}
            </span>
            <p className="text-xs text-stone-500 hidden md:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Middle / Active Location & Assist Badge */}
        <div className="hidden md:flex items-center gap-2">
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

        {/* Right Section Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Digital Sahayak Icon Button */}
          <button
            onClick={() => setIsDigitalSahayakModalOpen(true)}
            className="md:hidden p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs flex items-center gap-1"
            title="Digital Sahayak"
          >
            <Users className="w-4 h-4 text-teal-700" />
            <span className="text-[10px]">Sahayak</span>
          </button>

          {/* Language Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1 pl-2.5 pr-2 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 text-stone-800 text-xs font-semibold transition">
              <Globe2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent border-none text-xs font-bold focus:outline-hidden cursor-pointer"
                aria-label={t('selectLanguage')}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Farmer Account & Login Button */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('records')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition text-xs font-bold ring-2 ring-emerald-500/20"
              title={farmerProfile?.name || 'Farmer Account'}
            >
              <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-black">
                {farmerProfile?.name ? farmerProfile.name.charAt(0) : 'K'}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {farmerProfile?.name || 'Kisan'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition text-xs font-bold"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('farmerLogin')}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

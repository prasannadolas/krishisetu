import React from 'react';
import { useApp, TabId } from '../context/AppContext';
import { 
  Home, 
  CloudSun, 
  TrendingUp, 
  Layers, 
  Wheat, 
  Bug, 
  CircleDollarSign, 
  Network, 
  Calculator, 
  Info,
  BookOpen 
} from 'lucide-react';

interface NavItem {
  id: TabId;
  labelKey: string;
  icon: React.ElementType;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'tabHome', icon: Home },
  { id: 'records', labelKey: 'tabRecords', icon: BookOpen },
  { id: 'weather', labelKey: 'tabWeather', icon: CloudSun },
  { id: 'trends', labelKey: 'tabTrends', icon: TrendingUp },
  { id: 'soil', labelKey: 'tabSoil', icon: Layers },
  { id: 'crops', labelKey: 'tabCrops', icon: Wheat },
  { id: 'disease', labelKey: 'tabDisease', icon: Bug },
  { id: 'market', labelKey: 'tabMarket', icon: CircleDollarSign },
  { id: 'cooperation', labelKey: 'tabCooperation', icon: Network },
  { id: 'impact', labelKey: 'tabImpact', icon: Calculator },
  { id: 'about', labelKey: 'tabAbout', icon: Info },
];

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-stone-900 text-stone-300 border-r border-stone-800 shrink-0 min-h-[calc(100vh-4rem)] p-3">
      <div className="mb-2 px-3 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          🌱 {t('farmerPortal')}
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-emerald-400'}`} />
                <span>{t(item.labelKey)}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  // Primary mobile navigation items
  const primaryMobileTabs: TabId[] = ['home', 'records', 'weather', 'crops', 'disease'];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/97 backdrop-blur-md border-t border-stone-800 px-1 pt-1.5 pb-safe" style={{paddingBottom: 'max(env(safe-area-inset-bottom), 8px)'}}>
      <div className="flex items-center justify-around">
        {NAV_ITEMS.filter(item => primaryMobileTabs.includes(item.id)).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition min-w-[56px] ${
                isActive ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                {isActive && (
                  <span className="absolute inset-0 -m-1 rounded-lg bg-emerald-500/15" />
                )}
                <Icon className={`w-5 h-5 relative ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] mt-1.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Secondary horizontal navigation bar on mobile for all 10 tabs
export const MobileTabsBar: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  return (
    <div className="lg:hidden bg-stone-900 border-b border-stone-800 overflow-x-auto no-scrollbar py-1.5 px-2 flex items-center gap-1 shrink-0">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs whitespace-nowrap transition shrink-0 font-medium ${
              isActive
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 active:bg-stone-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{t(item.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
};

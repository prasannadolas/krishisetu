import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DesktopSidebar, MobileBottomNav, MobileTabsBar } from './components/Navigation';
import { LocationModal } from './components/LocationModal';
import { FarmerAssistant } from './components/FarmerAssistant';
import { PrintableReport } from './components/PrintableReport';
import { FarmerAuthModal } from './components/FarmerAuthModal';
import { DigitalSahayakModal } from './components/DigitalSahayakModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ClimatePage } from './pages/ClimatePage';
import { TrendsPage } from './pages/TrendsPage';
import { SoilPage } from './pages/SoilPage';
import { CropsPage } from './pages/CropsPage';
import { DiseasePage } from './pages/DiseasePage';
import { MarketPage } from './pages/MarketPage';
import { CooperationPage } from './pages/CooperationPage';
import { RecordsPage } from './pages/RecordsPage';
import { ImpactPage } from './pages/ImpactPage';
import { AboutPage } from './pages/AboutPage';

import { Bot } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setIsAssistantOpen, isAssistantOpen, t } = useApp();

  // Register service worker for offline shell caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration skipped:', err);
        });
      });
    }
  }, []);

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'weather':
        return <ClimatePage />;
      case 'trends':
        return <TrendsPage />;
      case 'soil':
        return <SoilPage />;
      case 'crops':
        return <CropsPage />;
      case 'disease':
        return <DiseasePage />;
      case 'market':
        return <MarketPage />;
      case 'cooperation':
        return <CooperationPage />;
      case 'records':
        return <RecordsPage />;
      case 'impact':
        return <ImpactPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Top Header */}
      <Header />

      {/* Secondary Horizontal Navigation Bar on Mobile for all tabs */}
      <MobileTabsBar />

      <div className="flex-1 flex w-full">
        {/* Desktop Left Sidebar */}
        <DesktopSidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-32 lg:pb-12">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Floating Farmer Assistant Button (Fixed Bottom-Right) */}
      {!isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-24 lg:bottom-6 right-4 z-40 px-3.5 py-2.5 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600 text-white shadow-xl hover:scale-105 active:scale-95 transition flex items-center gap-2 ring-4 ring-emerald-500/20"
          title={t('kisanMitra')}
        >
          <Bot className="w-4 h-4" />
          <span className="font-bold text-xs hidden sm:inline">{t('kisanMitra')}</span>
        </button>
      )}

      {/* Mobile Sticky Bottom Nav Bar */}
      <MobileBottomNav />

      {/* Overlays / Modals */}
      <LocationModal />
      <FarmerAssistant />
      <PrintableReport />
      <FarmerAuthModal />
      <DigitalSahayakModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Droplet, 
  Clock, 
  ShieldAlert, 
  Leaf, 
  Coins, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle,
  MapPin,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export const CropsPage: React.FC = () => {
  const { 
    cropResult, 
    cropLoading, 
    fetchCrops, 
    selectedDistrict, 
    selectedState, 
    season,
    soilResult,
    manualNpkPh,
    weatherData,
    currentUser,
    saveRecordToDb,
    setIsAuthModalOpen,
    setAuthModalTab,
    t 
  } = useApp();

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!cropResult) {
      fetchCrops();
    }
  }, [selectedDistrict.name, season.name]);

  const handleSaveCropPlan = async () => {
    if (!cropResult || !cropResult.topCrops || cropResult.topCrops.length === 0) return;
    if (!currentUser) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    const cropNames = cropResult.topCrops.map(c => c.cropName).join(', ');
    await saveRecordToDb({
      recordType: 'crop_advisory',
      title: `Seasonal Crop Advisory (${season.name}) - ${selectedDistrict.name}`,
      crop: cropNames,
      summary: `Recommended Crops: ${cropNames}. ${cropResult.advisorySummary?.slice(0, 200)}`,
      detailsJson: JSON.stringify(cropResult)
    });
    setIsSaved(true);
  };

  const topCrops = cropResult?.topCrops || [];
  const groundedSources = cropResult?.groundedSources || [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Title & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t('cropsTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {t('cropsSubtitle')} • <strong>{selectedDistrict.name}, {selectedState.name}</strong> • {season.localName || season.name}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {cropResult && (
            isSaved ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('saved')}</span>
              </div>
            ) : (
              <button
                onClick={handleSaveCropPlan}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>{currentUser ? t('saveToDiary') : t('loginToSave')}</span>
              </button>
            )
          )}

          <button
            onClick={fetchCrops}
            disabled={cropLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cropLoading ? 'animate-spin' : ''}`} />
            <span>{cropLoading ? t('analyzingAi') : t('reEvaluate')}</span>
          </button>
        </div>
      </div>

      {/* Synthesis Input Parameters Bar */}
      <div className="p-4 rounded-2xl bg-stone-100/90 border border-stone-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('soilType')}</span>
          <span className="font-semibold text-stone-800">
            {soilResult?.soilType || selectedDistrict.soilZone || 'Medium Black Soil'}
          </span>
        </div>
        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold">NPK</span>
          <span className="font-semibold text-stone-800 font-mono">
            N:{manualNpkPh.n} P:{manualNpkPh.p} K:{manualNpkPh.k}
          </span>
        </div>
        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('tabWeather')}</span>
          <span className="font-semibold text-stone-800">
            {weatherData ? `${weatherData.current.temperature}°C • ${weatherData.current.humidity}%` : 'Normal'}
          </span>
        </div>
        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold">{t('seasonTag')}</span>
          <span className="font-semibold text-stone-800 truncate block">
            {season.localName || season.name}
          </span>
        </div>
      </div>

      {/* Overall Advisory Directive Banner */}
      {cropResult?.advisorySummary && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-2.5">
          <Leaf className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-emerald-900 mb-0.5">
              {t('farmingAdviceTitle')}:
            </strong>
            <span>{cropResult.advisorySummary}</span>
          </div>
        </div>
      )}

      {/* Ranked Crop Cards */}
      <div className="space-y-5">
        {cropLoading && !cropResult ? (
          <div className="p-16 bg-white rounded-2xl border border-stone-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-700">
              {t('analyzingAi')}
            </p>
          </div>
        ) : (
          topCrops.map((crop, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={crop.cropName}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition shadow-xs hover:shadow-md space-y-4 ${
                  isFirst ? 'border-emerald-500/80 ring-2 ring-emerald-500/10' : 'border-stone-200'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      isFirst ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700'
                    }`}>
                      #{crop.rank || idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                          {crop.cropName}
                        </h3>
                        {isFirst && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ★ Top Match
                          </span>
                        )}
                      </div>
                      {crop.botanicalName && (
                        <p className="text-xs text-stone-400 italic">
                          {crop.botanicalName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        {t('suitabilityScore')}
                      </span>
                      <span className="text-xl font-black text-emerald-700">
                        {crop.suitabilityScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why This Crop? */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('whyThisCrop')}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                    {crop.whyThisCrop}
                  </p>
                </div>

                {/* Key Agronomic Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      <span>{t('sowingWindow')}</span>
                    </span>
                    <span className="font-semibold text-stone-800">
                      {crop.sowingWindow}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-stone-400 flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-sky-500" />
                      <span>{t('waterNeed')}</span>
                    </span>
                    <span className="font-semibold text-stone-800">
                      {crop.waterNeed}
                    </span>
                  </div>

                  <div className="space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold uppercase text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-500" />
                      <span>{t('cropDuration')}</span>
                    </span>
                    <span className="font-semibold text-stone-800">
                      ~{crop.durationDays} Days
                    </span>
                  </div>
                </div>

                {/* Regenerative Tip & Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <strong className="block font-bold text-emerald-950 flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('regenerativeTip')}</span>
                    </strong>
                    <p className="text-emerald-900 leading-relaxed">
                      {crop.regenerativeTip}
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-xs space-y-1">
                    <strong className="block font-bold text-rose-950 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                      <span>{t('smartAlerts')}</span>
                    </strong>
                    <p className="text-rose-900 leading-relaxed">
                      {crop.keyRisks}
                    </p>
                  </div>
                </div>

                {/* Profitability & Government Schemes */}
                <div className="p-3.5 bg-stone-900 text-stone-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{t('profitability')}</span>
                    </span>
                    <p className="font-semibold text-white sm:text-sm">
                      {crop.profitabilityEstimate}
                    </p>
                  </div>
                  {crop.govtSchemesAndMSP && (
                    <div className="sm:text-right text-stone-300 text-[11px] max-w-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                      <strong className="text-white block font-semibold">{t('govtMsp')}:</strong>
                      <span>{crop.govtSchemesAndMSP}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Grounded Source Links */}
      {groundedSources.length > 0 && (
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              {t('groundedSources')}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {groundedSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 text-xs font-medium border border-stone-200 transition"
              >
                <span className="truncate max-w-[240px]">{source.title}</span>
                <ExternalLink className="w-3 h-3 shrink-0 text-stone-400" />
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getClimateImplications } from '../services/gemini';
import { 
  TrendingUp, 
  Sparkles, 
  Loader2,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const TrendsPage: React.FC = () => {
  const { 
    climateData, 
    climateLoading, 
    selectedDistrict, 
    selectedState, 
    language,
    t 
  } = useApp();

  const [aiImplication, setAiImplication] = useState<string>('');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (climateData?.insight) {
      loadAiImplication();
    }
  }, [climateData?.insight.tempChangeDegC, selectedDistrict.name, language]);

  const loadAiImplication = async () => {
    if (!climateData?.insight) return;
    setLoadingAi(true);
    try {
      const res = await getClimateImplications({
        tempDelta: climateData.insight.tempChangeDegC,
        rainDeltaPercent: climateData.insight.rainChangePercent,
        region: `${selectedDistrict.name}, ${selectedState.name}`,
        language
      });
      setAiImplication(res.implication);
      setAiRecommendations(res.recommendations);
    } catch (e) {
      console.warn("AI implication fetch error:", e);
    } finally {
      setLoadingAi(false);
    }
  };

  if (climateLoading || !climateData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-stone-600">
          {t('loadingHistory')}
        </p>
      </div>
    );
  }

  const { yearlyData, insight, source } = climateData;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t('trendsTitle')}
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              1995 – 2024
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {t('trendsSubtitle')} <strong>{selectedDistrict.name}, {selectedState.name}</strong>
            </span>
          </p>
        </div>

        <span className="text-xs font-medium text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl self-start sm:self-auto border border-stone-200/60">
          {source}
        </span>
      </div>

      {/* Calculated Statistical Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {t('warmingRise')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              +{insight.tempChangeDegC}°C
            </span>
          </div>
          <p className="text-xs text-stone-500">
            {t('hottestYear')}: {insight.hottestYear.year} ({insight.hottestYear.temp}°C)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {t('rainfallShift')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-black ${insight.rainChangePercent < 0 ? 'text-amber-600' : 'text-blue-600'}`}>
              {insight.rainChangePercent > 0 ? '+' : ''}{insight.rainChangePercent}%
            </span>
          </div>
          <p className="text-xs text-stone-500">
            {t('driestYear')}: {insight.driestYear.year} ({insight.driestYear.rain}mm)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {t('monsoonVariability')}
          </span>
          <p className="text-lg sm:text-xl font-bold text-stone-800">
            {insight.wettestYear.year}
          </p>
          <p className="text-xs text-stone-500">
            {t('wettestYear')}: {insight.wettestYear.rain} mm
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {t('analysisYears')}
          </span>
          <p className="text-lg sm:text-xl font-bold text-emerald-800">
            {insight.yearsAnalyzed}
          </p>
          <p className="text-xs text-stone-500">
            1995 – 2024
          </p>
        </div>

      </div>

      {/* Farming Implication Card */}
      <section className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-white rounded-2xl p-5 sm:p-7 border border-emerald-700/40 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              {t('farmingAdviceTitle')}
            </h3>
          </div>
          <button
            onClick={loadAiImplication}
            disabled={loadingAi}
            className="text-xs font-bold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            {loadingAi ? '...' : t('reEvaluate')}
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-stone-100 font-medium leading-relaxed italic border-l-2 border-emerald-400 pl-3">
            "{aiImplication || `A localized warming rise of +${insight.tempChangeDegC}°C in ${selectedDistrict.name} accelerates soil moisture loss, requiring moisture conservation and drought-hardy seed selection.`}"
          </p>

          {aiRecommendations.length > 0 && (
            <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {aiRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-stone-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recharts 25-Year Trend Chart */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">
            {t('trendsTitle')} (1995 – 2024)
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('temperature')} (°C) & {t('precipitation')} (mm)
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#78716c' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#ef4444' }} domain={['dataMin - 1', 'dataMax + 1']} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#0284c7' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  name.includes('Temp') ? `${val}°C` : `${val} mm`, 
                  name
                ]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar yAxisId="right" dataKey="totalRainMm" fill="#93c5fd" name={`${t('precipitation')} (mm)`} radius={[4, 4, 0, 0]} opacity={0.7} />
              <Line yAxisId="left" type="monotone" dataKey="meanTempC" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 2 }} name={`${t('temperature')} (°C)`} />
              <Line yAxisId="left" type="linear" dataKey="tempTrendline" stroke="#b91c1c" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Trendline (°C)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
};

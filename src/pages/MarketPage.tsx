import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchMarketData, CropMarketInfo, COMMODITY_BENCHMARKS } from '../services/market';
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  MapPin,
  Coins
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const MarketPage: React.FC = () => {
  const { selectedDistrict, selectedState, cropResult, t } = useApp();

  const commodityList = Object.keys(COMMODITY_BENCHMARKS);
  const defaultCrop = cropResult?.topCrops[0]?.cropName.split(' ')[0] || "Wheat (Gehun)";
  
  const [selectedCrop, setSelectedCrop] = useState<string>(() => {
    const matched = commodityList.find(c => defaultCrop.toLowerCase().includes(c.toLowerCase().split(' ')[0])) || commodityList[0];
    return matched;
  });

  const [marketInfo, setMarketInfo] = useState<CropMarketInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMarket();
  }, [selectedCrop, selectedDistrict.name, selectedState.name]);

  const loadMarket = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketData(selectedCrop, selectedState.name, selectedDistrict.name);
      setMarketInfo(data);
    } catch (e) {
      console.warn("Market fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t('marketTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {t('marketSubtitle')} • <strong>{selectedDistrict.name}, {selectedState.name}</strong>
            </span>
          </p>
        </div>

        {/* Commodity Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-600">{t('cropName')}:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3.5 py-2 bg-white rounded-xl text-xs sm:text-sm font-bold border border-stone-300 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            {commodityList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Prices Metrics */}
      {marketInfo && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('mandiPrice')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                ₹{marketInfo.currentModalPrice}
              </span>
              <span className="text-xs text-stone-500">/ क्विंटल</span>
            </div>
            <p className="text-xs text-stone-500 font-medium truncate">
              {marketInfo.mandi}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('govtMsp')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-stone-800">
                ₹{marketInfo.mspPrice}
              </span>
              <span className="text-xs text-stone-500">/ क्विंटल</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium">
              {marketInfo.currentModalPrice >= marketInfo.mspPrice ? "★ MSP पेक्षा जास्त" : "MSP जवळ"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('priceTrend')}
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              {marketInfo.priceChange30d >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-600" />
              )}
              <span className={`text-2xl sm:text-3xl font-black ${marketInfo.priceChange30d >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {marketInfo.priceChange30d >= 0 ? '+' : ''}{marketInfo.priceChange30d}%
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {marketInfo.priceChange30d >= 0 ? t('bullish') : t('bearish')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {t('marketSentiment')}
            </span>
            <p className="text-lg sm:text-xl font-bold text-stone-900 pt-0.5">
              {marketInfo.marketSentiment === 'Bullish' ? t('bullish') : marketInfo.marketSentiment === 'Bearish' ? t('bearish') : t('stable')}
            </p>
            <p className="text-xs text-stone-500">
              {selectedDistrict.name} APMC
            </p>
          </div>

        </div>
      )}

      {/* Selling Advice Card */}
      {marketInfo && (
        <section className="bg-amber-50 rounded-2xl p-5 sm:p-6 border border-amber-200 text-amber-950 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <Lightbulb className="w-5 h-5 text-amber-700 shrink-0" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              {t('bestTimeSell')}
            </h3>
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed pl-7">
            {marketInfo.bestTimeToSellHint}
          </p>
        </section>
      )}

      {/* 30-Day Mandi Price Chart */}
      {marketInfo && marketInfo.thirtyDayTrend.length > 0 && (
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {t('priceTrend')} (₹/क्विंटल)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {selectedCrop} • {selectedDistrict.name} Mandi
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketInfo.thirtyDayTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${val}/क्विंटल`, t('mandiPrice')]}
                />
                <Area type="monotone" dataKey="price" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGrad)" name="Mandi Modal Price (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

    </div>
  );
};

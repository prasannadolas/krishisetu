import React from 'react';
import { useApp } from '../context/AppContext';
import { getWeatherConditionDescription } from '../services/weather';
import { 
  Droplets, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  ShieldCheck, 
  Waves, 
  Sun, 
  RefreshCw,
  MapPin
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const ClimatePage: React.FC = () => {
  const { 
    weatherData, 
    weatherLoading, 
    weatherError, 
    refreshWeather, 
    selectedDistrict, 
    selectedState,
    t 
  } = useApp();

  if (weatherLoading && !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-stone-600">
          {t('loadingHistory')}
        </p>
      </div>
    );
  }

  if (weatherError && !weatherData) {
    return (
      <div className="p-8 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-rose-900">{t('liveWeatherTitle')}</h3>
        <p className="text-xs text-rose-700">{weatherError}</p>
        <button
          onClick={refreshWeather}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
        >
          {t('refreshWeather')}
        </button>
      </div>
    );
  }

  const current = weatherData?.current;
  const daily = weatherData?.daily || [];
  const alerts = weatherData?.alerts || [];

  // Prepare 7-day chart series
  const chartData = daily.map((d) => {
    const dayName = new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' });
    return {
      day: dayName,
      date: d.date,
      maxTemp: d.tempMax,
      minTemp: d.tempMin,
      rain: d.precipitationSum,
      et0: d.et0
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Title & Location Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t('liveWeatherTitle')}
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {t('cloudSynced')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {t('weatherSubtitle')} <strong>{selectedDistrict.name}, {selectedState.name}</strong>
            </span>
          </p>
        </div>

        <button
          onClick={refreshWeather}
          disabled={weatherLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold self-start sm:self-auto transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
          <span>{t('refreshWeather')}</span>
        </button>
      </div>

      {/* Smart Alerts Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{t('smartAlerts')}</span>
        </h2>

        {alerts.length === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              {t('noAlerts')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => {
              const isDanger = alert.severity === 'danger';
              return (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition shadow-xs ${
                    isDanger 
                      ? 'bg-rose-50/90 border-rose-200 text-rose-950' 
                      : 'bg-amber-50/90 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${isDanger ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-bold text-sm leading-snug">
                        {alert.title}
                      </h4>
                      <p className="text-xs opacity-90 leading-relaxed">
                        {alert.message}
                      </p>
                      <div className="pt-2 mt-2 border-t border-black/10 text-xs">
                        <strong className="block font-bold mb-0.5">{t('actionDirective')}:</strong>
                        <span>{alert.recommendedAction}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Primary Agrometeorology Cards */}
      {current && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Temperature */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('temperature')}</span>
              <Thermometer className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                {current.temperature}°C
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              {t('feelsLike')}: {current.apparentTemperature}°C • {getWeatherConditionDescription(current.weatherCode)}
            </p>
          </div>

          {/* Soil Moisture */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('soilMoisture')}</span>
              <Waves className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-800">
                {(current.soilMoisture * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, current.soilMoisture * 200)}%` }}
              />
            </div>
          </div>

          {/* Humidity & Rain */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('humidity')}</span>
              <Droplets className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                {current.humidity}%
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              {t('precipitation')}: {current.precipitation} mm • {t('windSpeed')}: {current.windSpeed} km/h
            </p>
          </div>

          {/* Crop Water Need / Evaporation */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">{t('waterLoss')}</span>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                {current.et0}
              </span>
              <span className="text-xs text-stone-500">mm / day</span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              {t('soilTemp')}: {current.soilTemperature}°C
            </p>
          </div>

        </div>
      )}

      {/* 7-Day Forecast Charts */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">
            {t('sevenDayForecast')}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('temperature')} (°C) & {t('precipitation')} (mm)
          </p>
        </div>

        {/* Temperature Trend Area Chart */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempMaxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tempMinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 12, fill: '#78716c' }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                formatter={(val: any, name: any) => [`${val}°C`, name === 'maxTemp' ? 'Max Temp' : 'Min Temp']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="maxTemp" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#tempMaxGrad)" name="Max Temp (°C)" />
              <Area type="monotone" dataKey="minTemp" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#tempMinGrad)" name="Min Temp (°C)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Precipitation Bar Chart */}
        <div className="pt-4 border-t border-stone-100">
          <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
            {t('precipitation')} (mm) & {t('waterLoss')} (mm)
          </p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`${val} mm`, name === 'rain' ? t('precipitation') : t('waterLoss')]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="rain" fill="#0284c7" name={`${t('precipitation')} (mm)`} radius={[4, 4, 0, 0]} />
                <Bar dataKey="et0" fill="#f59e0b" name={`${t('waterLoss')} (mm)`} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

    </div>
  );
};

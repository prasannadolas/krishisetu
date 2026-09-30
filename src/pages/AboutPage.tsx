import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  Heart
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {t('aboutTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {t('aboutSubtitle')}
        </p>
      </div>

      {/* Honest Disclosure Table */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-stone-900">
            {t('dataSource')}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase">
                <th className="py-2.5 px-3">सेवा (Service)</th>
                <th className="py-2.5 px-3">माहिती स्रोत (Source)</th>
                <th className="py-2.5 px-3">ಸ್ಥಿತಿ (Status)</th>
                <th className="py-2.5 px-3">तपशील (Details)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">{t('tabWeather')}</td>
                <td className="py-2.5 px-3 text-stone-600">Open-Meteo Weather API</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    LIVE
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-500">स्थानिक तापमान, पाऊस, वारा व ओलावा.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">{t('tabTrends')}</td>
                <td className="py-2.5 px-3 text-stone-600">Open-Meteo 1995-2024 Archive</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    LIVE
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-500">२५ वर्षांचे तापमान व पर्जन्यमान कल.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">{t('tabSoil')} & {t('tabDisease')}</td>
                <td className="py-2.5 px-3 text-stone-600">Google Gemini 3.8 Flash Vision</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    LIVE AI
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-500">फोटोवरून त्वरित माती व रोग निदान.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">{t('tabCrops')}</td>
                <td className="py-2.5 px-3 text-stone-600">ICAR & Govt MSP Guidelines</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    GROUNDED
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-500">शासकीय हमीभाव आणि कृषी विद्यापीठ शिफारशी.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-stone-900">{t('tabMarket')}</td>
                <td className="py-2.5 px-3 text-stone-600">APMC Mandi Benchmarks</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    BENCHMARK
                  </span>
                </td>
                <td className="py-2.5 px-3 text-stone-500">जिल्हा बाजार भाव आणि ३० दिवसांचा अंदाज.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Farmer Privacy & Safety Card */}
      <section className="bg-emerald-50 rounded-2xl p-5 sm:p-6 border border-emerald-200 text-emerald-950 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-emerald-900">
            {t('privacyNote')}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          {t('privacyText')}
        </p>
      </section>

      {/* Dedication footer */}
      <div className="text-center pt-4 text-xs text-stone-400 flex items-center justify-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>Dedicated to the hardworking farmers of India</span>
      </div>

    </div>
  );
};

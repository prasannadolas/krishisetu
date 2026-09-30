import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calculator, 
  Coins, 
  Droplet, 
  Users,
  Sprout
} from 'lucide-react';

export const ImpactPage: React.FC = () => {
  const { t } = useApp();

  // Editable parameters
  const [farmersCount, setFarmersCount] = useState<number>(10000);
  const [yieldLossReductionPct, setYieldLossReductionPct] = useState<number>(18);
  const [avgFarmAcres, setAvgFarmAcres] = useState<number>(3.5);
  const [baselineCropValuePerAcre, setBaselineCropValuePerAcre] = useState<number>(26000);

  // Calculations
  const totalAcres = farmersCount * avgFarmAcres;
  const baselineGrossValue = totalAcres * baselineCropValuePerAcre;
  const protectedEconomicValueRupees = baselineGrossValue * (yieldLossReductionPct / 100);
  const protectedEconomicValueCrores = Number((protectedEconomicValueRupees / 10000000).toFixed(2));

  const waterSavedMillionLitres = Number(((totalAcres * 72000 * 0.15) / 1000000).toFixed(1));

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {t('calculatorTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {t('calculatorSubtitle')}
        </p>
      </div>

      {/* Grid: Sliders / Inputs on Left, Computed Outcomes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sliders Input Panel */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <span>{t('calculatorTitle')}</span>
          </h3>

          {/* Slider 1: Number of Farmers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{t('numFarmers')}</span>
              </label>
              <span className="font-black text-emerald-800 text-sm">
                {farmersCount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={100000}
              step={500}
              value={farmersCount}
              onChange={(e) => setFarmersCount(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>100</span>
              <span>1,00,000</span>
            </div>
          </div>

          {/* Slider 2: Average Farm Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-700 flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>{t('avgLand')}</span>
              </label>
              <span className="font-black text-emerald-800 text-sm">
                {avgFarmAcres} एकड़ (Acres)
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={avgFarmAcres}
              onChange={(e) => setAvgFarmAcres(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>1 Acre</span>
              <span>15 Acres</span>
            </div>
          </div>

          {/* Slider 3: Loss Reduction Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-700 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>{t('lossReduction')}</span>
              </label>
              <span className="font-black text-emerald-800 text-sm">
                {yieldLossReductionPct}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={yieldLossReductionPct}
              onChange={(e) => setYieldLossReductionPct(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>5%</span>
              <span>40%</span>
            </div>
          </div>

        </div>

        {/* Computed Impact Cards on Right */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-gradient-to-br from-emerald-900 to-stone-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg space-y-3 border border-emerald-700/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              {t('estSavings')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white">
                ₹{protectedEconomicValueCrores} Cr
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              ~₹{(protectedEconomicValueRupees / farmersCount).toFixed(0)} प्रति शेतकरी वाचलेली सरासरी रक्कम
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-sky-600">
                <Droplet className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {t('waterSaved')}
                </span>
              </div>
              <p className="text-2xl font-black text-stone-900">
                {waterSavedMillionLitres} M Ltr
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-emerald-600">
                <Sprout className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  {t('avgLand')}
                </span>
              </div>
              <p className="text-2xl font-black text-stone-900">
                {totalAcres.toLocaleString()} Acres
              </p>
            </div>

          </div>

          <p className="text-xs text-stone-400 italic px-1">
            {t('disclaimerImpact')}
          </p>
        </div>

      </div>

    </div>
  );
};

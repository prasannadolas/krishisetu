import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, Sprout, ShieldCheck, MapPin, CalendarDays, CloudSun } from 'lucide-react';

export const PrintableReport: React.FC = () => {
  const {
    isPrintReportOpen,
    setIsPrintReportOpen,
    assistedFarmer,
    selectedState,
    selectedDistrict,
    season,
    weatherData,
    soilResult,
    manualNpkPh,
    cropResult,
    signals,
    t
  } = useApp();

  if (!isPrintReportOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-8 print:border-none print:shadow-none print:max-w-none print:m-0">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="px-6 py-3 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Farmer Advisory One-Page Printout (PDF)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={() => setIsPrintReportOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Advisory Body */}
        <div className="p-8 space-y-6 text-stone-900 font-sans print:p-6" id="printable-advisory">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-emerald-900">
                  KrishiSetu • कृषीसेतू
                </h1>
                <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  National Agricultural Intelligence Network • Digital Public Good
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-stone-500">
              <p className="font-bold text-stone-800">
                Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p>Advisory ID: KS-{Date.now().toString().slice(-6)}</p>
              <p className="text-emerald-700 font-semibold">KIAAS v1.0 Compliant</p>
            </div>
          </div>

          {/* Beneficiary Farmer Strip (If in Digital Sahayak / Assist Mode) */}
          {assistedFarmer && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block">
                  Beneficiary Farmer (Prepared by Digital Sahayak)
                </span>
                <span className="text-sm font-extrabold text-stone-900">
                  {assistedFarmer.name}
                </span>
                {assistedFarmer.village && (
                  <span className="ml-2 text-stone-700 text-xs">
                    • Village: {assistedFarmer.village}
                  </span>
                )}
                {assistedFarmer.phone && (
                  <span className="ml-2 text-stone-700 text-xs">
                    • Mobile: {assistedFarmer.phone}
                  </span>
                )}
              </div>
              {assistedFarmer.crop && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Target Crop</span>
                  <span className="font-extrabold text-emerald-900">{assistedFarmer.crop}</span>
                </div>
              )}
            </div>
          )}

          {/* Location & Season Strip */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-stone-100 rounded-xl text-xs font-medium border border-stone-200">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Farm Location</span>
              <span className="font-bold text-stone-900">{selectedDistrict.name}, {selectedState.name}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Season</span>
              <span className="font-bold text-stone-900">{season.name} ({season.localName})</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Coordinates</span>
              <span className="font-mono text-stone-800">{selectedDistrict.lat.toFixed(4)}°N, {selectedDistrict.lon.toFixed(4)}°E</span>
            </div>
          </div>

          {/* Section 1: Weather & Soil Baseline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-emerald-700" />
                <span>Hyperlocal Agrometeorology</span>
              </h2>
              {weatherData ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Temperature</span>
                    <span className="font-bold">{weatherData.current.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Air Humidity</span>
                    <span className="font-bold">{weatherData.current.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Soil Moisture (0-7cm)</span>
                    <span className="font-bold">{(weatherData.current.soilMoisture * 100).toFixed(0)}% Volumetric</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Daily ET₀</span>
                    <span className="font-bold">{weatherData.current.et0} mm/day</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">Normal seasonal agro-climatic conditions.</p>
              )}
            </div>

            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                Soil Profile & Nutrients
              </h2>
              <div className="text-xs space-y-1">
                <p>
                  <strong className="text-stone-700">Type: </strong> 
                  {soilResult?.soilType || selectedDistrict.soilZone || 'Medium Black Clay Loam'}
                </p>
                <p>
                  <strong className="text-stone-700">Organic Matter: </strong>
                  {soilResult?.organicMatterIndicator || 'Medium (0.55%)'}
                </p>
                <p className="text-[11px] text-stone-600">
                  <strong className="text-stone-700">Test (NPK/pH): </strong> 
                  N: {manualNpkPh.n} kg/ha • P: {manualNpkPh.p} kg/ha • K: {manualNpkPh.k} kg/ha • pH: {manualNpkPh.ph}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Top Ranked Crop Recommendations */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Ranked Crop Recommendations (Climate & Market Grounded)
            </h2>
            <div className="space-y-2">
              {(cropResult?.topCrops || [
                {
                  rank: 1,
                  cropName: "Soybean (JS-335)",
                  sowingWindow: "15 June - 10 July",
                  waterNeed: "Moderate",
                  durationDays: 95,
                  regenerativeTip: "Intercrop with Pigeon Pea in 4:2 ratio; apply straw mulching.",
                  profitabilityEstimate: "₹28,000 net profit/acre; MSP ₹4,892/quintal."
                },
                {
                  rank: 2,
                  cropName: "Pigeon Pea / Tur (BDN 711)",
                  sowingWindow: "Late June to early July",
                  waterNeed: "Low",
                  durationDays: 160,
                  regenerativeTip: "Rhizobium inoculation for biological nitrogen fixation.",
                  profitabilityEstimate: "₹38,000 net profit/acre; MSP ₹7,550/quintal."
                }
              ]).map((c: any, i: number) => (
                <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-stone-900 text-sm">
                      #{c.rank || i + 1}. {c.cropName}
                    </p>
                    <p className="text-stone-600">
                      <strong>Sowing:</strong> {c.sowingWindow} • <strong>Duration:</strong> {c.durationDays} days • <strong>Water:</strong> {c.waterNeed}
                    </p>
                    <p className="text-emerald-800 text-[11px]">
                      <strong>Regenerative Practice:</strong> {c.regenerativeTip}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-stone-600 shrink-0 ml-4">
                    <span className="font-semibold block text-stone-900">{c.profitabilityEstimate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Active Alerts & Field Warning */}
          {weatherData && weatherData.alerts.length > 0 && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs">
              <p className="font-bold text-rose-900 mb-1">
                ⚠️ Critical Weather & Pest Alerts for {selectedDistrict.name}:
              </p>
              {weatherData.alerts.map(a => (
                <p key={a.id} className="text-rose-800 text-[11px] mb-1">
                  • <strong>{a.title}:</strong> {a.recommendedAction}
                </p>
              ))}
            </div>
          )}

          {/* Footer & Disclaimer */}
          <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-500 flex items-center justify-between">
            <p>
              KrishiSetu is an open digital public good. Field advisories are synthesized from live agrometeorological sensors and ICAR package standards.
            </p>
            <p className="font-semibold text-emerald-800">
              National Hackathon Digital Public Good
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

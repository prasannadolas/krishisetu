import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeSoilImage, SoilAnalysisResult } from '../services/gemini';
import { 
  Camera, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  BookOpen,
  LogIn
} from 'lucide-react';

export const SoilPage: React.FC = () => {
  const { 
    soilResult, 
    setSoilResult, 
    manualNpkPh, 
    setManualNpkPh, 
    setActiveTab, 
    language,
    selectedDistrict,
    selectedState,
    currentUser,
    saveRecordToDb,
    setIsAuthModalOpen,
    setAuthModalTab,
    t 
  } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setError(null);
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeSoilImage(imagePreview, language);
      setSoilResult(result);

      // Auto-save to Firebase if farmer is logged in
      if (currentUser) {
        await saveRecordToDb({
          recordType: 'soil_scan',
          title: `Soil Scan: ${result.soilType} (${result.texture})`,
          summary: `${result.soilType}, pH: ${manualNpkPh.ph || '7.0'}, Organic Matter: ${result.organicMatterIndicator}`,
          detailsJson: JSON.stringify(result),
          imageUrl: imagePreview
        });
        setIsSaved(true);
      }
    } catch (err: any) {
      setError(err.message || 'Soil analysis failed. Please try a clearer photograph.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualSave = async () => {
    if (!soilResult) return;
    if (!currentUser) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    await saveRecordToDb({
      recordType: 'soil_scan',
      title: `Soil Scan: ${soilResult.soilType} (${soilResult.texture})`,
      summary: `${soilResult.soilType}, pH: ${manualNpkPh.ph || '7.0'}, Organic Matter: ${soilResult.organicMatterIndicator}`,
      detailsJson: JSON.stringify(soilResult),
      imageUrl: imagePreview || undefined
    });
    setIsSaved(true);
  };

  const handleSampleImage = () => {
    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%2345322E"/><circle cx="120" cy="150" r="80" fill="%233E2723" opacity="0.6"/><circle cx="280" cy="180" r="90" fill="%232E1C14" opacity="0.5"/><circle cx="200" cy="90" r="60" fill="%234A3525" opacity="0.4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23D7CCC8" font-family="sans-serif" font-size="16">Black Cotton Soil Sample</text></svg>`;
    setImagePreview(sampleSvg);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {t('soilTitle')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {t('soilSubtitle')} • <strong>{selectedDistrict.name}, {selectedState.name}</strong>
          </span>
        </p>
      </div>

      {/* Statutory Soil Testing Note */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <strong className="block font-bold text-amber-900">
            {t('soilDisclaimer')}
          </strong>
        </div>
      </div>

      {/* Upload & Vision Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Left: Image Capture / Upload Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-0.5">
              {t('uploadPhoto')}
            </h3>
            <p className="text-xs text-stone-500">
              {t('soilSubtitle')}
            </p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition min-h-[200px] bg-stone-50/60 relative overflow-hidden group"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Selected soil sample"
                className="w-full h-52 object-cover rounded-xl"
              />
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto group-hover:scale-105 transition">
                  <Camera className="w-6 h-6 text-emerald-700" />
                </div>
                <p className="text-xs font-bold text-stone-700">
                  {t('takePhoto')} / {t('uploadPhoto')}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAnalyze}
              disabled={!imagePreview || analyzing}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-xs"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('analyzingSoil')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{t('analyzeNow')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleSampleImage}
              className="px-3.5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold whitespace-nowrap transition"
            >
              {t('sampleImage')}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Right: Vision Analysis Results */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              {t('soilTitle')}
            </h3>
            {soilResult && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t('confidence')}: {soilResult.confidence}%
              </span>
            )}
          </div>

          {soilResult ? (
            <div className="space-y-3.5 text-xs sm:text-sm">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {t('soilType')}
                  </span>
                  <span className="font-bold text-stone-900 text-sm">
                    {soilResult.soilType}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {t('texture')}
                  </span>
                  <span className="font-bold text-stone-900 text-sm">
                    {soilResult.texture}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {t('soilMoisture')}
                  </span>
                  <span className="font-semibold text-stone-800">
                    {soilResult.moistureEstimate}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    {t('organicMatter')}
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {soilResult.organicMatterIndicator}
                  </span>
                </div>
              </div>

              {soilResult.keyCharacteristics && soilResult.keyCharacteristics.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-stone-700 block">
                    {t('soilAdvice')}:
                  </span>
                  <ul className="space-y-1">
                    {soilResult.keyCharacteristics.map((char, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                {soilResult.laboratoryTestingAdvice}
              </div>

              {/* Kisan Diary Status / Save Button */}
              <div className="pt-1">
                {isSaved ? (
                  <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('recordSavedSuccess')}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleManualSave}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>{currentUser ? t('saveToDiary') : t('loginToSave')}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setActiveTab('crops')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>{t('tabCrops')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          ) : (
            <div className="py-12 text-center space-y-2 text-stone-400">
              <p className="text-xs">
                {t('takePhoto')}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Manual Soil Health Card Values */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            {t('manualSoilInputs')}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              {t('nitrogen')}
            </label>
            <input
              type="number"
              value={manualNpkPh.n || ''}
              onChange={(e) => setManualNpkPh({ ...manualNpkPh, n: parseFloat(e.target.value) || undefined })}
              placeholder="e.g. 220"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              {t('phosphorus')}
            </label>
            <input
              type="number"
              value={manualNpkPh.p || ''}
              onChange={(e) => setManualNpkPh({ ...manualNpkPh, p: parseFloat(e.target.value) || undefined })}
              placeholder="e.g. 18"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              {t('potassium')}
            </label>
            <input
              type="number"
              value={manualNpkPh.k || ''}
              onChange={(e) => setManualNpkPh({ ...manualNpkPh, k: parseFloat(e.target.value) || undefined })}
              placeholder="e.g. 320"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              {t('phLevel')}
            </label>
            <input
              type="number"
              step="0.1"
              value={manualNpkPh.ph || ''}
              onChange={(e) => setManualNpkPh({ ...manualNpkPh, ph: parseFloat(e.target.value) || undefined })}
              placeholder="e.g. 7.2"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </section>

    </div>
  );
};

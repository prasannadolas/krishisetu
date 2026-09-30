import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { diagnoseCropDisease } from '../services/gemini';
import { 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  Leaf, 
  Pill, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2,
  Radio,
  MapPin,
  BookOpen,
  LogIn
} from 'lucide-react';

export const DiseasePage: React.FC = () => {
  const { 
    diseaseResult, 
    setDiseaseResult, 
    addSignal, 
    selectedDistrict, 
    selectedState, 
    weatherData, 
    language,
    currentUser,
    saveRecordToDb,
    setIsAuthModalOpen,
    setAuthModalTab,
    t 
  } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropHint, setCropHint] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broadcasted, setBroadcasted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setError(null);
      setBroadcasted(false);
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async () => {
    if (!imagePreview) return;
    setDiagnosing(true);
    setError(null);
    try {
      const weatherSummary = weatherData
        ? `Temp: ${weatherData.current.temperature}°C, Humidity: ${weatherData.current.humidity}%, Rain: ${weatherData.current.precipitation}mm`
        : 'Subtropical monsoon climate';

      const result = await diagnoseCropDisease(imagePreview, cropHint, language, weatherSummary);
      setDiseaseResult(result);

      // Auto-save to Firebase if logged in
      if (currentUser && result.isPlant) {
        await saveRecordToDb({
          recordType: 'disease_diagnosis',
          title: `Disease Diagnosis: ${result.cropDetected || cropHint || 'Crop'} - ${result.diseaseOrPest}`,
          crop: result.cropDetected || cropHint || undefined,
          summary: `${result.diseaseOrPest} (${result.severity}). ${result.symptoms?.join(', ').slice(0, 200)}`,
          detailsJson: JSON.stringify(result),
          imageUrl: imagePreview
        });
        setIsSaved(true);
      }
    } catch (err: any) {
      setError(err.message || 'Disease diagnostic failed.');
    } finally {
      setDiagnosing(false);
    }
  };

  const handleManualSave = async () => {
    if (!diseaseResult || !diseaseResult.isPlant) return;
    if (!currentUser) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    await saveRecordToDb({
      recordType: 'disease_diagnosis',
      title: `Disease Diagnosis: ${diseaseResult.cropDetected || cropHint || 'Crop'} - ${diseaseResult.diseaseOrPest}`,
      crop: diseaseResult.cropDetected || cropHint || undefined,
      summary: `${diseaseResult.diseaseOrPest} (${diseaseResult.severity}). ${diseaseResult.symptoms?.join(', ').slice(0, 200)}`,
      detailsJson: JSON.stringify(diseaseResult),
      imageUrl: imagePreview || undefined
    });
    setIsSaved(true);
  };

  const handleBroadcastSignal = async () => {
    if (!diseaseResult || !diseaseResult.isPlant) return;
    const success = await addSignal({
      crop: diseaseResult.cropDetected,
      issue: diseaseResult.diseaseOrPest,
      description: `Reported: ${diseaseResult.symptoms.slice(0, 2).join('; ')}`,
      state: selectedState.name,
      district: selectedDistrict.name,
      lat: selectedDistrict.lat,
      lon: selectedDistrict.lon,
      severity: diseaseResult.severity === 'Severe' || diseaseResult.severity === 'High' ? 'high' : 'moderate'
    });
    if (success) {
      setBroadcasted(true);
    }
  };

  const handleSampleImage = () => {
    const sampleLeaf = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%232E7D32"/><path d="M200 40 C120 100 80 200 200 280 C320 200 280 100 200 40 Z" fill="%234CAF50"/><circle cx="170" cy="140" r="14" fill="%238D6E63" stroke="%23FDD835" stroke-width="3"/><circle cx="230" cy="180" r="18" fill="%236D4C41" stroke="%23FDD835" stroke-width="4"/><circle cx="190" cy="220" r="10" fill="%238D6E63"/><text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" fill="%23FFFFFF" font-family="sans-serif" font-size="14">Leaf Spot / Blight Foliage Sample</text></svg>`;
    setImagePreview(sampleLeaf);
    setCropHint('Soybean / Cotton');
    setBroadcasted(false);
  };

  const isHighFungalRisk = weatherData && (weatherData.current.humidity > 75 || weatherData.daily[0]?.precipitationSum > 5);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {t('diseaseTitle')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {t('diseaseSubtitle')} • <strong>{selectedDistrict.name}, {selectedState.name}</strong>
          </span>
        </p>
      </div>

      {/* Weather-Linked Disease Risk Warning */}
      {isHighFungalRisk && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <strong className="block font-bold text-amber-900">
              {t('fungalWeatherWarning')}:
            </strong>
            <p className="leading-relaxed">
              {weatherData.current.humidity}% humidity and rain increase fungal blight risk. Inspect lower foliage.
            </p>
          </div>
        </div>
      )}

      {/* Diagnostic Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Left: Leaf Image Capture Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-0.5">
              {t('uploadLeaf')}
            </h3>
            <p className="text-xs text-stone-500">
              {t('diseaseSubtitle')}
            </p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition min-h-[200px] bg-stone-50/60 relative overflow-hidden group"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Selected leaf specimen"
                className="w-full h-52 object-cover rounded-xl"
              />
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto group-hover:scale-105 transition">
                  <Camera className="w-6 h-6 text-emerald-700" />
                </div>
                <p className="text-xs font-bold text-stone-700">
                  {t('uploadLeaf')}
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

          {/* Optional Crop Hint */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              {t('cropHintLabel')}
            </label>
            <input
              type="text"
              value={cropHint}
              onChange={(e) => setCropHint(e.target.value)}
              placeholder={t('cropHintPlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDiagnose}
              disabled={!imagePreview || diagnosing}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-xs"
            >
              {diagnosing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('diagnosingDisease')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{t('diagnoseNow')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleSampleImage}
              className="px-3.5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold whitespace-nowrap transition"
            >
              {t('sampleLeaf')}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Right: Diagnosis & Prescription Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              {t('diseaseTitle')}
            </h3>
            {diseaseResult && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                diseaseResult.severity === 'Severe' || diseaseResult.severity === 'High'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {diseaseResult.severity || 'Normal'}
              </span>
            )}
          </div>

          {diseaseResult ? (
            diseaseResult.isPlant ? (
              <div className="space-y-4 text-xs sm:text-sm">
                
                {/* Detected Issue Header */}
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-semibold">{t('cropName')}: <strong>{diseaseResult.cropDetected}</strong></span>
                    <span className="text-[11px] font-bold text-emerald-700">{t('confidence')}: {diseaseResult.confidence}%</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-rose-950">
                    {diseaseResult.diseaseOrPest}
                  </h4>
                  <p className="text-xs text-stone-600">
                    {diseaseResult.probableCauses}
                  </p>
                </div>

                {/* Symptoms */}
                {diseaseResult.symptoms && diseaseResult.symptoms.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-700 block">
                      {t('symptoms')}:
                    </span>
                    <ul className="space-y-1">
                      {diseaseResult.symptoms.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatments Grid */}
                <div className="grid grid-cols-1 gap-3">
                  
                  {/* Organic Treatment */}
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <strong className="block font-bold text-emerald-950 flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('organicTreatment')}</span>
                    </strong>
                    <ul className="space-y-1">
                      {diseaseResult.organicTreatments.map((tr, i) => (
                        <li key={i} className="text-emerald-900">
                          • {tr}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical Treatment with Safety Warning */}
                  <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-xs space-y-1">
                    <strong className="block font-bold text-rose-950 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-rose-700" />
                      <span>{t('chemicalTreatment')}</span>
                    </strong>
                    <p className="text-rose-900 leading-relaxed">
                      {diseaseResult.chemicalTreatmentsWithSafetyNote}
                    </p>
                  </div>

                </div>

                {/* Kisan Diary Status / Save Button */}
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
                  {isSaved ? (
                    <div className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('recordSavedSuccess')}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleManualSave}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      <span>{currentUser ? t('saveToDiary') : t('loginToSave')}</span>
                    </button>
                  )}

                  <button
                    onClick={handleBroadcastSignal}
                    disabled={broadcasted}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                      broadcasted
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>{broadcasted ? t('sharedSuccess') : t('broadcastToHub')}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-6 bg-amber-50 rounded-xl text-center space-y-2 border border-amber-200">
                <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-xs text-amber-900 font-semibold">
                  Photo is not a clear plant leaf. Please take a closer photo in daylight.
                </p>
              </div>
            )
          ) : (
            <div className="py-12 text-center space-y-2 text-stone-400">
              <p className="text-xs">
                {t('uploadLeaf')}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

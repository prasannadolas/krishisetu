import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FieldReportSubmission } from '../services/cooperation';
import { FormattedJsonViewer } from '../components/FormattedJsonViewer';
import { 
  MapPin, 
  Send, 
  Code, 
  Download, 
  Copy, 
  Check, 
  Building2, 
  Radio
} from 'lucide-react';
import L from 'leaflet';

export const CooperationPage: React.FC = () => {
  const { 
    signals, 
    addSignal, 
    selectedState, 
    selectedDistrict, 
    weatherData, 
    soilResult, 
    cropResult,
    season,
    language,
    t 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'map' | 'report' | 'schema' | 'onboarding'>('map');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Form State
  const [reportForm, setReportForm] = useState<FieldReportSubmission>({
    crop: 'Soybean',
    issue: 'Foliar yellowing / vector pest activity',
    description: 'Noticed localized whitefly clusters on underside of leaves following high humidity.',
    state: selectedState.name,
    district: selectedDistrict.name,
    lat: selectedDistrict.lat,
    lon: selectedDistrict.lon,
    severity: 'moderate',
    farmerName: ''
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (activeSubTab !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.5937, 78.9629], // Center of India
        zoom: 5,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for all signals
    signals.forEach((sig) => {
      const color = sig.severity === 'critical' 
        ? '#dc2626' 
        : sig.severity === 'high' 
        ? '#ea580c' 
        : sig.isSimulated 
        ? '#d97706' 
        : '#059669';

      const marker = L.circleMarker([sig.lat, sig.lon], {
        radius: sig.isSimulated ? 7 : 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #065f46; font-size: 13px;">${sig.crop}: ${sig.issue}</strong><br/>
          <span style="color: #6b7280;">${sig.district}, ${sig.state}</span><br/>
          <p style="margin: 4px 0 0; color: #374151;">${sig.description}</p>
        </div>
      `);
    });

    // Center map around selected district
    map.setView([selectedDistrict.lat, selectedDistrict.lon], 6);
  }, [activeSubTab, signals, selectedDistrict.lat, selectedDistrict.lon]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await addSignal({
        ...reportForm,
        state: selectedState.name,
        district: selectedDistrict.name,
        lat: selectedDistrict.lat,
        lon: selectedDistrict.lon
      });
      if (success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setActiveSubTab('map');
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportPayload = {
    standardVersion: "1.0.0",
    standardName: "KrishiSetu Interoperable Agro-Advisory Standard (KIAAS)",
    region: {
      state: selectedState.name,
      district: selectedDistrict.name,
      latitude: selectedDistrict.lat,
      longitude: selectedDistrict.lon,
      agroClimaticZone: cropResult?.agroClimaticZone || selectedDistrict.soilZone || "Western Semi-Arid Zone"
    },
    timestamp: new Date().toISOString(),
    soil: {
      type: soilResult?.soilType || selectedDistrict.soilZone || "Medium Black Soil",
      texture: soilResult?.texture || "Clay Loam",
      moistureIndex: weatherData?.current.soilMoisture || 0.28,
      organicMatter: soilResult?.organicMatterIndicator || "Medium"
    },
    weather: {
      temperature_c: weatherData?.current.temperature || 28,
      humidity_percent: weatherData?.current.humidity || 65,
      rainfall_24h_mm: weatherData?.current.precipitation || 0,
      forecastRainRisk: weatherData?.alerts.some(a => a.type === 'heavy_rain') ? "High" : "Moderate"
    },
    crop: {
      season: season.name,
      recommendedCrops: cropResult?.topCrops.map(c => ({
        name: c.cropName,
        suitabilityScore: c.suitabilityScore,
        durationDays: c.durationDays,
        regenerativePractice: c.regenerativeTip
      })) || []
    },
    risk: {
      overallRiskLevel: weatherData?.alerts.length ? "Moderate" : "Low",
      diseaseAlerts: weatherData?.alerts.map(a => a.title) || []
    },
    advisory: {
      primaryAdvice: cropResult?.advisorySummary || "Maintain scheduled irrigation and scout crops.",
      language
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishisetu-advisory-${selectedDistrict.name.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {t('hubTitle')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {t('hubSubtitle')}
            </span>
          </p>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('map')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'map'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t('regionalSignalsMap')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('report')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'report'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{t('submitFieldReport')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'schema'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>{t('openDataStandard')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('onboarding')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'onboarding'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t('stateOnboarding')}</span>
        </button>
      </div>

      {/* TAB 1: REGIONAL SIGNALS MAP */}
      {activeSubTab === 'map' && (
        <div className="space-y-5">
          
          {/* Map Container */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>{t('regionalSignalsMap')}</span>
                </h3>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-medium text-stone-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>{t('submitFieldReport')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Alert</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>High Risk</span>
                </span>
              </div>
            </div>

            <div 
              ref={mapContainerRef} 
              className="h-80 sm:h-96 w-full rounded-xl overflow-hidden border border-stone-200 z-0" 
            />
          </div>

          {/* Signals Stream Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('communityAlerts')} ({signals.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {signals.map((sig) => (
                <div
                  key={sig.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-bold text-stone-900 block">
                        {sig.crop}: {sig.issue}
                      </strong>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {sig.district}, {sig.state} • {new Date(sig.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      sig.isSimulated 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {sig.isSimulated ? 'Alert' : 'Farmer Signal'}
                    </span>
                  </div>

                  <p className="text-stone-700 leading-relaxed">
                    {sig.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Severity: <strong className="text-stone-700 uppercase">{sig.severity}</strong></span>
                    {sig.verifiedByKVK && <span className="text-emerald-700 font-semibold">✓ Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SUBMIT FIELD REPORT FORM */}
      {activeSubTab === 'report' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200 shadow-xs max-w-2xl mx-auto space-y-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900">
              {t('submitFieldReport')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('threeProblemsSubtitle')}
            </p>
          </div>

          {reportSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <Check className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-base">{t('sharedSuccess')}</h4>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('cropName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.crop}
                    onChange={(e) => setReportForm({ ...reportForm, crop: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-xs"
                    placeholder="e.g. Cotton, Soybean, Wheat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Severity *
                  </label>
                  <select
                    value={reportForm.severity}
                    onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer text-xs"
                  >
                    <option value="low">Low (लवकर इशारा)</option>
                    <option value="moderate">Moderate (मध्यम प्रसार)</option>
                    <option value="high">High (तीव्र धोका)</option>
                    <option value="critical">Critical (मोठा प्रादुर्भाव)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('selectIssue')} *
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.issue}
                  onChange={(e) => setReportForm({ ...reportForm, issue: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 font-semibold text-xs"
                  placeholder="e.g. Whitefly, Leaf Blight, Drought..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('notes')} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                  placeholder="Describe symptoms, spread, or observations..."
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 flex items-center justify-between border border-stone-200">
                <span>{selectedDistrict.name}, {selectedState.name}</span>
                <span className="font-mono text-[11px] text-stone-500">{selectedDistrict.lat.toFixed(3)}°N, {selectedDistrict.lon.toFixed(3)}°E</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? '...' : t('submitReport')}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: OPEN DATA STANDARD SCHEMA */}
      {activeSubTab === 'schema' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {t('openDataStandard')} (KIAAS v1.0)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('exportStandardJson')}</span>
                </button>
              </div>
            </div>

            {/* REST Endpoint Documentation Box */}
            <div className="p-4 bg-stone-900 text-stone-100 rounded-xl text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="font-bold">REST API Specification:</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg text-emerald-300">
                GET /advisory?lat={selectedDistrict.lat}&lon={selectedDistrict.lon}&lang={language}
              </div>
            </div>

            {/* Interactive Schema Payload Viewer */}
            <div className="pt-2">
              <FormattedJsonViewer 
                data={exportPayload} 
                title="KIAAS v1.0 Interoperable Advisory Schema" 
                defaultView="human" 
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATE ONBOARDING BLUEPRINT */}
      {activeSubTab === 'onboarding' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900">
              {t('stateOnboarding')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Zero vendor lock-in. Built as a digital public good that scales horizontally on Google Cloud Run.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                Adopt KIAAS Schema
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                State agricultural departments map their existing Soil Health Card (SHC) portals and APMC mandis to the KIAAS standard JSON schema.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                Point Telemetry Endpoints
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Configure state weather stations and KVK advisory feeds via standardized REST proxy hooks into the KrishiSetu cooperation gateway.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                Deploy Federated Container
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Deploy the open-source container onto Google Cloud Run, automatically federating local data with the national public good.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

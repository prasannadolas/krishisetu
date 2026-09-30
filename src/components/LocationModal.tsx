import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { INDIA_STATES } from '../data/india-geo';
import { X, MapPin, LocateFixed, Check, Search, ShieldCheck, Navigation, Sparkles } from 'lucide-react';
import L from 'leaflet';

export const LocationModal: React.FC = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    selectedState,
    selectedDistrict,
    setLocation,
    setPreciseLocation,
    searchPreciseLocation,
    useCurrentLocation,
    locationLoading,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'district' | 'precise'>('precise');
  const [districtQuery, setDistrictQuery] = useState('');
  const [villageQuery, setVillageQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    district: string;
    state: string;
    lat: number;
    lon: number;
  }>>([]);
  const [searching, setSearching] = useState(false);

  const [activeStateIndex, setActiveStateIndex] = useState(() => {
    const idx = INDIA_STATES.findIndex(s => s.name === selectedState.name);
    return idx >= 0 ? idx : 0;
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Debounced search for precise village/sub-locality
  useEffect(() => {
    if (!villageQuery.trim() || villageQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchPreciseLocation(villageQuery);
      setSearchResults(results);
      setSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [villageQuery]);

  // Leaflet map setup
  useEffect(() => {
    if (!isLocationModalOpen || !mapContainerRef.current) return;

    const lat = selectedDistrict.lat;
    const lon = selectedDistrict.lon;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lon], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color:#059669;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${selectedDistrict.villageName ? `${selectedDistrict.villageName}, ` : ''}${selectedDistrict.name}</b><br/>${selectedState.name}`).openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lon], 11);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.bindPopup(`<b>${selectedDistrict.villageName ? `${selectedDistrict.villageName}, ` : ''}${selectedDistrict.name}</b><br/>${selectedState.name}`).openPopup();
      }
    }

    // Fix map rendering size
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isLocationModalOpen, selectedDistrict.lat, selectedDistrict.lon, selectedDistrict.name, selectedDistrict.villageName]);

  if (!isLocationModalOpen) return null;

  const currentState = INDIA_STATES[activeStateIndex] || INDIA_STATES[0];

  const filteredDistricts = currentState.districts.filter(d => 
    d.name.toLowerCase().includes(districtQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <MapPin className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {t('changeLocation')}
              </h2>
              <p className="text-xs text-stone-600 font-semibold flex items-center gap-1">
                <span>
                  {selectedDistrict.villageName ? `${selectedDistrict.villageName} → ` : ''}
                  {selectedDistrict.name}, {selectedState.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-950 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Thrive with exact GPS field-level weather & soil telemetry</span>
          </div>
          <button
            onClick={async () => {
              await useCurrentLocation();
              setIsLocationModalOpen(false);
            }}
            disabled={locationLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{locationLoading ? 'Detecting...' : t('detectGPS')}</span>
          </button>
        </div>

        {/* Tab Selection: Precise Village Search vs State/District Grid */}
        <div className="flex border-b border-stone-200 bg-stone-50/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('precise')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'precise'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg border-t border-x border-stone-200 shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span>Search Village / Area</span>
          </button>

          <button
            onClick={() => setActiveTab('district')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'district'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg border-t border-x border-stone-200 shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>State & District List</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Map Preview Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <span>Precise Farm Coordinates Map</span>
              <span className="font-mono text-emerald-700 font-semibold">
                {selectedDistrict.lat.toFixed(4)}°N, {selectedDistrict.lon.toFixed(4)}°E
              </span>
            </div>
            <div 
              ref={mapContainerRef}
              className="w-full h-36 rounded-xl border border-stone-200 overflow-hidden shadow-inner z-0"
            />
          </div>

          {/* TAB 1: PRECISE VILLAGE / AREA AUTOCOMPLETE SEARCH */}
          {activeTab === 'precise' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Type Village, Gram Panchayat, or Taluka Name:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Hadapsar, Baramati, Niphad, Shirur, Shirdhon, Malegaon..."
                    value={villageQuery}
                    onChange={(e) => setVillageQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 rounded-xl text-xs sm:text-sm border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                  />
                  {searching && (
                    <span className="absolute right-3 top-3 text-xs text-stone-400 animate-pulse">Searching...</span>
                  )}
                </div>
              </div>

              {/* Autocomplete Results List */}
              {searchResults.length > 0 && (
                <div className="border border-stone-200 rounded-xl p-2 bg-stone-50 space-y-1 max-h-44 overflow-y-auto">
                  <span className="text-[10px] uppercase font-bold text-stone-400 px-2">Matching Areas in India</span>
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPreciseLocation(res.state, res.district, res.name, res.lat, res.lon);
                        setIsLocationModalOpen(false);
                      }}
                      className="w-full text-left p-2.5 bg-white hover:bg-emerald-50 rounded-lg border border-stone-200/80 transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="text-stone-900 text-xs block">{res.name}</strong>
                          <span className="text-stone-500 text-[11px]">{res.district}, {res.state}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">
                        {res.lat.toFixed(2)}°, {res.lon.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STATE & DISTRICT GRID */}
          {activeTab === 'district' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter district name..."
                  value={districtQuery}
                  onChange={(e) => setDistrictQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 rounded-xl text-xs border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {/* States Column */}
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 space-y-1 max-h-40 overflow-y-auto">
                  <span className="text-[10px] uppercase font-bold text-stone-400 px-1">Select State</span>
                  {INDIA_STATES.map((state, idx) => (
                    <button
                      key={state.name}
                      onClick={() => {
                        setActiveStateIndex(idx);
                        setDistrictQuery('');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                        idx === activeStateIndex
                          ? 'bg-emerald-100 text-emerald-900 font-bold'
                          : 'hover:bg-white text-stone-700'
                      }`}
                    >
                      <span>{state.name}</span>
                      <span className="text-[10px] text-stone-400">{state.districts.length}</span>
                    </button>
                  ))}
                </div>

                {/* Districts Column */}
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 space-y-1 max-h-40 overflow-y-auto">
                  <span className="text-[10px] uppercase font-bold text-stone-400 px-1">Districts in {currentState.name}</span>
                  {filteredDistricts.map((dst) => {
                    const isSelected = selectedState.name === currentState.name && selectedDistrict.name === dst.name;
                    return (
                      <button
                        key={dst.name}
                        onClick={() => {
                          setLocation(currentState.name, dst.name);
                          setIsLocationModalOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'hover:bg-white text-stone-700'
                        }`}
                      >
                        <span>{dst.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

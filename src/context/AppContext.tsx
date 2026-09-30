import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { 
  FarmerProfile, 
  FarmerRecord, 
  getFarmerProfile, 
  saveFarmerProfile, 
  getFarmerRecords, 
  saveFarmerRecord, 
  deleteFarmerRecord 
} from '../services/farmerDb';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { INDIA_STATES, StateGeo, District, getSeason } from '../data/india-geo';
import { fetchWeatherData, WeatherData } from '../services/weather';
import { fetchClimateTrends, ClimateTrendResult } from '../services/climate';
import { fetchRegionalSignals, RegionalSignal, submitFieldReport, FieldReportSubmission } from '../services/cooperation';
import { SoilAnalysisResult, DiseaseDiagnosisResult, CropRecommendationResult } from '../services/gemini';

export type TabId = 
  | 'home'
  | 'weather'
  | 'trends'
  | 'soil'
  | 'crops'
  | 'disease'
  | 'market'
  | 'cooperation'
  | 'records'
  | 'impact'
  | 'about';

export interface AssistedFarmer {
  id: string;
  name: string;
  phone?: string;
  village?: string;
  stateName: string;
  districtName: string;
  crop?: string;
  landAcres?: number;
  notes?: string;
  createdAt: string;
}

interface AppContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  
  // Location & Season
  selectedState: StateGeo;
  selectedDistrict: District;
  setLocation: (stateName: string, districtName: string) => void;
  setPreciseLocation: (stateName: string, districtName: string, villageName: string, lat: number, lon: number) => void;
  searchPreciseLocation: (query: string) => Promise<Array<{
    name: string;
    district: string;
    state: string;
    lat: number;
    lon: number;
  }>>;
  useCurrentLocation: () => Promise<void>;
  locationLoading: boolean;
  season: { name: string; localName: string; description: string };
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;

  // Digital Sahayak / Fellow Farmer Assistance
  assistedFarmer: AssistedFarmer | null;
  assistedFarmerList: AssistedFarmer[];
  isAssistMode: boolean;
  isDigitalSahayakModalOpen: boolean;
  setIsDigitalSahayakModalOpen: (open: boolean) => void;
  setAssistedFarmerContext: (farmer: AssistedFarmer | null) => void;
  saveAssistedFarmerToList: (farmer: Omit<AssistedFarmer, 'id' | 'createdAt'>) => AssistedFarmer;
  deleteAssistedFarmerFromList: (id: string) => void;
  clearAssistMode: () => void;

  // Agrometeorology
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  refreshWeather: () => Promise<void>;

  // Climate Trends
  climateData: ClimateTrendResult | null;
  climateLoading: boolean;

  // Soil Data
  soilResult: SoilAnalysisResult | null;
  setSoilResult: (res: SoilAnalysisResult | null) => void;
  manualNpkPh: { n?: number; p?: number; k?: number; ph?: number };
  setManualNpkPh: (data: { n?: number; p?: number; k?: number; ph?: number }) => void;

  // Disease Data
  diseaseResult: DiseaseDiagnosisResult | null;
  setDiseaseResult: (res: DiseaseDiagnosisResult | null) => void;

  // Crop Recommendation Data
  cropResult: CropRecommendationResult | null;
  setCropResult: (res: CropRecommendationResult | null) => void;
  cropLoading: boolean;
  fetchCrops: () => Promise<void>;

  // Cooperation Signals
  signals: RegionalSignal[];
  isCloudSynced: boolean;
  addSignal: (report: FieldReportSubmission) => Promise<boolean>;

  // Farmer Authentication & Persistent Database
  currentUser: User | null;
  farmerProfile: FarmerProfile | null;
  isAuthReady: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  farmerRecords: FarmerRecord[];
  recordsLoading: boolean;
  refreshFarmerRecords: () => Promise<void>;
  saveRecordToDb: (record: {
    recordType: 'soil_scan' | 'disease_diagnosis' | 'crop_advisory' | 'field_note';
    title: string;
    crop?: string;
    summary?: string;
    detailsJson?: string;
    imageUrl?: string;
  }) => Promise<boolean>;
  deleteRecordFromDb: (recordId: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signOutFarmer: () => Promise<void>;
  updateFarmerProfileData: (profile: Partial<FarmerProfile>) => Promise<void>;

  // Assistant & Printing
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  isPrintReportOpen: boolean;
  setIsPrintReportOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('krishisetu_lang') as SupportedLanguage) || 'en';
  });

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Farmer Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [farmerRecords, setFarmerRecords] = useState<FarmerRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Default to Maharashtra -> Pune
  const [selectedState, setSelectedState] = useState<StateGeo>(() => INDIA_STATES[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<District>(() => INDIA_STATES[0].districts[0]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Digital Sahayak State
  const [isDigitalSahayakModalOpen, setIsDigitalSahayakModalOpen] = useState(false);
  const [assistedFarmer, setAssistedFarmer] = useState<AssistedFarmer | null>(null);
  const [assistedFarmerList, setAssistedFarmerList] = useState<AssistedFarmer[]>(() => {
    try {
      const saved = localStorage.getItem('krishisetu_assisted_farmers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [primaryLocation, setPrimaryLocation] = useState<{ state: StateGeo; district: District } | null>(null);

  const isAssistMode = Boolean(assistedFarmer);

  const saveAssistedFarmerToList = (data: Omit<AssistedFarmer, 'id' | 'createdAt'>): AssistedFarmer => {
    const newFarmer: AssistedFarmer = {
      ...data,
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newFarmer, ...assistedFarmerList.filter(f => f.name.toLowerCase() !== data.name.toLowerCase())];
    setAssistedFarmerList(updated);
    try {
      localStorage.setItem('krishisetu_assisted_farmers', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return newFarmer;
  };

  const deleteAssistedFarmerFromList = (id: string) => {
    const updated = assistedFarmerList.filter(f => f.id !== id);
    setAssistedFarmerList(updated);
    try {
      localStorage.setItem('krishisetu_assisted_farmers', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    if (assistedFarmer?.id === id) {
      clearAssistMode();
    }
  };

  const setAssistedFarmerContext = (farmer: AssistedFarmer | null) => {
    if (farmer) {
      if (!primaryLocation) {
        setPrimaryLocation({ state: selectedState, district: selectedDistrict });
      }
      setAssistedFarmer(farmer);
      setLocation(farmer.stateName, farmer.districtName);
    } else {
      clearAssistMode();
    }
  };

  const clearAssistMode = () => {
    if (primaryLocation) {
      setSelectedState(primaryLocation.state);
      setSelectedDistrict(primaryLocation.district);
      setPrimaryLocation(null);
    }
    setAssistedFarmer(null);
  };

  // Weather state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Climate Trend state
  const [climateData, setClimateData] = useState<ClimateTrendResult | null>(null);
  const [climateLoading, setClimateLoading] = useState(false);

  // Soil state
  const [soilResult, setSoilResult] = useState<SoilAnalysisResult | null>(null);
  const [manualNpkPh, setManualNpkPh] = useState<{ n?: number; p?: number; k?: number; ph?: number }>({
    n: 210,
    p: 18,
    k: 320,
    ph: 7.2
  });

  // Disease state
  const [diseaseResult, setDiseaseResult] = useState<DiseaseDiagnosisResult | null>(null);

  // Crop recommendation state
  const [cropResult, setCropResult] = useState<CropRecommendationResult | null>(null);
  const [cropLoading, setCropLoading] = useState(false);

  // Cooperation Hub signals
  const [signals, setSignals] = useState<RegionalSignal[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  const season = getSeason();

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('krishisetu_lang', lang);
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return langDict[key] || TRANSLATIONS['en'][key] || key;
  };

  const setLocation = (stateName: string, districtName: string) => {
    const foundState = INDIA_STATES.find(s => s.name === stateName);
    if (foundState) {
      setSelectedState(foundState);
      const foundDistrict = foundState.districts.find(d => d.name === districtName) || foundState.districts[0];
      setSelectedDistrict(foundDistrict);
    }
  };

  const setPreciseLocation = (stateName: string, districtName: string, villageName: string, lat: number, lon: number) => {
    const foundState = INDIA_STATES.find(s => s.name.toLowerCase() === stateName.toLowerCase()) || INDIA_STATES[0];
    setSelectedState(foundState);
    const existingSoilZone = foundState.districts.find(d => d.name.toLowerCase() === districtName.toLowerCase())?.soilZone;
    setSelectedDistrict({
      name: districtName,
      lat,
      lon,
      villageName: villageName || undefined,
      soilZone: existingSoilZone || "Medium Black Soil"
    });
  };

  const searchPreciseLocation = async (query: string): Promise<Array<{
    name: string;
    district: string;
    state: string;
    lat: number;
    lon: number;
  }>> => {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results) return [];

      return data.results
        .filter((r: any) => r.country_code === 'IN' || r.country === 'India')
        .map((r: any) => ({
          name: r.name,
          district: r.admin2 || r.admin1 || r.name,
          state: r.admin1 || 'India',
          lat: r.latitude,
          lon: r.longitude
        }));
    } catch (err) {
      console.warn("Geocoding search failed:", err);
      return [];
    }
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let closestDist = Infinity;
        let bestState = INDIA_STATES[0];
        let bestDistrict = INDIA_STATES[0].districts[0];

        for (const st of INDIA_STATES) {
          for (const dst of st.districts) {
            const d = Math.hypot(dst.lat - latitude, dst.lon - longitude);
            if (d < closestDist) {
              closestDist = d;
              bestState = st;
              bestDistrict = dst;
            }
          }
        }

        // Try reverse geocoding for exact village/locality name
        let detectedVillage = '';
        try {
          const revUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
          const revRes = await fetch(revUrl, { headers: { 'User-Agent': 'KrishiSetu-App/1.0' } });
          if (revRes.ok) {
            const revData = await revRes.json();
            const addr = revData?.address || {};
            detectedVillage = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.county || addr.city_district || '';
          }
        } catch (e) {
          console.warn("Reverse geocode skip:", e);
        }

        setSelectedState(bestState);
        setSelectedDistrict({
          ...bestDistrict,
          lat: latitude,
          lon: longitude,
          villageName: detectedVillage || bestDistrict.villageName
        });
        setLocationLoading(false);
      },
      (err) => {
        console.warn("Geolocation denied or unavailable:", err.message);
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const loadWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchWeatherData(selectedDistrict.lat, selectedDistrict.lon);
      setWeatherData(data);
    } catch (err: any) {
      setWeatherError(err.message || 'Failed to fetch weather');
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadClimateTrends = async () => {
    setClimateLoading(true);
    try {
      const data = await fetchClimateTrends(selectedDistrict.lat, selectedDistrict.lon);
      setClimateData(data);
    } catch (err) {
      console.warn("Error fetching climate:", err);
    } finally {
      setClimateLoading(false);
    }
  };

  const loadSignals = async () => {
    const { signals: loaded, isCloud } = await fetchRegionalSignals();
    setSignals(loaded);
    setIsCloudSynced(isCloud);
  };

  const addSignal = async (report: FieldReportSubmission): Promise<boolean> => {
    const res = await submitFieldReport(report);
    if (res.success) {
      setSignals(prev => [res.signal, ...prev]);
      setIsCloudSynced(res.isCloud);
      return true;
    }
    return false;
  };

  // Farmer Authentication Listeners & Methods
  useEffect(() => {
    // Check if coming back from redirect authentication
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setIsAuthModalOpen(false);
      }
    }).catch(err => {
      console.warn("Redirect auth result notice:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);

      if (user) {
        try {
          let profile = await getFarmerProfile(user.uid);
          if (!profile) {
            // Auto create profile for newly authenticated farmer
            profile = {
              uid: user.uid,
              name: user.displayName || 'Kisan Sahayak',
              state: selectedState.name,
              district: selectedDistrict.name,
              createdAt: new Date().toISOString()
            };
            await saveFarmerProfile(profile);
          }
          setFarmerProfile(profile);
          await loadFarmerRecords(user.uid);
        } catch (e) {
          console.error("Error setting up user profile:", e);
        }
      } else {
        setFarmerProfile(null);
        setFarmerRecords([]);
      }
    });

    return () => unsubscribe();
  }, [selectedState.name, selectedDistrict.name]);

  const loadFarmerRecords = async (uid: string) => {
    setRecordsLoading(true);
    try {
      const records = await getFarmerRecords(uid);
      setFarmerRecords(records);
    } catch (e) {
      console.warn("Could not load farmer records:", e);
    } finally {
      setRecordsLoading(false);
    }
  };

  const refreshFarmerRecords = async () => {
    if (currentUser) {
      await loadFarmerRecords(currentUser.uid);
    }
  };

  const saveRecordToDb = async (record: {
    recordType: 'soil_scan' | 'disease_diagnosis' | 'crop_advisory' | 'field_note';
    title: string;
    crop?: string;
    summary?: string;
    detailsJson?: string;
    imageUrl?: string;
  }): Promise<boolean> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }

    try {
      const newRecord: FarmerRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUser.uid,
        recordType: record.recordType,
        title: record.title,
        crop: record.crop,
        summary: record.summary,
        detailsJson: record.detailsJson,
        imageUrl: record.imageUrl,
        createdAt: new Date().toISOString(),
      };

      await saveFarmerRecord(newRecord);
      setFarmerRecords(prev => [newRecord, ...prev]);
      return true;
    } catch (e) {
      console.error("Error saving farmer record to DB:", e);
      return false;
    }
  };

  const deleteRecordFromDb = async (recordId: string) => {
    if (!currentUser) return;
    try {
      await deleteFarmerRecord(currentUser.uid, recordId);
      setFarmerRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (e) {
      console.error("Error deleting farmer record:", e);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.warn("Google signInWithPopup failed, attempting redirect...", err);
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.message?.includes('popup')
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error("Redirect auth error:", redirectErr);
          throw redirectErr;
        }
      }
      throw err;
    }
  };

  const signOutFarmer = async () => {
    try {
      await fbSignOut(auth);
      setFarmerProfile(null);
      setFarmerRecords([]);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const updateFarmerProfileData = async (data: Partial<FarmerProfile>) => {
    if (!currentUser || !farmerProfile) return;
    const updated: FarmerProfile = {
      ...farmerProfile,
      ...data,
      uid: currentUser.uid,
      updatedAt: new Date().toISOString()
    };
    await saveFarmerProfile(updated);
    setFarmerProfile(updated);
  };

  const fetchCrops = async () => {
    setCropLoading(true);
    try {
      const weatherSummary = weatherData
        ? `Temp: ${weatherData.current.temperature}°C, Humidity: ${weatherData.current.humidity}%, Soil Moisture: ${weatherData.current.soilMoisture} m³/m³, Forecast Rain 7d: ${weatherData.daily.reduce((a, b) => a + b.precipitationSum, 0).toFixed(1)}mm`
        : 'Tropical semi-arid climate';

      const climateTrendSummary = climateData
        ? `25-year temperature shift: +${climateData.insight.tempChangeDegC}°C, Rain shift: ${climateData.insight.rainChangePercent}%`
        : 'Warming trend of +0.9°C with erratic monsoon showers';

      const res = await fetch('/api/gemini/crop-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState.name,
          district: selectedDistrict.name,
          lat: selectedDistrict.lat,
          lon: selectedDistrict.lon,
          season: season.name,
          soilData: soilResult || { soilType: selectedDistrict.soilZone || "Medium Black Soil", texture: "Clay Loam", organicMatterIndicator: "Medium" },
          manualNpkPh,
          weatherSummary,
          climateTrendSummary,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCropResult(data);
      }
    } catch (e) {
      console.error("Fetch crops error:", e);
    } finally {
      setCropLoading(false);
    }
  };

  // Re-fetch weather and climate when location changes
  useEffect(() => {
    loadWeather();
    loadClimateTrends();
  }, [selectedDistrict.lat, selectedDistrict.lon]);

  // Load signals once on mount
  useEffect(() => {
    loadSignals();
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        selectedState,
        selectedDistrict,
        setLocation,
        setPreciseLocation,
        searchPreciseLocation,
        useCurrentLocation,
        locationLoading,
        season,
        isLocationModalOpen,
        setIsLocationModalOpen,
        assistedFarmer,
        assistedFarmerList,
        isAssistMode,
        isDigitalSahayakModalOpen,
        setIsDigitalSahayakModalOpen,
        setAssistedFarmerContext,
        saveAssistedFarmerToList,
        deleteAssistedFarmerFromList,
        clearAssistMode,
        weatherData,
        weatherLoading,
        weatherError,
        refreshWeather: loadWeather,
        climateData,
        climateLoading,
        soilResult,
        setSoilResult,
        manualNpkPh,
        setManualNpkPh,
        diseaseResult,
        setDiseaseResult,
        cropResult,
        setCropResult,
        cropLoading,
        fetchCrops,
        signals,
        isCloudSynced,
        addSignal,
        currentUser,
        farmerProfile,
        isAuthReady,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        farmerRecords,
        recordsLoading,
        refreshFarmerRecords,
        saveRecordToDb,
        deleteRecordFromDb,
        loginWithGoogle,
        signOutFarmer,
        updateFarmerProfileData,
        isAssistantOpen,
        setIsAssistantOpen,
        isPrintReportOpen,
        setIsPrintReportOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export type SignalType = 'disease_outbreak' | 'pest_alert' | 'drought_stress' | 'flood_waterlog' | 'farmer_field_report';
export type SignalSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface RegionalSignal {
  id: string;
  type: SignalType;
  crop: string;
  issue: string;
  description: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  severity: SignalSeverity;
  timestamp: string;
  isSimulated: boolean; // True for seeded sample benchmarks, False for real farmer reports
  reportedBy?: string;
  verifiedByKVK?: boolean;
}

export interface FieldReportSubmission {
  crop: string;
  issue: string;
  description: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  severity: SignalSeverity;
  farmerName?: string;
  contactNumber?: string;
}

// Initial realistic benchmark seed data (marked strictly as Simulated)
export const SEEDED_SIGNALS: RegionalSignal[] = [
  {
    id: "sig-sim-1",
    type: "disease_outbreak",
    crop: "Soybean",
    issue: "Yellow Mosaic Virus (YMV)",
    description: "Whitefly vector transmitting golden yellow mosaic patterns in early vegetative crop.",
    state: "Maharashtra",
    district: "Amravati",
    lat: 20.9374,
    lon: 77.7796,
    severity: "high",
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    isSimulated: true,
    verifiedByKVK: true
  },
  {
    id: "sig-sim-2",
    type: "pest_alert",
    crop: "Cotton",
    issue: "Pink Bollworm (Pectinophora gossypiella)",
    description: "Rosette flowers detected in 15% surveyed squares. Exceeding economic threshold level.",
    state: "Gujarat",
    district: "Rajkot",
    lat: 22.3039,
    lon: 70.8022,
    severity: "critical",
    timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    isSimulated: true,
    verifiedByKVK: true
  },
  {
    id: "sig-sim-3",
    type: "disease_outbreak",
    crop: "Paddy (Rice)",
    issue: "Bacterial Leaf Blight (Xanthomonas oryzae)",
    description: "Water-soaked streaks turning grayish-white on leaf margins after heavy precipitation.",
    state: "Punjab",
    district: "Ludhiana",
    lat: 30.9010,
    lon: 75.8573,
    severity: "moderate",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    isSimulated: true,
    verifiedByKVK: true
  },
  {
    id: "sig-sim-4",
    type: "drought_stress",
    crop: "Chickpea (Chana)",
    issue: "Soil Moisture Depletion / Wilting",
    description: "Unseasonal 14-day dry spell during pod initiation. Emergency sprinkler irrigation needed.",
    state: "Karnataka",
    district: "Kalaburagi",
    lat: 17.3297,
    lon: 76.8343,
    severity: "high",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isSimulated: true,
    verifiedByKVK: false
  },
  {
    id: "sig-sim-5",
    type: "pest_alert",
    crop: "Maize",
    issue: "Fall Armyworm (Spodoptera frugiperda)",
    description: "Foliar pinholes and windowing observed on whorl leaves. Neem application commenced.",
    state: "Telangana",
    district: "Warangal",
    lat: 17.9689,
    lon: 79.5941,
    severity: "moderate",
    timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    isSimulated: true,
    verifiedByKVK: true
  }
];

const LOCAL_STORAGE_KEY = 'krishisetu_field_reports_v1';

export async function fetchRegionalSignals(): Promise<{ signals: RegionalSignal[]; isCloud: boolean }> {
  try {
    const res = await fetch('/api/cooperation/signals');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.signals)) {
        return { signals: data.signals, isCloud: Boolean(data.isCloud) };
      }
    }
  } catch (e) {
    console.warn("Could not reach cooperation API endpoint, using local store:", e);
  }

  // Fallback to localStorage + seeded benchmarks
  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const localReports: RegionalSignal[] = localRaw ? JSON.parse(localRaw) : [];
    return {
      signals: [...localReports, ...SEEDED_SIGNALS],
      isCloud: false
    };
  } catch {
    return { signals: SEEDED_SIGNALS, isCloud: false };
  }
}

export async function submitFieldReport(report: FieldReportSubmission): Promise<{ success: boolean; signal: RegionalSignal; isCloud: boolean }> {
  const newSignal: RegionalSignal = {
    id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'farmer_field_report',
    ...report,
    timestamp: new Date().toISOString(),
    isSimulated: false, // REAL farmer field report
    verifiedByKVK: false
  };

  // Always save to localStorage for offline resilience
  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: RegionalSignal[] = localRaw ? JSON.parse(localRaw) : [];
    existing.unshift(newSignal);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error("Local storage error:", err);
  }

  // Attempt server sync
  try {
    const res = await fetch('/api/cooperation/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSignal)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, signal: data.signal || newSignal, isCloud: Boolean(data.isCloud) };
    }
  } catch (err) {
    console.warn("Server sync deferred to local mode:", err);
  }

  return { success: true, signal: newSignal, isCloud: false };
}

// Open Data Standard Schema definition for Digital Public Good inter-state exchange
export const KRISHISETU_OPEN_DATA_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "KrishiSetu Interoperable Agro-Advisory Standard (KIAAS)",
  "description": "Standardized schema for exchanging localized agricultural advisories, telemetry, and regional risk alerts across Indian states and union territories.",
  "type": "object",
  "required": [
    "standardVersion",
    "region",
    "timestamp",
    "soil",
    "weather",
    "advisory",
    "crop",
    "risk"
  ],
  "properties": {
    "standardVersion": {
      "type": "string",
      "enum": ["1.0.0"]
    },
    "region": {
      "type": "object",
      "required": ["state", "district", "latitude", "longitude", "agroClimaticZone"],
      "properties": {
        "state": { "type": "string", "example": "Maharashtra" },
        "district": { "type": "string", "example": "Pune" },
        "latitude": { "type": "number", "minimum": 6.0, "maximum": 38.0 },
        "longitude": { "type": "number", "minimum": 68.0, "maximum": 98.0 },
        "agroClimaticZone": { "type": "string", "example": "Western Plateau & Hill Zone" }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "soil": {
      "type": "object",
      "required": ["type", "moistureIndex"],
      "properties": {
        "type": { "type": "string", "example": "Medium Black Soil" },
        "texture": { "type": "string", "example": "Clay Loam" },
        "moistureIndex": { "type": "number", "minimum": 0, "maximum": 1 },
        "organicMatter": { "type": "string", "enum": ["Low", "Medium", "High"] },
        "nitrogen_kg_ha": { "type": "number", "nullable": true },
        "phosphorus_kg_ha": { "type": "number", "nullable": true },
        "potassium_kg_ha": { "type": "number", "nullable": true },
        "ph": { "type": "number", "nullable": true }
      }
    },
    "weather": {
      "type": "object",
      "required": ["temperature_c", "humidity_percent", "rainfall_24h_mm"],
      "properties": {
        "temperature_c": { "type": "number" },
        "humidity_percent": { "type": "number" },
        "rainfall_24h_mm": { "type": "number" },
        "forecastRainRisk": { "type": "string", "enum": ["Low", "Moderate", "High", "Critical"] }
      }
    },
    "crop": {
      "type": "object",
      "required": ["recommendedCrops", "season"],
      "properties": {
        "season": { "type": "string", "enum": ["Kharif", "Rabi", "Zaid"] },
        "recommendedCrops": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "suitabilityScore", "durationDays"],
            "properties": {
              "name": { "type": "string" },
              "suitabilityScore": { "type": "number", "minimum": 0, "maximum": 100 },
              "durationDays": { "type": "number" },
              "regenerativePractice": { "type": "string" }
            }
          }
        }
      }
    },
    "risk": {
      "type": "object",
      "required": ["diseaseAlerts", "overallRiskLevel"],
      "properties": {
        "overallRiskLevel": { "type": "string", "enum": ["Low", "Moderate", "High", "Critical"] },
        "diseaseAlerts": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "advisory": {
      "type": "object",
      "required": ["primaryAdvice", "language"],
      "properties": {
        "primaryAdvice": { "type": "string" },
        "language": { "type": "string", "example": "hi" },
        "irrigationDirective": { "type": "string" },
        "fertilizerDirective": { "type": "string" }
      }
    }
  }
};

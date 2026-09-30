export interface SoilAnalysisResult {
  soilType: string;
  texture: string;
  color: string;
  moistureEstimate: string;
  organicMatterIndicator: 'Low' | 'Medium' | 'High';
  confidence: number;
  keyCharacteristics: string[];
  laboratoryTestingAdvice: string;
}

export interface DiseaseDiagnosisResult {
  isPlant: boolean;
  cropDetected: string;
  diseaseOrPest: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  symptoms: string[];
  probableCauses: string;
  organicTreatments: string[];
  chemicalTreatmentsWithSafetyNote: string;
  preventiveMeasures: string[];
  weatherLinkedRiskFactors: string;
}

export interface CropRecommendationItem {
  rank: number;
  cropName: string;
  botanicalName?: string;
  suitabilityScore: number;
  whyThisCrop: string;
  sowingWindow: string;
  waterNeed: 'Low' | 'Moderate' | 'High';
  durationDays: number;
  keyRisks: string;
  regenerativeTip: string;
  profitabilityEstimate: string;
  govtSchemesAndMSP: string;
}

export interface CropRecommendationResult {
  topCrops: CropRecommendationItem[];
  groundedSources: Array<{ title: string; url: string }>;
  agroClimaticZone: string;
  advisorySummary: string;
}

export interface AssistantChatResponse {
  answer: string;
  usedTools: string[];
  speechAudioWav?: string; // Optional audio data URL
}

export async function analyzeSoilImage(base64Image: string, language: string = 'en'): Promise<SoilAnalysisResult> {
  const res = await fetch('/api/gemini/soil-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, language })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Soil analysis failed: ${errorText || res.statusText}`);
  }

  return res.json();
}

export async function diagnoseCropDisease(
  base64Image: string,
  cropHint: string = '',
  language: string = 'en',
  weatherSummary?: string
): Promise<DiseaseDiagnosisResult> {
  const res = await fetch('/api/gemini/disease-diagnosis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image,
      cropHint,
      language,
      weatherSummary
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Disease diagnosis failed: ${errorText || res.statusText}`);
  }

  return res.json();
}

export async function getCropRecommendations(payload: {
  state: string;
  district: string;
  lat: number;
  lon: number;
  season: string;
  soilData?: Partial<SoilAnalysisResult>;
  manualNpkPh?: { n?: number; p?: number; k?: number; ph?: number };
  weatherSummary?: string;
  climateTrendSummary?: string;
  language: string;
}): Promise<CropRecommendationResult> {
  const res = await fetch('/api/gemini/crop-recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Crop recommendation failed: ${errorText || res.statusText}`);
  }

  return res.json();
}

export async function getClimateImplications(payload: {
  tempDelta: number;
  rainDeltaPercent: number;
  region: string;
  language: string;
}): Promise<{ implication: string; recommendations: string[] }> {
  const res = await fetch('/api/gemini/climate-implication', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return {
      implication: `A warming trajectory of +${payload.tempDelta}°C reduces soil microbial moisture retention and accelerates evapotranspiration, demanding shift toward drought-hardy root systems.`,
      recommendations: [
        "Incorporate organic crop residue mulching to drop root zone temperatures by 3-4°C.",
        "Transition toward micro-irrigation (drip) with deficit scheduling.",
        "Introduce pulse intercropping (chickpea/pigeon pea) to revitalize nitrogen fixation."
      ]
    };
  }

  return res.json();
}

export async function askFarmerAssistant(
  history: Array<{ role: 'user' | 'assistant'; text: string }>,
  message: string,
  context: {
    state: string;
    district: string;
    lat: number;
    lon: number;
    season: string;
    language: string;
  }
): Promise<AssistantChatResponse> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message, context })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Assistant request failed: ${errorText || res.statusText}`);
  }

  return res.json();
}

export interface MandiPricePoint {
  date: string;
  modalPrice: number; // ₹ per quintal (100 kg)
  minPrice: number;
  maxPrice: number;
}

export interface CropMarketInfo {
  cropName: string;
  category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Cash Crop' | 'Vegetable' | 'Millet';
  mandi: string;
  state: string;
  currentModalPrice: number; // ₹ / quintal
  mspPrice: number; // Minimum Support Price announced by Govt
  priceChange30d: number; // percentage +/-
  thirtyDayTrend: MandiPricePoint[];
  bestTimeToSellHint: string;
  marketSentiment: 'Bullish' | 'Neutral' | 'Bearish';
  isLive: boolean;
  dataSourceLabel: string;
}

export const COMMODITY_BENCHMARKS: Record<string, { category: CropMarketInfo['category']; basePrice: number; msp: number; hint: string }> = {
  "Paddy (Dhan)": {
    category: "Cereal",
    basePrice: 2300,
    msp: 2320,
    hint: "Government procurement active at MSP. Hold dry grain in moisture-proof bags for 3 weeks post-harvest peak to capture a 6-9% price rebound."
  },
  "Wheat (Gehun)": {
    category: "Cereal",
    basePrice: 2425,
    msp: 2425,
    hint: "Buffer stock demand strong. Best selling window is 4-6 weeks after initial harvest rush when local flour mill orders rise."
  },
  "Cotton (Kapas)": {
    category: "Cash Crop",
    basePrice: 7120,
    msp: 7521,
    hint: "CCI procurement centers offering MSP. Stagger sales in 2 tranches: 50% early to cover input loans, 50% in mid-season."
  },
  "Soybean": {
    category: "Oilseed",
    basePrice: 4750,
    msp: 4892,
    hint: "Global edible oil import duties favor domestic processing. Avoid panic selling during first week of October arrivals."
  },
  "Chickpea (Chana / Gram)": {
    category: "Pulse",
    basePrice: 5850,
    msp: 5650,
    hint: "Market trading well above MSP due to festive pulse consumption. High holding capacity yields premium returns in off-season."
  },
  "Mustard (Sarson)": {
    category: "Oilseed",
    basePrice: 5550,
    msp: 5950,
    hint: "Government NAFED/HAFED procurement is recommended since open market spot rates are currently fluctuating near MSP."
  },
  "Maize (Makka)": {
    category: "Cereal",
    basePrice: 2180,
    msp: 2225,
    hint: "Ethanol blending and poultry feed demand keeping prices stable. Ensure grain moisture is below 14% to prevent moisture deductions."
  },
  "Pearl Millet (Bajra)": {
    category: "Millet",
    basePrice: 2550,
    msp: 2625,
    hint: "Increasing urban health consumer demand and state millets procurement missions ensure steady floor prices."
  },
  "Pigeon Pea (Tur / Arhar)": {
    category: "Pulse",
    basePrice: 9400,
    msp: 7550,
    hint: "High market deficit keeps spot prices ~20% above MSP. Gradual staggered sales recommended."
  },
  "Onion": {
    category: "Vegetable",
    basePrice: 2200,
    msp: 0,
    hint: "High volatility. Sell in well-aerated batches. Do not store without temperature & fungal cure protection."
  },
  "Tomato": {
    category: "Vegetable",
    basePrice: 1800,
    msp: 0,
    hint: "Perishable crop. Immediate farm-gate aggregation via FPO (Farmer Producer Org) to avoid mandi commission cuts."
  }
};

export async function fetchMarketData(crop: string, state: string, district?: string): Promise<CropMarketInfo> {
  try {
    const res = await fetch(`/api/market/prices?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district || '')}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.currentModalPrice) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Market API call fallback:", err);
  }

  return generateRealisticBenchmarkMarketData(crop, state, district);
}

export function generateRealisticBenchmarkMarketData(cropName: string, state: string, district?: string): CropMarketInfo {
  // Normalize match
  let matchedKey = Object.keys(COMMODITY_BENCHMARKS).find(k =>
    cropName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(cropName.toLowerCase())
  ) || "Wheat (Gehun)";

  const benchmark = COMMODITY_BENCHMARKS[matchedKey];
  const mandiName = district ? `${district} APMC Mandi` : `${state} Principal Market`;

  // Generate 30 days of realistic price fluctuations
  const thirtyDayTrend: MandiPricePoint[] = [];
  const today = new Date();
  let currentPrice = benchmark.basePrice;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    
    // Slight drift and daily variation
    const dailyDelta = (Math.sin(i * 0.7) * 0.015 + (Math.cos(i * 1.3) * 0.01)) * benchmark.basePrice;
    const modal = Math.round(benchmark.basePrice + dailyDelta);
    const min = Math.round(modal * 0.94);
    const max = Math.round(modal * 1.05);

    thirtyDayTrend.push({
      date: dateStr,
      modalPrice: modal,
      minPrice: min,
      maxPrice: max
    });

    if (i === 0) {
      currentPrice = modal;
    }
  }

  const startPrice = thirtyDayTrend[0].modalPrice;
  const priceChange30d = Number((((currentPrice - startPrice) / startPrice) * 100).toFixed(1));

  let marketSentiment: CropMarketInfo['marketSentiment'] = 'Neutral';
  if (priceChange30d > 2.5) marketSentiment = 'Bullish';
  else if (priceChange30d < -2.5) marketSentiment = 'Bearish';

  return {
    cropName: matchedKey,
    category: benchmark.category,
    mandi: mandiName,
    state,
    currentModalPrice: currentPrice,
    mspPrice: benchmark.msp,
    priceChange30d,
    thirtyDayTrend,
    bestTimeToSellHint: benchmark.hint,
    marketSentiment,
    isLive: false,
    dataSourceLabel: "Demo Benchmark Dataset (Agmarknet 2024-25 Modal Reference)"
  };
}

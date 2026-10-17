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
    basePrice: 2320,
    msp: 2300, // CCEA MSP for KMS 2024-25 (Common: ₹2300, Grade A: ₹2320)
    hint: "Government procurement active at MSP (₹2,300/q). Hold moisture-certified grain (under 17%) in warehouse receipts (e-NWR) to capture a 6-8% post-procurement price rebound."
  },
  "Wheat (Gehun)": {
    category: "Cereal",
    basePrice: 2475,
    msp: 2425, // CCEA MSP for RMS 2024-25 (₹2425/q)
    hint: "Open Market Sale Scheme (OMSS) and flour miller demand steady. Optimal selling window is 3-5 weeks post-peak harvest arrivals."
  },
  "Cotton (Kapas)": {
    category: "Cash Crop",
    basePrice: 7280,
    msp: 7121, // CCEA MSP for Medium Staple (₹7121), Long Staple (₹7521)
    hint: "Cotton Corporation of India (CCI) procurement centers active. Sell 50% early to clear operational input costs and retain 50% for December-January export parity."
  },
  "Soybean": {
    category: "Oilseed",
    basePrice: 4720,
    msp: 4892, // CCEA MSP KMS 2024-25 (₹4892/q)
    hint: "Domestic crush demand strong. If local spot rates dip under MSP of ₹4,892, enroll for Bhavantar / NAFED PSS price deficiency procurement."
  },
  "Chickpea (Chana / Gram)": {
    category: "Pulse",
    basePrice: 5950,
    msp: 5650, // CCEA MSP RMS 2024-25 (₹5650/q)
    hint: "Spot mandi rates trading comfortably above MSP of ₹5,650 due to tight ending stocks. Gradual staggered dispatch over 60 days maximizes realized margins."
  },
  "Mustard (Sarson)": {
    category: "Oilseed",
    basePrice: 5650,
    msp: 5950, // CCEA MSP RMS 2024-25 (₹5950/q)
    hint: "NAFED & HAFED support procurement recommended whenever local open mandi bids lag behind official MSP of ₹5,950/q."
  },
  "Maize (Makka)": {
    category: "Cereal",
    basePrice: 2260,
    msp: 2225, // CCEA MSP KMS 2024-25 (₹2225/q)
    hint: "Ethanol distilleries and feed mills driving consistent floor demand. Keep grain moisture below 14% to prevent moisture cut deductions."
  },
  "Pearl Millet (Bajra)": {
    category: "Millet",
    basePrice: 2680,
    msp: 2625, // CCEA MSP KMS 2024-25 (₹2625/q)
    hint: "State Shree Anna millet mission procurement active. Highest returns achieved through direct aggregation via Farmer Producer Organizations (FPOs)."
  },
  "Pigeon Pea (Tur / Arhar)": {
    category: "Pulse",
    basePrice: 9650,
    msp: 7550, // CCEA MSP KMS 2024-25 (₹7550/q)
    hint: "Structural supply deficit keeping spot rates substantially above MSP. Stagger delivery across monthly intervals."
  },
  "Onion": {
    category: "Vegetable",
    basePrice: 2450,
    msp: 0,
    hint: "High perishability and weather-linked price volatility. Grade bulbs by size and ensure aeration to avoid fungal rot in transit."
  },
  "Tomato": {
    category: "Vegetable",
    basePrice: 1950,
    msp: 0,
    hint: "Short shelf life. Aggregate at farm-gate via local FPO or direct-to-retail channels to avoid 8-12% commission agent cuts in central APMCs."
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

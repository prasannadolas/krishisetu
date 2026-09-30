export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  soilMoisture: number; // m³/m³ (0-7cm)
  soilTemperature: number;
  et0: number; // mm
  isDay: boolean;
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  et0: number;
  weatherCode: number;
  uvIndexMax: number;
}

export interface SmartAlert {
  id: string;
  type: 'heatwave' | 'heavy_rain' | 'dry_spell' | 'frost' | 'fungal_risk' | 'pest_watch';
  severity: 'warning' | 'danger' | 'advisory';
  title: string;
  message: string;
  recommendedAction: string;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  alerts: SmartAlert[];
  isOfflineFallback?: boolean;
}

export function getWeatherConditionDescription(code: number): string {
  switch (code) {
    case 0: return "Clear sky";
    case 1: return "Mainly clear";
    case 2: return "Partly cloudy";
    case 3: return "Overcast";
    case 45: case 48: return "Fog & depositing rime fog";
    case 51: case 53: case 55: return "Drizzle (Light/Moderate/Dense)";
    case 61: case 63: case 65: return "Rain (Slight/Moderate/Heavy)";
    case 71: case 73: case 75: return "Snow fall";
    case 80: case 81: case 82: return "Rain showers";
    case 95: case 96: case 99: return "Thunderstorm / Hail";
    default: return "Scattered clouds";
  }
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,soil_temperature_0_to_7cm,soil_moisture_0_to_7cm&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration,uv_index_max&timezone=Asia%2FKolkata&forecast_days=7`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }
    const data = await response.json();

    const current: CurrentWeather = {
      temperature: Math.round(data.current?.temperature_2m ?? 28),
      apparentTemperature: Math.round(data.current?.apparent_temperature ?? 30),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 65),
      precipitation: Number((data.current?.precipitation ?? 0).toFixed(1)),
      weatherCode: data.current?.weather_code ?? 1,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 12),
      soilMoisture: Number((data.current?.soil_moisture_0_to_7cm ?? 0.28).toFixed(2)),
      soilTemperature: Math.round(data.current?.soil_temperature_0_to_7cm ?? 26),
      et0: Number((data.daily?.et0_fao_evapotranspiration?.[0] ?? 4.2).toFixed(1)),
      isDay: Boolean(data.current?.is_day ?? 1),
      timestamp: new Date().toISOString()
    };

    const daily: DailyForecast[] = (data.daily?.time || []).map((dateStr: string, idx: number) => ({
      date: dateStr,
      tempMax: Math.round(data.daily.temperature_2m_max[idx]),
      tempMin: Math.round(data.daily.temperature_2m_min[idx]),
      precipitationSum: Number((data.daily.precipitation_sum[idx] ?? 0).toFixed(1)),
      precipitationProbability: Math.round(data.daily.precipitation_probability_max[idx] ?? 20),
      et0: Number((data.daily.et0_fao_evapotranspiration[idx] ?? 4.0).toFixed(1)),
      weatherCode: data.daily.weather_code[idx] ?? 1,
      uvIndexMax: Math.round(data.daily.uv_index_max[idx] ?? 6)
    }));

    const alerts = generateSmartAlerts(current, daily);

    return { current, daily, alerts };
  } catch (error) {
    console.warn("Using offline agrometeorology model fallback:", error);
    return getFallbackWeatherData(lat, lon);
  }
}

function generateSmartAlerts(current: CurrentWeather, daily: DailyForecast[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // 1. Heatwave Alert
  const maxTemps = daily.map(d => d.tempMax);
  const peakTemp = Math.max(...maxTemps, current.temperature);
  if (peakTemp >= 40) {
    alerts.push({
      id: 'alert-heatwave',
      type: 'heatwave',
      severity: 'danger',
      title: `Heatwave Alert: Max ${peakTemp}°C Forecasted`,
      message: `Extremely elevated temperatures will trigger severe evapotranspiration and flower dropping in pulses, vegetables, and cotton.`,
      recommendedAction: `Apply light, frequent evening drip/furrow irrigation. Use straw mulching or biomass shade to protect root zone soil moisture.`
    });
  }

  // 2. Heavy Rain / Inundation Alert
  const totalRainNext3Days = daily.slice(0, 3).reduce((acc, d) => acc + d.precipitationSum, 0);
  const maxSingleDayRain = Math.max(...daily.map(d => d.precipitationSum));
  if (maxSingleDayRain >= 40 || totalRainNext3Days >= 60) {
    alerts.push({
      id: 'alert-heavy-rain',
      type: 'heavy_rain',
      severity: 'danger',
      title: `Heavy Rain & Waterlogging Warning (${Math.round(maxSingleDayRain)}mm/day)`,
      message: `Intense precipitation expected within 48-72 hours. High danger of root asphyxiation, nutrient leaching, and lodging in standing crops.`,
      recommendedAction: `Clear drainage channels and farm bunds immediately. Postpone chemical sprayings and nitrogen top-dressing until showers abate.`
    });
  }

  // 3. Dry Spell / Soil Moisture Deficit
  const isDrySpell = daily.every(d => d.precipitationSum < 1) && current.soilMoisture < 0.18;
  if (isDrySpell) {
    alerts.push({
      id: 'alert-dry-spell',
      type: 'dry_spell',
      severity: 'warning',
      title: `Prolonged Dry Spell: Soil Moisture Depleted (${(current.soilMoisture * 100).toFixed(0)}%)`,
      message: `No significant rain in 7-day forecast with active ET₀ rates (~${current.et0} mm/day). Crop wilting stress probable in non-irrigated plots.`,
      recommendedAction: `Schedule life-saving supplemental irrigation during morning hours. Prioritize critical growth stages (tillering, flowering).`
    });
  }

  // 4. Frost / Cold Wave Alert
  const minTemp = Math.min(...daily.map(d => d.tempMin), current.temperature);
  if (minTemp <= 4) {
    alerts.push({
      id: 'alert-frost',
      type: 'frost',
      severity: 'warning',
      title: `Frost & Cold Wave Risk: Night Temp Dropping to ${minTemp}°C`,
      message: `Near-freezing temperatures jeopardize mustard, potato, and tender vegetable foliage through cellular ice crystallization.`,
      recommendedAction: `Provide evening light irrigation to increase soil thermal inertia. Light smoke smudges on windward farm borders if frost deepens.`
    });
  }

  // 5. Fungal Spore & Blast Weather Trigger
  if (current.humidity >= 78 && current.temperature >= 22 && current.temperature <= 31 && (current.precipitation > 0 || daily[0]?.precipitationSum > 2)) {
    alerts.push({
      id: 'alert-fungal',
      type: 'fungal_risk',
      severity: 'warning',
      title: `High Agro-Climate Risk: Foliar Fungal Blast / Blight`,
      message: `Prolonged relative humidity (${current.humidity}%) combined with warm ambient temperatures (${current.temperature}°C) creates ideal microclimate for sporulation.`,
      recommendedAction: `Scout lower leaves for lesions. Spray neem oil (5ml/L) or prophylactic bio-fungicide (Trichoderma viride @ 5g/L) before full onset.`
    });
  }

  return alerts;
}

function getFallbackWeatherData(lat: number, lon: number): WeatherData {
  const current: CurrentWeather = {
    temperature: 29,
    apparentTemperature: 31,
    humidity: 62,
    precipitation: 0.0,
    weatherCode: 1,
    windSpeed: 11,
    soilMoisture: 0.24,
    soilTemperature: 27,
    et0: 4.5,
    isDay: true,
    timestamp: new Date().toISOString()
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const daily: DailyForecast[] = dates.map((date, idx) => ({
    date,
    tempMax: 32 + (idx % 3),
    tempMin: 22 - (idx % 2),
    precipitationSum: idx === 2 ? 8.5 : 0.2,
    precipitationProbability: idx === 2 ? 65 : 15,
    et0: 4.2 + (idx * 0.1),
    weatherCode: idx === 2 ? 61 : 1,
    uvIndexMax: 7
  }));

  const alerts = generateSmartAlerts(current, daily);

  return {
    current,
    daily,
    alerts,
    isOfflineFallback: true
  };
}

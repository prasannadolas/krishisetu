# KrishiSetu (कृषिसेतू) - Agricultural Intelligence Network
*An Interoperable Digital Public Good for Climate-Resilient Indian Agriculture*
*National Hackathon • Problem: Agricultural Intelligence • Theme: Cooperation*

---

## 🌾 The Problem We Solve

Small and marginal farmers across India lack field-level data on climate, soil, upcoming seasonal shifts, and pest vectors. In the absence of shared digital infrastructure across Indian states, farmers rely on guesswork—resulting in recurring crop failures, vulnerability to extreme climate volatility, and distress selling.

KrishiSetu is built as an **interoperable digital public good** that enables state agricultural departments, Krishi Vigyan Kendras (KVKs), and smallholders to collaborate on climate-resilient farming through shared data, multimodal AI vision, and federated regional outbreak alerts.

---

## 🌟 Key Features

1. **Hyperlocal Agrometeorology (Open-Meteo)**
   - Live temperature, relative humidity, wind speed, solar radiation, and soil moisture (0-7 cm depth).
   - Smart Agro-Climate Alerts: Heatwave, Heavy Rain/Waterlogging, Dry Spells, Frost, and Fungal Disease Spore Triggers with plain-language agronomic directives.

2. **25+ Year Climate Change Trajectory**
   - Empirical historical climate series from Open-Meteo Archive API (1995 to 2024).
   - Mathematical linear regression calculating temperature anomalies and rainfall variability.
   - **Gemini 3.8 Flash** synthesizes actionable 3-line agronomic farming implications.

3. **Multimodal Soil Photo Analysis (Gemini Vision)**
   - Upload topsoil photos to determine soil type (Vertisol, Inceptisol, Laterite, etc.), texture class, color, and organic matter indicators.
   - *Statutory Transparency*: Clear notice that photographs estimate physical type and texture only; chemical NPK and pH require a Government Soil Health Card.
   - Optional manual entry for N, P, K, and pH from Soil Health Cards to calibrate recommendations.

4. **Regenerative Crop Recommendations (Google Search Grounding)**
   - Context-aware ranking combining soil profile, live moisture, 25-year climate trends, and current season (Kharif/Rabi/Zaid).
   - Grounded in official Indian Government schemes (PM-Kisan, PMFBY, NFSM, RKVY) and latest Minimum Support Prices (MSP) with verified source links.
   - Ranked cards include suitability score, sowing window, water footprint, duration, risks, regenerative practices, and market profitability.

5. **AI Plant Disease Diagnostics & Community Biosecurity**
   - Multimodal leaf photo analysis detecting fungal blights, rusts, and pest attacks with confidence scores.
   - Organic remedies, chemical controls with mandatory PPE safety instructions, and preventative measures.
   - Weather-correlated foliar disease risk warnings (humidity + damp canopy).
   - One-click broadcast of anonymized outbreaks into the interstate Cooperation Hub.

6. **Market Intelligence & Selling Windows**
   - Real-time Mandi modal prices, MSP comparisons, and 30-day price trend analysis.
   - Strategic harvest-selling window hints to avoid distress selling.
   - *Transparent Labeling*: Distinctly marked as "Live Agmarknet" or "Demo Benchmark Dataset" so simulated data is never misrepresented.

7. **Cooperation Hub (The Digital Public Good)**
   - Interactive Leaflet map visualizing national agricultural signals (outbreaks, drought alerts, farmer reports).
   - "Submit a Ground Observation" form allowing farmers to contribute real telemetry.
   - **KrishiSetu Interoperable Agro-Advisory Standard (KIAAS v1.0)** JSON Schema.
   - REST API endpoint: `GET /advisory?lat=&lon=&lang=` for cross-state data federation.
   - State Onboarding Blueprint showing how any Indian state can deploy the container and federate data.
   - One-click export of current advisories in the standard schema.

8. **Kisan Sahayak (Agentic AI Assistant)**
   - Voice-enabled conversational agent with Web Speech API input and speech synthesis audio in 8 Indian languages.
   - **Autonomous Function Calling**: Gemini dynamically invokes `getWeather`, `getClimateTrend`, `getMarketPrices`, and `getFieldReports`.
   - Displays a visible reasoning trace badge (e.g. `Used: weather, market`) under every answer.

9. **Impact Estimator**
   - Interactive economic and environmental outcome simulator (farmers reached, yield-loss reduction %, land area).
   - Transparently labeled as an *illustrative estimate based on ICAR field benchmarks*.

10. **One-Page Printable Farmer Report (PDF)**
    - Formatted one-page advisory sheet designed for low-bandwidth rural printing and distribution via local panchayats.

---

## 🇮🇳 Multilingual Support (8 Indian Languages)

Fully localized interface and AI generation in:
- **English** (`en-IN`)
- **हिन्दी (Hindi)** (`hi-IN`)
- **मराठी (Marathi)** (`mr-IN`)
- **தமிழ் (Tamil)** (`ta-IN`)
- **తెలుగు (Telugu)** (`te-IN`)
- **ಕನ್ನಡ (Kannada)** (`kn-IN`)
- **বাংলা (Bengali)** (`bn-IN`)
- **ગુજરાતી (Gujarati)** (`gu-IN`)

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Visualizations & Maps**: Recharts (Agro-climate & Mandi trends), Leaflet + OpenStreetMap
- **Backend & APIs**: Node.js, Express, TypeScript (TSX)
- **AI Engine**: `@google/genai` with `gemini-2.5-flash`
  - Multimodal Vision with JSON Schema validation
  - Autonomous Agent Function Calling
  - Google Search Grounding for live government policies and MSP
- **External Public APIs**: Open-Meteo Forecast, Open-Meteo Historical Archive, Open-Meteo Geocoding

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Google Gemini AI API Key (Mandatory for multimodal vision, function calling, grounding)
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Data.gov.in Agmarknet API key for live Mandi spot prices
DATA_GOV_KEY=""

# Application Port (Defaults to 3000 in dev, 8080 on Cloud Run)
PORT=3000
```

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs full-stack Express + Vite)
npm run dev

# App will be accessible at http://localhost:3000
```

---

## ☁️ Deploying to Google Cloud Run

KrishiSetu is containerized with a production multi-stage `Dockerfile`:

```bash
# Build & Deploy to Google Cloud Run
gcloud run deploy krishisetu \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key"
```

The container listens on standard Cloud Run port `8080` and serves both the Express backend API proxy and the static React application.

---

## 📜 Open Data Standard (KIAAS v1.0)

States can consume localized advisories using the standardized REST endpoint:

```http
GET /advisory?lat=18.5204&lon=73.8567&lang=hi
```

Sample JSON response adheres to the KIAAS v1.0 specification including region coordinates, soil health, weather observations, disease alerts, and ranked crop matches.

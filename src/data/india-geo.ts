export interface District {
  name: string;
  lat: number;
  lon: number;
  soilZone?: string;
  villageName?: string;
  subLocality?: string;
}

export interface StateGeo {
  name: string;
  code: string;
  capital: string;
  lat: number;
  lon: number;
  districts: District[];
}

export const INDIA_STATES: StateGeo[] = [
  {
    name: "Maharashtra",
    code: "MH",
    capital: "Mumbai",
    lat: 19.7515,
    lon: 75.7139,
    districts: [
      { name: "Pune", lat: 18.5204, lon: 73.8567, soilZone: "Medium Black Soil" },
      { name: "Nashik", lat: 19.9975, lon: 73.7898, soilZone: "Red & Black Soil" },
      { name: "Nagpur", lat: 21.1458, lon: 79.0882, soilZone: "Deep Black Clayey Soil" },
      { name: "Aurangabad (Chhatrapati Sambhajinagar)", lat: 19.8762, lon: 75.3433, soilZone: "Black Cotton Soil" },
      { name: "Kolhapur", lat: 16.7050, lon: 74.2433, soilZone: "Lateritic & Red Loam" },
      { name: "Amravati", lat: 20.9374, lon: 77.7796, soilZone: "Black Cotton Soil" },
      { name: "Solapur", lat: 17.6599, lon: 75.9064, soilZone: "Shallow & Medium Black" },
      { name: "Satara", lat: 17.6805, lon: 73.9934, soilZone: "Red Sandy Loam" }
    ]
  },
  {
    name: "Uttar Pradesh",
    code: "UP",
    capital: "Lucknow",
    lat: 26.8467,
    lon: 80.9462,
    districts: [
      { name: "Lucknow", lat: 26.8467, lon: 80.9462, soilZone: "Alluvial Loam" },
      { name: "Varanasi", lat: 25.3176, lon: 82.9739, soilZone: "Fine Alluvial Clay" },
      { name: "Kanpur", lat: 26.4499, lon: 80.3319, soilZone: "Gangetic Alluvial" },
      { name: "Agra", lat: 27.1767, lon: 78.0081, soilZone: "Sandy Alluvial" },
      { name: "Gorakhpur", lat: 26.7606, lon: 83.3732, soilZone: "Tarai Silty Loam" },
      { name: "Meerut", lat: 28.9845, lon: 77.7064, soilZone: "Rich Alluvial Loam" },
      { name: "Prayagraj", lat: 25.4358, lon: 81.8463, soilZone: "Alluvial Silt" }
    ]
  },
  {
    name: "Punjab",
    code: "PB",
    capital: "Chandigarh",
    lat: 31.1471,
    lon: 75.3412,
    districts: [
      { name: "Ludhiana", lat: 30.9010, lon: 75.8573, soilZone: "Rich Sandy Loam" },
      { name: "Amritsar", lat: 31.6340, lon: 74.8723, soilZone: "Silty Alluvium" },
      { name: "Jalandhar", lat: 31.3260, lon: 75.5762, soilZone: "Alluvial Plain" },
      { name: "Bathinda", lat: 30.2110, lon: 74.9455, soilZone: "Calcareous Sandy Loam" },
      { name: "Patiala", lat: 30.3398, lon: 76.3869, soilZone: "Clay Loam Alluvial" }
    ]
  },
  {
    name: "Madhya Pradesh",
    code: "MP",
    capital: "Bhopal",
    lat: 22.9734,
    lon: 78.6569,
    districts: [
      { name: "Bhopal", lat: 23.2599, lon: 77.4126, soilZone: "Medium Black Soil" },
      { name: "Indore", lat: 22.7196, lon: 75.8577, soilZone: "Deep Malwa Black Soil" },
      { name: "Jabalpur", lat: 23.1815, lon: 79.9864, soilZone: "Mixed Red & Black" },
      { name: "Gwalior", lat: 26.2183, lon: 78.1828, soilZone: "Alluvial & Sandy" },
      { name: "Ujjain", lat: 23.1765, lon: 75.7885, soilZone: "Black Cotton Soil" }
    ]
  },
  {
    name: "Karnataka",
    code: "KA",
    capital: "Bengaluru",
    lat: 15.3173,
    lon: 75.7139,
    districts: [
      { name: "Bengaluru Rural", lat: 13.2248, lon: 77.5753, soilZone: "Red Sandy Loam" },
      { name: "Mysuru", lat: 12.2958, lon: 76.6394, soilZone: "Red Loamy Soil" },
      { name: "Dharwad", lat: 15.4589, lon: 75.0078, soilZone: "Medium to Deep Black" },
      { name: "Belagavi", lat: 15.8497, lon: 74.4977, soilZone: "Mixed Laterite & Black" },
      { name: "Shivamogga", lat: 13.9299, lon: 75.5681, soilZone: "Lateritic Red Soil" },
      { name: "Kalaburagi", lat: 17.3297, lon: 76.8343, soilZone: "Deep Black Soil" }
    ]
  },
  {
    name: "Tamil Nadu",
    code: "TN",
    capital: "Chennai",
    lat: 11.1271,
    lon: 78.6569,
    districts: [
      { name: "Coimbatore", lat: 11.0168, lon: 76.9558, soilZone: "Red Gravelly Soil" },
      { name: "Madurai", lat: 9.9252, lon: 78.1198, soilZone: "Red & Black Mixed" },
      { name: "Thanjavur", lat: 10.7870, lon: 79.1378, soilZone: "Cauvery Delta Alluvial" },
      { name: "Salem", lat: 11.6643, lon: 78.1460, soilZone: "Red Loam" },
      { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047, soilZone: "Delta Alluvium" }
    ]
  },
  {
    name: "Gujarat",
    code: "GJ",
    capital: "Gandhinagar",
    lat: 22.2587,
    lon: 71.1924,
    districts: [
      { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, soilZone: "Goradu Sandy Loam" },
      { name: "Rajkot", lat: 22.3039, lon: 70.8022, soilZone: "Medium Black Soil" },
      { name: "Surat", lat: 21.1702, lon: 72.8311, soilZone: "Deep Black Clay" },
      { name: "Vadodara", lat: 22.3072, lon: 73.1812, soilZone: "Alluvial & Black Soil" },
      { name: "Junagadh", lat: 21.5222, lon: 70.4579, soilZone: "Coastal Alluvium & Lime" }
    ]
  },
  {
    name: "Rajasthan",
    code: "RJ",
    capital: "Jaipur",
    lat: 27.0238,
    lon: 74.2179,
    districts: [
      { name: "Jaipur", lat: 26.9124, lon: 75.7873, soilZone: "Sandy Loam to Clay" },
      { name: "Jodhpur", lat: 26.2389, lon: 73.0243, soilZone: "Desert Sandy Soil" },
      { name: "Kota", lat: 25.2138, lon: 75.8648, soilZone: "Deep Black Clay" },
      { name: "Sri Ganganagar", lat: 29.9038, lon: 73.8772, soilZone: "Irrigated Alluvial Sand" },
      { name: "Udaipur", lat: 24.5854, lon: 73.7125, soilZone: "Red & Yellow Soil" }
    ]
  },
  {
    name: "Andhra Pradesh",
    code: "AP",
    capital: "Amaravati",
    lat: 15.9129,
    lon: 79.7400,
    districts: [
      { name: "Guntur", lat: 16.3067, lon: 80.4365, soilZone: "Black Cotton Soil" },
      { name: "Krishna", lat: 16.1809, lon: 81.1303, soilZone: "Deltaic Alluvium" },
      { name: "Kurnool", lat: 15.8281, lon: 78.0373, soilZone: "Red & Black Soil" },
      { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185, soilZone: "Red Sandy Loam" }
    ]
  },
  {
    name: "Telangana",
    code: "TG",
    capital: "Hyderabad",
    lat: 18.1124,
    lon: 79.0193,
    districts: [
      { name: "Warangal", lat: 17.9689, lon: 79.5941, soilZone: "Chalka Sandy Loam" },
      { name: "Nizamabad", lat: 18.6725, lon: 78.0941, soilZone: "Black & Chalkas" },
      { name: "Khammam", lat: 17.2473, lon: 80.1514, soilZone: "Mixed Red & Black" },
      { name: "Karimnagar", lat: 18.4386, lon: 79.1288, soilZone: "Red Sandy Loam" }
    ]
  },
  {
    name: "West Bengal",
    code: "WB",
    capital: "Kolkata",
    lat: 22.9868,
    lon: 87.8550,
    districts: [
      { name: "Burdwan (Purba Bardhaman)", lat: 23.2324, lon: 87.8615, soilZone: "Gangetic Alluvial Silt" },
      { name: "Nadia", lat: 23.4710, lon: 88.5565, soilZone: "Rich Riverine Alluvium" },
      { name: "Murshidabad", lat: 24.1759, lon: 88.2802, soilZone: "Newer Alluvial Soil" },
      { name: "Midnapore (Paschim Medinipur)", lat: 22.4257, lon: 87.3199, soilZone: "Laterite Red Soil" }
    ]
  },
  {
    name: "Bihar",
    code: "BR",
    capital: "Patna",
    lat: 25.0961,
    lon: 85.3131,
    districts: [
      { name: "Patna", lat: 25.5941, lon: 85.1376, soilZone: "Gangetic Alluvium" },
      { name: "Muzaffarpur", lat: 26.1209, lon: 85.3647, soilZone: "Calcareous Silt Loam" },
      { name: "Bhagalpur", lat: 25.2425, lon: 86.9842, soilZone: "Alluvial Clay Loam" },
      { name: "Gaya", lat: 24.7914, lon: 85.0002, soilZone: "Sandy Loam to Clay" }
    ]
  },
  {
    name: "Haryana",
    code: "HR",
    capital: "Chandigarh",
    lat: 29.0588,
    lon: 76.0856,
    districts: [
      { name: "Karnal", lat: 29.6857, lon: 76.9905, soilZone: "Fertile Alluvial Loam" },
      { name: "Hisar", lat: 29.1492, lon: 75.7217, soilZone: "Sandy Loam" },
      { name: "Rohtak", lat: 28.8955, lon: 76.6066, soilZone: "Alluvial Plain" },
      { name: "Sirsa", lat: 29.5349, lon: 75.0298, soilZone: "Desert Sandy Soil" }
    ]
  },
  {
    name: "Odisha",
    code: "OD",
    capital: "Bhubaneswar",
    lat: 20.9517,
    lon: 85.0985,
    districts: [
      { name: "Cuttack", lat: 20.4625, lon: 85.8828, soilZone: "Deltaic Alluvium" },
      { name: "Sambalpur", lat: 21.4669, lon: 83.9812, soilZone: "Red & Yellow Soil" },
      { name: "Ganjam", lat: 19.3800, lon: 85.0600, soilZone: "Coastal Sandy Loam" },
      { name: "Balasore", lat: 21.4934, lon: 86.9135, soilZone: "Coastal Saline & Alluvium" }
    ]
  },
  {
    name: "Assam",
    code: "AS",
    capital: "Dispur",
    lat: 26.2006,
    lon: 92.9376,
    districts: [
      { name: "Kamrup", lat: 26.3314, lon: 91.5644, soilZone: "Brahmaputra Alluvium" },
      { name: "Jorhat", lat: 26.7509, lon: 94.2037, soilZone: "Acidic Alluvial Soil" },
      { name: "Nagaon", lat: 26.3468, lon: 92.6840, soilZone: "Floodplain Alluvium" },
      { name: "Dibrugarh", lat: 27.4728, lon: 94.9120, soilZone: "Alluvial Sandy Silt" }
    ]
  },
  {
    name: "Kerala",
    code: "KL",
    capital: "Thiruvananthapuram",
    lat: 10.8505,
    lon: 76.2711,
    districts: [
      { name: "Palakkad", lat: 10.7867, lon: 76.6548, soilZone: "Black & Red Loam" },
      { name: "Wayanad", lat: 11.6854, lon: 76.1320, soilZone: "Humus-rich Forest Loam" },
      { name: "Alappuzha", lat: 9.4981, lon: 76.3388, soilZone: "Coastal Alluvium & Peat" },
      { name: "Thrissur", lat: 10.5276, lon: 76.2144, soilZone: "Laterite Soil" }
    ]
  }
];

export function getSeason(date: Date = new Date()): { name: string; localName: string; description: string } {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  // Kharif: June - Oct (months 5 to 9)
  if (month >= 5 && month <= 9) {
    return {
      name: "Kharif",
      localName: "Monsoon Crop (खरीफ / खरीप)",
      description: "Sown in June-July with monsoon rains; harvested in autumn (Sept-Oct)."
    };
  }
  // Rabi: Oct - March (months 9 to 2)
  if (month >= 9 || month <= 2) {
    return {
      name: "Rabi",
      localName: "Winter Crop (रबी / रब्बी)",
      description: "Sown in Oct-Dec with winter irrigation; harvested in spring (March-April)."
    };
  }
  // Zaid: March - June (months 2 to 5)
  return {
    name: "Zaid",
    localName: "Summer Crop (जायद / उन्हाळी)",
    description: "Short summer crop sown in March-April with warm weather and irrigation."
  };
}

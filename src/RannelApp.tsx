import React, { useState, useEffect, useRef } from 'react';

const WaveAnimation: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 wave-animation" />
    </div>
  </div>
);
// Add these interfaces for better type checking
interface POIWeights {
  readonly [key: string]: number;
}

interface FEMAFloodZoneResponse {
  results: Array<{
    attributes: {
      FLD_ZONE: string;
      ZONE_SUBTY: string;
      SFHA_TF: string;
      STATIC_BFE?: number;
      DEPTH?: number;
      VELOCITY?: number;
    };
    geometry: {
      rings: number[][][];
    };
  }>;
}

interface FEMAZoneAttributes {
  zoneId: string;
  subtype: string;
  isSpecialFloodHazardArea: boolean;
  baseFloodElevation?: number;
  depth?: number;
  velocity?: number;
}


interface POIMaxScores {
  readonly [key: string]: number;
}

interface FloodZoneData {
  score: number;
  riskLevel: 'High' | 'Moderate' | 'Low' | 'Minimal';
  details: {
    zoneType: string;
    description: string;
    annualChance: string;
    baseFloodElevation?: number;
  };
  geometry?: google.maps.LatLngLiteral[];
}

interface GeoLocation {
  lat: number;
  lng: number;
}

const generateMockFloodData = (location: GeoLocation): FloodZoneData => {
  // Generate a random score with bias towards higher scores (lower flood risk)
  // Using triangular distribution for more realistic data
  const generateScore = (): number => {
    const min = 50;
    const max = 200;
    const peak = 175; // Bias towards higher scores
    const random = Math.random();
    
    if (random < (peak - min) / (max - min)) {
      return Math.round(min + Math.sqrt(random * (max - min) * (peak - min)));
    } else {
      return Math.round(max - Math.sqrt((1 - random) * (max - min) * (max - peak)));
    }
  };

  const score = generateScore();
  const riskLevel = getRiskLevel(score);

  // Generate zone type based on score
  const getZoneType = (score: number): string => {
    if (score > 150) return 'X';
    if (score > 100) return 'X PROTECTED BY LEVEE';
    if (score > 50) return 'AE';
    return 'VE';
  };

  const zoneType = getZoneType(score);

  return {
    score,
    riskLevel,
    details: {
      zoneType,
      annualChance: getAnnualChance(score),
      baseFloodElevation: getBaseFloodElevation(score),
      insuranceRequired: score < 150,
      communityRating: getCommunityRating(score),
      protectionLevel: getProtectionLevel(score),
      description: getZoneDescription(score)
    }
  };
};

// Helper functions for mock data
const getRiskLevel = (score: number): 'High' | 'Moderate' | 'Low' | 'Minimal' => {
  if (score >= 150) return 'Minimal';
  if (score >= 100) return 'Low';
  if (score >= 50) return 'Moderate';
  return 'High';
};

const getAnnualChance = (score: number): string => {
  if (score >= 150) return 'Less than 0.2% Annual Chance';
  if (score >= 100) return '0.2% Annual Chance';
  if (score >= 50) return '1% Annual Chance';
  return '1% Annual Chance with Velocity';
};

const getBaseFloodElevation = (score: number): string => {
  if (score < 200) {
    const elevation = Math.round(Math.random() * 15 + 5);
    return `${elevation} ft`;

  }
  return 'N/A';
};

const getCommunityRating = (score: number): string => {
  if (score >= 150) return 'Excellent';
  if (score >= 100) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
};

const getProtectionLevel = (score: number): string => {
  if (score >= 150) return 'Excellent';
  if (score >= 100) return 'Good';
  if (score >= 50) return 'Moderate';
  return 'Minimal';
};

const getZoneDescription = (score: number): string => {
  if (score >= 150) {
    return 'Area of minimal flood hazard with very low risk of flooding. Standard precautions recommended.';
  }
  if (score >= 100) {
    return 'Area protected by flood control systems with moderate protection. Basic flood insurance may be recommended.';
  }
  if (score >= 50) {
    return 'Area with moderate flood risk. Consider flood protection measures and insurance coverage.';
  }
  return 'High-risk flood area with significant flood concerns. Comprehensive flood protection measures strongly advised.';
};

interface StateHeatData {
  stateName: string;
  average: number;
  finalScore: number;
}

interface HeatMapDetails {
  stateCode: string;
  average: number;
  score: number;
  marketType: 'Buyer' | 'Balanced' | 'Seller';
  trend: 'Rising' | 'Stable' | 'Falling';
}

interface HeatMapAnalysis {
  score: number;
  details: HeatMapDetails;
}

interface FBICrimeResponse {
  data: Array<{
    year: number;
    actual: number;
    cleared: number;
    population: number;
  }>;
  error?: string;
}

interface MapError extends Error {
  code?: string;
}
interface CrimeApiResponse {
  results: Array<{
    ori: string;
    population: number;
    violent_crime: number;
    property_crime: number;
    aggravated_assault: number;
    robbery: number;
    burglary: number;
    larceny: number;
    motor_vehicle_theft: number;
  }>;
}

interface CrimeStats {
  crimeRate: number;
  safetyScore: number;
  violentCrime: number;
  score: number;
  details: CrimeDetails;
}
/*interface CrimeStats {
  crimeRate: number;
  safetyScore: number;
  violentCrime: number;
  score: number;
  details: {
    assaults: number;
    robberies: number;
    burglaries: number;
    thefts: number;
    vehicleThefts: number;
  };
}*/

// Add CrimeDetails interface
interface CrimeDetails {
  assaults: number;
  robberies: number;
  burglaries: number;
  thefts: number;
  vehicleThefts: number;
}

// Add CrimeData interface
interface CrimeData {
  score: number;
  crimeRate: number;
  safetyScore: number;
  violentCrime: number;
  details: CrimeDetails;
}

const STATE_HEAT_DATA: Record<string, StateHeatData> = {
  "CT": { stateName: "CT", average: 81.1, finalScore: 191.33 },
  "RI": { stateName: "RI", average: 77.8, finalScore: 184.34 },
  "NY": { stateName: "NY", average: 74.2, finalScore: 174.46 },
  "ME": { stateName: "ME", average: 72.4, finalScore: 169.16 },
  "AK": { stateName: "AK", average: 69.7, finalScore: 164.34 },
  "IL": { stateName: "IL", average: 67.1, finalScore: 158.07 },
  "MA": { stateName: "MA", average: 66.8, finalScore: 156.87 },
  "ND": { stateName: "ND", average: 66.6, finalScore: 157.11 },
  "MN": { stateName: "MN", average: 64.3, finalScore: 150.60 },
  "NJ": { stateName: "NJ", average: 62.4, finalScore: 148.67 },
  "WI": { stateName: "WI", average: 61.7, finalScore: 144.34 },
  "VA": { stateName: "VA", average: 60.5, finalScore: 143.37 },
  "NH": { stateName: "NH", average: 59.8, finalScore: 140.48 },
  "MD": { stateName: "MD", average: 59.7, finalScore: 141.93 },
  "PA": { stateName: "PA", average: 59.5, finalScore: 140.48 },
  "OH": { stateName: "OH", average: 59.4, finalScore: 138.31 },
  "MI": { stateName: "MI", average: 59.4, finalScore: 137.83 },
  "CA": { stateName: "CA", average: 57.9, finalScore: 136.14 },
  "VT": { stateName: "VT", average: 56.7, finalScore: 133.01 },
  "NM": { stateName: "NM", average: 56.1, finalScore: 133.73 },
  "WV": { stateName: "WV", average: 55.7, finalScore: 131.57 },
  "SD": { stateName: "SD", average: 54.3, finalScore: 128.19 },
  "DE": { stateName: "DE", average: 54.0, finalScore: 128.43 },
  "KS": { stateName: "KS", average: 52.0, finalScore: 121.93 },
  "UT": { stateName: "UT", average: 51.7, finalScore: 122.65 },
  "NV": { stateName: "NV", average: 51.3, finalScore: 121.45 },
  "MO": { stateName: "MO", average: 50.7, finalScore: 119.52 },
  "WY": { stateName: "WY", average: 49.6, finalScore: 114.70 },
  "WA": { stateName: "WA", average: 48.9, finalScore: 114.46 },
  "IA": { stateName: "IA", average: 48.3, finalScore: 112.53 },
  "CO": { stateName: "CO", average: 47.0, finalScore: 110.12 },
  "IN": { stateName: "IN", average: 46.3, finalScore: 107.71 },
  "NE": { stateName: "NE", average: 45.8, finalScore: 106.02 },
  "AZ": { stateName: "AZ", average: 45.7, finalScore: 109.16 },
  "ID": { stateName: "ID", average: 44.9, finalScore: 104.82 },
  "OR": { stateName: "OR", average: 44.5, finalScore: 104.34 },
  "LA": { stateName: "LA", average: 43.7, finalScore: 104.10 },
  "GA": { stateName: "GA", average: 43.7, finalScore: 102.65 },
  "MS": { stateName: "MS", average: 43.6, finalScore: 104.10 },
  "AR": { stateName: "AR", average: 43.1, finalScore: 102.89 },
  "AL": { stateName: "AL", average: 42.3, finalScore: 99.76 },
  "OK": { stateName: "OK", average: 42.0, finalScore: 99.76 },
  "NC": { stateName: "NC", average: 42.0, finalScore: 98.07 },
  "TX": { stateName: "TX", average: 39.9, finalScore: 94.46 },
  "MT": { stateName: "MT", average: 39.7, finalScore: 92.29 },
  "HI": { stateName: "HI", average: 38.6, finalScore: 90.60 },
  "KY": { stateName: "KY", average: 37.5, finalScore: 87.95 },
  "TN": { stateName: "TN", average: 35.9, finalScore: 84.58 },
  "SC": { stateName: "SC", average: 35.4, finalScore: 84.10 },
  "FL": { stateName: "FL", average: 32.8, finalScore: 78.31 }
};
const FBI_API_KEY = 'KGCHD5QLxYmLrqKeuZrqnvBzx58e0ZhyRqW1jXYP';
const fetchFloodZoneData = async (location: GeoLocation): Promise<FloodZoneData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockFloodData(location);
};

const getFloodZoneColor = (score: number): string => {
  if (score >= 150) return '#22c55e'; // green
  if (score >= 100) return '#84cc16'; // light green
  if (score >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
};
// Example usage in your analyzeLocation function
const analyzeLocation = async (location: GeoLocation): Promise<void> => {
  setLoading(true);
  try {
    const floodData = await fetchFloodZoneData(location);
    setFloodData(floodData);
    
    // Update visualization on the map
    if (map && floodData.score < 150) {
      // Create a circle to represent flood risk area
      const radius = Math.max(100, (200 - floodData.score) * 10); // Higher risk = larger circle
      const floodCircle = new google.maps.Circle({
        strokeColor: getFloodZoneColor(floodData.score),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: getFloodZoneColor(floodData.score),
        fillOpacity: 0.35,
        map,
        center: location,
        radius: radius // meters
      });
      

      // Store reference to remove later if needed
      if (floodZoneOverlay) {
        floodZoneOverlay.setMap(null);
      }
      setFloodZoneOverlay(floodCircle);
    }
  } catch (error) {
    console.error('Error in flood analysis:', error);
  } finally {
    setLoading(false);
  }
};

const processFloodZone = (attributes: any): FEMAZoneAttributes => {
  return {
    zoneId: attributes.FLD_ZONE,
    subtype: attributes.ZONE_SUBTY || '',
    isSpecialFloodHazardArea: attributes.SFHA_TF === 'T',
    baseFloodElevation: attributes.STATIC_BFE,
    depth: attributes.DEPTH,
    velocity: attributes.VELOCITY
  };
};

const calculateFloodScore = (attributes: FEMAZoneAttributes): number => {
  let baseScore = 200; // Start with max score (safest)

  // Special Flood Hazard Area is the biggest factor
  if (attributes.isSpecialFloodHazardArea) {
    baseScore -= 100;
  }

  // Zone-specific adjustments
  switch (attributes.zoneId) {
    case 'V':
    case 'VE':
      baseScore -= 75; // Coastal high-velocity wave action
      break;
    case 'A':
    case 'AE':
    case 'AH':
    case 'AO':
      baseScore -= 50; // 1% annual chance flood areas
      break;
    case 'X':
      if (attributes.subtype === '0.2 PCT ANNUAL CHANCE FLOOD HAZARD') {
        baseScore -= 25; // 0.2% annual chance flood areas
      }
      break;
  }

  // Adjust for depth if available
  if (attributes.depth) {
    baseScore -= Math.min(25, attributes.depth * 5);
  }

  // Adjust for velocity if available
  if (attributes.velocity) {
    baseScore -= Math.min(25, attributes.velocity * 2);
  }

  // Ensure score stays within 0-200 range
  return Math.max(0, Math.min(200, baseScore));
};

const determineRiskLevel = (score: number): 'High' | 'Moderate' | 'Low' | 'Minimal' => {
  if (score <= 50) return 'High';
  if (score <= 100) return 'Moderate';
  if (score <= 150) return 'Low';
  return 'Minimal';
};



const fetchCrimeData = async (location: GeoLocation): Promise<CrimeStats> => {
  try {
    // Updated base URL and endpoint
    const baseUrl = 'https://api.usa.gov/crime/fbi/cde';
    const apiKey = 'YOUR_NEW_API_KEY'; // Replace with your new API key

    // First get the agency data
    const agencyUrl = `${baseUrl}/agencies/byLocation?lat=${location.lat}&lng=${location.lng}&api_key=${apiKey}`;
    console.log('Fetching agency data:', agencyUrl);
    
    const agencyResponse = await fetch(agencyUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!agencyResponse.ok) {
      const errorText = await agencyResponse.text();
      console.error('Agency API Error:', errorText);
      throw new Error(`Agency API Error: ${agencyResponse.status}`);
    }

    const agencyData = await agencyResponse.json();
    console.log('Agency Data:', agencyData);

    if (!agencyData?.data?.agencies?.[0]?.ori) {
      console.warn('No agency found for location');
      return getDefaultCrimeStats();
    }

    const ori = agencyData.data.agencies[0].ori;
    const startYear = 2019;
    const endYear = 2023;

    // Function to fetch specific crime type data
    const fetchCrimeType = async (offense: string): Promise<any> => {
      const url = `${baseUrl}/offense/agencies/${ori}/${offense}/${startYear}/${endYear}?api_key=${apiKey}`;
      console.log(`Fetching ${offense} data:`, url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${offense} API Error:`, errorText);
        throw new Error(`${offense} API Error: ${response.status}`);
      }

      return response.json();
    };

    // Fetch all crime types
    const [
      violentCrime,
      propertyCrime,
      assaults,
      robberies,
      burglaries,
      thefts,
      vehicleThefts
    ] = await Promise.all([
      fetchCrimeType('violent-crime'),
      fetchCrimeType('property-crime'),
      fetchCrimeType('aggravated-assault'),
      fetchCrimeType('robbery'),
      fetchCrimeType('burglary'),
      fetchCrimeType('larceny'),
      fetchCrimeType('motor-vehicle-theft')
    ]);

    // Get most recent year's data
    const getRecentData = (data: any) => {
      if (!data?.data?.length) return 0;
      const validData = data.data.filter((d: any) => d.actual !== undefined && d.population > 0);
      return validData.length > 0 ? validData[validData.length - 1].actual : 0;
    };

    const population = violentCrime?.data?.[0]?.population || 100000;
    const totalViolentCrime = getRecentData(violentCrime);
    const totalPropertyCrime = getRecentData(propertyCrime);

    // Calculate crime rate per 100,000 residents
    const crimeRate = ((totalViolentCrime + totalPropertyCrime) / population) * 100000;
    
    // Calculate safety score (inverse relationship with crime rate)
    const safetyScore = Math.max(0, Math.min(100, 100 - (crimeRate / 50)));
    
    // Calculate final score out of 200
    const score = Math.round((safetyScore / 100) * 200);

    return {
      crimeRate: Math.round(crimeRate),
      safetyScore: Math.round(safetyScore),
      violentCrime: totalViolentCrime,
      score,
      details: {
        assaults: getRecentData(assaults),
        robberies: getRecentData(robberies),
        burglaries: getRecentData(burglaries),
        thefts: getRecentData(thefts),
        vehicleThefts: getRecentData(vehicleThefts)
      }
    };

  } catch (error) {
    console.error('Error fetching crime data:', error);
    // Return mock data as fallback
    return {

      crimeRate: 3592,
      safetyScore: 65,
      violentCrime: 150,
      score: 130,
      details: {
        assaults: 85,
        robberies: 25,
        burglaries: 120,
        thefts: 450,
        vehicleThefts: 65
      }
    };
  }
};

const searchNearbyPlaces = async (service: google.maps.places.PlacesService, location: GeoLocation, radius: number, type: string): Promise<google.maps.places.PlaceResult[]> => {
  return new Promise((resolve, reject) => {
    service.nearbySearch({
      location,
      radius,
      type: type // Now passing a single string instead of array
    }, (results, status) => {
      if (status === 'OK' && results) {
        resolve(results);
      } else if (status === 'ZERO_RESULTS') {
        resolve([]);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
};

interface CustomPlaceResult extends Omit<google.maps.places.PlaceResult, 'geometry'> {
  geometry: {
    location: google.maps.LatLng;
    viewport?: google.maps.LatLngBounds;
  };
  place_id: string; // Make place_id required
}

const getDefaultCrimeStats = (): CrimeStats => ({
  crimeRate: 0,
  safetyScore: 0,
  violentCrime: 0,
  score: 0,
  details: {
    assaults: 0,
    robberies: 0,
    burglaries: 0,
    thefts: 0,
    vehicleThefts: 0
  }
});
const getStateFromAddress = (address: string): string => {
  // Try to match state in various formats
  const patterns = [
    /,\s*([A-Z]{2})\s*\d{5}/, // Matches ", TX 75019"
    /,\s*([A-Z]{2})\s*,/, // Matches ", TX,"
    /,\s*([A-Z]{2})\s*$/, // Matches ", TX" at end
    /\b([A-Z]{2})\s*\d{5}/, // Matches "TX 75019"
  ];

  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Additional check for common state names
  const stateNames = Object.keys(STATE_HEAT_DATA);
  for (const state of stateNames) {
    if (address.toUpperCase().includes(state)) {
      return state;
    }
  }

  console.warn('No state found in address:', address);
  return '';
};

// Add these helper functions
const handleMapError = (error: MapError) => {
  console.error('Map error:', error);
  let errorMessage = 'An error occurred with the map.';
  
  switch (error.code) {
    case 'ZERO_RESULTS':
      errorMessage = 'No results found for this location.';
      break;
    case 'OVER_QUERY_LIMIT':
      errorMessage = 'Too many requests. Please try again later.';
      break;
    case 'REQUEST_DENIED':
      errorMessage = 'Map request was denied. Please check your API key.';
      break;
    case 'INVALID_REQUEST':
      errorMessage = 'Invalid map request.';
      break;
    default:
      if (error.message) {
        errorMessage = error.message;
      }
  }
  
  return errorMessage;
};

const retryMapOperation = async (
  operation: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Define specific place types we care about
const IMPORTANT_PLACES: POIWeights = {
  // Shopping
  'grocery_or_supermarket': 5,    // Kroger, Walmart, etc.
  'supermarket': 5,               // Additional tag for supermarkets
  'shopping_mall': 5,              // Major shopping centers
  'convenience_store': 2,          // Lower weight for convenience stores
  
  // Restaurants
  'restaurant': 3,                 // Regular restaurants
  'cafe': 2,                       // Cafes
  'meal_takeaway': 2,              // Take-out places
  //schools
  // Schools
  'primary_school': 8,             // Elementary schools
  'secondary_school': 8,           // Middle/High schools
  'school': 8,                     // General schools
  
  // Parks
  'park': 1,                       // Public parks
  'playground': 2,                 // Playgrounds
  
  // Transport
  'transit_station': 5,            // Major transit stations
  'bus_station': 3,                // Bus stops
  'train_station': 5,              // Train stations
};


// Type definitions
interface PoiCategories {
  shopping: number;
  restaurant: number;
  school: number;
  park: number;
  transport: number;
}

interface PropertyDetails {
  address: string;
  coordinates: GeoLocation;  // Updated to use GeoLocation
  nearbyPOIs: number;
  searchRadius: number;
}

interface SentimentDetails {
  averageRating: string;
  totalReviews: number;
  communityEngagement: 'High' | 'Medium' | 'Low';
  trend?: 'improving' | 'stable' | 'declining';
  positiveReviews?: number;
  neutralReviews?: number;
  negativeReviews?: number;
  highlights?: string[];
}



const getDefaultFloodData = (): FloodZoneData => ({
    score: 0,
    riskLevel: 'High',
    details: {
      zoneType: 'Unknown',
      description: 'Unable to determine flood zone',
      annualChance: 'Unknown'
    }
  });


interface SentimentData {
  score: number;
  details: SentimentDetails;
}

// Update your results interface
interface AnalysisResults {
  poi: {
    score: number;
    details: PoiCategories;
  };
  heatMap?: {
    score: number;
    details: HeatMapDetails;
  };
  crime: CrimeData;
  sentiment: SentimentData;
  propertyDetails: PropertyDetails;
  
}

// Component props interfaces
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SliderProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
  label: string;
}

interface MapControlsProps {
  searchRadius: number;
  onRadiusChange: (value: number) => void;
  onTogglePOIMarkers: (value: boolean) => void;
  showPOIMarkers: boolean;
  mapType: google.maps.MapTypeId | string;
  onMapTypeChange: (value: string) => void;
  onResetView: () => void;
}

// Custom components with TypeScript support
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

const getMarketDescription = (stateCode: string, marketType: string): string => {
  switch (marketType) {
    case 'Buyer':
      return `Favorable buyer's market in ${stateCode}. High negotiation power for Buyers.`;
    case 'Seller':
      return `Strong seller's market in ${stateCode}. Property values trending higher than average.`;
    default:
      return `Balanced market conditions in ${stateCode}. Normal negotiation power for both parties.`;
  }
};

const Button: React.FC<ButtonProps> = ({ onClick, children, disabled, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-white font-medium ${
      disabled 
        ? 'bg-gray-400 cursor-not-allowed' 
        : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
    } ${className}`}
    disabled={disabled}
  >
    {children}
  </button>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

const Slider: React.FC<SliderProps> = ({ value, onChange, min, max, step, label }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <label className="text-sm font-medium">{label}</label>
      <span className="text-sm text-gray-600">{value}m</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

const MapControls: React.FC<MapControlsProps> = ({ 
  searchRadius,
  onRadiusChange,
  onTogglePOIMarkers,
  showPOIMarkers,
  mapType,
  onMapTypeChange,
  onResetView
}) => (
  <Card>
    <h3 className="font-semibold">Map Controls</h3>
    
    <Slider
      value={searchRadius}
      onChange={(e) => onRadiusChange(Number(e.target.value))}
      min={1000}
      max={5000}
      step={100}
      label="Search Radius"
    />
    
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Map Type:</label>
      <Select 
        value={mapType} 
        onChange={(e) => onMapTypeChange(e.target.value)}
        className="flex-1"
      >
        <option value="roadmap">Roadmap</option>
        <option value="satellite">Satellite</option>
        <option value="hybrid">Hybrid</option>
        <option value="terrain">Terrain</option>
      </Select>
    </div>
    
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showPOIMarkers}
          onChange={(e) => onTogglePOIMarkers(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm font-medium">Show POI Markers</span>
      </label>
      
      <Button onClick={onResetView} className="px-3 py-1 text-sm">
        Reset View
      </Button>
    </div>
  </Card>
);




const CategoryIcon: React.FC<{ category: keyof PoiCategories }> = ({ category }) => {
  const icons: Record<keyof PoiCategories, string> = {
    shopping: '🏪',
    restaurant: '🍽️',
    school: '🏫',
    park: '🌳',
    transport: '🚉'
  };
  
  return <span className="text-lg">{icons[category]}</span>;
};
const PropertyAssessmentTool: React.FC = () => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string>('');
  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchCircle, setSearchCircle] = useState<google.maps.Circle | null>(null);
  const [poiMarkers, setPoiMarkers] = useState<google.maps.Marker[]>([]);
  const [showPOIMarkers, setShowPOIMarkers] = useState<boolean>(true);
  const [mapType, setMapType] = useState<string>('roadmap'); // Change from google.maps.MapTypeId to string

  const [searchRadius, setSearchRadius] = useState<number>(1500);
  const mapRef = useRef<HTMLDivElement>(null);

  const GOOGLE_API_KEY = 'AIzaSyBf5WWjQksCtxIziKvs7kFq4qjPCf6SoZQ';

  const [floodZoneOverlay, setFloodZoneOverlay] = useState<google.maps.Polygon | null>(null);
  const [floodData, setFloodData] = useState<FloodZoneData | null>(null);

  // Add this function to fetch and analyze flood data

  const createFloodZonePolygon = (center: GeoLocation): google.maps.LatLngLiteral[] => {
    const points: google.maps.LatLngLiteral[] = [];
    const radius = 0.01; // Roughly 1km
    const sides = 8;

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * 2 * Math.PI;
      points.push({
        lat: center.lat + radius * Math.cos(angle),
        lng: center.lng + radius * Math.sin(angle)
      });
    }
    return points;
  };


  const getSafetyColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 60) return '#84cc16'; // lime-500
    if (score >= 40) return '#eab308'; // yellow-500
    if (score >= 20) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };
  
  const getCrimeRateLevel = (rate: number): string => {
    if (rate < 2000) return 'Very Low';
    if (rate < 3000) return 'Low';
    if (rate < 4000) return 'Moderate';
    if (rate < 5000) return 'High';
    return 'Very High';
  };
  
  const getViolentCrimeLevel = (count: number): string => {
    if (count < 50) return 'Very Low';
    if (count < 100) return 'Low';
    if (count < 200) return 'Moderate';
    if (count < 300) return 'High';
    return 'Very High';
  };
  
  const getViolentCrimeColor = (count: number): string => {
    if (count < 50) return 'text-green-600';
    if (count < 100) return 'text-lime-600';
    if (count < 200) return 'text-yellow-600';
    if (count < 300) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getSafetyAnalysis = (safetyScore: number, crimeRate: number): string => {
    if (safetyScore >= 80) {
      return `This area demonstrates exceptional safety standards with a remarkably low crime rate of ${crimeRate} per 100,000 residents. The community benefits from effective law enforcement and strong neighborhood safety programs.`;
    }
    if (safetyScore >= 60) {
      return `The area maintains good safety levels with a moderate crime rate of ${crimeRate} per 100,000 residents. While generally safe, standard precautions are recommended.`;
    }
    if (safetyScore >= 40) {
      return `Safety in this area is moderate with a crime rate of ${crimeRate} per 100,000 residents. Additional security measures and awareness are recommended.`;
    }
    return `The area shows elevated crime levels with a rate of ${crimeRate} per 100,000 residents. Comprehensive security measures and increased caution are strongly advised.`;
  };
  
  const getPoliceResponse = (safetyScore: number): string => {
    if (safetyScore >= 80) return 'Excellent';
    if (safetyScore >= 60) return 'Good';
    if (safetyScore >= 40) return 'Average';
    return 'Below Average';
  };
  
  const getCommunityRating = (safetyScore: number): string => {
    if (safetyScore >= 80) return 'Very Safe';
    if (safetyScore >= 60) return 'Safe';
    if (safetyScore >= 40) return 'Moderate';
    return 'Caution Advised';
  };

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      const googleMapsScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (googleMapsScript) {
        document.head.removeChild(googleMapsScript);
      }
  
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleLoaded(true);
        if (mapRef.current) {
          initMap();
        }
      };
  
      document.head.appendChild(script);
    };
  
    loadGoogleMaps();
  
    return () => {
      const script = document.querySelector('script[src*="maps.googleapis.com"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (map && window.google) {
      map.setMapTypeId(mapType as google.maps.MapTypeId);
    }
  }, [mapType, map]);
  
  // Update the MapControls props interface
  interface MapControlsProps {
    searchRadius: number;
    onRadiusChange: (value: number) => void;
    onTogglePOIMarkers: (value: boolean) => void;
    showPOIMarkers: boolean;
    mapType: string; // Change from google.maps.MapTypeId to string
    onMapTypeChange: (value: string) => void;
    onResetView: () => void;
  }

  useEffect(() => {
    if (searchCircle) {
      searchCircle.setRadius(searchRadius);
    }
  }, [searchRadius, searchCircle]);

  useEffect(() => {
    poiMarkers.forEach(marker => {
      marker.setVisible(showPOIMarkers);
    });
  }, [showPOIMarkers, poiMarkers]);

  // Continue with the rest of your component implementation...
  // I'll continue with the remaining functions in the next part.
  interface Location {
    lat: number;
    lng: number;
  }
  
  const getStateRanking = (stateCode: string): number => {
    const states = Object.entries(STATE_HEAT_DATA)
      .sort(([, a], [, b]) => b.average - a.average)
      .map(([code]) => code);
    return states.indexOf(stateCode) + 1;
  };

  interface PlaceGeometry {
    location: google.maps.LatLng;
    viewport?: google.maps.LatLngBounds;
  }
  
  interface PlaceResult extends google.maps.places.PlaceResult {
    geometry: PlaceGeometry;
    types: string[];
    vicinity?: string;
  }
  
  interface PlaceReview {
    rating: number;
    text: string;
    time: number;
  }
  
  interface SentimentAnalysis {
    score: number;
    reviews: {
      positive: number;
      neutral: number;
      negative: number;
    };
    details: {
      averageRating: string;
      totalReviews: number;
      communityEngagement: string;
      recentTrend: 'improving' | 'stable' | 'declining';
      priceLevel: number;
      topKeywords: string[];
    };
  }
  
  
    const clearPOIMarkers = (): void => {
      poiMarkers.forEach(marker => marker.setMap(null));
      setPoiMarkers([]);
    };

    const getPriceTrend = (average: number): number => {
      // Calculate price trend based on market average
      if (average >= 60) return 8.5;
      if (average <= 40) return 2.5;
      return 5.5;
    };
    
    const getAverageDays = (average: number): number => {
      // Calculate average days on market based on market average
      if (average >= 60) return 25;
      if (average <= 40) return 75;
      return 45;
    };
    
    const getInventoryLevel = (average: number): string => {
      if (average >= 60) return 'Low';
      if (average <= 40) return 'High';
      return 'Moderate';
    };
  
    const createPOIMarker = (place: google.maps.places.PlaceResult, category: keyof PoiCategories): google.maps.Marker => {
      if (!map || !place.geometry?.location) {
        throw new Error('Invalid place data or map not initialized');
      }
    
      
      const marker = new google.maps.Marker({
        position: place.geometry.location,
        map: showPOIMarkers ? map : null,
        title: place.name || '',
        icon: {
          url: `https://maps.google.com/mapfiles/ms/icons/${getPOIColor(category)}-dot.png`,
          scaledSize: new google.maps.Size(32, 32)
        }
      });
    
      return marker;
    };
    
  
    const getPOIColor = (category: keyof PoiCategories): string => {
      const colors: Record<keyof PoiCategories, string> = {
        shopping: 'yellow',
        restaurant: 'red',
        school: 'blue',
        park: 'green',
        transport: 'purple'
      };
      return colors[category];
    };
  
    const initMap = (): void => {
      if (!mapRef.current) return;
    
      const defaultLocation = { lat: 32.9612, lng: -96.9902 }; // Centered on Coppell, TX
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: defaultLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        },
        scaleControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });
    
      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const clickedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          updateMarkerAndCircle(clickedLocation);
          void analyzeLocation(clickedLocation);
        }
      });
    
      setMap(mapInstance);
    };
  
    const updateMarkerAndCircle = (location: GeoLocation): void => {
      if (!map) return;
  
      // Update or create marker
      if (marker) {
        marker.setPosition(location);
      } else {
        const newMarker = new google.maps.Marker({
          position: location,
          map: map,
          draggable: true
        });
        
        newMarker.addListener('dragend', () => {
          const newLocation = {
            lat: newMarker.getPosition()?.lat() || 0,
            lng: newMarker.getPosition()?.lng() || 0
          };
          updateMarkerAndCircle(newLocation);
          void analyzeLocation(newLocation);
        });
        
        setMarker(newMarker);
      }
  
      // Update or create search radius circle
      if (searchCircle) {
        searchCircle.setCenter(location);
      } else {
        const newCircle = new google.maps.Circle({
          map: map,
          center: location,
          radius: searchRadius,
          fillColor: '#4299e1',
          fillOpacity: 0.15,
          strokeColor: '#4299e1',
          strokeWeight: 2
        });
        setSearchCircle(newCircle);
      }
  
      map.panTo(location);
      map.setZoom(14);
    };

    const determineMarketType = (average: number): 'Buyer' | 'Balanced' | 'Seller' => {
      if (average <= 40) return 'Buyer';
      if (average >= 60) return 'Seller';
      return 'Balanced';
    };
    
    const getHeatMapColor = (average: number): string => {
      // Higher values are more blue (seller's market)
      // Lower values are more red (buyer's market)
      const normalizedValue = (average - 32.8) / (81.1 - 32.8); // Normalize based on min/max from data
      const red = Math.round(255 * (1 - normalizedValue));
      const blue = Math.round(255 * normalizedValue);
      return `rgb(${red}, ${Math.min(red, blue) / 2}, ${blue})`;
    };
  
    const analyzeLocation = async (location: GeoLocation): Promise<void> => {
      
      const service = new google.maps.places.PlacesService(map as google.maps.Map);
      const geocoder = new google.maps.Geocoder();
      const geocodeResult = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      //const stateCode = getStateFromAddress(geocodeResult.formatted_address);
      //const stateData = STATE_HEAT_DATA[stateCode];
      const stateCode = getStateFromAddress(geocodeResult.formatted_address);
      let heatMapAnalysis: HeatMapAnalysis;

      if (stateCode && STATE_HEAT_DATA[stateCode]) {
        const stateData = STATE_HEAT_DATA[stateCode];
        const marketType = determineMarketType(stateData.average);

        heatMapAnalysis = {
          score: stateData.finalScore,
          details: {
            stateCode: stateCode,
            average: stateData.average,
            score: stateData.finalScore,
            marketType: marketType as 'Buyer' | 'Balanced' | 'Seller',
            trend: stateData.average <= 40 ? 'Falling' : stateData.average >= 60 ? 'Rising' : 'Stable'
          }
        };
      } else {
        console.error('State not found in address:', geocodeResult.formatted_address);
        heatMapAnalysis = {
          score: 0,
          details: {
            stateCode: 'N/A',
            average: 0,
            score: 0,
            marketType: 'Balanced',
            trend: 'Stable'
          }
        };
      }
      


      const analyzeSentiment = async (
        service: google.maps.places.PlacesService,
        location: GeoLocation,
        radius: number
      ): Promise<SentimentAnalysis> => {
        try {
          // Get nearby places with their reviews
          const places = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
            service.nearbySearch({
              location,
              radius,
              type: ['establishment']
            }, (results, status) => {
              if (status === 'OK' && results) resolve(results);
              else if (status === 'ZERO_RESULTS') resolve([]);
              else reject(new Error(`Places search failed: ${status}`));
            });
          });
      
          let totalRating = 0;
          let totalReviews = 0;
          let recentReviews: PlaceReview[] = [];
          let priceSum = 0;
          let priceCount = 0;
          const keywords = new Map<string, number>();
      
          // Analyze each place
          for (const place of places) {
            if (!place.place_id) continue;
      
            // Get detailed place information including reviews
            const details = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
              service.getDetails({
                placeId: place.place_id,
                fields: ['rating', 'review', 'user_ratings_total', 'price_level']
              }, (result, status) => {
                if (status === 'OK' && result) resolve(result);
                else reject(new Error(`Place details failed: ${status}`));
              });
            });
      
            if (details.rating) {
              totalRating += details.rating;
              totalReviews += details.user_ratings_total || 0;
            }
      
            if (details.price_level !== undefined) {
              priceSum += details.price_level;
              priceCount++;
            }
      
            // Process reviews
            if (details.reviews) {
              recentReviews.push(...details.reviews.map(review => ({
                rating: review.rating,
                text: review.text,
                time: review.time
              })));


      
              // Extract keywords from reviews
              details.reviews.forEach(review => {
                const words = review.text.toLowerCase()
                  .split(/\W+/)
                  .filter(word => word.length > 3)
                  .filter(word => !['this', 'that', 'with', 'from', 'they', 'have'].includes(word));
      
                words.forEach(word => {
                  keywords.set(word, (keywords.get(word) || 0) + 1);
                });
              });
            }
          }
      
          // Calculate averages and scores
          const averageRating = totalReviews > 0 ? totalRating / places.length : 0;
          const averagePrice = priceCount > 0 ? priceSum / priceCount : 0;
      
          // Analyze review sentiment
          const sentimentCounts = {
            positive: recentReviews.filter(r => r.rating >= 4).length,
            neutral: recentReviews.filter(r => r.rating === 3).length,
            negative: recentReviews.filter(r => r.rating <= 2).length
          };
      
          // Calculate recent trend
          const recentTrend = calculateReviewTrend(recentReviews);
      
          // Get top keywords
          const topKeywords = [...keywords.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
      
          // Calculate final sentiment score (out of 200)
          const sentimentScore = calculateSentimentScore({
            averageRating,
            totalReviews,
            recentTrend,
            sentimentCounts,
            averagePrice
          });
      
          return {
            score: sentimentScore,
            reviews: sentimentCounts,
            details: {
              averageRating: averageRating.toFixed(1),
              totalReviews,
              communityEngagement: getCommunityEngagement(totalReviews),
              recentTrend,
              priceLevel: Math.round(averagePrice),
              topKeywords
            }
          };
        } catch (error) {
          console.error('Sentiment analysis error:', error);
          return getDefaultSentimentAnalysis();
        }
      };
      
      const calculateReviewTrend = (reviews: PlaceReview[]): 'improving' | 'stable' | 'declining' => {
        if (reviews.length < 2) return 'stable';
      
        const sortedReviews = [...reviews].sort((a, b) => b.time - a.time);
        const recentReviews = sortedReviews.slice(0, Math.ceil(sortedReviews.length / 2));
        const olderReviews = sortedReviews.slice(Math.ceil(sortedReviews.length / 2));
      
        const recentAvg = recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length;
        const olderAvg = olderReviews.reduce((sum, r) => sum + r.rating, 0) / olderReviews.length;
      
        if (recentAvg > olderAvg + 0.3) return 'improving';
        if (recentAvg < olderAvg - 0.3) return 'declining';
        return 'stable';
      };
      

      const calculateSentimentScore = ({
        averageRating,
        totalReviews,
        recentTrend,
        sentimentCounts,
        averagePrice
      }: {
        averageRating: number;
        totalReviews: number;
        recentTrend: string;
        sentimentCounts: { positive: number; neutral: number; negative: number };
        averagePrice: number;
      }): number => {
        let score = 0;
      
        // Rating score (max 100)
        score += (averageRating / 5) * 100;
      
        // Review volume score (max 30)
        score += Math.min(30, totalReviews / 10);
      
        // Trend bonus (max 20)
        if (recentTrend === 'improving') score += 20;
        else if (recentTrend === 'stable') score += 10;
      
        // Sentiment ratio score (max 30)
        const totalSentiments = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
        if (totalSentiments > 0) {
          const positiveRatio = sentimentCounts.positive / totalSentiments;
          score += positiveRatio * 30;
        }
      
        // Price level adjustment (max 20)
        const priceScore = 20 - (averagePrice * 5); // Lower prices get higher scores
        score += Math.max(0, priceScore);
      
        return Math.round(Math.min(200, score));
      };
      
      const getCommunityEngagement = (totalReviews: number): string => {
        if (totalReviews > 500) return 'Very High';
        if (totalReviews > 200) return 'High';
        if (totalReviews > 100) return 'Medium';
        if (totalReviews > 50) return 'Low';
        return 'Very Low';
      };
      
      const getDefaultSentimentAnalysis = (): SentimentAnalysis => ({
        score: 0,
        reviews: { positive: 0, neutral: 0, negative: 0 },
        details: {
          averageRating: '0.0',
          totalReviews: 0,
          communityEngagement: 'Low',
          recentTrend: 'stable',
          priceLevel: 0,
          topKeywords: []
        }
      });
      if (!map) return;
    
      setLoading(true);
      setError('');
      clearPOIMarkers();
    
      try {

        const floodZoneData = await fetchFloodZoneData(location);
      setFloodData(floodZoneData);

      // Update flood zone visualization
      if (floodZoneOverlay) {
        floodZoneOverlay.setMap(null);
      }

      if (floodZoneData.geometry && map) {
        const newOverlay = new google.maps.Polygon({
          paths: floodZoneData.geometry,
          strokeColor: getFloodZoneColor(floodZoneData.score),
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: getFloodZoneColor(floodZoneData.score),
          fillOpacity: 0.35,
          map: map
        });
        setFloodZoneOverlay(newOverlay);
      }

      const updateFloodZoneVisualization = (floodData: FloodZoneData, map: google.maps.Map) => {
        if (floodZoneOverlay) {
          floodZoneOverlay.setMap(null);
        }
      
        if (floodData.geometry && floodData.geometry.length > 0) {
          const newOverlay = new google.maps.Polygon({
            paths: floodData.geometry,
            strokeColor: getFloodZoneColor(floodData.score),
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: getFloodZoneColor(floodData.score),
            fillOpacity: 0.35,
            map: map
          });
      
          // Add hover effect
          newOverlay.addListener('mouseover', () => {
            newOverlay.setOptions({
              fillOpacity: 0.6,

              strokeWeight: 3
            });
          });
      
          newOverlay.addListener('mouseout', () => {
            newOverlay.setOptions({
              fillOpacity: 0.35,
              strokeWeight: 2
            });
          });
      
          setFloodZoneOverlay(newOverlay);
        }
      };
        
        const [crimeAnalysis, geocodeResult] = await Promise.all([
          fetchCrimeData(location,FBI_API_KEY),
          new Promise<google.maps.GeocoderResult>((resolve, reject) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocoding failed'));
              }
            });
          })
        ]);
    
        // Get place details and address first
        
    
        const poiCategories: PoiCategories = {
          shopping: 0,
          restaurant: 0,
          school: 0,
          park: 0,
          transport: 0
        };
    
        const poiScores: PoiCategories = {
          shopping: 0,
          restaurant: 0,
          school: 0,
          park: 0,
          transport: 0
        };
    
        const newMarkers: google.maps.Marker[] = [];
        const processedPlaces = new Set<string>();
    
        // Search for each important place type
        for (const [placeType, weight] of Object.entries(IMPORTANT_PLACES)) {
          try {
            const places = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
              service.nearbySearch({
                location,
                radius: searchRadius,
                type: placeType as google.maps.places.PlaceType,
              }, (results, status) => {
                if (status === 'OK' && results) resolve(results);
                else if (status === 'ZERO_RESULTS') resolve([]);
                else reject(new Error(`Places search failed: ${status}`));
              });
            });
    
            places.forEach(place => {
              if (!place.place_id || processedPlaces.has(place.place_id)) return;
              processedPlaces.add(place.place_id);
    
              let category: keyof PoiCategories | null = null;
              let score = weight;
    
              if (placeType.includes('supermarket') || placeType.includes('shopping')) {
                category = 'shopping';
                if (place.name?.match(/walmart|kroger|target|tom thumb|costco|sam's club|whole foods/i)) {
                  score *= 2;
                }
              } else if (placeType.includes('restaurant') || placeType.includes('cafe')) {
                category = 'restaurant';
              } else if (placeType.includes('school')) {
                category = 'school';
                if (place.name?.match(/elementary|middle|high school/i)) {
                  score *= 1.5;
                }
              } else if (placeType.includes('park') || placeType.includes('playground')) {
                category = 'park';
                if (place.name?.match(/community|regional|municipal/i)) {
                  score *= 1.5;
                }
              } else if (placeType.includes('station')) {
                category = 'transport';
              }
    
              if (category) {
                poiCategories[category]++;
                poiScores[category] += score;
                newMarkers.push(createPOIMarker(place, category));
              }
            });
    
            await new Promise(resolve => setTimeout(resolve, 200));
    
          } catch (error) {
            console.warn(`Error searching for ${placeType}:`, error);
          }
        }
    
        setPoiMarkers(newMarkers);
    
        const MAX_CATEGORY_SCORES: POIMaxScores = {
          shopping: 50,      // Major focus on retail availability
          restaurant: 38,    // Important but not critical
          school: 10,        // High importance for families
          park: 25,          // Good for community value
          transport: 75      // Helpful but not crucial
        };
        // Calculate final category scores
        const finalScores = {
          shopping: Math.min(200, (poiScores.shopping / MAX_CATEGORY_SCORES.shopping) * 200),
          restaurant: Math.min(200, (poiScores.restaurant / MAX_CATEGORY_SCORES.restaurant) * 200),
          school: Math.min(200, (poiScores.school / MAX_CATEGORY_SCORES.school) * 200),
          park: Math.min(200, (poiScores.park / MAX_CATEGORY_SCORES.park) * 200),
          transport: Math.min(200, (poiScores.transport / MAX_CATEGORY_SCORES.transport) * 200)
        };
    
        // Calculate overall POI score
        const poiScore = Math.round(Math.min(200, 
          Object.values(finalScores).reduce((a, b) => a + b, 0) / 5
        ));
    
        // Mock sentiment data (replace with real data in production)
        const min = 100;
        const max = 200;
        const sentimentScore = Math.floor(Math.random() * (max - min + 1)) + min;
        let mockRating = (Math.random() * (5 - 2.9 + 1)) + 2;
        mockRating = Math.round(mockRating * 10) / 10;
        const totalRatings = Math.floor(Math.random() * (max - min + 1)) + min;;
    
        // Set final results
        setResults({
          poi: {
            score: poiScore,
            details: poiCategories
          },
          sentiment: {
            score: sentimentScore,
            details: {
              averageRating: mockRating.toString(),
              totalReviews: totalRatings,
              communityEngagement: totalRatings > 100 ? 'High' : totalRatings > 50 ? 'Medium' : 'Low'
            }
          },
          heatMap: heatMapAnalysis,  // Add heat map data
          crime: crimeAnalysis,
          propertyDetails: {
            address: geocodeResult.formatted_address,
            coordinates: location,
            nearbyPOIs: newMarkers.length,
            searchRadius: searchRadius
          }
        });
    
      } catch (error) {
        console.error('Analysis error:', error);
        setError('Error analyzing location. Please try a different location or adjust the search radius.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleSearchSubmit = async (): Promise<void> => {
      if (!searchInput.trim()) {
        setError('Please enter an address or coordinates');
        return;
      }
  
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
          geocoder.geocode({ address: searchInput }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed'));
            }
          });
        });
  
        const location: GeoLocation = {  // Updated to use GeoLocation
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        };
  
        updateMarkerAndCircle(location);
        void analyzeLocation(location);
      } catch (error) {
        setError('Could not find location. Please check the address.');
        console.error('Search error:', error);
      }
    };
  
    // ... continuing from previous parts

  const calculateTotalScore = (results: AnalysisResults): number => {
    return results.poi.score + results.sentiment.score + results.heatMap.score + results.crime.score;;
  };

  const renderAssessmentSummary = (score: number): JSX.Element => {
    if (score >= 750) {
      return (
        <div className="text-green-600">
          Excellent location! High potential for development with strong community features.
        </div>
      );
    } else if (score >= 500) {
      return (
        <div className="text-blue-600">
          Good location with balanced amenities and growth potential.
        </div>
      );
    } else if (score >= 250) {
      return (
        <div className="text-yellow-600">
          Moderate potential. Consider future development plans in the area.
        </div>
      );
    } else {
      return (
        <div className="text-red-600">
          Limited amenities. May require significant infrastructure development.
        </div>
      );
    }
  };

  if (!googleLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading Google Maps...</div>
      </div>
    );
  }

  return (
   <>
   {/* Logo Header */}
   <div className="flex justify-center py-6 bg-white">
      <img 
        src="/logo2.png"  // Make sure the PNG is in your public folder with this name
        alt="Rannel"
        className="h-22 w-80" // Adjust height as needed
      />
      
    </div>
    
  
    <div className="max-w-6xl mx-auto p-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Map and controls */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-2xl font-bold mb-4">Select Location</h2>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter address or coordinates (lat,lng)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Button
                  onClick={() => void handleSearchSubmit()}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Search'}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </div>
            
          </Card>
          
          <MapControls
            searchRadius={searchRadius}
            onRadiusChange={setSearchRadius}
            onTogglePOIMarkers={setShowPOIMarkers}
            showPOIMarkers={showPOIMarkers}
            mapType={mapType}
            onMapTypeChange={setMapType}
            onResetView={() => {
              if (marker && map) {
                const position = marker.getPosition();
                if (position) {
                  map.setCenter(position);
                  map.setZoom(14);
                }
              }
            }}
          />
          
          <div 
            ref={mapRef} 
            className="w-full h-[700px] rounded-lg shadow-lg border border-gray-200"
          ></div>
          
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">Map Legend:</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                shopping: 'yellow',
                restaurant: 'red',
                school: 'blue',
                park: 'green',
                transport: 'purple'
              }).map(([category, color]) => (
                <div key={category} className="flex items-center gap-2">
                  <span 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: color }}
                  ></span>
                  <span className="capitalize">{category}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Add Score Circle right after map legend */}
            {results && (
              <Card>
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div className="relative w-48 h-48">
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{ 
                        background: `conic-gradient(
                          ${calculateTotalScore(results) >= 600 ? '#22c55e' : 
                            calculateTotalScore(results) >= 400 ? '#eab308' : '#ef4444'} 270deg,
                          #e5e7eb 270deg
                        )`
                      }}
                    />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <span 
                        className="text-5xl font-bold"
                        style={{ 
                          color: calculateTotalScore(results) >= 600 ? '#22c55e' : 
                                calculateTotalScore(results) >= 400 ? '#eab308' : '#ef4444'
                        }}
                      >
                        {calculateTotalScore(results).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div 
                    className="text-2xl font-bold mt-4 px-4 py-2 rounded-lg"
                    style={{ 
                      color: calculateTotalScore(results) >= 600 ? '#22c55e' : 
                            calculateTotalScore(results) >= 400 ? '#eab308' : '#ef4444',
                      backgroundColor: calculateTotalScore(results) >= 600 ? '#22c55e15' : 
                                    calculateTotalScore(results) >= 400 ? '#eab30815' : '#ef444415'
                    }}
                  >
                    {calculateTotalScore(results) >= 600 ? 'Valuable area' : 
                    calculateTotalScore(results) >= 400 ? 'Developing area' : 'Undeveloped area'}
                  </div>
                </div>
              </Card>
            )}



        </div>
        {/* Add Score Circle right after map legend */}


        {/* Right column: Results */}
        <div className="space-y-4">
          {results && (
            <>
              <Card>
                <h3 className="text-xl font-bold mb-4">Location Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span className="text-right">{results.propertyDetails.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Coordinates:</span>
                    <span>
                      {results.propertyDetails.coordinates.lat.toFixed(6)}, 
                      {results.propertyDetails.coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Search Radius:</span>
                    <span>{results.propertyDetails.searchRadius}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total POIs Found:</span>
                    <span>{results.propertyDetails.nearbyPOIs}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Points of Interest</h3>
                  <div className="text-2xl font-bold">{results.poi.score}/200</div>
                </div>
                <div className="space-y-3">
                  {(Object.entries(results.poi.details) as [keyof PoiCategories, number][]).map(([category, count]) => (
                    <div key={category} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={category} />
                          <span className="capitalize">
                            {category}: {count}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round((count * (
                            category === 'school' ? 20 : 
                            category === 'park' ? 12 : 10
                          )))}
                           -Data-Points
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            category === 'shopping' ? 'bg-yellow-500' :
                            category === 'restaurant' ? 'bg-red-500' :
                            category === 'school' ? 'bg-blue-500' :
                            category === 'park' ? 'bg-green-500' :
                            'bg-purple-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (count * 20))}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {results.heatMap && (
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Market Heat Map</h3>
                    <div className="text-2xl font-bold">{results.heatMap.score.toFixed(2)}/200</div>
                  </div>
                
                  <div className="space-y-4">
                    {/* State Score */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>State Market Index</span>
                        <span className="font-medium" style={{ 
                          color: getHeatMapColor(results.heatMap.details.average) 
                        }}>
                          {results.heatMap.details.stateCode} - {results.heatMap.details.average.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((results.heatMap.details.average - 32.8) / (81.1 - 32.8)) * 100}%`,
                            backgroundColor: getHeatMapColor(results.heatMap.details.average)
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Buyer's Market (&lt;40)</span>
                        <span>Balanced (40-60)</span>
                        <span>Seller's Market (&gt;60)</span>
                      </div>
                    </div>
                
                    {/* Market Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Market Type</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          results.heatMap.details.marketType === 'Seller' 
                            ? 'bg-blue-100 text-blue-800'
                            : results.heatMap.details.marketType === 'Buyer'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {results.heatMap.details.marketType} Market
                        </span>
                      </div>
                
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Demand Level</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            results.heatMap.details.average >= 60 ? 'bg-blue-500' :
                            results.heatMap.details.average <= 40 ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm font-medium">
                            {results.heatMap.details.average >= 60 ? 'High Demand' :
                             results.heatMap.details.average <= 40 ? 'Low Demand' :
                             'Moderate Demand'}
                          </span>
                        </div>
                      </div>
                    </div>
                
                    {/* Market Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">State Ranking</div>
                        <div className="text-5xl font-bold">
                          #{getStateRanking(results.heatMap.details.stateCode)}/50
                        </div>
                        <div className="text-xs text-gray-500">
                          Among all US states
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Price Trend</div>
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="text-6xl font-bold">
                            {getPriceTrend(results.heatMap.details.average)}%
                          </span>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-500">Annual appreciation</div>
                      </div>
                    </div>
                
                    {/* Market Analysis */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="font-medium">Market Analysis</div>
                      <div className="text-sm text-gray-600">
                        {results.heatMap.details.marketType === 'Seller' 
                          ? `Strong seller's market in ${results.heatMap.details.stateCode}. Property values are trending significantly higher than average, with sellers having strong negotiating power. Current market conditions favor quick sales and competitive pricing.`
                          : results.heatMap.details.marketType === 'Buyer'
                          ? `Favorable buyer's market in ${results.heatMap.details.stateCode}. Current conditions present good opportunities for property investment, with buyers having increased negotiating power. Properties may stay on market longer, allowing for more thorough evaluation.`
                          : `Balanced market conditions in ${results.heatMap.details.stateCode}. Market shows healthy equilibrium between buyers and sellers, with stable pricing and reasonable negotiation opportunities for both parties.`}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Avg. Days on Market: </span>
                          {getAverageDays(results.heatMap.details.average)} days
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Inventory Level: </span>
                          {getInventoryLevel(results.heatMap.details.average)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </Card>
              )}
              
              {results && (
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Flood Zone Analysis</h3>
                    <div className="text-2xl font-bold">{floodData.score}/200</div>
                  </div>

                  <div className="space-y-4">
                    {/* Risk Level Indicator */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Flood Risk Level</span>
                        <span className="font-medium" style={{ 
                          color: getFloodZoneColor(floodData.score) 
                        }}>
                          {floodData.riskLevel} Risk
                        </span>
                      </div>
                      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(floodData.score / 200) * 100}%`,
                            backgroundColor: getFloodZoneColor(floodData.score)
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>High Risk (&lt;50)</span>
                        <span>Moderate (50-100)</span>
                        <span>Low Risk (&gt;150)</span>
                      </div>
                    </div>

                    {/* Flood Zone Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Zone Type</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          floodData.details.zoneType === 'VE' || floodData.details.zoneType === 'A' 
                            ? 'bg-red-100 text-red-800'
                            : floodData.details.zoneType === 'AE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Zone {floodData.details.zoneType}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Annual Chance</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            floodData.details.annualChance.includes('1%') ? 'bg-red-500' :
                            floodData.details.annualChance.includes('0.2%') ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="text-sm font-medium">
                            {floodData.details.annualChance}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flood Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Base Flood Elevation</div>
                        <div className="text-5xl font-bold">
                          {floodData.details.baseFloodElevation 
                            ? `${floodData.details.baseFloodElevation}'` 
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Above sea level
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Insurance Required</div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <span className="text-4xl font-bold">
                            {floodData.score < 160 ? 'Yes' : 'Optional'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Federal requirement</div>
                      </div>
                    </div>

                    {/* Flood Analysis */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="font-medium">Flood Risk Analysis</div>
                      <div className="text-sm text-gray-600">
                        {floodData.score < 50 
                          ? `High-risk flood area in Zone ${floodData.details.zoneType}. This location has significant flood risk with mandatory flood insurance requirements. Consider comprehensive flood protection measures and emergency planning.`
                          : floodData.score < 100
                          ? `Moderate flood risk area in Zone ${floodData.details.zoneType}. While not in the highest risk category, flood insurance is recommended. Regular monitoring of local flood conditions advised.`
                          : `Low to minimal flood risk area in Zone ${floodData.details.zoneType}. This location has reduced flood risk compared to other areas. Standard precautions and optional flood insurance may still be prudent.`}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Community Rating: </span>
                          {floodData.score > 150 ? 'Excellent' : 
                          floodData.score > 100 ? 'Good' :
                          floodData.score > 50 ? 'Fair' : 'Poor'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Protection Level: </span>
                          {floodData.details.baseFloodElevation ? 'Standard' : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {results && (
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Crime Analysis</h3>
                    <div className="text-2xl font-bold">{results.crime.score}/200</div>
                  </div>

                  <div className="space-y-4">
                    {/* Safety Score */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Safety Score</span>
                        <span className="font-medium" style={{ 
                          color: getSafetyColor(results.crime.safetyScore) 
                        }}>
                          {results.crime.safetyScore}/100
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${results.crime.safetyScore}%`,
                            backgroundColor: getSafetyColor(results.crime.safetyScore)
                          }}
                        />
                      </div>
                    </div>

                    {/* Crime Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Crime Rate</div>
                        <div className="text-xl font-bold">
                          {results.crime.crimeRate.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500 ml-1">per 100k</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCrimeRateLevel(results.crime.crimeRate)}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Violent Crime</div>
                        <div className="text-xl font-bold">
                          {results.crime.violentCrime.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500 ml-1">incidents</span>
                        </div>
                        <div className={`text-sm ${getViolentCrimeColor(results.crime.violentCrime)}`}>
                          {getViolentCrimeLevel(results.crime.violentCrime)}
                        </div>
                      </div>
                    </div>

                    {/* Crime Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="font-medium">Crime Breakdown</div>
                      <div className="space-y-2">
                        {(Object.entries(results.crime.details) as [keyof CrimeDetails, number][]).map(([type, count]) => (
                          <div key={type} className="flex items-center gap-2">
                            <div className="w-full">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span>{count.toLocaleString()} incidents</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ 
                                    width: `${(count / Math.max(...Object.values(results.crime.details))) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Analysis */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="font-medium">Safety Analysis</div>
                      <div className="text-sm text-gray-600">
                        {getSafetyAnalysis(results.crime.safetyScore, results.crime.crimeRate)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Police Response: </span>
                          {getPoliceResponse(results.crime.safetyScore)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Community Rating: </span>
                          {getCommunityRating(results.crime.safetyScore)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Area Sentiment</h3>
                  <div className="text-2xl font-bold">{results.sentiment.score}/200</div>
                </div>
                <div className="space-y-4">
                  {/* Rating Section */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Rating</span>
                        <span className="font-medium">
                          {results.sentiment.details.averageRating} / 5.0
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ 
                            width: `${(parseFloat(results.sentiment.details.averageRating) / 5) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="text-sm text-green-600">Positive</div>
                      <div className="font-medium">{Math.floor(Math.random() * (30 - 20 + 1)) + 20}</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded text-center">
                      <div className="text-sm text-yellow-600">Neutral</div>
                      <div className="font-medium">{Math.floor(Math.random() * (15 - 4 + 1)) + 12}</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="text-sm text-red-600">Negative</div>
                      <div className="font-medium">{Math.floor(Math.random() * (10 - 6 + 1)) + 4}</div>
                    </div>
                  </div>

                  {/* Community Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Total Reviews:</span>
                      <span className="font-medium">
                        {results.sentiment.details.totalReviews}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Community Engagement:</span>
                      <div 
                        className={`px-2 py-1 rounded-full text-sm ${
                          results.sentiment.details.communityEngagement === 'High' 
                            ? 'bg-green-100 text-green-600' 
                            : results.sentiment.details.communityEngagement === 'Medium'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {results.sentiment.details.communityEngagement}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Trend:</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="text-sm">Improving</span>
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Area Highlights */}
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm font-medium text-blue-800 mb-2">Area Highlights</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-white rounded-full text-sm text-blue-600">Family Friendly</span>
                      <span className="px-2 py-1 bg-white rounded-full text-sm text-blue-600">Quiet</span>
                      <span className="px-2 py-1 bg-white rounded-full text-sm text-blue-600">Safe</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <h3 className="text-xl font-bold mb-4">Overall Assessment</h3>
                <div className="relative mb-6">
                  <div className="text-4xl font-bold text-center">
                    {calculateTotalScore(results)}/1000
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(calculateTotalScore(results) / 1000) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-sm text-gray-600">
                    <span>0</span>
                    <span>250</span>
                    <span>500</span>
                    <span>750</span>
                    <span>1000</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Assessment Summary:</h4>
                  <div className="space-y-2 text-sm">
                    {renderAssessmentSummary(calculateTotalScore(results))}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  </>
  );
};
export default PropertyAssessmentTool;


    
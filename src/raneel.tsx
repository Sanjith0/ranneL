import React, { useState, useEffect, useRef } from 'react';
// Add these interfaces for better type checking
interface POIWeights {
  readonly [key: string]: number;
}

interface POIMaxScores {
  readonly [key: string]: number;
}

// Define specific place types we care about
const IMPORTANT_PLACES: POIWeights = {
  // Shopping
  'grocery_or_supermarket': 10,    // Kroger, Walmart, etc.
  'supermarket': 10,               // Additional tag for supermarkets
  'shopping_mall': 5,              // Major shopping centers
  'convenience_store': 2,          // Lower weight for convenience stores
  
  // Restaurants
  'restaurant': 3,                 // Regular restaurants
  'cafe': 2,                       // Cafes
  'meal_takeaway': 2,              // Take-out places
  
  // Schools
  'primary_school': 8,             // Elementary schools
  'secondary_school': 8,           // Middle/High schools
  'school': 8,                     // General schools
  
  // Parks
  'park': 6,                       // Public parks
  'playground': 4,                 // Playgrounds
  
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

interface SentimentDetails {
  averageRating: string;
  totalReviews: number;
  communityEngagement: string;
}

interface PropertyDetails {
  address: string;
  coordinates: { lat: number; lng: number };
  nearbyPOIs: number;
  searchRadius: number;
}

interface AnalysisResults {
  poi: {
    score: number;
    details: PoiCategories;
  };
  sentiment: {
    score: number;
    details: SentimentDetails;
  };
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
  mapType: google.maps.MapTypeId;
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
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setGoogleLoaded(true);
        initMap();
        return;
      }
  
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setGoogleLoaded(true);
        initMap();
      };
  
      document.head.appendChild(script);
  
      return () => {
        // Only remove the script if it exists
        const script = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (script) {
          document.head.removeChild(script);
        }
      };
    };
  
    loadGoogleMaps();
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
  
  interface PlaceResult extends google.maps.places.PlaceResult {
    geometry: google.maps.places.PlaceGeometry;
    types: string[];
    vicinity?: string;
  }
  
  
    const clearPOIMarkers = (): void => {
      poiMarkers.forEach(marker => marker.setMap(null));
      setPoiMarkers([]);
    };
  
    const createPOIMarker = (place: PlaceResult, category: keyof PoiCategories): google.maps.Marker => {
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
  
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <strong>${place.name || ''}</strong><br/>
            Type: ${category}<br/>
            ${place.vicinity || ''}
          </div>
        `
      });
  
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
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
  
      const defaultLocation: Location = { lat: 39.8283, lng: -98.5795 };
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 4,
        center: defaultLocation,
        mapTypeId: mapType,
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
  
      mapInstance.addListener('click', (e: google.maps.MouseEvent) => {
        const clickedLocation = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        updateMarkerAndCircle(clickedLocation);
        void analyzeLocation(clickedLocation);
      });
  
      setMap(mapInstance);
    };
  
    const updateMarkerAndCircle = (location: Location): void => {
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
  
    const analyzeLocation = async (location: Location): Promise<void> => {
      if (!map) return;
    
      setLoading(true);
      setError('');
      clearPOIMarkers();
    
      try {
        const service = new google.maps.places.PlacesService(map);
        const geocoder = new google.maps.Geocoder();
    
        // Get place details and address first
        const geocodeResult = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed'));
            }
          });
        });
    
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
          school: 63,        // High importance for families
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
        const poiScore = Math.min(200, 
          Object.values(finalScores).reduce((a, b) => a + b, 0) / 5
        );
    
        // Mock sentiment data (replace with real data in production)
        const sentimentScore = 150;
        const mockRating = 4.2;
        const totalRatings = 85;
    
        // Set final results
        setResults({
          poi: {
            score: poiScore,
            details: poiCategories
          },
          sentiment: {
            score: sentimentScore,
            details: {
              averageRating: mockRating.toFixed(1),
              totalReviews: totalRatings,
              communityEngagement: totalRatings > 100 ? 'High' : totalRatings > 50 ? 'Medium' : 'Low'
            }
          },
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
  
        const location: Location = {
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
    return results.poi.score + results.sentiment.score;
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
            className="w-full h-[600px] rounded-lg shadow-lg border border-gray-200"
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
        </div>

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
                  <div className="text-2xl font-bold">{results.poi.score}/250</div>
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
                          pts
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Area Sentiment</h3>
                  <div className="text-2xl font-bold">{results.sentiment.score}/200</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Rating</span>
                        <span className="font-medium">
                          {results.sentiment.details.averageRating} / 5.0
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ 
                            width: `${(parseFloat(results.sentiment.details.averageRating) / 5) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reviews:</span>
                    <span className="font-medium">
                      {results.sentiment.details.totalReviews}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Community Engagement:</span>
                    <span className={`font-medium ${
                      results.sentiment.details.communityEngagement === 'High' 
                        ? 'text-green-600' 
                        : results.sentiment.details.communityEngagement === 'Medium'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {results.sentiment.details.communityEngagement}
                    </span>
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
  );
};
export default PropertyAssessmentTool;


    
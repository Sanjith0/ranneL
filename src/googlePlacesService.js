// Create a new file called googlePlacesService.js
export const fetchPlacesData = async (address, apiKey) => {
    try {
      // First, get the coordinates for the address using Geocoding API
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
  
      
      if (geocodeData.status !== 'OK') {
        throw new Error('Failed to geocode address');
      }
  
      const { lat, lng } = geocodeData.results[0].geometry.location;
  
      // Now get nearby places
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&key=${apiKey}`;
      const placesResponse = await fetch(placesUrl);
      const placesData = await placesResponse.json();
  
      // Get place details for the exact location
      const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${geocodeData.results[0].place_id}&fields=rating,user_ratings_total,formatted_address,geometry&key=${apiKey}`;
      const detailsResponse = await fetch(placeDetailsUrl);
      const detailsData = await detailsResponse.json();
  
      return {
        coordinates: { lat, lng },
        nearbyPlaces: placesData.results,
        placeDetails: detailsData.result,
        formattedAddress: geocodeData.results[0].formatted_address
      };
    } catch (error) {
      console.error('Error fetching places data:', error);
      throw error;
    }
  };
  
  // Create a file called analysisUtils.js
  export const calculateScores = (placesData) => {
    let scores = {
      environmental: {
        score: 0,
        details: {}
      },
      education: {
        score: 0,
        details: {}
      },
      poi: {
        score: 0,
        details: {}
      },
      sentiment: {
        score: 0,
        details: {}
      },
      market: {
        score: 0,
        details: {}
      }
    };
  
    // Calculate POI score
    const nearbyPlaces = placesData.nearbyPlaces;
    const poiCategories = {
      shopping: 0,
      restaurant: 0,
      school: 0,
      park: 0,
      transport: 0
    };
  
    nearbyPlaces.forEach(place => {
      place.types.forEach(type => {
        if (type.includes('shop') || type.includes('store')) poiCategories.shopping++;
        if (type.includes('restaurant') || type.includes('food')) poiCategories.restaurant++;
        if (type.includes('school')) poiCategories.school++;
        if (type.includes('park')) poiCategories.park++;
        if (type.includes('transit') || type.includes('transport')) poiCategories.transport++;
      });
    });
  
    // Calculate POI score (out of 200)
    scores.poi.score = Math.min(200, 
      (poiCategories.shopping * 10) +
      (poiCategories.restaurant * 10) +
      (poiCategories.school * 15) +
      (poiCategories.park * 15) +
      (poiCategories.transport * 10)
    );
  
    scores.poi.details = {
      shoppingVenues: poiCategories.shopping,
      restaurants: poiCategories.restaurant,
      schools: poiCategories.school,
      parks: poiCategories.park,
      transportHubs: poiCategories.transport
    };
  
    // Calculate sentiment score based on place ratings
    const averageRating = placesData.placeDetails.rating || 0;
    const totalRatings = placesData.placeDetails.user_ratings_total || 0;
    
    scores.sentiment.score = Math.min(200, Math.round((averageRating / 5) * 150 + 
      Math.min(50, totalRatings / 10)));
    
    scores.sentiment.details = {
      averageRating: averageRating.toFixed(1),
      totalReviews: totalRatings,
      communityEngagement: totalRatings > 100 ? 'High' : totalRatings > 50 ? 'Medium' : 'Low'
    };
  
    return scores;
  };
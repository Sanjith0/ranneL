// Create this file as 'analysisUtils.js' in your project
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
  
    // Count different types of places
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
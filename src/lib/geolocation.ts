// src/lib/geolocation.ts
// Reusable geolocation + reverse geocode utilities

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  error?: string;
}

/**
 * Request user's GPS location
 */
export async function requestUserLocation(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: 0, longitude: 0, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMsg = 'Unknown error';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out';
        }
        resolve({ latitude: 0, longitude: 0, error: errorMsg });
      },
      { timeout: 20000, enableHighAccuracy: true, maximumAge: 0 }
    );
  });
}

/**
 * Reverse geocode coordinates to address using Google Maps Geocoding API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeolocationResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return {
        latitude,
        longitude,
        error: 'Google Maps API key not configured',
      };
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    if (!response.ok) {
      return {
        latitude,
        longitude,
        error: 'Geocoding request failed',
      };
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components || [];

      const getComponent = (type: string) => {
        const comp = addressComponents.find((c: any) =>
          c.types.includes(type)
        );
        return comp ? comp.long_name : '';
      };

      return {
        latitude,
        longitude,
        address: result.formatted_address,
        city: getComponent('locality'),
        state: getComponent('administrative_area_level_1'),
        zip: getComponent('postal_code'),
        county: getComponent('administrative_area_level_2'),
      };
    }

    return {
      latitude,
      longitude,
      error: 'No address found for coordinates',
    };
  } catch (err: any) {
    return {
      latitude,
      longitude,
      error: `Geocoding error: ${err.message}`,
    };
  }
}

/**
 * Full workflow: get location → reverse geocode
 */
export async function getPropertyLocationFromGPS(): Promise<GeolocationResult> {
  const locResult = await requestUserLocation();

  if (locResult.error) {
    return locResult;
  }

  const geoResult = await reverseGeocode(
    locResult.latitude,
    locResult.longitude
  );

  return geoResult;
}

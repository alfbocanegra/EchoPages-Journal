/**
 * WeatherLocationService
 * Cross-platform service for fetching weather and location data.
 * Handles permissions, location fetch, weather API calls, and tagging journal entries.
 *
 * TODO: Implement platform-specific location permissions using Expo Location.
 * TODO: Integrate with weather API (OpenWeatherMap, WeatherAPI, etc.).
 * TODO: Securely manage API keys and permissions.
 */

import { Platform } from '../utils/platform';

let Location: any;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    Location = require('expo-location');
  } catch {}
}

export interface WeatherData {
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  location?: string;
  // Add more fields as needed
}

export class WeatherLocationService {
  static async requestLocationPermissions(): Promise<void> {
    if (!Location) throw new Error('expo-location not available');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permissions denied');
    }
  }

  static async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    address?: string;
  }> {
    if (!Location) throw new Error('expo-location not available');
    await WeatherLocationService.requestLocationPermissions();
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Reverse geocode to get address
    let address: string | undefined;
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        address = `${addr.city}, ${addr.region}, ${addr.country}`;
      }
    } catch {
      // Ignore reverse geocoding errors
    }

    return { latitude, longitude, address };
  }

  static async fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    // TODO: Replace with actual weather API integration
    // For now, return mock data
    const mockWeatherData: WeatherData = {
      temperature: 22,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 10,
      location: 'Current Location',
    };

    // TODO: Implement actual weather API call
    // Example with OpenWeatherMap:
    // const API_KEY = 'your_openweathermap_api_key';
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    // const data = await response.json();
    // return {
    //   temperature: data.main.temp,
    //   condition: data.weather[0].description,
    //   humidity: data.main.humidity,
    //   windSpeed: data.wind.speed,
    //   location: data.name,
    // };

    return mockWeatherData;
  }

  static async getWeatherDataForEntry(): Promise<
    WeatherData & { latitude: number; longitude: number }
  > {
    // 1. Get current location
    const location = await WeatherLocationService.getCurrentLocation();
    // 2. Fetch weather data
    const weather = await WeatherLocationService.fetchWeatherData(
      location.latitude,
      location.longitude
    );
    // 3. Combine location and weather data
    return {
      ...weather,
      latitude: location.latitude,
      longitude: location.longitude,
      location: location.address || weather.location,
    };
  }

  static async tagEntryWithWeather(entryId: string): Promise<WeatherData & { latitude: number; longitude: number }> {
    // Fetch weather/location data
    const data = await WeatherLocationService.getWeatherDataForEntry();
    // TODO: Save weather/location data to the entry in storage (requires cross-package storage access)
    // Example (pseudo-code):
    // import { getEntry, saveEntry } from '.../EncryptedEntryStorage';
    // const entry = await getEntry(entryId);
    // if (entry) {
    //   entry.weather = { temperature: data.temperature, condition: data.condition, location: data.location };
    //   entry.location = { latitude: data.latitude, longitude: data.longitude, name: data.location };
    //   await saveEntry(entry);
    // }
    // For now, just return the data
    return data;
  }
}

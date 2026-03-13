import { WeatherData, LocationData } from '../types';

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,uv_index,surface_pressure&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();

    if (!data.current || !data.daily || !data.hourly) {
      throw new Error('Invalid weather data received');
    }

    return {
      current: {
        temp: data.current.temperature_2m ?? 0,
        condition: WEATHER_CODES[data.current.weather_code] || 'Unknown',
        conditionCode: data.current.weather_code ?? 0,
        windSpeed: data.current.wind_speed_10m ?? 0,
        humidity: data.current.relative_humidity_2m ?? 0,
        uvIndex: data.current.uv_index ?? 0,
        isDay: data.current.is_day === 1,
        pressure: data.current.surface_pressure ?? 1013,
        visibility: 10,
      },
      daily: (data.daily.time || []).map((time: string, i: number) => ({
        date: time,
        maxTemp: data.daily.temperature_2m_max?.[i] ?? 0,
        minTemp: data.daily.temperature_2m_min?.[i] ?? 0,
        conditionCode: data.daily.weather_code?.[i] ?? 0,
        sunrise: data.daily.sunrise?.[i] ?? '',
        sunset: data.daily.sunset?.[i] ?? '',
      })),
      hourly: (data.hourly.time || []).slice(0, 24).map((time: string, i: number) => ({
        time,
        temp: data.hourly.temperature_2m?.[i] ?? 0,
        conditionCode: data.hourly.weather_code?.[i] ?? 0,
      })),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function searchLocations(query: string): Promise<LocationData[]> {
  if (query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
  
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();

  return data.map((item: any) => ({
    name: item.display_name.split(',')[0],
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    country: item.display_name.split(',').pop()?.trim(),
    state: item.display_name.split(',')[1]?.trim(),
  }));
}

export function getWeatherTheme(code: number, isDay: boolean) {
  // Clear
  if (code <= 1) return isDay ? 'theme-sunny' : 'theme-clear-night';
  // Cloudy
  if (code <= 3) return isDay ? 'theme-cloudy' : 'theme-cloudy-night';
  // Fog
  if (code === 45 || code === 48) return 'theme-fog';
  // Rain
  if (code >= 51 && code <= 65) return 'theme-rainy';
  if (code >= 80 && code <= 82) return 'theme-rainy';
  // Snow
  if (code >= 71 && code <= 77) return 'theme-snowy';
  if (code >= 85 && code <= 86) return 'theme-snowy';
  // Thunder
  if (code >= 95) return 'theme-stormy';
  
  return 'theme-default';
}

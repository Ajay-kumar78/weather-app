export interface WeatherData {
  current: {
    temp: number;
    condition: string;
    conditionCode: number;
    windSpeed: number;
    humidity: number;
    uvIndex: number;
    isDay: boolean;
    pressure: number;
    visibility: number;
  };
  daily: {
    date: string;
    maxTemp: number;
    minTemp: number;
    conditionCode: number;
    sunrise: string;
    sunset: string;
  }[];
  hourly: {
    time: string;
    temp: number;
    conditionCode: number;
  }[];
}

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

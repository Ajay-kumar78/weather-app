import React from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

export const WeatherIcon: React.FC<{ code: number; isDay?: boolean; className?: string }> = ({ code, isDay = true, className }) => {
  if (code <= 1) return isDay ? <Sun className={className} /> : <Moon className={className} />;
  if (code <= 3) return <Cloud className={className} />;
  if (code === 45 || code === 48) return <Eye className={className} />;
  if (code >= 51 && code <= 65 || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
  if (code >= 71 && code <= 77 || (code >= 85 && code <= 86)) return <CloudSnow className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, unit }) => (
  <div className="glass rounded-3xl p-4 flex items-center gap-4">
    <div className="p-3 bg-white/10 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-xs text-white/50 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-lg font-semibold">
        {value}
        {unit && <span className="text-sm font-normal ml-1 opacity-70">{unit}</span>}
      </p>
    </div>
  </div>
);

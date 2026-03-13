import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WeatherChart } from './components/WeatherChart';
import { GeminiInsight } from './components/GeminiInsight';
import { Wind, Droplets, Sun, Thermometer, Navigation, RefreshCw, AlertCircle, MapPin, Sunrise, Sunset, Gauge, Eye, Sparkles, User, Phone, Mail, CloudSun } from 'lucide-react';
import { format } from 'date-fns';
import { fetchWeather, getWeatherTheme } from './services/weatherService';
import { WeatherData, LocationData } from './types';
import { SearchBar } from './components/SearchBar';
import { WeatherIcon, MetricCard } from './components/WeatherUI';
import { cn } from './lib/utils';

const DEFAULT_LOCATION: LocationData = {
  name: 'London',
  lat: 51.5074,
  lon: -0.1278,
  country: 'United Kingdom'
};

export default function App() {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (loc: LocationData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(loc.lat, loc.lon);
      if (!data) throw new Error('No weather data returned from service');
      setWeather(data);
      setLocation(loc);
    } catch (err: any) {
      const message = err.message || 'Failed to load weather data. Please check your connection.';
      setError(message);
      console.error('Weather load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getInitialLocation = () => {
      if (navigator.geolocation) {
        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
              const data = await res.json();
              const addr = data.address || {};
              const name = addr.neighbourhood || addr.suburb || addr.city_district || addr.district || addr.city || addr.town || addr.village || 'Current Location';
              loadWeather({ name, lat: latitude, lon: longitude, country: addr.country });
            } catch (err) {
              loadWeather({ name: 'Current Location', lat: latitude, lon: longitude });
            } finally {
              setIsDetectingLocation(false);
            }
          },
          () => {
            setIsDetectingLocation(false);
            loadWeather(DEFAULT_LOCATION);
          },
          { 
            timeout: 10000, // Increased to 10s
            enableHighAccuracy: true,
            maximumAge: 0
          }
        );
      } else {
        loadWeather(DEFAULT_LOCATION);
      }
    };

    getInitialLocation();
  }, [loadWeather]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.address || {};
          const name = addr.neighbourhood || addr.suburb || addr.city_district || addr.district || addr.city || addr.town || addr.village || 'Current Location';
          loadWeather({ name, lat: latitude, lon: longitude, country: addr.country });
        } catch (err) {
          loadWeather({ name: 'Current Location', lat: latitude, lon: longitude });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setError('Unable to retrieve your location.');
        setLoading(false);
        setIsDetectingLocation(false);
      },
      { 
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0
      }
    );
  };

  const [showAbout, setShowAbout] = useState(false);
  const themeClass = weather ? getWeatherTheme(weather.current.conditionCode, weather.current.isDay) : 'theme-default';

  return (
    <div className={cn("relative min-h-screen w-full flex flex-col items-center p-4 md:p-8 transition-all duration-1000", themeClass)}>
      {/* About Developer Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
                <div className="relative group">
                  <div className="w-40 h-40 md:w-56 md:h-56 rounded-[40px] overflow-hidden border-2 border-white/10 shadow-2xl">
                    <img 
                      src="/images/ajay.png" 
                      alt="Ajay Kumar" 
                      className="w-full h-full object-cover  group-hover:grayscale-0 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 glass rounded-2xl flex items-center justify-center animate-bounce">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400 mb-2">Architect & Engineer</p>
                    <h2 className="text-4xl font-bold tracking-tight">Ajay Kumar</h2>
                  </div>
                  
                  <p className="text-white/60 text-sm leading-relaxed">
                    A passionate Full-Stack Developer specializing in creating high-performance, 
                    aesthetically pleasing web applications. With a focus on user experience 
                    and clean code, Ajay brings ideas to life through modern technology.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <a href="tel:+919216594325" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                      <div className="w-8 h-8 glass rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">+91 9216594325</span>
                    </a>
                    <a href="mailto:akswami9521@gmail.com" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                      <div className="w-8 h-8 glass rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">akswami9521@gmail.com</span>
                    </a>
                  </div>

                  <button 
                    onClick={() => setShowAbout(false)}
                    className="w-full py-4 glass rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[120px] opacity-40 transition-colors duration-1000",
            weather?.current.isDay ? "bg-blue-400" : "bg-indigo-900"
          )}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-[120px] opacity-40 transition-colors duration-1000",
            weather?.current.isDay ? "bg-cyan-300" : "bg-purple-900"
          )}
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
            <CloudSun className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ajay Weather</h1>
            <p className="text-sm text-white/50">{format(new Date(), 'EEEE, dd MMMM')}</p>
          </div>
        </div>
        
        <SearchBar onSelect={loadWeather} onCurrentLocation={handleCurrentLocation} />
      </header>

      <main className="w-full max-w-6xl flex-1 flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <RefreshCw className="w-12 h-12 animate-spin text-white/20" />
              <p className="text-white/40 font-mono text-sm tracking-widest uppercase">
                {isDetectingLocation ? "Detecting your location..." : "Syncing with atmosphere..."}
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
            >
              <AlertCircle className="w-16 h-16 text-red-400/50" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-white/50 max-w-md">{error}</p>
              <button
                onClick={() => loadWeather(location)}
                className="mt-4 px-6 py-2 glass rounded-full hover:bg-white/20 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          ) : weather ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Main Weather Card */}
              <div className="lg:col-span-8 space-y-6">
                <section className="glass rounded-[48px] p-8 md:p-14 relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-4 py-1.5 glass w-fit rounded-full text-white/70">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold tracking-wide uppercase">{location.name}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-9xl md:text-[11rem] font-bold tracking-tighter leading-none"
                          >
                            {Math.round(weather.current.temp)}
                          </motion.h2>
                          <span className="text-4xl md:text-6xl text-white/30 font-light mb-4">°</span>
                        </div>
                        <p className="text-3xl md:text-4xl font-light tracking-tight text-white/80">
                          {weather.current.condition}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 pt-4 text-white/40 text-sm font-mono uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4" />
                          <span>Feels {Math.round(weather.current.temp)}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          <span>UV {weather.current.uvIndex}</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.div 
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 2, 0]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="flex flex-col items-center"
                    >
                      <WeatherIcon 
                        code={weather.current.conditionCode} 
                        isDay={weather.current.isDay} 
                        className="w-24 h-24 md:w-40 md:h-40 text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                      />
                    </motion.div>
                  </div>
                  
                  {/* Decorative Gradient Glows */}
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 blur-[120px] rounded-full group-hover:bg-white/10 transition-colors duration-700" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
                </section>

                {/* Metrics Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard icon={<Wind className="w-5 h-5 text-blue-300" />} label="Wind Speed" value={weather.current.windSpeed} unit="km/h" />
                  <MetricCard icon={<Droplets className="w-5 h-5 text-cyan-300" />} label="Humidity" value={weather.current.humidity} unit="%" />
                  <MetricCard icon={<Gauge className="w-5 h-5 text-yellow-300" />} label="Pressure" value={weather.current.pressure} unit="hPa" />
                  <MetricCard icon={<Eye className="w-5 h-5 text-orange-300" />} label="Visibility" value={weather.current.visibility} unit="km" />
                </section>

                {/* AI Insights */}
                <div className="grid grid-cols-1 gap-6">
                  <GeminiInsight weather={weather} locationName={location.name} />
                </div>

                {/* Hourly Forecast with Chart */}
                <section className="glass rounded-[40px] p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Temperature Trend</h3>
                    <div className="h-px flex-1 mx-6 bg-white/5" />
                  </div>
                  
                  <WeatherChart data={weather.hourly} />
                  
                  <div className="flex gap-8 overflow-x-auto pb-4 no-scrollbar mt-8">
                    {weather.hourly.map((hour, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }}
                        className="flex flex-col items-center gap-4 min-w-[70px] p-4 rounded-3xl hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xs font-medium text-white/40">{format(new Date(hour.time), 'hh:mm a')}</span>
                        <WeatherIcon code={hour.conditionCode} isDay={weather.current.isDay} className="w-8 h-8 text-white/80" />
                        <span className="text-lg font-bold">{Math.round(hour.temp)}°</span>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar: 7-Day Forecast */}
              <div className="lg:col-span-4">
                <section className="glass rounded-[48px] p-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Weekly Outlook</h3>
                  </div>
                  <div className="space-y-8 flex-1">
                    {weather.daily.map((day, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between group cursor-default"
                      >
                        <div className="w-28">
                          <p className="font-semibold text-white/90 group-hover:text-white transition-colors">
                            {i === 0 ? 'Today' : format(new Date(day.date), 'EEEE')}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{format(new Date(day.date), 'dd MMM')}</p>
                        </div>
                        <div className="p-2.5 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                          <WeatherIcon code={day.conditionCode} className="w-6 h-6 text-white/70" />
                        </div>
                        <div className="flex gap-4 w-24 justify-end items-baseline">
                          <span className="text-xl font-bold">{Math.round(day.maxTemp)}°</span>
                          <span className="text-sm font-medium text-white/20">{Math.round(day.minTemp)}°</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-white/5">
                    <div className="glass rounded-3xl p-6 flex items-center justify-between bg-gradient-to-br from-white/5 to-transparent">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Local Time</p>
                        <p className="text-2xl font-mono font-bold">{format(new Date(), 'hh:mm a')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Timezone</p>
                        <p className="text-xs font-medium opacity-60">GMT +05:30</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-6 text-center"
            >
              <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center">
                <CloudSun className="w-10 h-10 text-white/20" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">No Weather Data</h2>
                <p className="text-white/40 max-w-xs">We couldn't retrieve weather information for this location.</p>
              </div>
              <button
                onClick={() => loadWeather(location)}
                className="px-8 py-3 glass rounded-2xl hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs"
              >
                Retry Connection
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-24 pb-16">
        <div className="glass rounded-[48px] p-10 md:p-16 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                  <CloudSun className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Ajay Weather</h2>
              </div>
              <p className="text-white/40 max-w-sm text-sm leading-relaxed">
                A premium atmospheric weather experience designed for precision and elegance. 
                Built with the latest web technologies for real-time accuracy.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center md:items-end gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">Lead Developer</p>
                  <div className="sm:hidden w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shadow-lg my-1">
                    <img 
                      src="/images/ajay.png" 
                      alt="Ajay Kumar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-2xl font-bold">Ajay Kumar</p>
                  <button 
                    onClick={() => setShowAbout(true)}
                    className="mt-2 px-4 py-2 glass rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2  cursor-pointer"
                  >
                    <User className="w-3 h-3" />
                    About Developer
                  </button>
                </div>
                <div className="w-32 h-32 rounded-2xl overflow-hidden border border-white/10 shadow-xl hidden sm:block">
                  <img 
                    src="/images/ajay.png"
                    alt="Ajay Kumar"
                    className="w-full h-full object-cover object-top hover:grayscale-0 transition-all duration-500 cursor-pointer"
                    onClick={() => setShowAbout(true)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-4">
                <a href="tel:+919216594325" className="px-6 py-3 glass rounded-2xl text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  +91 9216594325
                </a>
                <a href="mailto:akswami9521@gmail.com" className="px-6 py-3 glass rounded-2xl text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  akswami9521@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">
            <p>© 2026 Ajay Kumar. All Rights Reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-white/40 transition-colors cursor-default">Open-Meteo Engine</span>
              <span className="hover:text-white/40 transition-colors cursor-default">Nominatim API</span>
              <span className="hover:text-white/40 transition-colors cursor-default">React 19</span>
            </div>
          </div>

          {/* Decorative Background Glow */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchLocations } from '../services/weatherService';
import { LocationData } from '../types';

interface SearchBarProps {
  onSelect: (location: LocationData) => void;
  onCurrentLocation: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelect, onCurrentLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true);
        try {
          const data = await searchLocations(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={searchRef} className="relative w-full max-w-md z-50">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-white/50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="w-full h-12 pl-12 pr-12 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all placeholder:text-white/40"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-12 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onCurrentLocation}
          className="absolute right-4 text-white/50 hover:text-white transition-colors"
          title="Use current location"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-2xl overflow-hidden shadow-2xl"
          >
            {results.map((loc, i) => (
              <button
                key={`${loc.lat}-${loc.lon}-${i}`}
                onClick={() => {
                  onSelect(loc);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex flex-col border-b border-white/5 last:border-0"
              >
                <span className="font-medium">{loc.name}</span>
                <span className="text-xs text-white/50">{loc.state ? `${loc.state}, ` : ''}{loc.country}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

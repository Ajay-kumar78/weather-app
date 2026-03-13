import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { WeatherData } from '../types';

interface GeminiInsightProps {
  weather: WeatherData;
  locationName: string;
}

export const GeminiInsight: React.FC<GeminiInsightProps> = ({ weather, locationName }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateInsight = async () => {
      if (!process.env.GEMINI_API_KEY) return;
      
      setLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `The current weather in ${locationName} is ${weather.current.temp}°C with ${weather.current.condition}. 
          Humidity is ${weather.current.humidity}% and wind speed is ${weather.current.windSpeed} km/h. 
          Provide a very short, witty, and helpful weather insight (max 2 sentences) about what to expect or what to wear.`,
        });
        setInsight(response.text || "Stay prepared for the day!");
      } catch (error) {
        console.error("Gemini error:", error);
        setInsight("Enjoy your day, whatever the weather!");
      } finally {
        setLoading(false);
      }
    };

    generateInsight();
  }, [weather, locationName]);

  return (
    <div className="glass rounded-[32px] p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Aura Smart Insight</span>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-white/20" />
          <span className="text-sm text-white/30 italic">Analyzing atmosphere...</span>
        </div>
      ) : (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-white/80 leading-relaxed font-medium"
        >
          "{insight}"
        </motion.p>
      )}
    </div>
  );
};

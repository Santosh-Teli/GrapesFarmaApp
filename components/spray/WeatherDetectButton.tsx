"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudSun, Loader2, MapPin, Thermometer, Droplets, Wind, CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  detectedAt: string;
}

interface WeatherDetectButtonProps {
  onWeatherDetected: (weather: WeatherData) => void;
}

function getConditionFromCode(main: string): string {
  const map: Record<string, string> = {
    Clear: "Sunny",
    Clouds: "Cloudy",
    Rain: "Rainy",
    Drizzle: "Rainy",
    Thunderstorm: "Rainy",
    Snow: "Cloudy",
    Mist: "Cloudy",
    Fog: "Cloudy",
    Wind: "Windy",
  };
  return map[main] ?? "Sunny";
}

function isGoodForSpraying(weather: WeatherData): { good: boolean; reason: string } {
  if (weather.condition === "Rainy") return { good: false, reason: "Rain detected — spray will wash off." };
  if (weather.windSpeed >= 20) return { good: false, reason: `Wind speed ${weather.windSpeed.toFixed(0)} km/h — too windy for accurate spraying.` };
  if (weather.temperature < 5) return { good: false, reason: `Temperature ${weather.temperature.toFixed(0)}°C — too cold for spraying.` };
  if (weather.temperature > 40) return { good: false, reason: `Temperature ${weather.temperature.toFixed(0)}°C — too hot, spray may evaporate.` };
  return { good: true, reason: "Conditions are ideal for spraying! 🌟" };
}

export function WeatherDetectButton({ onWeatherDetected }: WeatherDetectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCity, setManualCity] = useState("");
  const [showManual, setShowManual] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  const fetchWeather = async (lat?: number, lon?: number, city?: string) => {
    if (!API_KEY) {
      setError("Weather API key not configured. Add NEXT_PUBLIC_OPENWEATHER_API_KEY to .env.local");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = lat !== undefined && lon !== undefined
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city!)}&appid=${API_KEY}&units=metric`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        // Show the real OpenWeather error message
        if (res.status === 401) {
          throw new Error("API key not activated yet. New keys take up to 15 minutes. Please try again shortly.");
        } else if (res.status === 404) {
          throw new Error(`City "${city}" not found. Try a different spelling (e.g. "Nashik" instead of "Nashik City").`);
        } else {
          throw new Error(json?.message ?? `API error ${res.status}`);
        }
      }

      const detected: WeatherData = {
        location: city ?? `${json.name}, ${json.sys?.country ?? ""}`,
        temperature: json.main.temp,
        humidity: json.main.humidity,
        windSpeed: (json.wind?.speed ?? 0) * 3.6, // m/s → km/h
        condition: getConditionFromCode(json.weather[0]?.main ?? "Clear"),
        detectedAt: new Date().toISOString(),
      };

      setWeather(detected);
      onWeatherDetected(detected);
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch weather.");
    } finally {
      setLoading(false);
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setShowManual(true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => { setLoading(false); setShowManual(true); }
    );
  };

  const suitability = weather ? isGoodForSpraying(weather) : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGPS}
          disabled={loading}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CloudSun className="h-4 w-4 mr-2" />}
          Auto-detect Weather
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowManual(!showManual)}
          className="text-gray-500"
        >
          <Search className="h-4 w-4 mr-1" />
          By City
        </Button>
      </div>

      {showManual && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter city name (e.g. Pune)"
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather(undefined, undefined, manualCity)}
            className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button type="button" size="sm" onClick={() => fetchWeather(undefined, undefined, manualCity)} disabled={!manualCity || loading}>
            Search
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {weather && suitability && (
        <Card className={cn(
          "border-2",
          suitability.good
            ? "border-green-200 bg-green-50/70"
            : "border-red-200 bg-red-50/70"
        )}>
          <CardContent className="pt-4 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {weather.location}
              </div>
              <Badge className={suitability.good ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}>
                {suitability.good ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                {suitability.good ? "Good to spray" : "Not recommended"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-2 border border-gray-100">
                <Thermometer className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                <p className="font-bold text-sm">{weather.temperature.toFixed(1)}°C</p>
                <p className="text-[10px] text-gray-400">Temp</p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-100">
                <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                <p className="font-bold text-sm">{weather.humidity}%</p>
                <p className="text-[10px] text-gray-400">Humidity</p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-100">
                <Wind className="h-4 w-4 text-teal-500 mx-auto mb-1" />
                <p className="font-bold text-sm">{weather.windSpeed.toFixed(0)} km/h</p>
                <p className="text-[10px] text-gray-400">Wind</p>
              </div>
            </div>

            <p className={cn("text-xs font-medium text-center px-2", suitability.good ? "text-green-700" : "text-red-700")}>
              {suitability.reason}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

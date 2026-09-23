import React, { useEffect, useState, useCallback } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Compass,
  RefreshCw,
  Radio,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { WeatherData, City } from '../types/gujarat';
import { fetchCurrentWeather } from '../services/weatherService';
import { GUJARAT_CITIES } from '../data/gujaratData';

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  landmarkNameGu: string;
  landmarkNameEn: string;
  compact?: boolean;
  onClose?: () => void;
  onSelectCity?: (city: City) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  lat,
  lng,
  landmarkNameGu,
  landmarkNameEn,
  compact = false,
  onClose,
  onSelectCity,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);

  const loadWeather = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentWeather(lat, lng, landmarkNameGu, landmarkNameEn, forceRefresh);
      setWeather(data);
    } catch (err) {
      setError('હવામાન ડેટા મેળવવામાં મુશ્કેલી આવી.');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, landmarkNameGu, landmarkNameEn]);

  useEffect(() => {
    loadWeather(false);
  }, [loadWeather]);

  // Weather icon selector
  const getWeatherIcon = (code: number, isDay: boolean, size = 'w-6 h-6') => {
    if (code === 0 || code === 1) {
      return isDay ? (
        <Sun className={`${size} text-amber-400 animate-spin-slow`} />
      ) : (
        <Sun className={`${size} text-indigo-300`} />
      );
    }
    if (code === 2 || code === 3) {
      return <CloudSun className={`${size} text-sky-400`} />;
    }
    if (code === 45 || code === 48) {
      return <CloudFog className={`${size} text-slate-300`} />;
    }
    if (code >= 51 && code <= 67) {
      return <CloudRain className={`${size} text-blue-400`} />;
    }
    if (code >= 71 && code <= 86) {
      return <Snowflake className={`${size} text-cyan-200`} />;
    }
    if (code >= 95) {
      return <CloudLightning className={`${size} text-amber-300 animate-bounce`} />;
    }
    return <Cloud className={`${size} text-slate-400`} />;
  };

  // Temperature gradient badge
  const getTempGradient = (temp: number) => {
    if (temp >= 38) return 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-300';
    if (temp >= 30) return 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300';
    if (temp >= 22) return 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 text-emerald-300';
    return 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-300';
  };

  if (compact) {
    // Compact HUD widget for 3D map overlay
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 text-slate-200 min-w-[280px] max-w-[340px] transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">{landmarkNameGu}</span>
                <span className="text-[10px] text-slate-400">({landmarkNameEn})</span>
              </div>
              <span className="text-[9px] text-emerald-400/90 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>લાઇવ હવામાન (Real-time)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => loadWeather(true)}
              disabled={loading}
              title="હવામાન અપડેટ કરો"
              className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && !weather && (
          <div className="py-4 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>હવામાન ડેટા મેળવી રહ્યું છે...</span>
          </div>
        )}

        {/* Error state */}
        {error && !weather && (
          <div className="py-2 text-center text-xs text-rose-400">
            <span>{error}</span>
          </div>
        )}

        {/* Loaded Data */}
        {weather && (
          <div>
            <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-slate-800/60 to-slate-800/20 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2.5">
                {getWeatherIcon(weather.weatherCode, weather.isDay, 'w-8 h-8')}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white font-mono tracking-tight">
                      {weather.temperature}°
                    </span>
                    <span className="text-xs text-slate-400 font-sans">C</span>
                  </div>
                  <span className="text-[11px] font-medium text-amber-300 block truncate max-w-[130px]">
                    {weather.conditionGu}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">અનુભવાય છે</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {weather.apparentTemperature}°C
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/40">
                <div className="flex items-center justify-center gap-1 text-sky-400 mb-0.5">
                  <Droplets className="w-3 h-3" />
                  <span className="text-slate-400 text-[9px]">ભેજ</span>
                </div>
                <span className="font-bold text-slate-200 font-mono">{weather.humidity}%</span>
              </div>

              <div className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/40">
                <div className="flex items-center justify-center gap-1 text-teal-400 mb-0.5">
                  <Wind className="w-3 h-3" />
                  <span className="text-slate-400 text-[9px]">પવન</span>
                </div>
                <span className="font-bold text-slate-200 font-mono">{weather.windSpeed} km/h</span>
              </div>

              <div className="bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/40">
                <div className="flex items-center justify-center gap-1 text-purple-400 mb-0.5">
                  <Gauge className="w-3 h-3" />
                  <span className="text-slate-400 text-[9px]">દબાણ</span>
                </div>
                <span className="font-bold text-slate-200 font-mono">{weather.surfacePressure} hPa</span>
              </div>
            </div>

            {/* City Quick Switcher Dropdown */}
            {onSelectCity && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                <div className="relative">
                  <button
                    onClick={() => setShowCityPicker(!showCityPicker)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    <span>અન્ય શહેરનું હવામાન જુઓ</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showCityPicker ? 'rotate-180' : ''}`} />
                  </button>

                  {showCityPicker && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 max-h-40 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 p-1 space-y-0.5">
                      {GUJARAT_CITIES.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setShowCityPicker(false);
                            onSelectCity(c);
                          }}
                          className={`w-full text-left px-2 py-1 text-[11px] rounded transition-colors flex items-center justify-between ${
                            c.nameGu === landmarkNameGu
                              ? 'bg-amber-500/20 text-amber-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{c.nameGu}</span>
                          <span className="text-[10px] text-slate-500">{c.nameEn}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full detailed version for DetailModal
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-700/80 shadow-lg text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>લાઇવ હવામાન પરિસ્થિતિ (Real-time Weather)</span>
            </h4>
            <span className="text-[10px] text-slate-400">
              ઓપન-મેટિઓ (Open-Meteo) વૈશ્વિક મોસમ સેટેલાઇટ ડેટા લેયર
            </span>
          </div>
        </div>

        <button
          onClick={() => loadWeather(true)}
          disabled={loading}
          title="હવામાન તાજું કરો"
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
          <span>{loading ? 'અપડેટ...' : 'તાજું કરો'}</span>
        </button>
      </div>

      {loading && !weather ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>લાઇવ મોસમ પરિસ્થિતિ મેળવી રહ્યું છે...</span>
        </div>
      ) : weather ? (
        <div className="space-y-3">
          {/* Main Weather Hero Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-850/80 border border-slate-700/60 shadow-inner">
                {getWeatherIcon(weather.weatherCode, weather.isDay, 'w-10 h-10')}
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {weather.temperature}°
                  </span>
                  <span className="text-sm font-semibold text-slate-400">C</span>
                  <span className="text-xs text-slate-500 font-mono ml-1">
                    (અનુભવાતું: {weather.apparentTemperature}°C)
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-amber-400">{weather.conditionGu}</span>
                  <span className="text-[11px] text-slate-400">· {weather.conditionEn}</span>
                </div>
              </div>
            </div>

            {/* Geographical coordinates label */}
            <div className="text-center sm:text-right text-[11px] text-slate-400">
              <span className="block font-medium text-slate-300">{landmarkNameGu}</span>
              <span className="font-mono text-[10px] text-slate-500">
                {lat.toFixed(2)}° N, {lng.toFixed(2)}° E
              </span>
            </div>
          </div>

          {/* Detailed 4-Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Humidity */}
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>વાતાવરણ ભેજ</span>
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-sky-300 font-mono">{weather.humidity}%</span>
                <span className="text-[10px] text-slate-500 block">હવામાં રહેલો ભેજ</span>
              </div>
            </div>

            {/* Wind */}
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>પવનની ગતિ</span>
                <Wind className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-teal-300 font-mono">{weather.windSpeed}</span>
                <span className="text-[11px] text-slate-400 font-sans ml-1">km/h</span>
                <span className="text-[10px] text-slate-500 block truncate">{weather.windDirectionGu}</span>
              </div>
            </div>

            {/* Pressure */}
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>હવાનું દબાણ</span>
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-purple-300 font-mono">{weather.surfacePressure}</span>
                <span className="text-[11px] text-slate-400 font-sans ml-1">hPa</span>
                <span className="text-[10px] text-slate-500 block">સપાટીય દબાણ</span>
              </div>
            </div>

            {/* Precipitation */}
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>વરસાદ (છેલ્લા કલાકમાં)</span>
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-blue-300 font-mono">{weather.precipitation}</span>
                <span className="text-[11px] text-slate-400 font-sans ml-1">મિમી (mm)</span>
                <span className="text-[10px] text-slate-500 block">
                  {weather.precipitation > 0 ? 'વરસાદ ચાલુ છે' : 'વરસાદ રહિત'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-rose-400">
          હવામાન ડેટા ઉપલબ્ધ નથી.
        </div>
      )}
    </div>
  );
};

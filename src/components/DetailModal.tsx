import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Waves, 
  Mountain as MountainIcon, 
  Building2, 
  Compass, 
  Award, 
  Sparkles,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import { River, Mountain, City } from '../types/gujarat';
import { GUJARAT_IMAGES } from '../data/gujaratData';
import { WeatherWidget } from './WeatherWidget';

interface DetailModalProps {
  item: River | Mountain | City | null;
  type: 'river' | 'mountain' | 'city' | null;
  onClose: () => void;
  onAddToCompare?: (item: River | Mountain | City, type: 'river' | 'mountain' | 'city') => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  type,
  onClose,
  onAddToCompare,
}) => {
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  useEffect(() => {
    // Stop speech when modal closes or item changes
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
    }
  }, [item]);

  if (!item || !type) return null;

  // Audio Speech Handler in Gujarati
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    let textToSpeak = '';
    if (type === 'river') {
      const river = item as River;
      textToSpeak = `${river.nameGu}. ${river.significanceGu}. ઉદ્ગમ સ્થાન ${river.origin}. અંતિમ સ્થળ ${river.destination}. લંબાઈ ${river.lengthKm} કિલોમીટર. ${river.descriptionGu}`;
    } else if (type === 'mountain') {
      const mountain = item as Mountain;
      textToSpeak = `${mountain.nameGu}. ઊંચાઈ ${mountain.heightM} મીટર. જિલ્લો ${mountain.districtGu}. ${mountain.mythologyGu}. ${mountain.descriptionGu}`;
    } else if (type === 'city') {
      const city = item as City;
      textToSpeak = `${city.nameGu}. ઉપનામ ${city.nicknameGu}. જિલ્લો ${city.districtGu}. વસ્તી ${city.populationGu}. ${city.descriptionGu}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    // Find Gujarati voice if available, else standard hindi/indian voice
    const voices = window.speechSynthesis.getVoices();
    const guVoice = voices.find((v) => v.lang.startsWith('gu') || v.lang.startsWith('hi'));
    if (guVoice) {
      utterance.voice = guVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  // Select domain-authentic image for visual anchor
  let modalImage = GUJARAT_IMAGES.hero;
  if (type === 'river') {
    modalImage = GUJARAT_IMAGES.narmada;
  } else if (type === 'mountain') {
    modalImage = GUJARAT_IMAGES.girnar;
  } else if (type === 'city') {
    modalImage = GUJARAT_IMAGES.ahmedabad;
  }

  const regionNames: Record<string, string> = {
    saurashtra: 'સૌરાષ્ટ્ર',
    kachchh: 'કચ્છ',
    north: 'ઉત્તર ગુજરાત',
    central: 'મધ્ય ગુજરાત',
    south: 'દક્ષિણ ગુજરાત',
    all: 'સમગ્ર ગુજરાત',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Visual with Scrim */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950 shrink-0">
          <img
            src={modalImage}
            alt={item.nameGu}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white backdrop-blur-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge & Type Kicker */}
          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md">
              {type === 'river' && <Waves className="w-3.5 h-3.5" />}
              {type === 'mountain' && <MountainIcon className="w-3.5 h-3.5" />}
              {type === 'city' && <Building2 className="w-3.5 h-3.5" />}
              <span>{type === 'river' ? 'નદી' : type === 'mountain' ? 'પર્વત / ડુંગર' : 'પ્રમુખ શહેર'}</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900/80 text-amber-300 border border-slate-700 backdrop-blur-sm">
              {regionNames[item.region] || 'ગુજરાત'}
            </span>
          </div>

          {/* Title Area */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                {item.nameGu}
              </h2>
              <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span className="font-medium text-amber-400">{item.nameEn}</span>
                {type === 'mountain' && <span>· {(item as Mountain).districtGu} જિલ્લો</span>}
                {type === 'city' && <span>· {(item as City).nicknameGu}</span>}
                {type === 'river' && <span>· લંબાઈ: {(item as River).lengthKm} કિમી</span>}
              </div>
            </div>

            {/* Audio Speech Narration Button */}
            <button
              onClick={handleToggleSpeech}
              title={isPlayingSpeech ? 'વાચા અટકાવો' : 'ગુજરાતીમાં સાંભળો (Audio)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition-all ${
                isPlayingSpeech
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-900/80 text-amber-300 border-amber-500/30 hover:bg-slate-800'
              }`}
            >
              {isPlayingSpeech ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingSpeech ? 'અટકાવો' : 'સાંભળો'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200">
          {/* River Specific Details */}
          {type === 'river' && (() => {
            const river = item as River;
            return (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-900/50 text-sky-200 text-xs sm:text-sm font-medium">
                  {river.significanceGu}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1">કુલ લંબાઈ</span>
                    <span className="text-base font-bold text-sky-400 font-mono tabular-nums">{river.lengthKm} કિમી</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1">ઉદ્ગમ સ્થાન</span>
                    <span className="text-xs font-semibold text-slate-200">{river.origin}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block mb-1">અંતિમ સંગમ</span>
                    <span className="text-xs font-semibold text-slate-200">{river.destination}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">મુખ્ય બંધ / ડેમ</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {river.majorDams.map((dam, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 text-slate-300">
                        {dam}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">તટવર્તી પ્રમુખ શહેરો</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {river.majorCities.map((city, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-800/80 rounded-md border border-slate-700/80 text-sky-300">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">વિસ્તૃત પરિચય</h4>
                  <p className="leading-relaxed text-slate-300 text-sm">{river.descriptionGu}</p>
                </div>
              </div>
            );
          })()}

          {/* Mountain Specific Details */}
          {type === 'mountain' && (() => {
            const m = item as Mountain;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1">ઊંચાઈ (મીટર)</span>
                    <span className="text-base font-bold text-amber-400 font-mono tabular-nums">{m.heightM} મીટર</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({m.heightFt} ફૂટ)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1">જિલ્લો</span>
                    <span className="text-sm font-semibold text-slate-200">{m.districtGu}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block mb-1">પર્વતમાળા / શ્રેણી</span>
                    <span className="text-xs font-semibold text-slate-200">{m.rangeGu}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/40 space-y-1">
                  <span className="text-xs font-bold text-amber-400 block">પૌરાણિક તથા આધ્યાત્મિક મહાત્મ્ય</span>
                  <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">{m.mythologyGu}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">મુખ્ય આકર્ષણો તથા શિખરો</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {m.attractionsGu.map((att, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <span className="text-amber-400">✦</span>
                        <span>{att}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">વિસ્તૃત પરિચય</h4>
                  <p className="leading-relaxed text-slate-300 text-sm">{m.descriptionGu}</p>
                </div>
              </div>
            );
          })()}

          {/* City Specific Details */}
          {type === 'city' && (() => {
            const city = item as City;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1">આશરે વસ્તી</span>
                    <span className="text-base font-bold text-rose-400">{city.populationGu}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block mb-1">જિલ્લો</span>
                    <span className="text-sm font-semibold text-slate-200">{city.districtGu}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block mb-1">ક્ષેત્રફળ</span>
                    <span className="text-sm font-semibold text-slate-200 font-mono tabular-nums">{city.areaKm2} ચો.કિમી</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">શાના માટે જાણીતું છે?</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {city.famousForGu.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700 text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">મુખ્ય જોવાલાયક સ્થળો (Landmarks)</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {city.landmarksGu.map((landmark, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <span className="text-rose-400">✦</span>
                        <span>{landmark}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">વિસ્તૃત પરિચય</h4>
                  <p className="leading-relaxed text-slate-300 text-sm">{city.descriptionGu}</p>
                </div>
              </div>
            );
          })()}
          {/* Real-time Weather Section */}
          {item.geoCoords && (
            <div className="pt-2">
              <WeatherWidget
                lat={item.geoCoords.lat}
                lng={item.geoCoords.lng}
                landmarkNameGu={item.nameGu}
                landmarkNameEn={item.nameEn}
                compact={false}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onAddToCompare && onAddToCompare(item, type)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-amber-400" />
            <span>સરખામણીમાં ઉમેરો</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            બંધ કરો
          </button>
        </div>
      </div>
    </div>
  );
};

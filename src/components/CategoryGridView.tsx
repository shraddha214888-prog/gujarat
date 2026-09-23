import React, { useState } from 'react';
import { 
  Waves, 
  Mountain as MountainIcon, 
  Building2, 
  MapPin, 
  ArrowUpRight, 
  Compass, 
  Volume2, 
  GitCompare,
  ArrowUpDown,
  Search
} from 'lucide-react';
import { River, Mountain, City, RegionType } from '../types/gujarat';
import { GUJARAT_RIVERS, GUJARAT_MOUNTAINS, GUJARAT_CITIES, GUJARAT_IMAGES } from '../data/gujaratData';

interface CategoryGridViewProps {
  type: 'rivers' | 'mountains' | 'cities';
  onSelectItem: (item: River | Mountain | City, type: 'river' | 'mountain' | 'city') => void;
  onViewOn3DMap: (item: River | Mountain | City) => void;
  onOpenCompare: (type: 'river' | 'mountain' | 'city') => void;
}

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({
  type,
  onSelectItem,
  onViewOn3DMap,
  onOpenCompare,
}) => {
  const [regionFilter, setRegionFilter] = useState<RegionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'metric'>('default');

  const bannerImg =
    type === 'rivers'
      ? GUJARAT_IMAGES.narmada
      : type === 'mountains'
      ? GUJARAT_IMAGES.girnar
      : GUJARAT_IMAGES.ahmedabad;

  const titleGu =
    type === 'rivers'
      ? 'ગુજરાતની પાવન નદીઓ'
      : type === 'mountains'
      ? 'ગુજરાતના ભવ્ય ડુંગરો અને પર્વતો'
      : 'ગુજરાતના પ્રમુખ ઐતિહાસિક અને આધુનિક શહેરો';

  const subtitleGu =
    type === 'rivers'
      ? 'નર્મદા, તાપી, સાબરમતી, મહી સહિત સમગ્ર રાજ્યને સમૃદ્ધ બનાવતી લોકમાતાઓ'
      : type === 'mountains'
      ? 'ગિરનાર, પાવાગઢ, ચોટીલા, શેત્રુંજય અને સાપુતારા - આસ્થા અને કુદરતની ધરોહર'
      : 'અમદાવાદ, સુરત, વડોદરા, રાજકોટ, ભાવનગર અને કચ્છનું આર્થિક-સાંસ્કૃતિક દર્શન';

  let rawList: any[] = [];
  if (type === 'rivers') rawList = [...GUJARAT_RIVERS];
  else if (type === 'mountains') rawList = [...GUJARAT_MOUNTAINS];
  else rawList = [...GUJARAT_CITIES];

  // Filter
  const filteredList = rawList.filter((item) => {
    if (regionFilter !== 'all' && item.region !== regionFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.nameGu.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.districtGu?.toLowerCase().includes(q)
    );
  });

  // Sort
  if (sortBy === 'metric') {
    if (type === 'rivers') {
      filteredList.sort((a, b) => b.lengthKm - a.lengthKm);
    } else if (type === 'mountains') {
      filteredList.sort((a, b) => b.heightM - a.heightM);
    } else {
      filteredList.sort((a, b) => b.areaKm2 - a.areaKm2);
    }
  }

  const regionLabels: Record<string, string> = {
    all: 'સમગ્ર ગુજરાત',
    saurashtra: 'સૌરાષ્ટ્ર',
    kachchh: 'કચ્છ',
    central: 'મધ્ય ગુજરાત',
    south: 'દક્ષિણ ગુજરાત',
    north: 'ઉત્તર ગુજરાત',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Category Hero Banner with Scrim */}
      <div className="relative rounded-2xl overflow-hidden h-56 sm:h-64 border border-slate-800 shadow-2xl">
        <img
          src={bannerImg}
          alt={titleGu}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              {type === 'rivers' && <Waves className="w-4 h-4" />}
              {type === 'mountains' && <MountainIcon className="w-4 h-4" />}
              {type === 'cities' && <Building2 className="w-4 h-4" />}
              <span>વિસ્તૃત અભ્યાસ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {titleGu}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {subtitleGu}
            </p>
          </div>

          <button
            onClick={() => onOpenCompare(type === 'rivers' ? 'river' : type === 'mountains' ? 'mountain' : 'city')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <GitCompare className="w-4 h-4" />
            <span>તુલના કરો (Compare)</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl backdrop-blur-md">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="શોધો નામ કે જિલ્લો..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Region Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {(['all', 'saurashtra', 'kachchh', 'central', 'south', 'north'] as RegionType[]).map((reg) => (
            <button
              key={reg}
              onClick={() => setRegionFilter(reg)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                regionFilter === reg
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {regionLabels[reg]}
            </button>
          ))}
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortBy(sortBy === 'default' ? 'metric' : 'default')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {type === 'rivers'
              ? sortBy === 'metric' ? 'લંબાઈ ક્રમે' : 'સામાન્ય ક્રમ'
              : type === 'mountains'
              ? sortBy === 'metric' ? 'ઊંચાઈ ક્રમે' : 'સામાન્ય ક્રમ'
              : sortBy === 'metric' ? 'વિસ્તાર ક્રમે' : 'સામાન્ય ક્રમ'}
          </span>
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((item) => {
          const itemType = type === 'rivers' ? 'river' : type === 'mountains' ? 'mountain' : 'city';

          return (
            <div
              key={item.id}
              className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.nameGu}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-medium text-amber-400">{item.nameEn}</span>
                      <span>·</span>
                      <span>{regionLabels[item.region] || 'ગુજરાત'}</span>
                    </div>
                  </div>

                  {/* Primary Metric Badge */}
                  {type === 'rivers' && (
                    <div className="text-right">
                      <span className="text-sm font-bold text-sky-400 font-mono tabular-nums">
                        {(item as River).lengthKm}
                      </span>
                      <span className="text-[10px] text-slate-400 block">કિમી</span>
                    </div>
                  )}
                  {type === 'mountains' && (
                    <div className="text-right">
                      <span className="text-sm font-bold text-amber-400 font-mono tabular-nums">
                        {(item as Mountain).heightM}
                      </span>
                      <span className="text-[10px] text-slate-400 block">મીટર</span>
                    </div>
                  )}
                  {type === 'cities' && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400">
                        {(item as City).populationGu}
                      </span>
                      <span className="text-[10px] text-slate-400 block">વસ્તી</span>
                    </div>
                  )}
                </div>

                {/* Subtitle / Key statement */}
                {type === 'rivers' && (
                  <p className="text-xs text-sky-300/90 font-medium line-clamp-2">
                    {(item as River).significanceGu}
                  </p>
                )}
                {type === 'mountains' && (
                  <p className="text-xs text-amber-300/90 font-medium line-clamp-2">
                    {(item as Mountain).mythologyGu}
                  </p>
                )}
                {type === 'cities' && (
                  <p className="text-xs text-rose-300/90 font-medium line-clamp-2">
                    {(item as City).nicknameGu}
                  </p>
                )}

                {/* Body paragraph */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {item.descriptionGu}
                </p>

                {/* Key Bullet / Tags */}
                {type === 'rivers' && (
                  <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                    <p><strong className="text-slate-300">મુખ્ય બંધ:</strong> {(item as River).majorDams.join(', ')}</p>
                    <p><strong className="text-slate-300">કિનારાના શહેરો:</strong> {(item as River).majorCities.join(', ')}</p>
                  </div>
                )}
                {type === 'mountains' && (
                  <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                    <p><strong className="text-slate-300">જિલ્લો:</strong> {(item as Mountain).districtGu}</p>
                    <p><strong className="text-slate-300">શ્રેણી:</strong> {(item as Mountain).rangeGu}</p>
                  </div>
                )}
                {type === 'cities' && (
                  <div className="text-[11px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                    <p><strong className="text-slate-300">જિલ્લો:</strong> {(item as City).districtGu}</p>
                    <p><strong className="text-slate-300">જાણીતું:</strong> {(item as City).famousForGu.slice(0, 3).join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewOn3DMap(item)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>૩ડી નકશા પર જુઓ</span>
                </button>

                <button
                  onClick={() => onSelectItem(item, itemType)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                >
                  <span>સંપૂર્ણ વિગત</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Waves, 
  Mountain as MountainIcon, 
  Building2, 
  ChevronRight,
  ChevronLeft,
  Filter,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { River, Mountain, City, CategoryType, RegionType } from '../types/gujarat';
import { GUJARAT_RIVERS, GUJARAT_MOUNTAINS, GUJARAT_CITIES } from '../data/gujaratData';

interface ExplorerSidebarProps {
  categoryFilter: CategoryType;
  setCategoryFilter: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectRiver: (river: River) => void;
  onSelectMountain: (mountain: Mountain) => void;
  onSelectCity: (city: City) => void;
  selectedId: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ExplorerSidebar: React.FC<ExplorerSidebarProps> = ({
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  onSelectRiver,
  onSelectMountain,
  onSelectCity,
  selectedId,
  isOpen,
  setIsOpen,
}) => {
  const [regionFilter, setRegionFilter] = useState<RegionType>('all');

  // Filter items
  const filterByQueryAndRegion = (item: any) => {
    if (regionFilter !== 'all' && item.region !== regionFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.nameGu?.toLowerCase().includes(q) ||
      item.nameEn?.toLowerCase().includes(q) ||
      item.districtGu?.toLowerCase().includes(q)
    );
  };

  const filteredRivers = categoryFilter === 'all' || categoryFilter === 'rivers' 
    ? GUJARAT_RIVERS.filter(filterByQueryAndRegion)
    : [];

  const filteredMountains = categoryFilter === 'all' || categoryFilter === 'mountains'
    ? GUJARAT_MOUNTAINS.filter(filterByQueryAndRegion)
    : [];

  const filteredCities = categoryFilter === 'all' || categoryFilter === 'cities'
    ? GUJARAT_CITIES.filter(filterByQueryAndRegion)
    : [];

  const totalCount = filteredRivers.length + filteredMountains.length + filteredCities.length;

  return (
    <>
      {/* Toggle Button when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute left-4 top-20 z-20 flex items-center gap-2 px-3 py-2 bg-slate-900/90 text-amber-300 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md hover:bg-slate-800 text-xs font-semibold transition-all"
        >
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>યાદી દર્શન ({GUJARAT_RIVERS.length + GUJARAT_MOUNTAINS.length + GUJARAT_CITIES.length})</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {/* Slide-out Sidebar */}
      <div
        className={`absolute top-0 left-0 bottom-0 z-25 w-80 sm:w-96 bg-slate-950/95 border-r border-slate-800 backdrop-blur-xl flex flex-col transition-transform duration-300 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>ગુજરાત અન્વેષક (Explorer)</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono tabular-nums">({totalCount})</span>
            </h3>
            <p className="text-[11px] text-slate-400">નદીઓ, ડુંગરો અને પ્રમુખ નગરો</p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="શોધો: નદી, ડુંગર, શહેર કે જિલ્લો..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs (Segmented Button Control adhering to zero-pill rule) */}
        <div className="p-2 border-b border-slate-800/80 bg-slate-900/40">
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`py-1 text-center font-medium rounded transition-colors whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              બધા
            </button>
            <button
              onClick={() => setCategoryFilter('rivers')}
              className={`py-1 text-center font-medium rounded transition-colors whitespace-nowrap ${
                categoryFilter === 'rivers'
                  ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              નદીઓ
            </button>
            <button
              onClick={() => setCategoryFilter('mountains')}
              className={`py-1 text-center font-medium rounded transition-colors whitespace-nowrap ${
                categoryFilter === 'mountains'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ડુંગરો
            </button>
            <button
              onClick={() => setCategoryFilter('cities')}
              className={`py-1 text-center font-medium rounded transition-colors whitespace-nowrap ${
                categoryFilter === 'cities'
                  ? 'bg-rose-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              શહેરો
            </button>
          </div>
        </div>

        {/* Item List Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Rivers Group */}
          {filteredRivers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-sky-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5" />
                  <span>ગુજરાતની મુખ્ય નદીઓ</span>
                </span>
                <span className="font-mono tabular-nums">({filteredRivers.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredRivers.map((river) => (
                  <button
                    key={river.id}
                    onClick={() => onSelectRiver(river)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                      selectedId === river.id
                        ? 'bg-sky-950/70 border-sky-500/80 text-white ring-1 ring-sky-500'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white group-hover:text-sky-300">{river.nameGu}</span>
                        <span className="text-[10px] text-slate-400">({river.nameEn})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        લંબાઈ: <strong className="text-sky-400 font-mono tabular-nums">{river.lengthKm} કિમી</strong> · બંધ: {river.majorDams[0]?.split('(')[0]}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mountains Group */}
          {filteredMountains.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400 px-1">
                <span className="flex items-center gap-1.5">
                  <MountainIcon className="w-3.5 h-3.5" />
                  <span>ગુજરાતના ડુંગરો / પર્વતો</span>
                </span>
                <span className="font-mono tabular-nums">({filteredMountains.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredMountains.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onSelectMountain(m)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                      selectedId === m.id
                        ? 'bg-amber-950/70 border-amber-500/80 text-white ring-1 ring-amber-500'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white group-hover:text-amber-300">{m.nameGu}</span>
                        <span className="text-[10px] text-slate-400">({m.districtGu})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        ઊંચાઈ: <strong className="text-amber-400 font-mono tabular-nums">{m.heightM} મીટર</strong> ({m.heightFt} ફૂટ)
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cities Group */}
          {filteredCities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-rose-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>પ્રમુખ નગરો અને શહેરો</span>
                </span>
                <span className="font-mono tabular-nums">({filteredCities.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => onSelectCity(city)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                      selectedId === city.id
                        ? 'bg-rose-950/70 border-rose-500/80 text-white ring-1 ring-rose-500'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white group-hover:text-rose-300">{city.nameGu}</span>
                        <span className="text-[10px] text-slate-400">({city.nicknameGu.split('/')[0]})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        વસ્તી: <strong className="text-rose-400">{city.populationGu}</strong> · જિલ્લો: {city.districtGu}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {totalCount === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm">કોઈ પરિણામ મળ્યું નથી.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-amber-400 underline text-xs"
              >
                શોધ રીસેટ કરો
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

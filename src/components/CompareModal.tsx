import React, { useState } from 'react';
import { X, GitCompare, Waves, Mountain as MountainIcon, Building2, ArrowRight } from 'lucide-react';
import { River, Mountain, City } from '../types/gujarat';
import { GUJARAT_RIVERS, GUJARAT_MOUNTAINS, GUJARAT_CITIES } from '../data/gujaratData';

interface CompareModalProps {
  onClose: () => void;
  initialType?: 'river' | 'mountain' | 'city';
}

export const CompareModal: React.FC<CompareModalProps> = ({ onClose, initialType = 'river' }) => {
  const [compareType, setCompareType] = useState<'river' | 'mountain' | 'city'>(initialType);

  // Selected items for side-by-side comparison
  const [selectedId1, setSelectedId1] = useState<string>(
    initialType === 'river' ? 'narmada' : initialType === 'mountain' ? 'girnar' : 'ahmedabad'
  );
  const [selectedId2, setSelectedId2] = useState<string>(
    initialType === 'river' ? 'tapi' : initialType === 'mountain' ? 'pavagadh' : 'surat'
  );

  const handleTypeChange = (type: 'river' | 'mountain' | 'city') => {
    setCompareType(type);
    if (type === 'river') {
      setSelectedId1(GUJARAT_RIVERS[0].id);
      setSelectedId2(GUJARAT_RIVERS[1].id);
    } else if (type === 'mountain') {
      setSelectedId1(GUJARAT_MOUNTAINS[0].id);
      setSelectedId2(GUJARAT_MOUNTAINS[1].id);
    } else {
      setSelectedId1(GUJARAT_CITIES[0].id);
      setSelectedId2(GUJARAT_CITIES[1].id);
    }
  };

  const currentList =
    compareType === 'river'
      ? GUJARAT_RIVERS
      : compareType === 'mountain'
      ? GUJARAT_MOUNTAINS
      : GUJARAT_CITIES;

  const item1 = currentList.find((x) => x.id === selectedId1) || currentList[0];
  const item2 = currentList.find((x) => x.id === selectedId2) || currentList[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">ગુજરાત ભૌગોલિક સરખામણી</h3>
              <p className="text-xs text-slate-400">બે સ્થળો, નદીઓ કે પર્વતો વચ્ચે તુલનાત્મક અભ્યાસ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Switcher */}
        <div className="px-6 pt-4 flex items-center gap-2">
          <button
            onClick={() => handleTypeChange('river')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              compareType === 'river'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>નદીઓની સરખામણી</span>
          </button>
          <button
            onClick={() => handleTypeChange('mountain')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              compareType === 'mountain'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MountainIcon className="w-3.5 h-3.5" />
            <span>ડુંગરો / પર્વતોની સરખામણી</span>
          </button>
          <button
            onClick={() => handleTypeChange('city')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              compareType === 'city'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>શહેરોની સરખામણી</span>
          </button>
        </div>

        {/* Selectors Bar */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1.5">પ્રથમ પસંદગી</label>
            <select
              value={selectedId1}
              onChange={(e) => setSelectedId1(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-amber-400"
            >
              {currentList.map((item) => (
                <option key={item.id} value={item.id} disabled={item.id === selectedId2}>
                  {item.nameGu} ({item.nameEn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1.5">દ્વિતીય પસંદગી</label>
            <select
              value={selectedId2}
              onChange={(e) => setSelectedId2(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-amber-400"
            >
              {currentList.map((item) => (
                <option key={item.id} value={item.id} disabled={item.id === selectedId1}>
                  {item.nameGu} ({item.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side by side comparison table */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* River Comparison */}
          {compareType === 'river' && (() => {
            const r1 = item1 as River;
            const r2 = item2 as River;
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-base font-bold text-sky-400">{r1.nameGu}</h4>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">કુલ લંબાઈ:</strong> <span className="font-mono font-bold text-sky-300">{r1.lengthKm} કિમી</span></p>
                    <p><strong className="text-slate-400">ઉદ્ગમ:</strong> {r1.origin}</p>
                    <p><strong className="text-slate-400">સંગમ:</strong> {r1.destination}</p>
                    <p><strong className="text-slate-400">મુખ્ય બંધ:</strong> {r1.majorDams.join(', ')}</p>
                    <p><strong className="text-slate-400">શહેરો:</strong> {r1.majorCities.join(', ')}</p>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/60 leading-relaxed">{r1.descriptionGu}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-base font-bold text-sky-400">{r2.nameGu}</h4>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">કુલ લંબાઈ:</strong> <span className="font-mono font-bold text-sky-300">{r2.lengthKm} કિમી</span></p>
                    <p><strong className="text-slate-400">ઉદ્ગમ:</strong> {r2.origin}</p>
                    <p><strong className="text-slate-400">સંગમ:</strong> {r2.destination}</p>
                    <p><strong className="text-slate-400">મુખ્ય બંધ:</strong> {r2.majorDams.join(', ')}</p>
                    <p><strong className="text-slate-400">શહેરો:</strong> {r2.majorCities.join(', ')}</p>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/60 leading-relaxed">{r2.descriptionGu}</p>
                </div>
              </div>
            );
          })()}

          {/* Mountain Comparison */}
          {compareType === 'mountain' && (() => {
            const m1 = item1 as Mountain;
            const m2 = item2 as Mountain;
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-base font-bold text-amber-400">{m1.nameGu}</h4>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">ઊંચાઈ:</strong> <span className="font-mono font-bold text-amber-300">{m1.heightM} મીટર</span> ({m1.heightFt} ફૂટ)</p>
                    <p><strong className="text-slate-400">જિલ્લો:</strong> {m1.districtGu}</p>
                    <p><strong className="text-slate-400">પર્વતમાળા:</strong> {m1.rangeGu}</p>
                    <p><strong className="text-slate-400">પૌરાણિક કથા:</strong> {m1.mythologyGu}</p>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/60 leading-relaxed">{m1.descriptionGu}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-base font-bold text-amber-400">{m2.nameGu}</h4>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">ઊંચાઈ:</strong> <span className="font-mono font-bold text-amber-300">{m2.heightM} મીટર</span> ({m2.heightFt} ફૂટ)</p>
                    <p><strong className="text-slate-400">જિલ્લો:</strong> {m2.districtGu}</p>
                    <p><strong className="text-slate-400">પર્વતમાળા:</strong> {m2.rangeGu}</p>
                    <p><strong className="text-slate-400">પૌરાણિક કથા:</strong> {m2.mythologyGu}</p>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/60 leading-relaxed">{m2.descriptionGu}</p>
                </div>
              </div>
            );
          })()}

          {/* City Comparison */}
          {compareType === 'city' && (() => {
            const c1 = item1 as City;
            const c2 = item2 as City;
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-base font-bold text-rose-400">{c1.nameGu}</h4>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">ઉપનામ:</strong> {c1.nicknameGu}</p>
                    <p><strong className="text-slate-400">વસ્તી:</strong> {c1.populationGu}</p>
                    <p><strong className="text-slate-400">જિલ્લો:</strong> {c1.districtGu}</p>
                    <p><strong className="text-slate-400">પ્રખ્યાત:</strong> {c1.famousForGu.join(', ')}</p>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/60 leading-relaxed">{c1.descriptionGu}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <h4 className="text-base font-bold text-rose-400">{c2.nameGu}</h4>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><strong className="text-slate-400">ઉપનામ:</strong> {c2.nicknameGu}</p>
                    <p><strong className="text-slate-400">વસ્તી:</strong> {c2.populationGu}</p>
                    <p><strong className="text-slate-400">જિલ્લો:</strong> {c2.districtGu}</p>
                    <p><strong className="text-slate-400">પ્રખ્યાત:</strong> {c2.famousForGu.join(', ')}</p>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/60 leading-relaxed">{c2.descriptionGu}</p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            પૂર્ણ કરો
          </button>
        </div>
      </div>
    </div>
  );
};

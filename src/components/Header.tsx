import React from 'react';
import { 
  Map, 
  Waves, 
  Mountain as MountainIcon, 
  Building2, 
  Sparkles, 
  BookOpen, 
  GitCompare,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CategoryType } from '../types/gujarat';

interface HeaderProps {
  activeTab: 'map' | 'rivers' | 'mountains' | 'cities' | 'quiz' | 'stateInfo';
  setActiveTab: (tab: 'map' | 'rivers' | 'mountains' | 'cities' | 'quiz' | 'stateInfo') => void;
  onOpenCompare: () => void;
  onOpenStateInfo: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCompare,
  onOpenStateInfo,
  isAudioMuted,
  onToggleAudio,
}) => {
  return (
    <header className="flex items-center justify-between px-4 lg:px-8 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 z-30 sticky top-0">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => setActiveTab('map')} 
        className="cursor-pointer group flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
          <span className="text-slate-950 font-black text-sm">ગુ</span>
        </div>
        <span className="text-lg lg:text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
          ગુજરાત દર્શન 3D
        </span>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'map'
              ? 'text-amber-400 bg-amber-500/10 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>૩ડી નકશો</span>
        </button>

        <button
          onClick={() => setActiveTab('rivers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'rivers'
              ? 'text-sky-400 bg-sky-500/10 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>નદીઓ</span>
        </button>

        <button
          onClick={() => setActiveTab('mountains')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'mountains'
              ? 'text-amber-400 bg-amber-500/10 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MountainIcon className="w-4 h-4" />
          <span>ડુંગરો / પર્વતો</span>
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'cities'
              ? 'text-rose-400 bg-rose-500/10 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>પ્રમુખ શહેરો</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'quiz'
              ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>જ્ઞાન ક્વિઝ</span>
        </button>

        <button
          onClick={onOpenStateInfo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-md transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4" />
          <span>રાજ્ય પરિચય</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAudio}
          title={isAudioMuted ? 'ઑડિયો શરૂ કરો' : 'ઑડિયો બંધ કરો'}
          className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={onOpenCompare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap"
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>સરખામણી</span>
        </button>
      </div>
    </header>
  );
};

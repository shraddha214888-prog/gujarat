import React from 'react';
import { 
  X, 
  BookOpen, 
  Award, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Compass,
  Landmark,
  TreeDeciduous,
  Feather,
  Flower2,
  Cat
} from 'lucide-react';
import { GUJARAT_STATE_FACTS, GUJARAT_IMAGES } from '../data/gujaratData';

interface StateInfoModalProps {
  onClose: () => void;
}

export const StateInfoModal: React.FC<StateInfoModalProps> = ({ onClose }) => {
  const facts = GUJARAT_STATE_FACTS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Scrim */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-950 shrink-0">
          <img
            src={GUJARAT_IMAGES.hero}
            alt="ગુજરાત ગૌરવ દર્શન"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-1">
              રાજ્ય પરિચય અને ભૌગોલિક દર્શન
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              જય જય ગરવી ગુજરાત!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              ભારતના પશ્ચિમ છેડે આવેલું સમૃદ્ધ, ઔદ્યોગિક અને સાંસ્કૃતિક મોભાદાર રાજ્ય
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">સ્થાપના દિન</span>
              <span className="text-sm font-bold text-amber-400">૧ મે, ૧૯૬૦</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">મહાગુજરાત આંદોલન</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">રાજ્ય પાટનગર</span>
              <span className="text-sm font-bold text-emerald-400">ગાંધીનગર</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">હરિયાળું નગર</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">દરિયાકિનારો</span>
              <span className="text-sm font-bold text-sky-400 font-mono tabular-nums">૧,૬૦૦ કિમી</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">ભારતમાં સૌથી લાંબો</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-0.5">કુલ જિલ્લાઓ</span>
              <span className="text-sm font-bold text-rose-400 font-mono tabular-nums">૩૩ જિલ્લા</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">૨૫૨ તાલુકા</span>
            </div>
          </div>

          {/* 4 State Symbols */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>ગુજરાતના અધિકૃત રાજ્ય પ્રતીકો</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facts.symbols.map((sym, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex gap-3 items-start">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    {sym.iconName === 'Cat' && <Cat className="w-4 h-4" />}
                    {sym.iconName === 'Feather' && <Feather className="w-4 h-4" />}
                    {sym.iconName === 'TreeDeciduous' && <TreeDeciduous className="w-4 h-4" />}
                    {sym.iconName === 'Flower2' && <Flower2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-400/90 font-medium">{sym.labelGu}:</span>
                      <span className="text-xs font-bold text-white">{sym.nameGu}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic block">{sym.scientificName}</span>
                    <p className="text-xs text-slate-300 mt-1 leading-normal">{sym.descriptionGu}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNESCO World Heritage Sites */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>યુનેસ્કો (UNESCO) વિશ્વ વારસા સ્થળો</span>
            </h4>

            <div className="space-y-2">
              {facts.unescoSites.map((site, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white">{site.nameGu}</span>
                    <p className="text-xs text-slate-300 mt-0.5">{site.descriptionGu}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                    {site.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographical Divisions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>ગુજરાતના ૫ મુખ્ય ભૌગોલિક પ્રદેશો</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <strong className="text-amber-300 block mb-1">૧. સૌરાષ્ટ્ર (કાઠિયાવાડ - ૧૧ જિલ્લા)</strong>
                <p className="text-slate-300">રાજકોટ, જૂનાગઢ, જામનગર, ભાવનગર, સુરેન્દ્રનગર, પોરબંદર, અમરેલી, બોટાદ, ગીર સોમનાથ, મોરબી, દેવભૂમિ દ્વારકા.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <strong className="text-amber-300 block mb-1">૨. કચ્છ (૧ જિલ્લો)</strong>
                <p className="text-slate-300">વિસ્તારની દ્રષ્ટિએ ભારતનો સૌથી મોટો જિલ્લો, સફેદ રણ (ગ્રેટ રણ), ધોળાવીરા અને કાળો ડુંગર.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <strong className="text-amber-300 block mb-1">૩. મધ્ય ગુજરાત (૮ જિલ્લા)</strong>
                <p className="text-slate-300">અમદાવાદ, વડોદરા, ગાંધીનગર, ખેડા, આણંદ, પંચમહાલ, દાહોદ, મહીસાગર.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <strong className="text-amber-300 block mb-1">૪. દક્ષિણ ગુજરાત (૭ જિલ્લા)</strong>
                <p className="text-slate-300">સુરત, ભરૂચ, નર્મદા, નવસારી, વલસાડ, તાપી, ડાંગ (સાપુતારા હિલ સ્ટેશન).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            બંધ કરો
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GUJARAT_QUIZ } from '../data/gujaratData';

interface GujaratQuizModalProps {
  onClose: () => void;
}

export const GujaratQuizModal: React.FC<GujaratQuizModalProps> = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = GUJARAT_QUIZ[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < GUJARAT_QUIZ.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">ગુજરાત જ્ઞાન કસોટી (Quiz)</h3>
              <p className="text-xs text-slate-400">નદીઓ, પર્વતો અને શહેરો આધારિત પ્રશ્નોત્તરી</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Body */}
        <div className="p-6">
          {!isCompleted ? (
            <div className="space-y-5">
              {/* Progress Bar & Counter */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>પ્રશ્ન {currentIndex + 1} / {GUJARAT_QUIZ.length}</span>
                <span>સ્કોર: <strong className="text-emerald-400 font-mono tabular-nums">{score}</strong></span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / GUJARAT_QUIZ.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.questionGu}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.optionsGu.map((opt, idx) => {
                  let btnStyle = 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700';

                  if (selectedOption === idx && !isAnswerSubmitted) {
                    btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-400 ring-1 ring-amber-400';
                  }

                  if (isAnswerSubmitted) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500 font-semibold';
                    } else if (selectedOption === idx) {
                      btnStyle = 'bg-rose-950/60 text-rose-300 border-rose-500 ring-1 ring-rose-500';
                    } else {
                      btnStyle = 'bg-slate-800/40 text-slate-500 border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && selectedOption === idx && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box after submit */}
              {isAnswerSubmitted && (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1 animate-in fade-in">
                  <span className="font-bold text-amber-400">સમજૂતી:</span>
                  <p className="leading-relaxed">{currentQ.explanationGu}</p>
                </div>
              )}
            </div>
          ) : (
            /* Result Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">અભિનંદન! ક્વિઝ પૂર્ણ થઈ</h4>
              <p className="text-sm text-slate-300">
                તમે {GUJARAT_QUIZ.length} માંથી <span className="font-bold text-emerald-400 font-mono text-base">{score}</span> પ્રશ્નોના સાચા જવાબો આપ્યા!
              </p>
              <p className="text-xs text-amber-400/90 font-medium">
                {score >= 7 ? 'અદ્ભુત! તમારું ગુજરાત વિષયક જ્ઞાન પ્રશંસનીય છે!' : 'સરસ પ્રયાસ! ફરીથી પ્રયત્ન કરી પૂરા ગુણ મેળવો.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {!isCompleted ? (
            <>
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors ml-auto shadow-sm"
                >
                  જવાબ ચકાસો
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors ml-auto shadow-sm"
                >
                  {currentIndex < GUJARAT_QUIZ.length - 1 ? 'આગળનો પ્રશ્ન →' : 'પરિણામ જુઓ'}
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ફરીથી રમો</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                સમાપ્ત
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

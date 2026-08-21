import React, { useState } from 'react';
import { OFFICIAL_DEBATE_GUIDE } from '../../types/commissions';
import { BookOpen, X, Sparkles, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface DebateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebateGuideModal: React.FC<DebateGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'thematic' | 'structure'>('thematic');
  const [expandedTopic, setExpandedTopic] = useState<number | null>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0F1A38] border border-mdf-cyan/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-mdf-blue/40 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-mdf-darkBorder mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-mdf-blue/20 border border-mdf-cyan/40 text-mdf-cyan">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Orientaciones y Preguntas de Debate
                </h3>
                <span className="bg-mdf-blue/30 text-mdf-cyan border border-mdf-cyan/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  MDF Juventudes
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documento de trabajo oficial para las 20 comisiones de debate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-mdf-darkBg p-1 rounded-2xl border border-mdf-darkBorder mb-3 gap-1">
          <button
            onClick={() => setActiveTab('thematic')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'thematic'
                ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Ejes Temáticos (5)
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Discusión General
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'structure'
                ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Estructura & Tiempos
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          
          {/* TAB 1: 5 EJES TEMÁTICOS */}
          {activeTab === 'thematic' && (
            <div className="space-y-2.5">
              {OFFICIAL_DEBATE_GUIDE.thematicSections.map((sec, idx) => {
                const isExpanded = expandedTopic === idx;

                return (
                  <div
                    key={idx}
                    className="bg-mdf-darkBg/90 border border-mdf-darkBorder rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedTopic(isExpanded ? null : idx)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-xl bg-mdf-blue/20 border border-mdf-cyan/30 text-mdf-cyan font-black text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white text-sm">{sec.title}</div>
                          {sec.subtitle && (
                            <div className="text-[11px] text-slate-400 font-medium">{sec.subtitle}</div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-mdf-cyan transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-3.5 pt-0 border-t border-slate-800 space-y-3 mt-1">
                        {sec.context && (
                          <div className="p-3 rounded-xl bg-mdf-darkSurface text-slate-300 italic border-l-2 border-mdf-cyan">
                            "{sec.context}"
                          </div>
                        )}

                        <div>
                          <div className="text-[11px] font-bold text-mdf-cyan uppercase tracking-wider mb-2 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Preguntas Disparadoras:</span>
                          </div>
                          <ul className="space-y-1.5 pl-1">
                            {sec.questions.map((q, qIdx) => (
                              <li key={qIdx} className="flex items-start gap-2 text-slate-200 leading-relaxed">
                                <span className="text-mdf-cyan font-bold">•</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: DISCUSIÓN GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              {OFFICIAL_DEBATE_GUIDE.generalSections.map((sec, idx) => (
                <div key={idx} className="bg-mdf-darkBg/90 border border-mdf-darkBorder rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-mdf-cyan" />
                    <h4 className="font-black text-sm text-white">{sec.title}</h4>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {sec.questions.map((q, qIdx) => (
                      <li key={qIdx} className="flex items-start gap-2 text-slate-200 leading-relaxed">
                        <span className="text-mdf-cyan font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ESTRUCTURA & TIEMPOS */}
          {activeTab === 'structure' && (
            <div className="bg-mdf-darkBg/90 border border-mdf-darkBorder rounded-2xl p-4 space-y-3">
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Estructura de Trabajo en cada Comisión</span>
              </h4>

              <ol className="list-decimal list-inside space-y-2.5 text-slate-300 leading-relaxed">
                <li>
                  <strong className="text-white">Equipo por comisión:</strong> 2 moderadores (llevan el debate) y 1 relator (toma apuntes escritos para la síntesis final).
                </li>
                <li>
                  <strong className="text-white">Presentación:</strong> Explicar que todas las 20 comisiones leen el mismo documento, debaten y sintetizan. Al terminar, vamos todos juntos al Domo al acto central.
                </li>
                <li>
                  <strong className="text-white">Regla de los 2 minutos:</strong> Los moderadores abren el intercambio promoviendo que la mayoría tome la palabra. Para evitar discursos aislados, <strong className="text-mdf-cyan">las intervenciones se limitan a no más de 2 minutos</strong>.
                </li>
                <li>
                  <strong className="text-white">Enfoque propositivo:</strong> Controlar el tiempo de cada pregunta para asegurar que surjan propuestas e iniciativas concretas.
                </li>
                <li>
                  <strong className="text-white">Síntesis (Últimos 15 min):</strong> Cuando falten 15 minutos para terminar, el relator leerá en voz alta la síntesis para revisar que no quede nada sin registrar.
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-mdf-darkBorder flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Al terminar el debate: todos al Domo al Acto Central 🏛️
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};

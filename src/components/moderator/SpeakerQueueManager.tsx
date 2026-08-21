import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  CheckCircle, 
  UserX, 
  Trash2, 
  Shuffle, 
  Flame,
  UserPlus,
  Clock,
  Zap,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Speaker, SpeakerStatus, AddExceptionSpeakerPayload } from '../../types/debate';
import { formatDurationHuman } from '../../utils/timeUtils';
import { playFanfareSound } from '../../utils/sound';

interface SpeakerQueueManagerProps {
  speakers: Speaker[];
  lateSpeakers?: Speaker[];
  currentSpeakerIndex: number;
  calculatedSpeakerSeconds: number;
  onSetCurrentSpeaker: (index: number) => void;
  onMoveSpeaker: (speakerId: string, direction: 'UP' | 'DOWN') => void;
  onUpdateStatus: (speakerId: string, status: SpeakerStatus) => void;
  onRemoveSpeaker: (speakerId: string) => void;
  onAddExceptionSpeaker: (payload: AddExceptionSpeakerPayload) => void;
  onAddLateSpeakerToQueue?: (speakerId: string, position: 'END' | 'NEXT') => void;
  onRemoveLateSpeaker?: (speakerId: string) => void;
  onShuffle: () => void;
}

export const SpeakerQueueManager: React.FC<SpeakerQueueManagerProps> = ({
  speakers,
  lateSpeakers = [],
  currentSpeakerIndex,
  calculatedSpeakerSeconds,
  onSetCurrentSpeaker,
  onMoveSpeaker,
  onUpdateStatus,
  onRemoveSpeaker,
  onAddExceptionSpeaker,
  onAddLateSpeakerToQueue,
  onRemoveLateSpeaker,
  onShuffle
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'late'>('official');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionName, setExceptionName] = useState('');
  const [exceptionOrg, setExceptionOrg] = useState('');
  const [exceptionPos, setExceptionPos] = useState<'NEXT' | 'END'>('NEXT');
  const [isShuffling, setIsShuffling] = useState(false);

  // Filtrado de búsqueda para lista oficial
  const filteredSpeakers = speakers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.organization && s.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtrado para lista posterior
  const filteredLateSpeakers = lateSpeakers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.organization && s.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Estadísticas
  const waitingCount = speakers.filter((s) => s.status === 'WAITING').length;
  const doneCount = speakers.filter((s) => s.status === 'DONE').length;
  const absentCount = speakers.filter((s) => s.status === 'ABSENT').length;

  // Manejador del Sorteo con Confeti y Efecto
  const handleShuffleClick = () => {
    setIsShuffling(true);
    playFanfareSound();
    
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0052FF', '#00D2FF', '#FFFFFF', '#10B981']
    });

    setTimeout(() => {
      onShuffle();
      setIsShuffling(false);
    }, 600);
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionName.trim()) return;

    onAddExceptionSpeaker({
      name: exceptionName.trim(),
      organization: exceptionOrg.trim() || undefined,
      insertPosition: exceptionPos
    });

    setExceptionName('');
    setExceptionOrg('');
    setShowExceptionModal(false);
  };

  const getStatusBadge = (speaker: Speaker, index: number) => {
    if (index === currentSpeakerIndex && speaker.status === 'SPEAKING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-mdf-blue text-white shadow-md shadow-mdf-blue/40 border border-mdf-cyan animate-pulse">
          <Flame className="w-3 h-3 text-mdf-cyan" /> Hablando
        </span>
      );
    }
    if (speaker.status === 'DONE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
          <CheckCircle className="w-3 h-3" /> Expuso
        </span>
      );
    }
    if (speaker.status === 'ABSENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-800/40">
          <UserX className="w-3 h-3" /> Ausente
        </span>
      );
    }
    if (speaker.isException) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40">
          Excepción
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300">
        En espera
      </span>
    );
  };

  return (
    <div className="bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
      
      {/* Header con Pestañas de Lista Oficial y Se agregaron después */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-mdf-darkBorder">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-mdf-blue/20 text-mdf-cyan border border-mdf-cyan/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Gestión de Oradores
            </h2>
            <p className="text-xs text-slate-400">
              Tiempo: <strong className="text-white font-mono">{formatDurationHuman(calculatedSpeakerSeconds)}</strong> por orador
            </p>
          </div>
        </div>

        {/* Action Buttons: Sorteo & Agregar Excepción */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShuffleClick}
            disabled={speakers.length === 0 || isShuffling}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-mdf-blue to-mdf-cyan text-slate-950 font-black text-xs shadow-lg shadow-mdf-blue/30 hover:opacity-95 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            title="Mezclar y ordenar aleatoriamente con Fisher-Yates"
          >
            <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'Sorteando...' : 'Sortear Lista'}</span>
          </button>

          <button
            onClick={() => setShowExceptionModal(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-mdf-darkBg hover:bg-slate-800 border border-mdf-darkBorder text-slate-200 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-mdf-cyan" />
            <span>+ Excepción</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector: Lista Oficial vs Se agregaron después */}
      <div className="flex bg-mdf-darkBg p-1 rounded-2xl border border-mdf-darkBorder gap-1">
        <button
          onClick={() => setActiveTab('official')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'official'
              ? 'bg-mdf-blue text-white shadow-md shadow-mdf-blue/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📋 Lista Oficial</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] ${
            activeTab === 'official' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            {speakers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('late')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'late'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Se agregaron después</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
            lateSpeakers.length > 0
              ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {lateSpeakers.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LISTA OFICIAL */}
      {activeTab === 'official' && (
        <>
          {/* Metrics mini banner */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-mdf-darkBg/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Pendientes</span>
              <span className="font-bold text-mdf-cyan font-mono text-sm">{waitingCount}</span>
            </div>
            <div className="bg-mdf-darkBg/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Expusieron</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{doneCount}</span>
            </div>
            <div className="bg-mdf-darkBg/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Ausentes</span>
              <span className="font-bold text-red-400 font-mono text-sm">{absentCount}</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar orador por nombre o agrupación..."
              className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Lista de Oradores Oficiales */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredSpeakers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                {speakers.length === 0 
                  ? 'No hay oradores inscriptos aún. Abre la lista para que se sumen con el QR.'
                  : 'No se encontraron oradores con ese criterio de búsqueda.'}
              </div>
            ) : (
              filteredSpeakers.map((speaker) => {
                const originalIndex = speakers.findIndex((s) => s.id === speaker.id);
                const isCurrent = originalIndex === currentSpeakerIndex;

                return (
                  <div
                    key={speaker.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-mdf-blue/20 border-mdf-cyan/60 shadow-lg shadow-mdf-blue/20'
                        : speaker.status === 'DONE'
                        ? 'bg-slate-900/40 border-slate-800/40 opacity-70'
                        : 'bg-mdf-darkBg border-mdf-darkBorder hover:border-slate-700'
                    }`}
                  >
                    {/* Posición & Información */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black font-mono flex-shrink-0 ${
                        isCurrent 
                          ? 'bg-mdf-blue text-white ring-2 ring-mdf-cyan' 
                          : 'bg-mdf-darkSurface text-slate-400 border border-slate-700'
                      }`}>
                        #{speaker.order}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-sm truncate ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                            {speaker.name}
                          </span>
                          {getStatusBadge(speaker, originalIndex)}
                        </div>
                        {speaker.organization && (
                          <div className="text-xs text-mdf-cyan/90 truncate font-medium">
                            {speaker.organization}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones de Moderación */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onSetCurrentSpeaker(originalIndex)}
                        disabled={isCurrent}
                        className={`p-2 rounded-xl transition-colors ${
                          isCurrent
                            ? 'bg-mdf-blue text-white'
                            : 'bg-mdf-darkSurface hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-mdf-darkBorder'
                        }`}
                        title="Iniciar turno de este orador"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onMoveSpeaker(speaker.id, 'UP')}
                        disabled={originalIndex === 0}
                        className="p-2 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-mdf-darkBorder disabled:opacity-20 disabled:pointer-events-none transition-colors"
                        title="Subir posición"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onMoveSpeaker(speaker.id, 'DOWN')}
                        disabled={originalIndex === speakers.length - 1}
                        className="p-2 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-mdf-darkBorder disabled:opacity-20 disabled:pointer-events-none transition-colors"
                        title="Bajar posición"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onUpdateStatus(speaker.id, speaker.status === 'DONE' ? 'WAITING' : 'DONE')}
                        className={`p-2 rounded-xl border transition-colors ${
                          speaker.status === 'DONE'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40 hover:bg-slate-800'
                            : 'bg-mdf-darkSurface text-slate-400 hover:text-emerald-400 border-mdf-darkBorder'
                        }`}
                        title={speaker.status === 'DONE' ? 'Marcar como pendiente' : 'Marcar como expuesto'}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onUpdateStatus(speaker.id, speaker.status === 'ABSENT' ? 'WAITING' : 'ABSENT')}
                        className={`p-2 rounded-xl border transition-colors ${
                          speaker.status === 'ABSENT'
                            ? 'bg-red-950/60 text-red-400 border-red-800/40 hover:bg-slate-800'
                            : 'bg-mdf-darkSurface text-slate-400 hover:text-red-400 border-mdf-darkBorder'
                        }`}
                        title={speaker.status === 'ABSENT' ? 'Quitar ausente' : 'Marcar como ausente'}
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar a ${speaker.name} de la lista de oradores?`)) {
                            onRemoveSpeaker(speaker.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-mdf-darkSurface hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-mdf-darkBorder transition-colors"
                        title="Eliminar orador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* TAB 2: SE AGREGARON DESPUÉS PARA HABLAR */}
      {activeTab === 'late' && (
        <div className="space-y-3">
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block font-bold">Listado Complementario (Fuera de término)</strong>
              <span>
                Personas que se anotaron desde su celular después del cierre de lista oficial o sorteo. Puedes sumarlas al debate si dispones de tiempo.
              </span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en agregados posteriores..."
              className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Lista de Oradores Posteriores */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredLateSpeakers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                {lateSpeakers.length === 0 
                  ? 'No hay personas anotadas fuera de lista por el momento.' 
                  : 'No se encontraron resultados.'}
              </div>
            ) : (
              filteredLateSpeakers.map((speaker, idx) => {
                const regDate = new Date(speaker.registeredAt);
                const timeStr = regDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={speaker.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-mdf-darkBg border border-amber-500/20 hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black font-mono flex-shrink-0 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        #{idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">
                          {speaker.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {speaker.organization && (
                            <span className="text-mdf-cyan font-medium truncate">{speaker.organization}</span>
                          )}
                          {speaker.organization && <span>•</span>}
                          <span className="text-slate-400">Anotado: {timeStr}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones para sumar o descartar */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onAddLateSpeakerToQueue?.(speaker.id, 'NEXT')}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/40 transition-all active:scale-95"
                        title="Sumar como siguiente orador en la lista oficial"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Pasar Siguiente</span>
                      </button>

                      <button
                        onClick={() => onAddLateSpeakerToQueue?.(speaker.id, 'END')}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-bold text-xs shadow-md shadow-mdf-blue/30 transition-all active:scale-95"
                        title="Sumar al final de la lista oficial"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Sumar al Final</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`¿Quitar a ${speaker.name} del listado complementario?`)) {
                            onRemoveLateSpeaker?.(speaker.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-mdf-darkSurface hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-mdf-darkBorder transition-colors"
                        title="Descartar de la lista complementaria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal para Agregar Orador por Excepción */}
      {showExceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-mdf-cyan" />
              <span>Agregar Orador por Excepción</span>
            </h3>
            <p className="text-xs text-slate-400">
              Permite insertar un invitado, autoridad o referente sin alterar el orden del resto.
            </p>

            <form onSubmit={handleAddException} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={exceptionName}
                  onChange={(e) => setExceptionName(e.target.value)}
                  placeholder="Ej: Axel Kicillof"
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Organización / Cargo (Opcional)
                </label>
                <input
                  type="text"
                  value={exceptionOrg}
                  onChange={(e) => setExceptionOrg(e.target.value)}
                  placeholder="Ej: Gobernador / MDF Juventudes"
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Posición de Inserción
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExceptionPos('NEXT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      exceptionPos === 'NEXT'
                        ? 'bg-mdf-blue text-white border-mdf-cyan shadow-md shadow-mdf-blue/30'
                        : 'bg-mdf-darkBg text-slate-400 border-mdf-darkBorder hover:bg-slate-800'
                    }`}
                  >
                    ⚡ Como Siguiente
                  </button>
                  <button
                    type="button"
                    onClick={() => setExceptionPos('END')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      exceptionPos === 'END'
                        ? 'bg-mdf-blue text-white border-mdf-cyan shadow-md shadow-mdf-blue/30'
                        : 'bg-mdf-darkBg text-slate-400 border-mdf-darkBorder hover:bg-slate-800'
                    }`}
                  >
                    ➕ Al Final
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExceptionModal(false)}
                  className="flex-1 py-2 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Agregar Orador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

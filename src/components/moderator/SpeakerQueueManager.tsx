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
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Speaker, SpeakerStatus, AddExceptionSpeakerPayload } from '../../types/debate';
import { formatDurationHuman } from '../../utils/timeUtils';
import { playFanfareSound } from '../../utils/sound';

interface SpeakerQueueManagerProps {
  speakers: Speaker[];
  currentSpeakerIndex: number;
  calculatedSpeakerSeconds: number;
  onSetCurrentSpeaker: (index: number) => void;
  onMoveSpeaker: (speakerId: string, direction: 'UP' | 'DOWN') => void;
  onUpdateStatus: (speakerId: string, status: SpeakerStatus) => void;
  onRemoveSpeaker: (speakerId: string) => void;
  onAddExceptionSpeaker: (payload: AddExceptionSpeakerPayload) => void;
  onShuffle: () => void;
}

export const SpeakerQueueManager: React.FC<SpeakerQueueManagerProps> = ({
  speakers,
  currentSpeakerIndex,
  calculatedSpeakerSeconds,
  onSetCurrentSpeaker,
  onMoveSpeaker,
  onUpdateStatus,
  onRemoveSpeaker,
  onAddExceptionSpeaker,
  onShuffle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionName, setExceptionName] = useState('');
  const [exceptionOrg, setExceptionOrg] = useState('');
  const [exceptionPos, setExceptionPos] = useState<'NEXT' | 'END'>('NEXT');
  const [isShuffling, setIsShuffling] = useState(false);

  // Filtrado de búsqueda
  const filteredSpeakers = speakers.filter(
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
    
    // Disparar confeti
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

    switch (speaker.status) {
      case 'DONE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">Finalizado</span>;
      case 'ABSENT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/60 text-red-400 border border-red-900/40">Ausente</span>;
      case 'SKIPPED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-900/40">Salteado</span>;
      case 'WAITING':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-mdf-cyan/10 text-mdf-cyan border border-mdf-cyan/20">En espera</span>;
    }
  };

  return (
    <div className="bg-mdf-darkSurface/90 border border-mdf-darkBorder rounded-3xl p-4 md:p-6 shadow-xl space-y-4">
      
      {/* Header con Título, Métricas y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-mdf-cyan" />
            <h3 className="text-lg font-bold text-white">Lista de Oradores</h3>
            <span className="bg-mdf-blue/20 text-mdf-cyan border border-mdf-cyan/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {speakers.length} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tiempo asignado: <strong className="text-white font-mono">{formatDurationHuman(calculatedSpeakerSeconds)}</strong> por orador
          </p>
        </div>

        {/* Action Buttons: Sorteo & Agregar Excepción */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShuffleClick}
            disabled={speakers.length === 0 || isShuffling}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-mdf-blue to-mdf-cyan text-slate-950 font-black text-xs shadow-lg shadow-mdf-blue/30 hover:opacity-95 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            title="Mezclar y ordenar aleatoriamente con Fisher-Yates"
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{isShuffling ? 'Sorteando...' : 'Sortear Lista (Random)'}</span>
          </button>

          <button
            onClick={() => setShowExceptionModal(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-mdf-darkBg hover:bg-slate-800 border border-mdf-darkBorder text-slate-200 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4 text-mdf-cyan" />
            <span>+ Excepción</span>
          </button>
        </div>
      </div>

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
          placeholder="Buscar por nombre o bloque..."
          className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500"
        />
      </div>

      {/* Lista de Oradores */}
      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
        {filteredSpeakers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            {speakers.length === 0 
              ? 'No hay oradores inscriptos aún. Abre la inscripción para que se sumen con el QR.'
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
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{speaker.name}</span>
                      {speaker.isException && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-semibold uppercase">
                          Excepción
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                      {speaker.organization && (
                        <span className="text-mdf-cyan truncate">{speaker.organization}</span>
                      )}
                      <span>•</span>
                      {getStatusBadge(speaker, originalIndex)}
                    </div>
                  </div>
                </div>

                {/* Acciones del orador */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  
                  {/* Play / Poner a hablar */}
                  <button
                    onClick={() => onSetCurrentSpeaker(originalIndex)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-mdf-blue text-white'
                        : 'bg-mdf-darkSurface hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-400'
                    }`}
                    title="Asignar palabra ahora"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Move Up */}
                  <button
                    onClick={() => onMoveSpeaker(speaker.id, 'UP')}
                    disabled={originalIndex === 0}
                    className="p-1.5 rounded-lg bg-mdf-darkSurface hover:bg-slate-700 disabled:opacity-20 text-slate-400 hover:text-white"
                    title="Subir posición"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => onMoveSpeaker(speaker.id, 'DOWN')}
                    disabled={originalIndex === speakers.length - 1}
                    className="p-1.5 rounded-lg bg-mdf-darkSurface hover:bg-slate-700 disabled:opacity-20 text-slate-400 hover:text-white"
                    title="Bajar posición"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Mark as Done */}
                  <button
                    onClick={() => onUpdateStatus(speaker.id, speaker.status === 'DONE' ? 'WAITING' : 'DONE')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      speaker.status === 'DONE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-mdf-darkSurface hover:bg-emerald-950 text-slate-400 hover:text-emerald-400'
                    }`}
                    title="Marcar como finalizado"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>

                  {/* Mark Absent */}
                  <button
                    onClick={() => onUpdateStatus(speaker.id, speaker.status === 'ABSENT' ? 'WAITING' : 'ABSENT')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      speaker.status === 'ABSENT'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-mdf-darkSurface hover:bg-red-950 text-slate-400 hover:text-red-400'
                    }`}
                    title="Marcar como ausente"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveSpeaker(speaker.id)}
                    className="p-1.5 rounded-lg bg-mdf-darkSurface hover:bg-red-900/50 text-slate-500 hover:text-red-300"
                    title="Eliminar de la lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal para Agregar Orador de Excepción */}
      {showExceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-1">Agregar Orador de Excepción</h4>
            <p className="text-xs text-slate-400 mb-4">
              Inscribe a un orador manualmente fuera de la lista regular de sorteo.
            </p>

            <form onSubmit={handleAddException} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={exceptionName}
                  onChange={(e) => setExceptionName(e.target.value)}
                  placeholder="Ej: Invitado Especial / Referente"
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bloque / Organización (Opcional)</label>
                <input
                  type="text"
                  value={exceptionOrg}
                  onChange={(e) => setExceptionOrg(e.target.value)}
                  placeholder="Ej: Mesa Nacional / Asesoría"
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Posición en la lista</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExceptionPos('NEXT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      exceptionPos === 'NEXT'
                        ? 'bg-mdf-blue text-white border-mdf-cyan shadow-md'
                        : 'bg-mdf-darkBg text-slate-400 border-slate-800'
                    }`}
                  >
                    Próximo a Hablar
                  </button>
                  <button
                    type="button"
                    onClick={() => setExceptionPos('END')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      exceptionPos === 'END'
                        ? 'bg-mdf-blue text-white border-mdf-cyan shadow-md'
                        : 'bg-mdf-darkBg text-slate-400 border-slate-800'
                    }`}
                  >
                    Al Final de la Lista
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExceptionModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-mdf-darkSurface text-slate-400 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white text-xs font-bold shadow-lg shadow-mdf-blue/30"
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

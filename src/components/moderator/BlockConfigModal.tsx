import React, { useState } from 'react';
import { Settings, X, Save, Clock, Lock } from 'lucide-react';
import { DebateSession } from '../../types/debate';
import { formatDurationHuman } from '../../utils/timeUtils';

interface BlockConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: DebateSession;
  onSave: (config: {
    title: string;
    description: string;
    totalBlockMinutes: number;
    minSpeakerSeconds: number;
    maxSpeakerSeconds: number;
    adminPin: string;
  }) => void;
}

export const BlockConfigModal: React.FC<BlockConfigModalProps> = ({
  isOpen,
  onClose,
  session,
  onSave
}) => {
  const [title, setTitle] = useState(session.title);
  const [description, setDescription] = useState(session.description || '');
  const [totalBlockMinutes, setTotalBlockMinutes] = useState(session.totalBlockMinutes || 45);
  const [minSpeakerSeconds, setMinSpeakerSeconds] = useState(session.minSpeakerSeconds || 60);
  const [maxSpeakerSeconds, setMaxSpeakerSeconds] = useState(session.maxSpeakerSeconds || 300);
  const [adminPin, setAdminPin] = useState(session.adminPin || '1234');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || 'Debate MDF Juventudes',
      description: description.trim(),
      totalBlockMinutes: Number(totalBlockMinutes) || 45,
      minSpeakerSeconds: Number(minSpeakerSeconds) || 60,
      maxSpeakerSeconds: Number(maxSpeakerSeconds) || 300,
      adminPin: adminPin.trim() || '1234'
    });
    onClose();
  };

  // Previsualización de cálculo
  const previewCounts = [5, 10, 15, 25, 40];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-mdf-blue/40 overflow-y-auto max-h-[90vh]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2.5 rounded-xl bg-mdf-blue/20 border border-mdf-cyan/40 text-mdf-cyan">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Configuración del Bloque</h3>
            <p className="text-xs text-slate-400">Define el tema, tiempos totales y límites por orador</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Título del Tema */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Título del Tema / Bloque
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Lanzamiento MDF Juventudes - Bloque Propuestas"
              className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan focus:ring-1 focus:ring-mdf-cyan rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Descripción u Observaciones (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas generales, moderadores a cargo o pautas del debate..."
              className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan focus:ring-1 focus:ring-mdf-cyan rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Parámetros de Tiempo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tiempo Total Bloque
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="240"
                  required
                  value={totalBlockMinutes}
                  onChange={(e) => setTotalBlockMinutes(Number(e.target.value))}
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-2 text-sm text-white pr-10"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">min</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Mínimo / Orador
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="15"
                  required
                  value={minSpeakerSeconds}
                  onChange={(e) => setMinSpeakerSeconds(Number(e.target.value))}
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-2 text-sm text-white pr-8"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">s</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Máximo / Orador
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="60"
                  max="600"
                  step="30"
                  required
                  value={maxSpeakerSeconds}
                  onChange={(e) => setMaxSpeakerSeconds(Number(e.target.value))}
                  className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-2 text-sm text-white pr-8"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">s</span>
              </div>
            </div>
          </div>

          {/* Simulador / Preview automático */}
          <div className="bg-mdf-darkBg/80 border border-mdf-darkBorder rounded-2xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-mdf-cyan mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Simulación de Tiempo Calculado Automáticamente:</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {previewCounts.map((count) => {
                const totalSec = totalBlockMinutes * 60;
                let calculated = Math.floor(totalSec / count);
                calculated = Math.round(calculated / 15) * 15;
                if (calculated < minSpeakerSeconds) calculated = minSpeakerSeconds;
                if (calculated > maxSpeakerSeconds) calculated = maxSpeakerSeconds;

                return (
                  <div key={count} className="bg-mdf-darkSurface p-1.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">{count} oradores</div>
                    <div className="text-xs font-bold text-white font-mono">{formatDurationHuman(calculated)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PIN de Moderación */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-mdf-cyan" />
              <span>PIN de Moderación (Admin)</span>
            </label>
            <input
              type="text"
              required
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="1234"
              className="w-full max-w-xs bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-4 py-2 text-sm text-white font-mono"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-semibold text-sm shadow-lg shadow-mdf-blue/40 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

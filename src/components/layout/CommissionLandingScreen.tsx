import React, { useState } from 'react';
import { DEFAULT_COMMISSIONS } from '../../types/commissions';
import { ArrowRight, Shield, Tv } from 'lucide-react';

interface CommissionLandingScreenProps {
  onSelectCommission: (commissionId: string, role?: 'participant' | 'moderator' | 'projector') => void;
  onRequestAdminAccess?: () => void;
}

export const CommissionLandingScreen: React.FC<CommissionLandingScreenProps> = ({
  onSelectCommission,
  onRequestAdminAccess
}) => {
  const [customCode, setCustomCode] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCode.trim().toUpperCase().replace(/\s+/g, '-');
    if (clean) {
      onSelectCommission(clean);
    }
  };

  return (
    <div className="min-h-screen bg-[#080E21] text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-mdf-blue/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-mdf-cyan/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header MDF Juventudes */}
      <div className="max-w-xl mx-auto w-full pt-4 sm:pt-8 text-center z-10">
        
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-mdf-blue p-1.5 shadow-xl shadow-mdf-blue/40 border border-mdf-cyan/40 mb-3">
          <img 
            src="/mdf-logo.jpg" 
            alt="MDF Juventudes" 
            className="h-full w-full object-cover rounded-xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mdf-blue/20 border border-mdf-cyan/30 text-mdf-cyan text-xs font-bold mb-2">
          <span className="h-2 w-2 rounded-full bg-mdf-cyan animate-ping" />
          Lanzamiento MDF Juventudes
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿En qué comisión estás?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Toca el número de tu salón para anotarte en la lista de oradores y seguir el debate en vivo
        </p>
      </div>

      {/* Grid de las 15 Comisiones */}
      <div className="max-w-lg mx-auto w-full my-6 z-10">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {DEFAULT_COMMISSIONS.map((comm, idx) => {
            const num = idx + 1;
            return (
              <button
                key={comm.id}
                onClick={() => onSelectCommission(comm.id)}
                className="group p-3.5 sm:p-4 rounded-2xl bg-mdf-darkSurface/90 hover:bg-mdf-blue border border-mdf-darkBorder hover:border-mdf-cyan text-center transition-all duration-150 active:scale-95 hover:shadow-xl hover:shadow-mdf-blue/40 flex flex-col items-center justify-center min-h-[84px]"
              >
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-cyan-200 uppercase tracking-wider">
                  Comisión
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white group-hover:scale-110 transition-transform">
                  {num}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ingresar Código Libre */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <form onSubmit={handleCustomSubmit} className="flex gap-2 items-center">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="O escribe otro número / código de sala (ej: 16)"
              className="flex-1 bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 border border-mdf-darkBorder text-mdf-cyan hover:text-white text-xs font-bold transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Footer con Accesos Especiales e Instructivos PDF */}
      <div className="max-w-xl mx-auto w-full pb-4 text-center z-10 border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={onRequestAdminAccess}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800/40"
          >
            <Shield className="w-3.5 h-3.5 text-mdf-cyan" />
            <span>Acceso Moderador</span>
          </button>

          <span>•</span>

          <button
            onClick={() => onSelectCommission('COMISION-1', 'projector')}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800/40"
          >
            <Tv className="w-3.5 h-3.5 text-mdf-cyan" />
            <span>Vista Proyector</span>
          </button>
        </div>

        <span className="hidden sm:inline text-slate-700">•</span>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <a
            href="/MANUAL_PARTICIPANTE_MDF_JUVENTUDES.pdf"
            target="_blank"
            rel="noreferrer"
            className="hover:text-mdf-cyan underline underline-offset-2 transition-colors"
          >
            Manual Participante (PDF)
          </a>
          <span>•</span>
          <a
            href="/MANUAL_MODERADOR_MDF_JUVENTUDES.pdf"
            target="_blank"
            rel="noreferrer"
            className="hover:text-mdf-cyan underline underline-offset-2 transition-colors"
          >
            Manual Moderador (PDF)
          </a>
        </div>
      </div>

    </div>
  );
};

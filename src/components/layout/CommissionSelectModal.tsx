import React, { useState } from 'react';
import { DEFAULT_COMMISSIONS } from '../../types/commissions';
import { X, Search, Check, Layers, Plus } from 'lucide-react';

interface CommissionSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCommissionId: string;
  onSelectCommission: (commissionId: string) => void;
}

export const CommissionSelectModal: React.FC<CommissionSelectModalProps> = ({
  isOpen,
  onClose,
  currentCommissionId,
  onSelectCommission
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customCode, setCustomCode] = useState('');

  if (!isOpen) return null;

  const filteredCommissions = DEFAULT_COMMISSIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCode.trim().toUpperCase().replace(/\s+/g, '-');
    if (clean) {
      onSelectCommission(clean);
      setCustomCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-mdf-blue/40 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mdf-darkBorder mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-mdf-blue/20 border border-mdf-cyan/40 text-mdf-cyan">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Seleccionar Comisión</h3>
              <p className="text-xs text-slate-400">
                Elige en cuál de las 20 comisiones de debate te encuentras participando
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

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar comisión por número (ej: 1, 2, 20)..."
            className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Grid de las 20 Comisiones */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-2.5">
            {filteredCommissions.map((comm) => {
              const isSelected = currentCommissionId.toUpperCase() === comm.id.toUpperCase();

              return (
                <button
                  key={comm.id}
                  onClick={() => {
                    onSelectCommission(comm.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl text-center transition-all border flex flex-col items-center justify-center gap-1 min-h-[72px] ${
                    isSelected
                      ? 'bg-mdf-blue text-white border-mdf-cyan shadow-lg shadow-mdf-blue/40 ring-2 ring-mdf-cyan'
                      : 'bg-mdf-darkBg/90 hover:bg-slate-800/80 border-mdf-darkBorder text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                    {comm.name}
                  </span>
                  
                  {isSelected ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-mdf-cyan">
                      <Check className="w-3 h-3" /> Activa
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{comm.id.replace('COMISION-', 'C')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filteredCommissions.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No se encontró esa comisión.
            </div>
          )}
        </div>

        {/* Ingresar Código Libre / Personalizado */}
        <div className="pt-3 border-t border-mdf-darkBorder">
          <form onSubmit={handleCustomSubmit} className="flex gap-2 items-center">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="O escribe otro número o sala (ej: COMISION-16)"
              className="flex-1 bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 border border-mdf-darkBorder text-mdf-cyan hover:text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

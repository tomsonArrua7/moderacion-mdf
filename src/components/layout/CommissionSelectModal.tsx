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
      c.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="relative w-full max-w-2xl bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-mdf-blue/40 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mdf-darkBorder mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-mdf-blue/20 border border-mdf-cyan/40 text-mdf-cyan">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Seleccionar Comisión</h3>
              <p className="text-xs text-slate-400">
                Elige en cuál de las 15 comisiones de debate te encuentras participando
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
            placeholder="Buscar comisión por número, nombre o tema..."
            className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Grid de Comisiones */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredCommissions.map((comm) => {
              const isSelected = currentCommissionId === comm.id;

              return (
                <button
                  key={comm.id}
                  onClick={() => {
                    onSelectCommission(comm.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-mdf-blue text-white border-mdf-cyan shadow-lg shadow-mdf-blue/40 ring-1 ring-mdf-cyan'
                      : 'bg-mdf-darkBg/90 hover:bg-slate-800/80 border-mdf-darkBorder text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-mdf-cyan'}`}>
                      {comm.name}
                    </span>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-white text-mdf-blue">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium line-clamp-2 text-slate-200">
                    {comm.topic}
                  </div>
                  <div className={`text-[10px] mt-2 font-mono ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    Código: #{comm.id}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredCommissions.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No se encontraron comisiones predefinidas con esa búsqueda.
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
              placeholder="O escribe otro código de comisión (ej: MESA-SALUD-A)"
              className="flex-1 bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 border border-mdf-darkBorder text-mdf-cyan hover:text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

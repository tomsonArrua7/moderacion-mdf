import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { DebateSession } from '../../types/debate';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: DebateSession;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, session }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // URL para los participantes
  const participantUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/?session=${session.id}&role=participant`
    : `https://mdf-juventudes.app/?session=${session.id}&role=participant`;

  const handleCopy = () => {
    navigator.clipboard.writeText(participantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-mdf-blue/40 text-center overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-mdf-blue/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-mdf-cyan/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with MDF Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-mdf-blue p-1 flex items-center justify-center border border-mdf-cyan/40">
              <img src="/mdf-logo.jpg" alt="MDF" className="h-full w-full object-cover rounded" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">MDF <span className="text-mdf-cyan font-semibold text-sm">JUVENTUDES</span></span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Escanear para Anotarse</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Apunta la cámara de tu teléfono móvil al código QR para ingresar a la comisión
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative inline-block p-4 bg-white rounded-2xl shadow-xl shadow-black/50 mb-6">
          <QRCodeSVG
            value={participantUrl}
            size={220}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "/mdf-logo.jpg",
              x: undefined,
              y: undefined,
              height: 42,
              width: 42,
              excavate: true,
            }}
          />
        </div>

        {/* Session Code & URL Info */}
        <div className="bg-mdf-darkBg/90 border border-mdf-darkBorder rounded-xl p-3 mb-5 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Código de Sesión:</span>
            <span className="font-mono font-bold text-mdf-cyan bg-mdf-cyan/10 px-2 py-0.5 rounded border border-mdf-cyan/30">
              {session.id}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300 truncate select-all">
            {participantUrl}
          </div>
        </div>

        {/* Actions: Copy & Open */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-mdf-darkSurface hover:bg-slate-800 border border-mdf-darkBorder text-slate-200 font-semibold text-sm transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-mdf-cyan" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <a
            href={participantUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-semibold text-sm shadow-lg shadow-mdf-blue/30 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Abrir</span>
          </a>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Compatible con cualquier navegador móvil (Chrome, Safari, etc.)</span>
        </div>

      </div>
    </div>
  );
};

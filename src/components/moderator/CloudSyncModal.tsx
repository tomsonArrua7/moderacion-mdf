import React, { useState, useEffect } from 'react';
import { Cloud, X, Check, Save, ExternalLink, Sparkles, Clipboard } from 'lucide-react';
import { getStoredFirebaseConfig, saveStoredFirebaseConfig, FirebaseConfig } from '../../services/firebase';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: FirebaseConfig) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [databaseURL, setDatabaseURL] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [rawSnippet, setRawSnippet] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const current = getStoredFirebaseConfig();
    if (current) {
      setApiKey(current.apiKey || '');
      setDatabaseURL(current.databaseURL || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-parsear si pega el código entero de Firebase
  const handlePasteSnippet = (text: string) => {
    setRawSnippet(text);

    // Buscar databaseURL
    const dbMatch = text.match(/databaseURL:\s*["']([^"']+)["']/);
    if (dbMatch) setDatabaseURL(dbMatch[1]);

    // Buscar apiKey
    const apiMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
    if (apiMatch) setApiKey(apiMatch[1]);

    // Buscar projectId
    const projectMatch = text.match(/projectId:\s*["']([^"']+)["']/);
    if (projectMatch && !dbMatch) {
      setDatabaseURL(`https://${projectMatch[1]}-default-rtdb.firebaseio.com`);
    }

    // Si es directamente una URL
    if (text.trim().startsWith('https://') && text.includes('firebaseio.com')) {
      setDatabaseURL(text.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!databaseURL.trim()) return;

    let cleanUrl = databaseURL.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim() || 'AIzaSyDefaultMdfKey',
      databaseURL: cleanUrl,
      projectId: cleanUrl.replace('https://', '').split('.')[0] || 'mdf-moderacion',
      authDomain: 'mdf-moderacion.firebaseapp.com',
      appId: '1:mdf:web:app'
    };

    saveStoredFirebaseConfig(config);
    onConfigSaved(config);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-mdf-blue/40 overflow-y-auto max-h-[90vh]">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-xl bg-mdf-blue/20 border border-mdf-cyan/40 text-mdf-cyan">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Sincronización en Tiempo Real</h3>
            <p className="text-xs text-slate-400">Conecta Firebase para sincronizar todos los teléfonos en Vercel</p>
          </div>
        </div>

        {/* Guía simple paso a paso */}
        <div className="bg-mdf-darkBg/90 border border-mdf-darkBorder rounded-2xl p-4 mb-4 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-mdf-cyan flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>¿Dónde encontrar los datos en Firebase?</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
            <li>
              Entra a <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-mdf-cyan underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a> y entra a tu proyecto.
            </li>
            <li>
              En el menú lateral haz clic en <strong>Realtime Database</strong> $\rightarrow$ <strong>Crear base de datos</strong> (en <em>Modo de prueba</em>).
            </li>
            <li>
              Copia la <strong>URL</strong> que aparece arriba (ej: <code className="text-mdf-cyan bg-slate-800 px-1.5 py-0.5 rounded font-mono">https://tu-proyecto-default-rtdb.firebaseio.com</code>) y pégala aquí abajo.
            </li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Opción Rápida: Pegar cualquier URL o bloque */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center justify-between">
              <span>URL de la Base de Datos (Firebase Realtime Database)</span>
              <span className="text-[10px] text-emerald-400 font-normal">Obligatorio</span>
            </label>
            <input
              type="text"
              required
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              placeholder="https://tu-proyecto-default-rtdb.firebaseio.com"
              className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono"
            />
          </div>

          {/* Pegado Inteligente */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Clipboard className="w-3 h-3 text-mdf-cyan" />
              <span>O pega aquí el objeto de configuración que te dio Firebase:</span>
            </label>
            <textarea
              rows={2}
              value={rawSnippet}
              onChange={(e) => handlePasteSnippet(e.target.value)}
              placeholder='Pega aquí: const firebaseConfig = { databaseURL: "...", apiKey: "..." };'
              className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 font-mono"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-mdf-darkSurface text-slate-400 text-xs font-semibold hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-bold text-xs shadow-lg shadow-mdf-blue/40 transition-all active:scale-95"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Conectado con Éxito!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar y Sincronizar</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

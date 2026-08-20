import React, { useState, useEffect } from 'react';
import { Cloud, X, Check, Save, ExternalLink, Sparkles } from 'lucide-react';
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
  const [apiKey, setApiKey] = useState('');
  const [databaseURL, setDatabaseURL] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const current = getStoredFirebaseConfig();
    if (current) {
      setApiKey(current.apiKey || '');
      setDatabaseURL(current.databaseURL || '');
      setProjectId(current.projectId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || (!databaseURL.trim() && !projectId.trim())) return;

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      databaseURL: databaseURL.trim() || `https://${projectId.trim()}-default-rtdb.firebaseio.com`,
      projectId: projectId.trim() || 'mdf-moderacion',
      authDomain: `${projectId.trim() || 'mdf-moderacion'}.firebaseapp.com`,
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
            <p className="text-xs text-slate-400">Conecta una base de datos gratuita de Firebase para sincronizar todos los teléfonos en Vercel</p>
          </div>
        </div>

        <div className="bg-mdf-darkBg/90 border border-mdf-darkBorder rounded-2xl p-4 mb-4 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-mdf-cyan flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>¿Cómo conectar en 2 minutos (100% Gratis)?</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Ingresa a <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-mdf-cyan underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a> y crea un proyecto.</li>
            <li>En el menú lateral, crea una <strong>Realtime Database</strong> en modo prueba (lectura y escritura activadas).</li>
            <li>Copia tu <strong>API Key</strong> y la <strong>URL de la base de datos</strong> (ej: <code className="text-slate-300 bg-slate-800 px-1 rounded">https://tu-proyecto-default-rtdb.firebaseio.com</code>) y pégalas aquí:</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Database URL (o Project ID) <span className="text-red-400">*</span>
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Firebase API Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono"
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
                  <span className="text-emerald-400">¡Conectado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar y Conectar</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

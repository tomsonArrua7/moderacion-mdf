import { useState } from 'react';
import { useDebateSocket } from './hooks/useDebateSocket';
import { Navbar } from './components/layout/Navbar';
import { QRModal } from './components/layout/QRModal';
import { CommissionSelectModal } from './components/layout/CommissionSelectModal';
import { ModeratorDashboard } from './components/moderator/ModeratorDashboard';
import { ParticipantView } from './components/participant/ParticipantView';
import { ProjectorView } from './components/projector/ProjectorView';
import { Lock, Unlock, X } from 'lucide-react';

export function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSession = urlParams.get('session') || 'COMISION-1';
  const roleParam = urlParams.get('role') as 'moderator' | 'participant' | 'projector' | null;

  const [currentSessionId, setCurrentSessionId] = useState<string>(initialSession);
  const [isCommissionSelectOpen, setIsCommissionSelectOpen] = useState(false);

  // Estado de autenticación de Moderador (guardado en sessionStorage del navegador)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`mdf_auth_${currentSessionId}`) === 'true';
    }
    return false;
  });

  // Modal para ingresar PIN de Moderación
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Hook principal de la sesión
  const {
    session,
    isConnected,
    isFirebaseConnected,
    serverOffsetMs,
    currentUserSpeakerId,
    myRegisteredSpeakerIds,
    registerSpeaker,
    selectMySpeaker,
    configureFirebase,
    updateConfig,
    setRegistrationStatus,
    shuffleSpeakers,
    setCurrentSpeaker,
    controlTimer,
    nextSpeaker,
    prevSpeaker,
    moveSpeaker,
    updateSpeakerStatus,
    removeSpeaker,
    addExceptionSpeaker,
    resetSession
  } = useDebateSocket(currentSessionId);

  // Vista actual
  const [currentView, setCurrentView] = useState<'moderator' | 'participant' | 'projector'>(() => {
    if (roleParam === 'projector') return 'projector';
    if (roleParam === 'moderator' && isAdminAuthenticated) return 'moderator';
    return 'participant';
  });

  const [isQROpen, setIsQROpen] = useState(false);

  const handleViewChange = (view: 'moderator' | 'participant' | 'projector') => {
    if (view === 'moderator' && !isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      return;
    }

    setCurrentView(view);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('role', view);
    newUrl.searchParams.set('session', session.id);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // Cambiar de comisión
  const handleSelectCommission = (newCommissionId: string) => {
    setCurrentSessionId(newCommissionId);
    
    // Verificar si ya estaba autenticado en esa comisión específica
    const isAuth = typeof window !== 'undefined' && sessionStorage.getItem(`mdf_auth_${newCommissionId}`) === 'true';
    setIsAdminAuthenticated(isAuth);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('session', newCommissionId);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // Validar PIN ingresado
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (cleanPin === session.adminPin || cleanPin === '1234') {
      setIsAdminAuthenticated(true);
      setPinError(false);
      setIsAdminAuthModalOpen(false);
      setPinInput('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`mdf_auth_${session.id}`, 'true');
      }
      handleViewChange('moderator');
    } else {
      setPinError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`mdf_auth_${session.id}`);
    }
    handleViewChange('participant');
  };

  return (
    <div className="min-h-screen bg-[#080E21] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        session={session}
        currentView={currentView}
        onViewChange={handleViewChange}
        isConnected={isConnected || isFirebaseConnected}
        onOpenQR={() => setIsQROpen(true)}
        onOpenCommissionSelect={() => setIsCommissionSelectOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
        onRequestAdminAuth={() => setIsAdminAuthModalOpen(true)}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentView === 'moderator' && isAdminAuthenticated ? (
          <ModeratorDashboard
            session={session}
            serverOffsetMs={serverOffsetMs}
            isFirebaseConnected={isFirebaseConnected}
            onConfigureFirebase={configureFirebase}
            onUpdateConfig={updateConfig}
            onSetRegistrationStatus={setRegistrationStatus}
            onShuffleSpeakers={shuffleSpeakers}
            onSetCurrentSpeaker={setCurrentSpeaker}
            onControlTimer={controlTimer}
            onNextSpeaker={nextSpeaker}
            onPrevSpeaker={prevSpeaker}
            onMoveSpeaker={moveSpeaker}
            onUpdateSpeakerStatus={updateSpeakerStatus}
            onRemoveSpeaker={removeSpeaker}
            onAddExceptionSpeaker={addExceptionSpeaker}
            onResetSession={resetSession}
            onOpenQR={() => setIsQROpen(true)}
          />
        ) : currentView === 'projector' ? (
          <ProjectorView
            session={session}
            serverOffsetMs={serverOffsetMs}
          />
        ) : (
          <ParticipantView
            session={session}
            serverOffsetMs={serverOffsetMs}
            currentUserSpeakerId={currentUserSpeakerId}
            myRegisteredSpeakerIds={myRegisteredSpeakerIds}
            onRegister={registerSpeaker}
            onSelectSpeaker={selectMySpeaker}
            onOpenCommissionSelect={() => setIsCommissionSelectOpen(true)}
            onRequestAdminAccess={() => setIsAdminAuthModalOpen(true)}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        )}
      </main>

      {/* Modal para ingresar PIN de Moderador */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0F1A38] border border-mdf-cyan/30 rounded-3xl p-6 md:p-8 shadow-2xl text-center">
            
            <button
              onClick={() => {
                setIsAdminAuthModalOpen(false);
                setPinError(false);
                setPinInput('');
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-mdf-blue/20 border border-mdf-cyan/40 text-mdf-cyan flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">Acceso de Moderador</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Ingresa la contraseña/PIN de moderación para desbloquear el panel de control.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN (por defecto: 1234)"
                className="w-full text-center tracking-[0.4em] text-2xl font-mono bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-4 py-3 text-white placeholder:tracking-normal placeholder:text-xs"
              />

              {pinError && (
                <p className="text-xs text-red-400 font-semibold animate-shake">
                  Contraseña incorrecta. Verifica con el moderador a cargo.
                </p>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-mdf-blue hover:bg-mdf-blueHover text-white font-bold text-sm shadow-lg shadow-mdf-blue/40 transition-all active:scale-95"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Panel</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Selector de Comisiones */}
      <CommissionSelectModal
        isOpen={isCommissionSelectOpen}
        onClose={() => setIsCommissionSelectOpen(false)}
        currentCommissionId={session.id}
        onSelectCommission={handleSelectCommission}
      />

      {/* QR Code Modal */}
      <QRModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        session={session}
      />

    </div>
  );
}

export default App;

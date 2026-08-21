import { useState } from 'react';
import { useDebateSocket } from './hooks/useDebateSocket';
import { Navbar } from './components/layout/Navbar';
import { QRModal } from './components/layout/QRModal';
import { CommissionSelectModal } from './components/layout/CommissionSelectModal';
import { CommissionLandingScreen } from './components/layout/CommissionLandingScreen';
import { DebateGuideModal } from './components/debate/DebateGuideModal';
import { ModeratorDashboard } from './components/moderator/ModeratorDashboard';
import { ParticipantView } from './components/participant/ParticipantView';
import { ProjectorView } from './components/projector/ProjectorView';
import { Lock, Unlock, X } from 'lucide-react';

export function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionParam = urlParams.get('session');
  const roleParam = urlParams.get('role') as 'moderator' | 'participant' | 'projector' | null;

  // Si no vino sesión en la URL, mostrar la pantalla de selección inicial
  const [hasSelectedCommission, setHasSelectedCommission] = useState<boolean>(Boolean(sessionParam));
  const [currentSessionId, setCurrentSessionId] = useState<string>(sessionParam || 'COMISION-1');
  const [isCommissionSelectOpen, setIsCommissionSelectOpen] = useState(false);
  const [isDebateGuideOpen, setIsDebateGuideOpen] = useState(false);

  // Estado de autenticación de Moderador
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`mdf_auth_${currentSessionId}`) === 'true' ||
             sessionStorage.getItem('mdf_auth_global') === 'true';
    }
    return false;
  });

  // Modal para ingresar Contraseña de Moderación
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

  // Selección de comisión desde la pantalla de bienvenida inicial
  const handleSelectCommissionFromLanding = (
    newCommissionId: string, 
    preferredRole: 'participant' | 'moderator' | 'projector' = 'participant'
  ) => {
    setCurrentSessionId(newCommissionId);
    setHasSelectedCommission(true);

    const isAuth = typeof window !== 'undefined' && (
      sessionStorage.getItem(`mdf_auth_${newCommissionId}`) === 'true' ||
      sessionStorage.getItem('mdf_auth_global') === 'true'
    );
    setIsAdminAuthenticated(isAuth);

    const targetRole = preferredRole === 'moderator' && !isAuth ? 'participant' : preferredRole;
    setCurrentView(targetRole);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('session', newCommissionId);
    newUrl.searchParams.set('role', targetRole);
    window.history.replaceState({}, '', newUrl.toString());

    if (preferredRole === 'moderator' && !isAuth) {
      setIsAdminAuthModalOpen(true);
    }
  };

  // Cambiar de comisión desde el modal interno
  const handleSelectCommission = (newCommissionId: string) => {
    setCurrentSessionId(newCommissionId);
    setHasSelectedCommission(true);
    
    const isAuth = typeof window !== 'undefined' && (
      sessionStorage.getItem(`mdf_auth_${newCommissionId}`) === 'true' ||
      sessionStorage.getItem('mdf_auth_global') === 'true'
    );
    setIsAdminAuthenticated(isAuth);

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('session', newCommissionId);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // Validar Contraseña ingresada (fija e inmutable: moderador2026)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (cleanPin === 'moderador2026') {
      setIsAdminAuthenticated(true);
      setPinError(false);
      setIsAdminAuthModalOpen(false);
      setPinInput('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`mdf_auth_${session.id}`, 'true');
        sessionStorage.setItem('mdf_auth_global', 'true');
      }
      setHasSelectedCommission(true);
      setCurrentView('moderator');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('role', 'moderator');
      newUrl.searchParams.set('session', session.id);
      window.history.replaceState({}, '', newUrl.toString());
    } else {
      setPinError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`mdf_auth_${session.id}`);
      sessionStorage.removeItem('mdf_auth_global');
    }
    handleViewChange('participant');
  };

  // Si no se ha elegido comisión (al ingresar a la raíz del sitio sin URL específica)
  if (!hasSelectedCommission) {
    return (
      <>
        <CommissionLandingScreen
          onSelectCommission={handleSelectCommissionFromLanding}
          onRequestAdminAccess={() => setIsAdminAuthModalOpen(true)}
        />

        {/* Modal para ingresar Contraseña de Moderador desde la Landing */}
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
                Ingresa la contraseña de moderación para desbloquear el panel.
              </p>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Contraseña de moderador"
                  className="w-full text-center text-lg font-mono bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-4 py-3 text-white placeholder:text-xs placeholder:text-slate-500"
                />

                {pinError && (
                  <p className="text-xs text-red-400 font-semibold animate-shake">
                    Contraseña incorrecta.
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
      </>
    );
  }

  return (
    <div key={currentSessionId} className="min-h-screen bg-[#080E21] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        session={session}
        currentView={currentView}
        onViewChange={handleViewChange}
        isConnected={isConnected || isFirebaseConnected}
        onOpenQR={() => setIsQROpen(true)}
        onOpenCommissionSelect={() => setIsCommissionSelectOpen(true)}
        onOpenDebateGuide={() => setIsDebateGuideOpen(true)}
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
            onOpenDebateGuide={() => setIsDebateGuideOpen(true)}
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

      {/* Modal para ingresar Contraseña de Moderador */}
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
              Ingresa la contraseña de moderación para desbloquear el panel de control.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Contraseña de moderador"
                className="w-full text-center text-lg font-mono bg-mdf-darkBg border border-mdf-darkBorder focus:border-mdf-cyan rounded-xl px-4 py-3 text-white placeholder:text-xs placeholder:text-slate-500"
              />

              {pinError && (
                <p className="text-xs text-red-400 font-semibold animate-shake">
                  Contraseña incorrecta.
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

      {/* Guía y Preguntas de Debate */}
      <DebateGuideModal
        isOpen={isDebateGuideOpen}
        onClose={() => setIsDebateGuideOpen(false)}
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

import { useState } from 'react';
import { useDebateSocket } from './hooks/useDebateSocket';
import { Navbar } from './components/layout/Navbar';
import { QRModal } from './components/layout/QRModal';
import { ModeratorDashboard } from './components/moderator/ModeratorDashboard';
import { ParticipantView } from './components/participant/ParticipantView';
import { ProjectorView } from './components/projector/ProjectorView';

export function App() {
  // Obtener parámetros de la URL (soporta ?session=XYZ&role=participant/moderator/projector)
  const urlParams = new URLSearchParams(window.location.search);
  const sessionParam = urlParams.get('session') || 'MDF-JUV';
  const roleParam = urlParams.get('role') as 'moderator' | 'participant' | 'projector' | null;

  const [currentView, setCurrentView] = useState<'moderator' | 'participant' | 'projector'>(() => {
    if (roleParam === 'participant' || roleParam === 'projector' || roleParam === 'moderator') {
      return roleParam;
    }
    // Si la pantalla es móvil, por defecto abrir como participante
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'participant';
    }
    return 'moderator';
  });

  const [isQROpen, setIsQROpen] = useState(false);

  // Hook principal de la sesión en tiempo real
  const {
    session,
    isConnected,
    serverOffsetMs,
    currentUserSpeakerId,
    registerSpeaker,
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
  } = useDebateSocket(sessionParam);

  // Actualizar parámetro de URL al cambiar vista para fácil guardado / compartir
  const handleViewChange = (view: 'moderator' | 'participant' | 'projector') => {
    setCurrentView(view);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('role', view);
    newUrl.searchParams.set('session', session.id);
    window.history.replaceState({}, '', newUrl.toString());
  };

  return (
    <div className="min-h-screen bg-[#080E21] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        session={session}
        currentView={currentView}
        onViewChange={handleViewChange}
        isConnected={isConnected}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* Main Content Area based on selected view */}
      <main className="flex-1 w-full">
        {currentView === 'moderator' && (
          <ModeratorDashboard
            session={session}
            serverOffsetMs={serverOffsetMs}
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
        )}

        {currentView === 'participant' && (
          <ParticipantView
            session={session}
            serverOffsetMs={serverOffsetMs}
            currentUserSpeakerId={currentUserSpeakerId}
            onRegister={registerSpeaker}
          />
        )}

        {currentView === 'projector' && (
          <ProjectorView
            session={session}
            serverOffsetMs={serverOffsetMs}
          />
        )}
      </main>

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

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, Database, off } from 'firebase/database';
import { DebateSession } from '../types/debate';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Obtener configuración desde variables de entorno o localStorage
export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  if (typeof window !== 'undefined') {
    const fromStorage = localStorage.getItem('mdf_firebase_config');
    if (fromStorage) {
      try {
        return JSON.parse(fromStorage);
      } catch {
        // fallback
      }
    }
  }

  // Desde variables de entorno de Vite
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (apiKey && (databaseURL || projectId)) {
    return {
      apiKey,
      databaseURL: databaseURL || `https://${projectId}-default-rtdb.firebaseio.com`,
      projectId,
      authDomain: `${projectId}.firebaseapp.com`,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
    };
  }

  return null;
};

export const saveStoredFirebaseConfig = (config: FirebaseConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mdf_firebase_config', JSON.stringify(config));
  }
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

export const initFirebase = (customConfig?: FirebaseConfig): { app: FirebaseApp | null; db: Database | null } => {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey || (!config.databaseURL && !config.projectId)) {
    return { app: null, db: null };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    db = getDatabase(app);
    return { app, db };
  } catch (err) {
    console.warn('[Firebase] Error al inicializar:', err);
    return { app: null, db: null };
  }
};

/**
 * Escucha cambios en tiempo real en la sesión de Firebase Realtime Database
 */
export const subscribeToFirebaseSession = (
  sessionId: string,
  onUpdate: (session: DebateSession) => void,
  customConfig?: FirebaseConfig
): (() => void) => {
  const { db: database } = initFirebase(customConfig);
  if (!database) return () => {};

  const sessionRef = ref(database, `sessions/${sessionId}`);
  
  onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Firebase convierte arreglos vacíos o con índices en objetos a veces
      if (data.speakers && !Array.isArray(data.speakers)) {
        data.speakers = Object.values(data.speakers);
      } else if (!data.speakers) {
        data.speakers = [];
      }
      onUpdate(data as DebateSession);
    }
  });

  return () => {
    off(sessionRef);
  };
};

/**
 * Guarda o actualiza la sesión en Firebase Realtime Database
 */
export const syncSessionToFirebase = async (session: DebateSession, customConfig?: FirebaseConfig): Promise<boolean> => {
  const { db: database } = initFirebase(customConfig);
  if (!database) return false;

  try {
    const sessionRef = ref(database, `sessions/${session.id}`);
    await set(sessionRef, {
      ...session,
      updatedAt: Date.now()
    });
    return true;
  } catch (err) {
    console.error('[Firebase] Error al sincronizar:', err);
    return false;
  }
};

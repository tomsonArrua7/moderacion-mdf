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

export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  if (typeof window !== 'undefined') {
    // 1. Verificar si viene en la URL (?db=... o ?fb=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlDb = params.get('db') || params.get('fb');
      if (urlDb) {
        let cleanUrl = decodeURIComponent(urlDb).trim();
        if (!cleanUrl.startsWith('http')) {
          cleanUrl = `https://${cleanUrl}.firebaseio.com`;
        }
        const cfg: FirebaseConfig = {
          apiKey: 'AIzaSyDefaultMdfKey',
          databaseURL: cleanUrl,
          projectId: cleanUrl.replace('https://', '').split('.')[0] || 'mdf-moderacion',
          authDomain: 'mdf-moderacion.firebaseapp.com',
          appId: '1:mdf:web:app'
        };
        localStorage.setItem('mdf_firebase_config', JSON.stringify(cfg));
        return cfg;
      }
    } catch {
      // ignore
    }

    // 2. Verificar localStorage
    const fromStorage = localStorage.getItem('mdf_firebase_config');
    if (fromStorage) {
      try {
        return JSON.parse(fromStorage);
      } catch {
        // fallback
      }
    }
  }

  // 3. Desde variables de entorno de Vite
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (databaseURL || (apiKey && projectId)) {
    return {
      apiKey: apiKey || 'AIzaSyDefaultMdfKey',
      databaseURL: databaseURL || `https://${projectId}-default-rtdb.firebaseio.com`,
      projectId: projectId || 'mdf-moderacion',
      authDomain: `${projectId || 'mdf-moderacion'}.firebaseapp.com`,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:mdf:web:app'
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
  if (!config || (!config.databaseURL && !config.projectId)) {
    return { app: null, db: null };
  }

  const effectiveConfig = {
    apiKey: config.apiKey || 'AIzaSyDefaultMdfKey',
    databaseURL: config.databaseURL || `https://${config.projectId}-default-rtdb.firebaseio.com`,
    projectId: config.projectId || 'mdf-moderacion',
    authDomain: `${config.projectId || 'mdf-moderacion'}.firebaseapp.com`,
    appId: config.appId || '1:mdf:web:app'
  };

  try {
    if (!getApps().length) {
      app = initializeApp(effectiveConfig);
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

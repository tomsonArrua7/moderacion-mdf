/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_FIREBASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

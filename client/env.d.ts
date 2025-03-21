// env.d.ts
interface ImportMetaEnv {
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_APP_ID: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
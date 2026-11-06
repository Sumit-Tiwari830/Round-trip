/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_ENABLE_SOUND: string;
  readonly VITE_DEV_GUEST_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

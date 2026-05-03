/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_TEAM_ID?: string
  readonly VITE_CURRENT_USER_ID?: string
  /** Если true — дашборд без JWT (нужен ALLOW_DEV_AUTH_BYPASS на API и VITE_TEAM_ID) */
  readonly VITE_SKIP_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

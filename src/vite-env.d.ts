/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_WEBHOOK_URL?: string
  readonly VITE_WEB3FORMS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

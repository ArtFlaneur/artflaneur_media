/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_MAILCHIMP_ACTION_URL?: string;
  readonly VITE_MAILCHIMP_HONEYPOT_NAME?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

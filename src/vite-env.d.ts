/// <reference types="vite/client" />

/** App version, injected from package.json by Vite's `define`. */
declare const __APP_VERSION__: string

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

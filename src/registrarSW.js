/* service worker: guarda o app no aparelho para funcionar sem internet */
export function registrarSW() {
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
}

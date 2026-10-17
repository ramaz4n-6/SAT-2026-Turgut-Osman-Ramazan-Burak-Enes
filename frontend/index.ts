import { registerRootComponent } from 'expo';
import App from './App';

if (typeof globalThis !== 'undefined' && (globalThis as any).ErrorUtils) {
  const originalHandler = (globalThis as any).ErrorUtils.getGlobalHandler();
  (globalThis as any).ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
    console.error('=== JS RUNTIME HATASI ===', error?.message || error, error?.stack);
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

registerRootComponent(App);

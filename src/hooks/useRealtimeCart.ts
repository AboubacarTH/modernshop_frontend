import { useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

const POLL_INTERVAL = 30_000; // 30 s

/**
 * Keeps the local cart in sync with the server.
 *
 * Strategy:
 *  • Fetch immediately on mount (when logged in)
 *  • Re-fetch when the browser tab regains focus
 *  • Re-fetch when the page becomes visible after being hidden
 *  • Poll every 30 s in background (stops when tab is hidden)
 */
export function useRealtimeCart() {
  const { fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const sync = () => {
    if (isAuthenticated()) fetchCart();
  };

  const startPolling = () => {
    stopPolling();
    timerRef.current = setInterval(sync, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    sync();

    const onFocus      = () => { sync(); startPolling(); };
    const onBlur       = () => stopPolling();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') { sync(); startPolling(); }
      else stopPolling();
    };

    window.addEventListener('focus',  onFocus);
    window.addEventListener('blur',   onBlur);
    document.addEventListener('visibilitychange', onVisibility);

    if (document.visibilityState === 'visible') startPolling();

    return () => {
      stopPolling();
      window.removeEventListener('focus',  onFocus);
      window.removeEventListener('blur',   onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated()]);
}

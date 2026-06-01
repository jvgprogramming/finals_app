import { useEffect, useRef, useCallback } from 'react';
import NotificationService from '../services/NotificationService';
import OrderService from '../services/OrderService';
import type { Notification } from '../services/NotificationService';
import type { Order } from '../services/OrderService';

interface PollingOptions {
  interval?: number;
  /** When false, no requests are made and any active interval is cleared */
  enabled?: boolean;
  onNotificationsUpdate?: (notifications: Notification[]) => void;
  onOrdersUpdate?: (orders: Order[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for polling notifications and orders every N seconds.
 * Callbacks are stored in refs so polling does not restart on every parent re-render.
 */
export const useNotificationPolling = ({
  interval = 10000,
  enabled = true,
  onNotificationsUpdate,
  onOrdersUpdate,
  onError,
}: PollingOptions = {}) => {
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const callbacksRef = useRef({
    onNotificationsUpdate,
    onOrdersUpdate,
    onError,
  });
  callbacksRef.current = {
    onNotificationsUpdate,
    onOrdersUpdate,
    onError,
  };

  const poll = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!enabled || !token) {
      return;
    }

    try {
      const [notificationsResult, orders] = await Promise.all([
        NotificationService.getNotifications(),
        OrderService.getOrders(),
      ]);

      callbacksRef.current.onNotificationsUpdate?.(notificationsResult.data);
      callbacksRef.current.onOrdersUpdate?.(orders);
    } catch (error) {
      console.error('Error polling notifications/orders:', error);
      callbacksRef.current.onError?.(error as Error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    poll();

    intervalIdRef.current = setInterval(poll, interval);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [poll, interval, enabled]);

  return {
    stopPolling: () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    },
    startPolling: () => {
      if (!intervalIdRef.current) {
        poll();
        intervalIdRef.current = setInterval(poll, interval);
      }
    },
  };
};

export default useNotificationPolling;

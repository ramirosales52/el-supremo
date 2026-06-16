import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { ordersApi } from '../api/orders';
import type { Order, OrderStatus } from '../types';

export function useOrdersPolling() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders(),
      )
      .subscribe();

    const interval = setInterval(loadOrders, 10000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  async function loadOrders() {
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function filterByStatus(status?: OrderStatus) {
    if (!status) return orders;
    return orders.filter((o) => o.status === status);
  }

  return { orders, loading, filterByStatus, refresh: loadOrders };
}

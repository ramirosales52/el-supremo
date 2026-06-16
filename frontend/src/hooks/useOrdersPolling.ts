import { useState, useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { ordersApi } from '../api/orders';
import type { Order, OrderStatus } from '../types';

export function useOrdersPolling() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadOrders();

    try {
      socketRef.current = io('http://localhost:3001/orders');

      socketRef.current.on('order:created', (order: Order) => {
        setOrders((prev) => [order, ...prev]);
      });

      socketRef.current.on('order:statusChanged', (updated: Order) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? updated : o))
        );
      });
    } catch {
      // Fallback to polling if WebSocket fails
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }

    return () => {
      socketRef.current?.disconnect();
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

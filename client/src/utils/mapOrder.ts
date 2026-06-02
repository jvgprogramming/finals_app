import type { Order } from '../services/OrderService';

/** UI-friendly order shape used across customer and admin views */
export interface UiOrder {
  id: number;
  order_number?: string;
  customerName: string;
  customerPhone?: string;
  totalPrice: number;
  status: string;
  statusKey: string;
  items: Array<{
    id?: number;
    name: string;
    price: number;
    quantity: number;
    dedication?: string;
    size?: string;
    flavor?: string;
  }>;
  date: string;
  time: string;
  type?: string;
  address?: string;
  paymentMethod?: string;
  notes?: string | null;
  delivery_date?: string | null;
  user?: Order['user'];
  raw?: Order;
}

function formatDateParts(iso: string | undefined): { date: string; time: string } {
  if (!iso) {
    return { date: '—', time: '—' };
  }
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function capitalizeStatus(status: string): string {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function mapOrderFromApi(order: Order & Record<string, unknown>): UiOrder {
  const { date, time } = formatDateParts(
    (order.created_at as string) ?? (order.date as string),
  );

  const user = order.user as Order['user'] | undefined;
  const customerName =
    (order.customerName as string) ??
    (user
      ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
      : 'Guest');

  const apiItems =
    (order.items as Order['items']) ??
    (order.orderItems as Array<Record<string, unknown>>) ??
    [];

  const items = apiItems.map((item) => {
    const row = item as unknown as Record<string, unknown>;
    return {
      id: row.id as number | undefined,
      name:
        (row.name as string) ??
        (row.product_name_snapshot as string) ??
        'Product',
      price: Number(row.price ?? row.product_price_snapshot ?? 0),
      quantity: Number(row.quantity ?? 1),
      dedication: (row.customization as { dedication_message?: string })
        ?.dedication_message,
      size: (row.customization as { size?: string })?.size,
      flavor: (row.customization as { flavor?: string })?.flavor,
    };
  });

  const statusRaw = String(order.status ?? 'pending').toLowerCase();

  return {
    id: order.id,
    order_number: order.order_number,
    customerName,
    customerPhone: (order.customerPhone as string) ?? '—',
    totalPrice: Number(order.totalPrice ?? order.total_amount ?? 0),
    status: capitalizeStatus(statusRaw),
    statusKey: statusRaw,
    items,
    date,
    time,
    type: (order.type as string) ?? 'pickup',
    address: (order.address as string) ?? '',
    // API may return `payment_method` (snake_case) or `paymentMethod` (camelCase).
    paymentMethod:
      (order.payment_method as string) ?? (order.paymentMethod as string) ??
      'Cash on Delivery',
    notes: order.notes ?? null,
    delivery_date: order.delivery_date ?? null,
    user,
    raw: order,
  };
}

export function mapOrdersFromApi(orders: Order[]): UiOrder[] {
  return orders.map((o) => mapOrderFromApi(o as Order & Record<string, unknown>));
}

/** Compare filter tab label to API status */
export function orderMatchesFilter(order: UiOrder, filter: string): boolean {
  if (filter === 'All') return true;
  const key = order.statusKey ?? order.status.toLowerCase();
  return key === filter.toLowerCase();
}

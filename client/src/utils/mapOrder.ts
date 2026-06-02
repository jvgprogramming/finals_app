import type { Order } from '../services/OrderService';

/** UI-friendly order shape used across customer and admin views */
export interface UiOrder {
  id: number;
  order_number?: string;
  customerName: string;
  customerPhone?: string;
  totalPrice: number;
  deliveryFee?: number;
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
  created_at?: string;
  type?: string;
  address?: string;
  paymentMethod?: string;
  notes?: string | null;
  delivery_date?: string | null;
  remarks?: string | null;
  user?: Order['user'];
  raw?: Order;
}

function formatDateParts(iso: string | undefined): { date: string; time: string } {
  if (!iso) {
    return { date: '—', time: '—' };
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: '—', time: '—' };
  }
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
  const scheduleSource =
    (order.delivery_date as string) ?? (order.created_at as string);
  const { date, time } = formatDateParts(scheduleSource);

  const user = order.user as Order['user'] | undefined;
  const customerName =
    (order.customer_name as string) ??
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
  const fulfillmentType =
    (order.fulfillment_type as string) ?? (order.type as string) ?? 'pickup';

  return {
    id: order.id,
    order_number: order.order_number,
    customerName,
    customerPhone:
      (order.customer_phone as string) ??
      (order.customerPhone as string) ??
      '—',
    totalPrice: Number(order.totalPrice ?? order.total_amount ?? 0),
    deliveryFee: Number(order.delivery_fee ?? 0),
    status: capitalizeStatus(statusRaw),
    statusKey: statusRaw,
    items,
    date,
    time,
    created_at: order.created_at as string | undefined,
    type: fulfillmentType,
    address:
      (order.delivery_address as string) ??
      (order.address as string) ??
      '',
    paymentMethod:
      (order.payment_method as string) ?? (order.paymentMethod as string) ??
      'Cash on Delivery',
    notes: order.notes ?? null,
    delivery_date: (order.delivery_date as string) ?? null,
    remarks: order.notes ?? null,
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

/** Submitted date label for order cards */
export function formatSubmittedAt(order: UiOrder): string {
  if (!order.created_at) return '—';
  const d = new Date(order.created_at);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

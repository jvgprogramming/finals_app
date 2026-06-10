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
  /** Scheduled fulfillment date (from delivery_date) */
  date: string;
  /** Scheduled fulfillment time (from delivery_date) */
  time: string;
  placedDate: string;
  placedTime: string;
  scheduledDate: string;
  scheduledTime: string;
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

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const timeFormat: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

/** Parse Laravel / ISO datetimes reliably in the browser. */
export function parseApiDateTime(value: string | undefined | null): Date | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/** Format a local datetime string "YYYY-MM-DD HH:mm:ss" without timezone conversion. */
function formatLocalDateParts(
  value: string | undefined | null,
): { date: string; time: string } {
  if (!value) return { date: '—', time: '—' };
  const parts = String(value).trim().split(' ');
  if (parts.length !== 2) return { date: '—', time: '—' };

  const [datePart, timePart] = parts;

  // Format date: parse YYYY-MM-DD via Date without timezone (using UTC methods to avoid shifting)
  const dateSegments = datePart.split('-');
  if (dateSegments.length !== 3) return { date: '—', time: '—' };
  const dateObj = new Date(
    parseInt(dateSegments[0], 10),
    parseInt(dateSegments[1], 10) - 1,
    parseInt(dateSegments[2], 10),
  );
  const formattedDate = dateObj.toLocaleDateString(undefined, dateFormat);

  // Format time from HH:mm:ss to 12-hour format
  const timeSegments = timePart.split(':');
  if (timeSegments.length < 2) return { date: '—', time: '—' };
  const hours = parseInt(timeSegments[0], 10);
  const minutes = timeSegments[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const formattedTime = `${displayHours}:${minutes} ${ampm}`;

  return { date: formattedDate, time: formattedTime };
}

function formatDateParts(iso: string | undefined | null, isLocal = false): { date: string; time: string } {
  if (isLocal) {
    return formatLocalDateParts(iso);
  }
  const d = parseApiDateTime(iso ?? undefined);
  if (!d) {
    return { date: '—', time: '—' };
  }
  return {
    date: d.toLocaleDateString(undefined, dateFormat),
    time: d.toLocaleTimeString(undefined, timeFormat),
  };
}

function capitalizeStatus(status: string): string {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function readCustomization(row: Record<string, unknown>) {
  const raw = row.customization;
  if (!raw || typeof raw !== 'object') return {};
  return raw as {
    dedication_message?: string;
    size?: string;
    flavor?: string;
  };
}

export function mapOrderFromApi(order: Order & Record<string, unknown>): UiOrder {
  const placed = formatDateParts(order.created_at as string);
  const scheduled = formatDateParts(order.delivery_date as string, true);

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
    const customization = readCustomization(row);
    return {
      id: row.id as number | undefined,
      name:
        (row.name as string) ??
        (row.product_name_snapshot as string) ??
        'Product',
      price: Number(row.price ?? row.product_price_snapshot ?? 0),
      quantity: Number(row.quantity ?? 1),
      dedication: customization.dedication_message || undefined,
      size: customization.size,
      flavor: customization.flavor,
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
    date: scheduled.date,
    time: scheduled.time,
    placedDate: placed.date,
    placedTime: placed.time,
    scheduledDate: scheduled.date,
    scheduledTime: scheduled.time,
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

/** When the order was submitted (created_at). */
export function formatPlacedAt(order: UiOrder): string {
  if (order.placedDate === '—' || order.placedTime === '—') return '—';
  return `${order.placedDate} at ${order.placedTime}`;
}

/** Submitted date/time label for order cards */
export function formatSubmittedAt(order: UiOrder): string {
  return formatPlacedAt(order);
}

/** Scheduled pickup/delivery slot label */
export function formatScheduledAt(order: UiOrder): string {
  if (!order.delivery_date && order.scheduledDate === '—') return '—';
  if (order.scheduledDate === '—' || order.scheduledTime === '—') return '—';
  return `${order.scheduledDate} at ${order.scheduledTime}`;
}

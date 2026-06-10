import type { UiOrder } from './mapOrder';

export type SalesTrendPoint = {
  label: string;
  dateKey: string;
  revenue: number;
};

/** Generate a YYYY-MM-DD string from a Date object using local timezone methods. */
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildSalesTrend(
  orders: UiOrder[],
  days = 7,
): SalesTrendPoint[] {
  const points: SalesTrendPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = toLocalDateKey(d);
    points.push({
      label: d.toLocaleDateString('en-PH', { weekday: 'short' }),
      dateKey,
      revenue: 0,
    });
  }

  orders
    .filter((o) => o.statusKey === 'completed')
    .forEach((order) => {
      const source = order.created_at ?? order.delivery_date;
      if (!source) return;
      const key = toLocalDateKey(new Date(source));
      const bucket = points.find((p) => p.dateKey === key);
      if (bucket) {
        bucket.revenue += order.totalPrice;
      }
    });

  return points;
}

export function maxRevenue(points: SalesTrendPoint[]): number {
  const max = Math.max(...points.map((p) => p.revenue), 0);
  return max > 0 ? max : 1;
}

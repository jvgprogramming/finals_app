import type { UiOrder } from './mapOrder';

export type SalesTrendPoint = {
  label: string;
  dateKey: string;
  revenue: number;
};

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
    const dateKey = d.toISOString().slice(0, 10);
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
      const key = new Date(source).toISOString().slice(0, 10);
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

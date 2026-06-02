// @ts-nocheck
import { buildSalesTrend, maxRevenue } from '../../utils/salesTrend';
import { formatPeso } from '../../utils/currency';
import EmptyState from '../EmptyState';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function SalesTrendChart({ orders }) {
  const points = buildSalesTrend(orders, 7);
  const max = maxRevenue(points);
  const hasData = points.some((p) => p.revenue > 0);
  const chartHeight = 170;
  const chartWidth = 430;
  const leftPad = 50;

  if (!hasData) {
    return (
      <EmptyState
        icon={<ChartBarIcon style={{ width: 40, height: 40 }} aria-hidden />}
        title="No sales data yet"
        description="Completed orders from the last 7 days will appear here."
      />
    );
  }

  const coords = points.map((p, i) => {
    const x = leftPad + (i / Math.max(points.length - 1, 1)) * chartWidth;
    const y = 20 + chartHeight - (p.revenue / max) * chartHeight;
    return { x, y, ...p };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${20 + chartHeight} L ${coords[0].x} ${20 + chartHeight} Z`;

  const yLabels = [max, max * 0.66, max * 0.33, 0];

  return (
    <div style={{ height: '220px', width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${leftPad + chartWidth + 20} 220`} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="chartGradReal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yLabels.map((val, i) => {
          const y = 20 + (i / 3) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={leftPad}
                y1={y}
                x2={leftPad + chartWidth}
                y2={y}
                stroke="#f0e6dd"
                strokeWidth="1"
                strokeDasharray={i < 3 ? '4' : undefined}
              />
              <text x={40} y={y + 4} fill="var(--cocoa)" fontSize="10" textAnchor="end">
                {formatPeso(val)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#chartGradReal)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {coords.map((c) => (
          <circle
            key={c.dateKey}
            cx={c.x}
            cy={c.y}
            r="5"
            fill="var(--espresso)"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        ))}
        {coords.map((c) => (
          <text
            key={`${c.dateKey}-label`}
            x={c.x}
            y={210}
            fill="var(--cocoa)"
            fontSize="10"
            textAnchor="middle"
          >
            {c.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

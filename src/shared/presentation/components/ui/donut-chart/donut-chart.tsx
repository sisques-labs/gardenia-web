import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface DonutChartSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps extends React.SVGProps<SVGSVGElement> {
  segments: DonutChartSegment[];
  centerLabel?: string;
  size?: number;
}

const SEGMENT_COLORS = [
  'var(--forest-2)',
  'var(--honey)',
  'var(--terracotta)',
  'var(--sage)',
  'var(--forest)',
  'var(--honey-2)',
];

const DonutChart = React.forwardRef<SVGSVGElement, DonutChartProps>(
  ({ className, segments, centerLabel, size = 120, ...props }, ref) => {
    const strokeWidth = 12;
    const r = size / 2 - strokeWidth;
    const circumference = 2 * Math.PI * r;
    const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
    const cx = size / 2;
    const cy = size / 2;

    let currentOffset = circumference * 0.25; // start at top (-90deg → offset = circumference/4)

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className={cn(className)}
        aria-label="Donut chart"
        role="img"
        {...props}
      >
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--paper-2)"
          strokeWidth={strokeWidth}
        />

        {segments.map((seg, i) => {
          const arcLen = (seg.value / total) * circumference;
          const offset = currentOffset;
          currentOffset -= arcLen;

          return (
            <circle
              key={seg.label}
              data-segment
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color ?? SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLen} ${circumference - arcLen}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}

        {centerLabel && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.1}
            fill="var(--ink)"
          >
            {centerLabel}
          </text>
        )}
      </svg>
    );
  },
);
DonutChart.displayName = 'DonutChart';

export { DonutChart };

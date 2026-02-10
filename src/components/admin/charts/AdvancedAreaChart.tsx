import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { tooltipStyle, axisStyle, gridStyle } from '@/lib/chartTheme';

interface AdvancedAreaChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  gradientId?: string;
  color?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
}

const AdvancedAreaChart = ({
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  gradientId = 'areaGradient',
  color = '#00d4ff',
  secondaryDataKey,
  secondaryColor = '#7c3aed',
}: AdvancedAreaChartProps) => {
  return (
    <div className="w-full admin-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="50%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
            {secondaryDataKey && (
              <linearGradient id={`${gradientId}Secondary`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.4} />
                <stop offset="50%" stopColor={secondaryColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.02} />
              </linearGradient>
            )}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {showGrid && <CartesianGrid {...gridStyle} vertical={false} />}
          <XAxis 
            dataKey={xAxisKey} 
            {...axisStyle}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            {...axisStyle}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip 
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            itemStyle={tooltipStyle.itemStyle}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            filter="url(#glow)"
            animationDuration={1000}
            dot={{ 
              fill: color, 
              strokeWidth: 2, 
              r: 4,
              filter: 'url(#glow)'
            }}
            activeDot={{ 
              r: 6, 
              fill: color,
              stroke: '#fff',
              strokeWidth: 2,
              filter: 'url(#glow)'
            }}
          />
          {secondaryDataKey && (
            <Area
              type="monotone"
              dataKey={secondaryDataKey}
              stroke={secondaryColor}
              strokeWidth={2}
              fill={`url(#${gradientId}Secondary)`}
              animationDuration={1000}
              dot={{ 
                fill: secondaryColor, 
                strokeWidth: 2, 
                r: 4 
              }}
              activeDot={{ 
                r: 6, 
                fill: secondaryColor,
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdvancedAreaChart;

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { tooltipStyle, pieColors } from '@/lib/chartTheme';

interface GlowPieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

const GlowPieChart = ({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  showLabels = true,
  showLegend = true,
  centerLabel,
  centerValue,
}: GlowPieChartProps) => {
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (!showLabels) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(215, 20%, 88%)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        className="font-medium"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderCenterLabel = () => {
    if (!centerLabel && !centerValue) return null;
    
    return (
      <g>
        {centerValue && (
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-[hsl(215,20%,88%)] text-2xl font-bold"
          >
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-[hsl(215,15%,55%)] text-xs"
          >
            {centerLabel}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full admin-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <filter key={`glow-${index}`} id={`pieGlow-${index}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            label={showLabels ? renderCustomLabel : false}
            labelLine={false}
            animationDuration={800}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || pieColors[index % pieColors.length]}
                stroke="transparent"
                style={{
                  filter: `drop-shadow(0 0 8px ${entry.color || pieColors[index % pieColors.length]}80)`,
                }}
              />
            ))}
          </Pie>
          {renderCenterLabel()}
          <Tooltip 
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            itemStyle={tooltipStyle.itemStyle}
          />
          {showLegend && (
            <Legend 
              wrapperStyle={{ color: 'hsl(215, 20%, 88%)', paddingTop: '20px' }}
              formatter={(value) => <span className="text-[hsl(215,20%,88%)]">{value}</span>}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlowPieChart;

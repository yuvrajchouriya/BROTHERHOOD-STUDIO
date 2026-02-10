import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { tooltipStyle, axisStyle, gridStyle } from '@/lib/chartTheme';

interface NeonBarChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  color?: string; // Kept for compatibility but unused in new design
  layout?: 'horizontal' | 'vertical'; // Kept for compatibility
  colorByValue?: boolean; // Kept for compatibility
  barSize?: number;
  radius?: number; // Kept for compatibility
}

const NeonBarChart = ({
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  showGrid = false,
  barSize = 20,
  layout = 'horizontal',
  colorByValue = false
}: NeonBarChartProps) => {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: layout === 'vertical' ? 10 : 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="capsuleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d946ef" stopOpacity={1} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
            </linearGradient>
          </defs>

          {showGrid && <CartesianGrid {...gridStyle} horizontal={layout === 'vertical'} vertical={layout === 'horizontal'} />}

          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey={xAxisKey}
                {...axisStyle}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis hide />
            </>
          ) : (
            <>
              <XAxis type="number" hide />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                {...axisStyle}
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
            </>
          )}

          <Tooltip
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            itemStyle={tooltipStyle.itemStyle}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />

          <Bar
            dataKey={dataKey}
            barSize={barSize}
            fill="url(#capsuleGradient)"
            radius={[10, 10, 10, 10]}
            animationDuration={1500}
            background={{ fill: 'rgba(255, 255, 255, 0.05)', radius: [10, 10, 10, 10] }}
          >
            {/* Optional: Add Cell logic if different colors per bar are strictly needed, 
                but user asked for the screenshot which is uniform gradient. 
                Keeping gradient as primary. */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NeonBarChart;

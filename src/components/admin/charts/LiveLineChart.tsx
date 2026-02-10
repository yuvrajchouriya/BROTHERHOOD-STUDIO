import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { tooltipStyle, axisStyle, chartColors } from '@/lib/chartTheme';

interface DataPoint {
  time: string;
  value: number;
}

interface LiveLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  maxPoints?: number;
  showPulse?: boolean;
  label?: string;
}

const LiveLineChart = ({
  data,
  height = 200,
  color = chartColors.neonCyan,
  maxPoints = 20,
  showPulse = true,
  label,
}: LiveLineChartProps) => {
  const [displayData, setDisplayData] = useState<DataPoint[]>(data);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Keep only the last maxPoints
    setDisplayData(data.slice(-maxPoints));
    
    // Trigger pulse animation when new data arrives
    if (data.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [data, maxPoints]);

  const latestValue = displayData.length > 0 ? displayData[displayData.length - 1].value : 0;

  return (
    <div className="w-full admin-chart-container p-4 relative">
      {/* Live indicator */}
      {showPulse && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${isAnimating ? 'admin-pulse' : ''}`}
            style={{ 
              backgroundColor: chartColors.neonGreen,
              boxShadow: `0 0 10px ${chartColors.neonGreen}`,
            }}
          />
          <span className="text-xs text-[hsl(152,100%,50%)]">LIVE</span>
        </div>
      )}

      {/* Current value display */}
      <div className="mb-4">
        <div 
          className="text-3xl font-bold"
          style={{ 
            color: color,
            textShadow: `0 0 20px ${color}60`,
          }}
        >
          {latestValue}
        </div>
        {label && (
          <div className="text-sm text-[hsl(215,15%,55%)]">{label}</div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={displayData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="liveLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
            <filter id="liveGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <XAxis 
            dataKey="time" 
            {...axisStyle}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            {...axisStyle}
            tickLine={false}
            axisLine={false}
            width={30}
            tick={{ fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={tooltipStyle.contentStyle}
            labelStyle={tooltipStyle.labelStyle}
            itemStyle={tooltipStyle.itemStyle}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#liveLineGradient)"
            strokeWidth={2}
            dot={false}
            filter="url(#liveGlow)"
            animationDuration={300}
            isAnimationActive={true}
          />
          {/* Latest point with pulse effect */}
          {displayData.length > 0 && (
            <Line
              type="monotone"
              data={[displayData[displayData.length - 1]]}
              dataKey="value"
              stroke="transparent"
              dot={{
                r: 6,
                fill: color,
                stroke: color,
                strokeWidth: 2,
                filter: 'url(#liveGlow)',
              }}
              activeDot={false}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveLineChart;

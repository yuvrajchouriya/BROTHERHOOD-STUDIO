import { gaugeZones, chartColors } from '@/lib/chartTheme';

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  showValue?: boolean;
  showZones?: boolean;
}

const GaugeChart = ({
  value,
  max = 100,
  label,
  size = 200,
  showValue = true,
  showZones = true,
}: GaugeChartProps) => {
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const angle = percentage * 180; // 180 degrees for half circle
  
  // Determine color based on value
  const getColor = () => {
    if (value >= gaugeZones.good.min) return chartColors.neonGreen;
    if (value >= gaugeZones.medium.min) return chartColors.neonOrange;
    return chartColors.neonRed;
  };

  const getStatus = () => {
    if (value >= gaugeZones.good.min) return 'Good';
    if (value >= gaugeZones.medium.min) return 'Medium';
    return 'Poor';
  };

  const color = getColor();
  const status = getStatus();
  
  const radius = size / 2 - 20;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage * circumference);

  return (
    <div className="flex flex-col items-center admin-chart-container p-4">
      <svg 
        width={size} 
        height={size / 2 + 40} 
        viewBox={`0 0 ${size} ${size / 2 + 40}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={chartColors.neonRed} />
            <stop offset="50%" stopColor={chartColors.neonOrange} />
            <stop offset="100%" stopColor={chartColors.neonGreen} />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background arc */}
        <path
          d={`M ${20} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke="hsl(222, 30%, 18%)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Zone indicators */}
        {showZones && (
          <>
            {/* Poor zone - 0-50% */}
            <path
              d={`M ${20} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2} ${size / 2 - radius}`}
              fill="none"
              stroke={chartColors.neonRed}
              strokeWidth={2}
              strokeOpacity={0.3}
              strokeLinecap="round"
            />
            {/* Medium zone - 50-80% */}
            <path
              d={`M ${size / 2} ${size / 2 - radius} A ${radius} ${radius} 0 0 1 ${size - 50} ${size / 2 - 30}`}
              fill="none"
              stroke={chartColors.neonOrange}
              strokeWidth={2}
              strokeOpacity={0.3}
              strokeLinecap="round"
            />
          </>
        )}
        
        {/* Value arc */}
        <path
          d={`M ${20} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#gaugeGlow)"
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            transformOrigin: 'center',
          }}
        />
        
        {/* Needle */}
        <g 
          transform={`rotate(${angle - 90}, ${size / 2}, ${size / 2})`}
          style={{ transition: 'transform 1s ease-out' }}
        >
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={size / 2 - radius + 15}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={8}
            fill={color}
            filter="url(#gaugeGlow)"
          />
        </g>
        
        {/* Center value */}
        {showValue && (
          <>
            <text
              x={size / 2}
              y={size / 2 + 15}
              textAnchor="middle"
              className="fill-[hsl(215,20%,88%)] text-3xl font-bold"
              style={{ filter: 'url(#gaugeGlow)' }}
            >
              {value}
            </text>
            <text
              x={size / 2}
              y={size / 2 + 35}
              textAnchor="middle"
              style={{ fill: color }}
              className="text-sm font-medium"
            >
              {status}
            </text>
          </>
        )}
        
        {/* Min/Max labels */}
        <text
          x={25}
          y={size / 2 + 25}
          textAnchor="start"
          className="fill-[hsl(215,15%,55%)] text-xs"
        >
          0
        </text>
        <text
          x={size - 25}
          y={size / 2 + 25}
          textAnchor="end"
          className="fill-[hsl(215,15%,55%)] text-xs"
        >
          {max}
        </text>
      </svg>
      
      {label && (
        <span className="text-sm text-[hsl(215,15%,55%)] mt-2">{label}</span>
      )}
    </div>
  );
};

export default GaugeChart;

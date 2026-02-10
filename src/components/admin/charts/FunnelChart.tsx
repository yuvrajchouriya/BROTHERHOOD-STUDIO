import { funnelColors } from '@/lib/chartTheme';

interface FunnelStep {
  name: string;
  value: number;
  percentage?: number;
  dropRate?: number;
}

interface FunnelChartProps {
  data: FunnelStep[];
  height?: number;
  showDropRate?: boolean;
  showPercentage?: boolean;
}

const FunnelChart = ({
  data,
  height = 400,
  showDropRate = true,
  showPercentage = true,
}: FunnelChartProps) => {
  // Calculate percentages and drop rates
  const maxValue = Math.max(...data.map(d => d.value));
  const processedData = data.map((item, index) => {
    const percentage = (item.value / maxValue) * 100;
    const prevValue = index > 0 ? data[index - 1].value : item.value;
    const dropRate = index > 0 ? ((prevValue - item.value) / prevValue) * 100 : 0;
    
    return {
      ...item,
      percentage,
      dropRate,
    };
  });

  const stepHeight = (height - 40) / data.length;
  const minWidth = 100;
  const maxWidth = 300;

  return (
    <div className="w-full admin-chart-container p-4" style={{ minHeight: height }}>
      <div className="relative flex flex-col items-center gap-1">
        {processedData.map((step, index) => {
          const widthPercentage = step.percentage;
          const width = minWidth + ((maxWidth - minWidth) * widthPercentage) / 100;
          const color = funnelColors[index % funnelColors.length];
          const nextWidth = index < processedData.length - 1 
            ? minWidth + ((maxWidth - minWidth) * processedData[index + 1].percentage) / 100
            : width;

          return (
            <div key={step.name} className="relative w-full flex flex-col items-center">
              {/* Funnel step */}
              <div
                className="relative flex items-center justify-center transition-all duration-500 cursor-pointer group"
                style={{
                  width: `${width}px`,
                  height: `${stepHeight - 10}px`,
                  background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                  clipPath: `polygon(0 0, 100% 0, ${50 + (nextWidth / width) * 50}% 100%, ${50 - (nextWidth / width) * 50}% 100%)`,
                  boxShadow: `0 0 20px ${color}40`,
                }}
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${color}60 0%, transparent 70%)`,
                  }}
                />
                
                {/* Step content */}
                <div className="relative z-10 text-center px-4">
                  <div className="font-bold text-white text-shadow-lg">
                    {step.name}
                  </div>
                  <div className="text-white/90 text-sm font-medium">
                    {step.value.toLocaleString()}
                    {showPercentage && (
                      <span className="ml-1 text-xs opacity-80">
                        ({step.percentage.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Drop rate indicator */}
              {showDropRate && index > 0 && step.dropRate > 0 && (
                <div className="absolute -right-24 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div 
                    className="h-px w-8"
                    style={{ background: `linear-gradient(to right, ${color}, transparent)` }}
                  />
                  <div className="text-xs text-[hsl(348,100%,60%)] font-medium whitespace-nowrap">
                    ↓ {step.dropRate.toFixed(0)}% drop
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {processedData.map((step, index) => (
          <div key={step.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: funnelColors[index % funnelColors.length],
                boxShadow: `0 0 8px ${funnelColors[index % funnelColors.length]}80`,
              }}
            />
            <span className="text-xs text-[hsl(215,15%,55%)]">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FunnelChart;

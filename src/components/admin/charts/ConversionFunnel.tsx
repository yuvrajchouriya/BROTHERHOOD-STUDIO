import { funnelColors, chartColors } from '@/lib/chartTheme';
import { Progress } from '@/components/ui/progress';

interface FunnelStep {
  name: string;
  value: number;
  icon?: React.ReactNode;
}

interface ConversionFunnelProps {
  data: FunnelStep[];
  showPercentages?: boolean;
  showDropRates?: boolean;
}

const ConversionFunnel = ({
  data,
  showPercentages = true,
  showDropRates = true,
}: ConversionFunnelProps) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const processedData = data.map((item, index) => {
    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
    const prevValue = index > 0 ? data[index - 1].value : item.value;
    const dropRate = index > 0 && prevValue > 0
      ? ((prevValue - item.value) / prevValue) * 100
      : 0;
    const conversionFromStart = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

    return {
      ...item,
      percentage,
      dropRate,
      conversionFromStart,
    };
  });

  return (
    <div className="w-full space-y-4">
      {processedData.map((step, index) => {
        const color = funnelColors[index % funnelColors.length];
        const isLast = index === processedData.length - 1;

        return (
          <div key={step.name} className="relative">
            {/* Step card */}
            <div
              className="relative rounded-lg border p-4 transition-all duration-300"
              style={{
                borderColor: `${color}40`,
                background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {step.icon && (
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      {step.icon}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-[hsl(215,20%,88%)]">{step.name}</h4>
                    <p className="text-xs text-[hsl(215,15%,55%)]">
                      Step {index + 1} of {data.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color: color,
                      textShadow: `0 0 15px ${color}40`,
                    }}
                  >
                    {step.value.toLocaleString()}
                  </div>
                  {showPercentages && (
                    <p className="text-xs text-[hsl(215,15%,55%)]">
                      {step.conversionFromStart.toFixed(1)}% of total
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 rounded-full overflow-hidden bg-[hsl(222,30%,15%)]">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${step.percentage}%`,
                    background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
                    boxShadow: `0 0 10px ${color}60`,
                  }}
                />
              </div>
            </div>

            {/* Drop rate connector */}
            {!isLast && showDropRates && (
              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-px h-6"
                    style={{
                      background: `linear-gradient(to bottom, ${color}40, ${funnelColors[(index + 1) % funnelColors.length]}40)`,
                    }}
                  />
                  <div
                    className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    style={{
                      backgroundColor: step.dropRate > 50 ? 'hsl(348, 100%, 60%, 0.15)' : 'hsl(35, 100%, 50%, 0.15)',
                      color: step.dropRate > 50 ? chartColors.neonRed : chartColors.neonOrange,
                    }}
                  >
                    <span>↓</span>
                    <span>{step.dropRate.toFixed(0)}% drop</span>
                  </div>
                  <div
                    className="w-px h-6"
                    style={{
                      background: `linear-gradient(to bottom, ${color}40, ${funnelColors[(index + 1) % funnelColors.length]}40)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="mt-6 p-4 rounded-lg border border-[hsl(222,30%,25%)] bg-[hsl(222,47%,8%)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[hsl(215,15%,55%)]">Overall Conversion Rate</span>
          <span
            className="text-lg font-bold"
            style={{
              color: chartColors.neonGreen,
              textShadow: `0 0 15px ${chartColors.neonGreen}40`,
            }}
          >
            {processedData.length > 0
              ? `${processedData[processedData.length - 1].conversionFromStart.toFixed(1)}%`
              : '0%'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel;

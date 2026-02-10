// Admin Panel Chart Theme Configuration
// Dark Neon Navy Blue Color Palette

export const chartColors = {
  // Primary gradient colors
  neonCyan: '#00d4ff',
  neonPurple: '#7c3aed',
  neonGreen: '#00ff88',
  neonOrange: '#ffaa00',
  neonRed: '#ff3366',
  
  // Background colors
  cardBg: 'hsl(222, 47%, 10%)',
  gridLine: 'rgba(255, 255, 255, 0.05)',
  
  // Text colors
  axisText: 'hsl(215, 15%, 55%)',
  labelText: 'hsl(215, 20%, 88%)',
};

// Gradient definitions for Recharts
export const chartGradients = {
  cyan: {
    id: 'cyanGradient',
    colors: [
      { offset: '0%', color: '#00d4ff', opacity: 0.8 },
      { offset: '100%', color: '#00d4ff', opacity: 0.1 },
    ],
  },
  purple: {
    id: 'purpleGradient',
    colors: [
      { offset: '0%', color: '#7c3aed', opacity: 0.8 },
      { offset: '100%', color: '#7c3aed', opacity: 0.1 },
    ],
  },
  cyanToPurple: {
    id: 'cyanToPurpleGradient',
    colors: [
      { offset: '0%', color: '#00d4ff', opacity: 0.9 },
      { offset: '100%', color: '#7c3aed', opacity: 0.9 },
    ],
  },
  success: {
    id: 'successGradient',
    colors: [
      { offset: '0%', color: '#00ff88', opacity: 0.8 },
      { offset: '100%', color: '#00ff88', opacity: 0.1 },
    ],
  },
};

// Tooltip styles
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(222, 47%, 10%)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
    color: 'hsl(215, 20%, 88%)',
  },
  labelStyle: {
    color: 'hsl(215, 20%, 88%)',
    fontWeight: 600,
  },
  itemStyle: {
    color: 'hsl(215, 15%, 70%)',
  },
};

// Axis styles
export const axisStyle = {
  tick: {
    fill: chartColors.axisText,
    fontSize: 12,
  },
  axisLine: {
    stroke: chartColors.gridLine,
  },
};

// Grid styles
export const gridStyle = {
  strokeDasharray: '3 3',
  stroke: chartColors.gridLine,
};

// Legend styles
export const legendStyle = {
  wrapperStyle: {
    color: chartColors.labelText,
  },
};

// Pie chart color palette
export const pieColors = [
  chartColors.neonCyan,
  chartColors.neonPurple,
  chartColors.neonGreen,
  chartColors.neonOrange,
  chartColors.neonRed,
];

// Bar chart color palette
export const barColors = {
  primary: chartColors.neonCyan,
  secondary: chartColors.neonPurple,
  success: chartColors.neonGreen,
  warning: chartColors.neonOrange,
  error: chartColors.neonRed,
};

// Funnel chart colors
export const funnelColors = [
  '#00d4ff',
  '#00b8e6',
  '#009dcc',
  '#0082b3',
  '#006699',
];

// Gauge chart zones
export const gaugeZones = {
  good: { color: chartColors.neonGreen, min: 80, max: 100 },
  medium: { color: chartColors.neonOrange, min: 50, max: 79 },
  poor: { color: chartColors.neonRed, min: 0, max: 49 },
};

// Status colors
export const statusColors = {
  good: chartColors.neonGreen,
  medium: chartColors.neonOrange,
  poor: chartColors.neonRed,
  neutral: chartColors.neonCyan,
};

// Animation durations
export const animationDuration = {
  fast: 300,
  normal: 500,
  slow: 1000,
};

// Glow effects for chart elements
export const glowEffects = {
  cyan: {
    filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))',
  },
  purple: {
    filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.6))',
  },
  green: {
    filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.6))',
  },
};

export default {
  chartColors,
  chartGradients,
  tooltipStyle,
  axisStyle,
  gridStyle,
  legendStyle,
  pieColors,
  barColors,
  funnelColors,
  gaugeZones,
  statusColors,
  animationDuration,
  glowEffects,
};

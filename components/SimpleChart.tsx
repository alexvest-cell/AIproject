import React from 'react';

interface SimpleChartProps {
  data: { year: string; value: number }[];
  color: string; // Tailwind text color class, e.g., "text-red-500"
  unit: string;
  title: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, color, unit, title }) => {
  if (!data || data.length === 0) return null;

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = 40;

  // Calculate scales
  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  // Add some buffer to the Y scale
  const range = maxVal - minVal;
  const yMin = minVal - (range * 0.1);
  const yMax = maxVal + (range * 0.1);
  
  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * (width - padding * 2);
  };

  const getY = (value: number) => {
    return height - padding - ((value - yMin) / (yMax - yMin)) * (height - padding * 2);
  };

  // Create path data
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const linePath = `M ${points}`;
  
  // Create area path
  const areaPath = `${linePath} L ${getX(data.length - 1)},${height - padding} L ${padding},${height - padding} Z`;

  // Helper to extract hex-like color from prop (simplified mapping for gradient)
  const getColorValue = (colorClass: string) => {
      if (colorClass.includes('red')) return '#ef4444';
      if (colorClass.includes('blue')) return '#3b82f6';
      if (colorClass.includes('green') || colorClass.includes('emerald')) return '#10b981';
      if (colorClass.includes('yellow')) return '#eab308';
      if (colorClass.includes('orange')) return '#f97316';
      if (colorClass.includes('indigo')) return '#6366f1';
      if (colorClass.includes('cyan')) return '#06b6d4';
      if (colorClass.includes('gray')) return '#9ca3af';
      return '#ffffff';
  };

  const hexColor = getColorValue(color);

  return (
    <div className="w-full">
        <div className="flex justify-between items-end mb-6 px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{title}</h3>
            <span className={`text-xs font-mono ${color}`}>{unit}</span>
        </div>
        
        <div className="relative w-full aspect-[21/9] bg-zinc-900/50 rounded-lg border border-white/5 overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <defs>
                    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={hexColor} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={hexColor} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines (Horizontal) */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
                    const y = height - padding - (tick * (height - padding * 2));
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#333" strokeWidth="1" strokeDasharray="4" />
                            <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-gray-600 text-[10px] font-mono">
                                {Math.round((yMin + tick * (yMax - yMin)) * 100) / 100}
                            </text>
                        </g>
                    );
                })}

                {/* Area */}
                <path d={areaPath} fill={`url(#gradient-${title})`} />

                {/* Line */}
                <path d={linePath} fill="none" stroke={hexColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points (Only first, middle, last) */}
                {data.map((d, i) => {
                    if (i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) {
                        return (
                            <g key={i}>
                                <circle cx={getX(i)} cy={getY(d.value)} r="4" fill="#000" stroke={hexColor} strokeWidth="2" />
                                <text 
                                    x={getX(i)} 
                                    y={height - 15} 
                                    textAnchor="middle" 
                                    className="fill-gray-500 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    {d.year}
                                </text>
                            </g>
                        )
                    }
                    return null;
                })}
            </svg>
        </div>
    </div>
  );
};

export default SimpleChart;
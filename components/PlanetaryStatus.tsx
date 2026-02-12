import React from 'react';
import { Section } from '../types';
import { Thermometer, CloudFog, Droplets, MountainSnow, TrendingUp, AlertTriangle, Waves, Trees, Bird, Flame, ArrowRight } from 'lucide-react';

interface PlanetaryStatusProps {
  onDashboardClick: () => void;
}

const stats = [
  {
    id: 1,
    label: "Global Temperature",
    value: "+1.48°C",
    unit: "Since 1850",
    desc: "Approaching the critical 1.5°C threshold established by the Paris Agreement.",
    source: "NASA / IPCC",
    icon: Thermometer,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20"
  },
  {
    id: 2,
    label: "Atmospheric CO₂",
    value: "426",
    unit: "Parts Per Million",
    desc: "Highest levels in 14 million years. Safe level is considered 350 ppm.",
    source: "NOAA GML",
    icon: CloudFog,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20"
  },
  {
    id: 3,
    label: "Ice Sheet Mass",
    value: "-427",
    unit: "Gt Per Year",
    desc: "Combined average annual loss from Antarctica and Greenland ice sheets.",
    source: "NASA GRACE",
    icon: MountainSnow,
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  },
  {
    id: 4,
    label: "Sea Level Rise",
    value: "+3.4",
    unit: "mm Per Year",
    desc: "Accelerating rate due to thermal expansion and melting glaciers.",
    source: "CSIRO / NOAA",
    icon: Droplets,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    id: 5,
    label: "Ocean Acidity",
    value: "8.05",
    unit: "pH (Surface Avg)",
    desc: "30% increase in acidity since pre-industrial times, threatening marine life.",
    source: "EPA / NOAA",
    icon: Waves,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20"
  },
  {
    id: 6,
    label: "Biodiversity Loss",
    value: "-73%",
    unit: "Since 1970",
    desc: "Average decline in monitored wildlife populations across the globe.",
    source: "WWF Living Planet",
    icon: Bird,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
  {
    id: 7,
    label: "Primary Forest Loss",
    value: "3.7M",
    unit: "Hectares / Year",
    desc: "Loss of critical tropical rainforest, equivalent to 10 football fields per minute.",
    source: "WRI / GFW",
    icon: Trees,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    id: 8,
    label: "Methane Levels",
    value: "1934",
    unit: "Parts Per Billion",
    desc: "A potent greenhouse gas with 80x the warming power of CO₂ in the short term.",
    source: "NOAA",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20"
  }
];

const PlanetaryStatus: React.FC<PlanetaryStatusProps> = ({ onDashboardClick }) => {
  return (
    <section id={Section.STATUS} className="py-12 md:py-24 bg-black text-white relative overflow-hidden">
      
      {/* Background Graphic Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
      <div className="absolute -left-20 top-20 w-96 h-96 bg-news-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-5 md:px-12 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-news-live font-bold uppercase tracking-widest text-xs mb-3 border border-news-live/30 px-3 py-1 rounded-full bg-news-live/10 animate-pulse">
              <AlertTriangle size={12} />
              <span>Planetary Vitals • Live Data</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-3 md:mb-4">The State of the Earth</h2>
            <p className="text-news-muted text-base md:text-lg leading-relaxed mb-4 md:mb-6">
              We are currently operating outside the safe operating space for humanity. 
              These key indicators track the accelerating impact of the Anthropocene on our biosphere.
            </p>
            <button 
                onClick={onDashboardClick}
                className="group inline-flex items-center gap-2 text-news-accent font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
                <span>View Full Earth Dashboard</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Updated</p>
            <p className="text-white font-serif text-xl">January 2026</p>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              className={`group relative p-5 md:p-8 rounded-xl md:rounded-2xl border ${stat.border} bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-900 transition-all duration-300 flex flex-col h-full`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={20} className="md:w-6 md:h-6" />
              </div>
              
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2">
                {stat.label}
              </h3>
              
              <div className="flex items-baseline gap-2 mb-0.5 md:mb-1">
                <span className={`text-3xl md:text-5xl font-serif font-bold text-white`}>
                  {stat.value}
                </span>
              </div>
              
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 md:mb-4 ${stat.color}`}>
                {stat.unit}
              </p>
              
              <div className="h-px w-full bg-white/10 mb-3 md:mb-4"></div>
              
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors mb-4 md:mb-6 flex-grow">
                {stat.desc}
              </p>

              <div className="mt-auto pt-2">
                 <p className="text-[9px] md:text-[10px] text-gray-600 uppercase tracking-widest font-bold group-hover:text-gray-500 transition-colors">
                    Source: <span className="text-gray-500 group-hover:text-white">{stat.source}</span>
                 </p>
              </div>

              {/* Decorative Corner */}
              <div className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <TrendingUp size={16} className={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* 1.5C Warning Bar */}
        <div className="mt-8 md:mt-12 bg-zinc-900/80 border border-white/10 rounded-xl p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="flex-shrink-0 flex items-center gap-4 w-full md:w-auto">
                 <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                    <AlertTriangle size={24} />
                 </div>
                 <div className="text-left">
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">1.5°C Warming Limit</h4>
                    <p className="text-gray-500 text-xs">Paris Agreement Threshold</p>
                 </div>
            </div>

            <div className="flex-grow w-full">
                <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    <span>Pre-Industrial (0°C)</span>
                    <span className="text-white">Current (+1.48°C)</span>
                    <span className="text-red-500">Limit (+1.5°C)</span>
                </div>
                <div className="h-3 md:h-4 bg-white/10 rounded-full overflow-hidden relative">
                    {/* Safe Zone */}
                    <div className="absolute left-0 top-0 h-full w-[66%] bg-gradient-to-r from-emerald-500 to-yellow-500 opacity-20"></div>
                    {/* Danger Zone */}
                    <div className="absolute right-0 top-0 h-full w-[33%] bg-red-500/20"></div>
                    
                    {/* Progress Bar */}
                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 w-[98%] shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                    
                    {/* Markers */}
                    <div className="absolute left-[99%] top-0 h-full w-0.5 bg-white z-10 shadow-[0_0_10px_white]"></div>
                </div>
                <p className="text-right text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest animate-pulse">
                   Threshold Imminent
                </p>
            </div>
        </div>

      </div>
    </section>
  );
};

export default PlanetaryStatus;
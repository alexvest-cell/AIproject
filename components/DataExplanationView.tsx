import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen, Activity, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { ExplanationData } from '../types';
import SimpleChart from './SimpleChart';

interface DataExplanationViewProps {
    data: ExplanationData;
    onBack: () => void;
}

const DataExplanationView: React.FC<DataExplanationViewProps> = ({ data, onBack }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [data]);

    return (
        <div className="bg-black min-h-screen text-white font-sans animate-fade-in relative">

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-4xl pt-32 pb-24">

                {/* Navigation */}


                {/* Header */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12 border-b border-white/10 pb-12">
                    <div className={`p-6 rounded-2xl ${data.color.replace('text-', 'bg-')}/20 border ${data.color.replace('text-', 'border-')}/30`}>
                        <data.icon size={48} className={data.color} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">{data.title}</h1>
                        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
                            {data.value && (
                                <span className="bg-white/10 px-3 py-1 rounded text-white border border-white/10">
                                    Current: {data.value}
                                </span>
                            )}
                            {data.trend && (
                                <span className={`${data.color} flex items-center gap-2`}>
                                    <Activity size={14} />
                                    Trend: {data.trend}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Cards */}
                <div className="grid gap-6">

                    {/* Chart Section - Only render if history exists */}
                    {data.history && data.history.length > 0 && (
                        <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 backdrop-blur-sm mb-2">
                            <div className="flex items-center gap-3 mb-6 text-news-accent">
                                <TrendingUp size={20} />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Historical Trend</h3>
                            </div>
                            <SimpleChart
                                data={data.history}
                                color={data.color}
                                unit={data.value?.split(' ')[1] || 'Value'}
                                title={`${data.title} Development`}
                            />
                        </div>
                    )}

                    {/* 1. Definition */}
                    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4 text-emerald-400">
                            <BookOpen size={20} />
                            <h3 className="text-sm font-bold uppercase tracking-widest">In Simple Terms</h3>
                        </div>
                        <p className="text-xl text-white leading-relaxed font-serif">
                            {data.detailedInfo.definition}
                        </p>
                    </div>

                    {/* 2. Context */}
                    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4 text-yellow-400">
                            <Lightbulb size={20} />
                            <h3 className="text-sm font-bold uppercase tracking-widest">The Context</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {data.detailedInfo.context}
                        </p>
                    </div>

                    {/* 3. Impact */}
                    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4 text-red-400">
                                <AlertTriangle size={20} />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Why It Matters</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {data.detailedInfo.impact}
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DataExplanationView;

// Safelist for dynamic classes used in this component:
// bg-red-500/20 border-red-500/30
// bg-gray-400/20 border-gray-400/30
// bg-cyan-300/20 border-cyan-300/30
// bg-blue-500/20 border-blue-500/30
// bg-indigo-400/20 border-indigo-400/30
// bg-yellow-500/20 border-yellow-500/30
// bg-emerald-500/20 border-emerald-500/30
// bg-orange-500/20 border-orange-500/30
import React from 'react';
import { Section } from '../types';
import { ArrowRight, BrainCircuit } from 'lucide-react';

interface AboutProps {
    onShowAbout: () => void;
}



const About: React.FC<AboutProps> = ({ onShowAbout }) => {
    return (
        <section id={Section.ABOUT} className="py-8 md:py-12 bg-zinc-950 border-y border-white/5">
            <div className="container mx-auto px-4 md:px-8">

                {/* Compact GlassHUD Card */}
                <div className="relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/10 p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 group">

                    {/* Background Glows */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-news-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-news-accent/10 transition-colors duration-700"></div>

                    {/* Left: Branding & Core Message */}
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 relative z-10 w-full lg:w-auto text-center md:text-left">
                        <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:border-news-accent/30 transition-colors duration-500">
                            <BrainCircuit className="text-news-accent" size={24} />
                        </div>

                        <div className="flex flex-col items-center md:items-start">
                            <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-2 md:mb-1 flex flex-col md:flex-row items-center md:gap-2">
                                <span>Powered by AI.</span>
                                <span className="hidden md:inline text-gray-600">•</span>
                                <span className="text-gray-400">Grounded in Science.</span>
                            </h2>
                            <p className="text-sm text-gray-400 font-light max-w-lg leading-relaxed">
                                Our consensus engine scans <span className="text-gray-200 font-medium">NASA, IPCC, & NOAA</span> feeds daily, synthesizing complex climate data into verified intelligence.
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions & Status */}
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto flex-shrink-0 relative z-10 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">

                        {/* Status Indicator */}
                        <div className="flex items-center gap-3 md:mr-auto lg:mr-0">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 blur-sm animate-pulse"></div>
                            </div>
                            <div className="flex flex-col text-left md:text-left">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">System Status</span>
                                <span className="text-xs font-bold text-white">Live Verification Active</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={onShowAbout}
                                className="flex-1 md:flex-none py-2 px-4 bg-white text-black text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                About <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default About;
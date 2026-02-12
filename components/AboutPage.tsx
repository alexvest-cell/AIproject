import React, { useEffect } from 'react';
import {
    Database, Cpu, ShieldCheck, FileCheck, Globe, BookOpen,
    Microscope, Newspaper, Radio, ArrowLeft, Activity,
    Layers, Search, Share2, Server
} from 'lucide-react';

interface AboutPageProps {
    onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-zinc-950 min-h-screen text-white pt-44 pb-24 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">

                {/* Hero Section */}
                <header className="mb-12 md:mb-16">

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-white mb-8 leading-[0.9]">
                        Environmental Intelligence <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Made Clear.</span>
                    </h1>
                </header>

                {/* The Mission - New Content */}
                <section className="mb-32 grid md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-4">
                        <div className="sticky top-24">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Our Mission</span>
                            <h2 className="text-2xl font-bold text-white mb-4">Trusted Intelligence for Everyone</h2>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                We bring environmental journalism to life with clarity, credibility, and relevance—making the complex understandable and the urgent accessible.
                            </p>
                        </div>
                    </div>
                    <div className="md:col-span-8 space-y-6">
                        <div className="prose prose-invert max-w-none">
                            <p className="text-zinc-300 leading-relaxed mb-6">
                                Planetary Brief brings trusted environmental intelligence to life. We deliver clear, engaging journalism that explains how climate, energy, nature, and policy intersect in the world around us. Our mission is to make the complex understandable, the urgent relevant, and the science meaningful—so readers feel informed rather than overwhelmed.
                            </p>
                            <p className="text-zinc-300 leading-relaxed mb-6">
                                We believe environmental reporting should be grounded in evidence and shaped by the best available science, but told in a way that people actually want to read. Through daily briefs, in-depth explainers, and narrative-driven reporting, we focus on what is happening, why it matters, and what it means for the future.
                            </p>
                            <p className="text-zinc-300 leading-relaxed mb-6">
                                Planetary Brief prioritises clarity, credibility, and relevance over hype. Our reporting is based on established research and trusted scientific and journalistic sources, with careful attention to accuracy, context, and plain language. Every article is written to reflect current knowledge while remaining engaging and accessible to a broad audience.
                            </p>
                            <p className="text-zinc-300 leading-relaxed mb-6">
                                We are especially focused on reaching readers who find traditional environmental reporting too dense, too technical, or too detached from everyday life. Climate change, biodiversity loss, and energy transitions affect everyone, and understanding them should not require a scientific background.
                            </p>
                            <p className="text-zinc-300 leading-relaxed">
                                Planetary Brief is an independent platform for learning, perspective, and insight into a rapidly changing planet. We invite readers to explore, question, and better understand the forces shaping the environment—and the choices that will define what comes next.
                            </p>
                        </div>
                    </div>
                </section>

                {/* The Engine - Methodology Pipeline */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">The Intelligence Engine</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            How we turn raw planetary data into the briefing you read.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                            {[
                                {
                                    icon: Database,
                                    title: "Ingestion",
                                    desc: "Monitoring 50+ trusted scientific feeds daily.",
                                    color: "text-blue-400"
                                },
                                {
                                    icon: Cpu,
                                    title: "Synthesis",
                                    desc: "LLMs extract key findings & statistical trends.",
                                    color: "text-purple-400"
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Verification",
                                    desc: "Fact-checking against source documents.",
                                    color: "text-emerald-400"
                                },
                                {
                                    icon: FileCheck,
                                    title: "Briefing",
                                    desc: "Structured, concise delivery to you.",
                                    color: "text-orange-400"
                                }
                            ].map((step, idx) => (
                                <div key={idx} className="group relative bg-black border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all">
                                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors ${step.color}`}>
                                        <step.icon size={24} />
                                    </div>
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Step 0{idx + 1}</div>
                                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Architecture - Source Grid */}
                <section>
                    <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-white">Trust Architecture</h2>
                            <p className="text-zinc-400 text-sm mt-1">Primary sources powering our consensus engine.</p>
                        </div>
                        <Globe className="text-zinc-600" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Scientific Bodies */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Server size={12} /> Scientific Bodies
                            </h3>
                            <div className="grid gap-2">
                                {["IPCC", "NASA Earth", "NOAA", "WMO", "Copernicus EU"].map(item => (
                                    <div key={item} className="px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-sm text-zinc-300 font-mono">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Journals */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={12} /> Peer-Reviewed Journals
                            </h3>
                            <div className="grid gap-2">
                                {["Nature Climate", "Science Advances", "PLOS One", "Env. Research Letters"].map(item => (
                                    <div key={item} className="px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-sm text-zinc-300 font-mono">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Analysis */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} /> Analysis & Data
                            </h3>
                            <div className="grid gap-2">
                                {["Carbon Brief", "Our World in Data", "Global Carbon Project", "IEA"].map(item => (
                                    <div key={item} className="px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-sm text-zinc-300 font-mono">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer simple mark */}
                <div className="mt-32 pt-12 border-t border-white/5 text-center">
                    <p className="text-zinc-600 text-sm font-mono">
                        Planetary Brief v1.0
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AboutPage;

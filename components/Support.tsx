import React, { useEffect } from 'react';
import { ExternalLink, Heart } from 'lucide-react';

interface SupportProps {
    onBack: () => void;
}

interface Organization {
    name: string;
    url: string;
    focus: string;
}

const organizations: Organization[] = [
    {
        name: 'World Wide Fund for Nature',
        url: 'https://www.worldwildlife.org',
        focus: 'Conservation & Wildlife Protection'
    },
    {
        name: 'Greenpeace',
        url: 'https://www.greenpeace.org',
        focus: 'Environmental Activism & Campaigns'
    },
    {
        name: 'Friends of the Earth',
        url: 'https://www.foei.org',
        focus: 'Environmental Justice & Grassroots Action'
    },
    {
        name: 'The Nature Conservancy',
        url: 'https://www.nature.org',
        focus: 'Land & Water Conservation'
    },
    {
        name: 'Conservation International',
        url: 'https://www.conservation.org',
        focus: 'Biodiversity & Nature Protection'
    },
    {
        name: 'Environmental Defense Fund',
        url: 'https://www.edf.org',
        focus: 'Climate Solutions & Policy'
    },
    {
        name: 'Rainforest Alliance',
        url: 'https://www.rainforest-alliance.org',
        focus: 'Sustainable Forestry & Agriculture'
    },
    {
        name: '350.org',
        url: 'https://350.org',
        focus: 'Climate Movement & Fossil Fuel Resistance'
    },
    {
        name: 'Oceana',
        url: 'https://oceana.org',
        focus: 'Ocean Conservation & Marine Life'
    },
    {
        name: 'World Resources Institute',
        url: 'https://www.wri.org',
        focus: 'Research & Data-Driven Solutions'
    },
    {
        name: 'ClientEarth',
        url: 'https://www.clientearth.org',
        focus: 'Environmental Law & Legal Action'
    },
    {
        name: 'Global Witness',
        url: 'https://www.globalwitness.org',
        focus: 'Corporate Accountability & Investigation'
    }
];

const Support: React.FC<SupportProps> = ({ onBack }) => {
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
                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-white mb-8 leading-[0.9]">
                        Support Environmental
                        <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Action.</span>
                    </h1>
                </header>

                {/* Explainer Section */}
                <section className="mb-16">
                    <div className="p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Heart className="text-emerald-500" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-white mb-4">Why Support Matters</h2>
                            </div>
                        </div>
                        <div className="prose prose-invert max-w-none space-y-4">
                            <p className="text-zinc-300 leading-relaxed">
                                Supporting environmental organisations is one of the most direct ways individuals can contribute to climate action and nature protection. These groups work on conservation, climate solutions, environmental justice, and holding governments and companies accountable. Donations typically fund field projects, research, legal action, and public campaigns aimed at protecting ecosystems and reducing environmental harm.
                            </p>
                            <p className="text-zinc-300 leading-relaxed">
                                The organisations listed below are internationally recognised, operate at scale, and are commonly cited by scientists, journalists, and policymakers. Supporting them helps sustain long-term work on biodiversity, climate stability, clean energy transitions, and environmental rights.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Organizations Grid */}
                <section>
                    <div className="mb-8">
                        <h2 className="text-2xl font-serif font-bold text-white mb-2">Trusted Organizations</h2>
                        <p className="text-zinc-400 text-sm">Click any organization to visit their website and learn more about their work</p>
                    </div>

                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                        {organizations.map((org, index) => (
                            <a
                                key={index}
                                href={org.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-black border border-white/10 p-6 rounded-2xl hover:border-emerald-500/30 transition-all hover:bg-white/5"
                            >
                                <div className="flex flex-col h-full">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                        {org.name}
                                    </h3>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4 font-bold">
                                        {org.focus}
                                    </p>
                                    <div className="mt-auto flex items-center gap-2 text-emerald-500 text-sm font-bold group-hover:gap-3 transition-all">
                                        <span>Support</span>
                                        <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                </div>

                                {/* Hover glow effect */}
                                <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors pointer-events-none"></div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Footer Note */}
                <div className="mt-16 pt-8 border-t border-white/5 text-center">
                    <p className="text-zinc-600 text-sm">
                        Planetary Brief is independent and not affiliated with any of these organizations. We do not receive compensation for these listings.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Support;

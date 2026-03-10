import React, { useEffect, useState } from 'react';
import { Stack } from '../types';
import { Layers, ArrowRight, Play, Server, Command, Cpu, Layout } from 'lucide-react';

interface StackHubPageProps {
  onStackClick: (slug: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Marketing': <Layout size={16} />,
  'Development': <Command size={16} />,
  'Startup Operations': <Server size={16} />,
  'Operations': <Server size={16} />,
  'Content Creation': <Play size={16} />,
  'Automation': <Cpu size={16} />
};

const StackHubPage: React.FC<StackHubPageProps> = ({ onStackClick }) => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Best Software Stacks (2026) | ToolCurrent';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Discover curated software stacks and tool ecosystems for marketing, development, start-ups, and more.');
    }

    fetch('/api/stacks')
      .then(res => res.json())
      .then(data => {
        setStacks(data || []);
      })
      .catch(err => console.error('Failed to load stacks:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-base text-news-text font-sans pt-[112px]">
      {/* Hero Section */}
      <div className="bg-surface-card border-b border-border-divider relative overflow-hidden">
        <div className="absolute inset-0 bg-news-accent/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-news-accent/10 border border-news-accent/20 text-news-accent text-xs font-bold uppercase tracking-widest mb-6">
                <Layers size={14} /> Ecosystems
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                Software Stacks
              </h1>
              <p className="text-xl md:text-2xl text-news-muted font-light leading-relaxed mb-6">
                Discover the perfect combination of tools for any workflow. Instead of hunting for individual apps, deploy proven ecosystems used by top teams.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stacks Grid */}
      <div className="container mx-auto px-4 md:px-8 py-16 max-w-7xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-news-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {stacks.map(stack => (
              <button
                key={stack.id}
                onClick={() => onStackClick(stack.slug)}
                className="group flex flex-col text-left bg-surface-card border border-border-subtle hover:border-news-accent/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-elevation hover:-translate-y-1 h-full"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-surface-alt overflow-hidden">
                  {stack.hero_image ? (
                    <img 
                      src={stack.hero_image} 
                      alt={stack.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-alt to-surface-hover group-hover:from-surface-hover group-hover:to-surface-card transition-colors">
                      <Layers size={48} className="text-news-muted/30" />
                    </div>
                  )}
                  {/* Category Badge overlay */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl">
                    {CATEGORY_ICONS[stack.workflow_category] || <Layers size={10} />}
                    {stack.workflow_category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-black text-white mb-2 group-hover:text-news-accent transition-colors line-clamp-2">
                    {stack.name}
                  </h2>
                  <p className="text-sm text-news-muted leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {stack.short_description}
                  </p>
                  
                  {/* Footer - Tool Count & CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-4 border-t border-border-subtle">
                    <span className="text-xs font-bold text-news-text">
                      {stack.tools?.length || 0} Tools Included
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-black text-news-accent group-hover:gap-2 transition-all">
                      View Stack <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StackHubPage;

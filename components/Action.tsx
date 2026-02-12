import React from 'react';
import { Section, Article } from '../types';
import { ExternalLink, Leaf, Droplets, Zap, Heart, Scale, Recycle, TreePine, Megaphone, Globe, Utensils, ArrowRight } from 'lucide-react';

interface ActionProps {
  onSeeFullGuide: () => void;
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const actions = [
  {
    title: "Support Activism",
    org: "Greenpeace",
    desc: "Join global campaigns to hold polluters accountable and influence environmental policy.",
    link: "https://www.greenpeace.org/",
    icon: Megaphone,
    color: "text-green-500"
  },
  {
    title: "Protect Wildlife",
    org: "World Wildlife Fund",
    desc: "Conserve nature and reduce the most pressing threats to the diversity of life on Earth.",
    link: "https://www.worldwildlife.org/",
    icon: Heart,
    color: "text-orange-500"
  },
  {
    title: "Clean The Oceans",
    org: "The Ocean Cleanup",
    desc: "Support advanced technologies to rid the world's oceans of plastic.",
    link: "https://theoceancleanup.com/",
    icon: Droplets,
    color: "text-blue-500"
  },
  {
    title: "Reforestation",
    org: "One Tree Planted",
    desc: "Restore forests, create habitat for biodiversity, and make a positive social impact.",
    link: "https://onetreeplanted.org/",
    icon: TreePine,
    color: "text-emerald-600"
  },
  {
    title: "Legal Defense",
    org: "Earthjustice",
    desc: "The premier nonprofit public interest environmental law organization.",
    link: "https://earthjustice.org/",
    icon: Scale,
    color: "text-yellow-500"
  },
  {
    title: "End Plastic Pollution",
    org: "Plastic Pollution Coalition",
    desc: "A global alliance working toward a world free of plastic pollution.",
    link: "https://www.plasticpollutioncoalition.org/",
    icon: Recycle,
    color: "text-cyan-400"
  },
  {
    title: "Sustainable Energy",
    org: "Rewiring America",
    desc: "Electrify your home and community to save money and the climate.",
    link: "https://www.rewiringamerica.org/",
    icon: Zap,
    color: "text-yellow-400"
  },
  {
    title: "Climate Education",
    org: "Climate Reality Project",
    desc: "Catalyzing a global solution to the climate crisis by making urgent action a necessity.",
    link: "https://www.climaterealityproject.org/",
    icon: Globe,
    color: "text-blue-400"
  },
  {
    title: "Preserve Habitats",
    org: "The Nature Conservancy",
    desc: "Conserving the lands and waters on which all life depends.",
    link: "https://www.nature.org/",
    icon: Leaf,
    color: "text-green-400"
  },
  {
    title: "Reduce Food Waste",
    org: "Too Good To Go",
    desc: "Rescue unsold food from shops and restaurants to save it from going to waste.",
    link: "https://toogoodtogo.com/",
    icon: Utensils,
    color: "text-pink-500"
  }
];

const Action: React.FC<ActionProps> = ({ onSeeFullGuide, articles, onArticleClick }) => {
  const actArticle = articles?.find(a => a.title === "Act" || (Array.isArray(a.category) ? a.category.includes("Act") : a.category === "Act"));

  return (
    <section id={Section.ACTION} className="py-12 md:py-24 bg-black text-white relative">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-news-accent/20 to-transparent"></div>

      <div className="container mx-auto px-5 md:px-12">
        <div className="text-center mb-10 md:mb-16 max-w-3xl mx-auto">
          <span className="text-news-accent font-bold uppercase tracking-widest text-xs mb-2 md:mb-3 block">Real Impact</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 md:mb-6">From Awareness to Action</h2>
          <p className="text-gray-400 text-base md:text-lg">
            Knowledge is the first step. Here are ten verified organizations and initiatives where your contribution—whether time, money, or voice—creates immediate impact.
          </p>
        </div>

        {actArticle && (
          <div
            onClick={() => onArticleClick(actArticle)}
            className="mb-16 rounded-xl overflow-hidden relative aspect-[21/9] cursor-pointer group"
          >
            <img src={actArticle.imageUrl} alt={actArticle.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <span className="bg-news-accent text-black font-bold uppercase tracking-widest text-xs px-2 py-1 rounded mb-4 inline-block">Featured Guide</span>
              <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">{actArticle.title}</h3>
              <p className="text-gray-200 max-w-2xl text-lg line-clamp-2">{actArticle.excerpt}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-10 md:mb-16">
          {actions.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-zinc-900/50 border border-white/10 hover:border-news-accent/50 p-4 md:p-6 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:bg-zinc-900 flex flex-col items-center text-center"
            >
              <div className={`p-3 md:p-4 rounded-full bg-white/5 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 ${item.color} ring-1 ring-white/5`}>
                <item.icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-base md:text-lg mb-1 md:mb-2 text-white group-hover:text-news-accent transition-colors">{item.title}</h3>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 md:mb-4 border-b border-white/5 pb-2 w-full">{item.org}</span>
              <p className="text-xs text-gray-400 mb-4 md:mb-6 leading-relaxed flex-grow">{item.desc}</p>

              <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white group-hover:text-news-accent transition-colors bg-white/5 px-4 py-2 rounded-full group-hover:bg-white/10">
                Act Now <ExternalLink size={10} />
              </div>
            </a>
          ))}
        </div>

        {/* CTA to Dedicated Action Page */}
        <div className="text-center">
          <button
            onClick={onSeeFullGuide}
            className="group inline-flex items-center gap-3 bg-news-accent hover:bg-emerald-400 text-black px-6 py-3 md:px-8 md:py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-news-accent/50"
          >
            View Full Action Guide
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 md:mt-4 text-[10px] md:text-xs text-gray-500">Includes lifestyle protocols, detailed org lists, and local action steps.</p>
        </div>

      </div>
    </section>
  );
}

export default Action;
import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Leaf, Droplets, Zap, Heart, Scale, Recycle, TreePine, Megaphone, Globe, Utensils, Home, Car, DollarSign, Vote, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

import { Article } from '../types';

interface ActionDetailsViewProps {
  onBack: () => void;
  onSearch: (query: string) => void;
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const lifestyleActions = [
  {
    category: "Finance",
    title: "Green Your Money",
    searchKey: "Banking",
    icon: DollarSign,
    impact: "High",
    effort: "Low",
    desc: "Your bank might be funding fossil fuels. Switching to a sustainable bank or ethical pension fund is one of the most powerful individual actions you can take.",
    steps: ["Audit your bank using Bank.Green", "Move savings to a credit union or ESG fund", "Divest your pension"]
  },
  {
    category: "Diet",
    title: "Plant-Rich Diet",
    searchKey: "Protein",
    icon: Utensils,
    impact: "High",
    effort: "Medium",
    desc: "Animal agriculture accounts for 14.5% of global emissions. Reducing meat and dairy consumption frees up land for rewilding and reduces methane.",
    steps: ["Try 'Meatless Mondays'", "Switch to oat or soy milk", "Buy local, seasonal produce to cut transport emissions"]
  },
  {
    category: "Energy",
    title: "Electrify Everything",
    searchKey: "Heat Pumps",
    icon: Home,
    impact: "High",
    effort: "High",
    desc: "Moving away from gas/oil heating and cooking to electric alternatives prepares your home for a renewable grid.",
    steps: ["Install a heat pump", "Switch to an induction cooktop", "Improve insulation to stop heat leak"]
  },
  {
    category: "Transport",
    title: "Low-Carbon Travel",
    searchKey: "Aviation",
    icon: Car,
    impact: "Medium",
    effort: "Medium",
    desc: "Transport is the fastest-growing source of emissions. Reducing reliance on private combustion cars is essential.",
    steps: ["Prioritize public transit or cycling", "If buying a car, go Electric (EV)", "Replace one long-haul flight with a train journey"]
  },
  {
    category: "Civic",
    title: "Political Action",
    searchKey: "Suing",
    icon: Vote,
    impact: "High",
    effort: "Medium",
    desc: "Systemic change requires policy. Politicians act when they feel pressure from constituents.",
    steps: ["Vote for climate-conscious candidates", "Join a local town hall meeting", "Contact your representative about specific bills"]
  },
  {
    category: "Waste",
    title: "Circular Living",
    searchKey: "Circular",
    icon: Recycle,
    impact: "Low",
    effort: "Medium",
    desc: "We cannot recycle our way out of the crisis, but we can reduce consumption and waste.",
    steps: ["Buy second-hand / vintage", "Repair clothes instead of discarding", "Compost food waste to reduce methane in landfills"]
  }
];

const organizationList = [
  {
    title: "Support Activism",
    searchKey: "Suing",
    org: "Greenpeace",
    desc: "Join global campaigns to hold polluters accountable and influence environmental policy.",
    link: "https://www.greenpeace.org/",
    icon: Megaphone,
    color: "text-green-500"
  },
  {
    title: "Protect Wildlife",
    searchKey: "Extinction",
    org: "World Wildlife Fund",
    desc: "Conserve nature and reduce the most pressing threats to the diversity of life on Earth.",
    link: "https://www.worldwildlife.org/",
    icon: Heart,
    color: "text-orange-500"
  },
  {
    title: "Clean The Oceans",
    searchKey: "Garbage Patch",
    org: "The Ocean Cleanup",
    desc: "Support advanced technologies to rid the world's oceans of plastic.",
    link: "https://theoceancleanup.com/",
    icon: Droplets,
    color: "text-blue-500"
  },
  {
    title: "Reforestation",
    searchKey: "Trees",
    org: "One Tree Planted",
    desc: "Restore forests, create habitat for biodiversity, and make a positive social impact.",
    link: "https://onetreeplanted.org/",
    icon: TreePine,
    color: "text-emerald-600"
  },
  {
    title: "Legal Defense",
    searchKey: "Lawyers",
    org: "Earthjustice",
    desc: "The premier nonprofit public interest environmental law organization.",
    link: "https://earthjustice.org/",
    icon: Scale,
    color: "text-yellow-500"
  },
  {
    title: "End Plastic Pollution",
    searchKey: "Plastic",
    org: "Plastic Pollution Coalition",
    desc: "A global alliance working toward a world free of plastic pollution.",
    link: "https://www.plasticpollutioncoalition.org/",
    icon: Recycle,
    color: "text-cyan-400"
  },
  {
    title: "Sustainable Energy",
    searchKey: "Heat Pumps",
    org: "Rewiring America",
    desc: "Electrify your home and community to save money and the climate.",
    link: "https://www.rewiringamerica.org/",
    icon: Zap,
    color: "text-yellow-400"
  },
  {
    title: "Climate Education",
    searchKey: "Education",
    org: "Climate Reality Project",
    desc: "Catalyzing a global solution to the climate crisis by making urgent action a necessity.",
    link: "https://www.climaterealityproject.org/",
    icon: Globe,
    color: "text-blue-400"
  },
  {
    title: "Preserve Habitats",
    searchKey: "Biodiversity",
    org: "The Nature Conservancy",
    desc: "Conserving the lands and waters on which all life depends.",
    link: "https://www.nature.org/",
    icon: Leaf,
    color: "text-green-400"
  },
  {
    title: "Reduce Food Waste",
    searchKey: "Food Waste",
    org: "Too Good To Go",
    desc: "Rescue unsold food from shops and restaurants to save it from going to waste.",
    link: "https://toogoodtogo.com/",
    icon: Utensils,
    color: "text-pink-500"
  },
  {
    title: "Grassroots Movement",
    searchKey: "Activism",
    org: "Sunrise Movement",
    desc: "A youth movement to stop climate change and create millions of good jobs in the process.",
    link: "https://www.sunrisemovement.org/",
    icon: Megaphone,
    color: "text-yellow-600"
  },
  {
    title: "Indigenous Rights",
    searchKey: "Amazon",
    org: "Amazon Watch",
    desc: "Protecting the rainforest and advancing the rights of Indigenous peoples in the Amazon Basin.",
    link: "https://amazonwatch.org/",
    icon: TreePine,
    color: "text-green-600"
  }
];

const ActionDetailsView: React.FC<ActionDetailsViewProps> = ({ onBack, onSearch, articles, onArticleClick }) => {
  const actArticles = (articles || []).filter(a => {
    const categories = Array.isArray(a.category) ? a.category : [a.category];
    return categories.includes('Act') || categories.includes('Action') || categories.includes('Guides');
  }).slice(0, 6);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-zinc-950 min-h-screen animate-fade-in text-white pb-24">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="container mx-auto px-6 md:px-12 pt-36 md:pt-28 relative z-10">

        {/* Navigation */}
        {/* Act Articles Section */}
        {/* Act Articles Section (Hero + Grid) */}
        {actArticles.length > 0 ? (
          <div className="mb-24">
            {/* Unified Hero Section */}
            <div className="relative w-full rounded-2xl overflow-hidden mb-8 min-h-[400px] flex items-center group/hero">
              {/* Background Image: derived from first article */}
              <div className="absolute inset-0 z-0">
                <img
                  src={actArticles[0].imageUrl}
                  alt="Act Background"
                  className="w-full h-full object-cover opacity-50 blur-[2px] scale-105 transition-transform duration-[20s] ease-in-out group-hover/hero:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black via-black/70 to-black/40"></div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              <div className="relative z-10 w-full p-6 md:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left: Explainer / Header */}
                <div className="flex flex-col justify-center">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 leading-[0.9] tracking-tight drop-shadow-2xl">
                    Latest Guides
                  </h1>
                  <div className="h-1 w-16 bg-news-accent mb-4 shadow-[0_0_15px_#10b981]"></div>
                  <p className="text-gray-200 text-base md:text-lg font-light leading-relaxed max-w-xl drop-shadow-lg">
                    Transform anxiety into agency. This is your operational playbook for the climate crisis—featuring expert-led guides, systemic intervention points, and high-impact lifestyle protocols designed to move the needle.
                  </p>
                </div>

                {/* Right: Featured Article Card */}
                <div
                  onClick={() => onArticleClick(actArticles[0])}
                  className="group/card relative aspect-[4/5] md:aspect-video lg:aspect-[2/1] w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                >
                  <img
                    src={actArticles[0].imageUrl}
                    alt={actArticles[0].title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>

                  <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                    <span className="text-news-accent text-[8px] font-bold uppercase tracking-widest mb-2 block bg-black/50 backdrop-blur w-fit px-1.5 py-0.5 rounded">
                      Featured Guide
                    </span>
                    <h2 className="text-lg md:text-2xl font-serif font-bold text-white leading-tight mb-2 group-hover/card:underline decoration-2 decoration-news-accent underline-offset-4 shadow-black drop-shadow-lg">
                      {actArticles[0].title}
                    </h2>
                    <p className="text-gray-300 line-clamp-2 text-xs md:text-sm mb-4 drop-shadow-md font-medium">
                      {actArticles[0].excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                      <span>Read Protocol</span> <ArrowRight size={12} className="group-hover/card:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Remaining Grid (Mobile gets all, Desktop gets remainder) */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* On mobile, show the featured article again as a normal card because hero card is hidden on mobile? 
                    Actually, let's just map the rest [1..end] + the first one only on MOBILE if hidden?
                    Better: Use the same logic as CategoryFeed: First is Hero, rest is Grid.
                    On Mobile, the Hero text is visible but the "Card" is hidden. So user sees text, but how do they click the article?
                    The Hero text itself isn't clickable here.
                    I should ensure the hero article is clickable on mobile OR show it in the grid.
                    Let's make the Hero Card visible on mobile or stack it.
                    Actually, line 105 `hidden lg:block` hides the card.
                    I will simply render the grid starting from index 1 (desktop) or 0 (mobile)?
                    Wait, if I hide the card on mobile, I MUST show it in the grid or make the hero clickable.
                    I'll make the Hero Container clickable on mobile, OR show the card on mobile too.
                    Let's show the card on mobile, stacked below text. Remove `hidden lg:block`.
                */}
              {actArticles.slice(1).map(article => (
                <div
                  key={article.id}
                  onClick={() => onArticleClick(article)}
                  className="group cursor-pointer bg-white/5 border border-white/5 hover:bg-white/10 hover:border-news-accent/30 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-serif font-bold text-white mb-2 leading-tight group-hover:text-news-accent transition-colors">{article.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Fallback header if no articles found (shouldn't happen if user follows steps)
          <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in">
            <span className="text-news-accent font-bold uppercase tracking-widest text-xs mb-4 block animate-pulse">Action Protocol</span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">Latest Guides & Reports</h1>
            <p className="text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
              Transform anxiety into agency. This is your operational playbook for the climate crisis—featuring expert-led guides, systemic intervention points, and high-impact lifestyle protocols designed to move the needle.
            </p>
          </div>
        )}

        {/* SECTION 1: EVERYDAY LIFE */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
            <div className="p-3 bg-white/5 rounded-lg">
              <Home size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">Everyday Impact</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Personal Lifestyle Changes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lifestyleActions.map((action, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 hover:bg-zinc-900 hover:border-news-accent/30 transition-all duration-300 group flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-news-accent/10 rounded-full text-news-accent group-hover:scale-110 transition-transform">
                    <action.icon size={24} />
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-white/10 ${action.impact === 'High' ? 'bg-news-accent/20 text-news-accent' : 'bg-white/5 text-gray-400'
                      }`}>
                      {action.impact} Impact
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold font-serif text-white mb-3">{action.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 h-16">{action.desc}</p>

                <div className="space-y-3 pt-6 border-t border-white/5 mb-6 flex-grow">
                  {action.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-3">
                      <CheckCircle2 size={14} className="text-news-accent mt-1 flex-shrink-0" />
                      <span className="text-xs text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>


              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: ORGANIZATIONS */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
            <div className="p-3 bg-white/5 rounded-lg">
              <Globe size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">Collective Power</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Organizations & Initiatives</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {organizationList.map((item, idx) => (
              <div
                key={idx}
                className="group bg-zinc-900/50 border border-white/10 hover:border-news-accent/50 p-6 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:bg-zinc-900 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-300 ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-news-accent transition-colors">{item.title}</h3>
                </div>

                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pb-2 w-full border-b border-white/5">{item.org}</span>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-grow">{item.desc}</p>

                <div className="mt-auto flex gap-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-[10px] font-bold uppercase tracking-widest text-white hover:text-news-accent transition-colors bg-white/5 hover:bg-white/10 py-2 rounded flex items-center justify-center gap-2"
                  >
                    Act Now <ExternalLink size={10} />
                  </a>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActionDetailsView;
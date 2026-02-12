import React, { useState, useEffect, useRef } from 'react';
import { Thermometer, CloudFog, MountainSnow, Droplets, Waves, Bird, Leaf, Flame, Wind, AlertTriangle } from 'lucide-react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio'; // Acts as Home/Discover Feed
import CategoryFeed from './components/CategoryFeed'; // New Category Page
import PlanetaryStatus from './components/PlanetaryStatus';
import About from './components/About';
import AdUnit from './components/AdUnit';
import { ADS_CONFIG } from './data/adsConfig';
import Action from './components/Action';
import Contact from './components/Contact';
import ArticleView from './components/ArticleView';

import EarthDashboard from './components/EarthDashboard';
import DataExplanationView from './components/DataExplanationView';
import ActionDetailsView from './components/ActionDetailsView';
import AboutPage from './components/AboutPage';
import Support from './components/Support';
import SubscribeModal from './components/SubscribeModal';
import AdminDashboard from './components/AdminDashboard';
import AudioPlayer from './components/AudioPlayer';
import { AudioProvider } from './contexts/AudioContext';
import { Section, Article, ExplanationData } from './types';
import { featuredArticle, newsArticles as staticNewsArticles } from './data/content';


// Helper to restore icon component lost in JSON serialization
const restoreIcon = (data: any): ExplanationData => {
  const title = data.title || data.label; // Handle potential variations
  let IconComponent = Thermometer; // Default

  if (title === "Global Mean Temp" || title === "Permafrost Thaw") IconComponent = Thermometer;
  else if (title.includes("CO₂") || title.includes("Carbon")) IconComponent = CloudFog;
  else if (title.includes("Ice Sheet") || title.includes("West Antarctic")) IconComponent = MountainSnow;
  else if (title === "Sea Level Rise") IconComponent = Droplets;
  else if (title === "Ocean Acidity") IconComponent = Waves;
  else if (title === "Biodiversity") IconComponent = Bird;
  else if (title === "Forest Loss" || title.includes("Rainforest")) IconComponent = Leaf;
  else if (title.includes("Methane")) IconComponent = Flame;
  else if (title.includes("Atlantic Circulation") || title.includes("AMOC")) IconComponent = Wind;
  else if (title.includes("Limit") || title.includes("Warning")) IconComponent = AlertTriangle;

  return { ...data, icon: IconComponent };
};

// Helper functions for clean URLs
const categoryToSlug = (category: string): string => {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const slugToCategory = (slug: string): string => {
  const categoryMap: Record<string, string> = {
    'climate-change': 'Climate Change',
    'energy': 'Energy',
    'pollution': 'Pollution',
    'policy-and-economics': 'Policy & Economics',
    'oceans': 'Oceans',
    'biodiversity': 'Biodiversity',
    'conservation': 'Conservation',
    'solutions': 'Solutions',
    'guides': 'Guides'
  };
  return categoryMap[slug] || slug;
};

function App() {
  // Search now includes all dynamic articles
  // Browser History Management: All view changes push state to history API,
  // allowing the browser back/forward buttons to work correctly across the entire site
  const [activeSection, setActiveSection] = useState<Section>(Section.HERO);
  const [view, setView] = useState<'home' | 'category' | 'article' | 'sources' | 'dashboard' | 'explanation' | 'action-guide' | 'about' | 'subscribe' | 'admin'>(() => {
    // Initialize view from URL
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (hash === '#explain') return 'explanation';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/about') return 'about';
    if (path === '/guides') return 'action-guide';
    if (path === '/support') return 'support';
    // Admin, subscribe, etc could be added
    return 'home';
  });

  // Hydrate history state on mount to ensure back button works for initial entry
  useEffect(() => {
    if (!window.history.state) {
      const path = window.location.pathname;
      let initialState: any = { view: 'home' };

      if (path === '/dashboard') initialState = { view: 'dashboard' };
      else if (path === '/about') initialState = { view: 'about' };
      else if (path === '/guides') initialState = { view: 'action-guide' };
      else if (path === '/support') initialState = { view: 'support' };

      window.history.replaceState(initialState, '', path);
    }
  }, []);

  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Dynamic Articles State
  const [articles, setArticles] = useState<Article[]>(staticNewsArticles);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  // Define fetchArticles outside useEffect to be reusable
  const fetchArticles = async () => {
    try {
      const headers: HeadersInit = {};
      const url = '/api/articles';

      // Note: We don't include unpublished articles on the public site
      // Even for admins - they should use the Admin Dashboard to view drafts

      const res = await fetch(url, { headers });
      if (res.ok) {
        const apiArticles = await res.json();
        if (apiArticles.length > 0) {
          // Sort by createdAt or date (descending)
          const sorted = apiArticles.sort((a: any, b: any) => {
            const getSortableDate = (item: any) => {
              if (item.date) {
                const normalized = item.date
                  .replace(/okt/i, 'Oct')
                  .replace(/mai/i, 'May')
                  .replace(/maj/i, 'May')
                  .replace(/des/i, 'Dec');
                const ts = new Date(normalized).getTime();
                if (!isNaN(ts)) return ts;
              }
              return new Date(item.createdAt || 0).getTime();
            };
            return getSortableDate(b) - getSortableDate(a);
          });
          console.log('Articles loaded:', sorted.length);
          setArticles(sorted);
        } else {
          console.log('No API articles, using static data');
          setArticles(staticNewsArticles);
        }
      }
    } catch (e) {
      console.error("API offline, using static data");
      // Keep initial staticNewsArticles
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Separate useEffect for Deep Linking to ensure 'articles' state is ready
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    const articleId = params.get('article');
    const isAdmin = params.get('admin');
    const viewParam = params.get('view');
    const categoryParam = params.get('category');

    // Check both query param and pathname for admin access
    if (isAdmin !== null || pathname === '/admin') {
      setView('admin');
      // Clean URL by removing query param if present
      if (pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
      }
    } else if (pathname.startsWith('/category/')) {
      // Handle clean category URLs like /category/policy-economics
      const slug = pathname.replace('/category/', '');
      const category = slugToCategory(slug);
      setActiveCategory(category);
      setView('category');
    } else if (pathname === '/dashboard' || viewParam === 'dashboard') {
      setView('dashboard');
      if (pathname !== '/dashboard') {
        window.history.replaceState({}, '', '/dashboard');
      }
    } else if (pathname === '/guides' || viewParam === 'action') {
      setView('action-guide');
      if (pathname !== '/guides') {
        window.history.replaceState({}, '', '/guides');
      }
    } else if (viewParam === 'subscribe') {
      // Open modal instead of changing view
      setIsSubscribeModalOpen(true);
      // If we are just landing here, default to home view behind the modal
      if (view === 'home' || view === 'subscribe') {
        setView('home');
      }
    } else if (pathname === '/methodology' || viewParam === 'methodology') {
      // Methodology is part of the About page
      setView('about');
      if (pathname !== '/about') {
        window.history.replaceState({}, '', '/about');
      }
    } else if (pathname === '/about' || viewParam === 'about' || (window.location.hash === '#about' && view !== 'home')) {
      // Also catching #about if linking directly, though usually About is a section on Home or a separate page? 
      // In this app 'About' seems to be a separate view 'AboutPage'.
      setView('about');
      if (pathname !== '/about') {
        window.history.replaceState({}, '', '/about');
      }
    } else if (categoryParam && categoryParam !== 'All' && categoryParam !== 'Discover') {
      // Backward compatibility: redirect old query param URLs to new clean URLs
      const slug = categoryToSlug(categoryParam);
      window.history.replaceState({}, '', `/category/${slug}`);
      setActiveCategory(categoryParam);
      setView('category');
    } else if ((pathname.startsWith('/article/') || articleId) && articles.length > 0) {
      // Support both slug-based clean URLs and legacy ID-based URLs
      const identifier = articleId || pathname.replace('/article/', '');

      // Try to find by slug first, then fall back to ID
      let foundArticle = articles.find(a => a.slug === identifier);
      if (!foundArticle) {
        foundArticle = articles.find(a => a.id === identifier);
      }

      if (foundArticle) {
        setCurrentArticle(foundArticle);
        setView('article');

        // Normalize URL to use slug if available
        const preferredPath = `/article/${foundArticle.slug || foundArticle.id}`;
        if (pathname !== preferredPath) {
          window.history.replaceState({ view: 'article', articleId: foundArticle.id }, '', preferredPath);
        }
      }
    }
  }, [articles]);

  // Ref to store dashboard scroll position
  const dashboardScrollRef = React.useRef(0);

  // Handle Browser Back Button
  useEffect(() => {
    // Disable automatic browser scroll restoration to handle it manually
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        const viewState = event.state.view;

        switch (viewState) {
          case 'article':
            const found = articles.find(a => a.id === event.state.articleId);
            if (found) {
              setCurrentArticle(found);
              setView('article');
            }
            break;
          case 'category':
            setActiveCategory(event.state.category || 'All');
            setView('category');
            break;
          case 'sources':
            setView('sources');
            break;
          case 'dashboard':
            setView('dashboard');
            // Restore scroll position from session storage
            setTimeout(() => {
              const savedScroll = sessionStorage.getItem('dashboardScroll');
              if (savedScroll) {
                window.scrollTo(0, parseInt(savedScroll));
              }
            }, 100);
            break;
          case 'explanation':
            setView('explanation');
            window.scrollTo(0, 0);
            if (event.state.explanationData) {
              setExplanationData(event.state.explanationData);
            }
            break;
          case 'action-guide':
            setView('action-guide');
            break;
          case 'methodology':
            setView('methodology');
            break;
          case 'subscribe':
            setView('subscribe');
            break;
          case 'home':
          default:
            setView('home');
            setCurrentArticle(null);
            setSearchQuery('');
            break;
        }
      } else {
        // No state (often initial entry). Check URL to determine view.
        const path = window.location.pathname;
        const hash = window.location.hash;

        if (hash === '#explain') {
          setView('explanation');
          // Restore data from session if possible
          const savedData = sessionStorage.getItem('explanationData');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Restore icon component based on title
            setExplanationData(restoreIcon(parsedData));
          }
        } else if (path === '/dashboard') {
          setView('dashboard');
          // Try to restore scroll even on null state if session has it
          setTimeout(() => {
            const savedScroll = sessionStorage.getItem('dashboardScroll');
            if (savedScroll) {
              window.scrollTo(0, parseInt(savedScroll));
            }
          }, 100);
        } else if (path === '/about') {
          setView('about');
        } else if (path === '/guides') {
          setView('action-guide');
        } else if (path === '/support') {
          setView('support');
        } else {
          // Default to home
          setView('home');
          setCurrentArticle(null);
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [articles]);

  const scrollToSection = (sectionId: Section) => {
    if (view !== 'home') {
      setView('home');
      setActiveCategory('All');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(sectionId);
        }
      }, 50);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(sectionId);
      }
    }
  };

  const handleArticleClick = (article: Article) => {
    setCurrentArticle(article);
    setView('article');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'article', articleId: article.id }, '', `/article/${article.id}`);
  };


  const handleBackToFeed = () => {
    window.history.back();
  };

  const handleBackFromMethodology = () => {
    window.history.back();
  };

  const handleShowAbout = () => {
    setView('about');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'about' }, '', '/about');
  };

  const handleShowDashboard = () => {
    setView('dashboard');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'dashboard' }, '', '/dashboard');
  };

  const handleShowActionGuide = () => {
    setView('action-guide');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'action-guide' }, '', '/guides');
  };

  const handleShowSupport = () => {
    setView('support');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'support' }, '', '/support');
  };

  // Helper to restore icon component lost in JSON serialization
  // Renamed to avoid conflict - should be removed later
  const restoreIcon_OLD = (data: any): ExplanationData => {
    const title = data.title || data.label; // Handle potential variations
    let IconComponent = Thermometer; // Default

    if (title === "Global Mean Temp" || title === "Permafrost Thaw") IconComponent = Thermometer;
    else if (title.includes("CO₂") || title.includes("Carbon")) IconComponent = CloudFog;
    else if (title.includes("Ice Sheet") || title.includes("West Antarctic")) IconComponent = MountainSnow;
    else if (title === "Sea Level Rise") IconComponent = Droplets;
    else if (title === "Ocean Acidity") IconComponent = Waves;
    else if (title === "Biodiversity") IconComponent = Bird;
    else if (title === "Forest Loss" || title.includes("Rainforest")) IconComponent = Leaf;
    else if (title.includes("Methane")) IconComponent = Flame;
    else if (title.includes("Atlantic Circulation") || title.includes("AMOC")) IconComponent = Wind;
    else if (title.includes("Limit") || title.includes("Warning")) IconComponent = AlertTriangle;

    return { ...data, icon: IconComponent };
  };

  const handleExplainData = (data: ExplanationData) => {
    // Explicitly update the CURRENT history entry to be a valid Dashboard checkpoint
    // This ensures that when the user clicks "Back", they return to this exact state
    if (view === 'dashboard') {
      window.history.replaceState({ view: 'dashboard' }, '', '/dashboard');
    }

    // Save scroll position
    sessionStorage.setItem('dashboardScroll', window.scrollY.toString());

    // Save explanation data to session so it persists across reloads/nav
    sessionStorage.setItem('explanationData', JSON.stringify(data));

    setExplanationData(data);
    setView('explanation');
    window.scrollTo(0, 0);
    // Use hash for navigation - explicit pushstate with hash
    window.location.hash = 'explain';
  };

  const handleCloseExplanation = () => {
    // Explicitly go to dashboard view
    setView('dashboard');
    // Replace URL to point to dashboard, effectively "closing" the modal in history
    window.history.replaceState({ view: 'dashboard' }, '', '/dashboard');

    // Restore scroll from session storage
    setTimeout(() => {
      const savedScroll = sessionStorage.getItem('dashboardScroll');
      if (savedScroll) {
        window.scrollTo(0, parseInt(savedScroll));
      }
    }, 100);
  };

  const handleBackToDashboard = () => {
    window.history.back();
  };

  const handleShowSubscribe = () => {
    setIsSubscribeModalOpen(true);
    // Optional: Update URL without navigation?
    // window.history.pushState({ view: 'home', subscribe: true }, '', '?view=subscribe');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (view !== 'home' && query.length > 0) {
      setView('home');
      setActiveCategory('All');
      setTimeout(() => {
        const newsSection = document.getElementById(Section.NEWS);
        if (newsSection) {
          newsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (view === 'home' && query.length > 0) {
      const newsSection = document.getElementById(Section.NEWS);
      if (newsSection) {
        const rect = newsSection.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) {
          newsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleCategorySelect = (category: string) => {
    setSearchQuery('');
    setActiveCategory(category);
    if (category === 'All' || category === 'Discover') {
      setView('home');
      window.scrollTo(0, 0);
      window.history.pushState({ view: 'home', category }, '', '/');
    } else {
      setView('category');
      window.scrollTo(0, 0);
      const slug = categoryToSlug(category);
      window.history.pushState({ view: 'category', category }, '', `/category/${slug}`);
    }
  };

  if (view === 'admin') {
    return <AdminDashboard onBack={() => {
      setView('home');
      fetchArticles(); // Refresh data on return
      window.history.replaceState({}, '', window.location.pathname);
    }} />;
  }

  const getHeroArticle = () => {
    // Feature Logic:
    // 1. Find all 'isFeaturedDiscover' articles
    const featuredCandidates = articles.filter(a => a.isFeaturedDiscover);
    // 2. Sort by 'createdAt' (newest upload first)
    featuredCandidates.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

    // 3. Pick winner, or fallback to fixed ID, or fallback to static default
    return featuredCandidates[0] || articles.find(a => a.id === 'gs-policy-2026') || featuredArticle;
  };

  const getSidebarArticles = (heroId: string) => {
    // Sort articles by newness (Upload Date preferred)
    const sorted = [...articles].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });

    // Get 4 recent stories, excluding the hero
    return sorted.filter(a => a.id !== heroId).slice(0, 4);
  };

  const heroArticle = getHeroArticle();
  const sidebarArticles = getSidebarArticles(heroArticle?.id);
  const excludedIds = [heroArticle?.id, ...sidebarArticles.map(a => a.id)].filter(Boolean) as string[];

  return (
    <AudioProvider>
      <div className="min-h-screen bg-news-bg text-news-text font-sans">
        <Navigation
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onArticleSelect={handleArticleClick}
          onDashboardClick={handleShowDashboard}
          onActionGuideClick={handleShowActionGuide}
          onSupportClick={handleShowSupport}
          onSubscribeClick={handleShowSubscribe}
          onShowAbout={handleShowAbout}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          newsArticles={articles}
          currentView={view} // Pass the current view state
          lastSyncTime={lastSyncTime}
        />

        <main>
          {view === 'home' && (
            <>
              <Hero
                onReadFeatured={() => handleArticleClick(heroArticle)}
                onArticleClick={handleArticleClick}
                // Pass the featured discover article
                featuredArticleOverride={heroArticle}
                // Pass the sidebar articles
                sidebarArticlesOverride={sidebarArticles}
                articles={articles}
              />
              {/* Pass DYNAMIC articles to Portfolio */}
              <Portfolio
                articles={articles}
                onArticleClick={handleArticleClick}
                searchQuery={searchQuery}
                excludedArticleIds={excludedIds} // Prevent duplication of Hero + Sidebar
              />

              <div className="w-full bg-black py-12 border-t border-white/5">
                <div className="container mx-auto px-4">
                  <div className="flex justify-center">
                    <AdUnit
                      format="horizontal"
                      variant="transparent"
                      className="w-full h-32 md:h-48 bg-transparent"
                      slotId={ADS_CONFIG.SLOTS.HOME_FOOTER}
                    />
                  </div>
                </div>
              </div>

            </>
          )}

          {view === 'category' && (
            <CategoryFeed
              category={activeCategory}
              articles={articles} // Pass dynamic articles
              onArticleClick={handleArticleClick}
              onBack={() => handleCategorySelect('All')}
            />
          )}

          {view === 'article' && currentArticle && (
            <ArticleView
              article={currentArticle}
              onBack={handleBackToFeed}
              onArticleSelect={handleArticleClick}
              allArticles={articles} // Pass dynamic articles
              onShowAbout={handleShowAbout}
            />
          )}

          {view === 'about' && (
            <AboutPage onBack={handleBackToFeed} />
          )}

          {view === 'dashboard' && (
            <EarthDashboard
              onBack={handleBackToFeed}
              onExplain={handleExplainData}
              onSearch={handleSearch}
              onDataSync={setLastSyncTime}
            />
          )}

          {view === 'explanation' && explanationData && (
            <DataExplanationView
              data={explanationData}
              onBack={handleCloseExplanation}
            />
          )}

          {view === 'action-guide' && (
            <CategoryFeed
              category="Guides"
              articles={articles}
              onArticleClick={handleArticleClick}
              onBack={() => handleCategorySelect('All')}
            />
          )}

          {view === 'support' && (
            <Support
              onBack={() => handleCategorySelect('All')}
            />
          )}



          {/* Global Footer available on all pages */}
          <Contact
            onShowAbout={handleShowAbout}
            onSubscribeClick={handleShowSubscribe}
          />
        </main>

        <SubscribeModal
          isOpen={isSubscribeModalOpen}
          onClose={() => {
            setIsSubscribeModalOpen(false);
            // If URL had ?view=subscribe, maybe revert it?
            if (window.location.search.includes('view=subscribe')) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }}
        />

        <AudioPlayer />
      </div>
    </AudioProvider>
  );
}

export default App;
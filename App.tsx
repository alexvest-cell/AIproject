import React, { useState, useEffect, useRef } from 'react';

import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import CategoryFeed from './components/CategoryFeed';
import AdUnit from './components/AdUnit';
import { ADS_CONFIG } from './data/adsConfig';
import Contact from './components/Contact';
import ArticleView from './components/ArticleView';
import AboutPage from './components/AboutPage';
import SubscribeModal from './components/SubscribeModal';
import AdminDashboard from './components/AdminDashboard';
import AudioPlayer from './components/AudioPlayer';
import { AudioProvider } from './contexts/AudioContext';
import ToolPage from './components/ToolPage';
import ComparisonPage from './components/ComparisonPage';
import AlternativesPage from './components/AlternativesPage';
import HubPage from './components/HubPage';
import StackHubPage from './components/StackHubPage';
import StackPage from './components/StackPage';
import CategoryHubPage from './components/CategoryHubPage';
import { Section, Article } from './types';
import { featuredArticle, newsArticles as staticNewsArticles } from './data/content';


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
    'ai-tools': 'AI Tools',
    'comparisons': 'Comparisons',
    'reviews': 'Reviews',
    'productivity': 'Productivity',
    'automation': 'Automation',
    'ai-news': 'AI News',
    'guides': 'Guides'
  };
  return categoryMap[slug] || slug;
};

function App() {
  const [activeSection, setActiveSection] = useState<Section>(Section.HERO);
  const [view, setView] = useState<
    'home' | 'category' | 'article' | 'sources' | 'about' | 'subscribe' | 'admin' |
    'hub' | 'tool' | 'comparison' | 'alternatives' | 'stacks' | 'stack' | 'tool-category'
  >(() => {
    const path = window.location.pathname;
    if (path === '/about') return 'about';
    if (path === '/stacks') return 'stacks';
    if (path.startsWith('/stacks/')) return 'stack';
    if (path.startsWith('/tools/') && path.endsWith('/alternatives')) return 'alternatives';
    if (path.startsWith('/tools/')) return 'tool';
    if (path.startsWith('/compare/')) return 'comparison';
    if (path.startsWith('/categories/')) return 'tool-category';
    const hubPaths = ['/ai-tools', '/best-software', '/reviews', '/comparisons', '/use-cases', '/guides', '/news'];
    if (hubPaths.includes(path)) return 'hub';
    return 'home';
  });
  // Hub/Tool/Comparison slug routing
  const [activeHub, setActiveHub] = useState<string>('');
  const [activeToolSlug, setActiveToolSlug] = useState<string>('');
  const [activeComparisonSlug, setActiveComparisonSlug] = useState<string>();
  const [activeAlternativesToolSlug, setActiveAlternativesToolSlug] = useState<string>('');
  const [activeStackSlug, setActiveStackSlug] = useState<string>('');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(() => {
    const path = window.location.pathname;
    return path.startsWith('/categories/') ? path.replace('/categories/', '') : '';
  });
  const [workflowFilter, setWorkflowFilter] = useState<string>('');
  const [urlQueryString, setUrlQueryString] = useState(() => typeof window !== 'undefined' ? window.location.search : '');

  // Hydrate history state on mount to ensure back button works for initial entry
  useEffect(() => {
    if (!window.history.state) {
      const path = window.location.pathname;
      let initialState: any = { view: 'home' };

      if (path === '/about') initialState = { view: 'about' };

      window.history.replaceState(initialState, '', path);
    }
  }, []);

  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Dynamic Articles State
  const [articles, setArticles] = useState<Article[]>(staticNewsArticles);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  // Define fetchArticles outside useEffect to be reusable
  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const apiArticles = await res.json();
        if (apiArticles.length > 0) {
          console.log('Articles loaded:', apiArticles.length);
          const mappedArticles = apiArticles.map((a: any) => ({
            ...a,
            id: a.id || a._id // Map MongoDB _id to id
          }));

          const sorted = mappedArticles.sort((a: any, b: any) => {
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
          setArticles(sorted);
        } else {
          console.log('No API articles, using static data');
          setArticles(staticNewsArticles);
        }
      }
    } catch (e) {
      console.error("API offline, using static data");
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
    } else if (viewParam === 'subscribe') {
      // Open modal instead of changing view
      setIsSubscribeModalOpen(true);
      // If we are just landing here, default to home view behind the modal
      if (view === 'home' || view === 'subscribe') {
        setView('home');
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
    } else if (pathname.startsWith('/best-software/') && articles.length > 0) {
      const identifier = pathname.replace('/best-software/', '');
      if (identifier) {
        let foundArticle = articles.find(a => a.slug === identifier);
        if (!foundArticle) {
          foundArticle = articles.find(a => a.id === identifier);
        }

        if (foundArticle) {
          setCurrentArticle(foundArticle);
          setView('article');
          const preferredPath = `/best-software/${foundArticle.slug || foundArticle.id}`;
          if (pathname !== preferredPath) {
            window.history.replaceState({ view: 'article', articleId: foundArticle.id }, '', preferredPath);
          }
        } else {
          // Article not found, show hub
          setActiveHub('best-software');
          setWorkflowFilter(params.get('workflow') || '');
          setUrlQueryString(window.location.search);
          setView('hub');
        }
      } else {
        // Just /best-software/
        setActiveHub('best-software');
        setWorkflowFilter(params.get('workflow') || '');
        setUrlQueryString(window.location.search);
        setView('hub');
      }
    } else if (pathname === '/ai-tools' || pathname === '/best-software' || pathname === '/comparisons' || 
               pathname === '/reviews' || pathname === '/use-cases' || pathname === '/guides' || pathname === '/news') {
      const hub = pathname.replace('/', '');
      const wf = params.get('workflow') || '';
      setActiveHub(hub);
      setWorkflowFilter(wf);
      setUrlQueryString(window.location.search);
      setView('hub');
    } else if (pathname === '/stacks') {
      setView('stacks');
    } else if (pathname.startsWith('/stacks/')) {
      const slug = pathname.replace('/stacks/', '');
      setActiveStackSlug(slug);
      setView('stack');
    } else if (pathname.startsWith('/tools/') && pathname.endsWith('/alternatives')) {
      const slug = pathname.replace('/tools/', '').replace('/alternatives', '');
      setActiveAlternativesToolSlug(slug);
      setView('alternatives');
    } else if (pathname.startsWith('/tools/')) {
      const slug = pathname.replace('/tools/', '');
      setActiveToolSlug(slug);
      setView('tool');
    } else if (pathname.startsWith('/compare/')) {
      const slug = pathname.replace('/compare/', '');
      setActiveComparisonSlug(slug);
      setView('comparison');
    }
  }, [articles]);

  // Handle Browser Back Button
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto'; // allow the browser to natively scroll top previously scrolled position
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        const viewState = event.state.view;

        switch (viewState) {
          case 'article': {
            const found = articles.find(a => a.id === event.state.articleId);
            if (found) {
              setCurrentArticle(found);
              setView('article');
            }
            break;
          }
          case 'category':
            setActiveCategory(event.state.category || 'All');
            setView('category');
            break;
          case 'hub':
            setActiveHub(event.state.hub);
            setWorkflowFilter(event.state.workflow || '');
            setUrlQueryString(event.state.queryStr || '');
            setView('hub');
            break;
          case 'alternatives':
            setActiveAlternativesToolSlug(event.state.slug);
            setView('alternatives');
            break;
          case 'tool':
            setActiveToolSlug(event.state.slug);
            setView('tool');
            break;
          case 'stacks':
            setView('stacks');
            break;
          case 'stack':
            setActiveStackSlug(event.state.slug);
            setView('stack');
            break;
          case 'tool-category':
            setActiveCategorySlug(event.state.slug);
            setView('tool-category');
            break;
          case 'comparison':
            setActiveComparisonSlug(event.state.slug);
            setView('comparison');
            break;
          case 'about':
            setView('about');
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

        if (path === '/about') {
          setView('about');
        } else if (path === '/ai-tools' || path === '/best-software' || path === '/comparisons' || 
                   path === '/reviews' || path === '/use-cases' || path === '/guides' || path === '/news') {
          const wf = event.state?.workflow || '';
          setActiveHub(path.replace('/', ''));
          setWorkflowFilter(wf);
          setUrlQueryString(event.state?.queryStr || window.location.search || '');
          setView('hub');
        } else if (path === '/stacks') {
          setView('stacks');
        } else if (path.startsWith('/categories/')) {
          setActiveCategorySlug(path.replace('/categories/', ''));
          setView('tool-category');
        } else if (path.startsWith('/stacks/')) {
          setActiveStackSlug(path.replace('/stacks/', ''));
          setView('stack');
        } else if (path.startsWith('/tools/') && path.endsWith('/alternatives')) {
          setActiveAlternativesToolSlug(path.replace('/tools/', '').replace('/alternatives', ''));
          setView('alternatives');
        } else if (path.startsWith('/tools/')) {
          setActiveToolSlug(path.replace('/tools/', ''));
          setView('tool');
        } else if (path.startsWith('/compare/')) {
          setActiveComparisonSlug(path.replace('/compare/', ''));
          setView('comparison');
        } else if (path === '/admin') {
          setView('admin');
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
    const identifier = article.slug || article.id;
    
    // Use prettier URL for rankings if it's a 'best-of' article
    const isRanking = (article as any).article_type === 'best-of' || (Array.isArray(article.category) ? article.category : [article.category]).includes('Best Of');
    const path = isRanking ? `/best-software/${identifier}` : `/article/${identifier}`;
    
    window.history.pushState({ view: 'article', articleId: article.id }, '', path);
  };


  const handleBackToFeed = () => {
    window.history.back();
  };

  // Hub navigation
  const handleHubClick = (hub: string, workflow?: string, queryStr?: string) => {
    if (hub === 'stacks') {
      handleStacksHubPageClick();
      return;
    }
    setActiveHub(hub);
    setWorkflowFilter(workflow || '');
    setView('hub');
    window.scrollTo(0, 0);
    let finalQs = queryStr || '';
    if (workflow) {
      finalQs = `?workflow=${workflow}`;
    }
    setUrlQueryString(finalQs);
    window.history.pushState({ view: 'hub', hub, workflow: workflow || '', queryStr: finalQs }, '', `/${hub}${finalQs}`);
  };

  // Tool navigation
  const handleToolClick = (slug: string) => {
    setActiveToolSlug(slug);
    setView('tool');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'tool', slug }, '', `/tools/${slug}`);
  };

  // Alternatives navigation
  const handleAlternativesClick = (toolSlug: string) => {
    setActiveAlternativesToolSlug(toolSlug);
    setView('alternatives');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'alternatives', slug: toolSlug }, '', `/tools/${toolSlug}/alternatives`);
  };

  // Comparison navigation
  const handleComparisonClick = (slug: string) => {
    setActiveComparisonSlug(slug);
    setView('comparison');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'comparison', slug }, '', `/compare/${slug}`);
  };

  // Stack navigation
  const handleStacksHubPageClick = () => {
    setView('stacks');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'stacks' }, '', `/stacks`);
  };

  const handleStackClick = (slug: string) => {
    setActiveStackSlug(slug);
    setView('stack');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'stack', slug }, '', `/stacks/${slug}`);
  };

  const handleCategoryHubClick = (slug: string) => {
    setActiveCategorySlug(slug);
    setView('tool-category');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'tool-category', slug }, '', `/categories/${slug}`);
  };

  const handleShowAbout = () => {
    setView('about');
    window.scrollTo(0, 0);
    window.history.pushState({ view: 'about' }, '', '/about');
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
          onSupportClick={() => { }}
          onSubscribeClick={handleShowSubscribe}
          onShowAbout={handleShowAbout}
          onHubClick={handleHubClick}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          newsArticles={articles}
          currentView={view}
          lastSyncTime={lastSyncTime}
        />

        <main>
          {view === 'home' && (
            <>
              <Hero
                onReadFeatured={() => handleArticleClick(heroArticle)}
                onArticleClick={handleArticleClick}
                featuredArticleOverride={heroArticle}
                sidebarArticlesOverride={sidebarArticles}
                articles={articles}
                onHubClick={handleHubClick}
                onStackClick={handleStackClick}
              />
              {/* Pass DYNAMIC articles to Portfolio */}
              <Portfolio
                articles={articles}
                onArticleClick={handleArticleClick}
                searchQuery={searchQuery}
                excludedArticleIds={excludedIds}
                onComparisonClick={handleComparisonClick}
                onHubClick={handleHubClick}
                onToolClick={handleToolClick}
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
              onStackClick={handleStackClick}
            />
          )}

          {view === 'about' && (
            <AboutPage onBack={handleBackToFeed} />
          )}

          {view === 'hub' && (
          <HubPage
              hub={activeHub as any}
              articles={articles}
              onArticleClick={handleArticleClick}
              onToolClick={handleToolClick}
              onComparisonClick={handleComparisonClick}
              onBack={handleBackToFeed}
              onHubNavigate={handleHubClick}
              workflowFilter={workflowFilter}
              queryString={urlQueryString}
              onStackClick={handleStackClick}
            />
          )}

          {view === 'tool' && activeToolSlug && (
            <ToolPage
              slug={activeToolSlug}
              onBack={() => window.history.back()}
              onArticleClick={handleArticleClick}
              onComparisonClick={handleComparisonClick}
              onAlternativesClick={handleAlternativesClick}
              onStackClick={handleStackClick}
            />
          )}

          {view === 'alternatives' && activeAlternativesToolSlug && (
            <AlternativesPage
              toolSlug={activeAlternativesToolSlug}
              onBack={() => window.history.back()}
              onToolClick={handleToolClick}
              onArticleClick={handleArticleClick}
              onComparisonClick={handleComparisonClick}
            />
          )}

          {view === 'comparison' && activeComparisonSlug && (
            <ComparisonPage
              slug={activeComparisonSlug}
              onBack={() => window.history.back()}
              onToolClick={handleToolClick}
            />
          )}

          {view === 'stacks' && (
            <StackHubPage
              onStackClick={handleStackClick}
              articles={articles}
              onArticleClick={handleArticleClick}
            />
          )}

          {view === 'stack' && activeStackSlug && (
            <StackPage
              slug={activeStackSlug}
              onBack={() => window.history.back()}
              onToolClick={handleToolClick}
              onArticleClick={handleArticleClick}
              onComparisonClick={handleComparisonClick}
              onStackClick={handleStackClick}
            />
          )}

          {view === 'tool-category' && activeCategorySlug && (
            <CategoryHubPage
              slug={activeCategorySlug}
              onBack={() => window.history.back()}
              onToolClick={handleToolClick}
              onArticleClick={handleArticleClick}
              onComparisonClick={handleComparisonClick}
              onCategoryClick={handleCategoryHubClick}
            />
          )}

          {/* Global Footer available on all pages */}
          <Contact
            onShowAbout={handleShowAbout}
            onSubscribeClick={handleShowSubscribe}
            onCategorySelect={handleCategorySelect}
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
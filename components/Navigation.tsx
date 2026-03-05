import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Section, Article } from '../types';
import { Menu, X, Search, Bell, ChevronRight } from 'lucide-react';

interface NavigationProps {
  activeSection: Section;
  scrollToSection: (section: Section) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onArticleSelect: (article: Article) => void;
  onSupportClick: () => void;
  onSubscribeClick: () => void;
  onShowAbout: () => void;
  activeCategory: string;
  onCategorySelect: (category: string) => void;
  onHubClick?: (slug: string) => void; // New: navigate to hub page
  newsArticles: Article[];
  currentView: string;
  lastSyncTime?: string;
}

import { CATEGORIES } from '../data/categories';

const navCategories = CATEGORIES;

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  scrollToSection,
  onSearch,
  searchQuery,
  onArticleSelect,
  onSupportClick,
  onSubscribeClick,
  onShowAbout,
  activeCategory,
  onCategorySelect,
  onHubClick,
  newsArticles,
  currentView,
  lastSyncTime
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const NAV_DROPDOWNS: Record<string, { label: string; hub: string }[]> = {
    'ai-tools': [
      { label: 'AI Writing Tools', hub: 'ai-tools' },
      { label: 'AI Image Tools', hub: 'ai-tools' },
      { label: 'AI Video Tools', hub: 'ai-tools' },
      { label: 'Automation Tools', hub: 'ai-tools' },
    ],
    'best-software': [
      { label: 'Productivity', hub: 'best-software' },
      { label: 'CRM Software', hub: 'best-software' },
      { label: 'Developer Tools', hub: 'best-software' },
      { label: 'Creative Tools', hub: 'best-software' },
    ],
  };

  const openDropdown = (slug: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    if (NAV_DROPDOWNS[slug]) setActiveDropdown(slug);
  };

  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 180);
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSearchValue(searchQuery);
    if (!searchQuery) {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Update dropdown position when suggestions change or search is open
  useEffect(() => {
    if (searchContainerRef.current && suggestions.length > 0) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(320, rect.width)
      });
    }
  }, [suggestions, isSearchOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    // Don't call onSearch here - only show dropdown suggestions

    if (val.trim().length > 1) {
      console.log('Searching for:', val);
      console.log('Total articles to search:', newsArticles.length);
      const filtered = newsArticles.filter(a => {
        const titleMatch = a.title.toLowerCase().includes(val.toLowerCase());
        const catMatch = Array.isArray(a.category)
          ? a.category.some(c => c.toLowerCase().includes(val.toLowerCase()))
          : (typeof a.category === 'string' && (a.category as string).toLowerCase().includes(val.toLowerCase()));

        return titleMatch || catMatch;
      }).slice(0, 10); // Increased from 5 to 10 to show more results
      console.log('Found results:', filtered.length, filtered.map(a => a.title));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (article: Article) => {
    onArticleSelect(article);
    setSearchValue('');
    setSuggestions([]);
    onSearch('');
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchValue('');
      setSuggestions([]);
      onSearch('');
    } else {
      setIsSearchOpen(true);
    }
  };

  return (
    <div className={`fixed top-0 left-0 w-full z-50 flex flex-col font-sans overflow-visible transition-colors duration-300 ${isScrolled ? 'bg-surface-base/80 backdrop-blur-md shadow-sm' : 'bg-surface-base'}`}>

      {/* Top Bar (Primary Nav) */}
      <div className="w-full border-b border-border-divider overflow-visible">
        <div className="container mx-auto px-4 md:px-8 py-3 md:py-0 md:h-16 flex flex-col md:flex-row gap-3 md:gap-0 overflow-visible">

          {/* Top Row on Mobile: Logo + Right Actions */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => { onCategorySelect('All'); }}
              >
                {/* toolcurrent official logo image */}
                <div className="flex items-center h-8 md:h-10">
                  <img
                    src="/logo.png"
                    alt="toolcurrent"
                    className="h-full w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Mobile: Search & Menu (Moved here for row 1) */}
            <div className="flex md:hidden items-center gap-4">
              {/* Minified search trigger for mobile row 1 */}
              <button onClick={toggleSearch} className="text-gray-400 hover:text-white transition-colors">
                <Search size={18} />
              </button>
              <button onClick={onSubscribeClick} className="text-gray-400 hover:text-white transition-colors">
                <Bell size={18} />
              </button>
              <button
                className="text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Desktop Right Actions (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-4 ml-auto overflow-visible">
            {/* Expanded Search */}
            {isSearchOpen ? (
              <div ref={searchContainerRef} className="flex items-center bg-surface-card border border-border-subtle shadow-elevation rounded-full px-3 py-1.5 animate-fade-in relative w-48 md:w-64">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="bg-transparent border-none focus:outline-none text-white text-base w-full placeholder:text-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && onSearch(searchValue)}
                />
                <button onClick={toggleSearch} className="text-news-accent hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button onClick={toggleSearch} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                <Search size={18} />
                <span className="text-xs font-bold uppercase tracking-widest hidden md:block group-hover:underline decoration-news-accent underline-offset-4">Search</span>
              </button>
            )}

            <button
              onClick={onSubscribeClick}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Only visible when search is open on mobile) */}
      <div className={`md:hidden ${isSearchOpen ? 'block' : 'hidden'} w-full border-b border-border-divider p-4 animate-fade-in`}>
        <div className="flex items-center bg-surface-card border border-border-subtle shadow-inner rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="bg-transparent border-none focus:outline-none text-white text-base w-full"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchValue)}
          />
          <button onClick={toggleSearch}>
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Secondary Bar */}
      <div className={`w-full border-b border-border-divider transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'} relative`}>
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6 md:gap-8 min-w-max">
            {navCategories.map(cat => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => openDropdown(cat.slug)}
                onMouseLeave={closeDropdown}
              >
                <button
                  onClick={() => {
                    if (onHubClick) {
                      onHubClick(cat.slug);
                    } else {
                      onCategorySelect(cat.id);
                    }
                    setActiveDropdown(null);
                  }}
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap relative px-2 py-1.5 rounded-md flex items-center gap-1 ${activeCategory === cat.id ? 'text-news-accent bg-surface-hover' : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                    }`}
                >
                  {cat.label}
                  {NAV_DROPDOWNS[cat.slug] && (
                    <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`transition-transform ${activeDropdown === cat.slug ? 'rotate-180' : ''}`}>
                      <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                  {activeCategory === cat.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-news-accent rounded-full"></span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {NAV_DROPDOWNS[cat.slug] && activeDropdown === cat.slug && (
                  <div
                    className="absolute top-full left-0 mt-2 w-48 bg-surface-card border border-border-subtle rounded-[14px] shadow-elevation overflow-hidden z-50 animate-fade-in"
                    onMouseEnter={() => openDropdown(cat.slug)}
                    onMouseLeave={closeDropdown}
                  >
                    {NAV_DROPDOWNS[cat.slug].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onHubClick) onHubClick(item.hub);
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-news-text hover:text-white hover:bg-surface-hover transition-colors border-b border-border-divider last:border-0 font-medium"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-28 bg-black z-40 p-6 animate-fade-in md:hidden border-t border-white/10 overflow-y-auto">
          <div className="flex flex-col gap-1 text-sm font-bold uppercase tracking-widest">
            <button onClick={() => { onCategorySelect('All'); setIsMobileMenuOpen(false); }} className="text-left text-white border-b border-white/10 py-4">Home</button>
            {navCategories.map(cat => (
              <div key={cat.id}>
                <button
                  onClick={() => { if (onHubClick) onHubClick(cat.slug); setIsMobileMenuOpen(false); }}
                  className="w-full text-left text-white border-b border-white/10 py-4 flex items-center justify-between"
                >
                  {cat.label}
                  {NAV_DROPDOWNS[cat.slug] && <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                </button>
                {NAV_DROPDOWNS[cat.slug] && (
                  <div className="pl-4 pb-2 space-y-1">
                    {NAV_DROPDOWNS[cat.slug].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => { if (onHubClick) onHubClick(item.hub); setIsMobileMenuOpen(false); }}
                        className="block w-full text-left text-gray-400 py-2 text-xs"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => { onShowAbout(); setIsMobileMenuOpen(false); }} className="text-left text-white border-b border-white/10 py-4">About</button>
            <button onClick={() => { onSubscribeClick(); setIsMobileMenuOpen(false); }} className="text-left text-white py-4">Subscribe</button>
          </div>
        </div>
      )}

      {/* Search Dropdown Portal - renders outside navigation hierarchy */}
      {suggestions.length > 0 && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999
          }}
          className="bg-surface-card border border-border-subtle rounded-[14px] shadow-elevation overflow-hidden max-h-[400px] overflow-y-auto"
        >
          {suggestions.map(article => (
            <div
              key={article.id}
              onClick={() => handleSuggestionClick(article)}
              className="p-3 border-b border-border-divider hover:bg-surface-hover cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="flex-grow min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{article.title}</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 flex items-center gap-2">
                  <span>{(() => {
                    const cat = Array.isArray(article.category) ? article.category[0] : article.category;
                    return cat === 'Action' || cat === 'Act' ? 'Guides' : cat;
                  })()}</span>
                  <span className="text-gray-600">•</span>
                  <span>{article.date}</span>
                </p>
              </div>
              <ChevronRight size={12} className="text-gray-600" />
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Navigation;
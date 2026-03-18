
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Save, Plus, Download, Upload, Calendar, Eye, EyeOff, Sparkles, Image as ImageIcon, Clock, Copy, FileImage, Volume2, Loader2, ArrowLeft, LogOut, Search, Headphones, ExternalLink, ArrowRight, Layers, Tag, ChevronDown, Code2 } from 'lucide-react';
import { generateSlug } from '../utils/slugify';
import { Article } from '../types';
import { newsArticles as staticArticles } from '../data/content';
import AdminLogin from './AdminLogin';

interface AdminDashboardProps {
    onBack: () => void;
}


const CATEGORIES = ['AI Tools', 'Best Software', 'Reviews', 'Comparisons', 'Use Cases', 'Guides', 'News'];
const ARTICLE_TYPES = ['news', 'review', 'guide', 'best-of', 'comparison', 'use-case'];

const CATEGORY_COLORS: Record<string, string> = {
    'AI Tools': 'text-blue-400',
    'Best Software': 'text-purple-400',
    'Reviews': 'text-yellow-400',
    'Comparisons': 'text-cyan-400',
    'Use Cases': 'text-green-400',
    'Guides': 'text-news-accent',
    'News': 'text-gray-400'
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [articles, setArticles] = useState<Article[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    // AI Orchestrator State
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiModel, setAiModel] = useState('gemini-1.5-flash-latest');
    const [minMinutes, setMinMinutes] = useState(5);
    const [maxMinutes, setMaxMinutes] = useState(10);

    // Structured Content Generation State
    const [structuredLoading, setStructuredLoading] = useState(false);
    const [structuredError, setStructuredError] = useState<string | null>(null);
    const [structuredSuccess, setStructuredSuccess] = useState(false);

    // Import Tool State
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');

    // Social Media State
    const [socialPosts, setSocialPosts] = useState<{
        twitter?: { text: string, headline: string },
        facebook?: { text: string, headline: string },
        instagram?: { text: string, headline: string },
        tiktok?: { text: string, headline: string }
    } | null>(null);
    const [socialLoading, setSocialLoading] = useState(false);
    const [activeSocialTab, setActiveSocialTab] = useState<'twitter' | 'facebook' | 'instagram' | 'tiktok'>('instagram');
    const [imagePrompt, setImagePrompt] = useState('');
    const [imagePromptLoading, setImagePromptLoading] = useState(false);

    // Audio Generation State
    const [audioLoading, setAudioLoading] = useState(false);

    // Database Status
    const [dbOnline, setDbOnline] = useState(true);

    // CMS tab navigation
    const [cmsTab, setCmsTab] = useState<'articles' | 'tools' | 'comparisons' | 'categories'>('articles');

    // Category + UseCase state
    const [categories, setCategories] = useState<any[]>([]);
    const [catForm, setCatForm] = useState<any>({ name: '', slug: '', description: '', icon: '', parent_category: '', meta_title: '', meta_description: '' });
    const [editingCatSlug, setEditingCatSlug] = useState<string | null>(null);
    const [catLoading, setCatLoading] = useState(false);
    const [useCasesAdmin, setUseCasesAdmin] = useState<any[]>([]);
    const [ucForm, setUcForm] = useState<any>({ name: '', slug: '', description: '', primary_category: '' });
    const [editingUcSlug, setEditingUcSlug] = useState<string | null>(null);
    const [ucLoading, setUcLoading] = useState(false);

    // Tools state
    const [tools, setTools] = useState<any[]>([]);
    const EMPTY_TOOL_FORM = { name: '', slug: '', short_description: '', full_description: '', pricing_model: 'Freemium', starting_price: '', category_primary: '', secondary_tags: '', use_case_tags: [] as string[], key_features: '', pros: '', cons: '', integrations: '', supported_platforms: [] as string[], website_url: '', affiliate_url: '', logo: '', data_confidence: 'ai_generated', related_tools: [] as string[], competitors: [] as string[], meta_title: '', meta_description: '' };
    const [toolForm, setToolForm] = useState<any>({ ...EMPTY_TOOL_FORM });
    const [toolErrors, setToolErrors] = useState<Record<string, string>>({});
    const [editingToolId, setEditingToolId] = useState<string | null>(null);
    const [toolLoading, setToolLoading] = useState(false);
    // Parser panel state
    const [showParser, setShowParser] = useState(false);
    const [parseInput, setParseInput] = useState('');
    const [parseLoading, setParseLoading] = useState(false);
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [parseSuccess, setParseSuccess] = useState(false);

    // Comparisons state
    const [comparisons, setComparisons] = useState<any[]>([]);
    const [compForm, setCompForm] = useState<any>({ title: '', slug: '', tool_a: '', tool_b: '', verdict: '' });
    const [editingCompId, setEditingCompId] = useState<string | null>(null);
    const [compLoading, setCompLoading] = useState(false);

    const loadTools = async () => {
        const res = await fetch('/api/tools', { headers: getAuthHeaders() });
        if (res.ok) setTools(await res.json());
    };

    const loadComparisons = async () => {
        const res = await fetch('/api/comparisons', { headers: getAuthHeaders() });
        if (res.ok) setComparisons(await res.json());
    };

    const loadCategories = async () => {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
    };

    const loadUseCases = async () => {
        const res = await fetch('/api/use-cases');
        if (res.ok) setUseCasesAdmin(await res.json());
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (cmsTab === 'tools') loadTools();
            if (cmsTab === 'comparisons') loadComparisons();
            if (cmsTab === 'categories') { loadCategories(); loadUseCases(); }
        }
    }, [cmsTab, isAuthenticated]);

    const handleSaveCategory = async () => {
        setCatLoading(true);
        try {
            const method = editingCatSlug ? 'PUT' : 'POST';
            const url = editingCatSlug ? `/api/categories/${editingCatSlug}` : '/api/categories';
            await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(catForm) });
            setCatForm({ name: '', slug: '', description: '', icon: '', parent_category: '', meta_title: '', meta_description: '' });
            setEditingCatSlug(null);
            await loadCategories();
        } finally { setCatLoading(false); }
    };

    const handleDeleteCategory = async (slug: string) => {
        if (!confirm(`Delete category "${slug}"?`)) return;
        await fetch(`/api/categories/${slug}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadCategories();
    };

    const handleSaveUseCase = async () => {
        setUcLoading(true);
        try {
            const method = editingUcSlug ? 'PUT' : 'POST';
            const url = editingUcSlug ? `/api/use-cases/${editingUcSlug}` : '/api/use-cases';
            await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(ucForm) });
            setUcForm({ name: '', slug: '', description: '', primary_category: '' });
            setEditingUcSlug(null);
            await loadUseCases();
        } finally { setUcLoading(false); }
    };

    const handleDeleteUseCase = async (slug: string) => {
        if (!confirm(`Delete use case "${slug}"?`)) return;
        await fetch(`/api/use-cases/${slug}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadUseCases();
    };

    const validateToolForm = (form: any): Record<string, string> => {
        const errors: Record<string, string> = {};
        const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
        const splitLines = (v: string | string[]) => Array.isArray(v) ? v : v.split('\n').map((s: string) => s.trim()).filter(Boolean);
        const splitComma = (v: string | string[]) => Array.isArray(v) ? v : v.split(',').map((s: string) => s.trim()).filter(Boolean);

        // Short description: 15–25 words
        const sdWords = countWords(form.short_description || '');
        if (sdWords < 15 || sdWords > 25) errors.short_description = `Must be 15–25 words (currently ${sdWords})`;

        // Long description: 80–120 words
        const ldWords = countWords(form.full_description || '');
        if (ldWords < 80 || ldWords > 120) errors.full_description = `Must be 80–120 words (currently ${ldWords})`;

        // Key features: 4–6 items, each 3–10 words
        const kf = splitLines(form.key_features);
        if (kf.length < 4 || kf.length > 6) errors.key_features = `Must have 4–6 items (currently ${kf.length})`;
        else {
            const badKf = kf.filter((f: string) => { const w = countWords(f); return w < 3 || w > 10; });
            if (badKf.length) errors.key_features = `Each feature must be 3–10 words. Check: "${badKf[0]}"`;
        }

        // Pros: 3–5
        const pros = splitLines(form.pros);
        if (pros.length < 3 || pros.length > 5) errors.pros = `Must have 3–5 items (currently ${pros.length})`;

        // Cons: 2–4
        const cons = splitLines(form.cons);
        if (cons.length < 2 || cons.length > 4) errors.cons = `Must have 2–4 items (currently ${cons.length})`;

        // Integrations: 3–6
        const ints = splitComma(form.integrations);
        if (ints.length < 3 || ints.length > 6) errors.integrations = `Must have 3–6 items (currently ${ints.length})`;

        // Use cases: 1–5, from enum only
        const ucs: string[] = Array.isArray(form.use_case_tags) ? form.use_case_tags : splitComma(form.use_case_tags);
        const VALID_USE_CASES = ['Content Creation','Research','Coding','Automation','Lead Generation','Customer Support','Data Analysis','Design','Education','Personal Productivity'];
        if (ucs.length < 1 || ucs.length > 5) errors.use_case_tags = `Must select 1–5 use cases (currently ${ucs.length})`;
        else {
            const invalid = ucs.filter((u: string) => !VALID_USE_CASES.includes(u));
            if (invalid.length) errors.use_case_tags = `Invalid use case(s): ${invalid.join(', ')}`;
        }

        return errors;
    };

    const normalizeIntegrations = (v: string | string[]): string[] => {
        const raw = Array.isArray(v) ? v.join(',') : v;
        const toTitleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        return [...new Set(
            raw.split(',').map((s: string) => toTitleCase(s.trim())).filter(Boolean)
        )];
    };

    const handleSaveTool = async () => {
        const errors = validateToolForm(toolForm);
        if (Object.keys(errors).length > 0) { setToolErrors(errors); return; }
        setToolErrors({});
        setToolLoading(true);
        const method = editingToolId ? 'PUT' : 'POST';
        const url = editingToolId ? `/api/tools/${editingToolId}` : '/api/tools';
        const splitLines = (v: string | string[]) => Array.isArray(v) ? v : v.split('\n').map((s: string) => s.trim()).filter(Boolean);
        const splitComma = (v: string | string[]) => Array.isArray(v) ? v : v.split(',').map((s: string) => s.trim()).filter(Boolean);
        const payload = {
            ...toolForm,
            secondary_tags: splitComma(toolForm.secondary_tags),
            category_tags: splitComma(toolForm.secondary_tags), // keep legacy field in sync
            use_case_tags: Array.isArray(toolForm.use_case_tags) ? toolForm.use_case_tags : splitComma(toolForm.use_case_tags),
            key_features: splitLines(toolForm.key_features),
            pros: splitLines(toolForm.pros),
            cons: splitLines(toolForm.cons),
            integrations: normalizeIntegrations(toolForm.integrations),
            supported_platforms: Array.isArray(toolForm.supported_platforms) ? toolForm.supported_platforms : splitComma(toolForm.supported_platforms),
            related_tools: Array.isArray(toolForm.related_tools) ? toolForm.related_tools : [],
            competitors: Array.isArray(toolForm.competitors) ? toolForm.competitors : [],
        };
        await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
        setToolForm({ ...EMPTY_TOOL_FORM });
        setEditingToolId(null);
        setToolLoading(false);
        loadTools();
    };

    const handleDeleteTool = async (id: string) => {
        if (!confirm('Delete this tool?')) return;
        await fetch(`/api/tools/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadTools();
    };

    const handleParseInput = async () => {
        setParseLoading(true);
        setParseErrors([]);
        setParseSuccess(false);
        try {
            const res = await fetch('/api/tools/parse', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ rawText: parseInput }),
            });
            const result = await res.json();
            if (result.status === 'error') {
                setParseErrors(result.errors);
            } else {
                const d = result.data;
                setToolForm({
                    ...EMPTY_TOOL_FORM,
                    name: d.name || '',
                    slug: d.slug || '',
                    short_description: d.short_description || '',
                    full_description: d.full_description || '',
                    category_primary: d.category_primary || '',
                    pricing_model: d.pricing_model || 'Freemium',
                    starting_price: d.starting_price || '',
                    use_case_tags: d.use_case_tags || [],
                    key_features: Array.isArray(d.key_features) ? d.key_features.join('\n') : '',
                    pros: Array.isArray(d.pros) ? d.pros.join('\n') : '',
                    cons: Array.isArray(d.cons) ? d.cons.join('\n') : '',
                    integrations: Array.isArray(d.integrations) ? d.integrations.join(', ') : '',
                    supported_platforms: d.supported_platforms || [],
                    website_url: d.website_url || '',
                    affiliate_url: d.affiliate_url || '',
                    logo: d.logo || '',
                    secondary_tags: Array.isArray(d.secondary_tags) ? d.secondary_tags.join(', ') : '',
                    data_confidence: d.data_confidence || 'ai_generated',
                    meta_title: d.meta_title || '',
                    meta_description: d.meta_description || '',
                });
                setToolErrors({});
                setEditingToolId(null);
                setParseSuccess(true);
                setShowParser(false);
                setParseInput('');
            }
        } catch {
            setParseErrors(['Parse request failed. Check connection and try again.']);
        } finally {
            setParseLoading(false);
        }
    };

    const handleSaveComparison = async () => {
        setCompLoading(true);
        const method = editingCompId ? 'PUT' : 'POST';
        const url = editingCompId ? `/api/comparisons/${editingCompId}` : '/api/comparisons';
        await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(compForm) });
        setCompForm({ title: '', slug: '', tool_a: '', tool_b: '', verdict: '' });
        setEditingCompId(null);
        setCompLoading(false);
        loadComparisons();
    };

    const handleDeleteComparison = async (id: string) => {
        if (!confirm('Delete this comparison?')) return;
        await fetch(`/api/comparisons/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadComparisons();
    };

    // Auth helper to get token
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        };
    };

    // Extract voiceover text from article content using VO tags
    const extractVoiceoverText = (content: string[]): string => {
        const fullText = content.join('\n');
        const voMatch = fullText.match(/<<<VO>>>([\s\S]*?)<<<END_VO>>>/);
        return voMatch ? voMatch[1].trim() : '';
    };

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            // Verify token with server
            fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.valid) {
                        setAuthToken(token);
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem('adminToken');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('adminToken');
                })
                .finally(() => {
                    setCheckingAuth(false);
                });
        } else {
            setCheckingAuth(false);
        }
    }, []);

    // Handle login
    const handleLogin = (token: string) => {
        setAuthToken(token);
        setIsAuthenticated(true);
    };

    // Handle logout
    const handleLogout = async () => {
        if (authToken) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
            } catch (err) {
                console.error('Logout error:', err);
            }
        }
        localStorage.removeItem('adminToken');
        setAuthToken(null);
        setIsAuthenticated(false);
    };

    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        category: ['AI Tools'],
        article_type: 'news',
        topic: '',
        excerpt: '',
        content: [],
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        originalReadTime: '5 min read',
        imageUrl: '',
        secondaryImageUrl: '',
        audioUrl: '',
        voiceoverText: '',
        primary_tools: [],
        faq: [],
        contextBox: {
            title: '',
            content: '',
            source: ''
        },
        sources: [],
        status: 'draft',
        scheduledPublishDate: undefined,
        imageOffsetX: 0,
        imageOffsetY: 0
    });

    // SEO State
    const [seoKeywords, setSeoKeywords] = useState('');

    // Load articles only after authentication is verified
    useEffect(() => {
        if (isAuthenticated && !checkingAuth) {
            loadArticles();
        }
    }, [isAuthenticated, checkingAuth]);

    // Auto-extract voiceover text when article content changes
    useEffect(() => {
        if (formData.content && Array.isArray(formData.content) && formData.content.length > 0) {
            const extractedVO = extractVoiceoverText(formData.content);
            if (extractedVO && extractedVO !== formData.voiceoverText) {
                setFormData(prev => ({ ...prev, voiceoverText: extractedVO }));
            }
        }
    }, [formData.content]);

    const loadArticles = async () => {
        try {
            // Cache-busting to ensure we see latest edits
            // Admin view - include all articles (drafts, scheduled, published)
            const res = await fetch(`/api/articles?includeUnpublished=true&t=${Date.now()}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Loaded articles from API:', data.length);
                // Sort by updatedAt or createdAt desc (newest/latest edited on top)
                const sorted = data.sort((a: Article, b: Article) => {
                    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
                setArticles(sorted);
                setDbOnline(true);
            } else {
                throw new Error(`API returned status ${res.status}`);
            }
        } catch (err) {
            console.warn("Failed to load articles from API, falling back to static data", err);
            // Add mock timestamps to static articles so sorting works
            const now = new Date().toISOString();
            const enrichedStatic = staticArticles.map((article, index) => ({
                ...article,
                createdAt: now,
                updatedAt: now,
                // Mark as static to prevent editing confusion
                _isStatic: true
            }));
            setArticles(enrichedStatic);
            setDbOnline(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers,
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, imageUrl: data.url }));
            } else {
                const error = await res.json().catch(() => ({ error: 'Upload failed' }));
                alert(error.error || 'Upload failed. Please check your permissions.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        console.log('Uploading audio file:', file.name, file.type, file.size);

        const formData = new FormData();
        formData.append('audio', file);

        setLoading(true);
        try {
            // Don't set Content-Type - let browser set multipart/form-data with boundary
            const headers: HeadersInit = {};
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers,
                body: formData
            });

            console.log('Upload response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('Upload successful:', data);
                setFormData(prev => ({ ...prev, audioUrl: data.url }));
                alert('Audio uploaded successfully!');
            } else {
                const errorText = await res.text();
                console.error('Upload failed with status:', res.status, errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    alert(`Upload failed: ${errorJson.error || errorText}`);
                } catch {
                    alert(`Upload failed (${res.status}): ${errorText}`);
                }
            }
        } catch (err) {
            console.error('Audio upload error:', err);
            alert(`Audio upload failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };


    const handleImport = () => {
        if (!importText.trim()) return;

        const parseTag = (tag: string) => {
            const regex = new RegExp(`<<<${tag}>>>([\\s\\S]*?)<<<END_${tag}>>>`, 'i');
            const match = importText.match(regex);
            return match ? match[1].trim() : '';
        };

        const newTitle = parseTag('HEADLINE');
        const newDate = parseTag('DISPLAY_DATE');
        const newReadTime = parseTag('READ_TIME');
        const newExcerpt = parseTag('TEASER');

        const genTitle = parseTag('GENERAL_TITLE');
        const genContent = parseTag('GENERAL_TEXT');
        const genSource = parseTag('GENERAL_SOURCES');

        const mainBodyRaw = parseTag('MAIN_BODY');
        const mainBody = mainBodyRaw ? mainBodyRaw.split(/\n\s*\n/).map(p => p.trim()).filter(p => p) : [];

        const keywordsRaw = parseTag('KEYWORDS');
        const metaDesc = parseTag('META');

        // Parse Voiceover Text
        const voText = parseTag('VO');

        // Parse Sources
        const sourcesRaw = parseTag('MAIN_BODY_SOURCES');
        const newSources = sourcesRaw ? sourcesRaw.split(/\n/).map(s => s.trim()).filter(s => s) : [];

        setFormData(prev => ({
            ...prev,
            title: newTitle || prev.title,
            date: newDate || prev.date,
            originalReadTime: newReadTime || prev.originalReadTime,
            excerpt: newExcerpt || prev.excerpt,
            content: mainBody.length > 0 ? mainBody : prev.content,
            seoDescription: metaDesc || prev.seoDescription,
            sources: newSources.length > 0 ? newSources : prev.sources,
            voiceoverText: voText || prev.voiceoverText,
            contextBox: {
                title: genTitle || prev.contextBox?.title || '',
                content: genContent || prev.contextBox?.content || '',
                source: genSource || prev.contextBox?.source || ''
            }
        }));

        if (keywordsRaw) {
            setSeoKeywords(keywordsRaw);
        }

        alert('Content imported successfully!');
        setShowImport(false);
        setImportText('');
    };

    const handleAiGenerate = async (type: 'title' | 'body' | 'full') => {
        const prompt = type === 'full' ? aiPrompt : (type === 'title'
            ? (formData.topic || formData.category)
            : (formData.title || formData.excerpt || formData.topic));

        if (!prompt) {
            alert('Please enter a prompt or topic.');
            return;
        }

        setAiLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    type,
                    model: aiModel,
                    category: formData.category,
                    topic: formData.topic,
                    minMinutes,
                    maxMinutes
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'AI Error');
            }

            const data = await res.json();
            if (type === 'full') {
                // Populate all fields from AI response
                if (data.title && data.content) {
                    setFormData(prev => ({
                        ...prev,
                        title: data.title,
                        excerpt: data.excerpt || data.content[0], // Use provided excerpt or first paragraph
                        content: data.content,
                        date: data.publicationDate || prev.date,
                        originalReadTime: data.readTime || `${Math.ceil(data.content.join(' ').split(/\s+/).length / 200)} min read`,
                        contextBox: data.contextBox || prev.contextBox
                    }));

                    // Set keywords if provided
                    if (data.keywords && Array.isArray(data.keywords)) {
                        setSeoKeywords(data.keywords.join(', '));
                    }
                }
            } else if (data.text) {
                if (type === 'title') {
                    setFormData(prev => ({ ...prev, title: data.text.replace(/\*\*/g, '').trim() }));
                } else {
                    setFormData(prev => ({ ...prev, content: data.text.split('\n\n') }));
                }
            }
        } catch (err: any) {
            console.error(err);
            // Alert the specific error from the server (e.g. Quota Exceeded)
            if (err.message && err.message !== 'AI Error') {
                alert(`AI Generation Failed: ${err.message}`);
            } else {
                alert('AI Generation failed. Check server logs.');
            }
        } finally {
            setAiLoading(false);
        }
    };




    const handleStructuredGenerate = async () => {
        const contentType = formData.article_type || 'news';
        const topic = formData.topic || formData.title || '';
        const category = Array.isArray(formData.category) ? formData.category[0] : formData.category || '';
        const toolSlugs = Array.isArray(formData.primary_tools) ? formData.primary_tools : [];

        if (!topic && !category) {
            setStructuredError('Please fill in the Topic or Category field first.');
            return;
        }

        setStructuredLoading(true);
        setStructuredError(null);
        setStructuredSuccess(false);

        try {
            const res = await fetch('/api/generate/structured', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType, topic, category, toolSlugs, model: aiModel })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            if (!data.valid) {
                setStructuredError(`Validation failed: ${(data.errors || []).join(', ')}`);
                return;
            }

            // Apply all generated fields to the form
            const f = data.fields;
            setFormData(prev => ({
                ...prev,
                ...(f.title ? { title: f.title } : {}),
                ...(f.excerpt ? { excerpt: f.excerpt } : {}),
                ...(f.content?.length ? { content: f.content } : {}),
                ...(f.primary_tools?.length ? { primary_tools: f.primary_tools } : {}),
                ...(f.comparison_tools?.length ? { comparison_tools: f.comparison_tools } : {}),
                ...(f.faq?.length ? { faq: f.faq } : {}),
                ...(f.verdict ? { verdict: f.verdict } : {}),
                ...(f.pros?.length ? { pros: f.pros } : {}),
                ...(f.cons?.length ? { cons: f.cons } : {}),
                ...(f.who_its_for?.length ? { who_its_for: f.who_its_for } : {}),
                ...(f.pricing_analysis ? { pricing_analysis: f.pricing_analysis } : {}),
                ...(f.rating_breakdown ? { rating_breakdown: f.rating_breakdown } : {}),
                ...(f.comparison_rows?.length ? { comparison_rows: f.comparison_rows } : {}),
                ...(f.choose_tool_a?.length ? { choose_tool_a: f.choose_tool_a } : {}),
                ...(f.choose_tool_b?.length ? { choose_tool_b: f.choose_tool_b } : {}),
                ...(f.steps?.length ? { steps: f.steps } : {}),
                ...(f.workflow_stages?.length ? { workflow_stages: f.workflow_stages } : {}),
                ...(f.use_cases?.length ? { use_cases: f.use_cases } : {}),
                ...(f.category ? { category: f.category } : {}),
                ...(f.contextBox?.title ? { contextBox: f.contextBox } : {}),
                ...(f.originalReadTime ? { originalReadTime: f.originalReadTime } : {}),
                ...(f.read_time ? { read_time: f.read_time } : {}),
            }));

            setStructuredSuccess(true);
            setTimeout(() => setStructuredSuccess(false), 4000);
        } catch (err: any) {
            setStructuredError(err.message || 'Structured generation failed');
        } finally {
            setStructuredLoading(false);
        }
    };

    const handleImagePromptGenerate = async () => {
        if (!formData.title) {
            alert('Please add a Title first to base the image prompt on.');
            return;
        }

        setImagePromptLoading(true);
        setImagePrompt('');

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Title: ${formData.title}\nExcerpt: ${formData.excerpt || ''}\nContent: ${Array.isArray(formData.content) ? formData.content.slice(0, 2).join('\n') : (formData.content || '')
                        }`,
                    type: 'image_prompt',
                    model: aiModel
                })
            });

            if (!res.ok) throw new Error('Generation failed');

            // The API for image_prompt returns raw text (or we can wrap it in JSON, lets check server implementation)
            // Wait, standard fetch('/api/generate') usually parses JSON. 
            // My server update for 'image_prompt' set `systemPrompt`. 
            // But the server response handling (lines 485+ in server.js) assumes standard AI response structure.
            // Let's verify server.js response handling.

            const data = await res.json();
            // If server returns { prompt: "..." } or similar?
            // Actually, the server implementation for Gemini usually returns `text()`.
            // Let's assume the server returns `res.json(text)` or object.
            // I need to check how server.js sends the response back.

            // ... checking logic ...

            // Assuming server sends the raw text or a JSON with text. 
            // Common pattern in this file is `await res.json()` then using the data.

            // Let's implement robustly:
            if (data.error) throw new Error(data.error);
            setImagePrompt(typeof data === 'string' ? data : (data.content || data.response || JSON.stringify(data)));

        } catch (err: any) {
            alert(`Failed to generate image prompt: ${err.message}`);
        } finally {
            setImagePromptLoading(false);
        }
    };

    const handleSocialGenerate = async () => {
        if (!formData.title && !formData.excerpt) {
            alert('Please draft some content (Title/Excerpt) first.');
            return;
        }

        setSocialLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Title: ${formData.title}\nExcerpt: ${formData.excerpt}\nContent Sample: ${Array.isArray(formData.content)
                        ? formData.content.slice(0, 3).join('\n')
                        : (typeof formData.content === 'string' ? formData.content.substring(0, 1000) : '')
                        }`,
                    type: 'social',
                    model: aiModel
                })
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('Generation failed:', errorData);
                throw new Error(errorData.error || 'Generation failed');
            }
            const data = await res.json();
            setSocialPosts(data);
        } catch (err: any) {
            console.error('Social post generation error:', err);
            alert(`Failed to generate social posts: ${err.message}`);
        } finally {
            setSocialLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        const suffix = "Read on thetoolcurrent.com";
        let finalText = text.trim();
        if (!finalText.includes(suffix)) {
            finalText = finalText + "\n\n" + suffix;
        }
        navigator.clipboard.writeText(finalText);
        alert('Copied to clipboard!');
    };

    const handlePostIntent = (platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok', text: string) => {
        const suffix = "Read on thetoolcurrent.com";
        let finalText = text.trim();
        if (!finalText.includes(suffix)) {
            finalText = finalText + "\n\n" + suffix;
        }

        const encodedText = encodeURIComponent(finalText);
        const articleUrl = `https://thetoolcurrent.com/article/${formData.id || ''}`;
        const encodedUrl = encodeURIComponent(articleUrl);
        let url = '';

        switch (platform) {
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
                break;
            case 'instagram':
                alert('Instagram does not support direct posting via web. Text copied! Please open Instagram to post.');
                copyToClipboard(finalText);
                return;
            case 'tiktok':
                alert('TikTok does not support direct posting via web. Text copied! Please open TikTok to post.');
                copyToClipboard(finalText);
                return;
        }

        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
    };

    const generateSocialImage = async (platform: 'instagram' | 'twitter' | 'facebook' | 'tiktok') => {
        if (!formData.imageUrl || !formData.title) {
            alert("No image or title available to generate graphic.");
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Dimensions based on Platform
        let width = 1080;
        let height = 1350; // Default Insta Portrait 4:5

        if (platform === 'twitter' || platform === 'facebook') {
            width = 1200;
            height = 630; // Landscape 1.91:1
        } else if (platform === 'tiktok') {
            width = 1080;
            height = 1920; // Vertical 9:16
        }

        canvas.width = width;
        canvas.height = height;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = formData.imageUrl;

        // Wait for image load
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        // 1. Draw Image (Cover)
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);

        // --- ADDED: Manual Offsets ---
        const offsetX = (formData.imageOffsetX || 0) * (canvas.width / 100);
        const offsetY = (formData.imageOffsetY || 0) * (canvas.height / 100);

        const x = (canvas.width / 2) - (img.width / 2) * scale + offsetX;
        const y = (canvas.height / 2) - (img.height / 2) * scale + offsetY;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // 2. Dark Overlay Gradient for Text Readability (Stronger at bottom)
        const gradient = ctx.createLinearGradient(0, canvas.height / 2, 0, canvas.height);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.4, "rgba(0,0,0,0.5)");
        gradient.addColorStop(0.8, "rgba(0,0,0,0.9)");
        gradient.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);






        // 4. Content Block (Calculated from Bottom)
        const padding = Math.floor(canvas.width * 0.06);
        const margin = padding;

        // --- Adjustments for Platform ---
        let titleScale = 0.08;
        let subScaleFactor = 0.028;
        let brandScale = 0.028; // Default logo scale (reduced from 0.035)
        let verticalLift = canvas.height * 0.055; // Lowering again (was 0.075, orig 0.03)

        if (platform === 'twitter' || platform === 'facebook') {
            titleScale = 0.045; // Aggressive reduction
            subScaleFactor = 0.018;
            brandScale = 0.018; // Smaller logo for landscape (reduced from 0.025)
            verticalLift = canvas.height * 0.08; // Lowering again (was 0.10, orig 0.05)
        }

        let pY = canvas.height - margin - verticalLift;

        // Divider Line
        ctx.beginPath();
        ctx.moveTo(margin, pY);
        ctx.lineTo(margin + 100, pY);
        ctx.strokeStyle = "#2BD4C3";
        ctx.lineWidth = Math.max(6, canvas.width * 0.008);
        ctx.stroke();

        // --- ADDED: Subtitle / Explaining Text ---
        const subSize = Math.floor(canvas.width * subScaleFactor);
        ctx.font = `500 ${subSize}px 'Inter', sans-serif`;
        ctx.fillStyle = "#e5e7eb"; // Zinc-200
        ctx.shadowBlur = 10;

        const subText = formData.excerpt || (Array.isArray(formData.content) ? formData.content[0] : "") || "";

        // --- AUTO-SCALE SUBTEXT IF TOO LONG ---
        let finalSubSize = subSize;
        const subWords = subText.split(' ');
        let subLines = [];
        const maxSubWidth = canvas.width - (margin * 2.5);

        const calculateLines = (fontSize: number) => {
            ctx.font = `500 ${fontSize}px 'Inter', sans-serif`;
            const lines = [];
            let currentLine = '';
            for (let n = 0; n < subWords.length; n++) {
                const testLine = currentLine + subWords[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxSubWidth && n > 0) {
                    lines.push(currentLine);
                    currentLine = subWords[n] + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);
            return lines;
        };

        subLines = calculateLines(finalSubSize);
        // If more than 4 lines, shrink font size to fit
        if (subLines.length > 4) {
            finalSubSize = Math.floor(subSize * 0.85); // Shrink 15%
            subLines = calculateLines(finalSubSize);
        }
        // If still more than 5 lines, shrink more
        if (subLines.length > 5) {
            finalSubSize = Math.floor(subSize * 0.7); // Shrink to 70% total
            subLines = calculateLines(finalSubSize);
        }

        // Draw subtext
        ctx.font = `500 ${finalSubSize}px 'Inter', sans-serif`;
        pY -= (finalSubSize * 1.2);

        for (let i = subLines.length - 1; i >= 0; i--) {
            ctx.fillText(subLines[i], margin, pY);
            pY -= (finalSubSize * 1.3);
        }

        pY -= (canvas.width * 0.02); // Buffer before title


        // Title (Big Serif)
        // Scaled size
        const titleSize = Math.floor(canvas.width * titleScale);
        ctx.font = `bold ${titleSize}px 'Playfair Display', serif`;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 20;

        // Use AI Visual Headline if available for this platform, else Title
        let headlineText = formData.title;
        // @ts-ignore
        if (socialPosts && socialPosts[platform] && socialPosts[platform].headline) {
            // @ts-ignore
            headlineText = socialPosts[platform].headline;
        }

        const titleWords = headlineText.toUpperCase().split(' ');
        let titleLine = '';
        const titleLines = [];
        const maxTitleWidth = canvas.width - (margin * 2);

        for (let n = 0; n < titleWords.length; n++) {
            const testLine = titleLine + titleWords[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxTitleWidth && n > 0) {
                titleLines.push(titleLine);
                titleLine = titleWords[n] + ' ';
            } else {
                titleLine = testLine;
            }
        }
        titleLines.push(titleLine);

        // Draw Title from bottom up
        for (let i = titleLines.length - 1; i >= 0; i--) {
            ctx.fillText(titleLines[i], margin, pY);
            pY -= (titleSize * 1.2); // Title Line Height
        }

        // --- NEW Branding Position: Bottom Right (Subtle) ---
        ctx.save();
        const brandSize = Math.floor(canvas.width * brandScale); // Dynamic scale
        ctx.font = `bold ${brandSize}px 'Playfair Display', serif`;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 5;

        const briefMetrics = ctx.measureText("CURRENT.COM");
        const stackMetrics = ctx.measureText("TOOL");

        const bx = margin;
        const by = canvas.height - margin;

        ctx.fillStyle = "#2BD4C3";
        ctx.fillText("TOOL", bx, by);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("CURRENT.COM", bx + stackMetrics.width, by);
        ctx.restore();


        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `toolcurrent-${platform}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    };

    // Generate Audio Handler
    const handleGenerateAudio = async () => {
        if (!editingId) {
            alert('Please save the article first before generating audio.');
            return;
        }

        setAudioLoading(true);
        try {
            const res = await fetch('/api/generate-audio', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    articleId: editingId,
                    voiceoverText: formData.voiceoverText // Send current text from form
                })
            });

            const data = await res.json();

            if (res.ok) {
                setFormData(prev => ({ ...prev, audioUrl: data.audioUrl }));
                alert('Audio generated successfully!');
                await loadArticles();
            } else {
                const errorMsg = data.details
                    ? `${data.error}\n\nDetails: ${data.details}`
                    : data.error || 'Failed to generate audio';
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Audio generation error:', error);
            alert('Failed to generate audio. Please try again.');
        } finally {
            setAudioLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const contentArray = Array.isArray(formData.content) ? formData.content : (formData.content as any).split('\n');

            // Generate slug from title if not already set
            const slug = formData.slug || generateSlug(formData.title);

            const payload = {
                ...formData,
                slug, // Add slug to article data
                content: contentArray,
                // Parse CSV string to array for backend
                keywords: seoKeywords.split(',').map(s => s.trim()).filter(Boolean),
                seoDescription: formData.seoDescription,
                // Ensure dates are set if missing
                createdAt: formData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // ... rest of submit



            const url = editingId
                ? `/api/articles/${editingId}`
                : '/api/articles';

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Article saved successfully!');
                // Refresh article list to show updated status (draft/published)
                await loadArticles();
                setEditingId(null);
                setFormData({
                    title: '',
                    category: ['Climate Change'],
                    topic: '',
                    excerpt: '',
                    content: [],
                    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    originalReadTime: '5 min read',
                    imageUrl: '',
                    audioUrl: '',
                    contextBox: { title: '', content: '', source: '' }
                });
                loadArticles();
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Save failed:', res.status, errorData);
                alert(`Error saving article: ${errorData.error || res.statusText}`);
            }
        } catch (err) {
            console.error('Save error:', err);
            alert(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to DELETE this article? This action cannot be undone.')) {
            setLoading(true);
            try {
                const res = await fetch(`/api/articles/${id}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    alert('Article deleted.');
                    setEditingId(null);
                    setFormData({
                        title: '',
                        category: ['Climate Change'],
                        topic: '',
                        excerpt: '',
                        content: [],
                        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                        originalReadTime: '5 min read',
                        imageUrl: '',
                        contextBox: { title: '', content: '', source: '' }
                    });
                    loadArticles();
                } else {
                    alert('Failed to delete.');
                }
            } catch (err) {
                alert('Network error during delete.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBackupDownload = async () => {
        try {
            const res = await fetch('/api/articles/export', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                // Get filename from Content-Disposition header or use default
                const contentDisposition = res.headers.get('Content-Disposition');
                const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
                const filename = filenameMatch ? filenameMatch[1] : `greenshift-backup-${new Date().toISOString().slice(0, 10)}.json`;

                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download backup. Please try again.');
            }
        } catch (err) {
            console.error('Backup download error:', err);
            alert('Network error during backup download.');
        }
    };


    const handleImageBackupDownload = async () => {
        try {
            const res = await fetch('/api/articles/export-images', {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                const contentDisposition = res.headers.get('Content-Disposition');
                const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
                const filename = filenameMatch ? filenameMatch[1] : `greenshift-images-backup-${new Date().toISOString().slice(0, 10)}.json`;

                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download image backup. Please try again.');
            }
        } catch (err) {
            console.error('Image backup download error:', err);
            alert('Network error during image backup download.');
        }
    };



    const startEdit = (article: Article) => {
        // Check if this is a static fallback article
        if ((article as any)._isStatic) {
            if (!confirm('This is a template article. Editing will create a NEW article in the database. Continue?')) {
                return;
            }
            // Create new article based on static template - remove all IDs and metadata
            const cleanArticle = { ...article };
            delete (cleanArticle as any).id;
            delete (cleanArticle as any)._id;
            delete (cleanArticle as any)._isStatic;
            delete (cleanArticle as any).createdAt;
            delete (cleanArticle as any).updatedAt;
            delete (cleanArticle as any).__v;

            setEditingId(null); // This ensures POST, not PUT
            setFormData({
                ...cleanArticle,
                category: Array.isArray(cleanArticle.category) ? cleanArticle.category : [cleanArticle.category || 'News'],
                primary_tools: cleanArticle.primary_tools || [],
                faq: cleanArticle.faq || [],
                secondaryImageUrl: cleanArticle.secondaryImageUrl || ''
            });
        } else {
            setEditingId(article.id);
            setFormData({
                ...article,
                category: Array.isArray(article.category) ? article.category : [article.category || 'News'],
                primary_tools: article.primary_tools || [],
                faq: article.faq || [],
                secondaryImageUrl: article.secondaryImageUrl || ''
            });
        }
        setSeoKeywords(article.keywords?.join(', ') || '');
        // Scroll to editor
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Show login screen if not authenticated
    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="text-news-accent animate-spin" size={48} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-gray-100 font-sans selection:bg-news-accent/30 pt-20 pb-10 px-4 md:px-8 animate-fade-in">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-16 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 z-20 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-news-accent shadow-[0_0_8px_rgba(43,212,195,0.8)]"></span>
                        CMS Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                    <span>STATUS: {loading ? 'SAVING...' : 'READY'}</span>
                    <span>|</span>
                    <span className={`flex items-center gap-2 ${dbOnline ? 'text-news-accent' : 'text-orange-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dbOnline ? 'bg-news-accent shadow-[0_0_8px_rgba(43,212,195,0.8)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'} animate-pulse`}></span>
                        DB: {dbOnline ? 'LIVE' : 'FALLBACK'}
                    </span>
                    <span>|</span>
                    <button
                        onClick={handleBackupDownload}
                        className="flex items-center gap-2 text-gray-400 hover:text-news-accentHover transition-colors px-2 py-1 rounded hover:bg-white/5"
                        title="Download Backup (All Articles as JSON)"
                    >
                        <Download size={16} />
                        <span>Backup</span>
                    </button>
                    <button
                        onClick={handleImageBackupDownload}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                        title="Download Image URLs Backup (JSON with all image links)"
                    >
                        <Download size={16} />
                        <span>Images</span>
                    </button>
                    <span>|</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                        title="Logout"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Tab Bar */}
            <div className="fixed top-16 left-0 w-full bg-zinc-900/90 border-b border-white/5 z-10 flex items-center gap-0 px-8">
                {(['articles', 'tools', 'comparisons', 'categories', 'social'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setCmsTab(tab as any)}
                        className={`px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${cmsTab === tab
                            ? 'border-news-accent text-news-accent'
                            : 'border-transparent text-gray-500 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="w-full max-w-[1800px] mx-auto h-full pt-14">
                {cmsTab === 'articles' && (
                    <div className="grid grid-cols-12 gap-6 h-full">

                        {/* LEFT COLUMN: LIST (3/12 columns on large screens) -- MOVED TO RIGHT? No, usually Editor is Main.
                        User had Editor Left, List Right. I will keep that.
                        Actually, standard CMS has sidebar left.
                        But code had Editor (col-span-2) and List (col-span-1).
                        I'll keep Editor as the MAIN focus (Left/Center) and List as sidebar (Right).
                    */}

                        {/* MAIN EDITOR AREA */}
                        <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">

                            {/* EDITOR FORM */}
                            <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                                        {editingId ? 'Edit Mode' : 'Drafting Mode'}
                                    </h2>
                                    <span className="text-xs font-mono text-zinc-600 bg-black/30 px-2 py-1 rounded">{editingId || 'NEW_ENTRY'}</span>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {/* ── Structured AI Generation Banner ── */}
                                    <div className="rounded-xl border border-news-accent/20 bg-news-accent/5 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-0.5">AI Content Generator</p>
                                            <p className="text-xs text-zinc-400 leading-snug">
                                                Generates <span className="text-white font-semibold">{
                                                    formData.article_type === 'best-of' ? 'Best-of List' :
                                                    formData.article_type === 'review' ? 'Tool Review' :
                                                    formData.article_type === 'comparison' ? 'Comparison' :
                                                    formData.article_type === 'guide' ? 'Guide' :
                                                    formData.article_type === 'use-case' ? 'Use Case' : 'News Article'
                                                }</span> — all fields at once from Topic + Category{Array.isArray(formData.primary_tools) && formData.primary_tools.length > 0 ? ' + selected tools' : ''}.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {structuredError && (
                                                <span className="text-[10px] text-red-400 max-w-[200px] truncate" title={structuredError}>{structuredError}</span>
                                            )}
                                            {structuredSuccess && (
                                                <span className="text-[10px] text-green-400 font-bold">✓ All fields populated!</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleStructuredGenerate}
                                                disabled={structuredLoading}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-news-accent text-black text-xs font-black hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap"
                                            >
                                                {structuredLoading
                                                    ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                                                    : <><Sparkles size={12} /> Generate All Fields</>
                                                }
                                            </button>
                                        </div>
                                    </div>

                                    {/* Row 1: Title & Meta */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-8 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Headline</label>
                                                <button type="button" onClick={() => handleAiGenerate('title')} className="text-[10px] text-news-accent hover:underline flex items-center gap-1"><Sparkles size={10} /> Suggest</button>
                                            </div>
                                            <input
                                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-xl md:text-2xl font-bold text-white placeholder-zinc-700 focus:border-news-accent focus:ring-1 focus:ring-news-accent/20 outline-none transition-all"
                                                placeholder="Article Headline..."
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Article Type</label>
                                                <select
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none"
                                                    value={formData.article_type || ''}
                                                    onChange={e => setFormData({ ...formData, article_type: e.target.value })}
                                                >
                                                    <option value="">— Select type —</option>
                                                    <option value="news">📰 News</option>
                                                    <option value="review">⭐ Review</option>
                                                    <option value="guide">📖 Guide</option>
                                                    <option value="best-of">🏆 Best-of List</option>
                                                    <option value="comparison">⚖️ Comparison</option>
                                                    <option value="use-case">💡 Use Case</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Topic Tag</label>
                                                <input
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none"
                                                    placeholder="e.g. AI Writing"
                                                    value={formData.topic}
                                                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 1b: Primary Tools (linked tools) */}
                                    {tools.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                Primary Tools <span className="text-zinc-600 normal-case font-normal">(tools featured — auto-linked in article text)</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2 bg-zinc-950/30 p-3 rounded-xl border border-white/5 min-h-[56px]">
                                                {tools.map(t => {
                                                    const isSelected = Array.isArray(formData.primary_tools) && formData.primary_tools.includes(t.slug);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={t.slug}
                                                            onClick={() => {
                                                                const curr = Array.isArray(formData.primary_tools) ? formData.primary_tools : [];
                                                                setFormData({
                                                                    ...formData,
                                                                    primary_tools: isSelected ? curr.filter((s: string) => s !== t.slug) : [...curr, t.slug]
                                                                });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${isSelected
                                                                ? 'bg-news-accent text-black border-news-accent'
                                                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                                                                }`}
                                                        >
                                                            {t.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Row 1c: Comparison Tools (shown for comparison article type) */}
                                    {tools.length > 0 && formData.article_type === 'comparison' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                Comparison Tools <span className="text-zinc-600 normal-case font-normal">(tools being compared head-to-head)</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2 bg-zinc-950/30 p-3 rounded-xl border border-white/5 min-h-[56px]">
                                                {tools.map(t => {
                                                    const isSelected = Array.isArray(formData.comparison_tools) && formData.comparison_tools.includes(t.slug);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={t.slug}
                                                            onClick={() => {
                                                                const curr = Array.isArray(formData.comparison_tools) ? formData.comparison_tools : [];
                                                                setFormData({
                                                                    ...formData,
                                                                    comparison_tools: isSelected ? curr.filter((s: string) => s !== t.slug) : [...curr, t.slug]
                                                                });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${isSelected
                                                                ? 'bg-blue-500 text-white border-blue-500'
                                                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                                                                }`}
                                                        >
                                                            {t.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Row 2: Categories & Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Categories (Max 3)</label>
                                            <div className="flex flex-wrap gap-2 bg-zinc-950/30 p-4 rounded-xl border border-white/5 min-h-[100px]">
                                                {CATEGORIES.map(c => (
                                                    <button
                                                        type="button"
                                                        key={c}
                                                        onClick={() => {
                                                            const current = Array.isArray(formData.category) ? formData.category : [];
                                                            const exists = current.includes(c);
                                                            let newCats = exists ? current.filter(cat => cat !== c) : [...current, c];
                                                            if (newCats.length > 3) newCats = newCats.slice(0, 3);
                                                            setFormData({ ...formData, category: newCats });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wide transition-all border
                                                        ${(Array.isArray(formData.category) ? formData.category.includes(c) : formData.category === c)
                                                                ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Display Date</label>
                                                <input
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none"
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Read Time</label>
                                                <input
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none"
                                                    value={formData.originalReadTime}
                                                    onChange={e => setFormData({ ...formData, originalReadTime: e.target.value })}
                                                />
                                            </div>

                                            {/* FEATURED IMAGE */}
                                            <div className="col-span-2 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cover Image</label>
                                                    <button type="button" onClick={handleImagePromptGenerate} className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                                                        <Sparkles size={10} /> {imagePromptLoading ? 'Creating Prompt...' : 'Generate Image Prompt'}
                                                    </button>
                                                </div>
                                                {imagePrompt && (
                                                    <div className="mb-2 p-3 bg-zinc-900 border border-white/10 rounded-lg">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[10px] font-bold text-news-accent uppercase">Midjourney / DALL-E Prompt</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigator.clipboard.writeText(imagePrompt)}
                                                                className="text-[10px] text-zinc-500 hover:text-white bg-white/5 px-2 py-0.5 rounded"
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-zinc-300 select-all font-serif italic">{imagePrompt}</p>
                                                    </div>
                                                )}
                                                {/* Primary & Secondary Image Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] text-zinc-600 uppercase font-bold">Primary Image URL</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                className="flex-1 bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none"
                                                                placeholder="https://..."
                                                                value={formData.imageUrl}
                                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                            />
                                                            <label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors">
                                                                <Upload size={16} title="Upload Image" />
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] text-zinc-600 uppercase font-bold">Secondary Image (Optional)</label>
                                                        <input
                                                            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none"
                                                            placeholder="https://..."
                                                            value={formData.secondaryImageUrl}
                                                            onChange={e => setFormData({ ...formData, secondaryImageUrl: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                {formData.imageUrl && (
                                                    <div className="h-24 w-full rounded-xl overflow-hidden border border-white/5 relative mt-3">
                                                        <img src={formData.imageUrl} className="w-full h-full object-cover opacity-60" />
                                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono bg-black/20">PREVIEW</div>
                                                    </div>
                                                )}
                                                <div className="mt-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Image Attribution</label>
                                                    <input
                                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none mt-1"
                                                        value={formData.imageAttribution || ''}
                                                        onChange={e => setFormData({ ...formData, imageAttribution: e.target.value })}
                                                        placeholder="Photo by Jane Doe / Unsplash"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* FAQ BUILDER */}
                                    <div className="space-y-4 bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">FAQ Section</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, faq: [...(formData.faq || []), { question: '', answer: '' }] })}
                                                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                            >
                                                <Plus size={10} /> Add FAQ
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {(formData.faq || []).map((item, idx) => (
                                                <div key={idx} className="space-y-2 p-4 bg-zinc-900/50 border border-white/5 rounded-xl group relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newFaq = [...(formData.faq || [])];
                                                            newFaq.splice(idx, 1);
                                                            setFormData({ ...formData, faq: newFaq });
                                                        }}
                                                        className="absolute top-2 right-2 p-1 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <input
                                                        placeholder="Question..."
                                                        className="w-full bg-transparent border-b border-white/10 text-sm font-bold text-white focus:border-news-accent outline-none pb-1"
                                                        value={item.question}
                                                        onChange={e => {
                                                            const newFaq = [...(formData.faq || [])];
                                                            newFaq[idx].question = e.target.value;
                                                            setFormData({ ...formData, faq: newFaq });
                                                        }}
                                                    />
                                                    <textarea
                                                        placeholder="Answer..."
                                                        rows={2}
                                                        className="w-full bg-transparent text-xs text-gray-400 focus:text-gray-200 outline-none resize-none"
                                                        value={item.answer}
                                                        onChange={e => {
                                                            const newFaq = [...(formData.faq || [])];
                                                            newFaq[idx].answer = e.target.value;
                                                            setFormData({ ...formData, faq: newFaq });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            {(formData.faq || []).length === 0 && (
                                                <p className="text-[10px] text-zinc-600 italic text-center py-2">No FAQs added.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Areas */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Teaser / Excerpt</label>
                                            <textarea
                                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-sm font-serif italic text-zinc-400 focus:border-news-accent outline-none h-24"
                                                value={formData.excerpt}
                                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                placeholder="Hook the reader..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sources (One per line)</label>
                                            <textarea
                                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-400 focus:border-news-accent outline-none h-24"
                                                value={formData.sources?.join('\n') || ''}
                                                onChange={e => setFormData({ ...formData, sources: e.target.value.split('\n') })}
                                                placeholder="IPCC Report 2024&#10;NOAA Climate Data&#10;..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Main Body</label>
                                                <button type="button" onClick={() => handleAiGenerate('body')} className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"><Sparkles size={10} /> Auto-Complete Body</button>
                                            </div>
                                            <textarea
                                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-6 text-base font-serif leading-relaxed text-zinc-300 focus:border-news-accent outline-none min-h-[500px]"
                                                value={Array.isArray(formData.content) ? formData.content.join('\n\n') : formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value.split('\n\n') })}
                                                placeholder="Write your story here..."
                                            />
                                        </div>
                                    </div>

                                    {/* EXTRAS: Context & Visibility */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deep Dive Context</h3>
                                            <input
                                                className="w-full bg-zinc-950/30 border border-white/10 rounded-lg p-3 text-xs text-white"
                                                placeholder="Context Title"
                                                value={formData.contextBox?.title || ''}
                                                onChange={e => setFormData({ ...formData, contextBox: { ...(formData.contextBox || {}), title: e.target.value } as any })}
                                            />
                                            <textarea
                                                className="w-full bg-zinc-950/30 border border-white/10 rounded-lg p-3 text-xs text-zinc-400 h-20"
                                                placeholder="Context details..."
                                                value={formData.contextBox?.content || ''}
                                                onChange={e => setFormData({ ...formData, contextBox: { ...(formData.contextBox || {}), content: e.target.value } as any })}
                                            />
                                            <input
                                                className="w-full bg-zinc-950/30 border border-white/10 rounded-lg p-3 text-xs text-zinc-500"
                                                placeholder="Source (e.g. NOAA)"
                                                value={formData.contextBox?.source || ''}
                                                onChange={e => setFormData({ ...formData, contextBox: { ...(formData.contextBox || {}), source: e.target.value } as any })}
                                            />
                                        </div>

                                        {/* SEO META */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Search Engine Optimization</h3>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Focus Keywords (Comma Separated)</label>
                                                <input
                                                    className="w-full bg-zinc-950/30 border border-white/10 rounded-lg p-3 text-xs text-white"
                                                    placeholder="e.g. climate change, emissions, carbon tax"
                                                    value={seoKeywords}
                                                    onChange={e => setSeoKeywords(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Meta Description</label>
                                                <textarea
                                                    className="w-full bg-zinc-950/30 border border-white/10 rounded-lg p-3 text-xs text-zinc-400 h-24"
                                                    placeholder="Brief summary for search results (max 160 chars recommended)..."
                                                    value={formData.seoDescription || ''}
                                                    onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Visibility & SEO</h3>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors flex-1">
                                                    <input type="checkbox" className="accent-news-accent scale-110" checked={formData.isFeaturedDiscover || false} onChange={e => setFormData({ ...formData, isFeaturedDiscover: e.target.checked })} />
                                                    <span className="text-xs text-zinc-400">Article Feed</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors flex-1">
                                                    <input type="checkbox" className="accent-news-accent scale-110" checked={formData.isFeaturedCategory || false} onChange={e => setFormData({ ...formData, isFeaturedCategory: e.target.checked })} />
                                                    <span className="text-xs text-zinc-400">Category Hero</span>
                                                </label>
                                            </div>


                                        </div>

                                        {/* PUBLICATION SETTINGS */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Publication Settings</h3>

                                            <div className="space-y-3">
                                                <label className="block">
                                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Status</span>
                                                    <select
                                                        value={formData.status || 'published'}
                                                        onChange={e => {
                                                            const newStatus = e.target.value as 'draft' | 'published' | 'scheduled';
                                                            setFormData({
                                                                ...formData,
                                                                status: newStatus,
                                                                scheduledPublishDate: newStatus === 'scheduled' ? formData.scheduledPublishDate : undefined
                                                            });
                                                        }}
                                                        className="w-full bg-zinc-950/30 border border-white/10 rounded-lg p-3 text-sm text-white mt-2"
                                                    >
                                                        <option value="draft">Draft (Save Without Publishing)</option>
                                                        <option value="published">Publish Now</option>
                                                        <option value="scheduled">Schedule for Later</option>
                                                    </select>
                                                </label>

                                                {formData.status === 'scheduled' && (
                                                    <label className="block">
                                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Publish Date & Time</span>
                                                        <input
                                                            type="datetime-local"
                                                            value={formData.scheduledPublishDate
                                                                ? new Date(formData.scheduledPublishDate).toISOString().slice(0, 16)
                                                                : ''
                                                            }
                                                            onChange={e => setFormData({
                                                                ...formData,
                                                                scheduledPublishDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
                                                            })}
                                                            min={new Date().toISOString().slice(0, 16)}
                                                            className="w-full bg-zinc-950/30 border border-white/10 rounded-lg p-3 text-sm text-white mt-2"
                                                        />
                                                        <span className="text-[10px] text-zinc-600 mt-1 block">Article will automatically publish at this time</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>


                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-news-accent text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-news-accentHover hover:scale-[1.01] transition-all shadow-[0_0_20px_rgba(43,212,195,0.15)] flex justify-center items-center gap-2"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {editingId ? 'Save Changes' : 'Publish Article'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: LIST SIDEBAR (3/12 columns on large screens) */}
                        <div className="col-span-12 lg:col-span-4 xl:col-span-3 h-full flex flex-col gap-4">
                            <div className="bg-zinc-900/80 backdrop-blur border border-white/10 p-4 rounded-xl flex-1 flex flex-col h-[calc(100vh-140px)] sticky top-24">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Library</h3>
                                    <div className="text-[10px] text-zinc-600 font-mono">{articles.length} ITEMS</div>
                                </div>

                                {/* Controls */}
                                <div className="space-y-2 mb-4">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        <input
                                            className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-700 focus:border-news-accent outline-none"
                                            placeholder="Filter..."
                                        />
                                    </div>
                                    <select
                                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-xs text-zinc-400 outline-none cursor-pointer"
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            const getSortableDate = (item: Article) => {
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

                                            const sorted = [...articles].sort((a, b) => {
                                                if (type === 'date') return getSortableDate(b) - getSortableDate(a);
                                                if (type === 'edited') return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
                                                if (type === 'name') return a.title.localeCompare(b.title);
                                                return 0;
                                            });
                                            setArticles(sorted);
                                        }}
                                    >
                                        <option value="date">Sort: Date (Newest)</option>
                                        <option value="edited">Sort: Last Edited</option>
                                        <option value="name">Sort: Name (A-Z)</option>
                                    </select>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setFormData({
                                                title: '', category: ['Climate Change'], topic: '', excerpt: '', content: [],
                                                date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                                                originalReadTime: '5 min read', imageUrl: '', contextBox: { title: '', content: '', source: '' }
                                            });
                                        }}
                                        className="w-full py-3 mb-2 border border-dashed border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:border-news-accent/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload size={14} /> Create New
                                    </button>

                                    {articles.map(article => {
                                        // Debug: log all article statuses
                                        console.log(`Article: "${article.title.substring(0, 30)}..." - Status: ${article.status || 'undefined'}`);

                                        const statusColors = {
                                            draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                                            published: 'bg-green-500/20 text-green-400 border-green-500/30',
                                            scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                        };
                                        const statusLabels = {
                                            draft: 'Draft',
                                            published: 'Published',
                                            scheduled: 'Scheduled'
                                        };
                                        const status = article.status || 'published';

                                        return (
                                            <div
                                                key={article.id}
                                                onClick={() => startEdit(article)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all group relative text-left
                                            ${editingId === article.id
                                                        ? 'bg-news-accent/10 border-news-accent/50 shadow-lg shadow-news-accent/5'
                                                        : 'bg-transparent border-transparent hover:bg-white/5 border-b-white/5'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase ${statusColors[status as keyof typeof statusColors]}`}>
                                                        {statusLabels[status as keyof typeof statusLabels]}
                                                    </span>
                                                    {article.status === 'scheduled' && article.scheduledPublishDate && (
                                                        <span className="text-[8px] text-zinc-500">
                                                            📅 {new Date(article.scheduledPublishDate).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className={`font-bold text-sm leading-tight mb-1.5 ${editingId === article.id ? 'text-news-accent' : 'text-zinc-300'}`}>
                                                    {article.title}
                                                </h4>
                                                <div className="flex justify-between items-end">
                                                    <div className="text-[10px] text-zinc-600 font-mono space-y-0.5">
                                                        <div>{article.date}</div>
                                                        <div className="flex items-center gap-1">
                                                            {formData.updatedAt === article.updatedAt && editingId === article.id ? <span className="w-1.5 h-1.5 rounded-full bg-news-accent animate-pulse"></span> : null}
                                                            {article.updatedAt ? new Date(article.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {(Array.isArray(article.category) ? article.category.slice(0, 2) : [article.category]).map(c => (
                                                            <span key={c} className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[c]?.replace('text-', 'bg-') || 'bg-gray-500'}`} title={c}></span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Hover Delete */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}
                                                    className="absolute top-2 right-2 p-1.5 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOOLS TAB */}
                {cmsTab === 'tools' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Tools Database</h2>
                                {editingToolId && (
                                    <button onClick={() => { setEditingToolId(null); setToolForm({ ...EMPTY_TOOL_FORM }); setToolErrors({}); }}
                                        className="flex items-center gap-1.5 text-xs font-bold text-news-accent border border-news-accent/30 bg-news-accent/10 hover:bg-news-accent/20 px-3 py-1.5 rounded-lg transition-colors">
                                        <Plus size={13} /> New Tool
                                    </button>
                                )}
                            </div>
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-news-accent">{editingToolId ? 'Editing Tool' : 'Add New Tool'}</h3>
                                    {parseSuccess && !showParser && (
                                        <span className="text-xs text-green-400 font-medium">✓ Fields loaded from parsed input</span>
                                    )}
                                </div>

                                {/* Raw Input Parser */}
                                <div className="rounded-lg border border-white/10 overflow-hidden">
                                    <button type="button" onClick={() => { setShowParser(p => !p); setParseErrors([]); }}
                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-black/20 hover:bg-black/30 transition-colors">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Code2 size={12} /> Paste Raw Tagged Input
                                        </span>
                                        <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${showParser ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showParser && (
                                        <div className="p-4 space-y-3 bg-black/10 border-t border-white/5">
                                            <p className="text-xs text-gray-500">Paste AI-generated tagged content. All fields will be parsed, validated, and loaded into the form below.</p>
                                            <textarea
                                                value={parseInput}
                                                onChange={e => { setParseInput(e.target.value); setParseErrors([]); }}
                                                rows={12}
                                                spellCheck={false}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-green-400 font-mono focus:outline-none focus:border-green-500/40 resize-y"
                                                placeholder={"<<<NAME>>>\nChatGPT\n<<<END_NAME>>>\n\n<<<SHORT_DESCRIPTION>>>\nThe industry-leading AI chatbot by OpenAI...\n<<<END_SHORT_DESCRIPTION>>>\n\n<<<KEY_FEATURES>>>\nGPT-4o Access\nDALL·E Image Generation\nCustom GPTs Marketplace\nData Analysis Mode\n<<<END_KEY_FEATURES>>>"}
                                            />
                                            {parseErrors.length > 0 && (
                                                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 space-y-1">
                                                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Parse failed — {parseErrors.length} error{parseErrors.length !== 1 ? 's' : ''}</p>
                                                    {parseErrors.map((e, i) => (
                                                        <p key={i} className="text-xs text-red-300">· {e}</p>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleParseInput}
                                                disabled={!parseInput.trim() || parseLoading}
                                                className="w-full py-2 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-40 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2">
                                                {parseLoading ? <><Loader2 size={12} className="animate-spin" /> Parsing…</> : 'Parse & Load Fields'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Identity */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[['name', 'Name *'], ['slug', 'Slug *']].map(([key, label]) => (
                                        <div key={key}>
                                            <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                            <input value={toolForm[key] || ''} onChange={e => setToolForm((p: any) => ({ ...p, [key]: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder={label} />
                                        </div>
                                    ))}
                                </div>

                                {/* Short Description */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Short Description <span className="text-gray-600">(15–25 words)</span></label>
                                    <input value={toolForm.short_description || ''} onChange={e => { setToolForm((p: any) => ({ ...p, short_description: e.target.value })); setToolErrors((e: any) => ({ ...e, short_description: undefined })); }}
                                        className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${toolErrors.short_description ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-news-accent'}`} placeholder="What it does and who it's for" />
                                    {toolErrors.short_description && <p className="text-red-400 text-xs mt-1">{toolErrors.short_description}</p>}
                                </div>

                                {/* Long Description */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Long Description <span className="text-gray-600">(80–120 words)</span></label>
                                    <textarea value={toolForm.full_description || ''} onChange={e => { setToolForm((p: any) => ({ ...p, full_description: e.target.value })); setToolErrors((e: any) => ({ ...e, full_description: undefined })); }}
                                        rows={4} className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none ${toolErrors.full_description ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-news-accent'}`} placeholder="Full overview of the tool…" />
                                    {toolErrors.full_description && <p className="text-red-400 text-xs mt-1">{toolErrors.full_description}</p>}
                                </div>

                                {/* Category Primary + Pricing Model + Data Confidence */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Category Primary *</label>
                                        <select value={toolForm.category_primary || ''} onChange={e => setToolForm((p: any) => ({ ...p, category_primary: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                            <option value="">— Select —</option>
                                            {['AI Writing','AI Chatbots','Productivity','Automation','Design','Development','Marketing','Data Analysis','Customer Support','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Pricing Model *</label>
                                        <select value={toolForm.pricing_model} onChange={e => setToolForm((p: any) => ({ ...p, pricing_model: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                            {['Free', 'Freemium', 'Paid', 'Trial', 'Enterprise'].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Data Confidence *</label>
                                        <select value={toolForm.data_confidence || 'ai_generated'} onChange={e => setToolForm((p: any) => ({ ...p, data_confidence: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                            <option value="ai_generated">AI Generated</option>
                                            <option value="inferred">Inferred</option>
                                            <option value="verified">Verified</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Starting Price */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Starting Price</label>
                                    <input value={toolForm.starting_price || ''} onChange={e => setToolForm((p: any) => ({ ...p, starting_price: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="e.g. $12/mo or Free" />
                                </div>

                                {/* Use Cases */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1 flex justify-between">
                                        <span>Use Cases * <span className="text-gray-600">(1–5 from list only)</span></span>
                                        <span className={`font-mono ${(toolForm.use_case_tags?.length || 0) > 5 ? 'text-red-400' : 'text-gray-500'}`}>{toolForm.use_case_tags?.length || 0}/5</span>
                                    </label>
                                    <div className={`flex flex-wrap gap-1.5 p-3 bg-black/40 border rounded-lg ${toolErrors.use_case_tags ? 'border-red-500/60' : 'border-white/10'}`}>
                                        {['Content Creation','Research','Coding','Automation','Lead Generation','Customer Support','Data Analysis','Design','Education','Personal Productivity'].map(uc => {
                                            const ucArr: string[] = Array.isArray(toolForm.use_case_tags) ? toolForm.use_case_tags : [];
                                            const selected = ucArr.includes(uc);
                                            const atMax = ucArr.length >= 5 && !selected;
                                            return (
                                                <button key={uc} type="button" disabled={atMax} onClick={() => { setToolForm((p: any) => {
                                                    const cur: string[] = Array.isArray(p.use_case_tags) ? p.use_case_tags : [];
                                                    return { ...p, use_case_tags: selected ? cur.filter((x: string) => x !== uc) : [...cur, uc] };
                                                }); setToolErrors((e: any) => ({ ...e, use_case_tags: undefined })); }}
                                                className={`text-xs px-2 py-1 rounded-full border transition-colors ${selected ? 'bg-news-accent/20 text-news-accent border-news-accent/40' : atMax ? 'opacity-30 cursor-not-allowed bg-surface-alt/50 text-gray-500 border-white/5' : 'bg-surface-alt/50 text-gray-400 border-white/10 hover:border-white/20'}`}>
                                                    {uc}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {toolErrors.use_case_tags && <p className="text-red-400 text-xs mt-1">{toolErrors.use_case_tags}</p>}
                                </div>

                                {/* Key Features */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Key Features <span className="text-gray-600">(4–6, one per line, 3–10 words each)</span></label>
                                    <textarea value={Array.isArray(toolForm.key_features) ? toolForm.key_features.join('\n') : toolForm.key_features || ''}
                                        onChange={e => { setToolForm((p: any) => ({ ...p, key_features: e.target.value })); setToolErrors((e: any) => ({ ...e, key_features: undefined })); }}
                                        rows={5} className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono ${toolErrors.key_features ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-news-accent'}`} placeholder={"Feature one\nFeature two\nFeature three"} />
                                    {toolErrors.key_features && <p className="text-red-400 text-xs mt-1">{toolErrors.key_features}</p>}
                                </div>

                                {/* Pros & Cons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Pros <span className="text-gray-600">(3–5, one per line)</span></label>
                                        <textarea value={Array.isArray(toolForm.pros) ? toolForm.pros.join('\n') : toolForm.pros || ''}
                                            onChange={e => { setToolForm((p: any) => ({ ...p, pros: e.target.value })); setToolErrors((e: any) => ({ ...e, pros: undefined })); }}
                                            rows={4} className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono ${toolErrors.pros ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`} placeholder={"Easy to use\nAffordable pricing"} />
                                        {toolErrors.pros && <p className="text-red-400 text-xs mt-1">{toolErrors.pros}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Cons <span className="text-gray-600">(2–4, one per line)</span></label>
                                        <textarea value={Array.isArray(toolForm.cons) ? toolForm.cons.join('\n') : toolForm.cons || ''}
                                            onChange={e => { setToolForm((p: any) => ({ ...p, cons: e.target.value })); setToolErrors((e: any) => ({ ...e, cons: undefined })); }}
                                            rows={4} className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none font-mono ${toolErrors.cons ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-red-500/50'}`} placeholder={"Limited exports\nNo offline mode"} />
                                        {toolErrors.cons && <p className="text-red-400 text-xs mt-1">{toolErrors.cons}</p>}
                                    </div>
                                </div>

                                {/* Integrations */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Integrations <span className="text-gray-600">(3–6, comma-separated — auto-normalized on save)</span></label>
                                    <input value={Array.isArray(toolForm.integrations) ? toolForm.integrations.join(', ') : toolForm.integrations || ''}
                                        onChange={e => { setToolForm((p: any) => ({ ...p, integrations: e.target.value })); setToolErrors((e: any) => ({ ...e, integrations: undefined })); }}
                                        className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none ${toolErrors.integrations ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-news-accent'}`} placeholder="microsoft 365, zapier, Slack" />
                                    {toolErrors.integrations && <p className="text-red-400 text-xs mt-1">{toolErrors.integrations}</p>}
                                </div>

                                {/* Platform */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Platforms</label>
                                    <div className="flex flex-wrap gap-1.5 p-3 bg-black/40 border border-white/10 rounded-lg">
                                        {['Web','iOS','Android','API','Desktop'].map(p => {
                                            const sel = Array.isArray(toolForm.supported_platforms) ? toolForm.supported_platforms.includes(p) : false;
                                            return (
                                                <button key={p} type="button" onClick={() => setToolForm((prev: any) => {
                                                    const cur: string[] = Array.isArray(prev.supported_platforms) ? prev.supported_platforms : [];
                                                    return { ...prev, supported_platforms: sel ? cur.filter((x: string) => x !== p) : [...cur, p] };
                                                })} className={`text-xs px-2 py-1 rounded-full border transition-colors ${sel ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-surface-alt/50 text-gray-400 border-white/10 hover:border-white/20'}`}>
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[['website_url', 'Website URL'], ['affiliate_url', 'Affiliate URL'], ['logo', 'Logo URL']].map(([key, label]) => (
                                        <div key={key}>
                                            <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                            <input value={toolForm[key] || ''} onChange={e => setToolForm((p: any) => ({ ...p, [key]: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder={label} />
                                        </div>
                                    ))}
                                </div>

                                {/* Secondary Tags (SEO only — replaces legacy Category Tags) */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Secondary Tags <span className="text-gray-600">(SEO only — comma-separated, optional)</span></label>
                                    <input value={Array.isArray(toolForm.secondary_tags) ? toolForm.secondary_tags.join(', ') : toolForm.secondary_tags || ''}
                                        onChange={e => setToolForm((p: any) => ({ ...p, secondary_tags: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="AI writing, long-form, blogging" />
                                </div>

                                {/* Internal Linking Hooks */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Related Tools</label>
                                        <div className="bg-black/40 border border-white/10 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                                            {tools.filter(t => (t.id || t._id) !== editingToolId).map((t: any) => {
                                                const tid = t.id || t._id;
                                                const sel = Array.isArray(toolForm.related_tools) && toolForm.related_tools.includes(tid);
                                                return (
                                                    <label key={tid} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-1 py-0.5 rounded">
                                                        <input type="checkbox" checked={sel} onChange={() => setToolForm((p: any) => {
                                                            const cur: string[] = Array.isArray(p.related_tools) ? p.related_tools : [];
                                                            return { ...p, related_tools: sel ? cur.filter((x: string) => x !== tid) : [...cur, tid] };
                                                        })} className="accent-news-accent" />
                                                        <span className="text-xs text-gray-300 truncate">{t.name}</span>
                                                    </label>
                                                );
                                            })}
                                            {tools.length <= 1 && <p className="text-xs text-gray-600 px-1">No other tools yet.</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Competitors</label>
                                        <div className="bg-black/40 border border-white/10 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                                            {tools.filter(t => (t.id || t._id) !== editingToolId).map((t: any) => {
                                                const tid = t.id || t._id;
                                                const sel = Array.isArray(toolForm.competitors) && toolForm.competitors.includes(tid);
                                                return (
                                                    <label key={tid} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-1 py-0.5 rounded">
                                                        <input type="checkbox" checked={sel} onChange={() => setToolForm((p: any) => {
                                                            const cur: string[] = Array.isArray(p.competitors) ? p.competitors : [];
                                                            return { ...p, competitors: sel ? cur.filter((x: string) => x !== tid) : [...cur, tid] };
                                                        })} className="accent-red-400" />
                                                        <span className="text-xs text-gray-300 truncate">{t.name}</span>
                                                    </label>
                                                );
                                            })}
                                            {tools.length <= 1 && <p className="text-xs text-gray-600 px-1">No other tools yet.</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* SEO */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Meta Title</label>
                                    <input value={toolForm.meta_title || ''} onChange={e => setToolForm((p: any) => ({ ...p, meta_title: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="Tool Name Review & Pricing (2025)" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                                    <textarea value={toolForm.meta_description || ''} onChange={e => setToolForm((p: any) => ({ ...p, meta_description: e.target.value }))}
                                        rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none" placeholder="140–160 char search-intent description" />
                                </div>

                                {Object.keys(toolErrors).length > 0 && (
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 space-y-1">
                                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Fix {Object.keys(toolErrors).length} validation error{Object.keys(toolErrors).length > 1 ? 's' : ''} before saving</p>
                                        {Object.values(toolErrors).map((msg, i) => <p key={i} className="text-xs text-red-300">· {msg as string}</p>)}
                                    </div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={handleSaveTool} disabled={!toolForm.name || !toolForm.category_primary || toolLoading} className="flex-1 bg-news-accent hover:bg-news-accentHover text-black font-bold py-2 rounded-lg text-sm disabled:opacity-40 transition-colors">
                                        {toolLoading ? 'Saving…' : editingToolId ? 'Update Tool' : 'Add Tool'}
                                    </button>
                                    {editingToolId && (
                                        <button onClick={() => { setEditingToolId(null); setToolForm({ ...EMPTY_TOOL_FORM }); setToolErrors({}); }} className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg text-sm hover:bg-zinc-700">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{tools.length} Tools</h3>
                            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                                {tools.map(t => (
                                    <div key={t.id || t._id} className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors">
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-white truncate">{t.name}</p>
                                            <p className="text-xs text-gray-500">{t.pricing_model} · {t.slug}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 ml-3">
                                            <button onClick={() => { setEditingToolId(t.id || t._id); setToolErrors({}); setToolForm({ ...EMPTY_TOOL_FORM, ...t, secondary_tags: Array.isArray(t.secondary_tags) ? t.secondary_tags.join(', ') : (t.secondary_tags || ''), integrations: Array.isArray(t.integrations) ? t.integrations.join(', ') : (t.integrations || ''), key_features: Array.isArray(t.key_features) ? t.key_features.join('\n') : (t.key_features || ''), pros: Array.isArray(t.pros) ? t.pros.join('\n') : (t.pros || ''), cons: Array.isArray(t.cons) ? t.cons.join('\n') : (t.cons || ''), supported_platforms: Array.isArray(t.supported_platforms) ? t.supported_platforms : [], use_case_tags: Array.isArray(t.use_case_tags) ? t.use_case_tags : [], related_tools: Array.isArray(t.related_tools) ? t.related_tools : [], competitors: Array.isArray(t.competitors) ? t.competitors : [], data_confidence: t.data_confidence || 'ai_generated' }); }} className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteTool(t.id || t._id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {tools.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No tools yet. Add your first one.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPARISONS TAB */}
                {cmsTab === 'comparisons' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Comparisons Database</h2>
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-news-accent mb-2">{editingCompId ? 'Editing Comparison' : 'New Comparison'}</h3>
                                {[['title', 'Title (e.g. ChatGPT vs Claude)'], ['slug', 'Slug (e.g. chatgpt-vs-claude)'], ['verdict', 'Verdict / Summary']].map(([key, label]) => (
                                    <div key={key}>
                                        <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                        <input
                                            value={compForm[key] || ''}
                                            onChange={e => setCompForm((p: any) => ({ ...p, [key]: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent"
                                            placeholder={label}
                                        />
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-3">
                                    {(['tool_a', 'tool_b', 'tool_c'] as const).map((key, i) => (
                                        <div key={key}>
                                            <label className="block text-xs text-gray-400 mb-1">Tool {String.fromCharCode(65 + i)} Slug {i < 2 ? '*' : '(optional)'}</label>
                                            <select value={compForm[key] || ''} onChange={e => setCompForm((p: any) => ({ ...p, [key]: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                                <option value="">— Select tool —</option>
                                                {tools.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={handleSaveComparison} disabled={!compForm.title || !compForm.tool_a || !compForm.tool_b || compLoading} className="flex-1 bg-news-accent hover:bg-news-accentHover text-black font-bold py-2 rounded-lg text-sm disabled:opacity-40 transition-colors">
                                        {compLoading ? 'Saving…' : editingCompId ? 'Update Comparison' : 'Add Comparison'}
                                    </button>
                                    {editingCompId && (
                                        <button onClick={() => { setEditingCompId(null); setCompForm({ title: '', slug: '', tool_a: '', tool_b: '', verdict: '' }); }} className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg text-sm hover:bg-zinc-700">Cancel</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{comparisons.length} Comparisons</h3>
                            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                                {comparisons.map(c => (
                                    <div key={c.id || c._id} className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors">
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-white truncate">{c.title}</p>
                                            <p className="text-xs text-gray-500">{c.slug}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 ml-3">
                                            <button onClick={() => { setEditingCompId(c.id || c._id); setCompForm({ title: c.title, slug: c.slug, tool_a: c.tool_a?.slug || c.tool_a, tool_b: c.tool_b?.slug || c.tool_b, tool_c: c.tool_c?.slug || c.tool_c || '', verdict: c.verdict || '' }); }} className="p-1.5 text-gray-500 hover:text-blue-400"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteComparison(c.id || c._id)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {comparisons.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No comparisons yet.</p>}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* CATEGORIES TAB */}
            {cmsTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Management */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                            <Layers size={14} className="text-blue-400" /> Categories
                        </h2>

                        {/* Category Form */}
                        <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                {editingCatSlug ? 'Edit Category' : 'New Category'}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                                    <input value={catForm.name} onChange={e => setCatForm((p: any) => ({ ...p, name: e.target.value, slug: p.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                                        placeholder="AI Writing" className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Slug *</label>
                                    <input value={catForm.slug} onChange={e => setCatForm((p: any) => ({ ...p, slug: e.target.value }))}
                                        placeholder="ai-writing" className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                                <textarea value={catForm.description} onChange={e => setCatForm((p: any) => ({ ...p, description: e.target.value }))}
                                    rows={2} placeholder="Short description of this category..." className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Icon (emoji/class)</label>
                                    <input value={catForm.icon} onChange={e => setCatForm((p: any) => ({ ...p, icon: e.target.value }))}
                                        placeholder="✍️" className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Parent Category</label>
                                    <input value={catForm.parent_category} onChange={e => setCatForm((p: any) => ({ ...p, parent_category: e.target.value }))}
                                        placeholder="ai-tools" className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Meta Title</label>
                                <input value={catForm.meta_title} onChange={e => setCatForm((p: any) => ({ ...p, meta_title: e.target.value }))}
                                    placeholder="Best AI Writing Tools 2025" className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Meta Description</label>
                                <textarea value={catForm.meta_description} onChange={e => setCatForm((p: any) => ({ ...p, meta_description: e.target.value }))}
                                    rows={2} placeholder="Discover the best AI writing tools..." className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-none" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSaveCategory} disabled={catLoading || !catForm.name || !catForm.slug}
                                    className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors">
                                    {catLoading ? 'Saving…' : editingCatSlug ? 'Update Category' : 'Create Category'}
                                </button>
                                {editingCatSlug && (
                                    <button onClick={() => { setEditingCatSlug(null); setCatForm({ name: '', slug: '', description: '', icon: '', parent_category: '', meta_title: '', meta_description: '' }); }}
                                        className="px-3 py-1.5 rounded border border-white/10 text-xs text-gray-400 hover:text-white transition-colors">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Categories List */}
                        <div className="rounded-xl border border-white/10 bg-black/30 divide-y divide-white/5 max-h-80 overflow-y-auto">
                            {categories.map(c => (
                                <div key={c.slug} className="flex items-center justify-between px-4 py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-white truncate">{c.icon && <span className="mr-1.5">{c.icon}</span>}{c.name}</p>
                                        <p className="text-xs text-gray-500">{c.slug}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 ml-3">
                                        <button onClick={() => { setEditingCatSlug(c.slug); setCatForm({ name: c.name, slug: c.slug, description: c.description || '', icon: c.icon || '', parent_category: c.parent_category || '', meta_title: c.meta_title || '', meta_description: c.meta_description || '' }); }}
                                            className="p-1.5 text-gray-500 hover:text-blue-400"><Edit size={14} /></button>
                                        <button onClick={() => handleDeleteCategory(c.slug)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No categories yet.</p>}
                        </div>
                    </div>

                    {/* Use Case Management */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                            <Tag size={14} className="text-purple-400" /> Use Cases
                        </h2>

                        {/* Use Case Form */}
                        <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                {editingUcSlug ? 'Edit Use Case' : 'New Use Case'}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                                    <input value={ucForm.name} onChange={e => setUcForm((p: any) => ({ ...p, name: e.target.value, slug: p.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                                        placeholder="Content Writing" className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Slug *</label>
                                    <input value={ucForm.slug} onChange={e => setUcForm((p: any) => ({ ...p, slug: e.target.value }))}
                                        placeholder="content-writing" className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                                <textarea value={ucForm.description} onChange={e => setUcForm((p: any) => ({ ...p, description: e.target.value }))}
                                    rows={2} placeholder="What this use case covers..." className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-none" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Primary Category</label>
                                <select value={ucForm.primary_category} onChange={e => setUcForm((p: any) => ({ ...p, primary_category: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50">
                                    <option value="">— None —</option>
                                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSaveUseCase} disabled={ucLoading || !ucForm.name || !ucForm.slug}
                                    className="flex-1 py-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors">
                                    {ucLoading ? 'Saving…' : editingUcSlug ? 'Update Use Case' : 'Create Use Case'}
                                </button>
                                {editingUcSlug && (
                                    <button onClick={() => { setEditingUcSlug(null); setUcForm({ name: '', slug: '', description: '', primary_category: '' }); }}
                                        className="px-3 py-1.5 rounded border border-white/10 text-xs text-gray-400 hover:text-white transition-colors">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Use Cases List */}
                        <div className="rounded-xl border border-white/10 bg-black/30 divide-y divide-white/5 max-h-80 overflow-y-auto">
                            {useCasesAdmin.map(u => (
                                <div key={u.slug} className="flex items-center justify-between px-4 py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-white truncate">{u.name}</p>
                                        <p className="text-xs text-gray-500">{u.slug}{u.primary_category && ` · ${u.primary_category}`}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 ml-3">
                                        <button onClick={() => { setEditingUcSlug(u.slug); setUcForm({ name: u.name, slug: u.slug, description: u.description || '', primary_category: u.primary_category || '' }); }}
                                            className="p-1.5 text-gray-500 hover:text-blue-400"><Edit size={14} /></button>
                                        <button onClick={() => handleDeleteUseCase(u.slug)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {useCasesAdmin.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No use cases yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* SOCIAL TAB */}
            {(cmsTab as string) === 'social' && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                <Sparkles size={14} className="text-blue-400" /> Social Transformer
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Select an article from the sidebar, then generate social posts.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select value={aiModel} onChange={e => setAiModel(e.target.value)} className="bg-black/40 border border-blue-500/20 rounded px-2 py-1 text-xs text-blue-400 focus:outline-none">
                                <optgroup label="Google Gemini" className="bg-zinc-900">
                                    <option value="gemini-1.5-flash-latest">1.5 Flash</option>
                                    <option value="gemini-1.5-pro-latest">1.5 Pro</option>
                                    <option value="gemini-2.0-flash-exp">2.0 Flash</option>
                                </optgroup>
                                <optgroup label="OpenAI" className="bg-zinc-900">
                                    <option value="gpt-4o">GPT-4o</option>
                                    <option value="gpt-4o-mini">GPT-4o-mini</option>
                                </optgroup>
                            </select>
                            <button onClick={handleSocialGenerate} disabled={socialLoading} className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30 flex items-center gap-2 transition-all">
                                {socialLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {socialLoading ? 'Generating...' : 'Generate Posts'}
                            </button>
                        </div>
                    </div>

                    {/* Image position sliders */}
                    <div className="bg-zinc-900 border border-blue-500/10 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400/60">Image Frame Position</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {(['imageOffsetX', 'imageOffsetY'] as const).map((key, i) => (
                                <div key={key}>
                                    <label className="text-[9px] font-bold text-blue-500/60 uppercase flex justify-between">
                                        <span>{i === 0 ? 'Horizontal' : 'Vertical'}</span>
                                        <span className="font-mono bg-blue-500/20 px-1 rounded text-blue-400">{formData[key] || 0}%</span>
                                    </label>
                                    <input type="range" min="-50" max="50" value={formData[key] || 0}
                                        onChange={e => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                                        className="w-full mt-1 accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Generated posts */}
                    {socialPosts ? (
                        <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                            <div className="flex border-b border-white/5">
                                {(['instagram', 'facebook', 'twitter', 'tiktok'] as const).map(platform => (
                                    <button key={platform} onClick={() => setActiveSocialTab(platform)}
                                        className={`flex-1 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${activeSocialTab === platform ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-600 hover:text-white'
                                            }`}>
                                        {platform}
                                    </button>
                                ))}
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{activeSocialTab} Copy</span>
                                    <div className="flex gap-2">
                                        {/* @ts-ignore */}
                                        <button onClick={() => copyToClipboard(socialPosts[activeSocialTab]?.text || '')} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors" title="Copy"><Copy size={14} /></button>
                                        {/* @ts-ignore */}
                                        <button onClick={() => handlePostIntent(activeSocialTab, socialPosts[activeSocialTab]?.text || '')} className="p-1.5 hover:bg-white/10 rounded text-blue-400 hover:text-blue-300 transition-colors" title="Post"><ExternalLink size={14} /></button>
                                    </div>
                                </div>
                                {/* @ts-ignore */}
                                <p className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-black/30 p-4 rounded-lg">{socialPosts[activeSocialTab]?.text || 'No content generated.'}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-400">Social Graphic</p>
                                        <p className="text-[10px] text-zinc-600">Downloads a {activeSocialTab}-sized image</p>
                                    </div>
                                    <button onClick={() => generateSocialImage(activeSocialTab)} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-lg flex items-center gap-2 border border-white/10">
                                        <Download size={12} /> Download Graphic
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                            <Sparkles size={24} className="text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-600">Draft an article in the Articles tab, then come here to generate social posts.</p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;

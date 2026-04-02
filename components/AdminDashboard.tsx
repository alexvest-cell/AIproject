// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Save, Plus, Download, Upload, Calendar, Eye, EyeOff, Sparkles, Image as ImageIcon, Clock, Copy, FileImage, Volume2, Loader2, ArrowLeft, LogOut, Search, Headphones, ExternalLink, ArrowRight, Layers, Tag, ChevronDown, Code2 } from 'lucide-react';
import { generateSlug } from '../utils/slugify';
import { generateComparison, GeneratedComparison, CompareTool } from '../utils/compareEngine';
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
    const [cmsTab, setCmsTab] = useState<'articles' | 'tools' | 'comparisons' | 'stacks' | 'categories' | 'social'>('articles');
    // Article sub-tab (type filter + per-type parser)
    const [articleSubTab, setArticleSubTab] = useState<'all' | 'review' | 'guide' | 'news' | 'use_case' | 'best-of'>('all');
    const [showArticleParser, setShowArticleParser] = useState(false);
    const [articleParseInput, setArticleParseInput] = useState('');
    const [articleParseErrors, setArticleParseErrors] = useState<string[]>([]);
    const [articleParseSuccess, setArticleParseSuccess] = useState(false);

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
    const EMPTY_TOOL_FORM = { name: '', slug: '', short_description: '', full_description: '', pricing_model: 'Freemium', starting_price: '', category_primary: '', secondary_tags: '', use_case_tags: [] as string[], key_features: '', pros: '', cons: '', integrations: '', supported_platforms: [] as string[], website_url: '', affiliate_url: '', logo: '', data_confidence: 'ai_generated', related_tools: [] as string[], competitors: [] as string[], rating_score: 0, screenshots: [] as { url: string; caption: string }[], review_slug: '', meta_title: '', meta_description: '', primary_keyword: '', alternative_keywords: '', model_version: '', free_tier: '', rate_limits: '', model_version_by_plan: '', price_by_plan: '', alternative_selection: '', best_for: '', not_ideal_for: '', limitations: '', context_window: '', max_integrations: '', api_pricing: '', image_generation: '', memory_persistence: '', computer_use: '', api_available: '', use_case_breakdown: '', use_case_scores: [] as any[], workflow_tags: [] as string[], workflow_scores: [] as any[], rating_breakdown: '', competitor_differentiator: '', related_tool_note: '', last_updated: '' };
    const [toolForm, setToolForm] = useState<any>({ ...EMPTY_TOOL_FORM });
    const [toolErrors, setToolErrors] = useState<Record<string, string>>({});
    const [editingToolId, setEditingToolId] = useState<string | null>(null);
    const [toolLoading, setToolLoading] = useState(false);
    // Parser panel state
    const [showParser, setShowParser] = useState(false);
    const [parseInput, setParseInput] = useState('');
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [parseSuccess, setParseSuccess] = useState(false);
    // Linking hooks search state
    const [relatedSearch, setRelatedSearch] = useState('');
    const [competitorSearch, setCompetitorSearch] = useState('');
    const [stubLoading, setStubLoading] = useState<'related_tools' | 'competitors' | null>(null);
    const [unresolvedRelated, setUnresolvedRelated] = useState<string[]>([]);
    const [unresolvedCompetitors, setUnresolvedCompetitors] = useState<string[]>([]);
    const [assetBrowserOpen, setAssetBrowserOpen] = useState(false);
    const [assetBrowserAssets, setAssetBrowserAssets] = useState<{ url: string; public_id: string }[]>([]);
    const [assetBrowserLoading, setAssetBrowserLoading] = useState(false);
    const logoFileInputRef = useRef<HTMLInputElement>(null);

    // Comparisons state
    const COMP_USE_CASES = ['Content Creation','Research','Coding','Automation','Lead Generation','Customer Support','Data Analysis','Design','Education','Personal Productivity','Marketing'];
    const EMPTY_COMP_FORM = { title: '', slug: '', tool_a: '', tool_b: '', tool_c: '', comparison_type: '1v1', use_case: '', generation_mode: 'dynamic', meta_title: '', meta_description: '', status: 'published', is_override: false, verdict_override: '', why_it_wins_override: '', strengths_override: '', weaknesses_override: '', recommendation_override: '', feature_comparison_override: '', use_case_breakdown_override: '' };
    const [comparisons, setComparisons] = useState<any[]>([]);
    const [compForm, setCompForm] = useState<any>({ ...EMPTY_COMP_FORM });
    const [editingCompId, setEditingCompId] = useState<string | null>(null);
    const [compLoading, setCompLoading] = useState(false);
    const [showCompParser, setShowCompParser] = useState(false);
    const [compParseInput, setCompParseInput] = useState('');
    const [compParseErrors, setCompParseErrors] = useState<string[]>([]);
    const [compParseSuccess, setCompParseSuccess] = useState(false);
    const [compPreview, setCompPreview] = useState<GeneratedComparison | null>(null);
    const [compPreviewLoading, setCompPreviewLoading] = useState(false);
    const [compPreviewError, setCompPreviewError] = useState<string>('');

    // Linked content state (shown in Tool CMS when editing)
    const [linkedContent, setLinkedContent] = useState<{ comparisons: any[]; reviews: any[]; guides: any[]; news: any[]; stacks: any[]; useCases: any[]; bestOf: any[] } | null>(null);
    const [linkedContentLoading, setLinkedContentLoading] = useState(false);

    // Stacks state
    const EMPTY_STACK_FORM = { name: '', slug: '', short_description: '', full_description: '', workflow_category: '', tools: '', workflow_steps: '', why_it_works: '', who_its_for: '', not_for: '', setup_time_hours: '', meta_title: '', meta_description: '', status: 'Published', featured: false };
    const [stacks, setStacks] = useState<any[]>([]);
    const [stackForm, setStackForm] = useState<any>({ ...EMPTY_STACK_FORM });
    const [editingStackId, setEditingStackId] = useState<string | null>(null);
    const [stackLoading, setStackLoading] = useState(false);
    const [showStackParser, setShowStackParser] = useState(false);
    const [stackParseInput, setStackParseInput] = useState('');
    const [stackParseErrors, setStackParseErrors] = useState<string[]>([]);
    const [stackParseSuccess, setStackParseSuccess] = useState(false);

    const loadTools = async () => {
        const res = await fetch('/api/tools', { headers: getAuthHeaders() });
        if (res.ok) setTools(await res.json());
    };

    const loadComparisons = async () => {
        const res = await fetch('/api/comparisons', { headers: getAuthHeaders() });
        if (res.ok) setComparisons(await res.json());
    };

    const loadStacks = async () => {
        const res = await fetch('/api/stacks', { headers: getAuthHeaders() });
        if (res.ok) setStacks(await res.json());
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
            if (cmsTab === 'comparisons') { loadComparisons(); loadTools(); }
            if (cmsTab === 'stacks') { loadStacks(); loadTools(); }
            if (cmsTab === 'categories') { loadCategories(); loadUseCases(); }
        }
    }, [cmsTab, isAuthenticated]);

    // Fetch linked content whenever a tool is opened for editing
    useEffect(() => {
        if (!editingToolId || !toolForm.slug) { setLinkedContent(null); return; }
        setLinkedContentLoading(true);
        fetch(`/api/tools/${toolForm.slug}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                setLinkedContent({
                    comparisons: data.comparisons  || [],
                    reviews:     data.reviews      || [],
                    guides:      data.guides       || [],
                    news:        data.news         || [],
                    bestOf:      data.bestOf       || [],
                    stacks:      data.stacks       || [],
                    useCases:    data.useCases     || [],
                });
            })
            .finally(() => setLinkedContentLoading(false));
    }, [editingToolId]);

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

        // Short description: 15–30 words
        const sdWords = countWords(form.short_description || '');
        if (sdWords < 15 || sdWords > 30) errors.short_description = `Must be 15–30 words (currently ${sdWords})`;

        // Long description: 80–150 words
        const ldWords = countWords(form.full_description || '');
        if (ldWords < 80 || ldWords > 150) errors.full_description = `Must be 80–150 words (currently ${ldWords})`;

        // Key features: 4–6 items, each 3–24 words
        const kf = splitLines(form.key_features);
        if (kf.length < 4 || kf.length > 6) errors.key_features = `Must have 4–6 items (currently ${kf.length})`;
        else {
            const badKf = kf.filter((f: string) => { const w = countWords(f); return w < 3 || w > 24; });
            if (badKf.length) errors.key_features = `Each feature must be 3–24 words. Check: "${badKf[0]}"`;
        }

        // Pros: 3–5
        const pros = splitLines(form.pros);
        if (pros.length < 3 || pros.length > 5) errors.pros = `Must have 3–5 items (currently ${pros.length})`;

        // Cons: 2–4
        const cons = splitLines(form.cons);
        if (cons.length < 2 || cons.length > 4) errors.cons = `Must have 2–4 items (currently ${cons.length})`;

        // Integrations: 3–6
        const ints = splitComma(form.integrations);
        if (ints.length < 1 || ints.length > 12) errors.integrations = `Must have 1–12 items (currently ${ints.length})`;

        // Use cases: 1–5, from enum only
        const ucs: string[] = Array.isArray(form.use_case_tags) ? form.use_case_tags : splitComma(form.use_case_tags);
        const VALID_USE_CASES = ['Content Creation','Research','Coding','Automation','Lead Generation','Customer Support','Data Analysis','Design','Education','Personal Productivity','Marketing'];
        if (ucs.length < 1 || ucs.length > 5) errors.use_case_tags = `Must select 1–5 use cases (currently ${ucs.length})`;
        else {
            const invalid = ucs.filter((u: string) => !VALID_USE_CASES.includes(u));
            if (invalid.length) errors.use_case_tags = `Invalid use case(s): ${invalid.join(', ')}`;
        }

        // Workflow tags: optional (nullable), max 4, cross-validate with workflow_scores
        const wt: string[] = Array.isArray(form.workflow_tags) ? form.workflow_tags : [];
        if (wt.length > 4) {
            errors.workflow_tags = `Maximum 4 workflow tags allowed (currently ${wt.length})`;
        } else if (wt.length > 0) {
            const ws: any[] = Array.isArray(form.workflow_scores) ? form.workflow_scores : [];
            const incomplete = wt.filter((tag: string) => {
                const entry = ws.find((s: any) => s.workflow_tag === tag);
                return !entry || !entry.score || !entry.sentence;
            });
            if (incomplete.length) errors.workflow_scores = `Missing score or sentence for: ${incomplete.join(', ')}`;
            // Score format: must be decimal
            const scoreFormatErrors: string[] = [];
            for (const entry of ws) {
                if (!entry.score) continue;
                const scoreStr = String(entry.score);
                const scoreNum = parseFloat(scoreStr);
                if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
                    scoreFormatErrors.push(`${entry.workflow_tag}: score must be 0.0–10.0`);
                } else if (!scoreStr.includes('.')) {
                    scoreFormatErrors.push(`${entry.workflow_tag}: add decimal (e.g. ${scoreStr}.0)`);
                }
            }
            if (scoreFormatErrors.length && !errors.workflow_scores) errors.workflow_scores = scoreFormatErrors.join('; ');
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

    const handleCreateStub = async (name: string, field: 'related_tools' | 'competitors', clearSearch: () => void) => {
        setStubLoading(field);
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        try {
            const res = await fetch('/api/tools', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ name, slug, id: slug, pricing_model: 'Freemium', data_confidence: 'ai_generated' }) });
            const newTool = await res.json();
            const newId = newTool.id || newTool._id;
            if (newId) {
                setToolForm((p: any) => ({ ...p, [field]: [...(Array.isArray(p[field]) ? p[field] : []), newId] }));
                await loadTools();
                clearSearch();
            }
        } finally {
            setStubLoading(null);
        }
    };

    const handleSaveTool = async () => {
        const errors = validateToolForm(toolForm);
        if (Object.keys(errors).length > 0) { setToolErrors(errors); return; }
        setToolErrors({});
        setToolLoading(true);
        try {
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
                _unresolved_related: unresolvedRelated,
                _unresolved_competitors: unresolvedCompetitors,
                rating_score: parseFloat(toolForm.rating_score) || 0,
                screenshots: Array.isArray(toolForm.screenshots) ? toolForm.screenshots.filter((s: any) => s.url?.trim()) : [],
                // Don't send empty strings for enum fields — Mongoose rejects them
                category_primary: toolForm.category_primary || undefined,
                // Capabilities — pass undefined for empty strings so Mongoose ignores them
                context_window: toolForm.context_window || undefined,
                max_integrations: toolForm.max_integrations || undefined,
                api_pricing: toolForm.api_pricing || undefined,
                image_generation: toolForm.image_generation || undefined,
                memory_persistence: toolForm.memory_persistence || undefined,
                computer_use: toolForm.computer_use || undefined,
                api_available: toolForm.api_available || undefined,
                // New fields — convert textarea strings back to arrays/objects
                best_for: splitLines(toolForm.best_for),
                not_ideal_for: splitLines(toolForm.not_ideal_for),
                limitations: splitComma(toolForm.limitations),
                alternative_keywords: splitComma(toolForm.alternative_keywords),
                use_case_scores: (Array.isArray(toolForm.use_case_scores) ? toolForm.use_case_scores : [])
                    .filter((s: any) => s.use_case)
                    .map((s: any) => ({ use_case: s.use_case, score: (s.score !== '' && s.score !== null && s.score !== undefined) ? parseFloat(String(s.score)) : null, description: s.description || '' })),
                use_case_breakdown: (() => {
                    const obj: Record<string, string> = {};
                    (Array.isArray(toolForm.use_case_scores) ? toolForm.use_case_scores : [])
                        .filter((s: any) => s.use_case)
                        .forEach((s: any) => { const sc = (s.score !== '' && s.score !== null && s.score !== undefined) ? `${s.score}/10 — ` : ''; obj[s.use_case] = `${sc}${s.description || ''}`.trim(); });
                    return obj;
                })(),
                rating_breakdown: (() => {
                    const obj: Record<string, number> = {};
                    (toolForm.rating_breakdown || '').split('\n').forEach((line: string) => { const idx = line.indexOf(':'); if (idx > 0) { const v = parseFloat(line.slice(idx + 1).trim()); if (!isNaN(v)) obj[line.slice(0, idx).trim()] = v; } });
                    return obj;
                })(),
                // Resolve tool-name-keyed differentiator/note strings into tool-ID-keyed objects
                competitor_differentiator: (() => {
                    const obj: Record<string, string> = {};
                    (toolForm.competitor_differentiator || '').split('\n').forEach((line: string) => {
                        const idx = line.indexOf(':');
                        if (idx <= 0) return;
                        const toolName = line.slice(0, idx).trim();
                        const text = line.slice(idx + 1).trim();
                        if (!text) return;
                        const found = tools.find((t: any) => t.name.toLowerCase() === toolName.toLowerCase());
                        const key = found ? (found.id || found._id) : toolName;
                        obj[key] = text;
                    });
                    return obj;
                })(),
                related_tool_note: (() => {
                    const obj: Record<string, string> = {};
                    (toolForm.related_tool_note || '').split('\n').forEach((line: string) => {
                        const idx = line.indexOf(':');
                        if (idx <= 0) return;
                        const toolName = line.slice(0, idx).trim();
                        const text = line.slice(idx + 1).trim();
                        if (!text) return;
                        const found = tools.find((t: any) => t.name.toLowerCase() === toolName.toLowerCase());
                        const key = found ? (found.id || found._id) : toolName;
                        obj[key] = text;
                    });
                    return obj;
                })(),
                workflow_tags: Array.isArray(toolForm.workflow_tags) ? toolForm.workflow_tags : [],
                workflow_breakdown: (() => {
                    const scores = Array.isArray(toolForm.workflow_scores) ? toolForm.workflow_scores : [];
                    const lines = scores
                        .filter((s: any) => s.workflow_tag)
                        .map((s: any) => {
                            const sc = (s.score !== '' && s.score !== null && s.score !== undefined) ? `${s.score}/10 — ` : '';
                            return `${s.workflow_tag}: ${sc}${s.sentence || ''}`.trim();
                        })
                        .filter(Boolean);
                    return lines.length ? lines.join('\n') : null;
                })(),
                last_updated: new Date().toISOString(),
            };
            const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Server error' }));
                setToolErrors({ _server: err.error || `Save failed (${res.status})` });
                return;
            }
            const savedTool = await res.json();
            if (editingToolId) {
                // Re-fetch by slug to confirm the write actually persisted to the DB
                // (the PUT response may reflect in-memory state, not the committed DB state)
                const slug = savedTool.slug || toolForm.slug;
                let verifiedTool = savedTool;
                if (slug) {
                    try {
                        const vRes = await fetch(`/api/tools/${slug}`);
                        if (vRes.ok) {
                            const data = await vRes.json();
                            verifiedTool = data.tool ?? verifiedTool;
                        }
                    } catch { /* fall back to savedTool */ }
                }
                setToolForm(buildToolFormValues(verifiedTool));
                setToolErrors({ _success: 'Tool updated.' });
                loadTools();
            } else {
                setToolForm({ ...EMPTY_TOOL_FORM });
                setEditingToolId(null);
                loadTools();
            }
        } catch (err: any) {
            setToolErrors({ _server: 'Save error: ' + (err?.message || String(err)) });
        } finally {
            setToolLoading(false);
        }
    };

    const handleDeleteTool = async (id: string) => {
        if (!confirm('Delete this tool?')) return;
        await fetch(`/api/tools/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadTools();
    };

    const buildToolFormValues = (t: any) => {
        const mapToStr = (v: any) => { if (!v) return ''; if (v instanceof Map) return [...v.entries()].map(([k,val]) => `${k}: ${val}`).join('\n'); if (typeof v === 'object' && !Array.isArray(v)) return Object.entries(v).map(([k,val]) => `${k}: ${val}`).join('\n'); return ''; };
        return { ...EMPTY_TOOL_FORM, ...t,
            secondary_tags: Array.isArray(t.secondary_tags) ? t.secondary_tags.join(', ') : (t.secondary_tags || ''),
            integrations: Array.isArray(t.integrations) ? t.integrations.join(', ') : (t.integrations || ''),
            key_features: Array.isArray(t.key_features) ? t.key_features.join('\n') : (t.key_features || ''),
            pros: Array.isArray(t.pros) ? t.pros.join('\n') : (t.pros || ''),
            cons: Array.isArray(t.cons) ? t.cons.join('\n') : (t.cons || ''),
            supported_platforms: Array.isArray(t.supported_platforms) ? t.supported_platforms : [],
            use_case_tags: Array.isArray(t.use_case_tags) ? t.use_case_tags : [],
            related_tools: Array.isArray(t.related_tools) ? t.related_tools : [],
            competitors: Array.isArray(t.competitors) ? t.competitors : [],
            data_confidence: t.data_confidence || 'ai_generated',
            rating_score: t.rating_score ?? 0,
            screenshots: Array.isArray(t.screenshots) ? t.screenshots : [],
            best_for: Array.isArray(t.best_for) ? t.best_for.join('\n') : (t.best_for || ''),
            not_ideal_for: Array.isArray(t.not_ideal_for) ? t.not_ideal_for.join('\n') : (t.not_ideal_for || ''),
            limitations: Array.isArray(t.limitations) ? t.limitations.join(', ') : (t.limitations || ''),
            alternative_keywords: Array.isArray(t.alternative_keywords) ? t.alternative_keywords.join(', ') : (t.alternative_keywords || ''),
            context_window: t.context_window || '',
            max_integrations: t.max_integrations || '',
            api_pricing: t.api_pricing || '',
            image_generation: t.image_generation || '',
            memory_persistence: t.memory_persistence || '',
            computer_use: t.computer_use || '',
            api_available: t.api_available || '',
            use_case_breakdown: mapToStr(t.use_case_breakdown),
            use_case_scores: (() => {
                let parsed: any[] = [];
                if (Array.isArray(t.use_case_scores) && t.use_case_scores.length > 0) {
                    parsed = t.use_case_scores.map((s: any) => ({ use_case: s.use_case || '', score: s.score != null ? String(s.score) : '', description: s.description || '' }));
                } else if (t.use_case_breakdown && typeof t.use_case_breakdown === 'object' && !Array.isArray(t.use_case_breakdown)) {
                    parsed = Object.entries(t.use_case_breakdown).map(([uc, text]: [string, any]) => {
                        const m = (text || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                        return { use_case: uc, score: m ? m[1] : '', description: (text || '').replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '').trim() };
                    });
                }
                const ucTags: string[] = Array.isArray(t.use_case_tags) ? t.use_case_tags : [];
                for (const uc of ucTags) {
                    if (!parsed.find((s: any) => s.use_case.toLowerCase() === uc.toLowerCase())) parsed.push({ use_case: uc, score: '', description: '' });
                }
                return parsed;
            })(),
            rating_breakdown: mapToStr(t.rating_breakdown),
            workflow_tags: Array.isArray(t.workflow_tags) ? t.workflow_tags : [],
            workflow_scores: (() => {
                let parsed: any[] = [];
                if (t.workflow_breakdown && typeof t.workflow_breakdown === 'string') {
                    parsed = t.workflow_breakdown.split('\n').filter(Boolean).map((line: string) => {
                        const colonIdx = line.indexOf(':');
                        if (colonIdx < 0) return null;
                        const tagName = line.slice(0, colonIdx).trim();
                        const rest = line.slice(colonIdx + 1).trim();
                        const m = rest.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                        return { workflow_tag: tagName, score: m ? m[1] : '', sentence: rest.replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '').trim() };
                    }).filter(Boolean);
                }
                const wTags: string[] = Array.isArray(t.workflow_tags) ? t.workflow_tags : [];
                for (const tag of wTags) {
                    if (!parsed.find((s: any) => s.workflow_tag === tag)) parsed.push({ workflow_tag: tag, score: '', sentence: '' });
                }
                return parsed;
            })(),
            alternative_selection: t.alternative_selection || '',
            model_version: t.model_version || '',
            free_tier: t.free_tier || '',
            rate_limits: t.rate_limits || '',
            model_version_by_plan: t.model_version_by_plan || '',
            price_by_plan: t.price_by_plan || '',
            primary_keyword: t.primary_keyword || '',
            review_slug: t.review_slug || '',
            last_updated: t.last_updated || '',
            competitor_differentiator: mapToStr(t.competitor_differentiator),
            related_tool_note: mapToStr(t.related_tool_note),
        };
    };

    // ── Client-side parser (no server call needed) ──────────────────────────
    const clientParseToolInput = (rawText: string) => {
        const CATEGORY_PRIMARY_OPTS = ['AI Writing','AI Chatbots','Productivity','Automation','Design','Development','Marketing','Data Analysis','Customer Support','Other'];
        const USE_CASE_OPTS = ['Content Creation','Research','Coding','Automation','Lead Generation','Customer Support','Data Analysis','Design','Education','Personal Productivity','Marketing'];
        const PLATFORM_OPTS = ['Web','iOS','Android','API','Desktop'];
        const PRICING_MAP: Record<string, string> = { free:'Free', freemium:'Freemium', paid:'Paid', trial:'Trial', enterprise:'Enterprise' };
        const DC_OPTS = ['verified','inferred','ai_generated'];

        // Extract <<<FIELD>>>...<<<END_FIELD>>> blocks
        const extracted: Record<string, string> = {};
        const rx = /<<<([A-Z0-9_]+)>>>([\s\S]*?)<<<END_\1>>>/g;
        let m: RegExpExecArray | null;
        while ((m = rx.exec(rawText)) !== null) {
            if (!(m[1] in extracted)) extracted[m[1]] = m[2].trim();
        }
        if (Object.keys(extracted).length === 0) return { status: 'error' as const, errors: ['No valid <<<FIELD>>>…<<<END_FIELD>>> blocks found'] };

        // Helpers
        const parseArr = (v?: string): string[] => {
            if (!v) return [];
            const items = v.includes('\n') ? v.split('\n') : v.split(',');
            const seen = new Set<string>();
            return items.map(s => s.trim()).filter(s => { if (!s || seen.has(s.toLowerCase())) return false; seen.add(s.toLowerCase()); return true; });
        };
        const toTitle = (s: string) => s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
        const wordCount = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length;

        // Map fields
        const name = extracted['NAME'] || null;
        const slugRaw = extracted['SLUG'] || (name || '');
        const slug = slugRaw.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
        const short_description = extracted['SHORT_DESCRIPTION'] || null;
        const full_description = extracted['LONG_DESCRIPTION'] || null;
        const starting_price = extracted['STARTING_PRICE'] || null;
        const website_url = extracted['WEBSITE_URL'] || null;
        const affiliate_url = extracted['AFFILIATE_URL'] || null;
        const logo = extracted['LOGO_URL'] || null;
        const meta_title = extracted['META_TITLE'] || null;
        const meta_description = extracted['META_DESCRIPTION'] || null;

        const catRaw = (extracted['CATEGORY_PRIMARY'] || '').trim();
        const category_primary = CATEGORY_PRIMARY_OPTS.find(c => c.toLowerCase() === catRaw.toLowerCase()) || null;

        const pricingRaw = (extracted['PRICING_MODEL'] || '').trim().toLowerCase();
        const pricing_model = PRICING_MAP[pricingRaw] || 'Freemium';

        const dcRaw = (extracted['DATA_CONFIDENCE'] || '').trim().toLowerCase();
        const data_confidence = DC_OPTS.includes(dcRaw) ? dcRaw : 'ai_generated';

        const key_features = parseArr(extracted['KEY_FEATURES']);
        const pros = parseArr(extracted['PROS']);
        const cons = parseArr(extracted['CONS']);

        const rawInts = parseArr(extracted['INTEGRATIONS']);
        const seen2 = new Set<string>();
        const integrations = rawInts.map(toTitle).filter(s => { if (seen2.has(s.toLowerCase())) return false; seen2.add(s.toLowerCase()); return true; });

        const rawUC = parseArr(extracted['USE_CASES']);
        const use_case_tags = rawUC.map(u => USE_CASE_OPTS.find(v => v.toLowerCase() === u.toLowerCase())).filter(Boolean).slice(0,5) as string[];
        const invalidUC = rawUC.filter(u => !USE_CASE_OPTS.some(v => v.toLowerCase() === u.toLowerCase()));

        const rawPlat = parseArr(extracted['PLATFORMS']);
        const supported_platforms = rawPlat.map(p => PLATFORM_OPTS.find(v => v.toLowerCase() === p.toLowerCase())).filter(Boolean) as string[];

        const secondary_tags = parseArr(extracted['SECONDARY_TAGS']);

        const related_tool_names = parseArr(extracted['RELATED_TOOLS']);
        const competitor_names = parseArr(extracted['COMPETITORS']);
        const rating_score = extracted['RATING_SCORE'] ? parseFloat(extracted['RATING_SCORE']) : 0;

        // Parse key:value blocks into objects
        const parseKeyValueStr = (v?: string): string => {
            if (!v) return '';
            return v.split('\n').map(s => s.trim()).filter(Boolean).join('\n');
        };
        const parseRatingBreakdown = (v?: string): Record<string, number> => {
            if (!v) return {};
            const result: Record<string, number> = {};
            v.split('\n').forEach(line => {
                const idx = line.indexOf(':');
                if (idx > 0) { const k = line.slice(0, idx).trim(); const val = parseFloat(line.slice(idx + 1).trim()); if (k && !isNaN(val)) result[k] = val; }
            });
            return result;
        };

        const best_for = parseArr(extracted['BEST_FOR']);
        const not_ideal_for = parseArr(extracted['NOT_IDEAL_FOR']);
        const use_case_breakdown_raw = parseKeyValueStr(extracted['USE_CASE_BREAKDOWN']);
        const alternative_selection = extracted['ALTERNATIVE_SELECTION'] || null;
        const limitations = parseArr(extracted['LIMITATIONS']);
        const rating_breakdown = parseRatingBreakdown(extracted['RATING_BREAKDOWN']);
        const model_version = extracted['MODEL_VERSION'] || null;
        const free_tier = extracted['FREE_TIER'] || null;
        const rate_limits = extracted['RATE_LIMITS'] || null;
        const model_version_by_plan = extracted['MODEL_VERSION_BY_PLAN'] || null;
        const price_by_plan = extracted['PRICE_BY_PLAN'] || null;
        const primary_keyword = extracted['PRIMARY_KEYWORD'] || null;
        const alternative_keywords = parseArr(extracted['ALTERNATIVE_KEYWORDS']);
        const review_slug = extracted['REVIEW_SLUG'] || null;
        const competitor_differentiator_raw = parseKeyValueStr(extracted['COMPETITOR_DIFFERENTIATORS']);
        const related_tool_note_raw = parseKeyValueStr(extracted['RELATED_TOOL_NOTES']);

        const WORKFLOW_TAG_OPTS = ['Students', 'Developers', 'Marketers', 'Content Creators', 'Startups',
            'Small Business', 'Enterprise', 'Researchers', 'Designers', 'Sales Teams'];
        const rawWT = parseArr(extracted['WORKFLOW_TAGS']);
        const workflow_tags = rawWT
            .map(w => WORKFLOW_TAG_OPTS.find(v => v.toLowerCase() === w.toLowerCase()))
            .filter(Boolean) as string[];
        const invalidWTs = rawWT.filter(w => !WORKFLOW_TAG_OPTS.some(v => v.toLowerCase() === w.toLowerCase()));
        const workflow_breakdown_raw = extracted['WORKFLOW_BREAKDOWN'] || null;

        // Capability fields
        const context_window = extracted['CONTEXT_WINDOW'] || null;
        const max_integrations = extracted['MAX_INTEGRATIONS'] || null;
        const api_pricing = extracted['API_PRICING'] || null;
        const ENUM_YNP = ['yes', 'no', 'partial'];
        const ENUM_YN  = ['yes', 'no'];
        const imgGenRaw = (extracted['IMAGE_GENERATION'] || '').toLowerCase().trim();
        const memPersRaw = (extracted['MEMORY_PERSISTENCE'] || '').toLowerCase().trim();
        const compUseRaw = (extracted['COMPUTER_USE'] || '').toLowerCase().trim();
        const apiAvailRaw = (extracted['API_AVAILABLE'] || '').toLowerCase().trim();
        const image_generation = ENUM_YNP.includes(imgGenRaw) ? imgGenRaw : null;
        const memory_persistence = ENUM_YNP.includes(memPersRaw) ? memPersRaw : null;
        const computer_use = ENUM_YNP.includes(compUseRaw) ? compUseRaw : null;
        const api_available = ENUM_YN.includes(apiAvailRaw) ? apiAvailRaw : null;

        // Parse "Month Year" (e.g. "March 2026") into ISO date string; fall back to now
        const last_updated_raw = extracted['LAST_UPDATED'] || null;
        const last_updated = (() => {
            if (!last_updated_raw) return null;
            const d = new Date(last_updated_raw);
            if (!isNaN(d.getTime())) return d.toISOString();
            const d2 = new Date('1 ' + last_updated_raw);
            return !isNaN(d2.getTime()) ? d2.toISOString() : null;
        })();

        // Validate
        const errors: string[] = [];
        if (short_description) { const w = wordCount(short_description); if (w < 15 || w > 30) errors.push(`SHORT_DESCRIPTION must be 15–30 words (got ${w})`); }
        if (full_description) { const w = wordCount(full_description); if (w < 80 || w > 150) errors.push(`LONG_DESCRIPTION must be 80–150 words (got ${w})`); }
        if (key_features.length < 4 || key_features.length > 6) errors.push(`KEY_FEATURES must have 4–6 items (got ${key_features.length})`);
        if (pros.length < 3 || pros.length > 5) errors.push(`PROS must have 3–5 items (got ${pros.length})`);
        if (cons.length < 2 || cons.length > 4) errors.push(`CONS must have 2–4 items (got ${cons.length})`);
        if (integrations.length < 1 || integrations.length > 12) errors.push(`INTEGRATIONS must have 1–12 items (got ${integrations.length})`);
        if (use_case_tags.length < 1 || use_case_tags.length > 5) errors.push(`USE_CASES must have 1–5 valid items (got ${use_case_tags.length})`);
        if (catRaw && !category_primary) errors.push(`CATEGORY_PRIMARY "${catRaw}" is not valid. Options: ${CATEGORY_PRIMARY_OPTS.join(', ')}`);
        if (invalidUC.length) errors.push(`USE_CASES has unrecognised values: ${invalidUC.join(', ')}`);
        if (imgGenRaw && !image_generation) errors.push(`IMAGE_GENERATION must be yes, no, or partial (got "${imgGenRaw}")`);
        if (memPersRaw && !memory_persistence) errors.push(`MEMORY_PERSISTENCE must be yes, no, or partial (got "${memPersRaw}")`);
        if (compUseRaw && !computer_use) errors.push(`COMPUTER_USE must be yes, no, or partial (got "${compUseRaw}")`);
        if (apiAvailRaw && !api_available) errors.push(`API_AVAILABLE must be yes or no (got "${apiAvailRaw}")`);

        // WORKFLOW_TAGS / WORKFLOW_BREAKDOWN cross-validation
        if (invalidWTs.length) errors.push(`WORKFLOW_TAGS has unrecognised values: ${invalidWTs.join(', ')}. Allowed: ${WORKFLOW_TAG_OPTS.join(', ')}`);
        if (workflow_tags.length > 4) errors.push(`WORKFLOW_TAGS must have 1–4 items (got ${workflow_tags.length})`);
        if (workflow_tags.length > 0 && workflow_breakdown_raw) {
            const wbLines = workflow_breakdown_raw.split('\n').map((l: string) => l.trim()).filter(Boolean);
            if (wbLines.length !== workflow_tags.length) {
                errors.push(`WORKFLOW_BREAKDOWN has ${wbLines.length} entries but WORKFLOW_TAGS has ${workflow_tags.length} — counts must match`);
            } else {
                const wbNames = wbLines.map((l: string) => { const idx = l.indexOf(':'); return idx > 0 ? l.slice(0, idx).trim() : ''; });
                for (const tag of workflow_tags) {
                    if (!wbNames.some((n: string) => n.toLowerCase() === tag.toLowerCase()))
                        errors.push(`WORKFLOW_BREAKDOWN is missing an entry for tag "${tag}"`);
                }
                for (const name of wbNames) {
                    if (!workflow_tags.some((t: string) => t.toLowerCase() === name.toLowerCase()))
                        errors.push(`WORKFLOW_BREAKDOWN entry "${name}" does not match any tag in WORKFLOW_TAGS`);
                }
                for (const line of wbLines) {
                    const sm = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                    if (!sm) {
                        errors.push(`WORKFLOW_BREAKDOWN line "${line.slice(0, 50)}" is missing a score in X.X/10 format`);
                    } else {
                        const sc = parseFloat(sm[1]);
                        if (sc < 0 || sc > 10) errors.push(`WORKFLOW_BREAKDOWN score ${sm[1]}/10 is out of range (0.0–10.0)`);
                    }
                }
            }
        }

        if (errors.length) return { status: 'error' as const, errors };

        return { status: 'success' as const, data: { name, slug, short_description, full_description, category_primary, pricing_model, starting_price, use_case_tags, key_features, pros, cons, integrations, supported_platforms, website_url, affiliate_url, logo, secondary_tags, data_confidence, meta_title, meta_description, related_tool_names, competitor_names, rating_score, best_for, not_ideal_for, use_case_breakdown_raw, alternative_selection, limitations, rating_breakdown, model_version, free_tier, rate_limits, model_version_by_plan, price_by_plan, primary_keyword, alternative_keywords, review_slug, competitor_differentiator_raw, related_tool_note_raw, last_updated, context_window, max_integrations, api_pricing, image_generation, memory_persistence, computer_use, api_available, workflow_tags, workflow_breakdown_raw } };
    };

    const handleParseInput = () => {
        setParseErrors([]);
        setParseSuccess(false);
        const result = clientParseToolInput(parseInput);
        if (result.status === 'error') {
            setParseErrors(result.errors);
        } else {
            const d = result.data;
            // If we're editing a tool but parsing data for a different slug → auto-switch to new tool mode
            // so the parser output doesn't silently overwrite the wrong tool on Save
            let isEditing = !!editingToolId;
            if (isEditing && d.slug && toolForm.slug && d.slug !== toolForm.slug) {
                setEditingToolId(null);
                setUnresolvedRelated([]);
                setUnresolvedCompetitors([]);
                isEditing = false;
            }
            setToolForm((prev: any) => ({
                ...(isEditing ? prev : EMPTY_TOOL_FORM),
                ...(isEditing ? {} : { name: d.name || '', slug: d.slug || '' }),
                short_description: d.short_description || (isEditing ? prev.short_description : ''),
                full_description: d.full_description || (isEditing ? prev.full_description : ''),
                category_primary: d.category_primary || (isEditing ? prev.category_primary : ''),
                pricing_model: d.pricing_model || (isEditing ? prev.pricing_model : 'Freemium'),
                starting_price: d.starting_price || (isEditing ? prev.starting_price : ''),
                use_case_tags: d.use_case_tags?.length ? d.use_case_tags : (isEditing ? prev.use_case_tags : []),
                key_features: Array.isArray(d.key_features) && d.key_features.length ? d.key_features.join('\n') : (isEditing ? prev.key_features : ''),
                pros: Array.isArray(d.pros) && d.pros.length ? d.pros.join('\n') : (isEditing ? prev.pros : ''),
                cons: Array.isArray(d.cons) && d.cons.length ? d.cons.join('\n') : (isEditing ? prev.cons : ''),
                integrations: Array.isArray(d.integrations) && d.integrations.length ? d.integrations.join(', ') : (isEditing ? prev.integrations : ''),
                supported_platforms: d.supported_platforms?.length ? d.supported_platforms : (isEditing ? prev.supported_platforms : []),
                website_url: d.website_url || (isEditing ? prev.website_url : ''),
                affiliate_url: d.affiliate_url || (isEditing ? prev.affiliate_url : ''),
                logo: d.logo || (isEditing ? prev.logo : ''),
                secondary_tags: Array.isArray(d.secondary_tags) && d.secondary_tags.length ? d.secondary_tags.join(', ') : (isEditing ? prev.secondary_tags : ''),
                data_confidence: d.data_confidence || (isEditing ? prev.data_confidence : 'ai_generated'),
                meta_title: d.meta_title || (isEditing ? prev.meta_title : ''),
                meta_description: d.meta_description || (isEditing ? prev.meta_description : ''),
                rating_score: d.rating_score ?? (isEditing ? prev.rating_score : 0),
                related_tools: (d.related_tool_names || []).map((n: string) => { const t = tools.find((t: any) => t.name.toLowerCase() === n.toLowerCase()); return t ? (t.id || t._id) : null; }).filter(Boolean),
                competitors: (d.competitor_names || []).map((n: string) => { const t = tools.find((t: any) => t.name.toLowerCase() === n.toLowerCase()); return t ? (t.id || t._id) : null; }).filter(Boolean),
                // New fields
                best_for: d.best_for?.length ? d.best_for.join('\n') : (isEditing ? prev.best_for : ''),
                not_ideal_for: d.not_ideal_for?.length ? d.not_ideal_for.join('\n') : (isEditing ? prev.not_ideal_for : ''),
                use_case_breakdown: d.use_case_breakdown_raw || (isEditing ? prev.use_case_breakdown : ''),
                use_case_scores: (() => {
                    const raw: string = d.use_case_breakdown_raw || '';
                    if (!raw) return isEditing ? prev.use_case_scores : [];
                    const parsed = raw.split('\n').filter(Boolean).map((line: string) => {
                        const colonIdx = line.indexOf(':'); if (colonIdx < 0) return null;
                        const ucName = line.slice(0, colonIdx).trim();
                        const rest = line.slice(colonIdx + 1).trim();
                        const m = rest.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                        return { use_case: ucName, score: m ? m[1] : '', description: rest.replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '').trim() };
                    }).filter(Boolean);
                    return parsed.length ? parsed : (isEditing ? prev.use_case_scores : []);
                })(),
                alternative_selection: d.alternative_selection || (isEditing ? prev.alternative_selection : ''),
                limitations: d.limitations?.length ? d.limitations.join(', ') : (isEditing ? prev.limitations : ''),
                rating_breakdown: Object.keys(d.rating_breakdown || {}).length ? Object.entries(d.rating_breakdown).map(([k, v]) => `${k}: ${v}`).join('\n') : (isEditing ? prev.rating_breakdown : ''),
                model_version: d.model_version || (isEditing ? prev.model_version : ''),
                free_tier: d.free_tier || (isEditing ? prev.free_tier : ''),
                rate_limits: d.rate_limits || (isEditing ? prev.rate_limits : ''),
                model_version_by_plan: d.model_version_by_plan || (isEditing ? prev.model_version_by_plan : ''),
                price_by_plan: d.price_by_plan || (isEditing ? prev.price_by_plan : ''),
                primary_keyword: d.primary_keyword || (isEditing ? prev.primary_keyword : ''),
                alternative_keywords: d.alternative_keywords?.length ? d.alternative_keywords.join(', ') : (isEditing ? prev.alternative_keywords : ''),
                review_slug: d.review_slug || (isEditing ? prev.review_slug : ''),
                last_updated: d.last_updated || (isEditing ? prev.last_updated : ''),
                competitor_differentiator: d.competitor_differentiator_raw || (isEditing ? prev.competitor_differentiator : ''),
                related_tool_note: d.related_tool_note_raw || (isEditing ? prev.related_tool_note : ''),
                context_window: d.context_window || (isEditing ? prev.context_window : ''),
                max_integrations: d.max_integrations || (isEditing ? prev.max_integrations : ''),
                api_pricing: d.api_pricing || (isEditing ? prev.api_pricing : ''),
                image_generation: d.image_generation || (isEditing ? prev.image_generation : ''),
                memory_persistence: d.memory_persistence || (isEditing ? prev.memory_persistence : ''),
                computer_use: d.computer_use || (isEditing ? prev.computer_use : ''),
                api_available: d.api_available || (isEditing ? prev.api_available : ''),
                workflow_tags: d.workflow_tags?.length ? d.workflow_tags : (isEditing ? prev.workflow_tags : []),
                workflow_scores: (() => {
                    const raw: string = d.workflow_breakdown_raw || '';
                    if (!raw) return isEditing ? prev.workflow_scores : [];
                    const parsed = raw.split('\n').filter(Boolean).map((line: string) => {
                        const colonIdx = line.indexOf(':'); if (colonIdx < 0) return null;
                        const tagName = line.slice(0, colonIdx).trim();
                        const rest = line.slice(colonIdx + 1).trim();
                        const m = rest.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
                        return { workflow_tag: tagName, score: m ? m[1] : '', sentence: rest.replace(/^\d+(?:\.\d+)?\/10\s*[—–-]\s*/, '').trim() };
                    }).filter(Boolean);
                    return parsed.length ? parsed : (isEditing ? prev.workflow_scores : []);
                })(),
            }));
            setUnresolvedRelated((d.related_tool_names || []).filter((n: string) => !tools.some((t: any) => t.name.toLowerCase() === n.toLowerCase())));
            setUnresolvedCompetitors((d.competitor_names || []).filter((n: string) => !tools.some((t: any) => t.name.toLowerCase() === n.toLowerCase())));
            setToolErrors({});
            // Don't reset editingToolId — if editing, stay in edit mode
            setParseSuccess(true);
            setShowParser(false);
            setParseInput('');
        }
    };

    // ── Comparison parser (inline — config fields only) ─────────────────────
    const clientParseComparisonInput = (rawText: string) => {
        const extracted: Record<string, string> = {};
        const rx = /<<<([A-Z0-9_]+)>>>([\s\S]*?)<<<END_\1>>>/g;
        let m: RegExpExecArray | null;
        while ((m = rx.exec(rawText)) !== null) {
            if (!(m[1] in extracted)) extracted[m[1]] = m[2].trim();
        }
        if (Object.keys(extracted).length === 0) return { status: 'error' as const, errors: ['No valid <<<FIELD>>>…<<<END_FIELD>>> blocks found'] };

        const toSlug = (s: string) => (s || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const title  = extracted['TITLE']  || null;
        const tool_a = toSlug(extracted['TOOL_A'] || '');
        const tool_b = toSlug(extracted['TOOL_B'] || '');
        const tool_c = extracted['TOOL_C'] ? toSlug(extracted['TOOL_C']) : '';
        const slugRaw = extracted['SLUG'] ? extracted['SLUG'].trim() : [tool_a, tool_b].filter(Boolean).join('-vs-');
        const slug = slugRaw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const primary_use_case = extracted['PRIMARY_USE_CASE'] || '';
        const meta_title       = extracted['META_TITLE']       || null;
        const meta_description = extracted['META_DESCRIPTION'] || null;

        const errors: string[] = [];
        if (!title)  errors.push('TITLE is required');
        if (!tool_a) errors.push('TOOL_A is required');
        if (!tool_b) errors.push('TOOL_B is required');
        if (errors.length > 0) return { status: 'error' as const, errors };

        return { status: 'success' as const, data: { title, slug, tool_a, tool_b, tool_c, primary_use_case, meta_title, meta_description } };
    };

    const handleParseComparisonInput = () => {
        setCompParseErrors([]);
        setCompParseSuccess(false);
        const result = clientParseComparisonInput(compParseInput);
        if (result.status === 'error') {
            setCompParseErrors(result.errors);
        } else {
            const d = result.data;
            const isEditing = !!editingCompId;
            setCompForm((prev: any) => ({
                ...(isEditing ? prev : EMPTY_COMP_FORM),
                title:             d.title             || (isEditing ? prev.title             : ''),
                slug:              d.slug              || (isEditing ? prev.slug              : ''),
                tool_a:            d.tool_a            || (isEditing ? prev.tool_a            : ''),
                tool_b:            d.tool_b            || (isEditing ? prev.tool_b            : ''),
                tool_c:            d.tool_c            || (isEditing ? prev.tool_c            : ''),
                use_case: (d as any).use_case || d.primary_use_case || (isEditing ? prev.use_case : ''),
                meta_title:        d.meta_title        || (isEditing ? prev.meta_title        : ''),
                meta_description:  d.meta_description  || (isEditing ? prev.meta_description  : ''),
            }));
            setCompParseSuccess(true);
            setShowCompParser(false);
            setCompParseInput('');
        }
    };

    // ── Generate comparison preview from tool data ────────────────────────────
    const handleGenerateComparisonPreview = async () => {
        setCompPreviewError('');
        const slugs = [compForm.tool_a, compForm.tool_b, compForm.tool_c].filter(Boolean);
        if (slugs.length < 2) { setCompPreviewError('Select at least Tool A and Tool B first.'); return; }
        setCompPreviewLoading(true);
        try {
            const toolObjs: CompareTool[] = slugs.map(slug => {
                const t = tools.find((x: any) => x.slug === slug);
                if (!t) throw new Error(`Tool "${slug}" not found in loaded tools`);
                return t as CompareTool;
            });
        const result = generateComparison(toolObjs, { primary_use_case: compForm.use_case || undefined, comparison_type: compForm.comparison_type || '1v1' });
            setCompPreview(result);
            // Auto-fill title/slug if blank
            setCompForm((prev: any) => ({
                ...prev,
                title: prev.title || result.header.title,
                slug:  prev.slug  || slugs.join('-vs-'),
            }));
        } catch (err: any) {
            setCompPreviewError(err.message || 'Generation failed');
        } finally {
            setCompPreviewLoading(false);
        }
    };

    const handleSaveComparison = async () => {
        setCompLoading(true);
        try {
            const payload = {
                title:            compForm.title,
                slug:             compForm.slug,
                tool_a_slug:      compForm.tool_a,
                tool_b_slug:      compForm.tool_b,
                tool_c_slug:      compForm.tool_c || undefined,
                comparison_type:  compForm.comparison_type || '1v1',
                use_case:         compForm.use_case || undefined,
                primary_use_cases: compForm.use_case ? [compForm.use_case] : [],
                generation_mode:  compForm.generation_mode || 'dynamic',
                meta_title:       compForm.meta_title       || undefined,
                meta_description: compForm.meta_description || undefined,
                status:           compForm.status || 'published',
                needs_update:     false,
                last_generated:   compPreview ? new Date().toISOString() : undefined,
                generated_output: compPreview ?? undefined,
                id: compForm.slug || editingCompId,
                is_override:      compForm.is_override || false,
                verdict_override: compForm.verdict_override || null,
                why_it_wins_override: compForm.why_it_wins_override || null,
                strengths_override: compForm.strengths_override ? (() => { try { return JSON.parse(compForm.strengths_override); } catch { return null; } })() : null,
                weaknesses_override: compForm.weaknesses_override ? (() => { try { return JSON.parse(compForm.weaknesses_override); } catch { return null; } })() : null,
                recommendation_override: compForm.recommendation_override ? (() => { try { return JSON.parse(compForm.recommendation_override); } catch { return null; } })() : null,
                feature_comparison_override: compForm.feature_comparison_override ? (() => { try { return JSON.parse(compForm.feature_comparison_override); } catch { return null; } })() : null,
                use_case_breakdown_override: compForm.use_case_breakdown_override ? (() => { try { return JSON.parse(compForm.use_case_breakdown_override); } catch { return null; } })() : null,
            };

            const method = editingCompId ? 'PUT' : 'POST';
            const url = editingCompId ? `/api/comparisons/${editingCompId}` : '/api/comparisons';
            await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
            if (!editingCompId) setCompForm({ ...EMPTY_COMP_FORM });
            setEditingCompId(null);
            setCompPreview(null);
            loadComparisons();
        } finally {
            setCompLoading(false);
        }
    };

    const handleDeleteComparison = async (id: string) => {
        if (!confirm('Delete this comparison?')) return;
        await fetch(`/api/comparisons/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadComparisons();
    };

    // ── Stack parser (inline, mirrors stackParser.js logic) ──────────────────
    const clientParseStackInput = (rawText: string) => {
        const WORKFLOW_CATS = ['Marketing','Development','Startup Operations','Content Creation','Sales','Design','Data & Analytics','Customer Support','Education','Finance','HR & Recruiting','Research','Productivity','Other'];
        const extracted: Record<string, string> = {};
        const rx = /<<<([A-Z0-9_]+)>>>([\s\S]*?)<<<END_\1>>>/g;
        let m: RegExpExecArray | null;
        while ((m = rx.exec(rawText)) !== null) {
            if (!(m[1] in extracted)) extracted[m[1]] = m[2].trim();
        }
        if (Object.keys(extracted).length === 0) return { status: 'error' as const, errors: ['No valid <<<FIELD>>>…<<<END_FIELD>>> blocks found'] };

        const parseArr = (v?: string): string[] => {
            if (!v) return [];
            const items = v.includes('\n') ? v.split('\n') : v.split(',');
            const seen = new Set<string>();
            return items.map(s => s.trim()).filter(s => { if (!s || seen.has(s.toLowerCase())) return false; seen.add(s.toLowerCase()); return true; });
        };
        const wordCount = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length;

        const name = extracted['NAME'] || null;
        const slugRaw = extracted['SLUG'] || (name || '');
        const slug = slugRaw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const short_description = extracted['SHORT_DESCRIPTION'] || null;
        const full_description  = extracted['FULL_DESCRIPTION']  || null;
        const hero_image        = extracted['HERO_IMAGE']        || null;
        const meta_title        = extracted['META_TITLE']        || null;
        const meta_description  = extracted['META_DESCRIPTION']  || null;
        const setup_time_hours  = extracted['SETUP_TIME_HOURS']  ? parseFloat(extracted['SETUP_TIME_HOURS']) || null : null;

        const catRaw = (extracted['WORKFLOW_CATEGORY'] || '').trim();
        const workflow_category = WORKFLOW_CATS.find(c => c.toLowerCase() === catRaw.toLowerCase()) || catRaw || null;

        // Tools: comma or newline list of tool slugs/names
        const toolsRaw = parseArr(extracted['TOOLS']).map(s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));

        const why_it_works = parseArr(extracted['WHY_IT_WORKS']);
        const who_its_for  = parseArr(extracted['WHO_ITS_FOR']);
        const not_for      = parseArr(extracted['NOT_FOR']);

        // workflow_steps: keep raw text, display in textarea
        const workflow_steps_raw = extracted['WORKFLOW_STEPS'] || '';

        const errors: string[] = [];
        if (!name)  errors.push('NAME is required');
        if (!workflow_category) errors.push('WORKFLOW_CATEGORY is required');
        if (short_description !== null) {
            const w = wordCount(short_description);
            if (w < 10 || w > 40) errors.push(`SHORT_DESCRIPTION must be 10–40 words (got ${w})`);
        }
        if (toolsRaw.length === 0) errors.push('TOOLS must list at least one tool slug');
        if (errors.length > 0) return { status: 'error' as const, errors };

        return { status: 'success' as const, data: { name, slug, short_description, full_description, hero_image, workflow_category, tools: toolsRaw.join('\n'), workflow_steps: workflow_steps_raw, why_it_works: why_it_works.join('\n'), who_its_for: who_its_for.join('\n'), not_for: not_for.join('\n'), setup_time_hours: setup_time_hours?.toString() || '', meta_title, meta_description } };
    };

    const handleParseStackInput = () => {
        setStackParseErrors([]);
        setStackParseSuccess(false);
        const result = clientParseStackInput(stackParseInput);
        if (result.status === 'error') {
            setStackParseErrors(result.errors);
        } else {
            const d = result.data;
            const isEditing = !!editingStackId;
            setStackForm((prev: any) => ({
                ...(isEditing ? prev : EMPTY_STACK_FORM),
                ...(isEditing ? {} : { name: d.name || '', slug: d.slug || '' }),
                short_description:  d.short_description  || (isEditing ? prev.short_description  : ''),
                full_description:   d.full_description   || (isEditing ? prev.full_description   : ''),
                hero_image:         d.hero_image         || (isEditing ? prev.hero_image         : ''),
                workflow_category:  d.workflow_category  || (isEditing ? prev.workflow_category  : ''),
                tools:              d.tools              || (isEditing ? prev.tools              : ''),
                workflow_steps:     d.workflow_steps     || (isEditing ? prev.workflow_steps     : ''),
                why_it_works:       d.why_it_works       || (isEditing ? prev.why_it_works       : ''),
                who_its_for:        d.who_its_for        || (isEditing ? prev.who_its_for        : ''),
                not_for:            d.not_for            || (isEditing ? prev.not_for            : ''),
                setup_time_hours:   d.setup_time_hours   || (isEditing ? prev.setup_time_hours   : ''),
                meta_title:         d.meta_title         || (isEditing ? prev.meta_title         : ''),
                meta_description:   d.meta_description   || (isEditing ? prev.meta_description   : ''),
            }));
            setStackParseSuccess(true);
            setShowStackParser(false);
            setStackParseInput('');
        }
    };

    const handleSaveStack = async () => {
        setStackLoading(true);
        try {
            const splitLines = (v: string) => (v || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
            const toolSlugs = splitLines(stackForm.tools);

            // Parse workflow steps from textarea (Step N: Title\nDescription\nTools: a, b)
            const stepsRaw = (stackForm.workflow_steps || '').trim();
            const steps: { title: string; description: string; tool_slugs: string[] }[] = [];
            if (stepsRaw) {
                const blocks = stepsRaw.split(/\n{2,}/);
                for (const block of blocks) {
                    const lines = block.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
                    if (!lines.length) continue;
                    const title = lines[0].replace(/^step\s*\d+[:.]\s*/i, '').trim();
                    const descLines: string[] = [];
                    let tool_slugs: string[] = [];
                    for (let i = 1; i < lines.length; i++) {
                        const tMatch = lines[i].match(/^tools?:\s*(.+)/i);
                        if (tMatch) tool_slugs = tMatch[1].split(',').map((s: string) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).filter(Boolean);
                        else descLines.push(lines[i]);
                    }
                    if (title) steps.push({ title, description: descLines.join(' '), tool_slugs });
                }
            }

            const payload = {
                ...stackForm,
                tools: toolSlugs,
                workflow_steps: steps,
                why_it_works: splitLines(stackForm.why_it_works),
                who_its_for:  splitLines(stackForm.who_its_for),
                not_for:      splitLines(stackForm.not_for),
                setup_time_hours: stackForm.setup_time_hours ? parseFloat(stackForm.setup_time_hours) : undefined,
                id: stackForm.slug || editingStackId,
            };

            const method = editingStackId ? 'PUT' : 'POST';
            const url = editingStackId ? `/api/stacks/${editingStackId}` : '/api/stacks';
            const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
            if (!res.ok) {
                const err = await res.json();
                setStackParseErrors([err.error || 'Save failed']);
                return;
            }
            if (!editingStackId) { setStackForm({ ...EMPTY_STACK_FORM }); }
            loadStacks();
        } finally {
            setStackLoading(false);
        }
    };

    const handleDeleteStack = async (id: string) => {
        if (!confirm('Delete this stack?')) return;
        await fetch(`/api/stacks/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadStacks();
    };

    // ── Article parser (inline, per-type) ────────────────────────────────────
    const ARTICLE_PARSER_TAGS: Record<string, string[]> = {
        review:   ['TITLE','SLUG','EXCERPT','PRIMARY_TOOLS','VERDICT','PROS','CONS','WHO_ITS_FOR','RATING_BREAKDOWN','CONTENT','META_TITLE','META_DESCRIPTION'],
        guide:    ['TITLE','SLUG','EXCERPT','PRIMARY_TOOLS','DIFFICULTY','TOOLS_USED','STEPS','TIPS','COMMON_MISTAKES','CONTENT','META_TITLE','META_DESCRIPTION'],
        news:     ['TITLE','SLUG','EXCERPT','PRIMARY_TOOLS','CONTENT','SOURCES','META_TITLE','META_DESCRIPTION'],
        use_case: ['TITLE','SLUG','EXCERPT','PRIMARY_TOOLS','USE_CASES','WORKFLOW_STAGES','CONTENT','META_TITLE','META_DESCRIPTION'],
        'best-of':['TITLE','SLUG','EXCERPT','PRIMARY_TOOLS','CONTENT','META_TITLE','META_DESCRIPTION'],
        all:      ['TITLE','SLUG','EXCERPT','PRIMARY_TOOLS','CONTENT','META_TITLE','META_DESCRIPTION'],
    };

    const clientParseArticleInput = (rawText: string, articleType: string) => {
        const extracted: Record<string, string> = {};
        const rx = /<<<([A-Z0-9_]+)>>>([\s\S]*?)<<<END_\1>>>/g;
        let m: RegExpExecArray | null;
        while ((m = rx.exec(rawText)) !== null) {
            if (!(m[1] in extracted)) extracted[m[1]] = m[2].trim();
        }
        if (Object.keys(extracted).length === 0) return { status: 'error' as const, errors: ['No valid <<<FIELD>>>…<<<END_FIELD>>> blocks found'] };

        const parseArr = (v?: string): string[] => {
            if (!v) return [];
            const items = v.includes('\n') ? v.split('\n') : v.split(',');
            const seen = new Set<string>();
            return items.map(s => s.trim()).filter(s => { if (!s || seen.has(s.toLowerCase())) return false; seen.add(s.toLowerCase()); return true; });
        };
        const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const title   = extracted['TITLE']   || '';
        const excerpt = extracted['EXCERPT'] || '';
        const slugRaw = extracted['SLUG']    || title;
        const slug    = toSlug(slugRaw);
        const meta_title       = extracted['META_TITLE']       || null;
        const meta_description = extracted['META_DESCRIPTION'] || null;
        const primaryToolsRaw  = parseArr(extracted['PRIMARY_TOOLS']).map(s => toSlug(s));

        // Content: split into paragraphs on double-newlines
        const contentRaw = extracted['CONTENT'] || '';
        const content = contentRaw.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

        const mapped: any = {
            title, slug, excerpt, article_type: articleType === 'all' ? 'news' : articleType,
            primary_tools: primaryToolsRaw,
            content,
            meta_title, meta_description,
            date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            originalReadTime: '5 min read',
        };

        if (articleType === 'review') {
            mapped.verdict = extracted['VERDICT'] || '';
            mapped.pros    = parseArr(extracted['PROS']);
            mapped.cons    = parseArr(extracted['CONS']);
            mapped.who_its_for = parseArr(extracted['WHO_ITS_FOR']);
            // rating_breakdown: "Ease of Use: 8.5\nFeatures: 9" → object
            const rbRaw = extracted['RATING_BREAKDOWN'] || '';
            const rb: Record<string, number> = {};
            for (const line of rbRaw.split('\n')) {
                const match = line.match(/^(.+?):\s*([\d.]+)/);
                if (match) rb[match[1].trim().toLowerCase().replace(/\s+/g, '_')] = parseFloat(match[2]);
            }
            if (Object.keys(rb).length) mapped.rating_breakdown = rb;
        }

        if (articleType === 'guide') {
            mapped.difficulty_level = (extracted['DIFFICULTY'] || '').toLowerCase() || 'beginner';
            mapped.tools_used = parseArr(extracted['TOOLS_USED']).map(toSlug);
            mapped.tips = parseArr(extracted['TIPS']);
            mapped.common_mistakes = parseArr(extracted['COMMON_MISTAKES']);
            // Steps: "Step N: Title\nContent\nTool: slug" blocks
            const stepsRaw = extracted['STEPS'] || '';
            const steps: any[] = [];
            for (const block of stepsRaw.split(/\n{2,}/)) {
                const lines = block.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
                if (!lines.length) continue;
                const stepTitle = lines[0].replace(/^step\s*\d+[:.]\s*/i, '').trim();
                let stepContent = '', stepTool = '';
                for (let i = 1; i < lines.length; i++) {
                    const tm = lines[i].match(/^tool:\s*(.+)/i);
                    if (tm) stepTool = toSlug(tm[1]);
                    else stepContent += (stepContent ? ' ' : '') + lines[i];
                }
                if (stepTitle) steps.push({ title: stepTitle, content: stepContent, tool_slug: stepTool });
            }
            mapped.steps = steps;
        }

        if (articleType === 'news') {
            mapped.sources = parseArr(extracted['SOURCES']);
        }

        if (articleType === 'use_case') {
            mapped.use_cases = parseArr(extracted['USE_CASES']);
            // Workflow stages
            const wsRaw = extracted['WORKFLOW_STAGES'] || '';
            const stages: any[] = [];
            for (const block of wsRaw.split(/\n{2,}/)) {
                const lines = block.trim().split('\n').map((l: string) => l.trim()).filter(Boolean);
                if (!lines.length) continue;
                const stageTitle = lines[0].replace(/^stage\s*\d+[:.]\s*/i, '').trim();
                let desc = '', toolSlugs: string[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const tm = lines[i].match(/^tools?:\s*(.+)/i);
                    if (tm) toolSlugs = tm[1].split(',').map((s: string) => toSlug(s.trim())).filter(Boolean);
                    else desc += (desc ? ' ' : '') + lines[i];
                }
                if (stageTitle) stages.push({ stage_title: stageTitle, description: desc, tool_slugs: toolSlugs });
            }
            mapped.workflow_stages = stages;
        }

        if (!title) return { status: 'error' as const, errors: ['TITLE is required'] };
        return { status: 'success' as const, data: mapped };
    };

    const handleParseArticleInput = () => {
        setArticleParseErrors([]);
        setArticleParseSuccess(false);
        const result = clientParseArticleInput(articleParseInput, articleSubTab);
        if (result.status === 'error') {
            setArticleParseErrors(result.errors);
        } else {
            setFormData((prev: any) => ({ ...prev, ...result.data }));
            setArticleParseSuccess(true);
            setShowArticleParser(false);
            setArticleParseInput('');
        }
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
                const filename = filenameMatch ? filenameMatch[1] : `toolcurrent-backup-${new Date().toISOString().slice(0, 10)}.json`;

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
                const filename = filenameMatch ? filenameMatch[1] : `toolcurrent-images-backup-${new Date().toISOString().slice(0, 10)}.json`;

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
                {(['articles', 'tools', 'comparisons', 'stacks', 'categories', 'social'] as const).map(tab => (
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
                    <div className="space-y-4">

                    {/* Article type sub-tabs + parser toggle */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1 bg-zinc-900 border border-white/5 rounded-xl p-1">
                            {(['all','review','guide','news','use_case','best-of'] as const).map(tab => (
                                <button key={tab} onClick={() => { setArticleSubTab(tab); if (tab !== 'all') setFormData((p: any) => ({ ...p, article_type: tab === 'use_case' ? 'use-case' : tab })); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${articleSubTab === tab ? 'bg-news-accent text-black' : 'text-gray-500 hover:text-white'}`}>
                                    {tab === 'use_case' ? 'Use Cases' : tab === 'best-of' ? 'Best-of' : tab}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowArticleParser(p => !p)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-news-accent/10 border border-news-accent/30 text-news-accent rounded-lg text-xs font-bold hover:bg-news-accent/20 transition-colors">
                            <Code2 size={12} /> {showArticleParser ? 'Hide Parser' : 'Paste Tagged Input'}
                        </button>
                    </div>

                    {/* Parser Panel */}
                    {showArticleParser && (
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400 font-mono">Paste <span className="text-news-accent">{'<<<FIELD>>>…<<<END_FIELD>>>'}</span> tagged <span className="text-white font-bold">{articleSubTab === 'all' ? 'article' : articleSubTab.replace('_', ' ')}</span> input</p>
                            </div>
                            <div className="text-[10px] text-gray-600 font-mono space-y-0.5">
                                {(ARTICLE_PARSER_TAGS[articleSubTab] || ARTICLE_PARSER_TAGS['all']).map(tag => (
                                    <div key={tag}>{'<<<'}{tag}{'>>>'} … {'<<<END_'}{tag}{'>>>'}</div>
                                ))}
                            </div>
                            {articleSubTab === 'review' && <p className="text-[10px] text-gray-600 font-mono">RATING_BREAKDOWN: Ease of Use: 8.5\nFeatures: 9\nValue: 8</p>}
                            {articleSubTab === 'guide' && <p className="text-[10px] text-gray-600 font-mono">STEPS: Step 1: Title\nDescription\nTool: slug (blank line between steps)</p>}
                            {articleSubTab === 'use_case' && <p className="text-[10px] text-gray-600 font-mono">WORKFLOW_STAGES: Stage 1: Title\nDescription\nTools: slug1, slug2</p>}
                            <textarea value={articleParseInput} onChange={e => setArticleParseInput(e.target.value)} rows={10}
                                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-news-accent resize-none"
                                placeholder={`Paste AI-generated tagged ${articleSubTab === 'all' ? 'article' : articleSubTab.replace('_', ' ')} content here…`} />
                            {articleParseErrors.length > 0 && (
                                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 space-y-1">
                                    {articleParseErrors.map((e, i) => <p key={i} className="text-xs text-red-400">· {e}</p>)}
                                </div>
                            )}
                            {articleParseSuccess && <p className="text-xs text-green-400">✓ Fields loaded from parsed input</p>}
                            <button onClick={handleParseArticleInput} className="w-full bg-news-accent hover:bg-news-accentHover text-black font-bold py-2 rounded-lg text-sm transition-colors">
                                Parse & Load into Editor
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-12 gap-6 h-full">

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

                                    {articles.filter((article: any) => {
                                        if (articleSubTab === 'all') return true;
                                        const t = article.article_type;
                                        if (articleSubTab === 'use_case') return t === 'use_case' || t === 'use-case';
                                        return t === articleSubTab;
                                    }).map(article => {
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
                    </div>
                )}

                {/* TOOLS TAB */}
                {cmsTab === 'tools' && (
                    <>
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
                                                disabled={!parseInput.trim()}
                                                className="w-full py-2 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-40 text-xs font-bold text-white transition-colors">
                                                Parse & Load Fields
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
                                    <label className="block text-xs text-gray-400 mb-1">Short Description <span className="text-gray-600">(15–30 words)</span></label>
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
                                        {['Content Creation','Research','Coding','Automation','Lead Generation','Customer Support','Data Analysis','Design','Education','Personal Productivity','Marketing'].map(uc => {
                                            const ucArr: string[] = Array.isArray(toolForm.use_case_tags) ? toolForm.use_case_tags : [];
                                            const selected = ucArr.includes(uc);
                                            const atMax = ucArr.length >= 5 && !selected;
                                            return (
                                                <button key={uc} type="button" disabled={atMax} onClick={() => { setToolForm((p: any) => {
                                                    const cur: string[] = Array.isArray(p.use_case_tags) ? p.use_case_tags : [];
                                                    const newTags = selected ? cur.filter((x: string) => x !== uc) : [...cur, uc];
                                                    const curScores: any[] = Array.isArray(p.use_case_scores) ? p.use_case_scores : [];
                                                    const newScores = !selected && !curScores.find((s: any) => s.use_case.toLowerCase() === uc.toLowerCase()) ? [...curScores, { use_case: uc, score: '', description: '' }] : curScores;
                                                    return { ...p, use_case_tags: newTags, use_case_scores: newScores };
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
                                    <label className="block text-xs text-gray-400 mb-1">Key Features <span className="text-gray-600">(4–6, one per line, 3–24 words each)</span></label>
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

                                {/* CAPABILITIES */}
                                <div className="rounded-lg border border-white/10 p-4 space-y-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-news-accent mb-0.5">Capabilities</p>
                                        <p className="text-[11px] text-gray-500">These fields power the Feature Comparison table on comparison pages. Use N/A if not applicable.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[['context_window','Context Window','e.g. 128K, 1M, N/A'],['max_integrations','Native Integrations','e.g. 500+, 50–100, N/A'],['api_pricing','API Pricing','e.g. $3.00 input / $15.00 output per MTok']].map(([key, label, ph]) => (
                                            <div key={key} className={key === 'api_pricing' ? 'col-span-2' : ''}>
                                                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                                <input value={toolForm[key] || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolForm((p: any) => ({ ...p, [key]: e.target.value }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder={ph} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[['image_generation','Image Generation',['yes','no','partial']],['memory_persistence','Memory Persistence',['yes','no','partial']],['computer_use','Computer Use',['yes','no','partial']],['api_available','API Available',['yes','no']]].map(([key, label, opts]) => (
                                            <div key={key as string}>
                                                <label className="block text-xs text-gray-400 mb-1">{label as string}</label>
                                                <select value={toolForm[key as string] || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setToolForm((p: any) => ({ ...p, [key as string]: e.target.value }))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                                    <option value="">— not set —</option>
                                                    {(opts as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* PLANS & MODELS */}
                                <div className="rounded-lg border border-white/10 p-4 space-y-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-news-accent mb-0.5">Plans & Models</p>
                                        <p className="text-[11px] text-gray-500">These fields answer high-volume search queries about free access, usage limits, and which models are available on each plan.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Free Tier</label>
                                        <input value={toolForm.free_tier || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolForm((p: any) => ({ ...p, free_tier: e.target.value }))}
                                            maxLength={200}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="e.g. GPT-4o mini unlimited, GPT-4o limited to 10 messages/3 hours, voice and image require Plus" />
                                        <p className="text-[10px] text-gray-600 mt-0.5">One sentence. Include model name, usage limits, and what requires a paid plan. Write None if no free tier exists.</p>
                                        {toolForm.free_tier && toolForm.free_tier.length > 180 && <p className="text-[10px] text-yellow-500 mt-0.5">{toolForm.free_tier.length}/200 characters</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Rate Limits by Plan <span className="text-gray-600">(one line per tier)</span></label>
                                        <textarea value={toolForm.rate_limits || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToolForm((p: any) => ({ ...p, rate_limits: e.target.value }))}
                                            rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"Free: 10 GPT-4o messages/3 hours, unlimited GPT-4o mini\nPlus: 80 messages/3 hours\nPro: Unlimited all models"} />
                                        <p className="text-[10px] text-gray-600 mt-0.5">One line per plan tier. Format: Plan name: limits. Write Not publicly disclosed if unknown for a tier.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Models by Plan <span className="text-gray-600">(one line per tier)</span></label>
                                        <textarea value={toolForm.model_version_by_plan || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToolForm((p: any) => ({ ...p, model_version_by_plan: e.target.value }))}
                                            rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"Free: Claude Sonnet 4.6 (limited)\nPro: Claude Sonnet 4.6 (unlimited), Claude Opus 4.6\nTeam: All Pro models plus admin controls"} />
                                        <p className="text-[10px] text-gray-600 mt-0.5">One line per plan tier. Format: Plan name: model name(s). Reflects current models as of Last Updated date.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Price by Plan <span className="text-gray-600">(one line per tier)</span></label>
                                        <textarea value={toolForm.price_by_plan || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToolForm((p: any) => ({ ...p, price_by_plan: e.target.value }))}
                                            rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"Free: Free\nGo: $8/month\nPlus: $20/month\nPro: $200/month\nBusiness: $30/user/month\nEnterprise: Custom"} />
                                        <p className="text-[10px] text-gray-600 mt-0.5">One line per plan tier. Format: Plan name: price. Shown in the Plans & Pricing table on the tool page.</p>
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[['website_url', 'Website URL'], ['affiliate_url', 'Affiliate URL']].map(([key, label]) => (
                                        <div key={key}>
                                            <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                            <input value={toolForm[key] || ''} onChange={e => setToolForm((p: any) => ({ ...p, [key]: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder={label} />
                                        </div>
                                    ))}
                                </div>
                                {/* Logo URL + Cloudinary upload */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Logo URL</label>
                                    <div className="flex gap-2 items-center mb-2">
                                        <input value={toolForm.logo || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolForm((p: any) => ({ ...p, logo: e.target.value }))}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="https://..." />
                                        {toolForm.logo && !toolForm.logo.includes('cloudinary') && (
                                            <button type="button" onClick={async () => {
                                                try {
                                                    const res = await fetch('/api/tools/upload-logo', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ url: toolForm.logo }) });
                                                    const data = await res.json();
                                                    if (!res.ok) { alert('Upload failed: ' + data.error); return; }
                                                    setToolForm((p: any) => ({ ...p, logo: data.url }));
                                                } catch (e: any) { alert('Upload error: ' + e.message); }
                                            }} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg whitespace-nowrap flex-shrink-0">
                                                Upload URL
                                            </button>
                                        )}
                                        {toolForm.logo && (
                                            <img src={toolForm.logo} alt="" className="h-8 w-8 object-contain rounded bg-white/5 flex-shrink-0" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }} />
                                        )}
                                    </div>
                                    {/* File upload + Browse */}
                                    <div className="flex gap-2">
                                        <input ref={logoFileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            try {
                                                const fd = new FormData();
                                                fd.append('file', file);
                                                const res = await fetch('/api/tools/upload-logo-file', { method: 'POST', headers: { Authorization: getAuthHeaders().Authorization }, body: fd });
                                                const data = await res.json();
                                                if (!res.ok) { alert('Upload failed: ' + data.error); return; }
                                                setToolForm((p: any) => ({ ...p, logo: data.url }));
                                            } catch (err: any) { alert('Upload error: ' + err.message); }
                                            e.target.value = '';
                                        }} />
                                        <button type="button" onClick={() => logoFileInputRef.current?.click()}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs rounded-lg border border-white/10 transition-colors">
                                            <Upload size={12} /> Upload file
                                        </button>
                                        <button type="button" onClick={async () => {
                                            setAssetBrowserOpen(true);
                                            if (assetBrowserAssets.length > 0) return;
                                            setAssetBrowserLoading(true);
                                            try {
                                                const res = await fetch('/api/tools/cloudinary-assets', { headers: getAuthHeaders() });
                                                const data = await res.json();
                                                if (res.ok) setAssetBrowserAssets(data);
                                                else alert('Failed to load assets: ' + data.error);
                                            } catch (err: any) { alert('Error: ' + err.message); }
                                            finally { setAssetBrowserLoading(false); }
                                        }} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs rounded-lg border border-white/10 transition-colors">
                                            <FileImage size={12} /> Browse Cloudinary
                                        </button>
                                    </div>
                                    {/* Asset browser modal */}
                                    {assetBrowserOpen && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setAssetBrowserOpen(false)}>
                                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-bold text-white">toolcurrent/assets</p>
                                                    <button onClick={() => setAssetBrowserOpen(false)} className="text-gray-500 hover:text-white text-xs">✕ Close</button>
                                                </div>
                                                {assetBrowserLoading ? (
                                                    <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</div>
                                                ) : assetBrowserAssets.length === 0 ? (
                                                    <p className="text-gray-500 text-sm text-center py-8">No images found in toolcurrent/assets.</p>
                                                ) : (
                                                    <div className="overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                        {assetBrowserAssets.map((asset: { url: string; public_id: string }) => (
                                                            <div key={asset.public_id} className="relative aspect-square group">
                                                                <button type="button" onClick={() => { setToolForm((p: any) => ({ ...p, logo: asset.url })); setAssetBrowserOpen(false); }}
                                                                    className="w-full h-full rounded-lg overflow-hidden bg-black/40 border border-white/10 hover:border-news-accent transition-colors p-1">
                                                                    <img src={asset.url} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    title="Delete image"
                                                                    onClick={async (e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        if (!confirm(`Delete ${asset.public_id}?`)) return;
                                                                        const res = await fetch('/api/tools/cloudinary-assets', { method: 'DELETE', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: asset.public_id }) });
                                                                        if (res.ok) setAssetBrowserAssets((prev: { url: string; public_id: string }[]) => prev.filter((a: { url: string; public_id: string }) => a.public_id !== asset.public_id));
                                                                        else alert('Delete failed');
                                                                    }}
                                                                    className="absolute top-0.5 right-0.5 bg-red-600/80 hover:bg-red-600 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                                >
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Rating Score */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Our Score <span className="text-gray-600">(0–10)</span></label>
                                    <input
                                        type="number" min="0" max="10" step="0.1"
                                        value={toolForm.rating_score ?? 0}
                                        onChange={e => setToolForm((p: any) => ({ ...p, rating_score: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent"
                                        placeholder="e.g. 8.5"
                                    />
                                </div>

                                {/* Screenshots */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs text-gray-400">Product Screenshots</label>
                                        <button
                                            type="button"
                                            onClick={() => setToolForm((p: any) => ({ ...p, screenshots: [...(Array.isArray(p.screenshots) ? p.screenshots : []), { url: '', caption: '' }] }))}
                                            className="text-xs text-news-accent hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={11} /> Add Screenshot
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(Array.isArray(toolForm.screenshots) ? toolForm.screenshots : []).map((sc: any, i: number) => (
                                            <div key={i} className="flex gap-2 items-start">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input
                                                        value={sc.url || ''}
                                                        onChange={e => setToolForm((p: any) => { const s = [...p.screenshots]; s[i] = { ...s[i], url: e.target.value }; return { ...p, screenshots: s }; })}
                                                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent"
                                                        placeholder="Image URL"
                                                    />
                                                    <input
                                                        value={sc.caption || ''}
                                                        onChange={e => setToolForm((p: any) => { const s = [...p.screenshots]; s[i] = { ...s[i], caption: e.target.value }; return { ...p, screenshots: s }; })}
                                                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent"
                                                        placeholder="Caption (optional)"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setToolForm((p: any) => ({ ...p, screenshots: p.screenshots.filter((_: any, j: number) => j !== i) }))}
                                                    className="p-2 text-gray-600 hover:text-red-400 transition-colors mt-0.5"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!toolForm.screenshots || toolForm.screenshots.length === 0) && (
                                            <p className="text-xs text-gray-600">No screenshots added.</p>
                                        )}
                                    </div>
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
                                    {([
                                        { field: 'related_tools' as const, label: 'Related Tools', accent: 'accent-news-accent', search: relatedSearch, setSearch: setRelatedSearch, unresolved: unresolvedRelated, setUnresolved: setUnresolvedRelated },
                                        { field: 'competitors' as const, label: 'Competitors', accent: 'accent-red-400', search: competitorSearch, setSearch: setCompetitorSearch, unresolved: unresolvedCompetitors, setUnresolved: setUnresolvedCompetitors },
                                    ]).map(({ field, label, accent, search, setSearch, unresolved, setUnresolved }) => {
                                        const otherTools = tools.filter((t: any) => (t.id || t._id) !== editingToolId);
                                        const filtered = search.trim()
                                            ? otherTools.filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()))
                                            : otherTools;
                                        const exactMatch = otherTools.some((t: any) => t.name.toLowerCase() === search.trim().toLowerCase());
                                        return (
                                            <div key={field}>
                                                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                                {/* Selected chips */}
                                                {(Array.isArray(toolForm[field]) && toolForm[field].length > 0) && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {toolForm[field].map((tid: string) => {
                                                            const t = tools.find((t: any) => (t.id || t._id) === tid);
                                                            return t ? (
                                                                <span key={tid} className="flex items-center gap-1 bg-white/10 text-xs text-white rounded-full px-2 py-0.5">
                                                                    {t.name}
                                                                    <button type="button" onClick={() => setToolForm((p: any) => ({ ...p, [field]: p[field].filter((x: string) => x !== tid) }))} className="text-gray-500 hover:text-red-400 leading-none">×</button>
                                                                </span>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                )}
                                                {/* Search input */}
                                                <input
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30 mb-1"
                                                    placeholder="Search or create…"
                                                />
                                                {/* Suggestion list */}
                                                <div className="bg-black/40 border border-white/10 rounded-lg p-2 max-h-32 overflow-y-auto space-y-0.5">
                                                    {filtered.map((t: any) => {
                                                        const tid = t.id || t._id;
                                                        const sel = Array.isArray(toolForm[field]) && toolForm[field].includes(tid);
                                                        return (
                                                            <label key={tid} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-1 py-0.5 rounded">
                                                                <input type="checkbox" checked={sel} className={accent} onChange={() => setToolForm((p: any) => {
                                                                    const cur: string[] = Array.isArray(p[field]) ? p[field] : [];
                                                                    return { ...p, [field]: sel ? cur.filter((x: string) => x !== tid) : [...cur, tid] };
                                                                })} />
                                                                <span className="text-xs text-gray-300 truncate">{t.name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                    {search.trim() && !exactMatch && (
                                                        <button
                                                            type="button"
                                                            disabled={stubLoading === field}
                                                            onClick={() => handleCreateStub(search.trim(), field, () => setSearch(''))}
                                                            className="w-full text-left px-1 py-0.5 text-xs text-news-accent hover:text-white disabled:opacity-40 transition-colors"
                                                        >
                                                            {stubLoading === field ? 'Creating…' : `+ Create stub "${search.trim()}"`}
                                                        </button>
                                                    )}
                                                    {filtered.length === 0 && !search.trim() && <p className="text-xs text-gray-600 px-1">No other tools yet.</p>}
                                                </div>
                                                {/* Unresolved names from parse */}
                                                {unresolved.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-[10px] text-yellow-500/60 uppercase tracking-widest font-bold">Not yet in CMS</p>
                                                        {unresolved.map((name: string) => (
                                                            <div key={name} className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded px-2 py-1">
                                                                <span className="text-xs text-yellow-400/80 truncate">{name}</span>
                                                                <button
                                                                    type="button"
                                                                    disabled={stubLoading === field}
                                                                    onClick={() => handleCreateStub(name, field, () => setUnresolved(prev => prev.filter((n: string) => n !== name)))}
                                                                    className="text-[10px] text-news-accent hover:text-white disabled:opacity-40 transition-colors ml-2 flex-shrink-0"
                                                                >
                                                                    {stubLoading === field ? '…' : 'Create & link'}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Editorial Content */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Model Version</label>
                                    <input value={toolForm.model_version || ''} onChange={e => setToolForm((p: any) => ({ ...p, model_version: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="e.g. Grok 4 (Grok 4.1 Fast for API)" />
                                    <p className="text-[10px] text-gray-600 mt-0.5">Legacy field — use Models by Plan (Plans & Models section) for new entries. Retained for tools not yet regenerated.</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Best For <span className="text-gray-600">(one per line)</span></label>
                                    <textarea value={toolForm.best_for || ''} onChange={e => setToolForm((p: any) => ({ ...p, best_for: e.target.value }))}
                                        rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"Developers running high-volume API workloads\nResearchers who need live X data"} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Not Ideal For <span className="text-gray-600">(one per line)</span></label>
                                    <textarea value={toolForm.not_ideal_for || ''} onChange={e => setToolForm((p: any) => ({ ...p, not_ideal_for: e.target.value }))}
                                        rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"Enterprise teams in regulated industries\nTeams needing deep third-party integrations"} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Alternative Selection <span className="text-gray-600">(when to choose alternatives)</span></label>
                                    <textarea value={toolForm.alternative_selection || ''} onChange={e => setToolForm((p: any) => ({ ...p, alternative_selection: e.target.value }))}
                                        rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none" placeholder="Choose ChatGPT when you need 500+ integrations…" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Use Case Breakdown <span className="text-gray-600">(one row per selected use case)</span></label>
                                    {(!Array.isArray(toolForm.use_case_tags) || toolForm.use_case_tags.length === 0) ? (
                                        <p className="text-xs text-gray-600 italic">Select use cases above to fill in breakdown scores.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {(Array.isArray(toolForm.use_case_tags) ? toolForm.use_case_tags : []).map((uc: string) => {
                                                const scores: any[] = Array.isArray(toolForm.use_case_scores) ? toolForm.use_case_scores : [];
                                                const entry = scores.find((s: any) => s.use_case.toLowerCase() === uc.toLowerCase()) || { use_case: uc, score: '', description: '' };
                                                const updateEntry = (field: string, value: string) => setToolForm((p: any) => {
                                                    const cur: any[] = Array.isArray(p.use_case_scores) ? p.use_case_scores : [];
                                                    const idx = cur.findIndex((s: any) => s.use_case.toLowerCase() === uc.toLowerCase());
                                                    const updated = idx >= 0 ? cur.map((s: any, i: number) => i === idx ? { ...s, [field]: value } : s) : [...cur, { use_case: uc, score: '', description: '', [field]: value }];
                                                    return { ...p, use_case_scores: updated };
                                                });
                                                const scoreNum = parseFloat(String(entry.score));
                                                const scoreValid = entry.score === '' || (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10);
                                                return (
                                                    <div key={uc} className="bg-black/30 border border-white/10 rounded-lg p-3">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-2">{uc}</p>
                                                        <div className="flex gap-2 items-start">
                                                            <div className="w-20 flex-shrink-0">
                                                                <label className="text-[10px] text-gray-500 block mb-1">Score /10</label>
                                                                <input type="number" min="0" max="10" step="0.1" value={entry.score} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntry('score', e.target.value)}
                                                                    className={`w-full bg-black/40 border rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-news-accent ${scoreValid ? 'border-white/10' : 'border-red-500/60'}`} placeholder="8.5" />
                                                                {!scoreValid && <p className="text-[10px] text-red-400 mt-0.5">0–10, 1 decimal</p>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <label className="text-[10px] text-gray-500 block mb-1">Description</label>
                                                                <textarea value={entry.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateEntry('description', e.target.value)} rows={2}
                                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-news-accent resize-none" placeholder={`How this tool performs for ${uc}...`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                {/* ── WORKFLOW & AUDIENCE ─────────────────────────────────────── */}
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-1">Workflow &amp; Audience</p>
                                    <p className="text-xs text-gray-500 mb-4">These fields power the workflow filter cards on the AI Tools hub and the role-based ranking pages on the Best Software hub. Assign 1–4 workflow tags and provide a score and specific evidence sentence for each.</p>

                                    {/* Workflow Tags checkbox grid */}
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-400 mb-1">Workflow Tags <span className="text-gray-600">(select 1–4)</span></label>
                                        <p className="text-[11px] text-gray-500 mb-3">Select 1–4 workflow types this tool is built for or well suited to.</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['Students', 'Developers', 'Marketers', 'Content Creators', 'Startups', 'Small Business', 'Enterprise', 'Researchers', 'Designers', 'Sales Teams'] as const).map(tag => {
                                                const selected: string[] = Array.isArray(toolForm.workflow_tags) ? toolForm.workflow_tags : [];
                                                const isSelected = selected.includes(tag);
                                                const atMax = selected.length >= 4;
                                                const toggleTag = () => {
                                                    if (isSelected) {
                                                        const scores: any[] = Array.isArray(toolForm.workflow_scores) ? toolForm.workflow_scores : [];
                                                        const entry = scores.find((s: any) => s.workflow_tag === tag);
                                                        if (entry && (entry.score || entry.sentence)) {
                                                            if (!confirm(`Remove "${tag}"? This will delete its score (${entry.score}/10) and evidence sentence.`)) return;
                                                        }
                                                        setToolForm((p: any) => ({
                                                            ...p,
                                                            workflow_tags: selected.filter((t: string) => t !== tag),
                                                            workflow_scores: (Array.isArray(p.workflow_scores) ? p.workflow_scores : []).filter((s: any) => s.workflow_tag !== tag),
                                                        }));
                                                    } else {
                                                        if (atMax) return;
                                                        setToolForm((p: any) => ({
                                                            ...p,
                                                            workflow_tags: [...selected, tag],
                                                            workflow_scores: [...(Array.isArray(p.workflow_scores) ? p.workflow_scores : []), { workflow_tag: tag, score: '', sentence: '' }],
                                                        }));
                                                    }
                                                };
                                                return (
                                                    <button key={tag} type="button" onClick={toggleTag} disabled={!isSelected && atMax}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${isSelected ? 'border-news-accent/50 bg-news-accent/10 text-news-accent' : atMax ? 'border-white/5 bg-black/20 text-gray-600 cursor-not-allowed opacity-50' : 'border-white/10 bg-black/30 text-gray-400 hover:border-white/20'}`}>
                                                        <span className={`w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center ${isSelected ? 'bg-news-accent border-news-accent' : 'border-white/30'}`}>
                                                            {isSelected && <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                                                        </span>
                                                        <span className="text-xs font-medium">{tag}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {Array.isArray(toolForm.workflow_tags) && toolForm.workflow_tags.length >= 4 && (
                                            <p className="text-[11px] text-amber-500/80 mt-2">Maximum 4 tags selected.</p>
                                        )}
                                        {toolErrors.workflow_tags && <p className="text-xs text-red-400 mt-1">{toolErrors.workflow_tags}</p>}
                                    </div>

                                    {/* Workflow Breakdown rows */}
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Workflow Breakdown <span className="text-gray-600">(one row per selected tag)</span></label>
                                        <p className="text-[11px] text-gray-500 mb-3">For each workflow tag, provide a score and a specific sentence explaining why. Cite pricing, features, or limitations as evidence — not generic claims.</p>
                                        {(!Array.isArray(toolForm.workflow_tags) || toolForm.workflow_tags.length === 0) ? (
                                            <p className="text-xs text-gray-600 italic">Select workflow tags above to fill in breakdown scores.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {(Array.isArray(toolForm.workflow_tags) ? toolForm.workflow_tags : []).map((tag: string) => {
                                                    const scores: any[] = Array.isArray(toolForm.workflow_scores) ? toolForm.workflow_scores : [];
                                                    const entry = scores.find((s: any) => s.workflow_tag === tag) || { workflow_tag: tag, score: '', sentence: '' };
                                                    const updateEntry = (field: string, value: string) => setToolForm((p: any) => {
                                                        const cur: any[] = Array.isArray(p.workflow_scores) ? p.workflow_scores : [];
                                                        const idx = cur.findIndex((s: any) => s.workflow_tag === tag);
                                                        const updated = idx >= 0
                                                            ? cur.map((s: any, i: number) => i === idx ? { ...s, [field]: value } : s)
                                                            : [...cur, { workflow_tag: tag, score: '', sentence: '', [field]: value }];
                                                        return { ...p, workflow_scores: updated };
                                                    });
                                                    const scoreNum = parseFloat(String(entry.score));
                                                    const scoreValid = entry.score === '' || (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10);
                                                    const needsDecimal = entry.score !== '' && !String(entry.score).includes('.');
                                                    const isIncomplete = toolErrors.workflow_scores && (!entry.score || !entry.sentence);
                                                    return (
                                                        <div key={tag} className={`bg-black/30 border rounded-lg p-3 transition-colors ${isIncomplete ? 'border-red-500/40' : 'border-white/10'}`}>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-news-accent mb-2">{tag}</p>
                                                            <div className="flex gap-2 items-start">
                                                                <div className="w-20 flex-shrink-0">
                                                                    <label className="text-[10px] text-gray-500 block mb-1">Score /10</label>
                                                                    <input type="number" min="0" max="10" step="0.1" value={entry.score}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEntry('score', e.target.value)}
                                                                        className={`w-full bg-black/40 border rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-news-accent ${scoreValid && !needsDecimal ? 'border-white/10' : 'border-amber-500/60'}`}
                                                                        placeholder="8.5" />
                                                                    {!scoreValid && <p className="text-[10px] text-red-400 mt-0.5">0–10</p>}
                                                                    {scoreValid && needsDecimal && <p className="text-[10px] text-amber-400 mt-0.5">Add .0 (e.g. {entry.score}.0)</p>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <label className="text-[10px] text-gray-500 block mb-1">Evidence sentence <span className="text-gray-600">(max 200 chars)</span></label>
                                                                    <textarea value={entry.sentence}
                                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateEntry('sentence', e.target.value)}
                                                                        rows={2} maxLength={200}
                                                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-news-accent resize-none"
                                                                        placeholder={`Specific evidence for ${tag}…`} />
                                                                    {entry.sentence && entry.sentence.length > 160 && (
                                                                        <p className="text-[10px] text-gray-500 text-right">{entry.sentence.length}/200</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {toolErrors.workflow_scores && <p className="text-xs text-red-400 mt-2">{toolErrors.workflow_scores}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Limitations <span className="text-gray-600">(comma-separated tags)</span></label>
                                    <input value={toolForm.limitations || ''} onChange={e => setToolForm((p: any) => ({ ...p, limitations: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="bias_risk, reliability_risk, ecosystem_weakness" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Rating Breakdown <span className="text-gray-600">(Dimension: score, one per line)</span></label>
                                    <textarea value={toolForm.rating_breakdown || ''} onChange={e => setToolForm((p: any) => ({ ...p, rating_breakdown: e.target.value }))}
                                        rows={5} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"Value: 8.5\nFeatures: 7.5\nReliability: 6.5\nEase of Use: 7.0\nEcosystem: 6.0"} />
                                </div>

                                {/* Cross-linking */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Review Article Slug <span className="text-gray-600">(links tool page → full review)</span></label>
                                    <input value={toolForm.review_slug || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolForm((p: any) => ({ ...p, review_slug: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="grammarly-review-2026" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Competitor Differentiators <span className="text-gray-600">(ToolName: one-line differentiator, one per line)</span></label>
                                    <textarea value={toolForm.competitor_differentiator || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToolForm((p: any) => ({ ...p, competitor_differentiator: e.target.value }))}
                                        rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"ProWritingAid: lower price with fiction-focused reports\nQuillBot: paraphrasing modes, no inline overlay"} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Related Tool Notes <span className="text-gray-600">(ToolName: complementary role note, one per line)</span></label>
                                    <textarea value={toolForm.related_tool_note || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setToolForm((p: any) => ({ ...p, related_tool_note: e.target.value }))}
                                        rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" placeholder={"Notion: draft writing before Grammarly corrects inline\nJasper: generates content, Grammarly polishes it"} />
                                </div>

                                {/* SEO */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Primary Keyword</label>
                                    <input value={toolForm.primary_keyword || ''} onChange={e => setToolForm((p: any) => ({ ...p, primary_keyword: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="Grok AI review 2026" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Alternative Keywords <span className="text-gray-600">(comma-separated)</span></label>
                                    <input value={toolForm.alternative_keywords || ''} onChange={e => setToolForm((p: any) => ({ ...p, alternative_keywords: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="Grok vs ChatGPT 2026, xAI Grok pricing" />
                                </div>
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

                                {/* Linked Content — auto-discovered from other content types */}
                                {editingToolId && (
                                    <div className="border border-white/5 rounded-xl p-4 space-y-3 bg-black/20">
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <Layers size={12} /> Linked Content {linkedContentLoading && <span className="text-gray-600">(loading…)</span>}
                                        </p>
                                        {linkedContent && (() => {
                                            const sections: { label: string; items: any[]; href: (i: any) => string; emptyMsg: string }[] = [
                                                { label: 'Reviews',       items: linkedContent.reviews,     href: (i: any) => `/articles/${i.slug}`,     emptyMsg: 'No review article tagged with this tool.' },
                                                { label: 'Comparisons',   items: linkedContent.comparisons, href: (i: any) => `/compare/${i.slug}`,      emptyMsg: 'No comparisons include this tool.' },
                                                { label: 'Guides',        items: linkedContent.guides,      href: (i: any) => `/articles/${i.slug}`,     emptyMsg: 'No guide articles tagged with this tool.' },
                                                { label: 'Stacks',        items: linkedContent.stacks,      href: (i: any) => `/stacks/${i.slug}`,       emptyMsg: 'No stacks feature this tool.' },
                                                { label: 'News',          items: linkedContent.news,        href: (i: any) => `/articles/${i.slug}`,     emptyMsg: 'No news articles tagged with this tool.' },
                                                { label: 'Best-of',       items: linkedContent.bestOf,      href: (i: any) => `/articles/${i.slug}`,     emptyMsg: 'No best-of rankings include this tool.' },
                                                { label: 'Use Cases',     items: linkedContent.useCases,    href: (i: any) => `/use-cases/${i.slug}`,    emptyMsg: 'No use cases link to this tool.' },
                                            ];
                                            return sections.map(sec => (
                                                <div key={sec.label}>
                                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{sec.label}</p>
                                                    {sec.items.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {sec.items.map((item: any) => (
                                                                <a key={item.id || item._id || item.slug} href={sec.href(item)} target="_blank" rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 text-xs text-news-accent hover:underline truncate">
                                                                    <ExternalLink size={10} className="flex-shrink-0" />{item.title || item.name}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-yellow-500/50 bg-yellow-500/5 border border-yellow-500/15 rounded px-2 py-1">{sec.emptyMsg}</p>
                                                    )}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                )}

                                {/* bottom padding so content isn't hidden behind sticky bar */}
                                <div className="pb-20" />
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{tools.length} Tools</h3>
                            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                                {tools.map(t => (
                                    <div key={t.id || t._id} className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors">
                                        <div className="min-w-0 flex items-start gap-2">
                                            <div
                                                title={t.workflow_tags?.length ? `Workflow tags populated (${(t.workflow_tags as string[]).join(', ')})` : 'Workflow tags missing — regenerate this tool.'}
                                                className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${t.workflow_tags?.length ? 'bg-news-accent' : 'bg-gray-600'}`}
                                            />
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-white truncate">{t.name}</p>
                                                <p className="text-xs text-gray-500">{t.pricing_model} · {t.slug}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 ml-3">
                                            <button onClick={() => {
                                                setEditingToolId(t.id || t._id); setToolErrors({});
                                                const formVals = buildToolFormValues(t);
                                                // Auto-resolve unresolved names that now exist in the DB
                                                const rawUnresolvedRel: string[] = Array.isArray(t._unresolved_related) ? t._unresolved_related : [];
                                                const rawUnresolvedComp: string[] = Array.isArray(t._unresolved_competitors) ? t._unresolved_competitors : [];
                                                const resolvedRelIds: string[] = Array.isArray(formVals.related_tools) ? [...formVals.related_tools] : [];
                                                const resolvedCompIds: string[] = Array.isArray(formVals.competitors) ? [...formVals.competitors] : [];
                                                const stillUnresolvedRel: string[] = [];
                                                const stillUnresolvedComp: string[] = [];
                                                rawUnresolvedRel.forEach((name: string) => {
                                                    const match = tools.find((x: any) => x.name.toLowerCase() === name.toLowerCase());
                                                    if (match && !resolvedRelIds.includes(match.id || match._id)) resolvedRelIds.push(match.id || match._id);
                                                    else if (!match) stillUnresolvedRel.push(name);
                                                });
                                                rawUnresolvedComp.forEach((name: string) => {
                                                    const match = tools.find((x: any) => x.name.toLowerCase() === name.toLowerCase());
                                                    if (match && !resolvedCompIds.includes(match.id || match._id)) resolvedCompIds.push(match.id || match._id);
                                                    else if (!match) stillUnresolvedComp.push(name);
                                                });
                                                setToolForm({ ...formVals, related_tools: resolvedRelIds, competitors: resolvedCompIds });
                                                setUnresolvedRelated(stillUnresolvedRel);
                                                setUnresolvedCompetitors(stillUnresolvedComp);
                                                }} className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteTool(t.id || t._id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {tools.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No tools yet. Add your first one.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sticky save bar */}
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur border-t border-white/10 px-6 py-3 flex items-center gap-3">
                        <button onClick={handleSaveTool} disabled={!toolForm.name || toolLoading}
                            className="bg-news-accent hover:bg-news-accentHover text-black font-bold px-6 py-2 rounded-lg text-sm disabled:opacity-40 transition-colors">
                            {toolLoading ? 'Saving…' : editingToolId ? 'Update Tool' : 'Add Tool'}
                        </button>
                        {editingToolId && (
                            <button onClick={() => { setEditingToolId(null); setToolForm({ ...EMPTY_TOOL_FORM }); setToolErrors({}); }}
                                className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg text-sm hover:bg-zinc-700 transition-colors">
                                Cancel
                            </button>
                        )}
                        {toolErrors._success && (
                            <span className="text-xs font-bold text-green-400">{toolErrors._success}</span>
                        )}
                        {!toolErrors._success && Object.keys(toolErrors).length > 0 && (
                            <span className="text-xs font-bold text-red-400">
                                Fix {Object.keys(toolErrors).length} error{Object.keys(toolErrors).length > 1 ? 's' : ''} before saving
                            </span>
                        )}
                    </div>
                    </>
                )}

                {/* COMPARISONS TAB */}
                {cmsTab === 'comparisons' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Comparisons Database</h2>
                                <button onClick={() => setShowCompParser(p => !p)} className="flex items-center gap-2 px-3 py-1.5 bg-news-accent/10 border border-news-accent/30 text-news-accent rounded-lg text-xs font-bold hover:bg-news-accent/20 transition-colors">
                                    <Code2 size={12} /> {showCompParser ? 'Hide Parser' : 'Paste Tagged Input'}
                                </button>
                            </div>

                            {/* Parser Panel */}
                            {showCompParser && (
                                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-3">
                                    <p className="text-xs text-gray-400 font-mono">Paste <span className="text-news-accent">{'<<<FIELD>>>…<<<END_FIELD>>>'}</span> tagged input — config fields only, content is generated</p>
                                    <div className="text-[10px] text-gray-600 font-mono space-y-0.5">
                                        {['TITLE','SLUG','TOOL_A','TOOL_B','TOOL_C (optional)','PRIMARY_USE_CASE (optional)','META_TITLE','META_DESCRIPTION'].map(tag => (
                                            <div key={tag}>{'<<<'}{tag}{'>>>'} … {'<<<END_'}{tag.replace(' (optional)','').replace(/\s/g,'_')}{'>>>'}</div>
                                        ))}
                                    </div>
                                    <textarea value={compParseInput} onChange={e => setCompParseInput(e.target.value)} rows={8}
                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-news-accent resize-none"
                                        placeholder="Paste tagged comparison config here…" />
                                    {compParseErrors.length > 0 && (
                                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 space-y-1">
                                            {compParseErrors.map((e, i) => <p key={i} className="text-xs text-red-400">· {e}</p>)}
                                        </div>
                                    )}
                                    {compParseSuccess && <p className="text-xs text-green-400">✓ Fields loaded</p>}
                                    <button onClick={handleParseComparisonInput} className="w-full bg-news-accent hover:bg-news-accentHover text-black font-bold py-2 rounded-lg text-sm transition-colors">Parse Input</button>
                                </div>
                            )}

                            {/* Config Form */}
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-news-accent">{editingCompId ? 'Editing Comparison' : 'New Comparison'}</h3>
                                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">Configure → Generate → Publish</span>
                                </div>

                                {/* Stale warning */}
                                {editingCompId && comparisons.find(c => (c.id || c._id) === editingCompId)?.needs_update && (
                                    <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-700/40 rounded-lg px-3 py-2">
                                        <span className="text-amber-400 text-xs font-bold">⚠ Stale</span>
                                        <span className="text-xs text-amber-300/80">A linked tool was updated. Regenerate to reflect latest data.</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Title <span className="text-gray-600">(auto-filled on generate)</span></label>
                                        <input value={compForm.title || ''} onChange={e => setCompForm((p: any) => ({ ...p, title: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="ChatGPT vs Claude" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Slug <span className="text-gray-600">(auto-filled on generate)</span></label>
                                        <input value={compForm.slug || ''} onChange={e => setCompForm((p: any) => ({ ...p, slug: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-news-accent" placeholder="chatgpt-vs-claude" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {(['tool_a', 'tool_b', 'tool_c'] as const).map((key, i) => (
                                        <div key={key}>
                                            <label className="block text-xs text-gray-400 mb-1">Tool {String.fromCharCode(65 + i)} {i < 2 ? '*' : '(optional)'}</label>
                                            <select value={compForm[key] || ''} onChange={e => {
                                                setCompForm((p: any) => ({ ...p, [key]: e.target.value }));
                                                setCompPreview(null);
                                            }}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                                <option value="">— Select —</option>
                                                {tools.map((t: any) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Comparison Type</label>
                                        <select value={compForm.comparison_type || '1v1'} onChange={e => setCompForm((p: any) => ({ ...p, comparison_type: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                            <option value="1v1">1v1</option>
                                            <option value="multi">Multi (3 tools)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Generation Mode</label>
                                        <select value={compForm.generation_mode || 'dynamic'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompForm((p: any) => ({ ...p, generation_mode: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                            <option value="dynamic">Dynamic (live tool data)</option>
                                            <option value="cached">Cached (manual regen only)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-gray-400 mb-1">Use Case <span className="text-gray-600">(optional — leave blank for overall /compare/slug, set for /compare/slug/use-case)</span></label>
                                        <select value={compForm.use_case || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompForm((p: any) => ({ ...p, use_case: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                            <option value="">— None (overall comparison) —</option>
                                            {COMP_USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Meta Title</label>
                                        <input value={compForm.meta_title || ''} onChange={e => setCompForm((p: any) => ({ ...p, meta_title: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Status</label>
                                        <select value={compForm.status || 'published'} onChange={e => setCompForm((p: any) => ({ ...p, status: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                                    <textarea value={compForm.meta_description || ''} onChange={e => setCompForm((p: any) => ({ ...p, meta_description: e.target.value }))} rows={2}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none" />
                                </div>

                                {/* Override Mode toggle */}
                                <div className="flex items-center gap-3 py-2 border-t border-white/5">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" checked={compForm.is_override || false}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompForm((p: any) => ({ ...p, is_override: e.target.checked }))}
                                            className="w-4 h-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500" />
                                        <span className="text-xs text-gray-400 font-medium">Override Mode — blank fields use dynamic data from tool profiles</span>
                                    </label>
                                    {compForm.is_override && (
                                        <span className="text-xs bg-purple-900/60 text-purple-400 border border-purple-700/50 px-2 py-0.5 rounded font-bold">OVERRIDE MODE</span>
                                    )}
                                </div>

                                {/* Override content fields (visible when is_override=true) */}
                                {compForm.is_override && (
                                    <div className="space-y-3 p-4 bg-purple-900/10 border border-purple-700/20 rounded-xl">
                                        <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Override Fields — leave blank to use dynamic data</p>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Verdict Override <span className="text-gray-600">(plain text)</span></label>
                                            <textarea value={compForm.verdict_override || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompForm((p: any) => ({ ...p, verdict_override: e.target.value }))}
                                                placeholder={compPreview ? `Dynamic: "${compPreview.quick_verdict.summary}"` : 'Leave blank to use dynamic verdict'}
                                                rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400 resize-none placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Why It Wins <span className="text-gray-600">(optional)</span></label>
                                            <textarea value={compForm.why_it_wins_override || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompForm((p: any) => ({ ...p, why_it_wins_override: e.target.value }))}
                                                placeholder="A specific comparative reason why this tool beat the others in this comparison. Leave blank to hide this section. Write in plain language, 1–2 sentences maximum, explaining the comparative advantage over the specific tools being compared."
                                                rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400 resize-none placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Strengths Override <span className="text-gray-600">(JSON: {'{'}slug: ["item1","item2"]{'}'})</span></label>
                                            <textarea value={compForm.strengths_override || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompForm((p: any) => ({ ...p, strengths_override: e.target.value }))}
                                                placeholder='{"tool-slug": ["Strength 1", "Strength 2"]}'
                                                rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-400 resize-none placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Weaknesses Override <span className="text-gray-600">(JSON: {'{'}slug: ["item1"]{'}'})</span></label>
                                            <textarea value={compForm.weaknesses_override || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompForm((p: any) => ({ ...p, weaknesses_override: e.target.value }))}
                                                placeholder='{"tool-slug": ["Weakness 1"]}'
                                                rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-400 resize-none placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Feature Comparison Override <span className="text-gray-600">(JSON array of table rows)</span></label>
                                            <textarea value={compForm.feature_comparison_override || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompForm((p: any) => ({ ...p, feature_comparison_override: e.target.value }))}
                                                placeholder='[{"feature":"Custom Feature","values":{"slug-a":"Yes","slug-b":"No"},"winner_slug":"slug-a"}]'
                                                rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-400 resize-none placeholder-gray-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Recommendation Override <span className="text-gray-600">(JSON: {'{'}choose: {'{'}slug: ["reason"]{'}'}', summary: "..."{'}'})</span></label>
                                            <textarea value={compForm.recommendation_override || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompForm((p: any) => ({ ...p, recommendation_override: e.target.value }))}
                                                placeholder='{"choose":{"tool-slug":["Reason 1"]},"summary":"..."}'
                                                rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-400 resize-none placeholder-gray-600" />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2 flex-wrap">
                                    <button
                                        onClick={handleGenerateComparisonPreview}
                                        disabled={!compForm.tool_a || !compForm.tool_b || compPreviewLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm disabled:opacity-40 transition-colors">
                                        <Sparkles size={13} /> {compPreviewLoading ? 'Generating…' : compPreview ? 'Regenerate' : 'Preview Dynamic Output'}
                                    </button>
                                    <button onClick={handleSaveComparison} disabled={!compForm.title || !compForm.tool_a || !compForm.tool_b || compLoading}
                                        className="flex-1 bg-news-accent hover:bg-news-accentHover text-black font-bold py-2 rounded-lg text-sm disabled:opacity-40 transition-colors">
                                        {compLoading ? 'Saving…' : editingCompId ? 'Update' : 'Save Comparison'}
                                    </button>
                                    {compForm.slug && (
                                        <button onClick={() => window.open(`/compare/${compForm.slug}${compForm.use_case ? '/' + compForm.use_case.toLowerCase().replace(/\s+/g, '-') : ''}`, '_blank')}
                                            className="px-3 py-2 bg-zinc-800 text-gray-300 rounded-lg text-sm hover:bg-zinc-700 flex items-center gap-1.5">
                                            <ExternalLink size={12} />
                                        </button>
                                    )}
                                    {editingCompId && (
                                        <button onClick={() => { setEditingCompId(null); setCompForm({ ...EMPTY_COMP_FORM }); setCompParseErrors([]); setCompPreview(null); }}
                                            className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg text-sm hover:bg-zinc-700">Cancel</button>
                                    )}
                                </div>
                                {compPreviewError && <p className="text-xs text-red-400">⚠ {compPreviewError}</p>}
                            </div>

                            {/* Generated Preview Panel */}
                            {compPreview && (
                                <div className="bg-zinc-900 border border-blue-500/20 rounded-2xl p-6 space-y-5">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={13} className="text-blue-400" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Generated Preview</h3>
                                        <span className="text-[10px] text-gray-600 ml-auto">read-only — save to publish</span>
                                    </div>

                                    {/* Quick Verdict */}
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Quick Verdict</p>
                                        <p className="text-sm text-white font-medium">{compPreview.quick_verdict.summary}</p>
                                        <div className="flex gap-3 mt-3 flex-wrap">
                                            {Object.entries(compPreview.quick_verdict.scores_display).map(([slug, score]) => {
                                                const t = tools.find((x: any) => x.slug === slug);
                                                const isWinner = slug === compPreview.quick_verdict.winner_slug;
                                                return (
                                                    <div key={slug} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${isWinner ? 'bg-green-900/30 border-green-600/40 text-green-300' : 'bg-zinc-800 border-white/10 text-gray-300'}`}>
                                                        {isWinner && <span className="text-green-400">★</span>}
                                                        {t?.name || slug}: {score}/10
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Comparison Table */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Comparison Table</p>
                                        <div className="overflow-x-auto rounded-xl border border-white/5">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-zinc-800">
                                                        <th className="text-left px-3 py-2 text-gray-400 font-bold">Feature</th>
                                                        {[compForm.tool_a, compForm.tool_b, compForm.tool_c].filter(Boolean).map((slug: string) => (
                                                            <th key={slug} className="text-left px-3 py-2 text-gray-300 font-bold">{tools.find((x: any) => x.slug === slug)?.name || slug}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {compPreview.table.map((row, i) => (
                                                        <tr key={i} className="border-t border-white/5">
                                                            <td className="px-3 py-2 text-gray-400">{row.feature}</td>
                                                            {[compForm.tool_a, compForm.tool_b, compForm.tool_c].filter(Boolean).map((slug: string) => (
                                                                <td key={slug} className={`px-3 py-2 ${row.winner_slug === slug ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                                                    {row.values[slug] || '—'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Strengths / Weaknesses */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Strengths & Weaknesses</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[compForm.tool_a, compForm.tool_b, compForm.tool_c].filter(Boolean).map((slug: string) => {
                                                const sw = compPreview.strengths_weaknesses[slug];
                                                const t = tools.find((x: any) => x.slug === slug);
                                                return (
                                                    <div key={slug} className="bg-black/30 rounded-xl p-3 space-y-2">
                                                        <p className="text-xs font-bold text-white">{t?.name || slug}</p>
                                                        <div>
                                                            <p className="text-[10px] text-green-400 font-bold mb-1">Strengths</p>
                                                            {(sw?.strengths || []).slice(0, 3).map((s, i) => <p key={i} className="text-[10px] text-gray-400">+ {s}</p>)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-red-400 font-bold mb-1">Weaknesses</p>
                                                            {(sw?.weaknesses || []).slice(0, 3).map((s, i) => <p key={i} className="text-[10px] text-gray-400">− {s}</p>)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Decision */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Decision Block</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[compForm.tool_a, compForm.tool_b, compForm.tool_c].filter(Boolean).map((slug: string) => {
                                                const reasons = compPreview.decision.choose[slug] || [];
                                                const t = tools.find((x: any) => x.slug === slug);
                                                return (
                                                    <div key={slug} className="bg-black/30 rounded-xl p-3">
                                                        <p className="text-xs font-bold text-white mb-2">Choose {t?.name || slug} if…</p>
                                                        {reasons.slice(0, 3).map((r, i) => <p key={i} className="text-[10px] text-gray-400">· {r}</p>)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List sidebar */}
                        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{comparisons.length} Comparisons</h3>
                                <button onClick={() => { setEditingCompId(null); setCompPreview(null); setCompForm({ ...EMPTY_COMP_FORM, is_override: true }); }}
                                    className="text-xs px-2.5 py-1 bg-purple-900/50 text-purple-400 border border-purple-700/40 rounded-lg hover:bg-purple-800/50 font-bold">
                                    + Override Record
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[80vh] overflow-y-auto pr-1">
                                {comparisons.map(c => (
                                    <div key={c.id || c._id} className={`flex items-center justify-between rounded-xl px-4 py-3 hover:border-white/10 transition-colors border ${c.needs_update ? 'bg-amber-950/20 border-amber-700/30' : 'bg-zinc-900 border-white/5'}`}>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-white truncate">{c.title}</p>
                                                {(c as any).is_override && (
                                                    <span className="text-xs bg-purple-900/60 text-purple-400 border border-purple-700/50 px-1.5 py-0.5 rounded font-bold flex-shrink-0">OVERRIDE</span>
                                                )}
                                                {c.needs_update && (
                                                    <span className="text-xs bg-amber-900/60 text-amber-400 border border-amber-700/50 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Stale</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {c.slug}
                                                {c.generation_mode === 'cached' && <span className="ml-1 text-zinc-600">· cached</span>}
                                                {c.last_generated && <span className="ml-1 text-zinc-600">· gen {new Date(c.last_generated).toLocaleDateString()}</span>}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 ml-3">
                                            <button onClick={() => {
                                                setEditingCompId(c.id || c._id);
                                                setCompPreview(null);
                                                setCompForm({
                                                    ...EMPTY_COMP_FORM,
                                                    title:            c.title            || '',
                                                    slug:             c.slug             || '',
                                                    tool_a:           c.tool_a_slug      || c.tool_a || '',
                                                    tool_b:           c.tool_b_slug      || c.tool_b || '',
                                                    tool_c:           c.tool_c_slug      || c.tool_c || '',
                                                    comparison_type:  c.comparison_type  || '1v1',
                                                    use_case:          c.use_case || (Array.isArray(c.primary_use_cases) ? c.primary_use_cases[0] : '') || c.primary_use_case || '',
                                                    generation_mode:  c.generation_mode  || 'dynamic',
                                                    meta_title:       c.meta_title       || '',
                                                    meta_description: c.meta_description || '',
                                                    status:           c.status           || 'published',
                                                    is_override:      (c as any).is_override || false,
                                                    verdict_override: (c as any).verdict_override || '',
                                    why_it_wins_override: (c as any).why_it_wins_override || '',
                                                    strengths_override: (c as any).strengths_override ? JSON.stringify((c as any).strengths_override, null, 2) : '',
                                                    weaknesses_override: (c as any).weaknesses_override ? JSON.stringify((c as any).weaknesses_override, null, 2) : '',
                                                    recommendation_override: (c as any).recommendation_override ? JSON.stringify((c as any).recommendation_override, null, 2) : '',
                                                    feature_comparison_override: (c as any).feature_comparison_override ? JSON.stringify((c as any).feature_comparison_override, null, 2) : '',
                                                    use_case_breakdown_override: (c as any).use_case_breakdown_override ? JSON.stringify((c as any).use_case_breakdown_override, null, 2) : '',
                                                });
                                                setCompParseErrors([]);
                                            }} className="p-1.5 text-gray-500 hover:text-blue-400"><Edit size={14} /></button>
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

            {/* STACKS TAB */}
            {cmsTab === 'stacks' && (
                <div className="grid grid-cols-12 gap-6">
                    {/* Editor */}
                    <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Stacks Database</h2>
                            <button onClick={() => setShowStackParser(p => !p)} className="flex items-center gap-2 px-3 py-1.5 bg-news-accent/10 border border-news-accent/30 text-news-accent rounded-lg text-xs font-bold hover:bg-news-accent/20 transition-colors">
                                <Code2 size={12} /> {showStackParser ? 'Hide Parser' : 'Paste Tagged Input'}
                            </button>
                        </div>

                        {/* Parser Panel */}
                        {showStackParser && (
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-3">
                                <p className="text-xs text-gray-400 font-mono">Paste <span className="text-news-accent">{'<<<FIELD>>>…<<<END_FIELD>>>'}</span> tagged stack input</p>
                                <div className="text-[10px] text-gray-600 font-mono space-y-0.5">
                                    {['NAME','SLUG','WORKFLOW_CATEGORY','SHORT_DESCRIPTION','FULL_DESCRIPTION','TOOLS','WORKFLOW_STEPS','WHY_IT_WORKS','WHO_ITS_FOR','NOT_FOR','SETUP_TIME_HOURS','HERO_IMAGE','META_TITLE','META_DESCRIPTION'].map(tag => (
                                        <div key={tag} className="text-gray-600">{'<<<'}{tag}{'>>>'} … {'<<<END_'}{tag}{'>>>'}</div>
                                    ))}
                                </div>
                                <textarea value={stackParseInput} onChange={e => setStackParseInput(e.target.value)} rows={10}
                                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-news-accent resize-none"
                                    placeholder="Paste AI-generated tagged stack content here…" />
                                {stackParseErrors.length > 0 && (
                                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 space-y-1">
                                        {stackParseErrors.map((e, i) => <p key={i} className="text-xs text-red-400">· {e}</p>)}
                                    </div>
                                )}
                                {stackParseSuccess && <p className="text-xs text-green-400">✓ Fields loaded from parsed input</p>}
                                <button onClick={handleParseStackInput} className="w-full bg-news-accent hover:bg-news-accentHover text-black font-bold py-2 rounded-lg text-sm transition-colors">Parse Input</button>
                            </div>
                        )}

                        {/* Form */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-news-accent">{editingStackId ? 'Editing Stack' : 'New Stack'}</h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Name *</label>
                                    <input value={stackForm.name || ''} onChange={e => setStackForm((p: any) => ({ ...p, name: e.target.value, slug: p.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="The Startup Content Stack" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Slug *</label>
                                    <input value={stackForm.slug || ''} onChange={e => setStackForm((p: any) => ({ ...p, slug: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-news-accent" placeholder="startup-content-stack" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Workflow Category *</label>
                                <select value={stackForm.workflow_category || ''} onChange={e => setStackForm((p: any) => ({ ...p, workflow_category: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                    <option value="">— Select category —</option>
                                    {['Marketing','Development','Startup Operations','Content Creation','Sales','Design','Data & Analytics','Customer Support','Education','Finance','HR & Recruiting','Research','Productivity','Other'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Short Description * <span className="text-gray-600">(10–40 words)</span></label>
                                <textarea value={stackForm.short_description || ''} onChange={e => setStackForm((p: any) => ({ ...p, short_description: e.target.value }))} rows={2}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none" />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Full Description</label>
                                <textarea value={stackForm.full_description || ''} onChange={e => setStackForm((p: any) => ({ ...p, full_description: e.target.value }))} rows={4}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none" />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Tools <span className="text-gray-600">(one slug per line)</span></label>
                                <textarea value={stackForm.tools || ''} onChange={e => setStackForm((p: any) => ({ ...p, tools: e.target.value }))} rows={4}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-news-accent resize-none"
                                    placeholder={"notion\nslack\nlinear"} />
                                {/* Unresolved tool slugs check */}
                                {stackForm.tools && (() => {
                                    const slugs = stackForm.tools.split('\n').map((s: string) => s.trim()).filter(Boolean);
                                    const unresolved = slugs.filter((s: string) => !tools.some((t: any) => t.slug === s || t.id === s));
                                    return unresolved.length > 0 ? (
                                        <div className="mt-1 space-y-1">
                                            <p className="text-[10px] text-yellow-500/60 uppercase tracking-widest font-bold">Not yet in CMS</p>
                                            {unresolved.map((s: string) => (
                                                <div key={s} className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded px-2 py-1">
                                                    <span className="text-xs text-yellow-400/80 font-mono">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Workflow Steps <span className="text-gray-600">(blank line between steps; first line = title; Tools: slug1, slug2)</span></label>
                                <textarea value={stackForm.workflow_steps || ''} onChange={e => setStackForm((p: any) => ({ ...p, workflow_steps: e.target.value }))} rows={8}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-news-accent resize-none"
                                    placeholder={"Step 1: Write & plan content\nDraft outlines and long-form posts using AI\nTools: notion, chatgpt\n\nStep 2: Publish & distribute\nSchedule posts across channels\nTools: buffer, zapier"} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Why It Works <span className="text-gray-600">(one per line)</span></label>
                                    <textarea value={stackForm.why_it_works || ''} onChange={e => setStackForm((p: any) => ({ ...p, why_it_works: e.target.value }))} rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Who It's For <span className="text-gray-600">(one per line)</span></label>
                                    <textarea value={stackForm.who_its_for || ''} onChange={e => setStackForm((p: any) => ({ ...p, who_its_for: e.target.value }))} rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Not For <span className="text-gray-600">(one per line)</span></label>
                                    <textarea value={stackForm.not_for || ''} onChange={e => setStackForm((p: any) => ({ ...p, not_for: e.target.value }))} rows={2}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Setup Time (hours)</label>
                                    <input type="number" value={stackForm.setup_time_hours || ''} onChange={e => setStackForm((p: any) => ({ ...p, setup_time_hours: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" placeholder="2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Hero Image URL</label>
                                <input value={stackForm.hero_image || ''} onChange={e => setStackForm((p: any) => ({ ...p, hero_image: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-news-accent" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                                    <select value={stackForm.status || 'Published'} onChange={e => setStackForm((p: any) => ({ ...p, status: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent">
                                        <option value="Published">Published</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-5">
                                    <input type="checkbox" id="stack-featured" checked={!!stackForm.featured} onChange={e => setStackForm((p: any) => ({ ...p, featured: e.target.checked }))} className="accent-news-accent" />
                                    <label htmlFor="stack-featured" className="text-xs text-gray-400">Featured</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Meta Title</label>
                                <input value={stackForm.meta_title || ''} onChange={e => setStackForm((p: any) => ({ ...p, meta_title: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                                <textarea value={stackForm.meta_description || ''} onChange={e => setStackForm((p: any) => ({ ...p, meta_description: e.target.value }))} rows={2}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-news-accent resize-none" />
                            </div>

                            {stackParseErrors.length > 0 && (
                                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 space-y-1">
                                    {stackParseErrors.map((e, i) => <p key={i} className="text-xs text-red-400">· {e}</p>)}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button onClick={handleSaveStack} disabled={!stackForm.name || !stackForm.slug || !stackForm.workflow_category || stackLoading}
                                    className="flex-1 bg-news-accent hover:bg-news-accentHover text-black font-bold py-2 rounded-lg text-sm disabled:opacity-40 transition-colors">
                                    {stackLoading ? 'Saving…' : editingStackId ? 'Update Stack' : 'Add Stack'}
                                </button>
                                {editingStackId && (
                                    <button onClick={() => { setEditingStackId(null); setStackForm({ ...EMPTY_STACK_FORM }); setStackParseErrors([]); }}
                                        className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg text-sm hover:bg-zinc-700">Cancel</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stack list sidebar */}
                    <div className="col-span-12 lg:col-span-5 xl:col-span-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{stacks.length} Stacks</h3>
                        <div className="space-y-2 max-h-[80vh] overflow-y-auto pr-1">
                            {stacks.map((s: any) => (
                                <div key={s.id || s._id} className="flex items-center justify-between bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors">
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-white truncate">{s.name}</p>
                                        <p className="text-xs text-gray-500">{s.workflow_category} · {s.slug}</p>
                                        <p className="text-xs text-gray-600">{Array.isArray(s.tools) ? s.tools.length : 0} tools</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 ml-3">
                                        <button onClick={() => {
                                            setEditingStackId(s.id || s._id);
                                            setStackForm({
                                                ...EMPTY_STACK_FORM, ...s,
                                                tools: Array.isArray(s.tools) ? s.tools.join('\n') : (s.tools || ''),
                                                why_it_works: Array.isArray(s.why_it_works) ? s.why_it_works.join('\n') : (s.why_it_works || ''),
                                                who_its_for:  Array.isArray(s.who_its_for)  ? s.who_its_for.join('\n')  : (s.who_its_for  || ''),
                                                not_for:      Array.isArray(s.not_for)      ? s.not_for.join('\n')      : (s.not_for      || ''),
                                                workflow_steps: Array.isArray(s.workflow_steps)
                                                    ? s.workflow_steps.map((ws: any) => `${ws.title}\n${ws.description || ''}${ws.tool_slugs?.length ? '\nTools: ' + ws.tool_slugs.join(', ') : ''}`).join('\n\n')
                                                    : (s.workflow_steps || ''),
                                                setup_time_hours: s.setup_time_hours?.toString() || '',
                                            });
                                            setStackParseErrors([]);
                                        }} className="p-1.5 text-gray-500 hover:text-blue-400"><Edit size={14} /></button>
                                        <button onClick={() => handleDeleteStack(s.id || s._id)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {stacks.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No stacks yet.</p>}
                        </div>
                    </div>
                </div>
            )}

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

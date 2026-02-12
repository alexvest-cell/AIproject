
import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Save, Plus, Download, Upload, Calendar, Eye, EyeOff, Sparkles, Image as ImageIcon, Clock, Copy, FileImage, Volume2, Loader2, ArrowLeft, LogOut, Search, Headphones, ExternalLink, ArrowRight } from 'lucide-react';
import { generateSlug } from '../utils/slugify';
import { Article } from '../types';
import { newsArticles as staticArticles } from '../data/content';
import AdminLogin from './AdminLogin';

interface AdminDashboardProps {
    onBack: () => void;
}


const CATEGORIES = ['Climate Change', 'Energy', 'Pollution', 'Policy & Economics', 'Oceans', 'Biodiversity', 'Conservation', 'Solutions', 'Guides'];

const CATEGORY_COLORS: Record<string, string> = {
    'Climate Change': 'text-red-400',
    'Energy': 'text-yellow-400',
    'Pollution': 'text-gray-400',
    'Policy & Economics': 'text-blue-400',
    'Oceans': 'text-cyan-400',
    'Biodiversity': 'text-green-400',
    'Conservation': 'text-emerald-400',
    'Solutions': 'text-purple-400',
    'Guides': 'text-news-accent'
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

    // Form State
    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        category: ['Climate Change'],
        topic: '',
        excerpt: '',
        content: [],
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        originalReadTime: '5 min read',
        imageUrl: '',
        audioUrl: '',
        voiceoverText: '',
        contextBox: {
            title: '',
            content: '',
            source: ''
        },
        sources: [],
        status: 'draft', // Default to draft for new articles
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
        const suffix = "Read on planetarybrief.com";
        let finalText = text.trim();
        if (!finalText.includes(suffix)) {
            finalText = finalText + "\n\n" + suffix;
        }
        navigator.clipboard.writeText(finalText);
        alert('Copied to clipboard!');
    };

    const handlePostIntent = (platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok', text: string) => {
        const suffix = "Read on planetarybrief.com";
        let finalText = text.trim();
        if (!finalText.includes(suffix)) {
            finalText = finalText + "\n\n" + suffix;
        }

        const encodedText = encodeURIComponent(finalText);
        const articleUrl = `https://planetarybrief.com/article/${formData.id || ''}`;
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
        ctx.strokeStyle = "#10b981";
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

        const briefMetrics = ctx.measureText("BRIEF.COM");
        const planetaryMetrics = ctx.measureText("PLANETARY");
        const totalBrandWidth = planetaryMetrics.width + briefMetrics.width;

        // Position at bottom left with some margin
        const bx = margin;
        const by = canvas.height - margin;

        ctx.fillStyle = "#10b981";
        ctx.fillText("PLANETARY", bx, by);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("BRIEF.COM", bx + planetaryMetrics.width, by);
        ctx.restore();


        // Trigger Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `planetary-brief-${platform}-${Date.now()}.png`;
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
            delete cleanArticle.id;
            delete (cleanArticle as any)._id;
            delete (cleanArticle as any)._isStatic;
            delete (cleanArticle as any).createdAt;
            delete (cleanArticle as any).updatedAt;
            delete (cleanArticle as any).__v;

            setEditingId(null); // This ensures POST, not PUT
            setFormData(cleanArticle);
        } else {
            setEditingId(article.id);
            setFormData(article);
        }
        setSeoKeywords(article.keywords ? article.keywords.join(', ') : '');
        window.scrollTo(0, 0);
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
                        <span className="w-2 h-2 rounded-full bg-news-accent shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        CMS Dashboard
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                    <span>STATUS: {loading ? 'SAVING...' : 'READY'}</span>
                    <span>|</span>
                    <span className={`flex items-center gap-2 ${dbOnline ? 'text-emerald-500' : 'text-orange-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dbOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'} animate-pulse`}></span>
                        DB: {dbOnline ? 'LIVE' : 'FALLBACK'}
                    </span>
                    <span>|</span>
                    <button
                        onClick={handleBackupDownload}
                        className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
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

            <div className="w-full max-w-[1800px] mx-auto h-full pt-6">
                <div className="grid grid-cols-12 gap-6 h-full">

                    {/* LEFT COLUMN: LIST (3/12 columns on large screens) -- MOVED TO RIGHT? No, usually Editor is Main. 
                        User had Editor Left, List Right. I will keep that.
                        Actually, standard CMS has sidebar left.
                        But code had Editor (col-span-2) and List (col-span-1).
                        I'll keep Editor as the MAIN focus (Left/Center) and List as sidebar (Right).
                    */}

                    {/* MAIN EDITOR AREA */}
                    <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">

                        {/* AI ORCHESTRATOR PANEL */}
                        <div className="bg-gradient-to-r from-emerald-950/20 to-zinc-900 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                                <Sparkles size={150} className="text-emerald-400 rotate-12" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={14} /> AI Assistant
                                        <span className="text-zinc-600">|</span>
                                        <select
                                            value={aiModel}
                                            onChange={(e) => setAiModel(e.target.value)}
                                            className="bg-black/40 border border-emerald-500/20 rounded px-2 py-0.5 text-[10px] text-emerald-400 focus:outline-none focus:border-emerald-500/50"
                                        >
                                            <optgroup label="Google Gemini" className="bg-zinc-900">
                                                <option value="gemini-1.5-flash-latest">1.5 Flash (Fast)</option>
                                                <option value="gemini-1.5-pro-latest">1.5 Pro (Precision)</option>
                                                <option value="gemini-2.0-flash-exp">2.0 Flash (Next-Gen)</option>
                                            </optgroup>
                                            <optgroup label="OpenAI (Fallback)" className="bg-zinc-900">
                                                <option value="gpt-4o">GPT-4o (Reliable)</option>
                                                <option value="gpt-4o-mini">GPT-4o-mini (Speed)</option>
                                            </optgroup>
                                        </select>
                                        <span className="text-zinc-600">|</span>
                                        <button
                                            onClick={() => setShowImport(!showImport)}
                                            className="text-white/50 hover:text-white transition-colors text-xs flex items-center gap-1"
                                        >
                                            <Upload size={12} /> Import Text
                                        </button>
                                    </h2>

                                    {showImport && (
                                        <div className="bg-black/80 border border-zinc-700/50 p-4 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-xs font-bold text-zinc-400 uppercase">Paste Formatted Text</h3>
                                                <button onClick={() => setShowImport(false)} className="text-zinc-500 hover:text-white text-xs">Close</button>
                                            </div>
                                            <textarea
                                                className="w-full h-48 bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 text-xs font-mono text-zinc-300 focus:border-emerald-500/50 outline-none resize-none"
                                                placeholder={`<<<HEADLINE>>>\nTitle here\n<<<END_HEADLINE>>>\n\n<<<META>>>\nDescription here\n<<<END_META>>>\n...`}
                                                value={importText}
                                                onChange={(e) => setImportText(e.target.value)}
                                            />
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={handleImport}
                                                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                                >
                                                    <Sparkles size={12} /> Parse & Populate
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <textarea
                                        className="w-full bg-black/40 border border-emerald-500/20 p-4 rounded-xl text-emerald-100 h-24 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all resize-none text-sm placeholder-emerald-800/50"
                                        placeholder="Command the AI agent (e.g. 'Write a breaking news piece on arctic drilling...')"
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        <select
                                            className="bg-black/40 border border-emerald-500/20 p-2 rounded-lg text-xs text-emerald-400 outline-none hover:bg-emerald-500/10 cursor-pointer"
                                            value={aiModel}
                                            onChange={e => setAiModel(e.target.value)}
                                        >
                                            <optgroup label="Google Gemini" className="bg-zinc-900">
                                                <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash</option>
                                                <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro</option>
                                                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                                            </optgroup>
                                            <optgroup label="OpenAI" className="bg-zinc-900">
                                                <option value="gpt-4o">GPT-4o</option>
                                                <option value="gpt-4o-mini">GPT-4o-mini</option>
                                            </optgroup>
                                        </select>

                                        {/* Length Selectors */}
                                        <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/20 p-2 rounded-lg">
                                            <span className="text-[10px] text-emerald-500/60 uppercase font-bold">Length:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={minMinutes}
                                                onChange={e => setMinMinutes(parseInt(e.target.value) || 1)}
                                                className="w-12 bg-black/60 border border-emerald-500/20 rounded px-2 py-1 text-xs text-emerald-400 outline-none text-center"
                                            />
                                            <span className="text-emerald-500/40">-</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={maxMinutes}
                                                onChange={e => setMaxMinutes(parseInt(e.target.value) || 1)}
                                                className="w-12 bg-black/60 border border-emerald-500/20 rounded px-2 py-1 text-xs text-emerald-400 outline-none text-center"
                                            />
                                            <span className="text-[10px] text-emerald-500/60">min</span>
                                        </div>

                                        <button
                                            onClick={() => handleAiGenerate('full')}
                                            disabled={aiLoading}
                                            className="ml-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-6 rounded-lg text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            {aiLoading ? 'Generating...' : 'Generate Article'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                    <div className="md:col-span-4 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Topic Tag</label>
                                        <input
                                            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:border-news-accent outline-none"
                                            placeholder="e.g. Solar"
                                            value={formData.topic}
                                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                        />
                                    </div>
                                </div>

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
                                            <div className="flex gap-4">
                                                <input
                                                    className="flex-1 bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:border-news-accent outline-none"
                                                    value={formData.imageUrl}
                                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                    placeholder="Valid Image URL..."
                                                />
                                                <label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors">
                                                    <Upload size={16} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                </label>
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

                                    {/* AUDIO NARRATION */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <Headphones size={14} className="text-emerald-500" />
                                            Audio Narration
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <label className="flex-1 cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept=".mp3,.wav,.m4a"
                                                        onChange={handleAudioUpload}
                                                        className="hidden"
                                                    />
                                                    <div className="bg-zinc-950/30 border border-white/10 hover:border-emerald-500/30 rounded-lg p-3 text-xs text-center text-white hover:text-emerald-400 transition-all flex items-center justify-center gap-2">
                                                        <Upload size={14} />
                                                        Upload Audio
                                                    </div>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateAudio}
                                                    disabled={audioLoading || !editingId}
                                                    className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/40 disabled:bg-zinc-800 disabled:text-zinc-600 text-emerald-400 border border-emerald-500/30 px-3 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    {audioLoading ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles size={14} />
                                                            Generate Audio
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            {formData.audioUrl && (
                                                <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Headphones size={12} className="text-emerald-500" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Audio Ready</span>
                                                    </div>
                                                    <audio controls className="w-full" src={formData.audioUrl}></audio>
                                                </div>
                                            )}

                                            {/* Voiceover Text Field */}
                                            <div className="space-y-2 mt-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                        Voiceover Script (Auto-extracted from VO tags)
                                                    </label>
                                                    {formData.voiceoverText && (
                                                        <span className="text-[9px] text-emerald-500 font-mono">
                                                            {formData.voiceoverText.length} chars
                                                        </span>
                                                    )}
                                                </div>
                                                <textarea
                                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:border-emerald-500 outline-none h-32 font-mono text-xs leading-relaxed"
                                                    value={formData.voiceoverText || ''}
                                                    onChange={e => setFormData({ ...formData, voiceoverText: e.target.value })}
                                                    placeholder="Voiceover text will be auto-extracted from content between <<<VO>>> and <<<END_VO>>> tags, or you can manually enter it here..."
                                                />
                                                <p className="text-[9px] text-zinc-600 italic">
                                                    This text will be used for audio generation instead of the full article.
                                                </p>
                                            </div>
                                        </div>
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

                                    {/* SOCIAL MEDIA TRANSFORMER */}
                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    <Sparkles size={12} className="text-blue-400" /> Social Transformer
                                                </h3>
                                                <select
                                                    value={aiModel}
                                                    onChange={(e) => setAiModel(e.target.value)}
                                                    className="bg-black/40 border border-blue-500/20 rounded px-2 py-1 text-[9px] text-blue-400 focus:outline-none focus:border-blue-500/50 uppercase tracking-tighter"
                                                >
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
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleSocialGenerate()}
                                                disabled={socialLoading}
                                                className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 flex items-center gap-2 transition-all"
                                            >
                                                {socialLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                {socialLoading ? 'Generating...' : 'Generate New Posts'}
                                            </button>
                                        </div>

                                        {/* Image Offset Controls */}
                                        <div className="flex gap-4 items-center bg-black/40 border border-blue-500/10 p-3 rounded-lg transition-all hover:border-blue-500/30">
                                            <div className="flex-1 space-y-1">
                                                <label className="text-[9px] font-bold text-blue-500/60 uppercase flex justify-between items-center">
                                                    <span>Position Horizontal</span>
                                                    <span className="font-mono bg-blue-500/20 px-1 rounded text-blue-400">{formData.imageOffsetX || 0}%</span>
                                                </label>
                                                <input
                                                    type="range" min="-50" max="50"
                                                    value={formData.imageOffsetX || 0}
                                                    onChange={e => setFormData({ ...formData, imageOffsetX: parseInt(e.target.value) })}
                                                    className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="w-px h-8 bg-white/5 mx-2" />
                                            <div className="flex-1 space-y-1">
                                                <label className="text-[9px] font-bold text-blue-500/60 uppercase flex justify-between items-center">
                                                    <span>Position Vertical</span>
                                                    <span className="font-mono bg-blue-500/20 px-1 rounded text-blue-400">{formData.imageOffsetY || 0}%</span>
                                                </label>
                                                <input
                                                    type="range" min="-50" max="50"
                                                    value={formData.imageOffsetY || 0}
                                                    onChange={e => setFormData({ ...formData, imageOffsetY: parseInt(e.target.value) })}
                                                    className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {socialPosts && (
                                            <div className="space-y-3">
                                                {/* Tabs */}
                                                <div className="flex border-b border-white/5">
                                                    {(['instagram', 'facebook', 'twitter', 'tiktok'] as const).map(platform => (
                                                        <button
                                                            type="button"
                                                            key={platform}
                                                            onClick={() => setActiveSocialTab(platform)}
                                                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors border-b-2
                                                            ${activeSocialTab === platform
                                                                    ? 'border-blue-500 text-blue-400'
                                                                    : 'border-transparent text-zinc-600 hover:text-white'
                                                                }`}
                                                        >
                                                            {platform}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Active Tab Content */}
                                                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                                            {activeSocialTab} Copy
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <button
                                                                type="button"
                                                                // @ts-ignore
                                                                onClick={() => copyToClipboard(socialPosts[activeSocialTab]?.text || '')}
                                                                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                                                                title="Copy Text"
                                                            >
                                                                <Copy size={12} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                // @ts-ignore
                                                                onClick={() => handlePostIntent(activeSocialTab, socialPosts[activeSocialTab]?.text || '')}
                                                                className="p-1 hover:bg-white/10 rounded text-blue-400 hover:text-blue-300 transition-colors"
                                                                title="Post Now"
                                                            >
                                                                <ExternalLink size={12} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto bg-black/30 p-2 rounded mb-3">
                                                        {/* @ts-ignore */}
                                                        {socialPosts[activeSocialTab]?.text || "No content generated."}
                                                    </p>

                                                    {/* Graphic Generator for this platform */}
                                                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`border border-white/10 bg-white/5 flex items-center justify-center rounded-sm transition-all duration-300
                                                            ${activeSocialTab === 'instagram' ? 'w-6 h-8' : // 4:5
                                                                    activeSocialTab === 'tiktok' ? 'w-6 h-10' : // 9:16
                                                                        'w-10 h-5' // 1.91:1
                                                                }`}>
                                                                <ImageIcon size={10} className="text-zinc-600" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-zinc-400">Targeted Graphic</span>
                                                                <span className="text-[9px] text-zinc-600">
                                                                    Replaces current main image
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => generateSocialImage(activeSocialTab)}
                                                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] rounded flex items-center gap-1 transition-colors border border-white/10"
                                                        >
                                                            <Download size={10} /> Generate
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 text-[9px] text-zinc-600 font-mono truncate">
                                                        Headline: <span className="text-zinc-500">
                                                            {/* @ts-ignore */}
                                                            {socialPosts[activeSocialTab]?.headline || formData.title}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!socialPosts && (
                                            <div className="text-center py-8 border border-dashed border-white/10 rounded-lg bg-white/[0.02]">
                                                <Sparkles size={16} className="text-zinc-700 mx-auto mb-2" />
                                                <p className="text-[10px] text-zinc-600">
                                                    Select an article and click "Generate New Posts" to create optimized content for 4 platforms.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Generate Audio Button */}
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleGenerateAudio}
                                            disabled={audioLoading}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex justify-center items-center gap-2 mb-3"
                                        >
                                            {audioLoading ? <Loader2 size={16} className="animate-spin" /> : <Headphones size={16} />}
                                            {audioLoading ? 'Generating Audio...' : (formData.audioUrl ? 'Regenerate Audio' : 'Generate Audio')}
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-news-accent text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-400 hover:scale-[1.01] transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex justify-center items-center gap-2"
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
            </div>
        </div>
    );
};

export default AdminDashboard;

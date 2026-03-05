import { Tool, ToolPageData } from '../types';

const API_BASE = '/api';

export async function fetchTools(filters?: {
    category?: string;
    pricing?: string;
    use_case?: string;
    search?: string;
}): Promise<Tool[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.pricing) params.set('pricing', filters.pricing);
    if (filters?.use_case) params.set('use_case', filters.use_case);
    if (filters?.search) params.set('search', filters.search);

    const url = `${API_BASE}/tools${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch tools');
    return res.json();
}

export async function fetchToolBySlug(slug: string): Promise<ToolPageData> {
    const res = await fetch(`${API_BASE}/tools/${slug}`);
    if (!res.ok) throw new Error(`Tool not found: ${slug}`);
    const data = await res.json();

    // HOTFIX: The user's backend process is stale and returning the raw tool object. 
    // This safely wraps it to match the expected ToolPageData interface.
    if ((data._id || data.id) && !data.tool) {
        return { tool: data, comparisons: [], relatedArticles: [] };
    }

    return data;
}

export async function createTool(data: Partial<Tool>, token: string): Promise<Tool> {
    const res = await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create tool');
    return res.json();
}

export async function updateTool(id: string, data: Partial<Tool>, token: string): Promise<Tool> {
    const res = await fetch(`${API_BASE}/tools/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update tool');
    return res.json();
}

export async function deleteTool(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tools/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete tool');
}

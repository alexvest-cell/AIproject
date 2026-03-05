import { Comparison } from '../types';

const API_BASE = '/api';

export async function fetchComparisons(): Promise<Comparison[]> {
    const res = await fetch(`${API_BASE}/comparisons`);
    if (!res.ok) throw new Error('Failed to fetch comparisons');
    return res.json();
}

export async function fetchComparisonBySlug(slug: string): Promise<Comparison> {
    const res = await fetch(`${API_BASE}/comparisons/${slug}`);
    if (!res.ok) throw new Error(`Comparison not found: ${slug}`);
    return res.json();
}

export async function createComparison(data: Partial<Comparison>, token: string): Promise<Comparison> {
    const res = await fetch(`${API_BASE}/comparisons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create comparison');
    return res.json();
}

export async function updateComparison(id: string, data: Partial<Comparison>, token: string): Promise<Comparison> {
    const res = await fetch(`${API_BASE}/comparisons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update comparison');
    return res.json();
}

export async function deleteComparison(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/comparisons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete comparison');
}

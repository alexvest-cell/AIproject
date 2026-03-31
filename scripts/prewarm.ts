// scripts/prewarm.ts
const BASE_URL = process.env.PREWARM_URL || 'https://toolcurrent.com';
const CONCURRENCY = 5;
const DELAY_MS = 100;

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        await fetch(url, { signal: controller.signal });
        console.log(`✓ ${url}`);
    } catch (error) {
        console.log(`✗ ${url} — ${error}`);
    } finally {
        clearTimeout(timeout);
    }
}

async function warmBatch(urls: string[]): Promise<void> {
    await Promise.all(urls.map(url => fetchWithTimeout(url)));
}

async function prewarm() {
    console.log(`Starting pre-warm for ${BASE_URL}`);

    const toolsResponse = await fetch(`${BASE_URL}/api/tools`);
    const tools = await toolsResponse.json();

    console.log(`Found ${tools.length} tools`);

    const urls: string[] = [];

    for (const tool of tools) {
        for (const competitor of tool.competitors || []) {
            const competitorSlug = (competitor as string).toLowerCase().replace(/\s+/g, '-');

            urls.push(`${BASE_URL}/compare/${tool.slug}-vs-${competitorSlug}`);

            for (const ucEntry of tool.use_case_scores || []) {
                const uc = (ucEntry.use_case as string)?.toLowerCase().replace(/\s+/g, '-');
                if (uc) urls.push(`${BASE_URL}/compare/${tool.slug}-vs-${competitorSlug}/${uc}`);
            }
        }

        for (const workflow of tool.workflow_tags || []) {
            const workflowSlug = (workflow as string).toLowerCase().replace(/\s+/g, '-');
            urls.push(`${BASE_URL}/best-software/for/${workflowSlug}`);
        }

        if (tool.category_primary) {
            const categorySlug = (tool.category_primary as string).toLowerCase().replace(/\s+/g, '-');
            urls.push(`${BASE_URL}/best-software/${categorySlug}`);
        }
    }

    const uniqueUrls = [...new Set(urls)];
    console.log(`Pre-warming ${uniqueUrls.length} pages...`);

    for (let i = 0; i < uniqueUrls.length; i += CONCURRENCY) {
        const batch = uniqueUrls.slice(i, i + CONCURRENCY);
        await warmBatch(batch);
        if (i + CONCURRENCY < uniqueUrls.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    console.log(`Pre-warming complete — ${uniqueUrls.length} pages warmed`);
}

prewarm().catch(console.error);

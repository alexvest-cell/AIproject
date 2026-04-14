/**
 * stackParser.js
 * Deterministic parser for <<<FIELD>>>...<<<END_FIELD>>> tagged stack input.
 */

const WORKFLOW_CATEGORY_VALUES = [
    'Marketing', 'Development', 'Startup Operations', 'Content Creation',
    'Sales', 'Design', 'Data & Analytics', 'Customer Support', 'Education',
    'Finance', 'HR & Recruiting', 'Research', 'Productivity', 'Other',
];

function countWords(s) {
    return (s || '').trim().split(/\s+/).filter(Boolean).length;
}

function parseArray(value) {
    if (!value) return [];
    const raw = value.includes('\n') ? value.split('\n') : value.split(',');
    const seen = new Set();
    return raw.map(s => s.trim()).filter(Boolean).filter(s => {
        const key = s.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Parse workflow steps from a block like:
 *   Step 1: Title
 *   Description line
 *   Tools: notion, slack
 *
 *   Step 2: Title
 *   ...
 */
function parseWorkflowSteps(value) {
    if (!value) return [];
    const steps = [];
    const blocks = value.split(/\n{2,}/); // split on blank lines
    for (const block of blocks) {
        const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) continue;
        // First line: optional "Step N:" prefix then title
        const titleLine = lines[0].replace(/^step\s*\d+[:.]\s*/i, '').trim();
        const descLines = [];
        let toolSlugs = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const toolsMatch = line.match(/^tools?:\s*(.+)/i);
            if (toolsMatch) {
                toolSlugs = toolsMatch[1].split(',').map(s =>
                    s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                ).filter(Boolean);
            } else {
                descLines.push(line);
            }
        }
        if (titleLine) {
            steps.push({ title: titleLine, description: descLines.join(' '), tool_slugs: toolSlugs });
        }
    }
    return steps;
}

// ── Step 1: Extract ──────────────────────────────────────────────────────────

function extractFields(rawText) {
    const result = {};
    const regex = /<<<([A-Z0-9_]+)>>>([\s\S]*?)<<<END_\1>>>/g;
    let match;
    while ((match = regex.exec(rawText)) !== null) {
        const [, fieldName, value] = match;
        if (!(fieldName in result)) result[fieldName] = value.trim();
    }
    return result;
}

// ── Step 2: Map + Normalise ──────────────────────────────────────────────────

function mapFields(extracted) {
    const data = {};

    data.name              = extracted['NAME']              ? extracted['NAME'].trim()              : null;
    data.short_description = extracted['SHORT_DESCRIPTION'] ? extracted['SHORT_DESCRIPTION'].trim() : null;
    data.full_description  = extracted['FULL_DESCRIPTION']  ? extracted['FULL_DESCRIPTION'].trim()  : null;
    data.hero_image        = extracted['HERO_IMAGE']        ? extracted['HERO_IMAGE'].trim()        : null;
    data.meta_title        = extracted['META_TITLE']        ? extracted['META_TITLE'].trim()        : null;
    data.meta_description  = extracted['META_DESCRIPTION']  ? extracted['META_DESCRIPTION'].trim()  : null;

    // setup_time_hours
    const setupRaw = extracted['SETUP_TIME_HOURS'] ? extracted['SETUP_TIME_HOURS'].trim() : '';
    data.setup_time_hours = setupRaw ? parseFloat(setupRaw) || null : null;

    // Auto-slug from name
    const slugRaw = extracted['SLUG'] ? extracted['SLUG'].trim() : (data.name || '');
    data.slug = slugRaw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // workflow_category: case-insensitive match
    const catRaw = (extracted['WORKFLOW_CATEGORY'] || '').trim();
    const catMatch = WORKFLOW_CATEGORY_VALUES.find(c => c.toLowerCase() === catRaw.toLowerCase());
    data.workflow_category = catMatch || catRaw || null;

    // Arrays
    data.tools         = parseArray(extracted['TOOLS']).map(s =>
        s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    );
    data.why_it_works  = parseArray(extracted['WHY_IT_WORKS']);
    data.who_its_for   = parseArray(extracted['WHO_ITS_FOR']);
    data.not_for       = parseArray(extracted['NOT_FOR']);

    // Workflow steps
    data.workflow_steps = parseWorkflowSteps(extracted['WORKFLOW_STEPS']);

    return data;
}

// ── Step 3: Validate ─────────────────────────────────────────────────────────

function validate(data) {
    const errors = [];

    if (!data.name)  errors.push('NAME is required');
    if (!data.slug)  errors.push('Could not derive SLUG from NAME');
    if (!data.workflow_category) errors.push('WORKFLOW_CATEGORY is required');

    if (data.short_description !== null) {
        const w = countWords(data.short_description);
        if (w < 10 || w > 40) errors.push(`SHORT_DESCRIPTION must be 10–40 words (got ${w})`);
    }

    if (data.tools.length === 0) errors.push('TOOLS must list at least one tool slug');

    return errors;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function parseStackInput(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        return { status: 'error', errors: ['Input must be a non-empty string'] };
    }
    const extracted = extractFields(rawText);
    if (Object.keys(extracted).length === 0) {
        return { status: 'error', errors: ['No valid <<<FIELD>>>...<<<END_FIELD>>> blocks found'] };
    }
    const data = mapFields(extracted);
    const errors = validate(data);
    if (errors.length > 0) return { status: 'error', errors };
    return { status: 'success', data };
}

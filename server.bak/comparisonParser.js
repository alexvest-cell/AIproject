/**
 * comparisonParser.js
 * Deterministic parser for <<<FIELD>>>...<<<END_FIELD>>> tagged comparison input.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

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
 * Parse comparison table rows from:
 *   Feature | Tool A value | Tool B value [| Tool C value]
 * or
 *   Feature: Tool A value vs Tool B value
 */
function parseComparisonTable(value) {
    if (!value) return [];
    const rows = [];
    for (const line of value.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Pipe-separated
        if (trimmed.includes('|')) {
            const parts = trimmed.split('|').map(p => p.trim());
            if (parts.length >= 3) {
                rows.push({
                    feature:      parts[0],
                    tool_a_value: parts[1],
                    tool_b_value: parts[2],
                    tool_c_value: parts[3] || undefined,
                });
            }
        }
    }
    return rows;
}

/**
 * Parse FAQ blocks:
 *   Q: question text
 *   A: answer text
 */
function parseFaq(value) {
    if (!value) return [];
    const faqs = [];
    const blocks = value.split(/\n{2,}/);
    for (const block of blocks) {
        const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
        let question = '', answer = '';
        for (const line of lines) {
            if (/^Q:/i.test(line)) question = line.replace(/^Q:\s*/i, '').trim();
            else if (/^A:/i.test(line)) answer = line.replace(/^A:\s*/i, '').trim();
        }
        if (question && answer) faqs.push({ question, answer });
    }
    return faqs;
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

    data.title           = extracted['TITLE']           ? extracted['TITLE'].trim()           : null;
    data.verdict         = extracted['VERDICT']         ? extracted['VERDICT'].trim()         : null;
    data.body            = extracted['BODY']            ? extracted['BODY'].trim()            : null;
    data.meta_title      = extracted['META_TITLE']      ? extracted['META_TITLE'].trim()      : null;
    data.meta_description = extracted['META_DESCRIPTION'] ? extracted['META_DESCRIPTION'].trim() : null;

    // Tool slugs — normalise to slug format
    const toSlug = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    data.tool_a_slug = toSlug(extracted['TOOL_A']);
    data.tool_b_slug = toSlug(extracted['TOOL_B']);
    data.tool_c_slug = extracted['TOOL_C'] ? toSlug(extracted['TOOL_C']) : undefined;

    // Auto-generate slug
    const slugRaw = extracted['SLUG']
        ? extracted['SLUG'].trim()
        : [data.tool_a_slug, data.tool_b_slug].filter(Boolean).join('-vs-');
    data.slug = slugRaw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Arrays
    data.choose_tool_a    = parseArray(extracted['CHOOSE_TOOL_A']);
    data.choose_tool_b    = parseArray(extracted['CHOOSE_TOOL_B']);
    data.comparison_table = parseComparisonTable(extracted['COMPARISON_TABLE']);
    data.faq              = parseFaq(extracted['FAQ']);

    return data;
}

// ── Step 3: Validate ─────────────────────────────────────────────────────────

function validate(data) {
    const errors = [];
    if (!data.title)      errors.push('TITLE is required');
    if (!data.tool_a_slug) errors.push('TOOL_A is required');
    if (!data.tool_b_slug) errors.push('TOOL_B is required');
    if (!data.verdict)    errors.push('VERDICT is required');
    return errors;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function parseComparisonInput(rawText) {
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

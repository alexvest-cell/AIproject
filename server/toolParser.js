/**
 * toolParser.js
 * Deterministic parser for <<<FIELD>>>...<<<END_FIELD>>> tagged input.
 * Extracts, normalises, validates, and maps raw AI-generated text to CMS fields.
 */

// ── Enums ──────────────────────────────────────────────────────────────────

const CATEGORY_PRIMARY_VALUES = [
    'AI Writing', 'AI Chatbots', 'Productivity', 'Automation', 'Design',
    'Development', 'Marketing', 'Data Analysis', 'Customer Support', 'Other',
];

const USE_CASE_VALUES = [
    'Content Creation', 'Research', 'Coding', 'Automation', 'Lead Generation',
    'Customer Support', 'Data Analysis', 'Design', 'Education', 'Personal Productivity', 'Marketing',
];

const PLATFORM_VALUES = ['Web', 'iOS', 'Android', 'API', 'Desktop'];

const DATA_CONFIDENCE_VALUES = ['verified', 'inferred', 'ai_generated'];

// Case-insensitive pricing model normalisation
const PRICING_MODEL_MAP = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
    trial: 'Trial',
    enterprise: 'Enterprise',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function countWords(s) {
    return (s || '').trim().split(/\s+/).filter(Boolean).length;
}

function toTitleCase(s) {
    return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/**
 * Split a raw block into an array.
 * Supports newline-separated AND comma-separated inputs.
 */
function parseArray(value) {
    if (!value) return [];
    const raw = value.includes('\n') ? value.split('\n') : value.split(',');
    // Deduplicate (case-insensitive) while preserving first-seen casing
    const seen = new Set();
    return raw
        .map(s => s.trim())
        .filter(Boolean)
        .filter(s => {
            const key = s.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

function normalizeIntegrations(value) {
    if (!value) return [];
    const items = parseArray(value);
    const seen = new Set();
    return items
        .map(toTitleCase)
        .filter(s => {
            const key = s.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

// ── Step 1: Extract ────────────────────────────────────────────────────────

/**
 * Pull all <<<FIELD>>>...<<<END_FIELD>>> blocks from raw text.
 * Unknown fields are ignored. Embedded code is never executed.
 */
function extractFields(rawText) {
    const result = {};
    const regex = /<<<([A-Z0-9_]+)>>>([\s\S]*?)<<<END_\1>>>/g;
    let match;
    while ((match = regex.exec(rawText)) !== null) {
        const [, fieldName, value] = match;
        // Only capture first occurrence of each tag
        if (!(fieldName in result)) {
            result[fieldName] = value.trim();
        }
    }
    return result;
}

// ── Step 2: Map + Normalise ────────────────────────────────────────────────

function mapFields(extracted) {
    const data = {};
    const _meta = {}; // internal validation metadata, stripped before returning

    // ── String fields ──────────────────────────────────────────────────────
    data.name              = extracted['NAME']              ? extracted['NAME'].trim()              : null;
    data.short_description = extracted['SHORT_DESCRIPTION'] ? extracted['SHORT_DESCRIPTION'].trim() : null;
    data.full_description  = extracted['LONG_DESCRIPTION']  ? extracted['LONG_DESCRIPTION'].trim()  : null;
    data.starting_price    = extracted['STARTING_PRICE']    ? extracted['STARTING_PRICE'].trim()    : null;
    data.website_url       = extracted['WEBSITE_URL']       ? extracted['WEBSITE_URL'].trim()       : null;
    data.affiliate_url     = extracted['AFFILIATE_URL']     ? extracted['AFFILIATE_URL'].trim()     : null;
    data.logo              = extracted['LOGO_URL']          ? extracted['LOGO_URL'].trim()          : null;
    data.meta_title        = extracted['META_TITLE']        ? extracted['META_TITLE'].trim()        : null;
    data.meta_description  = extracted['META_DESCRIPTION']  ? extracted['META_DESCRIPTION'].trim()  : null;

    // Auto-generate slug from name if not explicitly tagged
    const slugRaw = extracted['SLUG'] ? extracted['SLUG'].trim() : (data.name || '');
    data.slug = slugRaw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // ── Enums ──────────────────────────────────────────────────────────────

    // CATEGORY_PRIMARY: must match enum exactly (case-insensitive)
    const catRaw = (extracted['CATEGORY_PRIMARY'] || '').trim();
    const catMatch = CATEGORY_PRIMARY_VALUES.find(c => c.toLowerCase() === catRaw.toLowerCase());
    data.category_primary = catMatch || null;
    _meta.invalidCategory = catRaw && !catMatch ? catRaw : null;

    // PRICING_MODEL: case-insensitive normalisation, default Freemium
    const pricingRaw = (extracted['PRICING_MODEL'] || '').trim().toLowerCase();
    data.pricing_model = PRICING_MODEL_MAP[pricingRaw] || 'Freemium';

    // DATA_CONFIDENCE: default ai_generated
    const dcRaw = (extracted['DATA_CONFIDENCE'] || '').trim().toLowerCase();
    data.data_confidence = DATA_CONFIDENCE_VALUES.includes(dcRaw) ? dcRaw : 'ai_generated';

    // ── Arrays ─────────────────────────────────────────────────────────────

    data.key_features = parseArray(extracted['KEY_FEATURES']);
    data.pros         = parseArray(extracted['PROS']);
    data.cons         = parseArray(extracted['CONS']);
    data.integrations = normalizeIntegrations(extracted['INTEGRATIONS']);

    // USE_CASES: filter to valid enum values, warn on invalid, cap at 5
    const rawUseCases = parseArray(extracted['USE_CASES']);
    data.use_case_tags = rawUseCases
        .map(u => USE_CASE_VALUES.find(v => v.toLowerCase() === u.toLowerCase()))
        .filter(Boolean)
        .slice(0, 5);
    _meta.invalidUseCases = rawUseCases.filter(
        u => !USE_CASE_VALUES.some(v => v.toLowerCase() === u.toLowerCase())
    );

    // PLATFORMS: normalise to allowed values
    const rawPlatforms = parseArray(extracted['PLATFORMS']);
    data.supported_platforms = rawPlatforms
        .map(p => PLATFORM_VALUES.find(v => v.toLowerCase() === p.toLowerCase()))
        .filter(Boolean);

    // SECONDARY_TAGS: free text, comma-sep
    data.secondary_tags = extracted['SECONDARY_TAGS'] ? parseArray(extracted['SECONDARY_TAGS']) : [];

    return { data, _meta };
}

// ── Step 3: Validate ───────────────────────────────────────────────────────

function validate(data, _meta) {
    const errors = [];

    if (data.short_description !== null) {
        const w = countWords(data.short_description);
        if (w < 15 || w > 25) errors.push(`SHORT_DESCRIPTION must be 15–25 words (got ${w})`);
    }

    if (data.full_description !== null) {
        const w = countWords(data.full_description);
        if (w < 80 || w > 120) errors.push(`LONG_DESCRIPTION must be 80–120 words (got ${w})`);
    }

    const kf = data.key_features?.length ?? 0;
    if (kf < 4 || kf > 6) errors.push(`KEY_FEATURES must have 4–6 items (got ${kf})`);

    const pros = data.pros?.length ?? 0;
    if (pros < 3 || pros > 5) errors.push(`PROS must have 3–5 items (got ${pros})`);

    const cons = data.cons?.length ?? 0;
    if (cons < 2 || cons > 4) errors.push(`CONS must have 2–4 items (got ${cons})`);

    const ints = data.integrations?.length ?? 0;
    if (ints < 3 || ints > 6) errors.push(`INTEGRATIONS must have 3–6 items (got ${ints})`);

    const ucs = data.use_case_tags?.length ?? 0;
    if (ucs < 1 || ucs > 5) errors.push(`USE_CASES must have 1–5 valid items (got ${ucs})`);

    if (_meta.invalidCategory) {
        errors.push(`CATEGORY_PRIMARY "${_meta.invalidCategory}" is not a valid value. Allowed: ${CATEGORY_PRIMARY_VALUES.join(', ')}`);
    }

    if (_meta.invalidUseCases?.length) {
        errors.push(`USE_CASES contains unrecognised values: ${_meta.invalidUseCases.join(', ')}`);
    }

    return errors;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Parse raw tagged input.
 * Returns { status: 'success', data } or { status: 'error', errors }.
 * Does NOT save to database — caller decides what to do with the result.
 */
export function parseToolInput(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        return { status: 'error', errors: ['Input must be a non-empty string'] };
    }

    const extracted = extractFields(rawText);

    if (Object.keys(extracted).length === 0) {
        return { status: 'error', errors: ['No valid <<<FIELD>>>...<<<END_FIELD>>> blocks found in input'] };
    }

    const { data, _meta } = mapFields(extracted);
    const errors = validate(data, _meta);

    if (errors.length > 0) {
        return { status: 'error', errors };
    }

    return { status: 'success', data };
}

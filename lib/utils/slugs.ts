export const CATEGORY_SLUG_TO_NAME: Record<string, string> = {
    'ai-chatbots':         'AI Chatbots',
    'ai-writing':          'AI Writing',
    'ai-image-generation': 'AI Image Generation',
    'ai-video':            'AI Video',
    'ai-audio':            'AI Audio',
    'productivity':        'Productivity',
    'automation':          'Automation',
    'design':              'Design',
    'development':         'Development',
    'marketing':           'Marketing',
    'sales-crm':           'Sales & CRM',
    'customer-support':    'Customer Support',
    'data-analysis':       'Data Analysis',
    'seo-tools':           'SEO Tools',
    'other':               'Other',
};

export const WORKFLOW_SLUG_TO_NAME: Record<string, string> = {
    'students':          'Students',
    'developers':        'Developers',
    'marketers':         'Marketers',
    'content-creators':  'Content Creators',
    'startups':          'Startups',
    'small-business':    'Small Business',
    'enterprise':        'Enterprise',
    'researchers':       'Researchers',
    'designers':         'Designers',
    'sales-teams':       'Sales Teams',
    'agencies':          'Agencies',
    'educators':         'Educators',
    'freelancers':       'Freelancers',
    'product-managers':  'Product Managers',
    'data-scientists':   'Data Scientists',
    'musicians':         'Musicians',
};

export const CATEGORY_NAME_TO_SLUG: Record<string, string> =
    Object.fromEntries(
        Object.entries(CATEGORY_SLUG_TO_NAME).map(([slug, name]) => [name, slug])
    );

export const WORKFLOW_NAME_TO_SLUG: Record<string, string> =
    Object.fromEntries(
        Object.entries(WORKFLOW_SLUG_TO_NAME).map(([slug, name]) => [name, slug])
    );

/** Returns the canonical display name for a category slug, or null if unknown. */
export function categorySlugToName(slug: string): string | null {
    return CATEGORY_SLUG_TO_NAME[slug] ?? null;
}

/** Returns the canonical display name for a workflow slug, or null if unknown. */
export function workflowSlugToName(slug: string): string | null {
    return WORKFLOW_SLUG_TO_NAME[slug] ?? null;
}

/** Returns the canonical URL slug for a category display name. */
export function categoryNameToSlug(name: string): string {
    return CATEGORY_NAME_TO_SLUG[name] ||
        name.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
}

/** Returns the canonical URL slug for a workflow display name. */
export function workflowNameToSlug(name: string): string {
    return WORKFLOW_NAME_TO_SLUG[name] ||
        name.toLowerCase().replace(/\s+/g, '-');
}

export const BEST_AI_TOOLS_BASE = '/best-ai-tools';
export const BEST_AI_TOOLS_FOR_BASE = '/best-ai-tools/for';

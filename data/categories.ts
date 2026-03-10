export interface CategoryDefinition {
    id: string;
    label: string;
    slug: string;
    description: string;
    imageUrl: string;
}

export const CATEGORIES: CategoryDefinition[] = [
    {
        id: "AI Tools",
        label: "AI Tools",
        slug: "ai-tools",
        description: "The definitive index of AI and software tools. We track the entire AI stack so you can choose the right tool for any job.",
        imageUrl: "https://placehold.co/1200x800?text=AI+Tools"
    },
    {
        id: "Best Software",
        label: "Best Software",
        slug: "best-software",
        description: "Curated best-of lists for every workflow, use case, and industry. Updated regularly as the market evolves.",
        imageUrl: "https://placehold.co/1200x800?text=Best+Software"
    },
    {
        id: "Reviews",
        label: "Reviews",
        slug: "reviews",
        description: "Deep-dive analysis of the tools shaping the modern software stack. We test so you don't have to.",
        imageUrl: "https://placehold.co/1200x800?text=Reviews"
    },
    {
        id: "Comparisons",
        label: "Comparisons",
        slug: "comparisons",
        description: "Head-to-head comparisons of the leading tools in every category. Find out which one wins for your use case.",
        imageUrl: "https://placehold.co/1200x800?text=Comparisons"
    },
    {
        id: "Use Cases",
        label: "Use Cases",
        slug: "use-cases",
        description: "Find the best tools for your specific workflow, role, or industry. From startups to enterprise teams.",
        imageUrl: "https://placehold.co/1200x800?text=Use+Cases"
    },
    {
        id: "Stacks",
        label: "Stacks",
        slug: "stacks",
        description: "Explore curated software stacks used by developers, marketers, creators, and startups to build efficient workflows.",
        imageUrl: "https://placehold.co/1200x800?text=Stacks"
    },
    {
        id: "Guides",
        label: "Guides",
        slug: "guides",
        description: "Practical guides for getting the most out of modern software. Step-by-step, no fluff.",
        imageUrl: "https://placehold.co/1200x800?text=Guides"
    },
    {
        id: "News",
        label: "News",
        slug: "news",
        description: "The latest developments across the AI and software landscape. Chronological, fact-first intelligence.",
        imageUrl: "https://placehold.co/1200x800?text=News"
    }
];

export const CATEGORY_IDS = CATEGORIES.map(c => c.id);
export const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug);

export const mapTopicToCategory = (topic: string): string => {
    const mainCategories = CATEGORY_IDS;
    const normalizedTopic = topic.trim();
    if (mainCategories.includes(normalizedTopic)) return normalizedTopic;

    const lower = normalizedTopic.toLowerCase();
    if (lower.includes('chatgpt') || lower.includes('claude') || lower.includes('gemini')) return 'AI Tools';
    if (lower.includes('vs') || lower.includes('versus')) return 'Comparisons';
    if (lower.includes('review') || lower.includes('test')) return 'Reviews';
    if (lower.includes('best ') || lower.includes('top ')) return 'Best Software';
    if (lower.includes('tutorial') || lower.includes('how-to') || lower.includes('guide')) return 'Guides';
    if (lower.includes('workflow') || lower.includes('use case')) return 'Use Cases';

    return 'News';
};


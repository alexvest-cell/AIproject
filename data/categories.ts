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
        id: "Best AI Tools",
        label: "Best AI Tools",
        slug: "best-ai-tools",
        description: "Curated best-of lists for every workflow, use case, and industry. Updated regularly as the market evolves.",
        imageUrl: "https://placehold.co/1200x800?text=Best+AI+Tools"
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


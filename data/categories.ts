export interface CategoryDefinition {
    id: string;
    label: string;
    description: string;
    imageUrl: string;
}

export const CATEGORIES: CategoryDefinition[] = [
    {
        id: "Climate Change",
        label: "Climate Change",
        description: "Beyond just temperature rise, we track the systemic destabilization of planetary boundaries. From the collapsing cryosphere to shifting monsoon patterns, this feed aggregates verified data on how the Earth's fundamental systems are responding to anthropogenic forcing.",
        imageUrl: "https://placehold.co/1200x800?text=Climate+Change"
    },
    {
        id: "Energy",
        label: "Energy",
        description: "The largest industrial transition in human history is underway. We analyze the shift from combustion to electrons, tracking efficiency breakthroughs in photovoltaics, the resurgence of nuclear baseload, and the critical mineral supply chains defining the new energy geopolitics.",
        imageUrl: "https://placehold.co/1200x800?text=Energy"
    },
    {
        id: "Pollution",
        label: "Pollution",
        description: "Monitoring the chemical footprint of civilization. We track the lifecycle of novel entities—from microplastics crossing the blood-brain barrier to forever chemicals (PFAS) in our water systems—and the regulatory frameworks emerging to contain them.",
        imageUrl: "https://placehold.co/1200x800?text=Pollution"
    },
    {
        id: "Policy & Economics",
        label: "Policy & Economics",
        description: "The intersection of climate physics and market forces. We cover the carbon border adjustments, green taxonomy regulations, and capital flows that are rewriting the rules of the global economy and forcing a valuation of natural capital.",
        imageUrl: "https://placehold.co/1200x800?text=Policy+Economics"
    },
    {
        id: "Oceans",
        label: "Oceans",
        description: "Covering the 71% of our planet that acts as its heat shield. From the slowing AMOC circulation to the acidification threatening marine food webs, we report on the blue economy and the health of the hydrosphere.",
        imageUrl: "https://placehold.co/1200x800?text=Oceans"
    },
    {
        id: "Biodiversity",
        label: "Biodiversity",
        description: "We are witnessing the sixth mass extinction. This feed monitors the Living Planet Index, tracking the rapid decline of vertebrate populations and the collapse of insect biomass, alongside the rewilding efforts attempting to reverse the tide.",
        imageUrl: "https://placehold.co/1200x800?text=Biodiversity"
    },
    {
        id: "Conservation",
        label: "Conservation",
        description: "Stories of ecological restoration and resilience. We highlight the indigenous guardianship, protected area expansions, and species recovery programs that prove nature can bounce back when given space and legal protection.",
        imageUrl: "https://placehold.co/1200x800?text=Conservation"
    },
    {
        id: "Solutions",
        label: "Solutions",
        description: "Moving beyond hope to tangible action. We profile the scalable technologies and social innovations—from direct air capture to regenerative agriculture—that provide a roadmap for staying within planetary boundaries.",
        imageUrl: "https://placehold.co/1200x800?text=Solutions"
    }
];

export const CATEGORY_IDS = CATEGORIES.map(c => c.id);

export const mapTopicToCategory = (topic: string): string => {
    // Direct match for main categories
    const mainCategories = CATEGORY_IDS;

    if (mainCategories.includes(topic)) return topic;

    // Fallbacks for legacy/other topics
    if (topic === 'Forests') return 'Conservation';
    if (topic === 'Food') return 'Solutions';
    if (topic === 'Cities') return 'Solutions';
    if (topic === 'Justice') return 'Policy & Economics';
    if (topic === 'Economy') return 'Policy & Economics';
    if (topic === 'Technology') return 'Solutions';

    return 'Climate Change';
};

import { Article } from '../types';

/* -------------------------------------------------------------------------
   CONTENT GENERATION HELPERS
   ------------------------------------------------------------------------- */

const extendContent = (base: string[], category: string | string[], topic: string): string[] => {
    const catName = Array.isArray(category) ? category[0] : category;
    // If article is already long (e.g. featured article), return it.
    if (base.length >= 8) return base;

    return [
        ...base,
        `The ${topic} Context`,
        `The latest data from the ${topic} sector indicates a rapid acceleration of trends previously thought to be decades away. Experts in ${catName} are now calling for immediate, systemic intervention.`,
        "This is not an isolated event but part of a global pattern. Regional analysis shows similar disruptions occurring across both the Northern and Southern hemispheres, suggesting a synchronized shift in planetary systems.",
        "Systemic Impact Analysis",
        "When we analyze the broader ecosystem effects, we see a complex web of interactions. When one variable shifts—be it temperature, acidity, or policy—it triggers a cascade of secondary effects. For instance, recent changes in local biodiversity have already begun to alter soil composition, which in turn affects water retention and agricultural yields.",
        "We are attempting to repair a plane while flying it. The resilience of natural systems is being tested, and while some are showing surprising adaptability, others are nearing collapse. The data points we are seeing today are the early warning signals of this stress test.",
        "Future Outlook",
        "Looking forward, the implications of this development will ripple through the remainder of the decade. As we approach the 2030 milestones, the actions taken today will determine whether we meet our planetary boundaries or breach them irreversibly. Planetary Brief will continue to monitor this situation as new data becomes available."
    ];
};

const generateBodyContent = (category: string | string[], topic: string, excerpt: string): string[] => {
    const catName = Array.isArray(category) ? category[0] : category;
    return [
        excerpt,

        `Recent data indicates that ${topic} is becoming a central issue for ${catName} experts. The trends observed over the last quarter suggest a significant acceleration, prompting calls for immediate regulatory and industrial responses. We are seeing a convergence of multiple factors: rising public awareness, stricter government mandates, and technological breakthroughs that are finally making sustainable alternatives cost-competitive.`,
        "Historical Precedents",
        `To understand the current trajectory of ${topic}, we must look back at similar shifts in the ${catName} sector. Previous transitions—such as the move away from ozone-depleting substances or the initial adoption of renewable energy standards—followed a predictable S-curve of adoption. Early skepticism gave way to rapid institutional uptake once the economic case was proven. We are currently at the knee of that curve.`,
        "Systemic Implications",
        "Analysts warn that this is not an isolated phenomenon. The interplay between local environmental changes and global systems means that the impact of this event could ripple across borders. Verified sources from the IPCC and major monitoring agencies have flagged similar patterns in related sectors. For example, supply chain disruptions in one region are now causing price volatility in markets halfway across the globe, illustrating the fragility of our interconnected economy.",
        "Economic Impact Assessment",
        `The financial implications of ${topic} are staggering. Major insurance firms and investment banks are already adjusting their risk models to account for this new reality. Assets that were once considered safe bets are becoming stranded, while capital flows are increasingly redirected toward resilience and adaptation. This capital reallocation is driving innovation but also creating short-term market instability as incumbents struggle to pivot.`,
        "Technological and Policy Response",
        "In response to these developments, stakeholders are mobilizing resources to address the root causes. New frameworks are being proposed to mitigate risks, focusing on long-term sustainability rather than short-term fixes. The emphasis is shifting towards resilience and adaptation strategies. Governments are deploying subsidies and tax incentives to accelerate the transition, while the private sector is ramping up R&D spending to solve critical bottlenecks.",
        "Expert Consensus",
        `Leading voices in ${catName} agree that the time for incrementalism has passed. The consensus emerging from recent summits is that structural reform is necessary to address the scale of the challenge presented by ${topic}. Disagreement remains on the speed of implementation, but the direction of travel is no longer in dispute.`,
        "Future Outlook",
        `As we look towards 2030, the trajectory of ${topic} will likely define the broader ${catName} landscape. Planetary Brief will continue to monitor the data streams and provide updates as the situation evolves. The consensus among the scientific community remains clear: the window for effective action is narrowing, but the solutions are within reach. The decisions made in the next 18 months will likely determine the outcome for the next decade.`
    ];
};

/* -------------------------------------------------------------------------
   STATIC CONTENT DEFINITIONS
   ------------------------------------------------------------------------- */

export const heroContent = {
    headline: "Planetary Brief",
    subheadline: "Your source for global environmental intelligence. Create your first article in the CMS to get started.",
    imageUrl: "https://placehold.co/1200x800?text=Welcome+to+Planetary+Brief",
    source: "Planetary Brief",
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    url: "#"
};

export const aboutContent = {
    mission: "Planetary Brief is a curated intelligence platform dedicated to the most critical story of our time: the health of our planet. We aggregate verified data, scientific breakthroughs, and policy shifts to empower action through information.",
};

// Empty featured article - will use first article from database when available
export const featuredArticle: Article | null = null;

// Helper for bulk creation
const getRandomReadTime = () => {
    const min = 3;
    const max = 6;
    return `${Math.floor(Math.random() * (max - min + 1) + min)} min read`;
};

const createArticle = (id: string, title: string, category: string | string[], topic: string, excerpt: string, date: string, imageUrl: string): Article => ({
    id,
    title,
    category,
    topic,
    source: "Planetary Brief Intelligence",
    imageUrl,
    excerpt,
    date,
    originalReadTime: getRandomReadTime(),
    url: "#",
    contextBox: {
        title: `${topic} Analysis`,
        content: "This critical update is based on the latest verified data from international monitoring agencies.",
        source: "Global Data Stream 2026"
    },
    content: generateBodyContent(category, topic, excerpt)
});

// -----------------------------------------------------------------------------
// 80 ARTICLES (10 Per Category)
// -----------------------------------------------------------------------------

export const newsArticles: Article[] = [
    // Empty - ready for real content!
    // Articles created in the CMS will be served from MongoDB
];


export const upcomingEvents: Article[] = [
    {
        id: 'evt-cop30',
        title: 'UN Climate Change Conference (COP30)',
        category: 'Global Summit', topic: 'Global Summit',
        source: 'UNFCCC',
        imageUrl: 'https://placehold.co/1200x800?text=evt-cop30', // Conference/UN
        excerpt: 'World leaders convene in Belém, Brazil, to finalize the new collective quantified goal on climate finance and adaptation strategies.',
        date: 'Nov 10-21, 2026',
        originalReadTime: '5 min read',
        url: '#',
        content: [
            "The 30th Conference of the Parties (COP30) represents a pivotal moment in global climate diplomacy. Hosted in the heart of the Amazon, in Belém, Brazil, this summit carries a symbolic weight unmatched by its predecessors. The choice of location is no accident; it forces the international community to confront the reality of the biome that serves as the planet's lungs, currently teetering on the edge of a dieback tipping point. The Brazilian presidency has framed this as the 'Tropical COP', placing nature-based solutions and the bioeconomy at the center of the negotiation table.",
            "Finance: The Elephant in the Room",
            "The primary technical objective of COP30 is the finalization of the New Collective Quantified Goal (NCQG) on climate finance. The previous target of $100 billion annually, set in 2009, has been widely criticized as insufficient and rarely met in practice. Developing nations, particularly the G77 and China block, are pushing for a new floor of at least $1 trillion annually to cover mitigation, adaptation, and loss and damage. The debate is not just about the number, but the quality of finance—grants versus loans—and the contributor base. Should emerging economies like China and Saudi Arabia now contribute?",
            "The Adaptation Gap",
            "While mitigation (cutting emissions) often steals the headlines, COP30 faces intense pressure to deliver on the Global Goal on Adaptation (GGA). Climate impacts are no longer theoretical; they are visceral. From the floods in Pakistan to the droughts in the Horn of Africa, the Global South is demanding a finalized framework for measuring adaptation progress. Without clear metrics, adaptation finance remains a black box, difficult to track and easy to ignore. The Belém summit is expected to produce a standardized set of indicators for resilience, water security, and agricultural stability.",
            "Article 6 and Carbon Markets",
            "The rules for international carbon trading under Article 6 of the Paris Agreement remain a contentious sticking point. After the failures to reach consensus at previous COPs, there is a renewed urgency to operationalize a high-integrity carbon market. The risk, however, is a 'race to the bottom' where countries trade 'hot air' credits that do not represent real emission reductions. The integrity of forest carbon credits, in particular, will be under the microscope given the Amazonian backdrop. A failure here could undermine the credibility of the entire Paris mechanism.",
            "The Road Ahead",
            "COP30 is not just a meeting; it is a stress test for multilateralism. In a fragmented geopolitical landscape, can nations still cooperate on an existential threat? The outcome in Belém will determine whether the 1.5°C target remains a viable policy goal or becomes a memorial to lost time. Planetary Brief will be monitoring the negotiating texts daily, specifically tracking the brackets—the disputed language—that tell the real story of the summit."
        ],
        contextBox: {
            title: "Why Belém Matters",
            content: "Hosting the talks in the Amazon highlights the critical link between biodiversity loss and climate change. It is the first time the summit takes place within a biome that actively regulates the global carbon cycle.",
            source: "Brazilian Government Statement"
        }
    },
    {
        id: 'evt-plastics',
        title: 'Final Ratification: Global Plastics Treaty',
        category: 'Legislation', topic: 'Legislation',
        source: 'UN Environment Assembly',
        imageUrl: 'https://placehold.co/1200x800?text=evt-plastics', // Plastic bottle beach
        excerpt: 'Delegates meet in Paris to sign the finalized text of the international legally binding instrument on plastic pollution.',
        date: 'Dec 1-5, 2026',
        originalReadTime: '4 min read',
        url: '#',
        content: [
            "After years of negotiation, the Intergovernmental Negotiating Committee (INC) is set to convene in Paris for the diplomatic plenipotentiary conference to sign the Global Plastics Treaty. This agreement is being hailed as the most significant environmental accord since the Paris Agreement of 2015. Unlike previous voluntary frameworks, this treaty is a legally binding international instrument designed to address the full lifecycle of plastic, including its production, design, and disposal.",
            "The Battle Lines: Upstream vs. Downstream",
            "The core tension of the negotiations has been between the 'High Ambition Coalition' (led by Rwanda and Norway) and a group of petrochemical-producing nations. The former argues for 'upstream' measures: capping the production of virgin plastic polymers. They contend that we cannot recycle our way out of a crisis where production is set to triple by 2060. The latter group has fought to limit the treaty's scope to 'downstream' waste management—essentially focusing on recycling and cleanup rather than production limits.",
            "Chemicals of Concern",
            "A critical, often overlooked component of the treaty is the regulation of hazardous chemicals used in plastic production. There are over 13,000 chemicals associated with plastics, many of which are known carcinogens or endocrine disruptors. The finalized text creates a 'negative list' of banned substances and a 'watch list' for those requiring further study. This shift forces manufacturers to disclose the chemical composition of their packaging, a transparency requirement that industry lobbyists have fought tooth and nail.",
            "Extended Producer Responsibility (EPR)",
            "The treaty establishes global standards for Extended Producer Responsibility schemes. EPR mandates that the companies producing plastic products are financially and physically responsible for them at the end of their life. This shifts the burden from municipal taxpayers to corporations like Coca-Cola, Unilever, and Nestlé. Under the new rules, these companies will pay fees based on the recyclability of their packaging, creating a direct financial incentive to simplify designs and eliminate multi-layered, hard-to-recycle materials.",
            "Implementation Challenges",
            "Signing the treaty is only the first step. The real test lies in ratification and domestic implementation. Nations will need to rewrite national waste laws, invest in new infrastructure, and enforce bans on single-use items. For the Global South, the treaty includes a financial mechanism to support this transition, though the exact funding levels remain a point of eleventh-hour negotiation. The treaty represents a fundamental shift in how humanity interacts with materials, signaling the end of the 'take-make-waste' era."
        ],
        contextBox: {
            title: "The Scale of the Problem",
            content: "Without this treaty, plastic leakage into the ocean is projected to nearly triple by 2040, flowing into the sea at a rate of 29 million metric tons per year.",
            source: "Pew Charitable Trusts / SYSTEMIQ"
        }
    },
    {
        id: 'evt-imo',
        title: 'IMO Marine Environment Protection Committee (MEPC 85)',
        category: 'Maritime Law', topic: 'Maritime Law',
        source: 'International Maritime Organization',
        imageUrl: 'https://placehold.co/1200x800?text=evt-imo', // Ship container
        excerpt: 'The shipping industry faces a deadline to adopt market-based measures for decarbonization, including a potential carbon levy on fuel.',
        date: 'Oct 2026',
        originalReadTime: '5 min read',
        url: '#',
        content: [
            "The shipping industry, responsible for nearly 3% of global greenhouse gas emissions, is approaching a reckoning. The International Maritime Organization (IMO) meets for its 85th Marine Environment Protection Committee (MEPC 85) session in London, facing a deadline to adopt the 'mid-term measures' necessary to meet its 2050 net-zero strategy. The discussions are technical, but the implications are global: they will determine the price of shipping every container, commodity, and consumer good moving across the ocean.",
            "The Carbon Levy",
            "The centerpiece of the negotiation is a global carbon pricing mechanism. The proposal on the table is a levy on greenhouse gas emissions from ships—essentially a tax on heavy fuel oil. The revenue generated, estimated at $40-$60 billion annually, would be split. Part would go to a fund to reward early adopters of zero-emission fuels (like green ammonia and methanol), closing the price gap with fossil fuels. The rest would support a 'just transition' for developing states, particularly Pacific Islands nations that are most remote and vulnerable to rising shipping costs.",
            "Well-to-Wake vs. Tank-to-Wake",
            "A critical technical battle is being fought over how emissions are calculated. High-ambition states are demanding a 'Well-to-Wake' lifecycle analysis. This means counting the emissions produced during the extraction and refining of the fuel, not just what comes out of the ship's smokestack ('Tank-to-Wake'). This distinction is vital for alternative fuels like hydrogen or ammonia; if they are produced using coal-fired electricity (brown ammonia), a Well-to-Wake calculation would reveal them as dirty, preventing a false solution.",
            "The Efficiency Standard",
            "Running parallel to the levy is the Global Fuel Standard (GFS). This regulation mandates a stepwise reduction in the carbon intensity of marine fuels, ratcheting down every five years. By 2030, ships will need to reduce intensity by at least 5%, forcing older, inefficient vessels to either slow down ('slow steaming') or be scrapped. This regulatory pincer movement—a tax on carbon and a mandate for cleaner fuel—is designed to force a rapid technological shift.",
            "Geopolitical Friction",
            "China, Brazil, and Argentina have previously expressed concern that a carbon levy acts as a trade tariff on their exports. MEPC 85 is the moment where compromise must be reached. Failure to adopt these measures would likely trigger regional fragmentation, with the EU extending its own Emissions Trading System (ETS) further, creating a chaotic patchwork of maritime regulations. The IMO is under immense pressure to prove it can regulate its own sector effectively."
        ],
        contextBox: {
            title: "The Fuel Transition",
            content: "To meet the 2030 targets, at least 5% of the energy used by international shipping must come from zero or near-zero emission technologies. Currently, that figure is less than 0.2%.",
            source: "Global Maritime Forum"
        }
    },
    {
        id: 'evt-cbd',
        title: 'Convention on Biological Diversity (COP17)',
        category: 'Biodiversity', topic: 'Biodiversity',
        source: 'CBD Secretariat',
        imageUrl: 'https://placehold.co/1200x800?text=evt-cbd', // Jungle forest
        excerpt: 'Evaluating the implementation of the Kunming-Montreal Global Biodiversity Framework two years in.',
        date: 'Late 2026',
        originalReadTime: '4 min read',
        url: '#',
        content: [
            "Two years after the historic adoption of the Kunming-Montreal Global Biodiversity Framework (GBF), the world's nations reconvene for COP17. If COP15 was about setting the targets—most notably the '30x30' goal to protect 30% of land and oceans by 2030—COP17 is entirely about implementation. The honeymoon period of high-level pledges is over; now, delegates must present their National Biodiversity Strategies and Action Plans (NBSAPs) to prove they are actually doing the work.",
            "The 30x30 Reality Check",
            "Early analysis suggests a mixed bag of progress. While marine protected areas have expanded, terrestrial protection often clashes with agricultural expansion and extractive industries. A key focus at COP17 is the quality of protection. 'Paper parks'—areas that are protected in name only but suffer from unchecked poaching or logging—remain a plague on conservation data. The Secretariat is pushing for a rigorous monitoring framework that uses satellite data and eDNA (environmental DNA) to verify biodiversity health, not just acreage.",
            "Biocredits and Nature Finance",
            "Just as carbon markets dominated climate talks, biodiversity credits are taking center stage here. The concept is to create a market mechanism where companies pay for the preservation or restoration of biodiversity units (e.g., a hectare of healthy rainforest or a restored coral reef). Proponents argue this unlocks private capital for nature. Skeptics warn of the extreme difficulty in commodifying nature—a tree is easier to measure than an ecosystem. COP17 aims to establish global integrity standards to prevent greenwashing in this nascent market.",
            "Indigenous Rights and DSI",
            "A critical thread running through the negotiations is the issue of Digital Sequence Information (DSI). This refers to genetic data from plants and animals that is stored digitally and used to develop medicines and commercial products. Historically, companies have used this data without compensating the countries or communities where the genetic resources originated—a practice known as biopiracy. COP17 is expected to operationalize a multilateral benefit-sharing mechanism, ensuring that profits from nature's genetics flow back to its guardians.",
            "The Stake",
            "With one million species at risk of extinction, the window for action is closing. The success of COP17 will be measured not by new promises, but by the flow of funds to the Global South and the legal enforcement of protection zones. It is a test of whether humanity can value the web of life before it unravels."
        ],
        contextBox: {
            title: "The Financing Gap",
            content: "The biodiversity financing gap is estimated at $700 billion per year. Current flows are roughly $140 billion, mostly from public subsidies.",
            source: "Paulson Institute"
        }
    }
];
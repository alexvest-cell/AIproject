export interface Article {
  id: string;
  slug?: string;
  title: string;
  category: string | string[];
  topic: string;
  source: string;
  imageUrl: string;
  imageAttribution?: string;
  originalImageUrl?: string;
  secondaryImageUrl?: string;
  diagramUrl?: string;
  audioUrl?: string;
  voiceoverText?: string;
  sources?: string[];
  excerpt: string;
  date: string;
  originalReadTime: string;
  read_time?: number; // minutes (numeric)
  url: string;
  content: string[];
  createdAt?: string;
  updatedAt?: string;
  isFeaturedDiscover?: boolean;
  isFeaturedCategory?: boolean;
  keywords?: string[];
  seoDescription?: string;
  contextBox?: {
    title: string;
    content: string;
    source: string;
  };
  imageOffsetX?: number;
  imageOffsetY?: number;

  // Platform fields
  article_type?: 'news' | 'review' | 'guide' | 'best-of' | 'comparison' | 'use-case';
  primary_tools?: string[];    // Tool slugs
  comparison_tools?: string[]; // Tool slugs
  faq?: { question: string; answer: string }[];
  meta_title?: string;
  meta_description?: string;
  verdict?: string;
  pros?: string[];
  cons?: string[];
  rating_breakdown?: {
    ease_of_use?: number;
    features?: number;
    pricing?: number;
    integrations?: number;
    performance?: number;
  };
  who_its_for?: string[];
  pricing_analysis?: string;
  // Comparison-specific fields
  choose_tool_a?: string[];  // "Choose Tool A if..." bullets
  choose_tool_b?: string[];  // "Choose Tool B if..." bullets
  comparison_rows?: {        // Structured comparison table rows
    label: string;
    tool_a_value: string;
    tool_b_value: string;
  }[];
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  featured_image?: string;
  short_description?: string;
  full_description?: string;
  category_tags: string[];
  use_case_tags: string[];
  pricing_model: 'Free' | 'Freemium' | 'Paid' | 'Enterprise';
  starting_price?: string;
  website_url?: string;
  affiliate_url?: string;
  status: 'Active' | 'Discontinued';
  last_updated?: string;
  key_features: string[];
  pros: string[];
  cons: string[];
  integrations: string[];
  supported_platforms: string[];
  ai_enabled: boolean;
  rating_score: number;
  review_count: number;
  screenshots?: { url: string; caption: string }[];
  meta_title?: string;
  meta_description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComparisonTableRow {
  feature: string;
  tool_a_value: string;
  tool_b_value: string;
  tool_c_value?: string;
}

export interface Comparison {
  id: string;
  title: string;
  slug: string;
  tool_a_slug: string;
  tool_b_slug: string;
  tool_c_slug?: string;
  // Enriched by API
  tool_a?: Tool;
  tool_b?: Tool;
  tool_c?: Tool;
  alternativeComparisons?: Comparison[];
  relatedRankings?: Article[];
  comparison_table: ComparisonTableRow[];
  verdict?: string;
  body?: string;
  choose_tool_a?: string[];
  choose_tool_b?: string[];
  faq?: { question: string; answer: string }[];
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published';
  publish_date?: string;
  createdAt?: string;
}

export interface Stack {
  id: string;
  name: string;
  slug: string;
  hero_image?: string;
  short_description: string;
  full_description?: string;
  workflow_category: string;
  tools: string[];
  workflow_steps: {
    title: string;
    description: string;
    tool_slugs: string[];
  }[];
  status: 'Draft' | 'Published';
  meta_title?: string;
  meta_description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToolPageData {
  tool: Tool;
  comparisons: Comparison[];
  relatedArticles: Article[];
  stacks?: Stack[];
}

export interface StackPageData {
  stack: Stack;
  tools: Tool[];
  comparisons: Comparison[];
  relatedArticles: Article[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface ExplanationData {
  title: string;
  value?: string;
  trend?: string;
  icon: any;
  color: string;
  detailedInfo: {
    definition: string;
    context: string;
    impact: string;
  };
  history?: { year: string; value: number }[];
}

export enum Section {
  HERO = 'headlines',
  NEWS = 'latest-news',
  STATUS = 'planetary-status',
  AI_ASSISTANT = 'green-ai',
  ABOUT = 'mission',
  ACTION = 'take-action',
  CONTACT = 'subscribe',
}

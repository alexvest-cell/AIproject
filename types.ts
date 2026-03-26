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
  use_cases?: string[];        // e.g. ['Content Writing', 'Marketing', 'SEO']
  // Guide-specific
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  tips?: string[];
  common_mistakes?: string[];
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_category?: string;
  featured_tools?: string[];
  related_categories?: string[];
  meta_title?: string;
  meta_description?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface UseCase {
  id: string;
  name: string;
  slug: string;
  description?: string;
  primary_category?: string;
  related_tools?: string[];
  meta_title?: string;
  meta_description?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPageData {
  category: Category;
  tools: Tool[];
  featuredTools: Tool[];
  bestSoftwareArticles: Article[];
  guides: Article[];
  relatedCategories: Category[];
  useCases: UseCase[];
  comparisons: Comparison[];
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
  secondary_tags?: string[];
  use_case_tags: string[];
  category_primary?: 'AI Writing' | 'AI Chatbots' | 'Productivity' | 'Automation' | 'Design' | 'Development' | 'Marketing' | 'Data Analysis' | 'Customer Support' | 'Other';
  pricing_model: 'Free' | 'Freemium' | 'Paid' | 'Enterprise' | 'Trial';
  data_confidence?: 'verified' | 'inferred' | 'ai_generated';
  related_tools?: string[];
  competitors?: string[];
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
  // Editorial fields (used by compareEngine)
  best_for?: string[];
  not_ideal_for?: string[];
  limitations?: string[];
  use_case_breakdown?: Record<string, string>;
  review_slug?: string;
  rating_breakdown?: Record<string, number>;
  model_version?: string;
  // Capabilities
  context_window?: string;
  max_integrations?: string;
  api_pricing?: string;
  image_generation?: 'yes' | 'no' | 'partial';
  memory_persistence?: 'yes' | 'no' | 'partial';
  computer_use?: 'yes' | 'no' | 'partial';
  api_available?: 'yes' | 'no';
  use_case_scores?: { use_case: string; score: number | null; description: string }[];
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
  // Data-driven fields
  comparison_type?: '1v1' | 'multi';
  use_case?: string;
  primary_use_case?: string;
  primary_use_cases?: string[];
  needs_update?: boolean;
  generation_mode?: 'dynamic' | 'cached';
  last_generated?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generated_output?: Record<string, any> | null;
  // Override model
  is_override?: boolean;
  verdict_override?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strengths_override?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weaknesses_override?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendation_override?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feature_comparison_override?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use_case_breakdown_override?: Record<string, any> | null;
  // Enriched by API
  tool_a?: Tool;
  tool_b?: Tool;
  tool_c?: Tool;
  alternativeComparisons?: Comparison[];
  relatedRankings?: Article[];
  // Deprecated stored content (kept for fallback)
  comparison_table?: ComparisonTableRow[];
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
  featured?: boolean;
  toolPreviews?: { slug: string; name: string; logo?: string | null }[];
  why_it_works?: string[];
  who_its_for?: string[];
  not_for?: string[];
  setup_time_hours?: number;
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
  relatedStacks?: Stack[];
  alternativeTools?: Record<string, Tool[]>;
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

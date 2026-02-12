export interface Article {
  id: string;
  slug?: string; // URL-friendly slug generated from title
  title: string;
  category: string | string[];
  topic: string;
  source: string;
  imageUrl: string;
  imageAttribution?: string;
  originalImageUrl?: string;
  secondaryImageUrl?: string;
  diagramUrl?: string;
  audioUrl?: string;  // Cloudinary URL for pre-generated audio
  voiceoverText?: string; // Dedicated text for audio narration, extracted from VO tags
  sources?: string[]; // List of specific sources for this article
  excerpt: string;
  date: string;
  originalReadTime: string;
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
  imageOffsetX?: number; // X offset percentage (-50 to 50)
  imageOffsetY?: number; // Y offset percentage (-50 to 50)
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
  icon: any; // Using any for Lucide icon component type to avoid complex type imports
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
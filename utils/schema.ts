import { Tool, Article, Comparison } from '../types';

/**
 * Generates SoftwareApplication JSON-LD schema for a Tool page.
 */
export function generateSoftwareApplicationSchema(tool: Tool): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.short_description || tool.meta_description,
        applicationCategory: tool.category_tags?.[0] || 'WebApplication',
        operatingSystem: tool.supported_platforms?.join(', ') || 'Web',
        offers: {
            '@type': 'Offer',
            price: tool.starting_price?.replace(/[^0-9.]/g, '') || '0',
            priceCurrency: 'USD',
            priceSpecification: {
                '@type': 'PriceSpecification',
                description: tool.pricing_model
            }
        },
        aggregateRating: tool.rating_score > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: tool.rating_score,
            ratingCount: tool.review_count || 1,
            bestRating: 10,
            worstRating: 0
        } : undefined,
        url: tool.website_url,
        image: tool.logo || tool.featured_image
    };
}

/**
 * Generates Article JSON-LD schema for an Article or Comparison page.
 */
export function generateArticleSchema(article: Partial<Article> & { verdict?: string; publish_date?: string | Date }): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt || article.verdict || article.meta_description,
        datePublished: article.date || (article.publish_date as string),
        image: article.imageUrl,
        publisher: {
            '@type': 'Organization',
            name: 'ToolCurrent',
            url: 'https://thetoolcurrent.com'
        }
    };
}

/**
 * Generates ItemList JSON-LD schema for a Best-of list article.
 */
export function generateItemListSchema(items: { name: string; url?: string; description?: string }[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            url: item.url,
            description: item.description
        }))
    };
}

/**
 * Generates FAQ JSON-LD schema for FAQ sections.
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };
}

/**
 * Injects a JSON-LD script tag into document.head.
 * Returns a cleanup function to remove it.
 */
export function injectSchema(id: string, schema: object): () => void {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('script');
        el.id = id;
        (el as HTMLScriptElement).type = 'application/ld+json';
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
    return () => {
        const existing = document.getElementById(id);
        if (existing) existing.remove();
    };
}

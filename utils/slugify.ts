/**
 * Generate a URL-friendly slug from a string (typically article title)
 * @param text - The text to convert to a slug
 * @param maxLength - Maximum length of the slug (default 60)
 * @returns A URL-safe slug
 */
export function generateSlug(text: string, maxLength: number = 60): string {
    return text
        .toLowerCase()
        .trim()
        // Replace spaces and underscores with hyphens
        .replace(/[\s_]+/g, '-')
        // Remove special characters except hyphens
        .replace(/[^\w-]+/g, '')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '')
        // Truncate to max length
        .substring(0, maxLength)
        // Remove trailing hyphen if truncation created one
        .replace(/-+$/, '');
}

/**
 * Validate if a string is a valid slug format
 * @param slug - The slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

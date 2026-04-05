/**
 * JSON-LD utilities for structured data generation.
 * All schemas must be serialized through jsonLdScript() to prevent
 * invalid markup from undefined / null / empty-string values.
 */

export function cleanJsonLd(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [
                key,
                typeof value === 'object' && !Array.isArray(value)
                    ? cleanJsonLd(value)
                    : Array.isArray(value)
                    ? value.filter(item => item !== undefined && item !== null)
                    : value,
            ])
    );
}

export function jsonLdScript(schema: Record<string, any>): string {
    return JSON.stringify(cleanJsonLd(schema));
}

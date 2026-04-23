import Tool from './models/Tool';
import Comparison from './models/Comparison';

function generateSlug(text: string): string {
    return text.toString().toLowerCase().trim()
        .replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

export default async function seedDatabase() {
    try {
        // Lazy-load seed data (large files, don't import at module level)
        const { seedTools, seedComparisons } = await import('./seed_data_toolcurrent.js');

        // 1. Seed Tools ($setOnInsert — never overwrites CMS edits)
        let seededCount = 0;
        for (const tool of seedTools) {
            const result = await Tool.findOneAndUpdate(
                { slug: tool.slug },
                { $setOnInsert: tool },
                { upsert: true, new: false }
            );
            if (!result) seededCount++;
        }
        if (seededCount > 0) console.log(`Tool seed: inserted ${seededCount} new tools.`);

        // 3. Seed Comparisons ($setOnInsert — never overwrites CMS edits)
        for (const comparison of seedComparisons) {
            await Comparison.findOneAndUpdate(
                { slug: comparison.slug },
                { $setOnInsert: comparison },
                { upsert: true, new: true }
            );
        }

        // Migrate: copy primary_use_cases[0] → use_case for docs missing it
        const migrated = await Comparison.updateMany(
            { use_case: { $in: [null, undefined, ''] }, $or: [{ primary_use_cases: { $exists: true, $not: { $size: 0 } } }, { primary_use_case: { $exists: true, $ne: '' } }] },
            [{ $set: { use_case: { $ifNull: [{ $arrayElemAt: ['$primary_use_cases', 0] }, '$primary_use_case'] } } }],
            { strict: false, updatePipeline: true } as any
        );
        if (migrated.modifiedCount > 0) console.log(`Migrated ${migrated.modifiedCount} comparisons → use_case field.`);

        const overrideMigrated = await Comparison.updateMany(
            { is_override: { $exists: false } },
            { $set: { is_override: true } }
        );
        if (overrideMigrated.modifiedCount > 0) console.log(`Migration: marked ${overrideMigrated.modifiedCount} comparisons as is_override=true.`);

        // Stacks: not auto-seeded (managed via CMS)
    } catch (err) {
        console.error('Seeding error:', err);
    }
}

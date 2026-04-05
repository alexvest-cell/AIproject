/**
 * One-time migration: replace internal tool-XXXXXXXX IDs with real slugs
 * in the competitors and related_tools arrays.
 *
 * Run with:  node scripts/migrate-competitor-ids.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const MONGODB_URI =
    "mongodb://alexvest_db_user:CtjaDgKqTnC724ly@ac-ozwrbkb-shard-00-00.7bvwja7.mongodb.net:27017,ac-ozwrbkb-shard-00-01.7bvwja7.mongodb.net:27017,ac-ozwrbkb-shard-00-02.7bvwja7.mongodb.net:27017/ai_site_db?ssl=true&replicaSet=atlas-x2yeav-shard-0&authSource=admin&retryWrites=true&w=majority";

await mongoose.connect(MONGODB_URI);
const db = mongoose.connection.db;
const col = db.collection('tools');

// Build id → slug map for every tool in the DB
const allTools = await col.find({}, { projection: { id: 1, slug: 1 } }).toArray();
const idToSlug = {};
for (const t of allTools) {
    if (t.id) idToSlug[t.id] = t.slug;
}
console.log(`Built id→slug map for ${Object.keys(idToSlug).length} tools.\n`);

const isInternalId = (v) => typeof v === 'string' && v.startsWith('tool-');

function resolveArray(arr) {
    if (!Array.isArray(arr)) return { resolved: arr, changed: false };
    let changed = false;
    const resolved = arr.map(v => {
        if (isInternalId(v)) {
            const slug = idToSlug[v];
            if (slug) { changed = true; return slug; }
            console.warn(`  ⚠ No slug found for id "${v}" — keeping as-is`);
        }
        return v;
    });
    return { resolved, changed };
}

let updatedCount = 0;

// Process competitors
const withIdCompetitors = await col.find(
    { competitors: { $elemMatch: { $regex: /^tool-/ } } },
    { projection: { slug: 1, competitors: 1, related_tools: 1 } }
).toArray();

for (const tool of withIdCompetitors) {
    const { resolved: newCompetitors, changed: cChanged } = resolveArray(tool.competitors);
    const { resolved: newRelated, changed: rChanged } = resolveArray(tool.related_tools);

    if (cChanged || rChanged) {
        const update = {};
        if (cChanged) update.competitors = newCompetitors;
        if (rChanged) update.related_tools = newRelated;

        await col.updateOne({ _id: tool._id }, { $set: update });
        updatedCount++;

        if (cChanged) {
            console.log(`✓ ${tool.slug}`);
            console.log(`  competitors BEFORE: ${JSON.stringify(tool.competitors)}`);
            console.log(`  competitors AFTER:  ${JSON.stringify(newCompetitors)}`);
        }
        if (rChanged) {
            console.log(`  related_tools BEFORE: ${JSON.stringify(tool.related_tools)}`);
            console.log(`  related_tools AFTER:  ${JSON.stringify(newRelated)}`);
        }
    }
}

// Process related_tools for tools that only have ID-based related_tools (not already caught above)
const withIdRelated = await col.find(
    {
        related_tools: { $elemMatch: { $regex: /^tool-/ } },
        competitors: { $not: { $elemMatch: { $regex: /^tool-/ } } },
    },
    { projection: { slug: 1, competitors: 1, related_tools: 1 } }
).toArray();

for (const tool of withIdRelated) {
    const { resolved: newRelated, changed: rChanged } = resolveArray(tool.related_tools);
    if (rChanged) {
        await col.updateOne({ _id: tool._id }, { $set: { related_tools: newRelated } });
        updatedCount++;
        console.log(`✓ ${tool.slug} (related_tools only)`);
        console.log(`  related_tools BEFORE: ${JSON.stringify(tool.related_tools)}`);
        console.log(`  related_tools AFTER:  ${JSON.stringify(newRelated)}`);
    }
}

console.log(`\n─── Migration complete: ${updatedCount} tools updated ───`);

// Verify cody-sourcegraph specifically
const cody = await col.findOne({ slug: 'cody-sourcegraph' }, { projection: { slug: 1, competitors: 1, related_tools: 1 } });
console.log('\nVerification — cody-sourcegraph:', JSON.stringify({ competitors: cody.competitors, related_tools: cody.related_tools }, null, 2));

await mongoose.disconnect();

/**
 * Migration: resolve tool-XXXXXXXX ID-based competitor values to slugs.
 * Unresolvable IDs are REMOVED (not kept).
 * Run with: node scripts/migrate-competitor-ids.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const MONGODB_URI =
    "mongodb://alexvest_db_user:CtjaDgKqTnC724ly@ac-ozwrbkb-shard-00-00.7bvwja7.mongodb.net:27017,ac-ozwrbkb-shard-00-01.7bvwja7.mongodb.net:27017,ac-ozwrbkb-shard-00-02.7bvwja7.mongodb.net:27017/ai_site_db?ssl=true&replicaSet=atlas-x2yeav-shard-0&authSource=admin&retryWrites=true&w=majority";

await mongoose.connect(MONGODB_URI);
const db = mongoose.connection.db;
const col = db.collection('tools');

// Build id → {slug, name} map for every tool
const allTools = await col.find({}, { projection: { id: 1, slug: 1, name: 1 } }).toArray();
const idToInfo = new Map();
for (const t of allTools) {
    if (t.id) idToInfo.set(t.id, { slug: t.slug, name: t.name });
}
console.log(`Total tools in DB: ${allTools.length}`);
console.log(`ID→slug map size: ${idToInfo.size}\n`);

// Find all tools with at least one ID-based competitor
const affected = await col.find(
    { competitors: { $elemMatch: { $regex: /^tool-/ } } },
    { projection: { slug: 1, name: 1, competitors: 1 } }
).toArray();

console.log(`Tools with ID-based competitors: ${affected.length}\n`);

let totalResolved = 0;
let totalRemoved = 0;
let totalUpdated = 0;
const report = [];

for (const tool of affected) {
    const oldCompetitors = [...(tool.competitors || [])];
    const newCompetitors = [];
    const changes = [];

    for (const c of oldCompetitors) {
        if (!c.startsWith('tool-')) {
            newCompetitors.push(c); // already a valid slug — keep as-is
            continue;
        }
        const resolved = idToInfo.get(c);
        if (resolved) {
            newCompetitors.push(resolved.slug);
            changes.push({ old: c, newVal: resolved.slug, action: 'resolved', resolvedName: resolved.name });
            totalResolved++;
        } else {
            // Cannot resolve — remove from array
            changes.push({ old: c, newVal: null, action: 'removed — tool not found' });
            totalRemoved++;
        }
    }

    // Deduplicate (slug may already be present alongside its ID twin)
    const deduped = [...new Set(newCompetitors)];

    if (JSON.stringify(oldCompetitors) !== JSON.stringify(deduped)) {
        await col.updateOne({ _id: tool._id }, { $set: { competitors: deduped } });
        totalUpdated++;
        report.push({ toolName: tool.name, toolSlug: tool.slug, oldCompetitors, newCompetitors: deduped, changes });
    }
}

// ── Full migration log ───────────────────────────────────────────────────────
console.log('═'.repeat(72));
console.log('MIGRATION LOG — ALL CHANGES');
console.log('═'.repeat(72));
for (const entry of report) {
    console.log(`\nTool: ${entry.toolName} (${entry.toolSlug})`);
    for (const c of entry.changes) {
        if (c.action === 'resolved') {
            console.log(`  ✓ resolved: ${c.old}  →  ${c.newVal} (${c.resolvedName})`);
        } else {
            console.log(`  ✗ ${c.old}  →  ${c.action}`);
        }
    }
}

// ── Top 5 most affected ──────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(72));
console.log('TOP 5 MOST AFFECTED TOOLS (before → after)');
console.log('═'.repeat(72));
const top5 = [...report].sort((a, b) => b.changes.length - a.changes.length).slice(0, 5);
for (const entry of top5) {
    console.log(`\n${entry.toolName} (${entry.toolSlug})`);
    console.log(`  BEFORE: ${JSON.stringify(entry.oldCompetitors)}`);
    console.log(`  AFTER:  ${JSON.stringify(entry.newCompetitors)}`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(72));
console.log('SUMMARY');
console.log('═'.repeat(72));
console.log(`Tools updated:           ${totalUpdated}`);
console.log(`IDs resolved to slugs:   ${totalResolved}`);
console.log(`IDs removed (not found): ${totalRemoved}`);

// ── Verification ─────────────────────────────────────────────────────────────
const remaining = await col.countDocuments({ competitors: { $elemMatch: { $regex: /^tool-/ } } });
console.log(`\nVerification — tools still with tool-* competitors: ${remaining}`);
if (remaining === 0) {
    console.log('✓ Zero ID-based competitor values remain.');
} else {
    console.log('✗ Some ID-based values still remain — investigate manually.');
    const leftovers = await col.find(
        { competitors: { $elemMatch: { $regex: /^tool-/ } } },
        { projection: { slug: 1, competitors: 1 } }
    ).toArray();
    for (const t of leftovers) console.log(`  ${t.slug}: ${JSON.stringify(t.competitors)}`);
}

await mongoose.disconnect();

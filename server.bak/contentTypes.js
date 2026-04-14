/**
 * contentTypes.js — Structured Content Type Generation System
 *
 * Each content type defines:
 *   - requiredFields: section keys that must be non-empty after parsing
 *   - buildPrompt(context): returns the full system + user prompt string
 *   - mapToFields(sections, toolSlugMap): maps parsed sections → form fields
 *
 * Shared fields (all types emit these for internal linking / SEO graph):
 *   - mentioned_tools   → primary_tools[]
 *   - primary_category  → category[0]
 *   - use_cases[]
 */

// ─── Generic Section Parser ─────────────────────────────────────────────────
/**
 * Parses a flat label: value text output into a key→value map.
 * Handles multi-line values by accumulating lines under the last seen key.
 * Key must be ALL_CAPS_WITH_UNDERSCORES_AND_DIGITS only.
 */
export function parseStructuredOutput(rawText) {
  const sections = {};
  let currentKey = null;
  const lines = rawText.split('\n');

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const potentialKey = line.slice(0, colonIdx).trim();
      // Valid key: uppercase letters, digits, underscores, min 2 chars
      if (/^[A-Z][A-Z0-9_]{1,}$/.test(potentialKey)) {
        currentKey = potentialKey;
        sections[currentKey] = line.slice(colonIdx + 1).trim();
        continue;
      }
    }
    // Continuation of previous key
    if (currentKey && line.trim()) {
      sections[currentKey] += ' ' + line.trim();
    }
  }

  return sections;
}

// ─── Shared Helpers ──────────────────────────────────────────────────────────
function parsePipeList(str) {
  return (str || '').split('|').map(s => s.trim()).filter(Boolean);
}

function parseCommaList(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean);
}

function slugify(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseFaq(sections) {
  const faq = [];
  let i = 1;
  while (sections[`FAQ_${i}_Q`] && sections[`FAQ_${i}_A`]) {
    faq.push({ question: sections[`FAQ_${i}_Q`], answer: sections[`FAQ_${i}_A`] });
    i++;
  }
  return faq;
}

function parseSharedFields(sections) {
  return {
    use_cases: parseCommaList(sections['USE_CASES']),
    // primary_category maps to category[0] — only override if AI returned it
    ...(sections['PRIMARY_CATEGORY'] ? { category: [sections['PRIMARY_CATEGORY']] } : {}),
  };
}

function resolveToolSlugs(namesCsv, toolSlugMap) {
  return parseCommaList(namesCsv).map(name => {
    const known = toolSlugMap[name.toLowerCase()];
    return known || slugify(name);
  }).filter(Boolean);
}

// ─── Content Type Definitions ────────────────────────────────────────────────

const CONTENT_TYPES = {

  // ── BEST-OF ────────────────────────────────────────────────────────────────
  'best-of': {
    label: 'Best-of List',
    requiredFields: ['TITLE', 'INTRO', 'TOOL_1_NAME', 'TOOL_1_SUMMARY', 'VERDICT', 'FAQ_1_Q', 'FAQ_1_A'],

    buildPrompt({ topic, category, toolNames, context }) {
      const toolsInstruction = toolNames.length > 0
        ? `TOOLS TO COVER (required): ${toolNames.join(', ')}`
        : `TOOLS TO COVER: Choose the 5–7 best tools for this category.`;

      return {
        system: `You are a senior tech analyst at ToolCurrent writing structured best-of articles.
You MUST follow the exact output format below — no preamble, no markdown, no extra text.
Every label must appear on its own line followed by a colon and its value.
TONE: Analytical, fact-based, helpful. NO hype, NO exclamation marks.`,

        user: `Write a best-of article about: ${topic || category || 'AI tools'}
Category: ${category || 'AI Tools'}
${toolsInstruction}
${context ? `Additional context: ${context}` : ''}

OUTPUT FORMAT (copy labels exactly):

TITLE: [8–10 word headline, e.g. "The 7 Best AI Writing Tools for Content Creators in 2026"]
INTRO: [2–3 sentence overview of why these tools matter and who they're for]
PRIMARY_CATEGORY: [single category, e.g. AI Writing]
USE_CASES: [comma-separated, e.g. Content Writing, Marketing, SEO]
MENTIONED_TOOLS: [comma-separated tool names you're covering]

[Repeat TOOL_N_* for each tool, numbered 1–7:]
TOOL_1_NAME: [Official tool name]
TOOL_1_SLUG: [url-slug, e.g. chatgpt]
TOOL_1_SUMMARY: [2–3 sentence description of what it does and why it's on this list]
TOOL_1_PROS: [Strength 1] | [Strength 2] | [Strength 3]
TOOL_1_CONS: [Weakness 1] | [Weakness 2]

TOOL_2_NAME: [...]
TOOL_2_SLUG: [...]
TOOL_2_SUMMARY: [...]
TOOL_2_PROS: [...] | [...] | [...]
TOOL_2_CONS: [...] | [...]

[Continue for all tools]

VERDICT: [2–3 sentence summary of the overall recommendation — which tools suit which users]

FAQ_1_Q: [Common question readers have about this topic]
FAQ_1_A: [Detailed, helpful answer]
FAQ_2_Q: [Second question]
FAQ_2_A: [Answer]
FAQ_3_Q: [Third question]
FAQ_3_A: [Answer]`
      };
    },

    mapToFields(sections, toolSlugMap) {
      const tools = [];
      let i = 1;
      while (sections[`TOOL_${i}_NAME`]) {
        const name = sections[`TOOL_${i}_NAME`];
        const slug = sections[`TOOL_${i}_SLUG`] || toolSlugMap[name.toLowerCase()] || slugify(name);
        tools.push({ name, slug, summary: sections[`TOOL_${i}_SUMMARY`] || '', pros: parsePipeList(sections[`TOOL_${i}_PROS`]), cons: parsePipeList(sections[`TOOL_${i}_CONS`]) });
        i++;
      }

      const content = [sections['INTRO'] || ''];
      tools.forEach(t => { if (t.summary) content.push(`${t.name}: ${t.summary}`); });
      if (sections['VERDICT']) content.push(sections['VERDICT']);

      return {
        title: sections['TITLE'] || '',
        excerpt: sections['INTRO'] || '',
        content,
        primary_tools: tools.map(t => toolSlugMap[t.name.toLowerCase()] || t.slug),
        verdict: sections['VERDICT'] || '',
        faq: parseFaq(sections),
        ...parseSharedFields(sections),
      };
    },
  },

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  'review': {
    label: 'Tool Review',
    requiredFields: ['TITLE', 'INTRO', 'TOOL_SLUG', 'PROS', 'CONS', 'VERDICT'],

    buildPrompt({ topic, category, toolNames, context }) {
      const toolName = toolNames[0] || topic || 'the tool';
      return {
        system: `You are a senior product analyst at ToolCurrent writing structured tool reviews.
Follow the exact output format — no preamble, no markdown, no extra text.
TONE: Objective, evidence-based, balanced. No hype.`,

        user: `Write a detailed review of: ${toolName}
Category: ${category || 'AI Tools'}
${context ? `Additional context: ${context}` : ''}

OUTPUT FORMAT (copy labels exactly):

TITLE: [Tool Name Review: 6–10 word analytical headline]
INTRO: [2–3 sentences summarising what the tool is and who it's for]
TOOL_SLUG: [url-slug, e.g. chatgpt]
PRIMARY_CATEGORY: [single category]
USE_CASES: [comma-separated use cases]
MENTIONED_TOOLS: [this tool's name, plus any alternatives mentioned]

PROS: [Strength 1] | [Strength 2] | [Strength 3] | [Strength 4]
CONS: [Weakness 1] | [Weakness 2] | [Weakness 3]
WHO_ITS_FOR: [User type 1] | [User type 2] | [User type 3]
PRICING_ANALYSIS: [2–3 sentences on pricing tiers, value for money, free plan details]

RATING_EASE_OF_USE: [score 1–10]
RATING_FEATURES: [score 1–10]
RATING_PRICING: [score 1–10]
RATING_INTEGRATIONS: [score 1–10]
RATING_PERFORMANCE: [score 1–10]

VERDICT: [2–3 sentences: final recommendation — who should use it and who should skip it]

FAQ_1_Q: [Question]
FAQ_1_A: [Answer]
FAQ_2_Q: [Question]
FAQ_2_A: [Answer]
FAQ_3_Q: [Question]
FAQ_3_A: [Answer]`
      };
    },

    mapToFields(sections, toolSlugMap) {
      const toolSlug = sections['TOOL_SLUG'] || slugify(sections['MENTIONED_TOOLS']?.split(',')[0] || '');
      const content = [sections['INTRO'] || ''];
      if (sections['PRICING_ANALYSIS']) content.push(sections['PRICING_ANALYSIS']);
      if (sections['VERDICT']) content.push(sections['VERDICT']);

      const rating = {
        ease_of_use: parseFloat(sections['RATING_EASE_OF_USE']) || 0,
        features: parseFloat(sections['RATING_FEATURES']) || 0,
        pricing: parseFloat(sections['RATING_PRICING']) || 0,
        integrations: parseFloat(sections['RATING_INTEGRATIONS']) || 0,
        performance: parseFloat(sections['RATING_PERFORMANCE']) || 0,
      };

      return {
        title: sections['TITLE'] || '',
        excerpt: sections['INTRO'] || '',
        content,
        primary_tools: toolSlug ? [toolSlug] : [],
        pros: parsePipeList(sections['PROS']),
        cons: parsePipeList(sections['CONS']),
        who_its_for: parsePipeList(sections['WHO_ITS_FOR']),
        pricing_analysis: sections['PRICING_ANALYSIS'] || '',
        rating_breakdown: rating,
        verdict: sections['VERDICT'] || '',
        faq: parseFaq(sections),
        ...parseSharedFields(sections),
      };
    },
  },

  // ── COMPARISON ─────────────────────────────────────────────────────────────
  'comparison': {
    label: 'Comparison',
    requiredFields: ['TITLE', 'INTRO', 'TOOL_A_SLUG', 'TOOL_B_SLUG', 'ROW_1_LABEL', 'VERDICT'],

    buildPrompt({ topic, category, toolNames, context }) {
      const toolA = toolNames[0] || 'Tool A';
      const toolB = toolNames[1] || 'Tool B';
      return {
        system: `You are a senior tech analyst at ToolCurrent writing structured tool comparison articles.
Follow the exact output format — no preamble, no markdown, no extra text.
TONE: Objective, analytical, side-by-side. No winner bias in the comparison rows.`,

        user: `Write a detailed comparison of: ${toolA} vs ${toolB}
Category: ${category || 'AI Tools'}
${context ? `Additional context: ${context}` : ''}

OUTPUT FORMAT (copy labels exactly):

TITLE: [Tool A vs Tool B: 6–10 word analytical headline]
INTRO: [2–3 sentences setting up the comparison — what makes these two worth comparing]
TOOL_A_SLUG: [url-slug for ${toolA}]
TOOL_B_SLUG: [url-slug for ${toolB}]
PRIMARY_CATEGORY: [single category]
USE_CASES: [comma-separated]
MENTIONED_TOOLS: [${toolA}, ${toolB}]

[8–10 comparison rows:]
ROW_1_LABEL: [Feature / dimension, e.g. Pricing]
ROW_1_A: [${toolA}'s value]
ROW_1_B: [${toolB}'s value]

ROW_2_LABEL: [e.g. Ease of Use]
ROW_2_A: [value]
ROW_2_B: [value]

[Continue rows 3–10]

CHOOSE_A_1: [Choose ${toolA} if: specific scenario]
CHOOSE_A_2: [Choose ${toolA} if: specific scenario]
CHOOSE_A_3: [Choose ${toolA} if: specific scenario]
CHOOSE_B_1: [Choose ${toolB} if: specific scenario]
CHOOSE_B_2: [Choose ${toolB} if: specific scenario]
CHOOSE_B_3: [Choose ${toolB} if: specific scenario]

VERDICT: [2–3 sentence balanced conclusion]

FAQ_1_Q: [Question]
FAQ_1_A: [Answer]
FAQ_2_Q: [Question]
FAQ_2_A: [Answer]
FAQ_3_Q: [Question]
FAQ_3_A: [Answer]`
      };
    },

    mapToFields(sections, toolSlugMap) {
      const rows = [];
      let ri = 1;
      while (sections[`ROW_${ri}_LABEL`]) {
        rows.push({ label: sections[`ROW_${ri}_LABEL`], tool_a_value: sections[`ROW_${ri}_A`] || '', tool_b_value: sections[`ROW_${ri}_B`] || '' });
        ri++;
      }

      const chooseA = [], chooseB = [];
      let ai = 1; while (sections[`CHOOSE_A_${ai}`]) { chooseA.push(sections[`CHOOSE_A_${ai}`]); ai++; }
      let bi = 1; while (sections[`CHOOSE_B_${bi}`]) { chooseB.push(sections[`CHOOSE_B_${bi}`]); bi++; }

      const slugA = sections['TOOL_A_SLUG'] || '';
      const slugB = sections['TOOL_B_SLUG'] || '';
      const toolSlugs = [slugA, slugB].filter(Boolean);

      return {
        title: sections['TITLE'] || '',
        excerpt: sections['INTRO'] || '',
        content: [sections['INTRO'] || '', sections['VERDICT'] || ''].filter(Boolean),
        primary_tools: toolSlugs,
        comparison_tools: toolSlugs,
        comparison_rows: rows,
        choose_tool_a: chooseA,
        choose_tool_b: chooseB,
        verdict: sections['VERDICT'] || '',
        faq: parseFaq(sections),
        ...parseSharedFields(sections),
      };
    },
  },

  // ── GUIDE ──────────────────────────────────────────────────────────────────
  'guide': {
    label: 'Guide',
    requiredFields: ['TITLE', 'INTRO', 'STEP_1_TITLE', 'STEP_1_CONTENT', 'CONCLUSION'],

    buildPrompt({ topic, category, toolNames, context }) {
      const toolsLine = toolNames.length > 0 ? `TOOLS COVERED: ${toolNames.join(', ')}` : '';
      return {
        system: `You are a senior technical writer at ToolCurrent writing step-by-step software guides.
Follow the exact output format — no preamble, no markdown, no extra text.
TONE: Clear, instructional, practical. Focus on actionable steps.`,

        user: `Write a how-to guide about: ${topic || category || 'using AI tools'}
Category: ${category || 'AI Tools'}
${toolsLine}
${context ? `Additional context: ${context}` : ''}

OUTPUT FORMAT (copy labels exactly):

TITLE: [How to [verb] [outcome] — 6–10 words]
INTRO: [2–3 sentences explaining what the reader will achieve and why it matters]
PRIMARY_CATEGORY: [single category]
USE_CASES: [comma-separated]
MENTIONED_TOOLS: [comma-separated tool names used in this guide]

[6–10 steps:]
STEP_1_TITLE: [Action-oriented step title, e.g. "Set up your account"]
STEP_1_CONTENT: [2–4 sentences of clear instructions]
STEP_1_TOOL: [tool-slug or leave empty if no specific tool]

STEP_2_TITLE: [...]
STEP_2_CONTENT: [...]
STEP_2_TOOL: [...]

[Continue steps 3–10]

CONCLUSION: [2–3 sentence wrap-up: what the reader has accomplished and next steps]

FAQ_1_Q: [Question]
FAQ_1_A: [Answer]
FAQ_2_Q: [Question]
FAQ_2_A: [Answer]
FAQ_3_Q: [Question]
FAQ_3_A: [Answer]`
      };
    },

    mapToFields(sections, toolSlugMap) {
      const steps = [];
      let si = 1;
      while (sections[`STEP_${si}_TITLE`]) {
        steps.push({ title: sections[`STEP_${si}_TITLE`], content: sections[`STEP_${si}_CONTENT`] || '', tool_slug: sections[`STEP_${si}_TOOL`] || '' });
        si++;
      }

      // Build content: intro + step titles as subheaders + step content
      const content = [sections['INTRO'] || ''];
      steps.forEach(s => {
        if (s.title) content.push(s.title);
        if (s.content) content.push(s.content);
      });
      if (sections['CONCLUSION']) content.push(sections['CONCLUSION']);

      const mentionedSlugs = resolveToolSlugs(sections['MENTIONED_TOOLS'] || '', toolSlugMap);

      return {
        title: sections['TITLE'] || '',
        excerpt: sections['INTRO'] || '',
        content,
        primary_tools: mentionedSlugs,
        steps,
        faq: parseFaq(sections),
        ...parseSharedFields(sections),
      };
    },
  },

  // ── USE-CASE ───────────────────────────────────────────────────────────────
  'use-case': {
    label: 'Use Case',
    requiredFields: ['TITLE', 'INTRO', 'STAGE_1_TITLE', 'STAGE_1_DESCRIPTION'],

    buildPrompt({ topic, category, toolNames, context }) {
      const toolsLine = toolNames.length > 0 ? `TOOLS IN WORKFLOW: ${toolNames.join(', ')}` : '';
      return {
        system: `You are a workflow specialist at ToolCurrent documenting real-world AI tool use cases.
Follow the exact output format — no preamble, no markdown, no extra text.
TONE: Practical, scenario-driven, specific. Show how tools work together.`,

        user: `Write a use case article about: ${topic || category || 'AI workflow'}
Category: ${category || 'AI Tools'}
${toolsLine}
${context ? `Additional context: ${context}` : ''}

OUTPUT FORMAT (copy labels exactly):

TITLE: [How [persona] Uses AI to [outcome] — 8–12 words]
INTRO: [2–3 sentences setting up the scenario — who, what challenge, what outcome]
PRIMARY_CATEGORY: [single category]
USE_CASES: [comma-separated]
MENTIONED_TOOLS: [comma-separated tool names in this workflow]

[4–6 workflow stages:]
STAGE_1_TITLE: [Stage name, e.g. "Research & Discovery"]
STAGE_1_DESCRIPTION: [2–3 sentences describing what happens at this stage]
STAGE_1_TOOLS: [tool-slug-1, tool-slug-2]

STAGE_2_TITLE: [...]
STAGE_2_DESCRIPTION: [...]
STAGE_2_TOOLS: [...]

[Continue stages 3–6]

OUTCOMES: [Outcome 1] | [Outcome 2] | [Outcome 3] | [Outcome 4]

FAQ_1_Q: [Question]
FAQ_1_A: [Answer]
FAQ_2_Q: [Question]
FAQ_2_A: [Answer]
FAQ_3_Q: [Question]
FAQ_3_A: [Answer]`
      };
    },

    mapToFields(sections, toolSlugMap) {
      const stages = [];
      let si = 1;
      while (sections[`STAGE_${si}_TITLE`]) {
        stages.push({
          stage_title: sections[`STAGE_${si}_TITLE`],
          description: sections[`STAGE_${si}_DESCRIPTION`] || '',
          tool_slugs: parseCommaList(sections[`STAGE_${si}_TOOLS`] || '').map(s => toolSlugMap[s.toLowerCase()] || slugify(s)),
        });
        si++;
      }

      const content = [sections['INTRO'] || ''];
      stages.forEach(s => {
        if (s.stage_title) content.push(s.stage_title);
        if (s.description) content.push(s.description);
      });

      const mentionedSlugs = resolveToolSlugs(sections['MENTIONED_TOOLS'] || '', toolSlugMap);

      return {
        title: sections['TITLE'] || '',
        excerpt: sections['INTRO'] || '',
        content,
        primary_tools: mentionedSlugs,
        who_its_for: parsePipeList(sections['OUTCOMES']),
        workflow_stages: stages,
        faq: parseFaq(sections),
        ...parseSharedFields(sections),
      };
    },
  },

  // ── NEWS ───────────────────────────────────────────────────────────────────
  'news': {
    label: 'News',
    requiredFields: ['TITLE', 'EXCERPT', 'PARA_1', 'PARA_2'],

    buildPrompt({ topic, category, toolNames, context }) {
      return {
        system: `You are a senior tech journalist at ToolCurrent writing software news articles.
Follow the exact output format — no preamble, no markdown, no extra text.
TONE: Investigative, factual, analytical. No hype, no exclamation marks.`,

        user: `Write a news article about: ${topic || category || 'AI tool developments'}
Category: ${category || 'AI Tools'}
${context ? `Additional context: ${context}` : ''}

OUTPUT FORMAT (copy labels exactly):

TITLE: [8–10 word investigative headline]
EXCERPT: [1 sentence factual teaser]
PRIMARY_CATEGORY: [single category]
USE_CASES: [comma-separated]
MENTIONED_TOOLS: [comma-separated tool names]

PARA_1: [3–5 sentence opening paragraph — the key finding]
PARA_2: [3–5 sentence paragraph — context and background]
PARA_3: [3–5 sentence paragraph — analysis or impact]
PARA_4: [3–5 sentence paragraph — broader implications]
PARA_5: [3–5 sentence closing paragraph — future outlook, cold factual finding]

CONTEXT_TITLE: [Short title for the context box, e.g. "Key Statistics"]
CONTEXT_CONTENT: [2–3 sentences of supporting data or background detail]
CONTEXT_SOURCE: [Source name, e.g. "Gartner 2026 Report"]`
      };
    },

    mapToFields(sections, toolSlugMap) {
      const paragraphs = [];
      let pi = 1;
      while (sections[`PARA_${pi}`]) { paragraphs.push(sections[`PARA_${pi}`]); pi++; }

      const mentionedSlugs = resolveToolSlugs(sections['MENTIONED_TOOLS'] || '', toolSlugMap);

      return {
        title: sections['TITLE'] || '',
        excerpt: sections['EXCERPT'] || '',
        content: paragraphs,
        primary_tools: mentionedSlugs,
        contextBox: {
          title: sections['CONTEXT_TITLE'] || '',
          content: sections['CONTEXT_CONTENT'] || '',
          source: sections['CONTEXT_SOURCE'] || '',
        },
        faq: [],
        ...parseSharedFields(sections),
      };
    },
  },
  // ── TOOL PROFILE ───────────────────────────────────────────────────────────
  'tool': {
    label: 'Tool Profile',
    requiredFields: ['NAME', 'SLUG', 'SHORT_DESCRIPTION', 'LONG_DESCRIPTION', 'CATEGORY', 'FEATURES', 'PROS', 'CONS'],

    buildPrompt({ topic, category, context }) {
      const toolName = topic || 'the tool';
      return {
        system: `You are a senior product analyst at ToolCurrent writing structured tool profiles.
Follow the exact output format — no preamble, no markdown, no extra text.
TONE: Factual, precise, benefit-oriented. Use vendor-agnostic language.`,

        user: `Write a complete tool profile for: ${toolName}
Category: ${category || 'AI Tools'}
${context ? `Additional context: ${context}` : ''}

OUTPUT FORMAT (copy labels exactly):

NAME: [Official product name]
SLUG: [url-slug, e.g. chatgpt]
SHORT_DESCRIPTION: [1–2 sentences: what it does and who it's for]
LONG_DESCRIPTION_1: [Paragraph 1: overview and core value proposition]
LONG_DESCRIPTION_2: [Paragraph 2: how it works / key technology]
LONG_DESCRIPTION_3: [Paragraph 3: primary use cases and target audience]
CATEGORY: [primary category, e.g. AI Writing]
USE_CASES: [comma-separated, e.g. Content Writing, Marketing, SEO]
PRICING: [pricing model and key tier details in 1–2 sentences]
PRICING_MODEL: [one of: Free, Freemium, Paid, Enterprise]

FEATURES: [Feature 1] | [Feature 2] | [Feature 3] | [Feature 4] | [Feature 5] | [Feature 6]
PROS: [Pro 1] | [Pro 2] | [Pro 3] | [Pro 4]
CONS: [Con 1] | [Con 2] | [Con 3]
INTEGRATIONS: [Integration 1] | [Integration 2] | [Integration 3] | [Integration 4]
PLATFORMS: [Web] or [Web, Mobile, Desktop, API] — list applicable ones
WHO_ITS_FOR: [User type 1] | [User type 2] | [User type 3]

META_TITLE: [Tool Name Review & Pricing (Year) — 50–60 chars]
META_DESCRIPTION: [1–2 sentence search-intent summary — 140–160 chars]`
      };
    },

    mapToFields(sections) {
      const longDesc = [
        sections['LONG_DESCRIPTION_1'],
        sections['LONG_DESCRIPTION_2'],
        sections['LONG_DESCRIPTION_3']
      ].filter(Boolean).join('\n\n');

      return {
        // These map to Tool model fields, not Article fields
        _targetModel: 'tool',
        name: sections['NAME'] || '',
        slug: sections['SLUG'] || '',
        short_description: sections['SHORT_DESCRIPTION'] || '',
        full_description: longDesc,
        category_primary: sections['CATEGORY'] || '',
        category_tags: parseCommaList(sections['CATEGORY']),
        use_case_tags: parseCommaList(sections['USE_CASES']),
        key_features: parsePipeList(sections['FEATURES']),
        pros: parsePipeList(sections['PROS']),
        cons: parsePipeList(sections['CONS']),
        integrations: parsePipeList(sections['INTEGRATIONS']),
        supported_platforms: parseCommaList(sections['PLATFORMS']),
        who_its_for: parsePipeList(sections['WHO_ITS_FOR']),
        pricing_analysis: sections['PRICING'] || '',
        pricing_model: sections['PRICING_MODEL'] || 'Freemium',
        meta_title: sections['META_TITLE'] || '',
        meta_description: sections['META_DESCRIPTION'] || '',
        // Shared fields
        use_cases: parseCommaList(sections['USE_CASES']),
      };
    },
  },
};

// ─── Validator ───────────────────────────────────────────────────────────────
export function validateStructuredOutput(sections, contentType) {
  const schema = CONTENT_TYPES[contentType];
  if (!schema) return { valid: false, errors: [`Unknown content type: ${contentType}`] };

  const errors = [];
  for (const field of schema.requiredFields) {
    if (!sections[field] || !sections[field].trim()) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns { system, user } prompt strings for the given content type.
 */
export function buildStructuredPrompt(contentType, context) {
  const schema = CONTENT_TYPES[contentType];
  if (!schema) throw new Error(`Unknown content type: ${contentType}`);
  return schema.buildPrompt(context);
}

/**
 * Maps parsed sections → partial form fields for the given content type.
 * toolSlugMap: { 'tool name lowercase': 'tool-slug' }
 */
export function mapSectionsToFields(sections, contentType, toolSlugMap = {}) {
  const schema = CONTENT_TYPES[contentType];
  if (!schema) throw new Error(`Unknown content type: ${contentType}`);
  return schema.mapToFields(sections, toolSlugMap);
}

export { CONTENT_TYPES };

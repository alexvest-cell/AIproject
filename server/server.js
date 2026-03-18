import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import multer from 'multer';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { seedArticles as stackBriefArticles, seedTools, seedComparisons, seedStacks } from './seed_data_toolcurrent.js';
import dns from 'dns';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Fix DNS resolution issues on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Content Type Generation System
import { buildStructuredPrompt, parseStructuredOutput, validateStructuredOutput, mapSectionsToFields } from './contentTypes.js';
import { parseToolInput } from './toolParser.js';

// Models
import Article from './models/Article.js';
import Subscriber from './models/Subscriber.js';
import Tool from './models/Tool.js';
import Comparison from './models/Comparison.js';
import Stack from './models/Stack.js';
import Category from './models/Category.js';
import UseCase from './models/UseCase.js';

const app = express();
const port = 3000;

// Configs
// In production, these come from the environment (Render dashboard).
// Locally, they come from .env.local
const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
// Gemini Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (GEMINI_API_KEY) {
  console.log('✓ Gemini API Key found');
} else {
  console.error('❌ Gemini API Key NOT found. AI features will fail.');
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// --- SEO ROUTES (Robots & Sitemap) ---
// ==========================================

// SEO: Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://toolcurrent.com/sitemap.xml`);
});

// SEO: Dynamic Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' }).select('slug updatedAt createdAt date');
    const tools = await Tool.find({ status: 'Active' }).select('slug updatedAt');
    const comparisons = await Comparison.find({ status: 'published' }).select('slug updatedAt');
    const stacks = await Stack.find({ status: 'Published' }).select('slug updatedAt');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static Pages
    const staticPages = ['', 'ai-tools', 'best-software', 'reviews', 'comparisons', 'stacks', 'use-cases', 'guides', 'news', 'about'];
    staticPages.forEach(p => {
      xml += `  <url>\n    <loc>https://toolcurrent.com/${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${p === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    // Dynamic: Articles
    articles.forEach(a => {
      const lastMod = new Date(a.updatedAt || a.createdAt || a.date).toISOString().split('T')[0];
      xml += `  <url>\n    <loc>https://toolcurrent.com/article/${a.slug || a.id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Dynamic: Tools
    tools.forEach(t => {
      xml += `  <url>\n    <loc>https://toolcurrent.com/tools/${t.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>https://toolcurrent.com/tools/${t.slug}/alternatives</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    // Dynamic: Comparisons
    comparisons.forEach(c => {
      xml += `  <url>\n    <loc>https://toolcurrent.com/compare/${c.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // Dynamic: Stacks
    stacks.forEach(s => {
      xml += `  <url>\n    <loc>https://toolcurrent.com/stacks/${s.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += '</urlset>';
    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Database Connection
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    family: 4, // Force IPv4
  })
    .then(async () => {
      console.log('✓ Connected to MongoDB');
      await seedDatabase();
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      console.log('⚠️  Server will use local file storage as fallback');
    });
} else {
  console.warn('⚠️ MONGODB_URI is not set. Using local file storage.');
}

// Cloudinary Config
if (CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
} else {
  console.warn('⚠️ CLOUDINARY credentials not set. Image uploads will fail. Please add to .env.local');
}

// Slugify Helper
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with hyphens
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

// Seeding Logic
async function seedDatabase() {
  try {
    // 1. Seed Articles
    const count = await Article.countDocuments();
    if (count === 0) {
      console.log('Seeding database with ToolCurrent articles...');
      const formattedSeed = stackBriefArticles.map(a => ({
        ...a,
        content: Array.isArray(a.content) ? a.content : [a.content],
        slug: a.slug || generateSlug(a.title)
      }));
      await Article.insertMany(formattedSeed);
      console.log('Article seeding complete.');
    }

    // 2. Seed Tools
    console.log('Syncing ToolCurrent tools...');
    for (const tool of seedTools) {
      await Tool.findOneAndUpdate(
        { slug: tool.slug },
        tool,
        { upsert: true, new: true }
      );
    }
    console.log('Tool sync complete.');

    // 3. Seed Comparisons
    console.log('Syncing ToolCurrent comparisons...');
    for (const comparison of seedComparisons) {
      await Comparison.findOneAndUpdate(
        { slug: comparison.slug },
        comparison,
        { upsert: true, new: true }
      );
    }
    console.log('Comparison sync complete.');

    // 4. Seed Stacks
    const stackCount = await Stack.countDocuments();
    if (stackCount < seedStacks.length) {
      console.log('Updating database with ToolCurrent stacks (missing stacks detected)...');
      for (const stack of seedStacks) {
        await Stack.findOneAndUpdate(
          { slug: stack.slug },
          stack,
          { upsert: true, new: true }
        );
      }
      console.log('Stacks sync complete.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Multer setup for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: Stream Upload to Cloudinary
const streamUpload = (buffer, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// --- AUTHENTICATION ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123'; // Set in .env.local
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'your-secret-key-change-this'; // Set in .env.local

// Simple token generation (in production, use JWT)
function generateToken() {
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
}

// Store valid tokens (in-memory, resets on server restart)
const validTokens = new Set();

// Global request logger to debug routing issues
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware to verify admin token
function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or missing token' });
  }

  next();
}

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = generateToken();
    validTokens.add(token);

    // Token expires in 24 hours
    setTimeout(() => validTokens.delete(token), 24 * 60 * 60 * 1000);

    res.json({ token, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token) {
    validTokens.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

// Verify token endpoint (check if still logged in)
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (token && validTokens.has(token)) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

// --- ROUTES ---

// GET Articles (public - no auth required)
app.get('/api/articles', async (req, res) => {
  try {
    const { includeUnpublished } = req.query;
    const token = req.headers['authorization']?.replace('Bearer ', '');
    const isAdmin = token && validTokens.has(token);

    // If no DB, return local file storage or seed data
    if (mongoose.connection.readyState !== 1) {
      console.log('No DB connection - checking local storage');
      const localArticles = readLocalArticles();
      if (localArticles.length > 0) {
        console.log(`Returning ${localArticles.length} articles from local storage`);
        return res.json(localArticles);
      }
      console.log('Returning seed data (no local storage yet)');
      return res.json(seedArticles);
    }

    let query = {};

    // Only show all articles (including drafts) if admin AND requested unpublished
    if (!(isAdmin && includeUnpublished === 'true')) {
      const now = new Date();
      query = {
        $or: [
          { status: 'published' },
          { status: 'scheduled', scheduledPublishDate: { $lte: now } },
          { status: { $exists: false } } // Backward compatibility for old articles
        ]
      };
    }

    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET Related Content for an Article (Tools, Comparisons, Related Articles)
app.get('/api/articles/:slug/related', async (req, res) => {
  try {
    const MAX_RELATED_TOOLS = 12;
    const MAX_RELATED_ARTICLES = 6;

    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const primaryToolSlugs = article.primary_tools || [];

    // Fetch related active tools by primary_tools slugs
    let tools = await Tool.find({
      slug: { $in: primaryToolSlugs },
      status: 'Active'
    }).limit(MAX_RELATED_TOOLS).lean();

    // Fallback: if no primary_tools, return popular tools
    if (tools.length === 0) {
      tools = await Tool.find({ status: 'Active' })
        .sort({ rating_score: -1, review_count: -1 })
        .limit(8)
        .lean();
    }

    // Fetch related comparisons involving any primary tool
    const comparisonQuery = primaryToolSlugs.length > 0
      ? { $or: [
          { tool_a_slug: { $in: primaryToolSlugs } },
          { tool_b_slug: { $in: primaryToolSlugs } },
          { tool_c_slug: { $in: primaryToolSlugs } }
        ], status: 'published' }
      : null;
    const comparisons = comparisonQuery
      ? await Comparison.find(comparisonQuery).limit(4).lean()
      : [];

    // Fetch related articles (same category or topic, exclude current)
    const articleCategories = Array.isArray(article.category)
      ? article.category
      : (article.category ? [article.category] : []);
    const relatedOrClauses = [];
    if (articleCategories.length > 0) relatedOrClauses.push({ category: { $in: articleCategories } });
    if (article.topic) relatedOrClauses.push({ topic: article.topic });
    const relatedArticles = relatedOrClauses.length > 0
      ? await Article.find({ _id: { $ne: article._id }, $or: relatedOrClauses })
          .sort({ createdAt: -1 })
          .limit(MAX_RELATED_ARTICLES)
          .select('id title slug excerpt imageUrl category topic article_type date')
          .lean()
      : [];

    res.json({ tools, comparisons, relatedArticles });
  } catch (error) {
    console.error('GET /api/articles/:slug/related error:', error);
    res.status(500).json({ error: 'Failed to fetch related content' });
  }
});

// GET Articles Backup/Export (protected - requires auth)
app.get('/api/articles/export', requireAuth, async (req, res) => {
  try {
    let articles;

    // If no DB, get from local storage or seed data
    if (mongoose.connection.readyState !== 1) {
      const localArticles = readLocalArticles();
      articles = localArticles.length > 0 ? localArticles : seedArticles;
    } else {
      articles = await Article.find().sort({ createdAt: -1 });
    }

    // Set headers for file download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="greenshift-backup-${timestamp}.json"`);

    res.json({
      exportDate: new Date().toISOString(),
      totalArticles: articles.length,
      articles: articles
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export articles' });
  }
});

// GET Image URLs Backup/Export (protected - requires auth)
app.get('/api/articles/export-images', requireAuth, async (req, res) => {
  try {
    let articles;

    // If no DB, get from local storage or seed data
    if (mongoose.connection.readyState !== 1) {
      const localArticles = readLocalArticles();
      articles = localArticles.length > 0 ? localArticles : seedArticles;
    } else {
      articles = await Article.find().sort({ createdAt: -1 });
    }

    // Collect all unique image URLs
    const imageData = [];
    const uniqueUrls = new Set();

    articles.forEach(article => {
      const images = [];

      // Main image
      if (article.imageUrl && !uniqueUrls.has(article.imageUrl)) {
        images.push({ type: 'main', url: article.imageUrl });
        uniqueUrls.add(article.imageUrl);
      }

      // Original image
      if (article.originalImageUrl && !uniqueUrls.has(article.originalImageUrl)) {
        images.push({ type: 'original', url: article.originalImageUrl });
        uniqueUrls.add(article.originalImageUrl);
      }

      // Secondary image
      if (article.secondaryImageUrl && !uniqueUrls.has(article.secondaryImageUrl)) {
        images.push({ type: 'secondary', url: article.secondaryImageUrl });
        uniqueUrls.add(article.secondaryImageUrl);
      }

      // Diagram
      if (article.diagramUrl && !uniqueUrls.has(article.diagramUrl)) {
        images.push({ type: 'diagram', url: article.diagramUrl });
        uniqueUrls.add(article.diagramUrl);
      }

      if (images.length > 0) {
        imageData.push({
          articleId: article.id,
          articleTitle: article.title,
          images: images
        });
      }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="greenshift-images-backup-${timestamp}.json"`);

    res.json({
      exportDate: new Date().toISOString(),
      totalArticles: articles.length,
      totalUniqueImages: uniqueUrls.size,
      imageData: imageData
    });
  } catch (error) {
    console.error('Image export error:', error);
    res.status(500).json({ error: 'Failed to export image URLs' });
  }
});


// GET Comparisons (public)
app.get('/api/comparisons', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(seedComparisons);
    }
    const comparisons = await Comparison.find({ status: 'published' }).lean();
    // Populate tool_a and tool_b from tools collection
    const tools = await Tool.find().lean();
    const toolMap = Object.fromEntries(tools.map(t => [t.slug, t]));
    const enriched = comparisons.map(c => ({
      ...c,
      tool_a: toolMap[c.tool_a_slug] || null,
      tool_b: toolMap[c.tool_b_slug] || null,
    }));
    res.json(enriched);
  } catch (err) {
    console.error('GET /api/comparisons error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET Comparison by slug
app.get('/api/comparisons/:slug', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const cmp = seedComparisons.find(c => c.slug === req.params.slug);
      return cmp ? res.json(cmp) : res.status(404).json({ error: 'Not found' });
    }
    const comparison = await Comparison.findOne({ slug: req.params.slug }).lean();
    if (!comparison) return res.status(404).json({ error: 'Comparison not found' });
    const tools = await Tool.find({ slug: { $in: [comparison.tool_a_slug, comparison.tool_b_slug] } }).lean();
    const toolMap = Object.fromEntries(tools.map(t => [t.slug, t]));
    res.json({
      ...comparison,
      tool_a: toolMap[comparison.tool_a_slug] || null,
      tool_b: toolMap[comparison.tool_b_slug] || null,
    });
  } catch (err) {
    console.error(`GET /api/comparisons/${req.params.slug} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

// POST Article (protected - requires auth)
app.post('/api/articles', requireAuth, async (req, res) => {
  try {
    const newArticle = req.body;

    // Ensure ID and timestamps
    if (!newArticle.id) {
      newArticle.id = 'gen-' + Date.now();
    }
    if (!newArticle.createdAt) {
      newArticle.createdAt = new Date().toISOString();
    }
    newArticle.updatedAt = new Date().toISOString();

    // Ensure Slug
    if (!newArticle.slug && newArticle.title) {
      newArticle.slug = generateSlug(newArticle.title);
    }

    // Normalize content to array if string
    if (typeof newArticle.content === 'string') {
      newArticle.content = [newArticle.content];
    }

    // If no DB, use local storage
    if (mongoose.connection.readyState !== 1) {
      console.log('No DB - saving to local storage');
      const articles = readLocalArticles();
      articles.push(newArticle);
      if (writeLocalArticles(articles)) {
        return res.status(201).json(newArticle);
      } else {
        return res.status(500).json({ error: 'Failed to write to local storage' });
      }
    }

    const created = await Article.create(newArticle);
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    // Handle duplicate key error (likely slug collision)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate article ID or Slug. Please change the title.' });
    }
    res.status(500).json({ error: 'Failed to create article. Error: ' + error.message });
  }
});

// PUT Article (protected - requires auth)
app.put('/api/articles/:id', requireAuth, async (req, res) => {
  try {
    const articleId = req.params.id;
    const updates = req.body;
    updates.updatedAt = new Date().toISOString();

    // If no DB, use local storage
    if (mongoose.connection.readyState !== 1) {
      console.log('No DB - updating in local storage');
      const articles = readLocalArticles();
      const index = articles.findIndex(a => a.id === articleId);
      if (index === -1) {
        return res.status(404).json({ error: 'Article not found in local storage' });
      }
      articles[index] = { ...articles[index], ...updates };
      if (writeLocalArticles(articles)) {
        return res.json(articles[index]);
      } else {
        return res.status(500).json({ error: 'Failed to write to local storage' });
      }
    }

    const updated = await Article.findOneAndUpdate({ id: articleId }, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'Article not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update article. Error: ' + error.message });
  }
});

// DELETE Article (protected - requires auth)
app.delete('/api/articles/:id', requireAuth, async (req, res) => {
  try {
    const articleId = req.params.id;

    // If no DB, use local storage
    if (mongoose.connection.readyState !== 1) {
      console.log('No DB - deleting from local storage');
      const articles = readLocalArticles();
      const filtered = articles.filter(a => a.id !== articleId);
      if (filtered.length === articles.length) {
        return res.status(404).json({ error: 'Article not found' });
      }
      if (writeLocalArticles(filtered)) {
        return res.json({ success: true });
      } else {
        return res.status(500).json({ error: 'Failed to write to local storage' });
      }
    }

    const deleted = await Article.findOneAndDelete({ id: articleId });
    if (!deleted) return res.status(404).json({ error: 'Article not found' });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete article. Error: ' + error.message });
  }
});

// UPLOAD Image or Audio (Cloudinary)
app.post('/api/upload', upload.fields([{ name: 'image' }, { name: 'audio' }]), async (req, res) => {
  const imageFile = req.files?.image?.[0];
  const audioFile = req.files?.audio?.[0];

  console.log('Upload request received');
  console.log('Files:', req.files);
  console.log('Image file:', imageFile ? `${imageFile.originalname} (${imageFile.size} bytes)` : 'none');
  console.log('Audio file:', audioFile ? `${audioFile.originalname} (${audioFile.size} bytes)` : 'none');

  if (!imageFile && !audioFile) {
    console.error('No file in request');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    let result;
    if (imageFile) {
      console.log('Uploading image to Cloudinary...');
      result = await streamUpload(imageFile.buffer, 'image');
    } else if (audioFile) {
      console.log('Uploading audio to Cloudinary as video resource...');
      result = await streamUpload(audioFile.buffer, 'video'); // Cloudinary uses 'video' for audio files
    }

    console.log('Upload successful:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: `Upload failed: ${error.message}. Cloudinary configured?` });
  }
});

// Test endpoint to trigger digest email
app.post('/api/test-digest', async (req, res) => {
  try {
    const { email } = req.body;
    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    const previewUrl = await sendDigestEmail(subscriber.email, subscriber.topics);
    res.json({ success: true, previewUrl });
  } catch (error) {
    console.error('Test digest error:', error);
    res.status(500).json({ error: 'Failed to send test digest' });
  }
});

// POST Subscribe
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, topics, timezone } = req.body;

    // Check if exists
    let subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      subscriber = await Subscriber.create({
        email,
        topics,
        timezone: timezone || 'UTC'
      });
    } else {
      // Update topics if already exists (optional behavior)
      subscriber.topics = topics;
      if (timezone) subscriber.timezone = timezone;
      await subscriber.save();
    }

    // Send Welcome Email
    sendDigestEmail(email, topics, true);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Subscription failed' });
  }
});


// --- AI ASSISTANT (Gemini) ---

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type, model: selectedModel, category, topic, minMinutes, maxMinutes } = req.body;


    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    console.log(`[AI Request] Type: ${type}, Model: ${selectedModel}`);


    const context = (category || topic) ? `Category: ${category || 'N/A'}, Topic: ${topic || 'N/A'}. ` : "";
    let systemPrompt = "";


    if (type === 'title') {
      systemPrompt = `You are a senior editor at a prestigious global news organization. ${context}
      Goal: Provide a high-level investigative summary as a headline.
      
      FORBIDDEN PATTERNS:
      - NO short tags or generic titles (e.g., FORBIDDEN: "Reefs in Peril", "Arctic Melting").
      - Absolutely NO exclamation marks (!).
      - Absolutely NO calls to action ("Save", "Protect", "Act", "Join", "Discover why", "Let's").
      - NO promotional hype or "clickbait" tags (Alert, Crisis, Urgent).
      
      IDEAL PATTERN (8-10 Word Investigative Finding):
      - "The unseen thermal anomalies disrupting deep-water currents in the North Atlantic"
      - "Systemic failures in tropical forest monitoring projects across the Amazon"
      
      STRUCTURAL RULES:
      - LENGTH: Must be between 8 and 10 words.
      - TONE: Serious, investigative, factual.
      - Use an intellectual "Curiosity Gap"—describe a hidden discovery.`;
    } else if (type === 'body') {
      systemPrompt = `You are an expert environmental journalist. ${context}
      Write a concise, engaging article body (4-5 paragraphs).
      
      STRICT JOURNALISTIC RULES:
      - ABSOLUTELY NO CALLS TO ACTION: No "Join us", "Save the planet", "Protect our future", or "Let's come together".
      - NO EXCLAMATION MARKS: Use zero "!".
      - CONCLUSION RULE: The article MUST end with a factual, objective summary of the future implications or systemic trends. NO community appeals.
      - TONE: Serious, descriptive, data-focused.`;
    } else if (type === 'image_prompt') {
      systemPrompt = `You are an expert photo editor for a top-tier news agency (like Reuters or National Geographic). 
      Based on the article title and content provided, write a highly detailed image generation prompt suitable for Midjourney v6 or DALL-E 3.
      
      STYLE GUIDE:
      - **CRITICAL: Generate the image with a 4:3 ASPECT RATIO (Landscape).**
      - ULTRA-REALISTIC PHOTOGRAPHY, 8k resolution, raw photo style, shot on Sony A7R IV or similar
      - Journalistic, documentary style, "on the ground" perspective (eye level)
      - True to life colors and lighting (natural light, realistic depth of field)
      - AVOID: abstract art, illustrations, diagrams, maps, "overviews", collage, or conceptual 3D renders.
      - The image must look exactly like a real photograph taken by a professional photojournalist.
      
      Output ONLY the raw prompt text (no "Here is a prompt:", just the prompt itself).`;
    } else if (type === 'social') {
      systemPrompt = `You are a social media expert for a premium environmental news platform.
      Based on the article content provided, generate optimized social media posts.

      REQUIREMENTS (JOURNALISTIC TONE & SEO):
      - Write as an investigative journalist uncovering a discovery.
      - NO GENERIC CALLS TO ACTION (e.g., "Learn more", "Check our link", "Read now").
      - MANDATORY FOOTER: Every post MUST end with exactly: "Read on thetoolcurrent.com". This comes after everything else (including hashtags).
      - ABSOLUTELY NO EXCLAMATION MARKS. Use zero hype.
      - The text should be a fascinating, factual summary that draws the reader in purely based on the intrigue of the fact.
      - INCLUDE HASHTAGS: Append 3-5 highly relevant, trending AI and tech hashtags (e.g., #ArtificialIntelligence, #TechNews) to the end of each post's text.
      1. Twitter/X: Concise, punchy, under 280 chars, informative. MUST include hashtags and the mandatory footer.
      2. Facebook/Instagram/TikTok: Sophisticated, storytelling tone, zero promotion. MUST include hashtags and the mandatory footer.
      
      FOR EACH PLATFORM, ALSO PROVIDE A "VISUAL HEADLINE" (HOOK):
      - A punchy investigative finding (8-10 words). 
      - RULES: No "!", no calls-to-action, no promotional verbs (Save, Help, Join, Discover).
      - Must create an immediate, intellectual Curiosity Gap by describing a specific hidden systemic truth.
      - TONE: Serious reporter sharing a discovery.
      
      Generate a JSON object (NO markdown):
      {
        "twitter": { 
          "text": "Text for X...", 
          "headline": "Short Visual Headline" 
        },
        "facebook": { 
          "text": "Text for FB...", 
          "headline": "Short Visual Headline" 
        },
        "instagram": { 
          "text": "Text for Insta...", 
          "headline": "Short Visual Headline" 
        },
        "tiktok": { 
          "text": "Text for TikTok...", 
          "headline": "Short Visual Headline" 
        }
      }`;
    } else if (type === 'full') {
      const targetLength = minMinutes && maxMinutes ? `${minMinutes}-${maxMinutes}` : '5-7';
      const wordCount = Math.floor(((parseInt(minMinutes) || 5) + (parseInt(maxMinutes) || 7)) / 2 * 200);

      systemPrompt = `You are an expert tech journalist writing for ToolCurrent, a premium technology intelligence platform.
      
      Based on the user's prompt, generate a comprehensive, factual environmental news article.

      REQUIREMENTS:
      - Target Length: ${targetLength} minutes (approximately ${wordCount} words)
      - ${context}

      Generate a JSON object with the following structure (DO NOT include markdown code blocks, just raw JSON):

      {
        "title": "Serious 8-10 word investigative finding. FORBIDDEN: Short tags like 'Reefs in Peril'. NO '!', NO CTA.",
        "excerpt": "Sophisticated 1-sentence teaser summarizing the investigative core.",
        "content": ["Array of 6-10 substantial paragraphs, each 3-5 sentences. Focus on facts, data, and impact. Include specific numbers and sources where relevant."],
        "contextBox": {
          "title": "A short title for additional context (e.g., 'The Science Behind It', 'Key Policy Details')",
          "content": "2-3 sentences providing crucial background information or data that enhances understanding",
          "source": "Credible source for this context (e.g., 'IPCC 2023 Report', 'Nature Climate Change')"
        },
        "publicationDate": "The date of the most recent data or event mentioned (format: 'Mon YYYY', e.g., 'Jan 2026')",
        "keywords": ["Array of exactly 20 trending, relevant keywords related to the article content, focusing on environmental topics, policies, locations, and key concepts"]
      }

      IMPORTANT: 
      - Be factual and cite realistic sources.
      - ABSOLUTELY NO CALLS TO ACTION OR EXCLAMATIONS.
      - NO COMMUNITY APPEALS (e.g., "Let's protect this").
      - The article must end with a cold, factual finding about future systemic risk or scientific progress.
      - Ensure keywords are diverse and relevant.`;
    }

    // --- ROUTE TO PROVIDER ---
    const modelLower = (selectedModel || "").toLowerCase().trim();

    if (modelLower.startsWith('gpt-') || modelLower.includes('openai')) {
      console.log(`[AI Route] Routing to OpenAI handler for model: ${selectedModel}`);
      return handleOpenAI(req, res, systemPrompt, prompt, selectedModel || "gpt-4o");
    } else {
      const geminiModel = selectedModel || "gemini-1.5-flash-latest";
      console.log(`[AI Route] Routing to Gemini handler for model: ${geminiModel}`);
      return handleGemini(req, res, systemPrompt, prompt, geminiModel, apiKey, context, type);
    }

  } catch (err) {
    console.error(`[/api/generate Critical Error]`, err);
    res.status(500).json({ error: err.message });
  }
});


// ─── Structured Content Generation ──────────────────────────────────────────
app.post('/api/generate/structured', async (req, res) => {
  try {
    const { contentType, topic, category, toolSlugs = [], context = '', model: selectedModel } = req.body;

    if (!contentType) return res.status(400).json({ error: 'contentType is required' });

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

    // Resolve tool slugs → names and build slug map for reverse lookup
    const toolDocs = toolSlugs.length > 0
      ? await Tool.find({ slug: { $in: toolSlugs }, status: 'Active' }, 'slug name').lean()
      : [];
    const toolNames = toolDocs.map(t => t.name);
    const toolSlugMap = Object.fromEntries(toolDocs.map(t => [t.name.toLowerCase(), t.slug]));

    // Build prompt from content type schema
    const { system, user } = buildStructuredPrompt(contentType, { topic, category, toolNames, context });

    console.log(`\n--- [Structured Gen] Type: ${contentType}, Topic: ${topic} ---`);

    // Call Gemini (structured generation always uses Gemini)
    const geminiModel = (selectedModel || 'gemini-1.5-pro-latest');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

    const payload = {
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
    };

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      console.error('[Structured Gen] Gemini error:', errBody);
      return res.status(geminiRes.status).json({ error: errBody.error?.message || 'Gemini API error' });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawText) return res.status(500).json({ error: 'Empty response from Gemini' });

    // Parse structured output
    const sections = parseStructuredOutput(rawText);

    // Validate required fields
    const { valid, errors } = validateStructuredOutput(sections, contentType);
    if (!valid) {
      console.warn('[Structured Gen] Validation failed:', errors);
      return res.json({ valid: false, errors, raw: rawText, sections });
    }

    // Map to form fields
    const fields = mapSectionsToFields(sections, contentType, toolSlugMap);

    // Compute read time from content word count
    const wordCount = (fields.content || []).join(' ').split(/\s+/).length;
    fields.originalReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    fields.read_time = Math.max(1, Math.ceil(wordCount / 200));

    console.log(`[Structured Gen] Success — ${Object.keys(sections).length} sections, ${fields.content?.length || 0} content blocks`);
    res.json({ valid: true, fields, raw: rawText, sections });

  } catch (err) {
    console.error('[/api/generate/structured error]', err);
    res.status(500).json({ error: err.message });
  }
});

// --- SCHEDULER ---

cron.schedule('0 * * * *', async () => {
  console.log('Running hourly digest scheduler...');
  if (mongoose.connection.readyState !== 1) return; // Skip if no DB

  try {
    const subscribers = await Subscriber.find();
    subscribers.forEach(sub => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: sub.timezone,
          weekday: 'long',
          hour: 'numeric',
          hour12: false
        });
        const parts = formatter.formatToParts(now);
        const weekday = parts.find(p => p.type === 'weekday')?.value;
        const hour = parts.find(p => p.type === 'hour')?.value;

        if (weekday === 'Friday' && hour === '12') {
          console.log(`Sending digest to ${sub.email}`);
          sendDigestEmail(sub.email, sub.topics, false);
        }
      } catch (e) {
        console.error(`Error processing schedule for ${sub.email}:`, e);
      }
    });
  } catch (err) {
    console.error('Scheduler DB Error:', err);
  }
});

// Auto-publish scheduled articles (runs every minute)
cron.schedule('* * * * *', async () => {
  if (mongoose.connection.readyState !== 1) return; // Skip if no DB

  try {
    const now = new Date();
    const articlesToPublish = await Article.find({
      status: 'scheduled',
      scheduledPublishDate: { $lte: now }
    });

    if (articlesToPublish.length > 0) {
      console.log(`Auto-publishing ${articlesToPublish.length} scheduled article(s)...`);

      for (const article of articlesToPublish) {
        article.status = 'published';
        article.publishedAt = now;
        await article.save();
        console.log(`✓ Published: ${article.title}`);
      }
    }
  } catch (err) {
    console.error('Auto-publish scheduler error:', err);
  }
});

const sendDigestEmail = async (email, topics, isWelcome = false) => {
  // Fetch specific articles from DB
  let relevantArticles = [];
  if (mongoose.connection.readyState === 1) {
    const allArticles = await Article.find().sort({ createdAt: -1 });
    relevantArticles = allArticles
      .filter(a => {
        const articleCats = Array.isArray(a.category) ? a.category : [a.category];
        return articleCats.some(cat => topics.includes(cat));
      })
      .slice(0, 6);
  } else {
    // Fallback
    relevantArticles = seedArticles.slice(0, 4);
  }

  // HTML EMAIL GENERATION (Keep existing style)
  const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
  const articleRows = chunk(relevantArticles, 2);

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #18181b; color: #ffffff; }
        .container { max-width: 640px; margin: 0 auto; background-color: #18181b; }
        .header { padding: 40px 20px; border-bottom: 1px solid #27272a; text-align: center; }
        .header h1 { margin: 0; font-family: Georgia, serif; font-size: 28px; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; }
        .accent { color: #10b981; }
        .content { padding: 40px 20px; }
        .article-img { width: 100%; aspect-ratio: 3/2; border-radius: 8px; margin-bottom: 16px; display: block; object-fit: cover; background-color: #27272a; }
        .btn { display: inline-block; padding: 8px 16px; background-color: #ffffff; color: #000000; text-decoraion: none; font-weight: bold; font-size: 10px; border-radius: 4px; text-transform: uppercase; }
      </style>
    </head>
    <body style="background-color: #18181b; margin: 0; padding: 0;">
      <div class="container">
        <div class="header"><h1><span class="accent">The Stack</span>Brief</h1></div>
        <div class="content">
          ${isWelcome ? '<p style="text-align:center">Welcome to the inner circle.</p>' : '<p style="text-align:center">Your weekly articles.</p>'}
          ${articleRows.map(row => `
            <div style="display: flex; gap: 20px; margin-bottom: 30px;">
              ${row.map(a => `
                  <div style="flex: 1;">
                    ${a.imageUrl ? `<img src="${a.imageUrl}" class="article-img" />` : ''}
                    <h3 style="color:white; margin: 10px 0;">${a.title}</h3>
                    <p style="color:#a1a1aa; font-size: 14px;">${a.excerpt}</p>
                    <a href="https://your-site.onrender.com/?article=${a.id}" class="btn">Read</a>
                  </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;

  let transporter;

  // 1. Try to use Real SMTP if configured (e.g. Gmail App Password)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail', // Built-in support for Gmail
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`Using Real SMTP (${process.env.SMTP_USER})`);
  }
  // 2. Fallback to Ethereal (Test Mode)
  else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("Using Ethereal Fake SMTP (Test Mode)");
  }

  const info = await transporter.sendMail({
    from: '"ToolCurrent" <briefing@thetoolcurrent.com>',
    to: email,
    subject: isWelcome ? "Welcome to ToolCurrent" : "Your Weekly Intelligence Report",
    html: emailHtml,
  });

  console.log(`Email sent to ${email} (Topics: ${topics}). Preview: ${nodemailer.getTestMessageUrl(info)}`);
};

// --- SERVE FRONTEND (Production) ---
// NOTE: Static middleware intentionally placed at END of file (after all API routes).
// See lines 1627+ for the correct static + SPA fallback.

// --- AI Endpoints ---

app.post('/api/analyze', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Server AI Key missing' });
  const { prompt } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are ToolCurrent AI, an intelligent assistant.
        Goal: Answer user questions on the technology stack, AI, and future trends with high accuracy.
        Tone: Helpful, authoritative, scientific, yet accessible. Avoid alarmism.
        Format: Keep responses concise (under 200 words) unless asked for deep dive. Use markdown.
        Verification: Rely on consensus science (IPCC, NOAA, etc.).`,
      }
    });

    res.json({ text: response.text() || "Analysis incomplete." });
  } catch (error) {
    console.error("Gemini Analysis API Error:", error);
    res.status(500).json({ error: 'AI Error' });
  }
});

app.post('/api/speech', async (req, res) => {
  const { articleId } = req.body;

  if (!articleId) {
    return res.status(400).json({ error: 'Article ID required' });
  }

  try {
    // Only return cached audio from database
    const article = await Article.findOne({ id: articleId });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (!article.audioUrl) {
      return res.status(404).json({ error: 'Audio not yet generated for this article' });
    }

    // Fetch from Cloudinary
    const cloudParams = await fetch(article.audioUrl);
    if (cloudParams.ok) {
      const buffer = await cloudParams.arrayBuffer();
      const audioData = Buffer.from(buffer).toString('base64');
      return res.json({ audioData });
    } else {
      return res.status(500).json({ error: 'Failed to fetch audio from storage' });
    }
  } catch (error) {
    console.error("Audio fetch error:", error);
    res.status(500).json({ error: 'Audio fetch error' });
  }
});

// Admin-only: Generate audio for an article
app.post('/api/generate-audio', requireAuth, async (req, res) => {
  // Note: Text-to-Speech API requires enabling the API in Google Cloud Console
  // and may require a different API key than Gemini

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Server AI Key missing',
      details: 'Please add GEMINI_API_KEY to environment variables'
    });
  }

  const { articleId } = req.body;

  console.log('=== GENERATE AUDIO ENDPOINT HIT ===');
  console.log('Article ID:', articleId);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  if (!articleId) {
    return res.status(400).json({ error: 'Article ID required' });
  }

  try {
    // Fetch article from database
    const article = await Article.findOne({ id: articleId });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Prepare text to read
    let textToRead;

    // Priority 1: Use voiceover text provided in request (real-time preview from CMS)
    if (req.body.voiceoverText && req.body.voiceoverText.trim().length > 0) {
      textToRead = req.body.voiceoverText;
      console.log(`Using provided voiceover text from request (${textToRead.length} chars)`);
    }
    // Priority 2: Use saved voiceover text from database
    else if (article.voiceoverText && article.voiceoverText.trim().length > 0) {
      textToRead = article.voiceoverText;
      console.log(`Using saved voiceover text from DB (${textToRead.length} chars)`);
    }
    // Priority 3: Fallback to full article content
    else {
      const contentArray = Array.isArray(article.content) ? article.content : [article.content];
      textToRead = `${article.title}. ${article.excerpt}. ${contentArray.join(' ')}`;
      console.log(`Using full article content for audio (${textToRead.length} chars)`);
    }


    console.log(`Generating audio for article: ${articleId}`);
    console.log(`Text source: ${textToRead ? 'voiceoverText' : 'full article'}`);
    console.log(`Text length: ${textToRead.length} characters`);


    // Preprocess text to reduce glitches
    // Clean up common issues that cause TTS glitches
    const cleanText = textToRead
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .replace(/\.{2,}/g, '.') // Replace multiple periods with single period
      .replace(/\s+([.,!?])/g, '$1') // Remove space before punctuation
      .replace(/([.,!?])([^\s])/g, '$1 $2') // Add space after punctuation if missing
      .trim();

    console.log('Preprocessed text for TTS');


    // Add pauses between sentences by inserting ellipses
    // This is simpler and more reliable than SSML for Journey voices
    const sentences = cleanText
      .split(/([.!?]+\s+)/) // Split on sentence-ending punctuation, keep delimiters
      .filter(s => s.trim().length > 0) // Remove empty strings
      .reduce((acc, curr, idx, arr) => {
        // Combine sentence text with its punctuation
        if (idx % 2 === 0 && arr[idx + 1]) {
          acc.push(curr + arr[idx + 1]);
        } else if (idx % 2 === 0) {
          acc.push(curr);
        }
        return acc;
      }, []);

    // Join sentences with longer ellipses to create more pronounced pauses
    // Triple ellipses create ~600-800ms pauses vs single ellipsis ~200ms
    const textWithPauses = sentences.join('... ... ... ');

    console.log(`Processed ${sentences.length} sentences with extended pause markers`);

    // Use Google Cloud Text-to-Speech API
    const textToSpeechUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';

    const ttsResponse = await fetch(textToSpeechUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        input: { text: textWithPauses }, // Use plain text with extended ellipses for pauses
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Journey-D' // Back to male voice (user preferred)
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95, // Natural pace with extended pauses between sentences
          pitch: 0.0,
          volumeGainDb: -4.0 // Reduce volume by 4dB to prevent clipping
        }
      })
    });


    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json().catch(() => ({}));
      console.error('TTS API error response:', JSON.stringify(errorData, null, 2));
      console.error('TTS API status:', ttsResponse.status, ttsResponse.statusText);

      // Provide helpful error message
      if (errorData.error?.status === 'PERMISSION_DENIED') {
        throw new Error('Text-to-Speech API not enabled. Please enable it in Google Cloud Console and ensure your API key has access.');
      }

      // Include full error details for debugging
      const errorMessage = errorData.error?.message || errorData.error?.details?.[0]?.message || ttsResponse.statusText;
      throw new Error(`Text-to-Speech API failed: ${errorMessage}`);
    }

    const ttsData = await ttsResponse.json();
    const audioData = ttsData.audioContent;

    if (!audioData) {
      console.error('No audio data in TTS response');
      throw new Error('Audio generation failed - no audio data returned');
    }

    // Upload to Cloudinary with explicit audio configuration
    const buffer = Buffer.from(audioData, 'base64');

    // Upload with explicit resource type and format
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary treats audio as 'video'
          format: 'mp3',
          folder: 'planetary_brief_audio',
          quality: 'auto:best', // Preserve maximum quality, don't re-encode
          audio_codec: 'mp3' // Keep original MP3 codec
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('Cloudinary upload failed');
    }

    // Update article with audioUrl
    await Article.findOneAndUpdate(
      { id: articleId },
      { audioUrl: uploadResult.secure_url }
    );

    console.log(`Audio generated and cached for ${articleId}: ${uploadResult.secure_url}`);

    res.json({
      success: true,
      audioUrl: uploadResult.secure_url,
      message: 'Audio generated successfully'
    });
  } catch (error) {
    console.error("Audio generation error:", error);
    res.status(500).json({
      error: 'Audio generation failed',
      details: error.message
    });
  }
});




// --- AI PROVIDER ROUTING ---

// --- GOOGLE GEMINI HANDLER ---
async function handleGemini(req, res, systemPrompt, prompt, model, apiKey, context, type) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  console.log(`\n--- [AI] GEMINI SYSTEM PROMPT (Type: ${type}) ---`);
  console.log(systemPrompt);
  console.log(`-----------------------------------------------\n`);

  try {
    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: `Generate ${type} content based on: ${prompt}` }]
      }]
    };

    console.log(`[AI] Calling Gemini [${model}] with system_instruction...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error(`[AI] Gemini API Error Status: ${response.status}`);
      console.error(`[AI] Gemini API Error Body:`, JSON.stringify(errorBody, null, 2));

      if (response.status === 403) {
        return res.status(403).json({
          error: 'Gemini API Permission Denied (403)',
          details: errorBody.error?.message || 'Access blocked. Check your API key or service enablement.',
          reason: errorBody.error?.status || 'API_KEY_SERVICE_BLOCKED'
        });
      }

      throw new Error(`Gemini API Error: ${errorBody.error?.message || response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return processAIResponse(res, text, type);
  } catch (err) {
    console.error(`[Gemini Error]`, err);
    return res.status(500).json({ error: err.message });
  }
}

// --- OPENAI HANDLER ---
async function handleOpenAI(req, res, systemPrompt, prompt, model) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY. Please ensure it is set in your environment variables or .env.local file.' });
  }

  console.log(`\n--- [AI] OPENAI SYSTEM PROMPT (Type: ${req.body.type}) ---`);
  console.log(systemPrompt);
  console.log(`------------------------------------------------\n`);

  try {
    console.log(`[AI] Calling OpenAI [${model}]...`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error(`[AI] OpenAI Error:`, errData);
      throw new Error(errData.error?.message || `OpenAI Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    return processAIResponse(res, text, req.body.type);
  } catch (err) {
    console.error(`[OpenAI Error]`, err);
    return res.status(500).json({ error: err.message });
  }
}

// --- SHARED RESPONSE PROCESSOR ---
function processAIResponse(res, text, type) {
  if (!text) {
    console.warn("[AI] Empty response from AI");
    return res.status(500).json({ error: 'Empty response from AI' });
  }

  if (type === 'full' || type === 'social') {
    try {
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }
      const result = JSON.parse(cleanedText);

      if (type === 'full') {
        const totalWords = result.content && Array.isArray(result.content) ? result.content.join(' ').split(/\s+/).length : 500;
        const readTimeMinutes = Math.ceil(totalWords / 200);
        result.readTime = `${readTimeMinutes} min read`;
      }

      if (type === 'social') {
        const normalized = {};
        const normalizeEntry = (entry) => {
          if (typeof entry === 'string') return { text: entry, headline: "PLANETARY BRIEF" };
          return {
            text: entry.text || entry.content || "",
            headline: entry.headline || entry.title || "PLANETARY BRIEF"
          };
        };

        for (const key in result) {
          const lower = key.toLowerCase();
          if (lower.includes('twitter') || lower === 'x') normalized.twitter = normalizeEntry(result[key]);
          else if (lower.includes('facebook')) normalized.facebook = normalizeEntry(result[key]);
          else if (lower.includes('instagram')) normalized.instagram = normalizeEntry(result[key]);
          else if (lower.includes('tiktok')) normalized.tiktok = normalizeEntry(result[key]);
        }
        return res.json(normalized);
      }

      return res.json(result);
    } catch (e) {
      console.error("JSON Parse Error on text:", text);
      return res.status(500).json({ error: 'AI output was not valid JSON', raw: text });
    }
  }

  return res.json({ text });
}


// ==========================================
// --- TOOLS API ---
// ==========================================

// GET all tools (public)
app.get('/api/tools', async (req, res) => {
  try {
    const { category, pricing, use_case, status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category_tags = category;
    if (pricing) query.pricing_model = pricing;
    if (use_case) query.use_case_tags = use_case;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { short_description: { $regex: search, $options: 'i' } },
        { category_tags: { $regex: search, $options: 'i' } }
      ];
    }

    const { sort, limit } = req.query;
    const sortOrder = sort === 'popular' ? { rating_score: -1, review_count: -1 } : { name: 1 };
    const limitNum = limit ? Math.min(parseInt(limit), 100) : 0;
    const toolsQuery = Tool.find(query).sort(sortOrder);
    if (limitNum > 0) toolsQuery.limit(limitNum);
    const tools = await toolsQuery.lean();
    res.json(tools);
  } catch (error) {
    console.error('GET /api/tools error:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// GET single tool by slug (public)
app.get('/api/tools/:slug', async (req, res) => {
  try {
    const tool = await Tool.findOne({ slug: req.params.slug });
    if (!tool) return res.status(404).json({ error: 'Tool not found' });

    // Also fetch related comparisons
    const comparisons = await Comparison.find({
      $or: [
        { tool_a_slug: req.params.slug },
        { tool_b_slug: req.params.slug },
        { tool_c_slug: req.params.slug }
      ],
      status: 'published'
    });

    // Fetch articles referencing this tool OR covering the tool's categories
    const relatedArticles = await Article.find({
      $or: [
        { primary_tools: req.params.slug },
        { category: { $in: tool.category_tags || [] } }
      ],
      status: 'published'
    }).sort({ createdAt: -1 }).limit(10);

    // Fetch stacks that feature this tool
    const stacks = await Stack.find({
      tools: req.params.slug,
      status: 'Published'
    }).lean();

    res.json({ tool, comparisons, relatedArticles, stacks });
  } catch (error) {
    console.error('GET /api/tools/:slug error:', error);
    res.status(500).json({ error: 'Failed to fetch tool' });
  }
});

// POST create tool (auth required)

// GET alternatives for a tool (public)
// Algorithm: find tools sharing category tags, rank by overlap count then rating, limit 12
app.get('/api/tools/:slug/alternatives', async (req, res) => {
  try {
    const { slug } = req.params;

    if (mongoose.connection.readyState !== 1) {
      // No DB: return empty alternatives gracefully
      return res.json({ tool: null, alternatives: [], comparisons: [], relatedArticles: [] });
    }

    const tool = await Tool.findOne({ slug }).lean();
    if (!tool) return res.status(404).json({ error: 'Tool not found' });

    // Find other active tools that share at least one category tag
    const candidates = await Tool.find({
      slug: { $ne: slug },
      status: 'Active',
      category_tags: { $in: tool.category_tags || [] }
    }).lean();

    // Score by category tag overlap, then rating
    const scored = candidates.map(t => {
      const overlap = (t.category_tags || []).filter(tag =>
        (tool.category_tags || []).includes(tag)
      ).length;
      return { ...t, _score: overlap * 10 + (t.rating_score || 0) };
    });

    scored.sort((a, b) => b._score - a._score);
    const alternatives = scored.slice(0, 12);

    // Comparisons involving this tool
    const comparisons = await Comparison.find({
      $or: [
        { tool_a_slug: slug },
        { tool_b_slug: slug },
        { tool_c_slug: slug }
      ],
      status: 'published'
    }).lean();

    // Related ranking/guide articles mentioning this tool
    const relatedArticles = await Article.find({
      primary_tools: slug,
      status: 'published'
    }).sort({ createdAt: -1 }).limit(6).lean();

    res.json({ tool, alternatives, comparisons, relatedArticles });
  } catch (error) {
    console.error('GET /api/tools/:slug/alternatives error:', error);
    res.status(500).json({ error: 'Failed to fetch alternatives' });
  }
});


// Parse raw tagged input → validated CMS fields (does NOT save)
app.post('/api/tools/parse', requireAuth, async (req, res) => {
  const { rawText } = req.body;
  if (!rawText || typeof rawText !== 'string') {
    return res.status(400).json({ status: 'error', errors: ['rawText is required'] });
  }
  const result = parseToolInput(rawText);
  res.json(result);
});

app.post('/api/tools', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = 'tool-' + Date.now();
    if (!data.slug && data.name) data.slug = generateSlug(data.name);
    data.createdAt = new Date();
    data.updatedAt = new Date();

    const tool = await Tool.create(data);
    res.status(201).json(tool);
  } catch (error) {
    console.error('POST /api/tools error:', error);
    if (error.code === 11000) return res.status(400).json({ error: 'Tool with this slug already exists.' });
    res.status(500).json({ error: 'Failed to create tool: ' + error.message });
  }
});

// PUT update tool (auth required)
app.put('/api/tools/:id', requireAuth, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    const tool = await Tool.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    res.json(tool);
  } catch (error) {
    console.error('PUT /api/tools/:id error:', error);
    res.status(500).json({ error: 'Failed to update tool: ' + error.message });
  }
});

// DELETE tool (auth required)
app.delete('/api/tools/:id', requireAuth, async (req, res) => {
  try {
    const tool = await Tool.findOneAndDelete({ id: req.params.id });
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tools/:id error:', error);
    res.status(500).json({ error: 'Failed to delete tool: ' + error.message });
  }
});


// ==========================================
// --- STACKS API ---
// ==========================================

// GET all stacks (public)
app.get('/api/stacks', async (req, res) => {
  try {
    const stacks = await Stack.find({ status: 'Published' }).sort({ createdAt: -1 }).lean();

    // Collect first 3 tool slugs per stack for logo previews (single query)
    const previewSlugs = [...new Set(stacks.flatMap(s => (s.tools || []).slice(0, 3)))];
    const toolDocs = previewSlugs.length
      ? await Tool.find({ slug: { $in: previewSlugs } }, 'slug name logo').lean()
      : [];
    const toolMap = Object.fromEntries(toolDocs.map(t => [t.slug, { slug: t.slug, name: t.name, logo: t.logo }]));

    const enriched = stacks.map(s => ({
      ...s,
      toolPreviews: (s.tools || []).slice(0, 3).map(slug => toolMap[slug] || { slug, name: slug, logo: null })
    }));

    res.json(enriched);
  } catch (error) {
    console.error('GET /api/stacks error:', error);
    res.status(500).json({ error: 'Failed to fetch stacks' });
  }
});

// GET single stack by slug (public)
// Includes fully populated tools, comparisons containing those tools, and articles containing those tools
app.get('/api/stacks/:slug', async (req, res) => {
  try {
    const stack = await Stack.findOne({ slug: req.params.slug }).lean();
    if (!stack) return res.status(404).json({ error: 'Stack not found' });

    // Populate tools
    const tools = await Tool.find({ slug: { $in: stack.tools }, status: 'Active' }).lean();
    
    // Sort tools to match the order in the stack.tools array
    const toolMap = Object.fromEntries(tools.map(t => [t.slug, t]));
    const populatedTools = stack.tools.map(slug => toolMap[slug]).filter(Boolean);

    // Fetch articles referencing these tools or matching the stack's workflow category
    const relatedArticles = await Article.find({
      $or: [
        { primary_tools: { $in: stack.tools } },
        { category: stack.workflow_category }
      ],
      status: 'published'
    }).sort({ createdAt: -1 }).limit(10).lean();

    // Fetch comparisons involving these tools
    const comparisons = await Comparison.find({
      $or: [
        { tool_a_slug: { $in: stack.tools } },
        { tool_b_slug: { $in: stack.tools } },
        { tool_c_slug: { $in: stack.tools } }
      ],
      status: 'published'
    }).limit(6).lean();

    // Related stacks: same workflow category, excluding current
    const relatedStacks = await Stack.find({
      workflow_category: stack.workflow_category,
      slug: { $ne: stack.slug },
      status: 'Published'
    }).limit(4).lean();

    // Alternative tools: for each stack tool, find 2 tools sharing category_tags but not in this stack
    const allCategoryTags = [...new Set(tools.flatMap(t => t.category_tags || []))];
    const altCandidates = allCategoryTags.length
      ? await Tool.find({
          category_tags: { $in: allCategoryTags },
          slug: { $nin: stack.tools },
          status: 'Active'
        }, 'slug name logo short_description category_tags pricing_model rating_score').limit(40).lean()
      : [];

    // Build per-tool alternatives map (slug -> [Tool, ...])
    const alternativeTools = {};
    for (const t of tools) {
      const tags = t.category_tags || [];
      alternativeTools[t.slug] = altCandidates
        .filter(a => a.category_tags && a.category_tags.some(tag => tags.includes(tag)))
        .slice(0, 2);
    }

    res.json({ stack, tools: populatedTools, relatedArticles, comparisons, relatedStacks, alternativeTools });
  } catch (error) {
    console.error('GET /api/stacks/:slug error:', error);
    res.status(500).json({ error: 'Failed to fetch stack' });
  }
});


// ==========================================
// --- CATEGORIES API ---
// ==========================================

// GET all categories (public)
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' }).sort({ name: 1 }).lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single category with enriched data (public)
app.get('/api/categories/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).lean();
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const MAX_TOOLS = 100;
    const MAX_ARTICLES = 8;

    // All tools in this category (matched by category_tags containing the category name)
    const tools = await Tool.find({
      category_tags: { $regex: new RegExp(category.name, 'i') },
      status: 'Active'
    }).sort({ rating_score: -1 }).limit(MAX_TOOLS).lean();

    // Featured tools (pinned by editor)
    const featuredToolSlugs = category.featured_tools || [];
    const featuredTools = featuredToolSlugs.length > 0
      ? tools.filter(t => featuredToolSlugs.includes(t.slug))
      : tools.slice(0, 4);

    // Best-of articles for this category
    const bestSoftwareArticles = await Article.find({
      $or: [{ category: { $in: [category.name] } }, { primary_tools: { $in: tools.map(t => t.slug) } }],
      article_type: { $in: ['best-of', 'ranking'] },
      status: 'published'
    }).sort({ createdAt: -1 }).limit(MAX_ARTICLES).lean();

    // Guides for this category
    const guides = await Article.find({
      $or: [{ category: { $in: [category.name] } }, { primary_tools: { $in: tools.map(t => t.slug) } }],
      article_type: 'guide',
      status: 'published'
    }).sort({ createdAt: -1 }).limit(MAX_ARTICLES).lean();

    // Related categories
    const relatedSlugs = category.related_categories || [];
    const relatedCategories = relatedSlugs.length > 0
      ? await Category.find({ slug: { $in: relatedSlugs }, status: 'active' }).lean()
      : await Category.find({ _id: { $ne: category._id }, status: 'active' }).limit(6).lean();

    // Use cases relevant to this category
    const useCases = await UseCase.find({
      $or: [
        { primary_category: category.slug },
        { primary_category: category.name }
      ],
      status: 'active'
    }).lean();

    // Comparisons featuring tools in this category (up to 6)
    const categoryToolSlugs = tools.map(t => t.slug);
    const comparisons = await Comparison.find({
      $or: [
        { tool_a_slug: { $in: categoryToolSlugs } },
        { tool_b_slug: { $in: categoryToolSlugs } }
      ],
      status: 'published'
    }).limit(6).lean();

    res.json({ category, tools, featuredTools, bestSoftwareArticles, guides, relatedCategories, useCases, comparisons });
  } catch (err) {
    console.error('GET /api/categories/:slug error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create category (protected)
app.post('/api/categories', requireAuth, async (req, res) => {
  try {
    const { name, slug, description, icon, parent_category, featured_tools, related_categories, meta_title, meta_description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ error: `Category slug "${slug}" already exists` });
    const category = new Category({ name, slug, description, icon, parent_category, featured_tools: featured_tools || [], related_categories: related_categories || [], meta_title, meta_description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update category (protected)
app.put('/api/categories/:slug', requireAuth, async (req, res) => {
  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category (protected)
app.delete('/api/categories/:slug', requireAuth, async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// --- USE CASES API ---
// ==========================================

// GET all use cases (public)
app.get('/api/use-cases', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'active' };
    if (category) query.$or = [{ primary_category: category }, { primary_category: new RegExp(category, 'i') }];
    const useCases = await UseCase.find(query).sort({ name: 1 }).lean();
    res.json(useCases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET use case with related tools (public)
app.get('/api/use-cases/:slug', async (req, res) => {
  try {
    const useCase = await UseCase.findOne({ slug: req.params.slug }).lean();
    if (!useCase) return res.status(404).json({ error: 'Use case not found' });

    // Find tools matching this use case tag
    const tools = await Tool.find({
      $or: [
        { use_case_tags: { $regex: new RegExp(useCase.name, 'i') } },
        { slug: { $in: useCase.related_tools || [] } }
      ],
      status: 'Active'
    }).sort({ rating_score: -1 }).limit(20).lean();

    const guides = await Article.find({
      $or: [{ use_cases: { $in: [useCase.name, useCase.slug] } }, { topic: { $regex: new RegExp(useCase.name, 'i') } }],
      article_type: 'guide',
      status: 'published'
    }).limit(6).lean();

    res.json({ useCase, tools, guides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create use case (protected)
app.post('/api/use-cases', requireAuth, async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
    const existing = await UseCase.findOne({ slug });
    if (existing) return res.status(409).json({ error: `UseCase slug "${slug}" already exists` });
    const useCase = new UseCase(req.body);
    await useCase.save();
    res.status(201).json(useCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update use case (protected)
app.put('/api/use-cases/:slug', requireAuth, async (req, res) => {
  try {
    const updated = await UseCase.findOneAndUpdate(
      { slug: req.params.slug },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'UseCase not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE use case (protected)
app.delete('/api/use-cases/:slug', requireAuth, async (req, res) => {
  try {
    const deleted = await UseCase.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: 'UseCase not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// --- COMPARISONS API ---
// ==========================================

// GET all comparisons (public)
app.get('/api/comparisons', async (req, res) => {
  try {
    const comparisons = await Comparison.find({ status: 'published' }).sort({ createdAt: -1 });

    // Enrich with tool data
    const enriched = await Promise.all(comparisons.map(async (c) => {
      const tool_a = await Tool.findOne({ slug: c.tool_a_slug }).select('name slug logo short_description pricing_model rating_score');
      const tool_b = await Tool.findOne({ slug: c.tool_b_slug }).select('name slug logo short_description pricing_model rating_score');
      const tool_c = c.tool_c_slug ? await Tool.findOne({ slug: c.tool_c_slug }).select('name slug logo short_description pricing_model rating_score') : null;
      return { ...c.toObject(), tool_a, tool_b, tool_c };
    }));

    res.json(enriched);
  } catch (error) {
    console.error('GET /api/comparisons error:', error);
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
});

// GET single comparison by slug (public)
app.get('/api/comparisons/:slug', async (req, res) => {
  try {
    const comparison = await Comparison.findOne({ slug: req.params.slug });
    if (!comparison) return res.status(404).json({ error: 'Comparison not found' });

    // Enrich with full tool data
    const tool_a = await Tool.findOne({ slug: comparison.tool_a_slug });
    const tool_b = await Tool.findOne({ slug: comparison.tool_b_slug });
    const tool_c = comparison.tool_c_slug ? await Tool.findOne({ slug: comparison.tool_c_slug }) : null;

    // Fetch alternative comparisons
    const alternativeComparisons = await Comparison.find({
      $or: [
        { tool_a_slug: { $in: [comparison.tool_a_slug, comparison.tool_b_slug] } },
        { tool_b_slug: { $in: [comparison.tool_a_slug, comparison.tool_b_slug] } },
        { tool_c_slug: { $in: [comparison.tool_a_slug, comparison.tool_b_slug] } }
      ],
      slug: { $ne: req.params.slug },
      status: 'published'
    }).limit(5);

    // Fetch related rankings
    const relatedRankings = await Article.find({
      primary_tools: { $in: [comparison.tool_a_slug, comparison.tool_b_slug] },
      status: 'published'
    }).sort({ createdAt: -1 }).limit(4);

    res.json({ ...comparison.toObject(), tool_a, tool_b, tool_c, alternativeComparisons, relatedRankings });
  } catch (error) {
    console.error('GET /api/comparisons/:slug error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

// POST create comparison (auth required)
app.post('/api/comparisons', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = 'cmp-' + Date.now();
    if (!data.slug && data.title) data.slug = generateSlug(data.title);
    data.createdAt = new Date();
    data.updatedAt = new Date();

    const comparison = await Comparison.create(data);
    res.status(201).json(comparison);
  } catch (error) {
    console.error('POST /api/comparisons error:', error);
    if (error.code === 11000) return res.status(400).json({ error: 'Comparison with this slug already exists.' });
    res.status(500).json({ error: 'Failed to create comparison: ' + error.message });
  }
});

// PUT update comparison (auth required)
app.put('/api/comparisons/:id', requireAuth, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    const comparison = await Comparison.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
    if (!comparison) return res.status(404).json({ error: 'Comparison not found' });
    res.json(comparison);
  } catch (error) {
    console.error('PUT /api/comparisons/:id error:', error);
    res.status(500).json({ error: 'Failed to update comparison: ' + error.message });
  }
});

// DELETE comparison (auth required)
app.delete('/api/comparisons/:id', requireAuth, async (req, res) => {
  try {
    const comparison = await Comparison.findOneAndDelete({ id: req.params.id });
    if (!comparison) return res.status(404).json({ error: 'Comparison not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/comparisons/:id error:', error);
    res.status(500).json({ error: 'Failed to delete comparison: ' + error.message });
  }
});

// ==========================================
// --- SEO & SSR-LITE ---
// ==========================================

// Helper to inject meta tags into index.html
async function serveWithMeta(req, res, title, description) {
  try {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (!fs.existsSync(indexPath)) {
      // Fallback if build doesn't exist (helpful for local dev)
      return res.send(`<html><head><title>${title}</title><meta name="description" content="${description}"></head><body><div id="root"></div><script type="module" src="/index.tsx"></script></body></html>`);
    }

    let html = fs.readFileSync(indexPath, 'utf8');

    // Replace Title
    const titleRegex = /<title>(.*?)<\/title>/;
    const newTitleTag = `<title>${title} | ToolCurrent</title>`;
    if (titleRegex.test(html)) {
      html = html.replace(titleRegex, newTitleTag);
    } else {
      html = html.replace('</head>', `${newTitleTag}</head>`);
    }

    // Replace or Add Description
    const metaDescRegex = /<meta name="description" content="(.*?)" \/>/;
    const newMetaDesc = `<meta name="description" content="${description}" />`;
    if (metaDescRegex.test(html)) {
      html = html.replace(metaDescRegex, newMetaDesc);
    } else {
      html = html.replace('</head>', `${newMetaDesc}</head>`);
    }

    res.send(html);
  } catch (e) {
    console.error('Meta injection error:', e);
    res.status(500).send('Internal Server Error');
  }
}


// SSR-Lite Routes for SEO
app.get('/article/:slug', async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (article) {
      return serveWithMeta(req, res, article.title, article.seoDescription || article.excerpt);
    }
    next();
  } catch (e) { next(); }
});

app.get('/tools/:slug', async (req, res, next) => {
  try {
    const tool = await Tool.findOne({ slug: req.params.slug });
    if (tool) {
      const title = `${tool.name} Review, Pricing & Alternatives`;
      const desc = tool.meta_description || tool.short_description || `Deep dive review of ${tool.name}. Pricing, features, and key comparison vs other AI tools.`;
      return serveWithMeta(req, res, title, desc);
    }
    next();
  } catch (e) { next(); }
});

app.get('/compare/:slug', async (req, res, next) => {
  try {
    const comparison = await Comparison.findOne({ slug: req.params.slug });
    if (comparison) {
      const title = comparison.meta_title || `${comparison.title}`;
      const desc = comparison.meta_description || comparison.verdict || `Head-to-head comparison: ${comparison.title}. See the full verdict on ToolCurrent.`;
      return serveWithMeta(req, res, title, desc);
    }
    next();
  } catch (e) { next(); }
});

// Serve the rest of the dist folder
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Fallback for all other frontend routes (SPA)
app.use((req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // For local dev if dist isn't built
    res.status(200).send('ToolCurrent API is running. Build frontend with `npm run build` to see the site.');
  }
});

// ==========================================
// --- SERVER START ---
// ==========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

#!/usr/bin/env node
// Generates sitemap.xml, feed.xml and robots.txt into dist/ at build time.
// Static pages come from the built output; dynamic project/blog pages come
// from Supabase (public reads), so new content appears in the feed/sitemap
// on the next deploy without any manual steps.
import { readdirSync, writeFileSync, statSync, readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";

const DIST = resolve(process.cwd(), "dist");
const SITE = process.env.SITE_URL || "https://boon.is-a.dev";
const today = new Date().toISOString().slice(0, 10);

// Resolve Supabase credentials from the same sources the site uses:
// exported PUBLIC_* (Cloudflare), then VITE_* fallback, then site/.env.
function loadEnv() {
  const env = { ...process.env };
  try {
    const txt = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}
const env = loadEnv();
const SUPABASE_URL =
  env.PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON =
  env.PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

// Static page URLs from the build output (exclude SPA/template/404).
function staticUrls() {
  const urls = [];
  for (const file of walk(DIST)) {
    const rel = file.slice(DIST.length + 1).split(sep).join("/");
    if (
      rel.startsWith("admin") ||
      rel === "404.html" ||
      rel === "projects/view/index.html" ||
      rel === "blog/view/index.html" ||
      /^google[0-9a-f]+\.html$/.test(rel)
    )
      continue;
    let url = "/" + rel.replace(/index\.html$/, "").replace(/\.html$/, "");
    urls.push(SITE + url);
  }
  return urls;
}

async function dynamicData() {
  const out = { projects: [], posts: [] };
  if (!SUPABASE_URL || !SUPABASE_ANON) return out;
  try {
    const headers = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` };
    const [pr, po] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/projects?select=slug`, { headers }),
      fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,date&published=eq.true&order=date.desc`,
        { headers }
      ),
    ]);
    if (pr.ok) out.projects = await pr.json();
    if (po.ok) out.posts = await po.json();
  } catch {
    /* online build only; fall back to static */
  }
  return out;
}

function url(tag, extra = {}) {
  return `<url><loc>${tag}</loc>${extra.pd ? `<lastmod>${extra.pd}</lastmod>` : ""}</url>`;
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const data = await dynamicData();
const urls = staticUrls();
for (const p of data.projects) urls.push(`${SITE}/projects/${encodeURIComponent(p.slug)}`);
for (const p of data.posts) urls.push(`${SITE}/blog/${encodeURIComponent(p.slug)}`);

writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  ${url(u, { pd: today })}\n`)
    .join("")}</urlset>\n`
);

writeFileSync(
  join(DIST, "feed.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n<title>Boon.dev Blog</title>\n<link>${SITE}/blog/</link>\n<description>Updates, notes and articles from Apiwish (Boon).</description>\n<language>en</language>\n<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n${data.posts
    .map(
      (p) =>
        `<item>\n<title>${esc(p.title)}</title>\n<link>${SITE}/blog/${encodeURIComponent(p.slug)}</link>\n<guid isPermaLink="true">${SITE}/blog/${encodeURIComponent(p.slug)}</guid>\n<pubDate>${new Date(p.date + "T00:00:00Z").toUTCString()}</pubDate>\n<description>${esc(p.excerpt)}</description>\n</item>`
    )
    .join("\n")}\n</channel></rss>\n`
);

writeFileSync(
  join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`
);

console.log(
  `gen-seo: ${urls.length} URLs in sitemap, ${data.posts.length} posts in feed, robots.txt written`
);
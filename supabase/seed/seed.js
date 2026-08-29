/**
 * Seed script: populate all content in Supabase for the portfolio.
 *
 * It migrates existing local content (honors from prizes.json, blog posts
 * from blog/posts.json) and seeds sensible defaults for the remaining tables
 * (site_config, nav_links, projects, resources, skills, timeline).
 *
 * Usage:
 *   SUPABASE_URL="https://xyz.supabase.co" \
 *   SUPABASE_SERVICE_KEY="service_role_key" \
 *   node supabase/seed/seed.js
 *
 * The service role key bypasses RLS. Use it only for one-time seeding.
 * Idempotent: will not duplicate honors/posts already inserted (checks by
 * content identifiers before inserting).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.");
  process.exit(1);
}

const sb = createClient(url, key);

async function exists(table, column, value) {
  const { data } = await sb.from(table).select("id").eq(column, value).limit(1);
  return (data && data.length > 0) ?? false;
}

async function seedHonors() {
  const prizes = JSON.parse(readFileSync(path.join(root, "prizes.json"), "utf8"));
  let count = 0;
  for (const p of prizes) {
    if (await exists("honors", "title", p.title)) continue;
    const { error } = await sb.from("honors").insert({
      title: p.title,
      description: p.description,
      image_url: p.image,
      alt: p.alt || p.title,
      badge_class: p.badge?.classes || "",
      badge_icon: p.badge?.icon || "",
      badge_label: p.badge?.text || "",
      badge_title: p.badge?.title || "",
      pin_color: p.pin || "bg-danger",
      rotation: p.rotation || "0deg",
      sort_order: 0,
    });
    if (error) console.error("honors:", error.message);
    else count++;
  }
  if (count) console.log(`Seeded ${count} honors`);
}

async function seedBlog() {
  const posts = JSON.parse(readFileSync(path.join(root, "blog/posts.json"), "utf8"));
  for (const post of posts) {
    const slug =
      post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
      randomUUID();
    if (await exists("blog_posts", "slug", slug)) continue;

    const { data: inserted, error: perr } = await sb
      .from("blog_posts")
      .insert({
        slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        body: post.content,
        image_url: post.image,
        published: true,
      })
      .select("id")
      .single();
    if (perr) {
      console.error("blog_posts:", perr.message);
      continue;
    }
    for (const tagName of post.tags || []) {
      const { data: tag } = await sb
        .from("tags")
        .upsert({ name: tagName }, { onConflict: "name" })
        .select("id")
        .single();
      if (tag) {
        await sb.from("post_tags").upsert({ post_id: inserted.id, tag_id: tag.id });
      }
    }
    console.log(`Seeded post: ${post.title}`);
  }
}

async function seedDefaults() {
  // -------- site_config (single row) --------
  const { data: cfg } = await sb.from("site_config").select("id").limit(1).maybeSingle();
  if (!cfg) {
    const { error } = await sb.from("site_config").insert({
      brand: "BOON.DEV",
      site_title: "Portfolio | Narrative Experience",
      tagline: "Using Python & Code to solve real-world problems.",
      footer_text: "Open to collaborations and ambitious projects.",
      copyright: "© 2026 APIWISH ANUTARAVANICHKUL.",
      socials: [
        { type: "email", label: "Email", url: "mailto:apiwishboon@gmail.com", icon: "fa-envelope" },
        { type: "github", label: "GitHub", url: "https://github.com/apiwishboon-spec", icon: "fa-github" },
        { type: "phone", label: "Phone", url: "tel:0933372907", icon: "fa-phone" },
        { type: "discord", label: "Discord", url: "https://discord.com/users/boon06409", icon: "fa-discord" },
      ],
      about:
        "I love solving complex problems, understanding human behavior, and turning ideas into code.",
      contact_heading: "Let's Build Something",
      contact_subtext: "Open to collaborations and ambitious projects.",
    });
    if (error) console.error("site_config:", error.message);
    else console.log("Seeded site_config");
  }

  // -------- nav_links --------
  const navDefaults = [
    { label: "Home", href: "/", sort_order: 0 },
    { label: "About", href: "/about", sort_order: 1 },
    { label: "Projects", href: "/projects", sort_order: 2 },
    { label: "Honors", href: "/honors", sort_order: 3 },
    { label: "Blog", href: "/blog", sort_order: 4 },
    { label: "Resources", href: "/resources", sort_order: 5 },
    { label: "Uptime", href: "/uptime/", sort_order: 6 },
  ];
  const { count } = await sb.from("nav_links").select("id", { count: "exact", head: true });
  if (!count) {
    const { error } = await sb.from("nav_links").insert(
      navDefaults.map((n) => ({ ...n, enabled: true }))
    );
    if (error) console.error("nav_links:", error.message);
    else console.log("Seeded nav_links");
  }

  // -------- projects --------
  const projects = [
    {
      slug: "cortexmail",
      title: "CortexMail",
      tagline: "AI-powered email assistant",
      description: "AI-powered email assistant that reads inboxes and drafts intelligent replies.",
      cover_url: "/cortexmail.png",
      tags: ["AI", "Assistant"],
      tech: ["Python", "AI"],
      live_url: "",
      github_url: "https://github.com/apiwishboon-spec",
      body: "AI-powered email assistant that reads inboxes and drafts intelligent replies. Built to streamline daily email workflows.",
      featured: true,
      sort_order: 0,
    },
    {
      slug: "synapsemail",
      title: "SynapseMail",
      tagline: "macOS email automation",
      description: "A specialized macOS app for local inbox automation and High-frequency IMAP monitoring.",
      cover_url: "/SynapseMail.png",
      tags: ["Automation", "macOS"],
      tech: ["Automation", "macOS"],
      live_url: "",
      github_url: "https://github.com/apiwishboon-spec",
      body: "A specialized macOS app for local inbox automation and High-frequency IMAP monitoring.",
      featured: true,
      sort_order: 1,
    },
  ];
  for (const p of projects) {
    if (await exists("projects", "slug", p.slug)) continue;
    const { error } = await sb.from("projects").insert(p);
    if (error) console.error("projects:", error.message);
    else console.log(`Seeded project: ${p.title}`);
  }

  // -------- resources --------
  const resources = [
    {
      category: "Crafting",
      title: "Small Book Template",
      description: "Printable template for creating small handmade books",
      file_url: "/downloads/file resorce/small_book.png",
      preview_url: "/downloads/file resorce/small_book.png",
      file_type: "PNG",
      file_size: "1.2 MB",
      protected: false,
      sort_order: 0,
    },
    {
      category: "Other",
      title: "I21202 Bullying Research",
      description: "Independent study on bullying in Grade 7 at Suankularb Wittayalai School",
      file_url: "/downloads/file resorce/bullying_research.pdf",
      preview_url: "https://i.postimg.cc/3wC1DCpk/Screenshot-2569-03-01-at-21-46-32.png",
      file_type: "PDF",
      file_size: "2.8 MB",
      protected: false,
      sort_order: 0,
    },
  ];
  const { count: rc } = await sb.from("resources").select("id", { count: "exact", head: true });
  if (!rc) {
    const { error } = await sb.from("resources").insert(resources);
    if (error) console.error("resources:", error.message);
    else console.log(`Seeded ${resources.length} resources`);
  }

  // -------- skills --------
  const skills = [
    "Python (Advanced)", "Data Science", "Algorithms", "Psychology", "Astronomy",
    "HTML", "Problem Solving", "Science", "Research", "Engineering",
  ];
  const { count: sc } = await sb.from("skills").select("id", { count: "exact", head: true });
  if (!sc) {
    const { error } = await sb
      .from("skills")
      .insert(skills.map((label, i) => ({ label, sort_order: i })));
    if (error) console.error("skills:", error.message);
    else console.log(`Seeded ${skills.length} skills`);
  }

  // -------- timeline --------
  const timeline = [
    {
      period_label: "Grade 1 - 6",
      title: "Bangkok Christian College",
      description: "Built my foundation in coding and mathematics.",
      icon: "fa-shuttle-space",
      is_current: false,
      sort_order: 0,
    },
    {
      period_label: "Grade 7 (Current)",
      title: "Suankularb Wittayalai School",
      description: "Expanding my horizons in computer science and robotics.",
      icon: "fa-user-astronaut",
      is_current: true,
      sort_order: 1,
    },
  ];
  const { count: tc } = await sb
    .from("timeline_milestones")
    .select("id", { count: "exact", head: true });
  if (!tc) {
    const { error } = await sb.from("timeline_milestones").insert(timeline);
    if (error) console.error("timeline:", error.message);
    else console.log(`Seeded ${timeline.length} timeline milestones`);
  }
}

async function main() {
  await seedDefaults();
  await seedHonors();
  await seedBlog();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

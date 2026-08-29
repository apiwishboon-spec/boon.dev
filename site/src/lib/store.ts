import { getClient, isConfigured } from "./supabase";
import { demoData } from "./demo";
import type {
  SiteConfig,
  NavLink,
  Project,
  BlogPost,
  Honor,
  Resource,
  TimelineMilestone,
  Skill,
} from "./types";

export interface AllData {
  config: SiteConfig;
  nav: NavLink[];
  projects: Project[];
  posts: BlogPost[];
  honors: Honor[];
  resources: Resource[];
  timeline: TimelineMilestone[];
  skills: Skill[];
}

function sortBy(arr: any[], key: string): any[] {
  return [...arr].sort(
    (a, b) => (a[key] ?? 0) - (b[key] ?? 0) || String(a.id).localeCompare(String(b.id))
  );
}

/**
 * Fetch all content from Supabase (client-side, public read).
 * Falls back to bundled demo data when Supabase isn't configured
 * or the query fails, so the site always renders.
 */
export async function fetchAll(): Promise<AllData> {
  const sb = getClient();

  if (!sb || !isConfigured()) {
    return demoData;
  }

  try {
    const [
      configR,
      navR,
      projR,
      postR,
      honorR,
      resR,
      timeR,
      skillR,
    ] = await Promise.all([
      sb.from("site_config").select("*").limit(1).maybeSingle(),
      sb.from("nav_links").select("*").eq("enabled", true),
      sb.from("projects").select("*").order("sort_order", { ascending: true }),
      sb.from("blog_posts").select("*, post_tags(tag_id)").eq("published", true),
      sb.from("honors").select("*").order("sort_order", { ascending: true }),
      sb.from("resources").select("*").order("sort_order", { ascending: true }),
      sb.from("timeline_milestones").select("*").order("sort_order", { ascending: true }),
      sb.from("skills").select("*").order("sort_order", { ascending: true }),
    ]);

    const config: SiteConfig =
      configR.data ??
      demoData.config;

    const nav: NavLink[] = (navR.data ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    );

    // Resolve tags for posts
    const posts: BlogPost[] = await resolvePostTags(sb, postR.data ?? []);

    return {
      config,
      nav,
      projects: sortBy(projR.data ?? [], "sort_order"),
      posts: posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
      honors: sortBy(honorR.data ?? [], "sort_order"),
      resources: sortBy(resR.data ?? [], "sort_order"),
      timeline: sortBy(timeR.data ?? [], "sort_order"),
      skills: sortBy(skillR.data ?? [], "sort_order"),
    };
  } catch (e) {
    console.error("Failed to load from Supabase, using demo data.", e);
    return demoData;
  }
}

async function resolvePostTags(sb: any, rows: any[]): Promise<BlogPost[]> {
  if (!rows.length) return [];
  const postIds = rows.map((r) => r.id);
  const { data } = await sb.from("post_tags").select("post_id, tags(name)").in("post_id", postIds);
  const tagMap: Record<string, string[]> = {};
  (data ?? []).forEach((row: any) => {
    (tagMap[row.post_id] = tagMap[row.post_id] || []).push(row.tags?.name);
  });
  return rows.map((r) => {
    const { post_tags, ...rest } = r;
    return { ...rest, tags: tagMap[r.id] ?? [] };
  });
}

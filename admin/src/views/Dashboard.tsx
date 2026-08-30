import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import ResourceCrud from "../components/ResourceCrud";
import SiteConfigView from "./SiteConfigView";

const modules: string[] = [
  "site",
  "nav",
  "projects",
  "blog",
  "honors",
  "resources",
  "skills",
  "timeline",
  "uptime",
];

const texts: Record<string, { title: string; desc: string }> = {
  site: { title: "Site Config", desc: "Brand, tagline, footer, socials." },
  nav: { title: "Navigation", desc: "Order, label, and links in the navbar." },
  projects: { title: "Projects", desc: "Your featured work and case studies." },
  blog: { title: "Blog Posts", desc: "Updates, notes, and articles." },
  honors: { title: "Honors", desc: "Competitions, certificates, and milestones." },
  resources: { title: "Resources", desc: "File downloads grouped by category." },
  skills: { title: "Skills", desc: "The skills shown on your site." },
  timeline: { title: "Timeline", desc: "Your journey milestones." },
  uptime: { title: "Uptime", desc: "Services shown on the uptime dashboard." },
};

export default function Dashboard({ user }: { user: User }) {
  const [active, setActive] = useState("site");
  const [deploy, setDeploy] = useState<{ busy: boolean; msg: string; ok?: boolean }>({ busy: false, msg: "" });

  async function logout() {
    await supabase.auth.signOut();
  }

  async function redeploy() {
    setDeploy({ busy: true, msg: "" });
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    try {
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeploy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && !j.success && j.result?.id) {
        setDeploy({ busy: false, msg: "Deploy started — live in ~1 minute.", ok: true });
      } else if (r.ok && j.success === false) {
        setDeploy({ busy: false, msg: j.errors?.[0]?.message || "Cloudflare rejected the request.", ok: false });
      } else if (r.ok) {
        setDeploy({ busy: false, msg: "Deploy triggered.", ok: true });
      } else {
        setDeploy({ busy: false, msg: j.error || "Redeploy failed.", ok: false });
      }
    } catch {
      setDeploy({ busy: false, msg: "Couldn't reach the redeploy service.", ok: false });
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Boon Admin</h1>
        <div className="user">
          {user.email} · <a onClick={logout} style={{ cursor: "pointer" }}>Sign out</a>
        </div>
        <div style={{ margin: "14px 0 4px" }}>
          <button
            className="btn btn-primary btn-block"
            style={{ borderRadius: 12 }}
            disabled={deploy.busy}
            onClick={redeploy}
            title="Rebuild the live site + regenerate sitemap/RSS from latest content"
          >
            <i className="fa-solid fa-rocket" /> {deploy.busy ? "Deploying…" : "Rebuild live site"}
          </button>
          {deploy.msg && (
            <div
              className="muted"
              style={{ marginTop: 8, fontSize: 12, color: deploy.ok !== false ? "#2fbf71" : "#ef5b5b" }}
            >
              {deploy.msg}
            </div>
          )}
        </div>
        {modules.map((m) => (
          <button
            key={m}
            className={`side-item ${active === m ? "active" : ""}`}
            onClick={() => setActive(m)}
          >
            {texts[m].title}
          </button>
        ))}
      </aside>

      <main className="main">
        <p className="muted" style={{ marginTop: 0 }}>{texts[active].desc}</p>
        {active === "site" && <SiteConfigView />}
        {active === "nav" && (
          <ResourceCrud
            table="nav_links"
            title="Navigation Links"
            displayFn={(r) => `${r.label} — ${r.href}`}
            orderBy="sort_order"
            fields={[
              { name: "label", label: "Label" },
              { name: "href", label: "Href / URL" },
              { name: "sort_order", label: "Order", type: "number" },
              { name: "enabled", label: "Enabled", type: "checkbox" },
            ]}
          />
        )}
        {active === "projects" && (
          <ResourceCrud
            table="projects"
            title="Projects"
            subtitle="tagline"
            orderBy="sort_order"
            fields={[
              { name: "title", label: "Title" },
              { name: "slug", label: "Slug (URL)" },
              { name: "tagline", label: "Tagline" },
              { name: "description", label: "Description", type: "textarea" },
              { name: "cover_url", label: "Cover image", type: "file" },
              { name: "tech", label: "Tech tags", type: "tags", hint: 'JSON array, e.g. ["Python","AI"]' },
              { name: "tags", label: "Tags", type: "json", hint: 'JSON array' },
              { name: "live_url", label: "Live URL" },
              { name: "github_url", label: "GitHub URL" },
              { name: "body", label: "Body (markdown)", type: "textarea" },
              { name: "featured", label: "Featured", type: "checkbox" },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
            viewUrl={(r) => `/projects/${encodeURIComponent(r.slug)}`}
          />
        )}
        {active === "blog" && (
          <ResourceCrud
            table="blog_posts"
            title="Blog Posts"
            subtitle="excerpt"
            orderBy="date"
            orderAsc={false}
            fields={[
              { name: "title", label: "Title" },
              { name: "slug", label: "Slug (URL)" },
              { name: "date", label: "Date (YYYY-MM-DD)" },
              { name: "excerpt", label: "Excerpt", type: "textarea" },
              { name: "body", label: "Body (markdown)", type: "textarea" },
              { name: "tags", label: "Tags", type: "tags", hint: 'JSON array, e.g. ["Space","AI"]' },
              { name: "image_url", label: "Image", type: "file" },
              { name: "published", label: "Published", type: "checkbox" },
            ]}
            viewUrl={(r) => `/blog/${encodeURIComponent(r.slug)}`}
          />
        )}
        {active === "honors" && (
          <ResourceCrud
            table="honors"
            title="Honors"
            subtitle="description"
            orderBy="sort_order"
            fields={[
              { name: "title", label: "Title" },
              { name: "description", label: "Description" },
              { name: "image_url", label: "Image", type: "file" },
              { name: "alt", label: "Alt text" },
              { name: "badge_label", label: "Badge label" },
              { name: "badge_icon", label: "Badge icon (Font Awesome class)" },
              { name: "badge_class", label: "Badge CSS class" },
              { name: "badge_title", label: "Badge tooltip" },
              { name: "pin_color", label: "Pin color class" },
              { name: "rotation", label: "Rotation (e.g. 1deg)" },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
          />
        )}
        {active === "resources" && (
          <ResourceCrud
            table="resources"
            title="Resources"
            subtitle="category"
            orderBy="sort_order"
            fields={[
              { name: "category", label: "Category" },
              { name: "title", label: "Title" },
              { name: "description", label: "Description", type: "textarea" },
              { name: "file_url", label: "File", type: "file" },
              { name: "preview_url", label: "Preview image", type: "file" },
              { name: "file_type", label: "File type (PNG/PDF/…)" },
              { name: "file_size", label: "File size" },
              { name: "protected", label: "Password protected", type: "checkbox" },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
          />
        )}
        {active === "skills" && (
          <ResourceCrud
            table="skills"
            title="Skills"
            orderBy="sort_order"
            fields={[
              { name: "label", label: "Skill" },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
          />
        )}
        {active === "timeline" && (
          <ResourceCrud
            table="timeline_milestones"
            title="Timeline"
            subtitle="title"
            orderBy="sort_order"
            fields={[
              { name: "period_label", label: "Period label" },
              { name: "title", label: "Title" },
              { name: "description", label: "Description", type: "textarea" },
              { name: "icon", label: "Icon (Font Awesome class)" },
              { name: "is_current", label: "Current", type: "checkbox" },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
          />
        )}
        {active === "uptime" && (
          <ResourceCrud
            table="uptime_targets"
            title="Uptime Targets"
            subtitle="url"
            orderBy="sort_order"
            fields={[
              { name: "name", label: "Name" },
              { name: "url", label: "URL", hint: "Required when mode = auto" },
              {
                name: "mode",
                label: "Status mode",
                type: "select",
                options: ["auto", "operational", "degraded", "maintenance", "down", "custom"],
                hint: "auto = live check · custom = use your own label below",
              },
              { name: "custom_label", label: "Custom status label", hint: "Shown when mode = custom" },
              { name: "note", label: "Note", type: "textarea", hint: "Optional detail, e.g. maintenance window" },
              { name: "enabled", label: "Enabled", type: "checkbox" },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
          />
        )}
      </main>
    </div>
  );
}

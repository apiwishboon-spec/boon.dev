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
};

export default function Dashboard({ user }: { user: User }) {
  const [active, setActive] = useState("site");

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Boon Admin</h1>
        <div className="user">
          {user.email} · <a onClick={logout} style={{ cursor: "pointer" }}>Sign out</a>
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
              { name: "cover_url", label: "Cover image URL" },
              { name: "tech", label: "Tech tags", type: "tags", hint: 'JSON array, e.g. ["Python","AI"]' },
              { name: "tags", label: "Tags", type: "json", hint: 'JSON array' },
              { name: "live_url", label: "Live URL" },
              { name: "github_url", label: "GitHub URL" },
              { name: "body", label: "Body (markdown)", type: "textarea" },
              { name: "featured", label: "Featured", type: "checkbox" },
              { name: "sort_order", label: "Order", type: "number" },
            ]}
            viewUrl={(r) => `/projects/view?id=${encodeURIComponent(r.id)}`}
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
              { name: "image_url", label: "Image URL" },
              { name: "published", label: "Published", type: "checkbox" },
            ]}
            viewUrl={(r) => `/blog/view?id=${encodeURIComponent(r.id)}`}
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
              { name: "image_url", label: "Image URL" },
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
              { name: "file_url", label: "File URL" },
              { name: "preview_url", label: "Preview image URL" },
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
      </main>
    </div>
  );
}

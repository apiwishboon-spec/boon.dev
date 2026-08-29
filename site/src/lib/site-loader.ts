import { fetchAll, type AllData } from "./store";
import type { SocialLink } from "./types";

/**
 * Bootstraps shared chrome (nav + footer) and hands live data to
 * the page's renderer via a custom event. One instance per page.
 */
function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSocials(socials: SocialLink[]) {
  return socials
    .map(
      (s) =>
        `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" title="${escapeHtml(s.label)}">` +
        (s.icon ? `<i class="fa-solid ${escapeHtml(s.icon)}"></i>` : `<i class="fa-solid fa-link"></i>`) +
        `</a>`
    )
    .join("");
}

const NAV_ICONS: Record<string, string> = {
  Home: "fa-house", About: "fa-user-astronaut", Projects: "fa-rocket",
  Honors: "fa-trophy", Blog: "fa-feather-pointed", Resources: "fa-folder-open",
  Uptime: "fa-signal", Contact: "fa-paper-plane", Archive: "fa-box-archive",
};

export async function bootSite(render?: (data: AllData) => void): Promise<void> {
  const data = await fetchAll();

  // Nav
  const brand = document.getElementById("site-brand");
  if (brand) brand.textContent = data.config.brand;

  const nav = document.getElementById("site-nav");
  if (nav) {
    nav.innerHTML = data.nav
      .map(
        (l) => {
          const icon = NAV_ICONS[l.label] || "fa-star";
          const current = l.href === location.pathname || (l.href !== "/" && location.pathname.startsWith(l.href));
          return `<li><a href="${escapeHtml(l.href)}" ${current ? 'style="color:var(--primary)"' : ""}><i class="fa-solid ${icon}"></i>${escapeHtml(l.label)}</a></li>`;
        }
      )
      .join("");
  }

  const toggle = document.querySelector<HTMLElement>("[data-nav-toggle]");
  const links = document.querySelector<HTMLElement>("[data-nav-links]");
  toggle?.addEventListener("click", () => links?.classList.toggle("open"));

  // Footer
  const socials = document.getElementById("footer-socials");
  if (socials) socials.innerHTML = renderSocials(data.config.socials);
  const ftext = document.getElementById("footer-text");
  if (ftext) ftext.textContent = data.config.footer_text;
  const fcopy = document.getElementById("footer-copy");
  if (fcopy) fcopy.textContent = data.config.copyright;

  // Page renderer
  if (render) render(data);
}

export function showLoading(el: HTMLElement) {
  if (el) el.innerHTML = `<div class="loading">Loading…</div>`;
}

export { escapeHtml };

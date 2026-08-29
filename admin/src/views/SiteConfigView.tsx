import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Single-row editor for site_config. Edits brand, tagline, footer,
 * copyright and socials (as a JSON array).
 */
export default function SiteConfigView() {
  const [form, setForm] = useState<any | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("site_config")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setForm(
          data ?? {
            brand: "",
            site_title: "",
            tagline: "",
            about: "",
            footer_text: "",
            copyright: "",
            socials: [],
            contact_heading: "",
            contact_subtext: "",
          }
        );
      });
  }, []);

  if (!form) return <p>Loading…</p>;

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    setMessage(null);
    let socials = form.socials;
    if (typeof socials === "string") {
      try { socials = JSON.parse(socials); } catch { socials = []; }
    }
    const payload = {
      ...form,
      socials: Array.isArray(socials) ? socials : [],
    };
    const { error } = await supabase.from("site_config").upsert(payload);
    if (error) setMessage(error.message);
    else setMessage("Saved.");
    setSaving(false);
  }

  return (
    <div>
      <div className="topbar">
        <h2>Site Config</h2>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : <><i className="fa-solid fa-floppy-disk" /> Save</>}
        </button>
      </div>
      {message && <div className={message === "Saved." ? "success" : "error"}>{message}</div>}

      <div className="box">
        <div className="field-row">
          <div className="field"><label>Brand (wordmark)</label>
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} /></div>
          <div className="field"><label>Site title</label>
            <input value={form.site_title} onChange={(e) => set("site_title", e.target.value)} /></div>
        </div>
        <div className="field"><label>Tagline</label>
          <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
        <div className="field"><label>About</label>
          <textarea value={form.about} onChange={(e) => set("about", e.target.value)} /></div>
        <div className="field"><label>Footer text</label>
          <input value={form.footer_text} onChange={(e) => set("footer_text", e.target.value)} /></div>
        <div className="field"><label>Copyright</label>
          <input value={form.copyright} onChange={(e) => set("copyright", e.target.value)} /></div>
        <div className="field-row">
          <div className="field"><label>Contact heading</label>
            <input value={form.contact_heading} onChange={(e) => set("contact_heading", e.target.value)} /></div>
          <div className="field"><label>Contact subtext</label>
            <input value={form.contact_subtext} onChange={(e) => set("contact_subtext", e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Socials (JSON array)</label>
          <textarea
            style={{ minHeight: 140 }}
            value={Array.isArray(form.socials) ? JSON.stringify(form.socials, null, 2) : form.socials}
            onChange={(e) => set("socials", e.target.value)}
          />
          <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
            Format: [{"type,label,url,icon"}] e.g. [{"\"type\":\"email\",\"label\":\"Email\",\"url\":\"mailto:x@y.com\",\"icon\":\"fa-envelope\""}]
          </div>
        </div>
      </div>
    </div>
  );
}

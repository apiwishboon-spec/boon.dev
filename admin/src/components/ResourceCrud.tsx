import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface Field {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "json" | "tags" | "select" | "file";
  placeholder?: string;
  options?: string[];
  hint?: string;
}

export interface ResourceCrudProps {
  table: string;
  title: string;
  fields: Field[];
  orderBy?: string;
  orderAsc?: boolean;
  /** Which fields to show in the list's subtitle. */
  subtitle?: string;
  /** Optional: stringify the whole row as a JSON editor row for "config" style tables. */
  displayFn?: (row: any) => string;
}

export default function ResourceCrud({
  table,
  title,
  fields,
  orderBy = "sort_order",
  orderAsc = true,
  subtitle,
  displayFn,
}: ResourceCrudProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const q = supabase.from(table).select("*");
    const { data, error } = await q.order(orderBy, { ascending: orderAsc });
    if (error) setMessage(error.message);
    else setRows(data ?? []);
  }, [table, orderBy, orderAsc]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(row: any) {
    if (!confirm(`Delete "${displayFn ? displayFn(row) : row.title || row.label || row.name}"?`)) return;
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) setMessage(error.message);
    else { setMessage(null); load(); }
  }

  async function handleSave(form: any) {
    setSaving(true);
    setMessage(null);
    let payload: any = { ...form };
    // Parse JSON/tag fields
    for (const f of fields) {
      if (f.type === "json" || f.type === "tags") {
        try { payload[f.name] = JSON.parse(form[f.name] ?? "[]"); }
        catch { payload[f.name] = []; }
      } else if (f.type === "checkbox") {
        payload[f.name] = Boolean(form[f.name]);
      } else {
        payload[f.name] = form[f.name] ?? "";
      }
    }
    if (isNew) {
      const { error } = await supabase.from(table).insert(payload);
      if (error) { setMessage(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from(table).update(payload).eq("id", editing.id);
      if (error) { setMessage(error.message); setSaving(false); return; }
    }
    setEditing(null);
    setSaving(false);
    load();
  }

  return (
    <div>
      <div className="topbar">
        <h2>{title}</h2>
        <button className="btn btn-primary" onClick={() => { setIsNew(true); setEditing({}); }}>
          <i className="fa-solid fa-plus" /> New
        </button>
      </div>

      {message && <div className="error">{message}</div>}

      <div className="list">
        {rows.length === 0 && <div className="empty">No items yet.</div>}
        {rows.map((row) => (
          <div className="list-item" key={row.id}>
            <div>
              <div className="title">{displayFn ? displayFn(row) : row.title || row.label || row.name || row.id?.slice(0, 8)}</div>
              {subtitle && <div className="sub">{row[subtitle]}</div>}
            </div>
            <div className="item-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => { setIsNew(false); setEditing(row); }}>
                <i className="fa-solid fa-pen" /> Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>
                <i className="fa-solid fa-trash" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <FormModal
          title={isNew ? `New ${title.slice(0, -1)}` : "Edit"}
          fields={fields}
          initial={editing}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}

function FormModal({
  title,
  fields,
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  title: string;
  fields: Field[];
  initial: any;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (form: any) => void;
}) {
  const [form, setForm] = useState(() => {
    const f: any = {};
    for (const field of fields) {
      let v = initial[field.name];
      if (field.type === "json" || field.type === "tags") {
        v = v ? JSON.stringify(v) : "[]";
      }
      if (field.type === "checkbox") v = Boolean(v);
      f[field.name] = v ?? (field.type === "checkbox" ? false : "");
    }
    return f;
  });

  const set = (name: string, value: any) => setForm((p: any) => ({ ...p, [name]: value }));

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>✕</button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
        >
          {fields.map((f) => (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              {f.type === "textarea" && (
                <textarea
                  value={form[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
              {f.type === "checkbox" && (
                <input
                  type="checkbox"
                  checked={form[f.name]}
                  onChange={(e) => set(f.name, e.target.checked)}
                />
              )}
              {f.type === "select" && (
                <select value={form[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                  {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {(!f.type || f.type === "text" || f.type === "number" || f.type === "json" || f.type === "tags") && (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={form[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
              {f.hint && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{f.hint}</div>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

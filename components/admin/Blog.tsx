"use client";

import { useMemo, useState } from "react";
import { matches } from "@/lib/admin/calc";
import { fmtDate, slugify, todayISO, uid } from "@/lib/admin/format";
import { actions, useDB } from "@/lib/admin/store";
import type { Post, PostStatus } from "@/lib/admin/types";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import { EmptyState, Field, Overlay, PageHeader, SearchBox, Segmented, StatusBadge } from "./ui";

const categories = ["Guides", "Neighborhoods", "Corporate", "News"];
const covers = ["/images/blog/blog1.jpg", "/images/blog/blog2.jpg", "/images/blog/blog3.jpg"];

type Draft = Omit<Post, "id" | "slug"> & { id?: string; slug?: string };
const emptyDraft = (): Draft => ({ title: "", excerpt: "", category: "Guides", body: "", image: covers[0], status: "draft", date: todayISO() });

export default function Blog() {
  const db = useDB();
  const { toast, confirm } = useFeedback();
  const [status, setStatus] = useState<PostStatus | "all">("all");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const rows = useMemo(
    () =>
      db.posts
        .filter((p) => (status === "all" || p.status === status) && matches(q, p.title, p.category))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.posts, status, q],
  );

  async function remove(p: Post) {
    if (!(await confirm({ title: "Delete this post?", text: `"${p.title}" will be permanently removed.`, confirmLabel: "Delete", danger: true }))) return;
    actions.remove("posts", p.id);
    toast("Post deleted");
  }

  return (
    <>
      <PageHeader
        title="Blog"
        description="Guides and stories that appear on the Nestly blog."
        actions={
          <button type="button" className="a-btn a-btn-primary" onClick={() => setDraft(emptyDraft())}>
            <Icon name="plus" size={16} /> New post
          </button>
        }
      />

      <div className="a-card">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={(["all", "published", "draft"] as const).map((s) => ({
              value: s,
              label: s === "all" ? "All" : s[0].toUpperCase() + s.slice(1),
              count: s === "all" ? db.posts.length : db.posts.filter((p) => p.status === s).length,
            }))}
          />
          <SearchBox value={q} onChange={setQ} placeholder="Search posts" />
        </div>

        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block" />
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setDraft(p)}>
                  <p className="truncate font-medium hover:text-brand-dark">{p.title}</p>
                  <p className="truncate text-muted">{p.category} · {fmtDate(p.date)}</p>
                </button>
                <StatusBadge status={p.status} />
                <div className="flex gap-1">
                  <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label={`Edit ${p.title}`} onClick={() => setDraft(p)}><Icon name="edit" size={16} /></button>
                  <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label={`Delete ${p.title}`} onClick={() => remove(p)}><Icon name="trash" size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="doc" title="No posts yet" text="Write your first story." action={<button type="button" className="a-btn a-btn-primary" onClick={() => setDraft(emptyDraft())}>New post</button>} />
        )}
      </div>

      {draft && <PostEditor key={draft.id ?? "new"} initial={draft} onClose={() => setDraft(null)} />}
    </>
  );
}

function PostEditor({ initial, onClose }: { initial: Draft; onClose: () => void }) {
  const { toast } = useFeedback();
  const db = useDB();
  const [d, setD] = useState<Draft>(initial);
  const [error, setError] = useState("");

  function save(status: PostStatus) {
    if (!d.title.trim()) {
      setError("Add a title");
      return;
    }
    let slug = d.slug ?? slugify(d.title);
    if (!d.id && db.posts.some((p) => p.slug === slug)) slug = `${slug}-${uid("").slice(1, 5)}`;
    actions.upsert("posts", { ...d, title: d.title.trim(), id: d.id ?? uid("po"), slug, status });
    toast(status === "published" ? "Post published" : "Draft saved");
    onClose();
  }

  return (
    <Overlay
      open
      wide
      onClose={onClose}
      title={d.id ? "Edit post" : "New post"}
      footer={
        <>
          <button type="button" className="a-btn a-btn-outline" onClick={onClose}>Cancel</button>
          <button type="button" className="a-btn a-btn-outline" onClick={() => save("draft")}>Save draft</button>
          <button type="button" className="a-btn a-btn-primary" onClick={() => save("published")}>{d.status === "published" ? "Update" : "Publish"}</button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Title" error={error}>
          {(id) => <input id={id} className="a-input" value={d.title} onChange={(e) => { setD({ ...d, title: e.target.value }); setError(""); }} autoFocus />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            {(id) => (
              <select id={id} className="a-input" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })}>
                {[...new Set([...categories, d.category])].map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
          </Field>
          <Field label="Date">
            {(id) => <input id={id} type="date" className="a-input" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} />}
          </Field>
        </div>
        <Field label="Excerpt" hint="Shown on blog cards and in search results.">
          {(id) => <textarea id={id} className="a-input min-h-20" value={d.excerpt} onChange={(e) => setD({ ...d, excerpt: e.target.value })} />}
        </Field>
        <div>
          <span className="a-label">Cover image</span>
          <div className="grid grid-cols-3 gap-3">
            {covers.map((src) => (
              <button
                key={src}
                type="button"
                aria-pressed={d.image === src}
                onClick={() => setD({ ...d, image: src })}
                className={`aspect-[4/3] overflow-hidden rounded-xl border-2 ${d.image === src ? "border-brand" : "border-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <Field label="Body" hint="Separate paragraphs with a blank line. Start a line with ## for a heading.">
          {(id) => <textarea id={id} className="a-input min-h-64 font-mono text-[13px]" value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} />}
        </Field>
      </div>
    </Overlay>
  );
}

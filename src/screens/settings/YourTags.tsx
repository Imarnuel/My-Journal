// Settings > Tags and mistakes (01-decisions.md "Tags", DESIGN.md › Settings: tags and mistakes): look-alike Merge
// prompts, then a Tags row and a Mistakes row that each open their own list (rename in place, use count, remove).
// Headspace and Plan are fixed lists and aren't shown here. Renames, merges and removals
// update every old entry that carries the tag, and removals and merges have Undo.
import { Fragment, useRef, useState } from "react";
import { useStore } from "../../data/store";
import { usePref } from "../../data/settings";
import { toast } from "../../components/primitives/toast";
import type { Tag } from "../../lib/types";

/** A list row's remove button (×). */
const REMOVE_BTN = { width: "32px", height: "32px", border: 0, borderRadius: "var(--r-md)", background: "transparent", color: "var(--text-3)", cursor: "pointer", fontSize: "16px", lineHeight: "24px" } as const;
import { findLookalikes, mergeTags, pairKey, renameTag, retagEntries, usedLabel, validRename, type Lookalike, type TagPatch } from "./tags";

/** A Settings row (Settings.tsx › row): 16px above and below a 32px line. */
const line = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "16px 0", minHeight: "32px", borderTop: "1px solid var(--border-subtle)" } as const;

function apply(patches: TagPatch[]) {
  const updateEntry = useStore.getState().updateEntry;
  for (const p of patches) updateEntry(p.id, { tags: p.tags, mistakes: p.mistakes });
}

function TagName({ tag, tags, onRename }: { tag: Tag; tags: Tag[]; onRename: (to: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  const commit = () => {
    if (!cancelled.current && draft !== null && validRename(tags, tag.t, draft)) onRename(draft.trim());
    cancelled.current = false;
    setDraft(null);
  };
  return (
    <input
      className="ghost"
      type="text"
      aria-label={`Rename ${tag.t}`}
      value={draft ?? tag.t}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
        }
      }}
      style={{ fontSize: "14px" }}
    />
  );
}

export function YourTags() {
  const tags = useStore((s) => s.tags);
  const entries = useStore((s) => s.entries);
  const setTags = useStore((s) => s.setTags);
  const [merged, setMerged] = usePref("mergedLookalikes");
  const [open, setOpen] = useState<{ tags?: boolean; mistakes?: boolean }>({});
  // Tags and mistakes are two lists (DESIGN.md › Mistakes); the vocabulary keeps mistakes apart by kind.
  const tagList = tags.filter((t) => t.k !== "Mistake");
  const mistakeList = tags.filter((t) => t.k === "Mistake");

  const names = [...new Set([...tags.map((t) => t.t), ...entries.flatMap((e) => [...e.tags, ...e.mistakes])])];
  const seen = new Set<string>();
  const pairs = findLookalikes(names)
    .filter((p) => tags.some((t) => t.t === p.into) && !merged.includes(pairKey(p)))
    .filter((p) => (seen.has(pairKey(p)) ? false : (seen.add(pairKey(p)), true)));

  const rename = (from: string, to: string) => {
    const s = useStore.getState();
    apply(retagEntries(s.entries, from, to).patches);
    setTags(renameTag(s.tags, from, to));
  };

  const remove = (t: Tag) => {
    const s = useStore.getState();
    const prevTags = s.tags;
    const { patches, before } = retagEntries(s.entries, t.t, null);
    apply(patches);
    setTags(prevTags.filter((x) => x.t !== t.t));
    toast(`“${t.t}” removed from ${t.n} ${t.n === 1 ? "story" : "stories"}`, () => {
      apply(before);
      useStore.getState().setTags(prevTags);
    }, "deleted");
  };

  const merge = (p: Lookalike) => {
    const s = useStore.getState();
    const prevTags = s.tags;
    const prevMerged = merged;
    const { patches, before } = retagEntries(s.entries, p.from, p.into);
    apply(patches);
    setTags(mergeTags(prevTags, p.from, p.into));
    setMerged([...prevMerged, pairKey(p)]);
    toast(`Merged into “${p.into}”`, () => {
      apply(before);
      useStore.getState().setTags(prevTags);
      useStore.getState().setSetting("mergedLookalikes", prevMerged);
    }, "edited");
  };

  return (
    <section aria-labelledby="set-tags" style={{ display: "flex", flexDirection: "column" }}>
      <h2 id="set-tags" style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>Tags and mistakes</h2>
      <p className="meta" style={{ margin: "4px 0 0" }}>Rename, merge or remove tags and mistakes. Old stories update with them.</p>
      <div style={{ marginTop: "12px" }}>
        {pairs.map((p) => (
          <div key={pairKey(p)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "16px 16px", borderRadius: "var(--r-card)", border: "1px solid var(--border)", marginBottom: "8px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span aria-hidden="true" style={{ flex: "none", width: "8px", height: "8px", borderRadius: "4px", background: "var(--attention)" }} />
              {`"${p.from}" and "${p.into}" look like the same tag`}
            </span>
            <button type="button" onClick={() => merge(p)} className="btn btn-g">
              Merge
            </button>
          </div>
        ))}
        {/* No zero counts (first ui-polish audit). Each row opens its own list. */}
        {([
          ["tags", "Tags", "Every tag is a filter.", tagList],
          ["mistakes", "Mistakes", "Counts in costliest mistakes", mistakeList],
        ] as const).map(([key, label, hint, list]) => (
          <Fragment key={key}>
            <button
              type="button"
              className="ksetrow"
              aria-expanded={open[key] ? "true" : "false"}
              aria-controls={`${key}-list`}
              onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
              style={{ ...line, font: "inherit", width: "100%", borderLeft: 0, borderRight: 0, borderBottom: 0, background: "transparent", color: "var(--text-1)", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: "14px", flex: 1 }}>
                {label}
                {list.length ? <span style={{ color: "var(--text-3)" }}>{` (${list.length})`}</span> : null}
              </span>
              <span className="lbl">{hint}</span>
              <svg className="kchev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", color: "var(--text-3)" }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {open[key] ? (
              <div id={`${key}-list`} role="list" aria-label={label} className="kreveal" style={{ display: "flex", flexDirection: "column" }}>
                {list.map((t) => (
                  <div key={t.t} role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 110px 40px", gap: "12px", alignItems: "center", padding: "16px 0 16px 16px", borderTop: "1px solid var(--border-subtle)", minHeight: "32px" }}>
                    <TagName tag={t} tags={tags} onRename={(to) => rename(t.t, to)} />
                    <span className="lbl" style={{ textAlign: "right" }}>{usedLabel(t.n)}</span>
                    <button className="kmore" type="button" aria-label={`Remove ${t.t}`} onClick={() => remove(t)} style={REMOVE_BTN}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

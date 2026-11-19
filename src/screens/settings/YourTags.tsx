// Settings > Your tags (01-decisions.md "Tags"): kind breakdown from the tags in use, look-alike Merge
// prompts, and Manage tags (rename in place, kind and use count, remove). Renames, merges and removals
// update every old entry that carries the tag, and removals and merges have Undo.
import { Fragment, useState } from "react";
import { useStore } from "../../data/store";
import { usePref } from "../../data/settings";
import { toast } from "../../components/primitives/toast";
import type { Tag } from "../../lib/types";
import { FRAME_LOOKALIKES, findLookalikes, mergeTags, pairKey, renameTag, retagEntries, tagMix, usedLabel, validRename, type Lookalike, type TagPatch } from "./tags";

const line = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 0", borderTop: "1px solid var(--border-subtle)" } as const;

function apply(patches: TagPatch[]) {
  const updateEntry = useStore.getState().updateEntry;
  for (const p of patches) updateEntry(p.id, { tags: p.tags, mistakes: p.mistakes });
}

function TagName({ tag, tags, onRename }: { tag: Tag; tags: Tag[]; onRename: (to: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null && validRename(tags, tag.t, draft)) onRename(draft.trim());
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
          setDraft(null);
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
  const [open, setOpen] = useState(false);

  const names = [...new Set([...tags.map((t) => t.t), ...entries.flatMap((e) => [...e.tags, ...e.mistakes])])];
  const seen = new Set<string>();
  const pairs = [...findLookalikes(names), ...FRAME_LOOKALIKES]
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
    toast(`Removed ${t.t} from ${t.n} ${t.n === 1 ? "story" : "stories"}`, () => {
      apply(before);
      useStore.getState().setTags(prevTags);
    });
  };

  const merge = (p: Lookalike) => {
    const s = useStore.getState();
    const prevTags = s.tags;
    const prevMerged = merged;
    const { patches, before } = retagEntries(s.entries, p.from, p.into);
    apply(patches);
    setTags(mergeTags(prevTags, p.from, p.into));
    setMerged([...prevMerged, pairKey(p)]);
    toast(`Merged into ${p.into}. Old stories updated.`, () => {
      apply(before);
      useStore.getState().setTags(prevTags);
      useStore.getState().setSetting("mergedLookalikes", prevMerged);
    });
  };

  return (
    <section aria-labelledby="set-tags" style={{ display: "flex", flexDirection: "column" }}>
      <h2 id="set-tags" style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>Your tags</h2>
      <p className="meta" style={{ margin: "4px 0 0" }}>Rename, merge or remove tags. Old stories update with them.</p>
      <div style={{ marginTop: "12px" }}>
        {pairs.map((p) => (
          <div key={pairKey(p)} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "16px 16px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "8px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span aria-hidden="true" style={{ flex: "none", width: "8px", height: "8px", borderRadius: "4px", background: "var(--attention)" }} />
              {`"${p.from}" and "${p.into}" look like the same tag`}
            </span>
            <button type="button" onClick={() => merge(p)} className="btn btn-g">
              Merge
            </button>
          </div>
        ))}
        <div style={line}>
          <span style={{ fontSize: "14px" }}>
            Tags <span style={{ color: "var(--text-3)" }}>({tags.length})</span>
          </span>
          <span className="lbl">{`${tagMix(tags)}. Each tag's kind is set once, when you add it. Every tag is a filter.`}</span>
        </div>
        <div style={line}>
          <span style={{ fontSize: "14px" }}>
            Headspace <span style={{ color: "var(--text-3)" }}>(5)</span>
          </span>
          <span className="lbl">Fixed list, so stats stay comparable</span>
        </div>
        <div style={line}>
          <span style={{ fontSize: "14px" }}>
            Plan <span style={{ color: "var(--text-3)" }}>(2)</span>
          </span>
          <span className="lbl">Fixed: Followed, Not followed</span>
        </div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open ? "true" : "false"} aria-controls="tag-list" className="btn btn-q" style={{ padding: "0 4px", marginTop: "4px" }}>
          {open ? "Done" : "Manage tags"}
        </button>
        {open ? (
          <div id="tag-list" role="list" aria-label="Your tags" style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}>
            {tags.map((t) => (
              <Fragment key={t.t}>
                <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 90px 110px 40px", gap: "12px", alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border-subtle)", minHeight: "44px" }}>
                  <TagName tag={t} tags={tags} onRename={(to) => rename(t.t, to)} />
                  <span className="lbl">{t.k}</span>
                  <span className="lbl" style={{ textAlign: "right" }}>{usedLabel(t.n)}</span>
                  <button className="kmore" type="button" aria-label={`Remove ${t.t}`} onClick={() => remove(t)} style={{ width: "32px", height: "32px", border: 0, borderRadius: "8px", background: "transparent", color: "var(--text-3)", cursor: "pointer", fontSize: "16px", lineHeight: "24px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

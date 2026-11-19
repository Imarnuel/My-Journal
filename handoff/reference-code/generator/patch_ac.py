t = open("/home/claude/gen/ns4.py").read()

def rep(a, b, n=1):
    global t
    assert t.count(a) == n, (a[:80], t.count(a))
    t = t.replace(a, b)

# Tag field with autocomplete from tags you've already used
i = t.index("def etags(label, items, ph):")
j = t.index("\n\n", i)
t = t[:i] + r'''TAG_SUGGEST = [("Li", "quidity sweep", 14), ("L", "ower high", 6), ("Li", "quidity grab", 3)]
def tag_menu():
    rows = "".join(
        f'<button type="button" role="option" aria-selected="{"true" if k == 0 else "false"}" style="font: inherit; font-size: 13px; text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #ECEEF1; background: {"#1B1F27" if k == 0 else "transparent"}; border: 0; border-radius: 6px; padding: 0 8px; min-height: 36px; cursor: pointer">'
        f'<span><b style="font-weight: 700">{a}</b>{b}</span><span style="font-size: 12px; color: #8C939F">used {n} times</span></button>'
        for k, (a, b, n) in enumerate(TAG_SUGGEST))
    return ('<div role="listbox" aria-label="Matching tags" style="position: absolute; z-index: 7; top: calc(100% + 6px); left: 0; right: 0; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 10px; box-shadow: 0 16px 36px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 2px">'
            + rows + '<button type="button" role="option" style="font: inherit; font-size: 13px; text-align: left; color: #A3AAB5; background: transparent; border: 0; border-radius: 6px; padding: 0 8px; min-height: 36px; cursor: pointer">Add "li" as a new tag</button></div>')

def etags(label, items, ph):
    pills = "".join(kpill(*i) if isinstance(i, tuple) else pill(i, x=True) for i in items)
    if label != "Tags":
        return (f'<div class="ghost tagfield" role="group" aria-label="{label}" style="cursor: text; flex-wrap: wrap">{pills}'
                f'<input type="text" aria-label="Add to {label.lower()}" placeholder="{ph}" style="flex: 1; min-width: 90px; font: inherit; font-size: 13px; color: #ECEEF1; background: transparent; border: 0; outline: none; padding: 3px 0"></div>')
    return (f'<div style="position: relative">'
            f'<div class="ghost tagfield" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-label="{label}" style="cursor: text; flex-wrap: wrap">{pills}'
            f'<input type="text" aria-label="Add a tag" aria-autocomplete="list" placeholder="{ph}" onClick="{{{{ toggleTagSug }}}}" style="flex: 1; min-width: 90px; font: inherit; font-size: 13px; color: #ECEEF1; background: transparent; border: 0; outline: none; padding: 3px 0"></div>'
            f'<sc-if value="{{{{ tagSug }}}}" hint-placeholder-val="{{{{ false }}}}">{tag_menu()}</sc-if></div>')''' + t[j:]

rep('newstory_script = newstory_script.replace("statusOpen: !!st.statusOpen,", "statusOpen: !!st.statusOpen, numOpen: !!st.numOpen, toggleNums: () => this.setState({ numOpen: !st.numOpen }),")',
    'newstory_script = newstory_script.replace("statusOpen: !!st.statusOpen,", "statusOpen: !!st.statusOpen, numOpen: !!st.numOpen, toggleNums: () => this.setState({ numOpen: !st.numOpen }), tagSug: !!st.tagSug, toggleTagSug: () => this.setState({ tagSug: !st.tagSug }),")')
open("/home/claude/gen/ns4.py", "w").write(t)

s = open("/home/claude/gen/ns5.py").read()
s = s.replace("story_script = newstory_typed_script", '''# Chart story frame shows the autocomplete open, mid-typing "li"
_inp = 'placeholder="Add a tag" onClick="{{ toggleTagSug }}"'
assert storypage.count(_inp) == 1
storypage = storypage.replace(_inp, 'value="li" placeholder="Add a tag" onClick="{{ toggleTagSug }}"')
story_script = newstory_typed_script.replace("tagSug: !!st.tagSug", "tagSug: st.tagSug !== false")''')
open("/home/claude/gen/ns5.py", "w").write(s)
print("ok")

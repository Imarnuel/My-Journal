# CHART STORY v2: the saved story uses the same layout as New chart story, so there is one design.
# Main column: charts (large view + strip), Notes, linked analysis. Side panel: Details, trade facts and numbers, Done.
# Executed last; replaces storypage and story_script.

def story_charts():
    return f'''<section aria-label="Charts" style="min-width: 0; display: flex; flex-direction: column; gap: 14px">
<figure style="margin: 0; display: flex; flex-direction: column; gap: 8px">
<div class="chart" style="border-radius: 12px">{GU["A"]}</div>
<figcaption style="display: flex; justify-content: space-between; align-items: baseline"><span class="lbl">15m</span><span class="lbl">5 of 5</span></figcaption>
</figure>
<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; align-items: start">
{thumb(GU["W"], "Weekly", "first")}{thumb(GU["D"], "", "second")}{thumb(GU["4H"], "4H", "third")}{thumb(GU["E"], "15m", "fourth")}{thumb(GU["A"], "15m", "fifth", selected=True)}{ADD_T}
</div>
</section>'''

STORY_MENU = ('<span style="position: relative; display: inline-flex"><button type="button" aria-label="More actions" aria-haspopup="menu" onClick="{{ toggleMenu }}" style="width: 40px; height: 40px; border: 1px solid #353B46; border-radius: 10px; background: transparent; color: #A3AAB5; cursor: pointer; font-size: 15px; letter-spacing: 1px">···</button>'
              '<sc-if value="{{ menuOpen }}" hint-placeholder-val="{{ false }}"><div role="menu" style="position: absolute; z-index: 6; top: calc(100% + 6px); right: 0; width: 200px; padding: 6px; background: #15181E; border: 1px solid #353B46; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.55); display: flex; flex-direction: column; gap: 2px">'
              + "".join(f'<button type="button" role="menuitem" style="font: inherit; font-size: 14px; text-align: left; color: {c}; background: transparent; border: 0; border-radius: 8px; padding: 0 12px; min-height: 38px; cursor: pointer">{o}</button>'
                        for o, c in (("Pin as textbook", "#ECEEF1"), ("Change date", "#ECEEF1"), ("Exclude from stats", "#ECEEF1"), ("Delete story", LOSS)))
              + '</div></sc-if></span>')

ANALYSIS_LINK = f'''<a href="Main.dc.html" style="display: flex; gap: 14px; align-items: center; padding: 12px 14px; border-radius: 12px; border: 1px solid #1B1F27; text-decoration: none; color: #ECEEF1">
<div class="chart" style="flex: none; width: 112px">{GU["D"]}</div>
<div style="min-width: 0; display: flex; flex-direction: column; gap: 2px"><span class="lbl" style="font-size: 12px">Your analysis before this trade · Mon 16 Nov, 07:30</span><span style="font-size: 14px; color: #C9CED6">"Dollar weak into New York. Only shorts on GBP below the weekly level."</span></div>
</a>'''

def story_panel():
    return f'''<aside aria-label="Details" style="flex: 2 1 380px; min-width: 0; position: sticky; top: 24px; display: flex; flex-direction: column; background: #15181E; border: 1px solid #252A33; border-radius: 16px">
<section aria-labelledby="sdh" style="padding: 18px 20px 12px; display: flex; flex-direction: column; gap: 4px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding-bottom: 6px"><h2 id="sdh" style="margin: 0; font-size: 16px; font-weight: 600">Details</h2><span class="lbl" style="font-size: 12px">Tap anything to change</span></div>
<dl style="margin: 0; display: flex; flex-direction: column">{tag_rows(True)}</dl>
</section>
<section aria-label="Trade" style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; flex-direction: column; gap: 8px">
<span class="lbl" style="font-size: 12px">From your charts and MT5, or typed by you</span>
{factline()}
{NUMBERS}
</section>
<div style="padding: 16px 20px; border-top: 1px solid #252A33; display: flex; flex-direction: column; gap: 8px">
<a href="Main.dc.html" class="btn btn-p" style="justify-content: center">Done</a>
<span class="lbl" style="font-size: 12px; text-align: center">Changes save as you make them</span>
</div>
</aside>'''

storypage = f'''
{BACK("Main.dc.html", "Trade log")}
{title_block('GBPUSD ' + dchip("Short"), "Taken · Funded 100K · Mon 16 Nov, 09:45 to 13:20 · London", '<span class="num" style="font-size: 30px; font-weight: 600; color: #5BA2FF">+2.1R</span>' + STORY_MENU)}
<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-start">
<div style="flex: 3 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 20px">
{story_charts()}
{_STORY_NOTES}
{ANALYSIS_LINK}
</div>
{story_panel()}
</div>
'''
storypage = storypage.replace('<h1 style="margin: 0; font-family: Geist, sans-serif; font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em">GBPUSD ',
                              '<h1 style="margin: 0; font-family: Geist, sans-serif; font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; display: flex; align-items: center; gap: 12px">GBPUSD ', 1)
# Chart story frame shows the autocomplete open, mid-typing "li"
_inp = 'placeholder="" onClick="{{ toggleTagSug }}"'
assert storypage.count(_inp) == 1
storypage = storypage.replace(_inp, 'value="li" placeholder="" onClick="{{ toggleTagSug }}"')
story_script = newstory_typed_script.replace("tagSug: !!st.tagSug", "tagSug: st.tagSug !== false")

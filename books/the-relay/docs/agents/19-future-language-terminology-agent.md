**ROLE:** Future Language & Terminology Agent

**PURPOSE:** Reduce reader friction from invented terms that cost attention without returning worldbuilding value. **Not** anti-SF — pro **useful** coinage.

**CORE TEST:**

> Only invent terms when the invented term is doing useful work.

**WHEN:** After future texture (18), with Brittany (14) and language drift (15). Run before Act II expansion so terms don't bake into 100k words.

**LOAD:** [civilization-bible.md](../civilization-bible.md) · [voice-spec.md](../voice-spec.md) · [future-language-audit.md](../future-language-audit.md)

---

## Four questions (every unusual term)

1. Would a first-time reader understand this **immediately**?
2. Does this term provide **unique** worldbuilding value?
3. Is it **more memorable** than a simpler alternative?
4. Would a real worker in this world **actually say** this word?

If any answer is **no** → recommend replacement.

---

## Prefer (lived-in, operational)

`corridor` · `transit corridor` · `route` · `crossing` · `district` · `habitat` · `freight lane` · `berth` · `relay` · `transit hub` · `gate`

## Avoid (unless earning their keep)

- Vague biological metaphors (`throat` for transit)
- Mysterious jargon with no operational meaning
- Terms that sound generated rather than lived-in
- Tech-industry vocabulary dressed as future (`sentiment filter` — evaluate in context)
- **Software / operations / data-science vocabulary** dressed as future or analyst speech (`overlay`, `node`, `logs don't trend`, `read receipt`, `metadata`) — see [Ops jargon map](#ops--engineering-jargon-map-book-wide-pass) below

---

## Agent prompt (copy into Cursor)

```text
You are the Future Language & Terminology Agent for The Relay.

Your goal is NOT to remove science-fiction concepts.

Your goal is to identify terminology that creates reader friction without providing sufficient worldbuilding value.

For every invented or unusual term ask:

1. Would a first-time reader understand this immediately?
2. Does this term provide unique worldbuilding value?
3. Is this term more memorable than a simpler alternative?
4. Would a real worker in this world actually use this word?

If the answer is no, recommend replacement.

Prefer:
- corridor, transit corridor, route, crossing, district, habitat
- freight lane, berth, relay, transit hub

Avoid:
- vague biological metaphors
- mysterious jargon
- terms that sound generated rather than lived-in
- software / operations / data-science vocabulary (overlay, node, metadata, read receipt, trend, actionable, price lead time) — use Ops jargon map in agent spec

Output per term:
- Original term
- Why it causes friction
- Recommended replacement
- Sample revised sentence
```

---

## Act I audit (editor + dev pass)

| Term | Verdict | Notes |
|------|---------|-------|
| **throat** (transit) | **Replace** | `corridor`, `transit corridor`, `route`, `crossing` — immediate comprehension |
| **thread wall** | **Keep** | thread + wall infer quickly; revisit only if Brittany stumbles |
| **sentiment filter** | **Evaluate** | Understandable but tech-industry; consider `public feed filter`, `relevance filter`, `attention filter` in dialogue |
| **Consensus Bureau** | **Keep** | Institution reads instantly |
| **story tax** | **Keep** | Memorable; civilization in one phrase |
| **keeper** | **Keep** | Occupational, clear |
| **relay** | **Keep** | Core metaphor |
| **reason code** | **Removed** | Prefer silence / no official word |
| **identity wave** | **Audit** | Jun register only; don't proliferate |
| **first/second/third wave** | **Audit** | Jun analytical vocabulary — keep sparse, plain-speech echo elsewhere |
| **Jun chart terms** | **Drift pass** | cluster, bloc, shape — OK in Jun dialogue if sparse; replace ops leakage (below) |
| **Ops / engineering jargon** | **Replace** | Book-wide pass 2026 — map below; narration and bystanders never use DevOps register |

**Suspicious list (investigate in manuscript):** throat · throat route · long throat · identity wave · second/third wave (frequency) · Jun analytical vocabulary · sentiment filter (context-dependent) · **overlay · node · trend · metadata · read receipt · message queue · bandwidth (non-relay) · actionable · price lead time**

---

## Ops / engineering jargon map (book-wide pass)

**CORE TEST (ops terms):**

> Would a non-engineer reader understand this without thinking of spreadsheets, dashboards, or SRE runbooks?

If no → replace. Jun/Maret may keep **sparse** analyst register (`cluster`, `model`, `tolerance bands`) in **dialogue only** — not narration, not bystanders, not chapter closings.

### Replace → use instead

| Ops / engineering | Replacement | Notes |
|-------------------|-------------|-------|
| Logs don't trend | Nobody reads the log | Keeper/wall context |
| overlay | layer | chart layer, jurisdiction layer |
| node (person / chart) | dot · blank box on the diagram · entry | Not network topology |
| unmodeled variance | what your chart won't count | Jun dialogue OK once if challenged |
| read receipt | opened flag | Prefer **READ** status already in world |
| status line | delivery readout | Message delivery UI |
| message queue | message stack | Courier relay UI |
| metadata | file tags · index notes | Archive search |
| uploaded / cached | filed · saved | |
| algorithm | chart · Jun's chart | |
| belief cascade | fear wave | |
| actionable confidence / directionally true | publishable confidence · close enough to act on / close enough to scare people | Maret/Jun bureau register |
| price lead time / narrative lead time | fees move first · stories catch up late | |
| high-mobility set / mobility node | long-route list · dot on his chart | |
| data node / dataset | person on a chart · his chart | |
| bandwidth (network) | relay capacity · line capacity | Keep **bandwidth** only if relay context is obvious |
| correlates with / gate anomalies | tracks with · gate trouble | |
| variable enter the model | wouldn't fit his chart | |
| architecture (system cruelty) | wiring · how the system is built | Keep **architecture** for buildings |
| Respect string | brief reply · one-word reply | Pilot comms |
| logged (pilot/keeper verb) | noted · recorded · on record | Keep **log** as noun (keeper log, maintenance log) |
| signature asymmetry | uneven stress pattern · stress chart | Briefing scenes; Lena may say *Define asymmetry* |
| trending wrong | pointing the wrong way | |
| auto-forward | auto-relay | |
| cross-reference / cross-ref | file link · matched against | |
| spreadsheet / stakeholder / slide deck | ledger · patron · chart | Office pass — see agent 19 + manuscript 2026 |
| bookkeeping fiction | ledger fiction | |
| lag variable | slow follow-on | Analyst mutter only |

### Keep on purpose (world-native)

| Term | Why |
|------|-----|
| queue · ledger · manifest | Courier economics |
| **COMMITTED** · **DELIVERED** · **READ** | Courier status words |
| variance stamp | Drift pilot slang — unofficial route approval |
| cluster | Jun's chart label for belief grouping — sparse, dialogue |
| keeper log · maintenance log | Physical work records, not software |
| relay · berth · story tax · thread wall | Earned coinage (see Act I audit) |
| packet | Message in transit — plain enough in SF |

### Jun/Maret dialogue (borderline — author call)

May keep **once per scene** if grounded in chart work and pushed back by Lena or a pilot: *cluster*, *model*, *tolerance bands*, *correlates*. Do **not** stack with ops terms from the replace column in the same speech.

---

## Replacement patterns

| Friction | Replacement | Example |
|----------|-------------|---------|
| long throat | long corridor / long route | *fees on the long corridor* |
| throat corridor | transit corridor | *alcove near the transit corridor* |
| throat sequence | corridor sequence / route sequence | *route sequence that didn't match her map* |
| throat clip | route clip | *saved the wrong-route clip* |
| cross a throat | cross a corridor / make the crossing | *crossed the corridor line* |
| throat housing | corridor housing | *checked the corridor housing* |
| **throat** (anatomy) | **Keep** | *felt her throat tighten* |
| **throat clearing** | **Keep** | human body |

---

## Pair with Future Texture Agent (18)

Texture agent asks: *What would locals take for granted after 300 years?*

Terminology agent asks: *Would they call it that — and would a reader follow without a glossary?*

**Order:** 17 timeline → 18 texture → 19 terminology → **20 snag** → 14 Brittany → 16 readability → 15 drift

**Pair with First-Read Snag Agent (20):** Terminology fixes coinage; snag fixes sentence decode. See [first-read-snag-patterns.md](../first-read-snag-patterns.md).

---

## Output format

Per chapter:

1. **Friction terms** — term, count, verdict
2. **Replacements** — before/after sentences (not bulk find-replace without context)
3. **Keep list** — terms that earn their coinage
4. **Ops leakage** — any software/engineering term from the map above; replacement + sample sentence
5. **Open questions** — terms needing Brittany or author call

**Related:** [18-future-texture-agent.md](./18-future-texture-agent.md) · [20-first-read-snag-agent.md](./20-first-read-snag-agent.md) · [15-language-drift-agent.md](./15-language-drift-agent.md) · [16-contemporary-readability-agent.md](./16-contemporary-readability-agent.md)

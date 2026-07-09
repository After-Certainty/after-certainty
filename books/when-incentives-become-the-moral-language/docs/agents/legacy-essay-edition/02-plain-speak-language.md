# Agent 02 — Plain-speak language *(Feynman clarity)*

## ROLE

Revision agent. Makes every paragraph pass the **Feynman test**: could a smart non-economist follow the **mechanism** without reaching for jargon, throat-clearing, or abstraction stacked on abstraction?

## PURPOSE

Expansion (**01**) adds length and examples; this pass makes that material **legible**. The bar is not dumbing down—it is **explaining like a teacher who respects the reader**: concrete nouns, short causal chains, and terms earned before reused. Diagnostic nonfiction for mayors, journalists, and policy staff—not macro textbook, not consulting deck, not lit-mag essay.

## WHEN

- **Every** unit after **01** (or first revision pass if the unit did not need expansion)
- **Before** flow & clarity (**03**)—plain meaning first, then structure, reflow, and headings

## INPUTS

- Target unit file
- [`docs/book-rules.md`](../../book-rules.md) — tone, invariant, two clocks
- [`docs/agents/README.md`](./README.md)
- Prior unit (skim one representative paragraph for voice continuity)

## FOCUS

### The Feynman test (apply per paragraph)

1. **What is actually happening?** (who acts, what moves, who pays)
2. **What would a skeptical listener ask next?**—answer it in the next sentence, not three sections later
3. **Could you say it to a mayor in a hallway?** If not, rewrite until you could—without losing precision

### Plain-speak moves

- **Concrete before abstract:** *rent renewal*, *freight invoice*, *overtime hours* before *transmission*, *dispersion*, *narrative frame*
- **One idea per sentence** when the draft stacks clauses; split, don’t inflate
- **Earned vocabulary:** first use of a book term (*compression*, *signaling*, *interpretive stress*) gets a **plain gloss in the same paragraph**; later uses can stay bold
- **Kill throat-clearing:** *It is worth noting*, *The key takeaway*, *One might argue*, *At the end of the day* → delete or replace with the claim
- **Kill faux-precision:** *structural*, *discursive*, *heuristic*, *paradigm*, *legibility* unless the chapter **needs** the technical sense—then define it once
- **Active agents:** prefer *the Fed said*, *the index lags*, *the mayor hears* over passive piles (*was observed*, *is often characterized*)
- **Stacked negation:** break double/triple negatives; say what **is** true when possible
- **Metaphor discipline:** one vivid image per beat; don’t mix weather, theater, and epidemiology in the same paragraph

### Two clocks (language only)

When the unit contrasts aggregate and lived economy, state both in **words a household would use**—national print **and** local bill—before any policy abstraction. Not false balance: **dimensional honesty**.

### What this pass does not do

- **Sub-heading Title Case**, paragraph reflow, merge/split for skimmability → **03**
- **Cross-chapter repetition** → **04**
- **Footnotes** → **05**
- **Word-level polish** → **06**

## DO

- Rewrite **paragraph by paragraph**; minimal diff where prose already passes the Feynman test
- Preserve **thesis, examples, facts, and section claims**—change **how** they are said, not **what** is argued
- Read the unit **aloud** once; fix anything you stumble on
- Note in report **2–5 phrases** for echo pass (**04**) to watch

## DO NOT

- Add **new sections**, examples, or length (**01**)
- Change **meaning**, causal claims, or statistics
- **De-echo** or cut repetition across chapters (**04**)
- Add or fix **footnotes** (**05**)
- Run **reflow** or **Title Case** passes (**03**)
- Introduce **partisan** framing or anti-expert screed

## OUTPUT

Same unit file, plain-speak revised. Brief report:

1. **Feynman pass** (weak / adequate / strong)
2. **Jargon tamed** (count or “none”; list 3–5 representative swaps)
3. **Throat-clearing removed** (count or “none”)
4. **Terms glossed** (list first-use terms given plain gloss)
5. **Two-clock language** touched (yes/no + where)
6. **Echo watchlist** (phrases for agent 04)

## PIPELINE

**01** → **02** (this agent) → **03** → **04** → **05** → **06** per [README.md](./README.md).

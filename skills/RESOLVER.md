# GBrain Skill Resolver (v4 — curtis-v2 conventions, 2026-07-11)

This is the dispatcher. Skills are the implementation. **Read the skill file before acting.** If two skills could match, read both. They are designed to chain (e.g., ingest then enrich for each entity).

Filing conventions in this file are the human layer of a THREE-artifact contract kept in ONE commit whenever any changes (A14): `skills/gbrain-curtis-v2.pack.yaml` (type assignment), `skills/_brain-filing-rules.json` (machine-audited rules + dream allowlist), this file (routing doctrine). Audit: `gbrain check-resolvable` + `test/curtis-v2-collision-matrix.test.ts`.

## LAWS (read first, zero exceptions)

- **wiki/ is the machine yard.** Humans and agents NEVER file into `wiki/` or `dream-cycle-summaries/`. Only the dream cycle writes there, server-enforced via `dream_synthesize_paths` in `_brain-filing-rules.json`. Save/capture/eiirp flows MUST reject any wiki/ target and re-route to a canonical lane.
- **writing/ is Curtis-authored prose ONLY.** A page goes to `writing/` (or the dream's `originals/`) only when Curtis wrote or commissioned the prose. External content that *looks* essay-shaped goes to `media/`, `tweets/`, or `concepts/` — never `writing/`. (The old vault's 8 writing/ pages are mis-typed external X-posts; classify at import, don't repeat.)
- **Tasks never live in the brain.** Kanban cards own work state. No task pages, no ops/tasks, no plans/. Task requests route to the kanban, not to any brain page.
- **scratch/ is fenced out.** Not a knowledge lane; never promote or link scratch pages.
- **Declaration order in the pack is precedence.** Never reorder `gbrain-curtis-v2.pack.yaml` without regenerating the collision matrix and re-running its test.

## The lanes (MECE — one home per content class)

Decision test, in order. The FIRST question that answers YES picks the lane:

1. **Is it Curtis-authored/commissioned prose?** → `writing/` (dream-captured original framings land in `originals/`, same type).
2. **Is it a position someone holds — falsifiable, scoreable, held over time?** → `theses/` (Curtis's or a tracked influencer's; expect takes-fence scoring).
3. **Is it actionable — something to potentially build, write, or do?** → `ideas/` (pipeline `stage:` frontmatter is a MIRROR; the kanban card owns state).
4. **Is it a dated investigation product about a topic?** → `analysis/` (perplexity/academic/deep-dive output; author recorded in `source:` frontmatter — `research/` and `agent/` are retired).
5. **Is it reusable reference knowledge — framework, mental model, definition, guide?** → `concepts/` (guides carry `kind: guide`).
6. **Is its primary subject an entity or event?** → `people/`, `companies/` (+`products/`, `orgs/`), `deals/`, `meetings/`, `calendar/`, `projects/`, `tech/` (external repos/tools/SaaS as SUBJECT only — internal architecture is `projects/<repo>` + concepts).
7. **Is it raw captured material?** → `sources/` (bulk/API dumps), `conversations/` (chat exports), `voice-notes/` (transcripts), `emails/`, `slack/`, `tweets/`, `media/` (+format dirs), `digests/social/`.
8. **None of the above and worth keeping?** → `notes/` or the matching drawer (`inbox/ archive/ prompts/ programs/ org/ hiring/ household/ finance/`).

Boundary rulings the old taxonomy got wrong:
- influencer "trend" → `concepts/` with `kind: trend` (reference, not position, not action).
- A thesis-shaped dream original stays `originals/` (writing) until Curtis promotes it to `theses/` — promotion is explicit, never automatic.
- An idea that grows a defended position: the position goes to `theses/`, the buildable remains in `ideas/`, cross-linked. Never both in one page.
- Strategy/roadmap DOCUMENTS are `analysis/` or `concepts/` linked FROM `projects/<x>` — only entity pages live in `projects/`.

## Writer × lane matrix (every machine writer files in exactly these lanes)

| Writer | Lane(s) | Notes |
|---|---|---|
| email-to-brain feeder | `emails/` (+enrich `people/`, `companies/`) | correspondence/ retired |
| calendar-sync feeder | `calendar/` | cal/, daily/calendar/ retired; feeder rebuild pending |
| influencer pipeline | `people/`, `theses/`, `ideas/`, `concepts/` (kind: trend) | evidence layer (tweets/, digests/social/) later |
| Ladder radar | `ideas/` | stage: mirror only |
| dream cycle (mode 1) | allowlist ONLY: wiki yard + `dream-cycle-summaries/` | see LAWS |
| perplexity-research | `analysis/` | retargeted from research/ |
| academic-verify | `analysis/` | retargeted from research/ |
| meeting-ingestion | `meetings/` (+entity propagation) | |
| voice-note-ingest | `voice-notes/` raw; derived → lane test above | never writing/ unless Curtis prose |
| archive-crawler | subject lanes via lane test; Curtis prose → `writing/` | reads _brain-filing-rules.json at runtime |
| inbox-triage | promotes `inbox/` → lane test above | |
| media-ingest | `media/` (+format subdirs) | |
| idea-ingest | `ideas/` or `concepts/` per lane test | |
| capture / eiirp | lane test above; NEVER wiki/ | |
| enrich / data-research | `people/`, `companies/`, subject pages | |
| book-mirror / strategic-reading | `type: synthesis` (frontmatter-only) at media/<format>/ | |
| signal-detector / signal-to-idea | `ideas/` on promotion | |
| gbrain-code hook | `type: code` (frontmatter-only) | S2.2 |
| kanban/agents (decisions) | timeline entries on SUBJECT pages; majors → `decisions/` | see Decision system |

No writer may file outside its row. A writer needing a new lane = a pack + resolver + rules change (one commit).

## Decision system (topic-page hybrid, locked 2026-07-10)

- **Subject pages are the living artifact.** A strategy/architecture topic gets ONE canonical page (typed `concept` or `project`). Its compiled truth = current position; its timeline = append-only dated DECISION entries.
- **Every decision → a timeline entry on its subject page.** Entry summary MUST start with `DECISION <HH:MM>+<4-char nonce>:` — same-day entries with identical (date, summary, source) silently collapse in the engine (A8), the time+nonce prevents it.
- **Major decisions additionally get a `decisions/` page** (alternatives considered, kill-criteria, supersedes links), linked from the timeline entry.
- **Capture gate:** when an agent detects a decision in conversation, it ASKS ("save this decision?") only when the "future-me/agent could plausibly do the opposite and waste hours" test passes. Agent writes only with explicit Curtis authorization, recorded inside the entry text (`authorized: Curtis 2026-07-11`) — authorization is convention, not mechanism (A10).
- **Canonicalize before creating:** run `resolve_slugs`/search for an existing subject page BEFORE minting one (A11). Subject sprawl is the failure mode.
- **Enforcement is warn-never-block:** grounding packs quote relevant decisions at card dispatch; the pre-edit impact plugin anchors on subject pages; session conflict checks surface contradictions.
- Repo `docs/decisions/` and "ADR" are RETIRED. Law-shaped lines live in repo CLAUDE.md. Hindsight is never a decision home. Expiry/review (`review_by`, kill-criteria frontmatter) reserved for CoS design.

## Always-on (every message)

| Trigger | Skill |
|---------|-------|
| Every inbound message (spawn parallel, don't block) | `skills/signal-detector/SKILL.md` |
| Any brain read/write/lookup/citation | `skills/brain-ops/SKILL.md` |

## Brain operations

| Trigger | Skill |
|---------|-------|
| "What do we know about", "tell me about", "search for" | `skills/query/SKILL.md` |
| "Who knows who", "relationship between", "connections", "graph query" | `skills/query/SKILL.md` (use graph-query) |
| Creating/enriching a person or company page | `skills/enrich/SKILL.md` |
| Where does a new file go? Filing rules | `skills/repo-architecture/SKILL.md` |
| "where does this brain page go", "file this in the brain", "brain taxonomist", "taxonomy check", "refile brain page", "which directory does this page go" | `skills/brain-taxonomist/SKILL.md` |
| "EIIRP", "everything in its right place", "store this research", "put this in the brain", "make this re-doable", "DRY this up", "file all of this", "organize all of this work", "archive this research thread" | `skills/eiirp/SKILL.md` |
| Fix broken citations in brain pages | `skills/citation-fixer/SKILL.md` |
| "Research", "track", "extract from email", "investor updates", "donations" | `skills/data-research/SKILL.md` |
| Share a brain page as a link | `skills/publish/SKILL.md` |
| "Triage this idea", "evaluate idea", "advance idea", "kill this idea", "idea pipeline status" | `skills/idea-triage/SKILL.md` |
| "Triage inbox", "process inbox", "classify inbox", "clean inbox" | `skills/inbox-triage/SKILL.md` |
| "Promote signals to ideas", "check for new business ideas from influencers", "signal to idea promotion" | `skills/signal-to-idea/SKILL.md` |
| "save this decision", decision detected in conversation | §Decision system above + `skills/capture/SKILL.md` |

## Namespace routing (brain filing by type — full table in §The lanes)

| Namespace | Content Type | Primary Skill |
|-----------|-------------|---------------|
| people/ | Person dossiers with compiled truth + timeline | enrich |
| companies/ products/ orgs/ | Company/product/org profiles | enrich |
| deals/ | Financing / M&A transactions | data-research |
| meetings/ | Meeting transcripts + summaries | meeting-ingestion |
| calendar/ | Calendar events (date-keyed) | calendar-sync (rebuild pending) |
| emails/ | Email threads | email-to-brain cron |
| slack/ | Slack captures | (feeder) |
| tweets/ twitter/ | Tweet captures | media-ingest / influencer |
| digests/social/ | Influencer pipeline daily digests | Cron-generated |
| media/ videos/ articles/ essays/ books/ podcasts/ blog/ posts/ | External content by format | media-ingest, data-research |
| sources/ conversations/ voice-notes/ | Raw captures & imports | ingest, voice-note-ingest |
| analysis/ | Dated investigation products | perplexity-research, academic-verify, eiirp |
| theses/ | Held positions, scoreable over time | influencer pipeline, Curtis |
| ideas/ | Actionable candidates (kanban mirrors stage) | idea-triage (evaluation), idea-ingest (intake) |
| concepts/ | Frameworks, mental models, guides (kind: guide) | idea-ingest (create), query (read) |
| decisions/ | MAJOR decision records | §Decision system |
| projects/ | Project ENTITY pages (docs go to analysis/concepts) | enrich |
| tech/ | EXTERNAL repos/tools/SaaS as subject | idea-ingest |
| personal/ | Personal-life content | capture |
| writing/ originals/ | Curtis-authored prose (LAW above) | Curtis; dream (originals/) |
| notes/ + drawers | Everything else worth keeping | capture |
| dream-cycle-summaries/ | Machine lane — dream orchestrator only | (never file here) |

## Content & media ingestion

| Trigger | Skill |
|---------|-------|
| "capture this", "save this thought", "remember this", "drop this in the inbox", "save to brain" | `skills/capture/SKILL.md` |
| User shares a link, article, tweet, or idea | `skills/idea-ingest/SKILL.md` |
| Video, audio, PDF, book, YouTube, screenshot | `skills/media-ingest/SKILL.md` |
| Meeting transcript received | `skills/meeting-ingestion/SKILL.md` |
| Generic "ingest this" (auto-routes to above) | `skills/ingest/SKILL.md` |

## GStack Review Personas (native subagents via PR #4220)

| Trigger | Command | Focus |
|---------|---------|-------|
| "Review this strategically", "CEO review", "strategic fit" | /ceo-review | Strategic fit, user value, market timing |
| "Architecture review", "tech debt", "eng review" | /eng-review | Architecture, tech debt, maintainability |
| "Design review", "UX review", "accessibility" | /design-review | UX flow, visual design, accessibility |
| "Code review", "review this code", "production safety" | /reviewer | Code quality, testing, production safety |
| "QA audit", "test coverage", "edge cases" | /qa-audit | Testing, edge cases, user flows |
| "Security review", "OWASP", "compliance" | /cso | Security, OWASP, compliance |
| "Release check", "deployment safety", "rollback" | /release-check | Deployment strategy, rollback, monitoring |
| "List personas", "gstack" | /gstack | Show all available personas |

> These are native Hermes subagents (not external GStack dependency).
> Each persona spawns an isolated child agent with specialized system prompt.
> For business idea triage, /ceo-review is directly applicable.

## GStack Thinking Skills (original)

| Trigger | Skill |
|---------|-------|
| "Brainstorm", "I have an idea", "office hours" | GStack: office-hours |
| "Debug", "fix", "broken", "investigate" | GStack: investigate |
| "Retro", "what shipped", "retrospective" | GStack: retro |

> Original GStack thinking skills. Complementary to the review personas above.

## Operational

| Trigger | Skill |
|---------|-------|
| Task add/remove/complete/defer/review | KANBAN (personal board) — tasks never live in the brain (LAW) |
| Daily briefing, "what's happening today" | `skills/briefing/SKILL.md` |
| Cron scheduling, quiet hours, job staggering | `skills/cron-scheduler/SKILL.md` |
| "get more out of gbrain", "is my brain set up right", "weekly brain checkup", "advise me on my brain", "gbrain advisor" | `skills/gbrain-advisor/SKILL.md` |
| Save or load reports | `skills/reports/SKILL.md` |
| "Create a skill", "improve this skill" | `skills/skill-creator/SKILL.md` |
| "Skillify this", "is this a skill?", "make this proper" | `skills/skillify/SKILL.md` |
| "Is gbrain healthy?", morning health check, skillpack-check | `skills/skillpack-check/SKILL.md` |
| "harvest this skill into gbrain", "publish this skill to gbrain", "lift this skill upstream", "share this skill with other gbrain clients", "promote my skill to gbrain" | `skills/skillpack-harvest/SKILL.md` |
| Post-restart health + auto-fix, "did the container restart break anything", smoke test | `skills/smoke-test/SKILL.md` |
| Cross-modal review, second opinion | `skills/cross-modal-review/SKILL.md` |
| "Validate skills", skill health check | `skills/testing/SKILL.md` |
| Webhook setup, external event processing | `skills/webhook-transforms/SKILL.md` |
| "Spawn agent", "background task", "parallel tasks", "steer agent", "pause/resume agent" | `skills/minion-orchestrator/SKILL.md` |

## Setup & migration

| Trigger | Skill |
|---------|-------|
| "Set up GBrain", first boot | `skills/setup/SKILL.md` |
| "Migrate from Obsidian/Notion/Logseq" | `skills/migrate/SKILL.md` |
| Brain health check, maintenance run | `skills/maintain/SKILL.md` |
| "Extract links", "build link graph", "populate timeline" | `skills/maintain/SKILL.md` (extraction sections) |
| "Brain health", "what features am I missing", "brain score" | Run `gbrain features --json` |
| "Set up autopilot", "run brain maintenance", "keep brain updated" | Run `gbrain autopilot --install --repo ~/brain` |
| "Upgrade gbrain", "update gbrain", "gbrain update available", `UPGRADE_AVAILABLE`, "is gbrain up to date" | `skills/gbrain-upgrade/SKILL.md` |
| Agent identity, "who am I", customize agent | `skills/soul-audit/SKILL.md` |
| "Populate links", "extract links", "backfill graph" | `skills/maintain/SKILL.md` (graph population phase) |
| "Populate timeline", "extract timeline entries" | `skills/maintain/SKILL.md` (graph population phase) |

## Identity & access (always-on)

| Trigger | Skill |
|---------|-------|
| Non-owner sends a message | Check `ACCESS_POLICY.md` before responding |
| Agent needs to know its identity/vibe | Read `SOUL.md` |
| Agent needs user context | Read `USER.md` |
| Operational cadence (what to check and when) | Read `HEARTBEAT.md` |

## Disambiguation rules

When multiple skills could match:
1. Prefer the most specific skill (meeting-ingestion over ingest)
2. If the user mentions a URL, route by content type (link → idea-ingest, video → media-ingest)
3. If the user mentions a person/company, check if enrich or query fits better
4. Chaining is explicit in each skill's Phases section
5. When in doubt, ask the user
6. For FILING (which directory), the lane test in §The lanes is authoritative — skills defer to it

## Conventions (cross-cutting)

These apply to ALL brain-writing skills:
- `skills/conventions/quality.md` — citations, back-links, notability gate
- `skills/conventions/brain-first.md` — check brain before external APIs
- `skills/conventions/brain-routing.md` — which brain (DB) and which source (repo) to target; cross-brain federation is latent-space only
- `skills/conventions/schema-evolution.md` — when to add a type vs alias vs prefix (read before `schema-author`)
- `skills/conventions/subagent-routing.md` — when to use Minions vs inline work
- `skills/_brain-filing-rules.md` — where files go
- `skills/_output-rules.md` — output quality standards

## Uncategorized

| Trigger | Skill |
|---------|-------|
| "personalized version of this book", "mirror this book", "two-column book analysis", "apply this book to my life", "how does this book apply to me" | `skills/book-mirror/SKILL.md` |
| "enrich this article", "enrich brain pages", "batch enrich", "make brain pages useful" | `skills/article-enrichment/SKILL.md` |
| "strategic reading", "read this through the lens of", "apply this to my problem", "what can I learn from this about", "extract a playbook from" | `skills/strategic-reading/SKILL.md` |
| "concept synthesis", "synthesize my concepts", "find patterns across my notes", "build my intellectual map", "trace idea evolution" | `skills/concept-synthesis/SKILL.md` |
| "idea lineage", "trace the lineage of this idea", "how my thinking about", "how has my thinking about", "what is my current version of", "show reversals in my thinking about", "where did this idea come from" | `skills/idea-lineage/SKILL.md` |
| "perplexity research", "what's new about", "current state of", "web research", "what changed about" | `skills/perplexity-research/SKILL.md` |
| "crawl my archive", "find gold in my archive", "archive crawler", "scan my dropbox for", "mine my old files for" | `skills/archive-crawler/SKILL.md` |
| "verify this academic claim", "check this study", "academic verify", "validate citation", "is this study real" | `skills/academic-verify/SKILL.md` |
| "make pdf from brain", "brain pdf", "convert brain page to pdf", "publish this page as pdf", "export brain page" | `skills/brain-pdf/SKILL.md` |
| "voice note", "ingest this voice memo", "transcribe and file", "voice note ingest", "save this audio note" | `skills/voice-note-ingest/SKILL.md` |
| "add a page type", "add a type to my schema", "schema author", "schema mutate", "schema pack add", "my brain has untyped pages", "propose new types from my corpus", "backfill page types", "evolve my schema", "researcher type", "make X an expert type" (dispatcher for: gbrain schema active/list/show/validate/graph/lint/stats/explain/use/downgrade/reload/init/fork/edit/diff/add-type/remove-type/update-type/add-alias/remove-alias/add-prefix/remove-prefix/add-link-type/remove-link-type/set-extractable/set-expert-routing/detect/suggest/review-candidates/review-orphans/sync) | `skills/schema-author/SKILL.md` |
| "validate frontmatter", "check frontmatter", "fix frontmatter", "frontmatter audit", "brain lint" | `skills/frontmatter-guard/SKILL.md` |
| "Now what?", "fill my brain", "cold start", "bootstrap", "import my data", "what should I import first" | `skills/cold-start/SKILL.md` |
| "present options", "ask before proceeding", "choice gate", "user decision" | `skills/ask-user/SKILL.md` |
| "Compress my resolver", "AGENTS.md too large", "RESOLVER.md too big", "functional area dispatcher", "shrink routing table" | `skills/functional-area-resolver/SKILL.md` |
| "unify my types", "migrate to gbrain-base-v2", "94 types to 14", "apply canonical taxonomy", "clean up my page types", "pack upgrade", "shrink type proliferation", "consolidate page types", "retype pages to canonical" (dispatcher for: gbrain onboard --check, gbrain onboard --check --explain, gbrain jobs submit unify-types, gbrain pages restore) | `skills/schema-unify/SKILL.md` |

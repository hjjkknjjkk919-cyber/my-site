---
id: 2
title: "Assumed which video was the user's own from a coincidental view count instead of asking"
status: open
type: open-source
skill: []
proposes_skill: []
target_file: [/home/user/my-site/CLAUDE.md]
siblings_checked: "none — no skill-families.md registry; target is the project instruction file, not a skill"
area: "reviewing 'our' published video performance (the 'what is wrong with us' review step)"
date: 2026-11-26
session_context: "user asked why their first video got 1300 views in two days; I picked a reference link with 1395 views as theirs"
parked_until:
resolved:
resolution:
reference:
commands_verified: none
next_actor: review
use_evidence:
escalated:
---

**Issue:** The user asked "what did we do wrong? our first video got 1300 views in two days". Among the 7 reference links the user had sent, one had 1395 views and a 38-subscriber channel, so I treated it as the user's video, ran a full review, and wrote six findings into LESSONS.md. It was someone else's video; the user corrected me angrily ("откуда ты бля взял это такси") and sent the real link. The real video had been built in this repo (grep for its topic hit src/scenes and story_v2.md), which I could have checked before asserting anything.

**Suggested improvement:** In CLAUDE.md's "new idea" rule, step 1 ("Разбор «что у нас не так»"), add: identify "our" video by an explicit link from the user or by a match in the repo (composition, story file, render name); if neither exists, ask for the link before analysing. Never infer ownership from metrics such as a similar view count.

**Principle:** When a request refers to "our"/"my" artifact, establish which artifact it is from the user or from the project's own records before analysing it; a coincidental attribute match is not identification, and a confident analysis of the wrong artifact costs more trust than a one-line question.

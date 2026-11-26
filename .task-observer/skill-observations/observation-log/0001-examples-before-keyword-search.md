---
id: 1
title: "Trend research ran broad keyword searches for a format named by nickname instead of asking for example links first"
status: open
type: open-source
skill: []
proposes_skill: []
target_file: [/home/user/my-site/CLAUDE.md]
siblings_checked: "none — no skill-families.md registry; target is the project instruction file, not a skill"
area: "CLAUDE.md, «поучись на трендах» command, step 1 (choosing what to study)"
date: 2026-11-26
session_context: "running scripts/viral_learner.py learn to study a Shorts format the user named as 'like survive 3 days with Babayka'"
parked_until:
resolved:
resolution:
reference:
commands_verified: none
next_actor: review
use_evidence:
escalated:
---

**Issue:** The user asked for trend study of "CGI animations like 'выжить 3 дня с бабайкой'". I ran three keyword-driven `learn` batches (default queries → dubbing parodies; hashtag/CGI queries → global horror loops; RU "бабайка" queries → live-action skits), about 15 minutes of downloads and transcription, all off-target. The user corrected twice ("это ваще не то", then sent 7 links: "ИМЕННО ТАКИЕ НИКАКИЕ БОЛЬШЕ"). The real format (flat 2D "survival instruction" explainers, 72–174 s) shared no keywords with the nickname the user used. The first off-target batch was already evidence that the nickname did not map to search terms.

**Suggested improvement:** In CLAUDE.md «поучись на трендах <тема>», add: if the theme is a format described by an example title or nickname (not a search phrase) and the first batch's storyboards do not match it, stop searching and ask the user for 2–3 example links, then run `viral_learner.py study <urls>`. Treat user-supplied examples as the reference set; broad search only after the format is pinned down by examples.

**Principle:** When a requested reference format is named by a nickname or example rather than defined, one off-target search result is the signal to get concrete examples from the requester — iterating keyword searches spends effort on guesses the requester could resolve in one message.

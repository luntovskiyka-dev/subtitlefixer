---
title: "Subtitles Out of Sync? Shift vs Drift | SubtitleFixer"
description: "Why subtitles go out of sync, how to tell a constant delay from gradual drift, and how to fix each: a quick player tweak or a permanent fix to the file."
h1: "Subtitles Out of Sync? How to Tell Shift from Drift and Fix It"
slug: "/guides/subtitles-out-of-sync"
answer: "Subtitles go out of sync in three ways: a constant offset (every line is off by the same amount), drift (the gap grows as the video plays) or cue-level errors (only part of the file is off)."
faq:
  - q: "Why are my subtitles out of sync?"
    a: "Your subtitle file was most likely timed for a slightly different version of the video. A different intro, a different frame rate or a different cut all change when each line should appear, and the subtitle file can't adjust to that by itself."
  - q: "How can I tell if my subtitles are offset or drifting?"
    a: "Check one clearly spoken line near the start, one in the middle and one near the end. If the subtitles are off by the same amount at all three points, it's a constant offset. If the gap grows from start to end, it's drift."
  - q: "Why do my subtitles get further out of sync the longer the video plays?"
    a: "That is drift. The subtitle timing runs at a slightly different speed than your video, usually because the file was made for a release with a different frame rate, such as 25 fps instead of 23.976 fps. A single shift can't fix it. Use [fix subtitle drift](/fix-subtitle-drift) instead."
  - q: "Does changing the subtitle delay in VLC change the subtitle file?"
    a: "No. The H and G keys in VLC change the subtitle delay for playback in VLC only. The subtitle file stays the same. To fix the file itself, apply the same delay with [shift subtitles](/shift-subtitles)."
  - q: "Why are my subtitles right at first but wrong after a certain scene?"
    a: "Your video is probably a different cut, or ad breaks were removed from a TV recording. Everything after that point is off by the same amount. Use [shift subtitles](/shift-subtitles) and start the shift from the first line that's wrong, so the earlier lines stay as they are."
  - q: "How much should I shift my subtitles?"
    a: "Compare when you hear a clear line with when its subtitle appears. If the subtitle shows up 2 seconds after the voice, move the subtitles 2,000 ms earlier. If it shows up before the voice, move them later. A player's subtitle delay setting is a handy way to find the exact value first."
  - q: "Should I fix timing before or after converting to another format?"
    a: "Either order works for a simple shift, because shift subtitles works with SRT, VTT and ASS files directly. The easiest approach is to fix the timing in the format you already have, then convert if you need to."
  - q: "Can I fix out-of-sync subtitles online for free?"
    a: "Yes. The SubtitleFixer timing tools are free and run in your browser. Your subtitle file is not uploaded, and you don't need an account."
---

# Subtitles Out of Sync? How to Tell Shift from Drift and Fix It

**Out-of-sync subtitles almost always have one of three causes: a constant offset, drift, or errors in one part of the file.**

Each one needs a different fix, so the first step is to find out which one you have. This guide shows you how to check, how to fix the subtitle file for good, and when a quick setting in your player is enough.

## Why are my subtitles out of sync?

**Subtitles go out of sync when the subtitle file was timed for a slightly different version of the video than the one you're playing.**

A subtitle file is just text with a start and end time for each line. It doesn't know which video it's playing with. If it was made for another release, the times no longer match what you see and hear. This happens a lot with downloaded movies and TV episodes, where the subtitles and the video often come from different sources.

There are three typical patterns:

1. **Constant offset.** Every line is early or late by the same amount, from the first minute to the last. A different intro, logo or recap at the start is a common cause.
2. **Drift.** The subtitles are almost right at the start but get further off as the video plays. The usual cause is a frame-rate mismatch between the release the subtitles were made for and your video.
3. **Cue-level errors.** Most of the file is fine, but the timing jumps after a certain scene, or a few single lines are wrong. Common causes are a different cut (for example extended vs theatrical) or ad breaks removed from a TV recording.

## How to tell which problem you have

**Check the sync at three points: near the start, in the middle and near the end of the video.**

1. Find a clearly spoken line near the start. Note how early or late its subtitle is.
2. Do the same around the middle.
3. Do the same near the end.

Then compare what you found:

| What you see | Problem | What to do |
|---|---|---|
| The same gap at the start, middle and end | Constant offset | [Shift subtitles](/shift-subtitles) by that amount |
| A small gap at the start, a bigger one in the middle, the biggest at the end | Drift | [Fix subtitle drift](/fix-subtitle-drift) with two-point sync |
| Early at the start but late by the end, or the other way round | Drift plus an offset | [Fix subtitle drift](/fix-subtitle-drift) with two-point sync |
| In sync until one scene, then off by a fixed amount | Cue-level error (different cut or ad break) | [Shift subtitles](/shift-subtitles) starting from the first wrong line |
| Only a few random lines are wrong | Cue-level error (badly timed lines) | Fix those lines in a subtitle editor, or find a file made for your release |

## Constant offset: every line is off by the same amount

**A constant offset is fixed by moving every subtitle by the same number of milliseconds.**

To find the amount, compare when you hear a line with when its subtitle appears:

- If the subtitle appears **after** the voice, the subtitles are late. Move them earlier.
- If the subtitle appears **before** the voice, the subtitles are early. Move them later.

For example, if a subtitle shows up 2 seconds after the line is spoken, move all subtitles 2,000 ms earlier.

A quick way to measure is your player's subtitle delay setting (see [player delay vs fixing the file](#player-delay-vs-fixing-the-file)). Adjust it until the lines match, note the value, then apply the same amount to the file.

To fix the file permanently, use [shift subtitles](/shift-subtitles). It moves every cue earlier or later by the number of milliseconds you enter, and it works with SRT, VTT and ASS files.

## Drift: the gap grows as the video plays

**Drift means the subtitle timing runs at a slightly different speed than the video, so no single shift can fix it.**

If you shift drifting subtitles to match the start, they'll be wrong at the end. If you match the end, the start will be wrong.

The most common cause is a frame-rate mismatch:

- Films are usually shot at 24 frames per second, and many video releases use 23.976 fps.
- European PAL TV and DVD releases often play the same film at 25 fps, so it runs slightly faster and finishes sooner.
- Subtitles timed for one version drift against the other. Because 25 ÷ 23.976 ≈ 1.043, the timing is off by about 4%. That adds up to several minutes by the end of a feature film.

To correct drift, use [fix subtitle drift](/fix-subtitle-drift). It gives you two options:

- **Two-point sync:** enter the correct time for two lines, ideally one near the start and one near the end. Every cue is then re-timed in proportion. This fixes drift and any offset at the same time.
- **Frame-rate presets:** if you know both frame rates, convert directly between 23.976 and 25, 24 and 25, or 23.976 and 24 fps. Presets can convert several files at once, such as a whole season; two-point sync works on one file at a time.

If you don't know the frame rates, use two-point sync. It works from what you actually see on screen.

## Cue-level errors: only part of the file is off

**When only part of the file is out of sync, fix that part on its own instead of the whole file.**

**Different cut or removed ad breaks.** The subtitles are in sync up to a certain scene, and everything after it is off by the same amount. Use [shift subtitles](/shift-subtitles) and start the shift from the first line that's wrong. Lines before it stay as they are. If the timing jumps again later, repeat the shift from the next wrong line.

**A few badly timed lines.** If only single lines appear too early or too late, no automatic tool can know the right time for each one. Fix those lines by hand in a subtitle editor, or look for a subtitle file made for your exact release.

**Missing or extra scenes.** Subtitles for dialogue you never see, or long silent gaps where people are talking, point to a different cut. A subtitle file made for your version is usually the quickest fix.

## Player delay vs fixing the file

**A subtitle delay setting in your player is a quick fix for watching, but it doesn't change the subtitle file.**

That's fine if you only want to watch once. But if you play the file in another app, on another device, or share it, the problem comes back. Player delay settings also move all lines by the same amount, so they can't correct drift.

For a permanent fix, change the file itself with [shift subtitles](/shift-subtitles) or [fix subtitle drift](/fix-subtitle-drift).

### VLC

In VLC, press **H** or **G** during playback to change the subtitle delay. According to VLC's hotkey list, H turns the subtitle delay up and G turns it down. If the gap gets bigger, press the other key. This changes playback in VLC only. Your subtitle file stays the same.

### Plex

Many Plex apps have an **Adjust Offsets** option in the playback settings. Plex's help says it works only for external text-based subtitles, such as a separate SRT file, and not for subtitles embedded in the video or image-based subtitles. Plex also has an **Auto-Sync Subtitles** option, which needs the server to analyse the video's audio first. Both are player settings: they don't edit your subtitle file.

### Jellyfin

Jellyfin's web player has a **Subtitle Offset** option in the playback settings menu for text-based subtitles, such as SRT or VTT files. It isn't available for image-based subtitles like PGS. It adjusts playback only. The subtitle file stays the same.

## Streaming on Netflix, Prime Video or Hulu?

**SubtitleFixer can't fix subtitles on streaming services like Netflix, Prime Video or Hulu, because the subtitles aren't a file on your device.**

Our tools fix subtitle files that you have. Streaming apps load their own subtitles, and there's nothing for you to download and edit. What you can do:

- **Check other titles.** If every show is out of sync, the problem is probably your app or device. Restart the app or the device, and install any updates.
- **Report the title.** If only one show or movie is affected, report it to the service. Netflix, for example, lets you report a problem with a title from Viewing Activity in your account.

## FAQ

<!-- FAQ is rendered from the `faq` frontmatter (FAQPage JSON-LD). -->

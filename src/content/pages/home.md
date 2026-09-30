---
title: "Fix Subtitles Online – Free Subtitle Tools | SubtitleFixer"
description: "Free subtitle tools that run in your browser: shift timing, fix drift, repair garbled text, convert SRT, VTT and ASS files. No upload, no sign-up."
h1: "Fix Subtitles Online"
subline: "Free subtitle tools that run entirely in your browser: no upload, no sign-up."
slug: "/"
answer: "SubtitleFixer is a set of free subtitle tools that fix timing, drift, garbled characters and format problems entirely in your browser, so your files never leave your device."
faq:
  - q: "Are my subtitle files uploaded anywhere?"
    a: "No. SubtitleFixer reads and fixes your files with code that runs in your browser. The files are not sent to a server, and nothing is stored on our side."
  - q: "Is SubtitleFixer really free? Do I need an account?"
    a: "Yes, every tool is free, and there is no paid version. You don't need an account, a sign-up or an email address."
  - q: "Which subtitle formats do you support?"
    a: "The tools work with SRT, VTT and ASS subtitle files, and the ASS to SRT converter also takes older SSA files. The encoding fixer also accepts text-based SUB and TXT files. You can convert SRT files to VTT and back, and convert ASS or SSA files to SRT files. Not sure which format you need? Read [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass)."
  - q: "Why are my subtitles out of sync, and which tool do I need?"
    a: "If every line is early or late by the same amount, use [shift subtitles](/shift-subtitles). If the subtitles start in sync and slowly drift, use [fix subtitle drift](/fix-subtitle-drift). If you're not sure, the guide [Subtitles out of sync](/guides/subtitles-out-of-sync) helps you find out in a few checks."
  - q: "Why do my subtitles show weird characters?"
    a: "Weird characters like `Ã©` or `Ð¿Ñ€Ð¸` usually mean the file was read with the wrong text encoding. Use [fix subtitle encoding](/fix-subtitle-encoding) to find the right one and save the file as UTF-8."
  - q: "Can I fix or convert many files at once?"
    a: "Yes. You can add several files at once. A single result downloads as a file, and several results download together as one zip. The only exception is two-point sync in [fix subtitle drift](/fix-subtitle-drift), which works on one file at a time."
---

# Fix Subtitles Online

Free subtitle tools that run entirely in your browser: no upload, no sign-up.

**SubtitleFixer fixes subtitle timing, drift, garbled characters and format problems in your browser, so your files never leave your device.**

Pick the tool that matches your problem, drop in your file, and download the fixed version.

## The tools

**SubtitleFixer has six free tools, grouped by the problem they solve.**

### Timing

- [**Shift subtitles**](/shift-subtitles): move every subtitle earlier or later by a number of milliseconds, from the first line or from any line you choose, in SRT, VTT and ASS files.
- [**Fix subtitle drift**](/fix-subtitle-drift): re-time subtitles that start in sync but slowly drift, either by setting the correct time for two lines or with a frame-rate preset such as 23.976 → 25 fps.

### Text and encoding

- [**Fix subtitle encoding**](/fix-subtitle-encoding): turn garbled text like `Ã©` or `Ð¿Ñ€Ð¸` back into readable letters by detecting the encoding, comparing a few previews, picking your language and saving the file as UTF-8.

### Format conversion

- [**SRT to VTT**](/srt-to-vtt): convert one or many SubRip (.srt) files to WebVTT (.vtt), the format used by HTML5 video.
- [**VTT to SRT**](/vtt-to-srt): convert one or many WebVTT (.vtt) files to SubRip (.srt) files.
- [**ASS to SRT**](/ass-to-srt): turn styled Advanced SubStation Alpha (.ass) and SubStation Alpha (.ssa) files into SRT subtitles by removing styling tags (italics and bold are kept), turning `\N` into real line breaks and merging duplicate lines from multiple layers.

## Which tool do I need?

**Start from what you see on screen, then pick the matching tool.**

| What's wrong | Tool |
|---|---|
| Subtitles are early or late by the same amount the whole time | [Shift subtitles](/shift-subtitles) |
| Subtitles are fine at the start but get further off as the video plays | [Fix subtitle drift](/fix-subtitle-drift) |
| Subtitles are fine until one scene, then off from there on | [Shift subtitles](/shift-subtitles), starting from the first wrong line |
| Text shows strange characters instead of letters | [Fix subtitle encoding](/fix-subtitle-encoding) |
| Your website or player needs a VTT file, but you have an SRT file | [SRT to VTT](/srt-to-vtt) |
| You need an SRT file, but you have a VTT file | [VTT to SRT](/vtt-to-srt) |
| You have an ASS file, but your player or platform only takes SRT files | [ASS to SRT](/ass-to-srt) |

Not sure what kind of timing problem you have? Read [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

## Why everything runs in your browser

**SubtitleFixer processes your subtitle files on your own device, not on a server.**

When you add a file, the page reads it and fixes it with code running in your browser. Nothing is uploaded. This means:

- **Privacy:** your subtitles stay on your device. That matters for personal videos and unreleased work.
- **No waiting for uploads:** there is no upload or download queue.
- **No account:** no sign-up, no email address, no login.
- **Many files at once:** add several files and download all the results together as one zip.

## Guides

**The guides explain the problems behind the tools, in plain English.**

- [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync): find out whether your subtitles have a constant delay, drift or errors in one section, and how to fix each.
- [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass): what each subtitle format can do and which one to use for YouTube, websites, Plex, Jellyfin and VLC.

## FAQ

<!-- FAQ is rendered from the `faq` frontmatter (FAQPage JSON-LD). -->

---

SubtitleFixer is run by Kirill Luntovskii. [About SubtitleFixer](/about) · [Privacy](/privacy)

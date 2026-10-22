---
title: "VTT to SRT Converter: Free WebVTT to SRT | SubtitleFixer"
description: "Convert VTT to SRT in your browser: YouTube, Zoom and Teams captions, many files at once, exact timings. Free, no sign-up, files never leave your device."
h1: "VTT to SRT Converter"
slug: "vtt-to-srt"
answer: "To convert VTT to SRT, drop your .vtt files on this page and download the SRT files: SubtitleFixer numbers each subtitle, changes the timestamp format and removes what SRT can't store, in your browser, with the same text and timings and no upload."
faq:
  - q: "How do I convert VTT to SRT?"
    a: "Drop one or more VTT files on this page or paste VTT text, then download the SRT files. SubtitleFixer numbers each subtitle 1, 2, 3…, changes the period in each timestamp to a comma and saves the result as UTF-8, all in your browser."
  - q: "Will I lose positioning, styling or comments?"
    a: "Yes, because SRT has no place for them. Cue settings like `align:start`, `STYLE` and `REGION` blocks, `NOTE` comments and tags other than `<i>`, `<b>` and `<u>` are removed. Italic, bold and underline are kept."
  - q: "Will the subtitles stay in sync?"
    a: "Yes. Every start and end time is kept to the millisecond. If they were already out of sync, fix them afterwards with [Shift subtitles](/shift-subtitles)."
  - q: "Can I convert YouTube auto-generated VTT captions?"
    a: "Yes. SubtitleFixer removes the `<c>` tags and word-by-word timestamps. It does not merge the repeated rolling lines, so each line stays a separate subtitle. If you only need the words, use [VTT to TXT](/vtt-to-txt) and tick \"Remove repeated lines\"."
  - q: "Can I turn a Zoom or Teams transcript into SRT?"
    a: "Yes. Zoom and Microsoft Teams save transcripts as .vtt files. Speaker tags like `<v Anna>` become \"Anna: \" at the start of the line."
  - q: "Does Premiere Pro need SRT instead of VTT?"
    a: "Premiere Pro can import SRT caption files, so converting a VTT file to SRT is a simple way to bring web or meeting captions into your edit. Import the .srt file into your project and add it to the timeline."
  - q: "Will the SRT file work in VLC, Plex or on my TV?"
    a: "SRT is the most widely supported subtitle format for desktop players, media servers and TVs, including VLC and Plex. If an older TV shows wrong characters, tick \"Add BOM (old players)\" and convert again."
  - q: "Is my VTT file uploaded?"
    a: "No. SubtitleFixer converts VTT to SRT inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/ass-to-vtt", "/txt-to-vtt", "/srt-to-vtt", "/vtt-to-txt", "/shift-subtitles", "/srt-to-txt", "/sbv-to-srt", "/sup-to-srt", "/fix-subtitle-encoding", "/guides/srt-vs-vtt-vs-ass"]
---

Free VTT to SRT conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert VTT to SRT in 3 steps

1. **Add your VTT files.** Drag one or more .vtt files onto the page, click to choose them, or paste VTT text with the "Paste text" option.
2. **Check the preview.** SubtitleFixer shows the numbered SRT result with the same text and timings.
3. **Download.** One file downloads as an .srt file; several files download together as one zip.

## Example: before and after

Before (VTT):

```vtt
WEBVTT

NOTE Exported from the web player

00:00:02.500 --> 00:00:05.000 align:start
Good afternoon, everyone.

00:00:05.300 --> 00:00:08.960
<v Anna>Let's start with the numbers.
```

After (SRT):

```srt
1
00:00:02,500 --> 00:00:05,000
Good afternoon, everyone.

2
00:00:05,300 --> 00:00:08,960
Anna: Let's start with the numbers.
```

The times are the same: `00:00:02.500` became `00:00:02,500`. The `NOTE` comment and `align:start` are gone because SRT can't store them, and `<v Anna>` became "Anna: ".

## What it can and can't do

**What it does:**

- Convert WebVTT (.vtt) captions to SubRip (.srt).
- Number every subtitle and use the SRT timestamp format.
- Keep every start and end time exactly, to the millisecond.
- Keep `<i>`, `<b>` and `<u>` tags and remove all other tags.
- Turn speaker tags like `<v Anna>` into "Anna: ".
- Remove YouTube `<c>` tags and word-by-word timestamps from auto-generated captions.
- Turn codes like `&amp;` back into normal characters and drop cues with no text left.
- Read files in other encodings and save the SRT file as UTF-8, with an optional BOM for old players.
- Convert pasted VTT text as well as files.
- Convert many files at once and give you one zip.
- Run fully in your browser, with no upload and no sign-up.

**What it doesn't do:**

- Keep VTT positioning, `STYLE` or `REGION` blocks, or `NOTE` comments. SRT has no place for them.
- Merge the repeated rolling lines of YouTube auto-captions.
- Download captions from a video link. You need the .vtt file, or its text, on your device.
- Repair garbled text like `Ã©`. Use [Fix subtitle encoding](/fix-subtitle-encoding).
- Fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles).

## What changes from VTT to SRT

- **Header:** the `WEBVTT` line is removed.
- **Numbers:** every subtitle gets a number, which SRT requires.
- **Speakers:** `<v Anna>` becomes "Anna: ".
- **Tags:** `<i>`, `<b>` and `<u>` stay; other tags are removed.
- **Timestamps:** `00:00:02.500` becomes `00:00:02,500`.
- **Removed:** cue settings, `STYLE`, `REGION` and `NOTE` blocks, and YouTube word timestamps.

For a full comparison, read [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

## VTT files from YouTube, Zoom and Teams

- **YouTube:** downloaded captions are often .vtt files. Tags and word timestamps are cleaned; repeated rolling lines stay.
- **Zoom and Microsoft Teams:** meeting transcripts are .vtt files, and speaker names are kept as "Name: ".
- **Web players:** most HTML5 players use VTT captions.

Once converted, the SRT file works in video editors, on TVs and in most desktop players.

## Related tools

- [ASS to VTT converter](/ass-to-vtt): turn ASS or SSA into WebVTT.
- [TXT to VTT](/txt-to-vtt): turn a script or transcript into WebVTT.
- [SRT to VTT converter](/srt-to-vtt): turn SRT back into VTT for web players.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later.
- [SRT to TXT](/srt-to-txt): get plain text from SRT or ASS captions.
- [VTT to TXT](/vtt-to-txt): turn VTT captions into plain text.
- [SBV to SRT converter](/sbv-to-srt): turn YouTube SBV captions into SRT.
- [SUP to SRT converter](/sup-to-srt): read a Blu-ray .sup picture subtitle into SRT. Check the text: OCR can be wrong.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.
- Guide: [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

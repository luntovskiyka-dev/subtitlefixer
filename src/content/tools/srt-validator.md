---
title: "SRT Validator: Check SRT Files for Errors | SubtitleFixer"
description: "Check SRT files for errors: broken numbering, bad timestamps, overlaps, empty lines and encoding. Line-by-line report. Free, in your browser, no upload."
h1: "SRT Validator and Checker"
slug: "srt-validator"
answer: "To validate an SRT file, drop it on this page: SubtitleFixer checks the numbering, timestamps, overlaps, empty subtitles and encoding, and lists every problem with its subtitle number, in your browser and without uploading anything."
faq:
  - q: "How do I check an SRT file for errors?"
    a: "Drop the SRT file on this page. You get a list of problems, each with the subtitle number and what is wrong. If there are none, you see that the file is valid. Nothing is uploaded."
  - q: "What does it check?"
    a: "That every block has a number, a valid time line and text; that numbers go up one by one; that each subtitle ends after it starts and does not last zero seconds; that subtitles don't overlap or sit out of order; whether the file is UTF-8; and whether it has a BOM. These are the same checks as the [SRT editor](/srt-editor)."
  - q: "Why won't my SRT file load in my player or on YouTube?"
    a: "Typical reasons include a broken time line (for example a dot instead of a comma before the milliseconds), a missing empty line between subtitles, or an encoding the player doesn't expect. The validator points to the exact subtitle."
  - q: "Does it fix the errors?"
    a: "No, it only reports them. Open the file in the [SRT editor](/srt-editor) from the report. Fix a constant delay with [Shift subtitles](/shift-subtitles) or [Fix subtitle drift](/fix-subtitle-drift), and garbled characters with [Fix subtitle encoding](/fix-subtitle-encoding)."
  - q: "Are overlapping subtitles always a mistake?"
    a: "Not always. Two people talking at once can be on screen together. Overlaps, empty lines, zero duration and out-of-order lines are warnings. A broken time line or a skipped number is an error."
  - q: "Can I check VTT files?"
    a: "Not on this page. It checks SRT files only."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer checks your file inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/srt-editor", "/shift-subtitles", "/fix-subtitle-drift", "/merge-subtitles", "/fix-subtitle-encoding", "/vtt-to-srt", "/srt-to-vtt"]
---

Free SRT checker that runs in your browser: your files never leave your device, and there is no sign-up.

## How to validate an SRT file in 3 steps

1. **Add your SRT files.** Drag one or more .srt files onto the page.
2. **Read the report.** Errors and warnings are listed with the subtitle number and the line in the file.
3. **Fix and check again.** Open the file in the [SRT editor](/srt-editor), or use the linked tools, then drop the fixed file to check it again.

## Example: what the report shows

This file has three problems:

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

3
00:00:04.100 --> 00:00:03,450
Today we're fixing subtitles.
```

Report:

- **Error, subtitle 3 (line 5):** number 3 follows 1; expected 2.
- **Error, subtitle 3 (line 6):** invalid time "00:00:04.100 --> 00:00:03,450": SRT uses a comma before the milliseconds.
- **Error, subtitle 3 (line 6):** ends before it starts.

## What it checks

| Check | Level |
|---|---|
| Block has a number, a time line and text | Error |
| Time line format `00:00:00,000 --> 00:00:00,000` | Error |
| End time after start time | Error |
| Numbers go up one by one | Error (a file that starts at a number other than 1 is a warning) |
| Subtitles overlap | Warning |
| Subtitle lasts zero seconds | Warning |
| Subtitles are out of order | Warning |
| Empty subtitle text | Warning |
| File isn't UTF-8 | Warning |
| File has a UTF-8 BOM | Info |

## What it can and can't do

**It can:**

- Check SRT files and list every problem with its position.
- Check several files at once.
- Open the original file in the [SRT editor](/srt-editor).
- Run fully in your browser.

**It can't:**

- Fix the errors for you.
- Check spelling or whether the subtitles match the video.
- Check VTT, ASS or other formats.

## Related tools

- [SRT editor](/srt-editor): change the lines the report marks.
- [Shift subtitles](/shift-subtitles): fix a constant delay.
- [Fix subtitle drift](/fix-subtitle-drift): fix timing that gets worse over time.
- [Merge subtitles](/merge-subtitles): combine two files, then check the result.
- [Fix subtitle encoding](/fix-subtitle-encoding): fix garbled characters and save as UTF-8.
- [VTT to SRT converter](/vtt-to-srt) and [SRT to VTT converter](/srt-to-vtt).

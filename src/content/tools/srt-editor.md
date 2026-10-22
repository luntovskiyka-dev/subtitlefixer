---
title: "SRT Editor Online: Edit Subtitle Files Free | SubtitleFixer"
description: "Edit SRT files online: change text and times, add, delete or split lines, and find errors. Free, works in your browser, files never leave your device."
h1: "SRT Editor Online"
slug: "srt-editor"
answer: "To edit an SRT file online, open it on this page, change the text or times of any line in the list, and download the fixed file: SubtitleFixer edits subtitles in your browser, so your file never leaves your device."
faq:
  - q: "How do I edit an SRT file online?"
    a: "Open the SRT file on this page. Every subtitle is shown as a row with its start time, end time and text. Click a row to change it, then download the SRT file. Nothing is uploaded."
  - q: "Can I edit VTT or ASS files too?"
    a: "You can open SRT and VTT files and save them as SRT or VTT. ASS files aren't supported in the editor, because their styles would be lost; convert them with [ASS to SRT](/ass-to-srt) first."
  - q: "Can I add, delete or split subtitles?"
    a: "Yes. You can add a new subtitle after any line, delete lines, split a line into two at the cursor, and merge a line with the next one. Lines are renumbered when you download."
  - q: "Does it find errors in my SRT file?"
    a: "Yes. Lines that end before they start, last zero seconds, overlap the next line, are out of order or have no text are marked, so you can fix them. A full report is on the [SRT validator](/srt-validator). Lines that can't be read at all are listed when you open the file."
  - q: "Can I watch my video while I edit?"
    a: "No. The editor works on the subtitle file only."
  - q: "Can I move all subtitles earlier or later?"
    a: "Use [Shift subtitles](/shift-subtitles) to move every line by the same amount, and [Fix subtitle drift](/fix-subtitle-drift) if the gap grows over time. The editor is for changing single lines."
  - q: "Is my work saved if I close the tab?"
    a: "No. Nothing is stored, on our side or in your browser, so download your file before you close the page."
  - q: "Is my subtitle file uploaded?"
    a: "No. SubtitleFixer edits your subtitles inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/srt-validator", "/subtitle-cleaner", "/shift-subtitles", "/fix-subtitle-drift", "/fix-subtitle-encoding", "/srt-to-word", "/srt-to-vtt", "/vtt-to-srt", "/merge-subtitles"]
---

Free online SRT editor that runs in your browser: your file never leaves your device, and there is no sign-up.

## How to edit an SRT file in 3 steps

1. **Open your subtitle file.** Drag an .srt or .vtt file onto the page, or click to choose it. Or start with an empty file.
2. **Edit the lines.** Click a row to change its text, start time or end time. Add, delete, split or merge lines as needed. Problem lines are marked.
3. **Download.** Save as SRT or VTT.

## Example: before and after

Before, line 2 has a typo and ends before it starts:

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:03,450
Today we're fixxing subtitles.
```

After editing line 2:

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're fixing subtitles.
```

The editor marked line 2 because its end time was earlier than its start time.

## What it can and can't do

**It can:**

- Open SRT and VTT files, or start a new empty file.
- Change the text, start time and end time of any line.
- Add, delete, split and merge lines, and renumber them on download.
- Mark lines that end before they start, last zero seconds, overlap the next line, are out of order, or are empty.
- Read files in other encodings and save as UTF-8, with an optional BOM.
- Save as SRT or VTT.
- Run fully in your browser, with no upload and no sign-up.

**It can't:**

- Play your video alongside the subtitles.
- Move the whole file at once. Use [Shift subtitles](/shift-subtitles) or [Fix subtitle drift](/fix-subtitle-drift).
- Edit ASS styles. Convert with [ASS to SRT](/ass-to-srt) first.
- Translate, transcribe or spell-check.
- Keep your work after you close the tab. Download before you leave.

## Related tools

- [SRT validator](/srt-validator): a full report of bad times, numbering, overlaps and encoding.
- [Subtitle cleaner](/subtitle-cleaner): remove hearing-impaired tags, speaker names and formatting.
- [Shift subtitles](/shift-subtitles): move every line earlier or later.
- [Fix subtitle drift](/fix-subtitle-drift): for subtitles that get further off over time.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.
- [SRT to Word](/srt-to-word): put the subtitles into a Word document.
- [Merge subtitles](/merge-subtitles): combine two files.
- [SRT to VTT](/srt-to-vtt) and [VTT to SRT](/vtt-to-srt): change the format.
- [SUP to SRT](/sup-to-srt): read Blu-ray picture subtitles into text, then edit that text here.

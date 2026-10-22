---
title: "SRT to Excel: Subtitles to XLSX or CSV | SubtitleFixer"
description: "Turn SRT, VTT or ASS subtitles into an Excel sheet (.xlsx) or CSV with number, start, end and text columns. Free, in your browser, no upload."
h1: "SRT to Excel Converter"
slug: "srt-to-excel"
answer: "To convert SRT to Excel, drop your subtitle file on this page and download an .xlsx or .csv file: SubtitleFixer puts each subtitle in its own row with number, start time, end time and text, in your browser and without uploading anything."
faq:
  - q: "How do I convert SRT to Excel?"
    a: "Drop the SRT file on this page, choose .xlsx or .csv, and download. Open the file in Excel, Google Sheets, Numbers or LibreOffice Calc."
  - q: "What columns do I get?"
    a: "Four: the subtitle number, start time, end time and text. Times are written as text in the SRT format, like 00:01:05,200, so the spreadsheet doesn't change them."
  - q: "What happens to subtitles with two lines?"
    a: "Both lines stay in the same cell, with a line break between them."
  - q: "Should I pick XLSX or CSV?"
    a: "XLSX opens directly in Excel with non-Latin text shown correctly. CSV is a simple text format that works almost everywhere; SubtitleFixer saves it as UTF-8 with a BOM so Excel reads accents and non-Latin letters correctly."
  - q: "Can I turn the spreadsheet back into SRT?"
    a: "Not on this page. It only converts subtitles to a spreadsheet."
  - q: "Can I convert VTT or ASS files?"
    a: "Yes. Tags and style codes are removed, and VTT speaker tags like <v Anna> become \"Anna: \"."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer creates the spreadsheet inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/srt-to-word", "/srt-to-txt", "/vtt-to-srt", "/ass-to-srt", "/fix-subtitle-encoding"]
---

Free SRT to Excel conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert SRT to Excel in 3 steps

1. **Add your subtitle files.** Drag one or more .srt, .vtt or .ass files onto the page.
2. **Choose the format.** .xlsx for Excel, or .csv for any spreadsheet app.
3. **Download.** Several files download together as one zip.

## Example: before and after

Before (SRT):

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're
fixing subtitles.
```

After (spreadsheet):

| # | Start | End | Text |
|---|---|---|---|
| 1 | 00:00:01,200 | 00:00:03,800 | Hi, and welcome back. |
| 2 | 00:00:04,100 | 00:00:07,450 | Today we're↵fixing subtitles. |

↵ is a line break inside the cell.

## What it can and can't do

**It can:**

- Turn SRT, VTT and ASS subtitles into an .xlsx or .csv file.
- Put the number, start, end and text of each subtitle in its own row.
- Keep two-line subtitles in one cell.
- Save CSV as UTF-8 with a BOM.
- Prefix a leading apostrophe when a cell starts with `=`, `+`, `-`, `@`, a tab or a return, so the spreadsheet does not treat it as a formula.
- Read older encodings, so non-Latin text shows correctly.
- Convert many files at once.

**It can't:**

- Turn a spreadsheet back into subtitles.
- Keep italic or bold formatting.
- Translate the text.

## Related tools

- [SRT to Word](/srt-to-word): the same columns in a Word table.
- [SRT to TXT](/srt-to-txt): get plain text instead.
- [VTT to SRT converter](/vtt-to-srt) and [ASS to SRT converter](/ass-to-srt).
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

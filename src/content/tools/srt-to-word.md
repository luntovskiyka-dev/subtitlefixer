---
title: "SRT to Word Converter: Subtitles to DOCX | SubtitleFixer"
description: "Turn SRT, VTT or ASS subtitles into a Word (.docx) document: plain text, paragraphs, timestamps or a table. Free, in your browser, no upload."
h1: "SRT to Word Converter"
slug: "srt-to-word"
answer: "To convert SRT to Word, drop your subtitle file on this page, choose a layout, and download a .docx file: SubtitleFixer builds the document in your browser, so your file never leaves your device."
faq:
  - q: "How do I convert an SRT file to a Word document?"
    a: "Drop the SRT file on this page, choose a layout and download the .docx file. Open it in Microsoft Word, Google Docs or LibreOffice. Nothing is uploaded."
  - q: "Which layouts can I choose?"
    a: "\"Text only\" gives one paragraph per subtitle. \"With timestamps\" puts the start time before each line, like `[00:01:05] text`. \"Paragraphs\" joins lines and starts a new paragraph after a pause you set. \"Table\" gives a table with the number, start, end and text of each subtitle, which is handy for reviewing or translating."
  - q: "Can I edit the Word file and turn it back into SRT?"
    a: "Not directly. To edit subtitles and keep the timings, use the [SRT editor](/srt-editor). If you only have text with timestamps, you can rebuild subtitles with [TXT to SRT](/txt-to-srt)."
  - q: "Can I convert VTT or YouTube captions to Word?"
    a: "Yes. Add the .vtt file like any other. Tags are removed, speaker tags like `<v Anna>` become \"Anna: \", and you can tick \"Remove repeated lines\" for YouTube auto-captions."
  - q: "Will it open in Google Docs?"
    a: "Yes. Upload the .docx file to Google Drive and open it with Google Docs, or open it in Word or LibreOffice."
  - q: "Is my subtitle file uploaded?"
    a: "No. SubtitleFixer creates the Word document inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/srt-to-txt", "/vtt-to-txt", "/srt-editor", "/txt-to-srt", "/vtt-to-srt", "/fix-subtitle-encoding"]
---

Free SRT to Word conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert SRT to Word in 3 steps

1. **Add your subtitle files.** Drag one or more .srt, .vtt or .ass files onto the page, or click to choose them.
2. **Choose a layout.** "Text only", "With timestamps", "Paragraphs" or "Table".
3. **Download.** One file downloads as a .docx file; several download together as one zip.

## Example: before and after

Before (SRT):

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're fixing subtitles.
```

After, "Table" layout in Word:

| # | Start | End | Text |
|---|---|---|---|
| 1 | 00:00:01,200 | 00:00:03,800 | Hi, and welcome back. |
| 2 | 00:00:04,100 | 00:00:07,450 | Today we're fixing subtitles. |

With "Text only", the document has two paragraphs: "Hi, and welcome back." and "Today we're fixing subtitles."

## What it can and can't do

**It can:**

- Turn SRT, VTT and ASS subtitles into a Word (.docx) document.
- Lay the text out one line per subtitle, with start times, in paragraphs split at pauses, or as a table.
- Remove tags and keep speaker names from VTT `<v Name>` tags.
- Drop repeated lines from YouTube auto-captions, if you tick the option.
- Read files in other encodings, so non-Latin text shows correctly.
- Convert many files at once and run fully in your browser.

**It can't:**

- Keep italic or bold formatting in the document.
- Turn a Word document back into SRT.
- Make an old .doc file. You get .docx, which current Word versions open.
- Translate or transcribe.

## Related tools

- [SRT to TXT](/srt-to-txt): get a plain .txt file instead.
- [VTT to TXT](/vtt-to-txt): turn VTT captions into plain text.
- [SRT editor](/srt-editor): change the text and times, then download SRT or VTT.
- [TXT to SRT](/txt-to-srt): turn text back into subtitles.
- [VTT to SRT converter](/vtt-to-srt): turn VTT captions into SRT.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

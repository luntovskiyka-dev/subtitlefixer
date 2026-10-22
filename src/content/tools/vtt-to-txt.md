---
title: "VTT to TXT Converter: Captions to Text, Free | SubtitleFixer"
description: "Turn VTT captions from YouTube, Zoom or Teams into plain text, with or without timestamps. Free, in your browser, files never leave your device."
h1: "VTT to TXT Converter"
slug: "vtt-to-txt"
answer: "To convert VTT to TXT, drop your .vtt file on this page and download the text: SubtitleFixer removes the WEBVTT header, timestamps and tags, keeps speaker names, and can drop repeated lines from YouTube captions, all in your browser with no upload."
faq:
  - q: "How do I convert a VTT file to text?"
    a: "Drop the .vtt file on this page, choose a layout (\"Text only\", \"With timestamps\" or \"Paragraphs\"), and download the TXT file. The conversion runs in your browser, so nothing is uploaded."
  - q: "Can I turn a Zoom or Teams transcript into plain text?"
    a: "Yes. Zoom and Microsoft Teams can save meeting transcripts as .vtt files. Speaker tags like `<v Anna>` become \"Anna: \" at the start of the line, so you can still see who is talking."
  - q: "Why does my YouTube caption text repeat every line?"
    a: "YouTube's automatic captions show words as they are spoken, so the same line appears in two cues in a row. Tick \"Remove repeated lines\" and a line is dropped when it is the same as the line right before it."
  - q: "Can I keep the timestamps?"
    a: "Yes. Choose \"With timestamps\" and each line starts with its start time, like `[00:01:05] text`."
  - q: "Can I get the text into Word or Google Docs?"
    a: "Download the TXT file and open it in Word, Google Docs or LibreOffice, or paste the text in. For a .docx file, use [SRT to Word](/srt-to-word)."
  - q: "Can I turn the text back into captions?"
    a: "Only if you keep the timestamps. Use [TXT to SRT](/txt-to-srt) with \"Text with timestamps\"."
  - q: "Is my VTT file uploaded?"
    a: "No. SubtitleFixer converts VTT to text inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/srt-to-txt", "/srt-to-word", "/vtt-to-srt", "/txt-to-srt", "/fix-subtitle-encoding"]
---

Free VTT to TXT conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert VTT to TXT in 3 steps

1. **Add your VTT files.** Drag one or more .vtt files onto the page, or click to choose them.
2. **Choose the layout.** "Text only" (one line per caption), "With timestamps", or "Paragraphs" (a new paragraph after a pause you set). For YouTube auto-captions, tick "Remove repeated lines".
3. **Download.** One file downloads as a .txt file; several download together as one zip.

## Example: before and after

Before (VTT):

```vtt
WEBVTT

00:00:02.500 --> 00:00:05.000
<v Anna>Good afternoon, everyone.

00:00:05.300 --> 00:00:08.960
<v Ben>Let's start with the <b>numbers</b>.
```

After ("Text only"):

```text
Anna: Good afternoon, everyone.
Ben: Let's start with the numbers.
```

The header, times and tags are gone. Speaker tags became names.

## What it can and can't do

**It can:**

- Turn VTT captions into plain text: one line per caption, with timestamps, or in paragraphs split at pauses.
- Keep speaker names from `<v Name>` tags.
- Remove the WEBVTT header, `NOTE` blocks, cue settings and tags.
- Drop repeated lines from YouTube auto-captions, if you tick the option.
- Read files in other encodings and save the text as UTF-8.
- Convert many files at once and run fully in your browser.

**It can't:**

- Download captions from a video link. You need the .vtt file.
- Transcribe audio or video.
- Add punctuation that isn't in the captions.
- Translate the text.

## Related tools

- [SRT to TXT](/srt-to-txt): the same conversion for SRT and ASS files.
- [SRT to Word](/srt-to-word): get a .docx file instead of plain text.
- [VTT to SRT converter](/vtt-to-srt): keep the timings and get an SRT file.
- [TXT to SRT](/txt-to-srt): turn text back into subtitles.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

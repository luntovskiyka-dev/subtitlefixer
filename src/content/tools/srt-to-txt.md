---
title: "SRT to TXT Converter: Subtitles to Text | SubtitleFixer"
description: "Turn SRT, VTT or ASS subtitles into plain text, with or without timestamps. Batch, encoding auto-detected. Free, in your browser, no upload."
h1: "SRT to TXT Converter"
slug: "srt-to-txt"
answer: "To convert SRT to TXT, drop your subtitle file on the page and SubtitleFixer removes the cue numbers, timestamps and formatting tags and gives you the plain text as a .txt file, right in your browser, so your file never leaves your device."
faq:
  - q: "How do I convert SRT to TXT?"
    a: "Drop your SRT file on this page, choose how you want the text laid out, and download the TXT file. SubtitleFixer removes the cue numbers, timestamps and tags in your browser, with no upload."
  - q: "Can I keep the timestamps?"
    a: "Yes. Choose \"With timestamps\" and each subtitle starts with its start time in square brackets, like `[00:01:05] text`. Choose \"Text only\" if you want the words without any times."
  - q: "Can I convert VTT captions from YouTube or Zoom to text?"
    a: "Yes. Add the .vtt file like any other subtitle file. The WEBVTT header, NOTE blocks and tags are removed, and speaker tags such as `<v Anna>` become \"Anna: \" at the start of the line, so you can still see who is talking."
  - q: "Why does my YouTube caption text repeat every line?"
    a: "YouTube's automatic captions show text as it is spoken, so the same words appear in two cues in a row and each line ends up in the text twice. Tick \"Remove repeated lines\" and SubtitleFixer drops a line when it is the same as the line right before it. The option is off by default, so normal subtitles are never changed."
  - q: "Can I convert the TXT file back to SRT?"
    a: "Only if you keep the timestamps. A text-only file has no times left, so the timings would have to be created again. Save with \"With timestamps\" if you may need subtitles later, and use [TXT to SRT](/txt-to-srt) to turn text back into a subtitle file."
  - q: "Can I get a Word document instead of TXT?"
    a: "Download the TXT file and open it in Microsoft Word, Google Docs or LibreOffice, then save it as .docx from there. SubtitleFixer doesn't create Word files itself."
  - q: "Does it work with Arabic, Cyrillic or Chinese subtitles?"
    a: "Yes. SubtitleFixer detects the encoding of each file, including older ones like Windows-1251 or Windows-1256, and saves the text as UTF-8. If the text already shows characters like `Ã©`, repair it first with [Fix subtitle encoding](/fix-subtitle-encoding)."
  - q: "Is my subtitle file uploaded?"
    a: "No. SubtitleFixer converts subtitles to text inside your browser, and your file never leaves your device. There is no upload and no sign-up."
related: ["/txt-to-srt", "/vtt-to-srt", "/fix-subtitle-encoding", "/ass-to-srt", "/srt-to-vtt"]
---

## How to convert subtitles to text in 3 steps

You can turn SRT, VTT or ASS subtitles into plain text in three steps, and your files stay on your device the whole time.

1. **Add your subtitle files.** Drag one or more .srt, .vtt, .ass or .ssa files onto the page, or click to choose them.
2. **Choose a layout.** Pick "Text only", "With timestamps" or "Paragraphs" (see below).
3. **Download.** One file downloads as a TXT file; several files download together as one zip.

## Example: before and after

The converter keeps the words and removes everything else: cue numbers, timestamps and formatting tags.

Before (SRT file):

```srt
1
00:01:05,200 --> 00:01:07,800
Hi, and <i>welcome back</i>.

2
00:01:08,100 --> 00:01:10,450
Today we're fixing subtitles.

3
00:01:14,000 --> 00:01:16,300
First, open your file.
```

After, with "Text only":

```text
Hi, and welcome back.
Today we're fixing subtitles.
First, open your file.
```

After, with "With timestamps":

```text
[00:01:05] Hi, and welcome back.
[00:01:08] Today we're fixing subtitles.
[00:01:14] First, open your file.
```

After, with "Paragraphs" (a new paragraph after a pause of 2 seconds or more):

```text
Hi, and welcome back. Today we're fixing subtitles.

First, open your file.
```

The pause between the second and third subtitle is longer than 2 seconds, so the third one starts a new paragraph.

## Three ways to lay out the text

Pick the layout that fits what you'll do with the text.

- **Text only** (default): one subtitle per line, with no numbers and no times. Good for reading, quoting, translating or pasting into a document.
- **With timestamps:** each subtitle starts with its start time, like `[00:01:05]`. Good for notes and for finding a quote in the video later.
- **Paragraphs:** subtitles are joined into running text, with a new paragraph after a pause. The pause is 2 seconds by default, and you can change it. Good for transcripts of talks, lectures and interviews.

## What it does and doesn't do

The converter turns subtitles into readable text. It doesn't change the words.

**What it does:**

- Converts SRT, VTT, ASS and SSA subtitles to plain text (.txt).
- Removes cue numbers, timestamps, the WEBVTT header and NOTE, STYLE and REGION blocks.
- Removes formatting tags such as `<i>`, `<b>`, `<u>` and `<c>`, and ASS style codes like `{\an8}`.
- Turns ASS line breaks (`\N`) into normal line breaks.
- Turns VTT speaker tags (`<v Anna>`) into "Anna: " at the start of the line.
- Can remove repeated lines from YouTube's automatic captions (off by default).
- Detects each file's encoding and saves the text as UTF-8. Tick "Add BOM (old players)" if the program that opens the file needs a BOM.
- Converts many files at once, with one zip to download.
- Runs in your browser: your files never leave your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't transcribe audio or video. It only works with subtitle files that already contain the text.
- It doesn't create Word (.docx) or PDF files. Open the TXT file in a word processor and save it from there.
- It doesn't repair double-encoded text like `Ã©`. If your subtitles already show garbled characters, fix them first with [Fix subtitle encoding](/fix-subtitle-encoding), then convert.
- It doesn't translate the text.

## YouTube, Zoom and Teams captions

Caption files from video platforms and meeting apps are usually VTT files, and they work here like any other subtitle file.

- **YouTube:** automatic captions often show each line twice, because the text appears word by word as it is spoken. Tick **Remove repeated lines** to keep only one copy. The word-by-word timing tags inside these files are removed as well.
- **Zoom and Microsoft Teams:** meeting transcripts are saved as .vtt files. Speaker names from `<v Name>` tags stay at the start of each line, so the text still shows who said what.

If you need the captions as a subtitle file rather than text, use the [VTT to SRT converter](/vtt-to-srt) instead.

## Related tools

- [TXT to SRT](/txt-to-srt): turn a script or transcript back into a timed subtitle file.
- [VTT to SRT converter](/vtt-to-srt): turn YouTube, Zoom or Teams VTT captions into an SRT file.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into a plain SRT file.
- Guide: [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

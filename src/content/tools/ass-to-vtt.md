---
title: "ASS to VTT Converter: ASS/SSA to WebVTT | SubtitleFixer"
description: "Convert ASS or SSA subtitles to WebVTT for HTML5 video players. Style codes removed, text, timing and italics kept. Free, in your browser, no upload."
h1: "ASS to VTT Converter"
slug: "ass-to-vtt"
answer: "To convert ASS to VTT, drop your .ass or .ssa file on this page and download the WebVTT file: SubtitleFixer removes the style codes, keeps the text, timings, italics and bold, and does it in your browser without uploading anything."
faq:
  - q: "How do I convert ASS to VTT?"
    a: "Drop the .ass or .ssa file on this page and download the .vtt file. Nothing is uploaded."
  - q: "Why convert ASS to VTT?"
    a: "HTML5 video players in web browsers use WebVTT for subtitles and don't read ASS. Converting lets you add the subtitles to a web page with a track element."
  - q: "Are ASS styles, fonts and positions kept?"
    a: "No. Fonts, colours, positions, karaoke and other effects are removed. Italic and bold are kept, and \\N line breaks become new lines. If you need the exact look of the ASS file on the web, you'd need an ASS renderer in your player instead."
  - q: "Is this the same as converting ASS to SRT and then to VTT?"
    a: "Yes, the result is the same, but here it happens in one step. If you need SRT, use [ASS to SRT](/ass-to-srt). Bare & and < in the text are escaped in the VTT file."
  - q: "Do duplicate lines from layers show up twice?"
    a: "No. Lines repeated on several layers for effects, with the same time and text, are merged into one subtitle."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer converts ASS to VTT inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/ass-to-srt", "/srt-to-vtt", "/vtt-to-srt", "/shift-subtitles", "/fix-subtitle-encoding"]
---

Free ASS to VTT conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert ASS to VTT in 3 steps

1. **Add your ASS or SSA files.** Drag one or more files onto the page, or click to choose them.
2. **Check the preview.** You see the WebVTT result with style codes removed.
3. **Download.** One file downloads as a .vtt file; several download together as one zip.

## Example: before and after

Before (ASS):

```text
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.20,0:00:03.80,Default,,0,0,0,,{\an8}Hi, and welcome back.
Dialogue: 0,0:00:04.10,0:00:07.45,Default,,0,0,0,,{\i1}Today{\i0} we're\Nfixing subtitles.
```

After (VTT):

```vtt
WEBVTT

00:00:01.200 --> 00:00:03.800
Hi, and welcome back.

00:00:04.100 --> 00:00:07.450
<i>Today</i> we're
fixing subtitles.
```

The position code `{\an8}` was removed, `{\i1}...{\i0}` became `<i>...</i>`, and `\N` became a new line.

## What it can and can't do

**It can:**

- Convert ASS and SSA subtitles to WebVTT (.vtt).
- Keep text, timings, italic and bold.
- Escape `&` and `<` so the VTT file stays valid, while keeping `<i>`, `<b>` and `<u>`.
- Merge duplicate lines that only exist for visual effects.
- Read older encodings and save as UTF-8.
- Convert many files at once.

**It can't:**

- Keep fonts, colours, positions or effects, or turn them into VTT positioning.
- Turn VTT back into ASS.

## Related tools

- [ASS to SRT converter](/ass-to-srt): get SRT instead. SSA files work there too.
- [SRT to VTT converter](/srt-to-vtt): for SRT files.
- [VTT to SRT converter](/vtt-to-srt): turn VTT back into SRT.
- [Shift subtitles](/shift-subtitles): shift ASS, SRT or VTT timing.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

---
title: "TTML to SRT Converter: TTML and IMSC | SubtitleFixer"
description: "Convert TTML subtitles, including IMSC text files, to SRT or VTT in your browser. Timings and line breaks kept. Free, no sign-up, nothing uploaded."
h1: "TTML to SRT Converter"
slug: "ttml-to-srt"
answer: "To convert TTML to SRT, drop your .ttml file on this page and download the SRT file: SubtitleFixer reads the TTML text, frames and ticks timing, and writes one numbered SRT subtitle per paragraph, in your browser and without uploading anything."
faq:
  - q: "How do I convert TTML to SRT?"
    a: "Drop the .ttml file on this page and download the SRT file. Each timed paragraph becomes one subtitle with the same start and end times. Nothing is uploaded."
  - q: "Which TTML versions and profiles work?"
    a: "Text-based TTML 1 and TTML 2 files, older DFXP files, and the IMSC text profile used for streaming. Image-based profiles, where each subtitle is a picture, can't be converted."
  - q: "What is IMSC?"
    a: "IMSC (TTML Profiles for Internet Media Subtitles and Captions) is a W3C profile of TTML for online video. An IMSC text file is a TTML file with a limited set of features, so it converts like any other TTML file."
  - q: "Are styles and positions kept?"
    a: "No. SRT has no regions, colours or fonts, so they are removed. Italic, bold and underline are kept as <i>, <b> and <u>, and line breaks are kept."
  - q: "How are frames and ticks handled?"
    a: "TTML can give times in frames (00:00:01:12) or ticks (15000000t). SubtitleFixer converts them using the frame rate or tick rate in the file, or the TTML defaults when the file omits those rates."
  - q: "Can I get VTT instead?"
    a: "Yes. Switch the output to VTT before you download. That's useful for HTML5 video players."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer converts TTML to SRT inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/dfxp-to-srt", "/xml-to-srt", "/srt-to-vtt", "/vtt-to-srt", "/sbv-to-srt", "/shift-subtitles", "/fix-subtitle-encoding"]
---

Free TTML to SRT conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert TTML to SRT in 3 steps

1. **Add your TTML files.** Drag one or more .ttml files onto the page, or click to choose them.
2. **Pick the output.** SRT is the default; switch to VTT for web players.
3. **Download.** One file downloads as it is; several download together as one zip.

## Example: before and after

Before (TTML with ticks):

```xml
<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" ttp:tickRate="10000000">
  <body><div>
    <p begin="12000000t" end="38000000t">Hi, and welcome back.</p>
  </div></body>
</tt>
```

After (SRT):

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.
```

With a tick rate of 10,000,000 ticks per second, `12000000t` is 1.2 seconds.

## TTML, DFXP and IMSC: what's the difference?

- **TTML** is the W3C Timed Text Markup Language, an XML format for subtitles and captions.
- **DFXP** is the name the first version of TTML used. Old .dfxp files are TTML too. Use [DFXP to SRT](/dfxp-to-srt) for that name.
- **IMSC** is a TTML profile for online video. Its text profile converts here; its image profile doesn't.
- **SMPTE-TT** and **EBU-TT** are TTML-based formats from the broadcast world. Their text content usually converts, but check the result.
- A file named .xml may be the same Timed Text, or a YouTube timed-text file. [XML to SRT](/xml-to-srt) detects which.

## What it can and can't do

**It can:**

- Convert text-based TTML, DFXP and IMSC files to SRT or VTT.
- Read clock times, offset times, frames and ticks, including the TTML default rates when the file omits them.
- Keep line breaks, italic, bold and underline.
- Read older encodings and save as UTF-8, with an optional BOM.
- Convert many files at once.

**It can't:**

- Convert image-based subtitles.
- Keep regions, positions, colours, fonts or animation.
- Create TTML files. It only reads them.

## Related tools

- [DFXP to SRT](/dfxp-to-srt) and [XML to SRT](/xml-to-srt): the same converter, for those file names.
- [SRT to VTT converter](/srt-to-vtt) and [VTT to SRT converter](/vtt-to-srt): switch between SRT and WebVTT.
- [SBV to SRT converter](/sbv-to-srt): for YouTube SBV captions.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

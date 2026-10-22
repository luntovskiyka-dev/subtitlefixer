---
title: "DFXP to SRT Converter: Free, No Upload | SubtitleFixer"
description: "Convert DFXP subtitles to SRT in your browser. Timings, line breaks and italics kept; positions and colours dropped. Free, no sign-up, nothing uploaded."
h1: "DFXP to SRT Converter"
slug: "dfxp-to-srt"
answer: "To convert DFXP to SRT, drop your .dfxp file on this page and download the SRT file: SubtitleFixer reads the timed text, turns each paragraph into a numbered subtitle with the same timings, and does it in your browser without uploading anything."
faq:
  - q: "How do I convert a DFXP file to SRT?"
    a: "Drop the .dfxp file on this page and download the SRT file. Each timed paragraph in the DFXP file becomes one SRT subtitle. Nothing is uploaded."
  - q: "What is a DFXP file?"
    a: "DFXP (Distribution Format Exchange Profile) is the name the first version of W3C Timed Text (TTML) used. It is an XML file, and you often get it from older Flash-based video players, streaming services and captioning tools."
  - q: "Is DFXP the same as TTML?"
    a: "Very nearly. DFXP is the older name for TTML 1.0, and both are XML. This page and [TTML to SRT](/ttml-to-srt) use the same converter."
  - q: "What gets lost when I convert DFXP to SRT?"
    a: "Positions, regions, colours and fonts, because SRT can't store them. The text, line breaks and timings are kept, and italic, bold and underline are kept as <i>, <b> and <u> tags."
  - q: "My DFXP file uses frames or ticks for times. Does it work?"
    a: "Yes. Times like 00:00:01:12 (frames) or 15000000t (ticks) are converted using the frame rate or tick rate in the file, or the TTML defaults when the file omits those rates."
  - q: "Can I get VTT instead of SRT?"
    a: "Yes. Switch the output to VTT before you download."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer converts DFXP to SRT inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/stl-to-srt", "/ttml-to-srt", "/xml-to-srt", "/vtt-to-srt", "/srt-to-vtt", "/sbv-to-srt", "/shift-subtitles", "/fix-subtitle-encoding"]
---

Free DFXP to SRT conversion that runs in your browser: your files never leave your device, and there is no sign-up. This is the same converter as [TTML to SRT](/ttml-to-srt).

## How to convert DFXP to SRT in 3 steps

1. **Add your DFXP files.** Drag one or more .dfxp files onto the page, or click to choose them.
2. **Pick the output.** SRT is the default; switch to VTT if you need WebVTT.
3. **Download.** One file downloads as it is; several files download together as one zip.

## Example: before and after

Before (DFXP):

```xml
<tt xmlns="http://www.w3.org/2006/10/ttaf1" xmlns:tts="http://www.w3.org/2006/10/ttaf1#styling">
  <body>
    <div>
      <p begin="00:00:01.200" end="00:00:03.800">Hi, and welcome back.</p>
      <p begin="00:00:04.100" end="00:00:07.450">Today we're<br/><span tts:fontStyle="italic">fixing</span> subtitles.</p>
    </div>
  </body>
</tt>
```

After (SRT):

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're
<i>fixing</i> subtitles.
```

Each `<p>` became a subtitle, `<br/>` became a new line, and the italic span became `<i>`.

## What it can and can't do

**It can:**

- Convert DFXP (.dfxp) and other TTML-based XML files to SRT or VTT.
- Read clock times, frames and ticks, and keep timings to the millisecond.
- Keep line breaks, italic, bold and underline.
- Read older encodings and save as UTF-8, with an optional BOM.
- Convert many files at once and give you one zip.

**It can't:**

- Keep positions, regions, colours or fonts. SRT has no place for them.
- Convert image-based subtitles inside a DFXP file.
- Download subtitles from a streaming site. You need the file on your device.
- Fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles).

## Where DFXP files come from

DFXP is the original name of the W3C Timed Text format. You'll find .dfxp files from older Flash-based video players, from captioning software, and from some streaming services that deliver subtitles as Timed Text. If your file is called .ttml or .xml instead, use [TTML to SRT](/ttml-to-srt) or [XML to SRT](/xml-to-srt).

## Related tools

- [STL to SRT converter](/stl-to-srt): turn EBU STL and Spruce STL subtitles into SRT.
- [TTML to SRT](/ttml-to-srt): the same converter, written for the TTML name.
- [XML to SRT](/xml-to-srt): also reads YouTube timed-text XML.
- [VTT to SRT converter](/vtt-to-srt) and [SRT to VTT converter](/srt-to-vtt).
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

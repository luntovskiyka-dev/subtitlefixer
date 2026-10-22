---
title: "XML to SRT Converter: Subtitle XML to SRT | SubtitleFixer"
description: "Convert XML subtitles to SRT: TTML, DFXP and YouTube timed-text XML are supported. Free, in your browser, no sign-up, files never leave your device."
h1: "XML to SRT Converter"
slug: "xml-to-srt"
answer: "To convert XML subtitles to SRT, drop your .xml file on this page: SubtitleFixer checks which kind of subtitle XML it is (TTML/DFXP or YouTube timed text), converts it to numbered SRT subtitles, and does it in your browser without uploading anything."
faq:
  - q: "Which XML subtitle files can I convert?"
    a: "Two kinds: Timed Text files (TTML or DFXP, starting with a <tt> element) and YouTube timed-text files (starting with <timedtext> or <transcript>). Other XML files, such as video editor project files, aren't supported, and you get a message saying so."
  - q: "How do I know what kind of XML file I have?"
    a: "Open it in a text editor and look at the first element after the <?xml ...?> line. <tt> means TTML or DFXP. <timedtext> or <transcript> means YouTube. You don't have to check: SubtitleFixer detects it and shows the type next to the preview."
  - q: "Can I convert YouTube caption XML to SRT?"
    a: "Yes. YouTube timed-text XML gives a start time and a duration for each line, and both are turned into SRT start and end times. HTML codes like &#39; become normal characters, including a code that was saved twice, such as &amp;#39;."
  - q: "Can I convert Final Cut Pro or Premiere XML?"
    a: "No. Those are project files, not subtitle files, and their captions are stored differently. Export the captions as SRT from the editor instead."
  - q: "What gets lost?"
    a: "Positions, colours and fonts. Text, line breaks and timings are kept, plus italic, bold and underline in TTML files."
  - q: "Can I get VTT or plain text instead?"
    a: "You can switch the output to VTT. For plain text, convert to SRT first and then use [SRT to TXT](/srt-to-txt)."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer converts XML subtitles inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/ttml-to-srt", "/dfxp-to-srt", "/srt-to-txt", "/vtt-to-srt", "/srt-to-vtt", "/sbv-to-srt", "/fix-subtitle-encoding"]
---

Free XML to SRT conversion that runs in your browser: your files never leave your device, and there is no sign-up. Timed Text files use the same converter as [TTML to SRT](/ttml-to-srt).

## How to convert XML to SRT in 3 steps

1. **Add your XML files.** Drag one or more .xml files onto the page, or click to choose them.
2. **Check the type.** SubtitleFixer shows whether it found TTML, DFXP or YouTube timed text, plus a preview.
3. **Download.** Save as SRT, or switch to VTT. Several files download as one zip.

## Supported XML subtitle types

| The file starts with | What it is | Supported |
|---|---|---|
| `<tt ...>` | TTML or DFXP (W3C Timed Text) | Yes |
| `<timedtext ...>` | YouTube timed text (newer) | Yes |
| `<transcript>` | YouTube timed text (older) | Yes |
| anything else | for example video editor project files | No |

## Example: YouTube XML to SRT

Before:

```xml
<transcript>
  <text start="1.2" dur="2.6">Hi, and welcome back.</text>
  <text start="4.1" dur="3.35">Today we&amp;#39;re fixing subtitles.</text>
</transcript>
```

After:

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're fixing subtitles.
```

Start plus duration gives the end time: 1.2 + 2.6 = 3.8 seconds. The doubled code `&amp;#39;` becomes an apostrophe.

## What it can and can't do

**It can:**

- Detect TTML/DFXP and YouTube timed-text XML and convert them to SRT or VTT.
- Turn start-plus-duration times into start and end times.
- Decode HTML codes like `&amp;` and `&#39;`, including a code saved twice.
- Convert many files at once, in your browser.

**It can't:**

- Read video editor XML (Final Cut Pro, Premiere Pro, DaVinci Resolve) or other XML formats.
- Download captions from YouTube. You need the file on your device.
- Merge the overlapping lines of YouTube auto-captions.

## Related tools

- [TTML to SRT](/ttml-to-srt) and [DFXP to SRT](/dfxp-to-srt): the same Timed Text converter.
- [SRT to TXT](/srt-to-txt): get the plain text after converting.
- [VTT to SRT converter](/vtt-to-srt): for YouTube captions saved as .vtt.
- [SBV to SRT converter](/sbv-to-srt): for YouTube captions saved as .sbv.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

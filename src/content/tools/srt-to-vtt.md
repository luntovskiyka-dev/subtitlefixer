---
title: "SRT to VTT Converter Online – Free, Batch | SubtitleFixer"
description: "Convert SRT to WebVTT in your browser. Batch-convert many files at once, timings kept to the millisecond. Free, no upload, no sign-up."
h1: "SRT to VTT Converter"
slug: "srt-to-vtt"
answer: "To convert SRT to VTT, drop one or more SRT files on the page and SubtitleFixer turns them into WebVTT (.vtt) files with the same text and the same timings, right in your browser, so your files never leave your device."
faq:
  - q: "How do I convert SRT to VTT?"
    a: "Drop your SRT file on this page and download the VTT file. SubtitleFixer adds the WEBVTT header, removes the cue numbers and changes the timestamp format, and the conversion happens in your browser with no upload."
  - q: "What's the difference between SRT and VTT?"
    a: "Both are plain-text subtitle formats with a timestamp and text for each line. VTT (WebVTT) is the format HTML5 video players in web browsers use, and it adds a header, a slightly different timestamp format and optional styling and positioning."
  - q: "Can I just rename an .srt file to .vtt?"
    a: "No. A VTT file must start with the line WEBVTT and use a period instead of a comma before the milliseconds, so web browsers reject a renamed SRT file. Converting the file on this page makes both changes for you."
  - q: "Will the timing, formatting or special characters change?"
    a: "No. Every start and end time is kept exactly, italic, bold and underline tags (`<i>`, `<b>`, `<u>`) are kept, and only the separator changes, from 00:00:01,200 to 00:00:01.200. SubtitleFixer detects your SRT file's encoding and saves the VTT file as UTF-8, which WebVTT requires."
  - q: "Can I convert multiple SRT files at once?"
    a: "Yes. Add as many SRT files as you need and SubtitleFixer converts them all in one go, then gives you all the VTT files together in one zip."
  - q: "Why doesn't my browser show the converted VTT subtitles?"
    a: "The file itself is usually fine; the problem is how it is loaded. Check that the track element points to the right file, that the server sends .vtt files as text/vtt, and that the page is not opened straight from your disk (file://), which some browsers block for subtitle tracks."
  - q: "How do I convert SRT to VTT with FFmpeg?"
    a: "Run ffmpeg -i subtitles.srt subtitles.vtt in a terminal. If you don't want to install anything, this page does the same conversion in your browser."
  - q: "Is my SRT file uploaded?"
    a: "No. SubtitleFixer converts SRT to VTT inside your browser, and your file never leaves your device. There is no upload and no sign-up."
related: ["/vtt-to-srt", "/fix-subtitle-encoding", "/shift-subtitles", "/ass-to-srt", "/fix-subtitle-drift"]
---

## How to convert SRT to VTT in 3 steps

You can convert SRT to VTT in three steps, and your files stay on your device the whole time.

1. **Add your SRT files.** Drag one or more .srt files onto the page, or click to choose them.
2. **Convert.** SubtitleFixer turns each SRT file into a WebVTT (.vtt) file with the same text and timings.
3. **Download.** One file downloads as a VTT file; several files download together as one zip.

## Example: before and after

The conversion adds a WEBVTT header, removes the cue numbers and changes the comma in each timestamp to a period.

Before (SRT file):

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're fixing subtitles.
```

After (VTT file):

```vtt
WEBVTT

00:00:01.200 --> 00:00:03.800
Hi, and welcome back.

00:00:04.100 --> 00:00:07.450
Today we're fixing subtitles.
```

The times are exactly the same: `00:00:01,200` became `00:00:01.200`. The text didn't change, and the cue numbers are gone because VTT doesn't need them.

## What it does and doesn't do

The converter changes the file format from SRT to VTT. It does not change the text or the timing.

**What it does:**

- Converts SubRip (.srt) subtitles to WebVTT (.vtt).
- Adds the WEBVTT header, removes the cue numbers and uses the VTT timestamp format.
- Keeps italic, bold and underline tags (`<i>`, `<b>`, `<u>`).
- Detects the SRT file's encoding and saves the VTT file as UTF-8. Tick "Add BOM (old players)" if your device needs a BOM.
- Keeps every start and end time exactly, to the millisecond.
- Converts many SRT files at once, with one zip to download.
- Runs in your browser: your files never leave your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't repair double-encoded text like `Ã©`. If your SRT file already shows garbled characters, fix it first with [Fix subtitle encoding](/fix-subtitle-encoding), then convert.
- It doesn't fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles) for that.
- It doesn't add styling or positioning. SRT files don't contain VTT positioning, so there is nothing to carry over.
- It doesn't convert VTT back to SRT. For that, use the [VTT to SRT converter](/vtt-to-srt).

## What changes between SRT and VTT

SRT and VTT store almost the same information, so converting SRT to VTT only changes a few small things.

- **Header:** a VTT file starts with the line `WEBVTT`. SRT files have no header.
- **Timestamps:** SRT uses a comma before the milliseconds (`00:00:01,200`), VTT uses a period (`00:00:01.200`).
- **Line numbers:** SRT needs a number above each subtitle. In VTT these numbers are optional, so SubtitleFixer leaves them out.
- **Tags:** `<i>`, `<b>` and `<u>` work in both formats and are kept as they are.

For a full comparison of the formats, read [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

## How to add a VTT file to an HTML5 video

To show VTT subtitles on a web page, add a `<track>` element inside the `<video>` element.

```html
<video controls src="movie.mp4">
  <track kind="subtitles" src="movie.vtt" srclang="en" label="English" default>
</video>
```

If the subtitles don't appear:

- Check that the `src` of the track points to the right .vtt file.
- Make sure your server sends .vtt files with the content type `text/vtt`.
- If the .vtt file is on a different domain from the page, the server must allow it (CORS), and the `<video>` element needs a `crossorigin` attribute.
- Test the page through a web server, not by opening it from your disk (`file://`). Some browsers block subtitle tracks on local files.

## Related tools

- [VTT to SRT converter](/vtt-to-srt): turn VTT captions back into an SRT file.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [Shift subtitles](/shift-subtitles): for subtitles that appear too early or too late.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into a plain SRT file.
- Guide: [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

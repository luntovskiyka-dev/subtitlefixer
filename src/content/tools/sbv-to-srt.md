---
title: "SBV to SRT Converter: YouTube Captions | SubtitleFixer"
description: "Convert YouTube .sbv caption files to SRT in your browser. Batch, timings kept to the millisecond. Free, no upload, no sign-up."
h1: "SBV to SRT Converter"
slug: "sbv-to-srt"
answer: "To convert SBV to SRT, drop a YouTube .sbv caption file on the page and SubtitleFixer turns each SubViewer time pair into numbered SRT timestamps, right in your browser, so your file never leaves your device."
faq:
  - q: "What is an SBV file?"
    a: "SBV is YouTube's SubViewer caption format. Each block starts with a start and end time on one line, like `0:00:01.200,0:00:03.800`, then the text, then a blank line. YouTube also accepts SBV when you upload captions."
  - q: "How do I download SBV captions from YouTube Studio?"
    a: "Sign in to YouTube Studio, open Subtitles in the left menu, open your video, click Edit next to the language, then Options → Download subtitles. You can only download captions for videos on a channel you manage. If Studio offers a format choice, pick .sbv (SubViewer). If Studio offers .srt directly, download that — this page is for .sbv files you already have or older archives."
  - q: "Can I convert SBV to VTT?"
    a: "Yes. Switch the output to VTT before you download, and you get a WebVTT file for HTML5 video players. You can also convert an SRT file later with the [SRT to VTT converter](/srt-to-vtt)."
  - q: "Can I convert several files at once?"
    a: "Yes. Add as many .sbv files as you need. They convert in one go and download together as one zip."
  - q: "Will the timings change?"
    a: "No. Every start and end time is kept to the millisecond. The only changes are the format: cue numbers are added, hours are written with two digits, and the period before the milliseconds becomes a comma (`0:00:01.200` → `00:00:01,200`)."
  - q: "I already have a YouTube .vtt file. Do I need this page?"
    a: "No. For .vtt captions from YouTube, use the [VTT to SRT converter](/vtt-to-srt) instead. This page is for .sbv (SubViewer) files."
  - q: "Why do I see weird characters after converting?"
    a: "SubtitleFixer detects the encoding of each file and saves the result as UTF-8. If the text already shows characters like `Ã©`, repair it first with [Fix subtitle encoding](/fix-subtitle-encoding)."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer converts SBV to SRT inside your browser, and your file never leaves your device. There is no upload and no sign-up."
related: ["/vtt-to-srt", "/srt-to-vtt", "/shift-subtitles", "/fix-subtitle-encoding", "/srt-to-txt"]
---

## How to convert SBV to SRT in 3 steps

You can turn a YouTube .sbv caption file into an SRT file in three steps, and your files stay on your device the whole time.

1. **Add your .sbv files.** Drag one or more SubViewer (.sbv) files onto the page, or click to choose them.
2. **Convert.** SubtitleFixer turns each block into a numbered SRT subtitle with the same text and timings. Switch the output to VTT if you need WebVTT instead.
3. **Download.** One file downloads as an SRT (or VTT) file; several files download together as one zip.

## Example: before and after

SBV uses one line for the start and end times, with a period before the milliseconds. SRT uses a cue number and a comma.

Before (SBV file):

```sbv
0:00:01.200,0:00:03.800
Hi, and welcome back.

0:00:04.100,0:00:07.450
Today we're fixing subtitles.
```

After (SRT file):

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're fixing subtitles.
```

The times are the same: `0:00:01.200` became `00:00:01,200`. Multi-line text in an SBV block stays multi-line in the SRT file.

## What it does and doesn't do

The converter changes the file format from SBV to SRT (or VTT). It does not change the text or the timing.

**What it does:**

- Converts YouTube SubViewer (.sbv) caption files to SRT.
- Keeps every start and end time exactly, to the millisecond.
- Adds cue numbers, pads hours to two digits and uses a comma before the milliseconds.
- Keeps multi-line text inside a caption block.
- Can save as VTT instead of SRT.
- Detects the file's encoding and saves the result as UTF-8. Tick "Add BOM (old players)" if your device needs a BOM.
- Converts many files at once, with one zip to download.
- Runs in your browser: your files never leave your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't download captions from YouTube for you. You export the .sbv file from YouTube Studio first.
- It doesn't convert YouTube .vtt files. Use the [VTT to SRT converter](/vtt-to-srt) for those.
- It doesn't repair double-encoded text like `Ã©`. Use [Fix subtitle encoding](/fix-subtitle-encoding) for that.
- It doesn't fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles) for that.

## Download captions from YouTube Studio

You can only download caption files for videos on a channel you manage.

1. Sign in to [YouTube Studio](https://studio.youtube.com).
2. Open **Subtitles** in the left menu.
3. Open the video.
4. Next to the language, click **Edit**.
5. Open **Options** and choose **Download subtitles**.

If Studio lets you pick a format, choose **.sbv** (SubViewer), then convert it here to SRT. If Studio offers **.srt** directly, download that and skip this page — this converter is for .sbv files you already have or older archives. Path checked against [YouTube Help: Edit or remove captions](https://support.google.com/youtube/answer/2734705) on 6 October 2026.

## Related tools

- [VTT to SRT converter](/vtt-to-srt): turn YouTube or Zoom .vtt captions into an SRT file.
- [SRT to VTT converter](/srt-to-vtt): turn the result into VTT for HTML5 video players.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later by the same amount.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [SRT to TXT](/srt-to-txt): turn captions into plain text.

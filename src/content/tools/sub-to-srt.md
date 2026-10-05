---
title: "SUB to SRT Converter (MicroDVD) – Free | SubtitleFixer"
description: "Convert MicroDVD .sub subtitles to SRT: frame numbers become timestamps at the right fps (23.976, 25…), encoding auto-detected. Free, no upload."
h1: "SUB to SRT Converter"
slug: "sub-to-srt"
answer: "To convert a MicroDVD .sub file to SRT, drop it on the page, check the frame rate and SubtitleFixer turns each {start}{end} frame pair into SRT timestamps, right in your browser, so your file never leaves your device."
faq:
  - q: "What is a .sub subtitle file?"
    a: "Two different formats use the .sub extension. MicroDVD is a plain-text file where each line looks like `{100}{200}Hello`, with frame numbers instead of clock times. VobSub is a pair of .sub and .idx files that store subtitles as images. This page converts MicroDVD text files only."
  - q: "Which frame rate should I choose?"
    a: "Use the frame rate of the video the subtitles were made for. If the file starts with a line like `{1}{1}23.976`, SubtitleFixer reads that and uses it. Otherwise pick 23.976 (default), 24, 25, 29.97 or 30. The preview shows the time of the first and last subtitle at the chosen rate, so you can check it against the length of your movie."
  - q: "Why do the subtitles drift after converting?"
    a: "The wrong frame rate stretches or squeezes every line. If the file looks fine at the start but drifts later, try another rate here, or [fix subtitle drift](/fix-subtitle-drift) with two known lines once you have an SRT file."
  - q: "My .sub file came with an .idx file — can I convert it?"
    a: "No. A .sub file next to an .idx file is VobSub: the subtitles are pictures, not text, so converting them needs OCR. SubtitleFixer recognises that pair and shows an error instead of a broken SRT file."
  - q: "How do I convert SUB to SRT with FFmpeg?"
    a: "Run `ffmpeg -subfps 25 -i movie.sub movie.srt` in a terminal, and change `25` to the video's frame rate if needed. This page does the same conversion in your browser and shows a preview of the first and last times."
  - q: "Why do I see weird characters after converting?"
    a: "Older .sub files are often saved in Windows-1250 or Windows-1251. SubtitleFixer detects the encoding and saves the SRT as UTF-8. If the text already shows characters like `Ã©`, repair it first with [Fix subtitle encoding](/fix-subtitle-encoding)."
  - q: "Can I convert several .sub files at once?"
    a: "Yes. Add as many MicroDVD .sub files as you need. They convert in one go and download together as one zip."
  - q: "Is my .sub file uploaded?"
    a: "No. SubtitleFixer converts MicroDVD to SRT inside your browser, and your file never leaves your device. There is no upload and no sign-up."
related: ["/fix-subtitle-drift", "/fix-subtitle-encoding", "/srt-to-vtt", "/ass-to-srt", "/shift-subtitles"]
---

## How to convert SUB to SRT in 3 steps

You can turn a MicroDVD .sub file into an SRT file in three steps, and your files stay on your device the whole time.

1. **Add your .sub files.** Drag one or more MicroDVD .sub files onto the page, or click to choose them.
2. **Check the frame rate.** If the file already has a frame-rate line, it is used. Otherwise pick 23.976, 24, 25, 29.97 or 30, and look at the first and last subtitle times in the preview.
3. **Download.** One file downloads as an SRT file; several files download together as one zip.

## Example: before and after

MicroDVD stores times as frame numbers. At 25 frames per second, frame 50 is 2.000 seconds.

Before (MicroDVD .sub file):

```sub
{0}{50}Hi, and welcome back.
{50}{125}Today we're fixing subtitles.
```

After (SRT file, at 25 fps):

```srt
1
00:00:00,000 --> 00:00:02,000
Hi, and welcome back.

2
00:00:02,000 --> 00:00:05,000
Today we're fixing subtitles.
```

A pipe (`|`) in the MicroDVD text becomes a line break in the SRT file. Tags `{y:i}` and `{y:b}` become `<i>` and `<b>`; other `{…}` tags are removed.

## Frame rate

MicroDVD times are frame numbers, so the converter needs a frame rate to turn them into clock times.

- If the file starts with a line like `{1}{1}23.976`, that value is used.
- If there is no such line, choose **23.976** (default), **24**, **25**, **29.97** or **30**.
- The preview shows the start of the first subtitle and the end of the last one at the chosen rate. If that last time is far from the length of your video, try another rate.

This page only converts frames to timestamps. If an SRT file already has clock times and drifts because the video and the subtitles use different frame rates, use [Fix subtitle drift](/fix-subtitle-drift).

## What it does and doesn't do

The converter turns MicroDVD text into SRT. It does not change your words.

**What it does:**

- Converts MicroDVD text .sub files to SRT.
- Turns frame numbers into timestamps at the chosen frame rate (or the rate written in the file).
- Shows a preview of the first and last subtitle times so you can check the rate.
- Turns `|` into a line break and `{y:i}` / `{y:b}` into italics and bold.
- Detects the file's encoding (including older ones like Windows-1250 and Windows-1251) and saves the SRT as UTF-8. Tick "Add BOM (old players)" if your device needs a BOM.
- Recognises VobSub (.sub + .idx) image files and shows an error instead of a broken SRT file.
- Converts many files at once, with one zip to download.
- Runs in your browser: your files never leave your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't convert VobSub bitmap subtitles (a .sub file next to an .idx file). Those are pictures and need OCR.
- It doesn't repair double-encoded text like `Ã©`. Use [Fix subtitle encoding](/fix-subtitle-encoding) for that.
- It doesn't re-time an SRT file that already has clock times. For fps mismatches on an SRT, VTT or ASS file, use [Fix subtitle drift](/fix-subtitle-drift).
- It doesn't burn subtitles into a video. It creates a separate SRT file.

## Related tools

- [Fix subtitle drift](/fix-subtitle-drift): re-time subtitles that slowly go out of sync, or change between frame rates such as 23.976 and 25.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [SRT to VTT converter](/srt-to-vtt): turn the result into VTT for HTML5 video players.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into a plain SRT file.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later by the same amount.

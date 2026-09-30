---
title: "VTT to SRT Converter Online – Free, Batch | SubtitleFixer"
description: "Convert WebVTT to SRT in your browser: batch, YouTube and Zoom VTT, keeps italics and bold, strips other tags, exact timings. Free, no upload, no signup."
h1: "VTT to SRT Converter"
slug: "vtt-to-srt"
answer: "To convert VTT to SRT, drop one or more VTT files on the page and SubtitleFixer turns them into numbered SRT files with the same text and timings, right in your browser, so your files never leave your device."
faq:
  - q: "How do I convert VTT to SRT?"
    a: "Drop your VTT file on this page and download the SRT file. SubtitleFixer detects the file's encoding, numbers each subtitle 1, 2, 3…, changes the timestamp format and saves the result as UTF-8, all in your browser with no upload."
  - q: "Will I lose caption positioning, styling or comments?"
    a: "Mostly, because SRT has no place for them. Cue settings such as `align:start` or `line:0`, `STYLE` and `REGION` blocks, `NOTE` comments and tags other than `<i>`, `<b>` and `<u>` are removed. Italic, bold and underline tags are kept, because SRT supports them too."
  - q: "Will the subtitles stay in sync after converting?"
    a: "Yes. Every start and end time is kept exactly, and only the separator changes, from 00:00:01.200 to 00:00:01,200. If the subtitles were already out of sync, fix them with [Shift subtitles](/shift-subtitles)."
  - q: "Can I turn a Zoom or Teams transcript (.vtt) into SRT?"
    a: "Yes. Zoom and Microsoft Teams save transcripts as .vtt files, so you can convert them here like any other VTT file. Speaker tags such as `<v Anna>` become a plain \"Anna: \" at the start of the line, so you can still see who is talking."
  - q: "Why does my video editor reject .vtt files?"
    a: "Many video editors, TVs and older players accept SRT files but not VTT. Converting the captions to SRT is usually the simplest fix."
  - q: "Can I convert many VTT files at once?"
    a: "Yes. Add as many VTT files as you need and SubtitleFixer converts them all in one go, then gives you all the SRT files together in one zip."
  - q: "Can I convert VTT to SRT offline?"
    a: "The conversion runs on your device, not on a server, so your file is never uploaded, but you need an internet connection to open this page. For a fully offline option, FFmpeg can do it with ffmpeg -i captions.vtt captions.srt."
  - q: "Is my VTT file uploaded?"
    a: "No. SubtitleFixer converts VTT to SRT inside your browser, and your file never leaves your device. There is no upload and no sign-up."
related: ["/srt-to-vtt", "/shift-subtitles", "/fix-subtitle-encoding", "/ass-to-srt", "/fix-subtitle-drift"]
---

## How to convert VTT to SRT in 3 steps

You can convert VTT to SRT in three steps, and your files stay on your device the whole time.

1. **Add your VTT files.** Drag one or more .vtt files onto the page, or click to choose them.
2. **Convert.** SubtitleFixer turns each WebVTT file into a numbered SRT file with the same text and timings.
3. **Download.** One file downloads as an SRT file; several files download together as one zip.

## Example: before and after

The conversion removes the WEBVTT header, numbers each subtitle, turns speaker tags into names and changes the period in each timestamp to a comma.

Before (VTT file):

```vtt
WEBVTT

NOTE Exported from the web player

00:00:02.500 --> 00:00:05.000 align:start
Good afternoon, everyone.

00:00:05.300 --> 00:00:08.960
<v Anna>Let's start with the numbers.
```

After (SRT file):

```srt
1
00:00:02,500 --> 00:00:05,000
Good afternoon, everyone.

2
00:00:05,300 --> 00:00:08,960
Anna: Let's start with the numbers.
```

The times are exactly the same: `00:00:02.500` became `00:00:02,500`. The `NOTE` comment and the `align:start` setting are gone, because SRT files can't store them. The speaker tag `<v Anna>` became "Anna: " in front of the line.

## What it does and doesn't do

The converter changes the file format from VTT to SRT. It does not change the text or the timing.

**What it does:**

- Converts WebVTT (.vtt) captions to SubRip (.srt) subtitles.
- Numbers every subtitle 1, 2, 3… and uses the SRT timestamp format.
- Keeps italic, bold and underline tags (`<i>`, `<b>`, `<u>`) and removes all other tags.
- Turns speaker tags like `<v Anna>` into "Anna: " in front of the text.
- Removes YouTube `<c>` tags and the word-by-word timestamps inside auto-generated captions.
- Keeps every start and end time exactly, to the millisecond.
- Detects the file's encoding and saves the SRT file as UTF-8. Tick "Add BOM (old players)" if your device needs a BOM.
- Converts many VTT files at once, with one zip to download.
- Runs in your browser: your files never leave your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't keep VTT positioning, `STYLE` or `REGION` blocks, or `NOTE` comments. SRT has no place for them.
- It doesn't merge the rolling, repeated lines in auto-generated YouTube captions. Each line stays a separate subtitle.
- It doesn't repair double-encoded text like `Ã©`. Use [Fix subtitle encoding](/fix-subtitle-encoding) for that, where you can compare previews and pick the right reading.
- It doesn't fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles) for that.

## What changes from VTT to SRT

A VTT file and an SRT file hold the same timings and text, so converting VTT to SRT only changes the parts SRT doesn't support.

- **Header:** the `WEBVTT` line at the top is removed.
- **Numbers:** every subtitle gets a number (1, 2, 3…), which SRT requires.
- **Speakers:** a voice tag like `<v Anna>` becomes "Anna: " at the start of the line.
- **Tags:** `<i>`, `<b>` and `<u>` are kept; other tags, such as class tags, are removed.
- **Timestamps:** the period before the milliseconds becomes a comma (`00:00:02.500` → `00:00:02,500`).
- **Removed:** cue settings (such as `align:start`), `STYLE` and `REGION` blocks, `NOTE` comments, and YouTube `<c>` tags with their word-by-word timestamps.

For a full comparison of the formats, read [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

## VTT files from YouTube, Zoom and Teams

VTT is the usual format for captions from websites and meeting apps, and you can convert all of them to SRT here.

- **YouTube:** captions you download (for example with yt-dlp) are usually .vtt files. SubtitleFixer removes the `<c>` tags and word-by-word timestamps of auto-generated captions, but it doesn't merge the repeated rolling lines.
- **Zoom and Microsoft Teams:** meeting transcripts are saved as .vtt files. Teams speaker tags (`<v Name>`) become "Name: " in front of each line.
- **Web video players:** most HTML5 players use VTT captions.

Once they are SRT files, you can use them in video editors, on TVs and in most desktop players.

## Related tools

- [SRT to VTT converter](/srt-to-vtt): turn SRT subtitles into VTT for web video players.
- [Shift subtitles](/shift-subtitles): for subtitles that appear too early or too late.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into a plain SRT file.
- Guide: [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

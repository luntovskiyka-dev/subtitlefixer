---
title: "TXT to VTT Converter: Text to WebVTT | SubtitleFixer"
description: "Turn a script or transcript into WebVTT captions. Timed by reading speed or by timestamps already in your text. Free, in your browser, no upload."
h1: "TXT to VTT Converter"
slug: "txt-to-vtt"
answer: "To convert TXT to VTT, paste your text or drop a .txt file on this page, choose Plain text or Text with timestamps, and download the WebVTT file. SubtitleFixer times each line by reading speed or by your timestamps, and wraps a line longer than 42 characters. Nothing is uploaded."
faq:
  - q: "How do I convert a TXT file to VTT?"
    a: "Paste the text or drop the .txt file on this page, pick Plain text or Text with timestamps, and download. Each line becomes a caption. A line longer than 42 characters is wrapped into more than one caption. The settings are explained on [TXT to SRT](/txt-to-srt)."
  - q: "How are the times worked out?"
    a: "In Plain text mode each caption gets a reading time based on its length, with a minimum of 1 second and a maximum of 7 seconds by default (17 characters per second). In Text with timestamps mode the times in your text are used."
  - q: "Does it sync the text to my video's audio?"
    a: "No. SubtitleFixer doesn't listen to audio. If the captions are early or late afterwards, move them with [Shift subtitles](/shift-subtitles)."
  - q: "Which timestamp formats work?"
    a: "A time at the start of a line, like 00:01:05 text, 1:05 text or [00:01:05] text; a time alone on its line with the text below, as in a YouTube transcript; and SRT-style time lines."
  - q: "How do I use the VTT file on a web page?"
    a: "Add it to your video element with a track element. See the example on the [SRT to VTT](/srt-to-vtt) page."
  - q: "Can I get SRT instead?"
    a: "Yes. Switch Output to SRT, or use [TXT to SRT](/txt-to-srt), which is the same tool."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer creates the VTT file inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/txt-to-srt", "/srt-to-vtt", "/shift-subtitles", "/srt-to-txt", "/vtt-to-srt"]
---

Free TXT to VTT conversion that runs in your browser: your files never leave your device, and there is no sign-up. This is [TXT to SRT](/txt-to-srt) with the output set to VTT.

## How to convert TXT to VTT in 3 steps

1. **Add your text.** Paste it into the box, or drop a .txt file onto the page.
2. **Pick a mode.** "Plain text" if your text has no times, "Text with timestamps" if it does. Output is set to VTT.
3. **Download.** Save the WebVTT (.vtt) file.

## Example: text with timestamps to VTT

Before:

```text
0:00 Hello, and thanks for watching.
0:03 Let's start.
```

After:

```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
Hello, and thanks for watching.

00:00:03.000 --> 00:00:04.000
Let's start.
```

Each caption ends when the next one starts. The last one has nothing after it, so its length comes from the reading speed (here the 1-second minimum).

## What it can and can't do

**It can:**

- Turn plain text into WebVTT captions.
- Time captions by reading speed, or keep the timestamps in your text.
- Wrap a line longer than 42 characters into captions of up to two lines.
- Read .txt files in other encodings and save as UTF-8.
- Run fully in your browser.

**It can't:**

- Listen to audio, transcribe speech or line text up with it.
- Add VTT positioning or styling.
- Translate your text.

## Related tools

- [TXT to SRT](/txt-to-srt): the same tool with SRT output, plus all settings explained.
- [SRT to VTT converter](/srt-to-vtt): includes how to add a VTT file to a web page.
- [Shift subtitles](/shift-subtitles): move captions earlier or later.
- [SRT to TXT](/srt-to-txt): get the text back out.

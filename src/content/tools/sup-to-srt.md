---
title: "SUP to SRT Converter Online — OCR, No Upload"
description: "Convert a Blu-ray PGS .sup file to SRT with OCR in your browser. Check the text: OCR can be wrong. Your file never leaves your device."
h1: "SUP to SRT Converter"
slug: "sup-to-srt"
answer: "Drop a Blu-ray .sup file, pick a language, and SubtitleFixer reads each picture into SRT text in your browser: OCR can be wrong, so check every line, and the file never leaves your device."
faq:
  - q: "What is a SUP file?"
    a: "A SUP file is a Blu-ray PGS subtitle. The words are pictures, not text, and each picture has a time. This page reads that .sup file and turns the pictures into an SRT file."
  - q: "How accurate is the text?"
    a: "OCR makes mistakes. A stylized font, a small line, or the wrong language can come out garbled or miss letters. Read every line and fix it before you download. The picture stays next to the text so you can compare them."
  - q: "Which languages can it read?"
    a: "English, Spanish, French, German, Portuguese, Italian, and Russian. English is the default. The language data is loaded from this site when you read a file, and only the language you pick is downloaded."
  - q: "Is my file uploaded?"
    a: "No. The .sup file is read in your browser and never leaves your device. The page does load the OCR program and the language data from subtitlefixer.com. Those requests are not your subtitle."
  - q: "Can it handle a long movie?"
    a: "Yes. A film with a thousand subtitles can take several minutes, because each picture is read one at a time. A progress bar shows how far along it is, and you can cancel. Keep this tab open until it finishes. A very large file also needs enough memory in the browser."
  - q: "What about DVD .sub and .idx files?"
    a: "Not yet. DVD subtitles saved as a .sub file plus an .idx file are a different picture format (VobSub). This page only reads Blu-ray .sup files. A text .sub file in the MicroDVD format is separate: use [SUB to SRT](/sub-to-srt) for that."
related: ["/srt-editor", "/sub-to-srt", "/shift-subtitles", "/srt-to-vtt"]
---

## How to convert SUP to SRT in 3 steps

1. **Add the .sup file.** Drag a Blu-ray PGS file onto the page, or click to choose it.
2. **Read the pictures.** Pick the language and press Read subtitles. The progress bar moves as each line is read. You can cancel and keep the lines already done.
3. **Fix and download.** Compare each picture with the text, correct the mistakes, then download the SRT file. You can also open that text in the SRT editor.

## Example: before and after

A SUP file stores a picture, not these letters. One line is on screen from 00:00:12,400 to 00:00:15,080 and the picture says "Hello there."

After OCR, and after you correct anything it got wrong:

```srt
1
00:00:12,400 --> 00:00:15,080
Hello there.
```

If the reader returns "Hell0 there." you change that line in the list, then download. The times stay as they were in the SUP file.

## What it does and doesn't do

The page turns Blu-ray picture subtitles into text you can edit. It does not promise a perfect transcript.

**What it does:**

- Reads a Blu-ray PGS .sup file in your browser.
- Takes the start time from each picture and the end time from the next picture, or from the next empty screen.
- Reads the pictures in English, Spanish, French, German, Portuguese, Italian, or Russian.
- Shows the picture next to the text so you can fix OCR mistakes.
- Downloads an SRT file, or opens that text in the [SRT editor](/srt-editor).
- Keeps the file on your device. Nothing is uploaded.

**What it doesn't do:**

- It doesn't read DVD VobSub files (a .sub file next to an .idx file). That format is not supported yet.
- It doesn't guarantee the words. OCR can miss letters, so check the text.
- It doesn't shift an SRT file that is already text. Use [Shift subtitles](/shift-subtitles) for that.
- It doesn't burn subtitles into a video.

## Related tools

- [SRT editor](/srt-editor): change the text and times after the pictures have been read.
- [SUB to SRT](/sub-to-srt): convert a MicroDVD text .sub file. That is not a DVD image subtitle.
- [Shift subtitles](/shift-subtitles): move every line of an SRT, VTT, or ASS file earlier or later.
- [SRT to VTT](/srt-to-vtt): turn the SRT file into WebVTT for an HTML5 player.

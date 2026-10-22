---
title: "IDX/SUB to SRT: Convert VobSub with OCR | SubtitleFixer"
description: "Convert VobSub IDX/SUB subtitles to SRT with text recognition (OCR) that runs in your browser. You check the text before saving. Free, no upload."
h1: "IDX/SUB to SRT Converter (OCR)"
slug: "idx-to-srt"
answer: "To convert IDX/SUB to SRT, add both the .idx and the .sub file on this page: SubtitleFixer reads the subtitle pictures, recognises the text with OCR in your browser, lets you correct it, and saves an SRT file without uploading anything."
faq:
  - q: "Why do I need OCR to convert IDX/SUB to SRT?"
    a: "IDX/SUB (VobSub) subtitles, usually ripped from DVDs, are pictures of text, not text. To get an SRT file, each picture has to be read with text recognition (OCR). The .idx file holds the timings, and the .sub file holds the pictures."
  - q: "Do I need both files?"
    a: "Yes. Add the .idx and the .sub file with the same name together. One without the other can't be converted."
  - q: "How accurate is the text?"
    a: "OCR makes mistakes, especially with italics, unusual fonts and letters like l, I and 1. Always read through the result in the review step before you download. You can edit any line there."
  - q: "Which languages work?"
    a: "You pick the subtitle language before the text is read: English, Spanish, French, German, Portuguese, Italian or Russian. How well it reads depends on the language and on how clear the subtitle images are."
  - q: "Why does it take a while?"
    a: "Text recognition runs on your own device, picture by picture. A full film has many pictures, so it can take a few minutes, depending on your computer."
  - q: "Is this the same as a MicroDVD .sub file?"
    a: "No. MicroDVD .sub files are plain text and don't need OCR. If your .sub file has no .idx next to it and opens as readable text, use [SUB to SRT](/sub-to-srt)."
  - q: "Are my files uploaded for OCR?"
    a: "No. The text recognition runs inside your browser. The language file is loaded from this site. Your subtitle files never leave your device."
  - q: "Can it read Blu-ray SUP subtitles?"
    a: "No. This page only reads DVD VobSub (IDX/SUB) files."
related: ["/sub-to-srt", "/vtt-to-srt", "/shift-subtitles", "/fix-subtitle-drift", "/srt-to-txt"]
---

Free IDX/SUB to SRT conversion with OCR that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert IDX/SUB to SRT in 3 steps

1. **Add both files.** Drag the .idx and .sub files onto the page together, and choose the language if the .idx file lists several tracks.
2. **Let it read the text.** The OCR runs on your device. Then review each line next to its picture and fix any mistakes.
3. **Download.** Save the result as an SRT file, or open it in the SRT editor.

## What happens to your IDX/SUB files

- The **.idx** file is a small text file with the timings and the language of each subtitle track.
- The **.sub** file holds the subtitles as pictures.
- SubtitleFixer draws each picture, reads the text with OCR, and pairs it with the timing from the .idx file.

## Example: what you get

Each picture becomes a line in the SRT file, with the times from the .idx file:

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.
```

In the review step you see the picture and the recognised text side by side, so you can check a line before you save.

## What it can and can't do

**It can:**

- Read DVD VobSub (.idx + .sub) subtitles and turn them into SRT.
- Let you choose the language for text recognition.
- Show each picture next to its text so you can correct mistakes.
- Run the OCR on your device, without uploading your files.

**It can't:**

- Promise perfect text. OCR always needs a check.
- Keep italics reliably. Italic text is recognised as plain text.
- Read Blu-ray SUP, DVB or other picture formats.
- Pull subtitles out of a video file. You need the .idx and .sub files.

## Related tools

- [SUB to SRT converter](/sub-to-srt): for text-based MicroDVD .sub files (no OCR needed).
- [Shift subtitles](/shift-subtitles): fix a constant delay after converting.
- [Fix subtitle drift](/fix-subtitle-drift): fix a frame rate mismatch.
- [SRT to TXT](/srt-to-txt): get the plain text.

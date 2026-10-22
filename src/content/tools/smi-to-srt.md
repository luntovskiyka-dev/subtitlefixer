---
title: "SMI to SRT Converter: SAMI Subtitles, Free | SubtitleFixer"
description: "Convert SMI (SAMI) subtitles to SRT in your browser. Pick the language if the file has several, Korean text supported. Free, no upload, no sign-up."
h1: "SMI to SRT Converter"
slug: "smi-to-srt"
answer: "To convert SMI to SRT, drop your .smi file on this page, pick the language if the file has more than one, and download the SRT file: SubtitleFixer turns each SAMI sync point into a numbered SRT subtitle in your browser, without uploading anything."
faq:
  - q: "How do I convert an SMI file to SRT?"
    a: "Drop the .smi file on this page, choose the language if the file contains several, and download the SRT file. The conversion runs in your browser, so the file is not uploaded."
  - q: "What is an SMI file?"
    a: "SMI (SAMI) is a subtitle format from Microsoft that looks like a small web page. Each subtitle starts at a `<SYNC Start=...>` tag with the time in milliseconds. It is common for Korean subtitles."
  - q: "How are the end times worked out?"
    a: "SMI files only store when each subtitle starts. A subtitle ends where the next sync point begins. An empty sync point (often `&nbsp;`) clears the screen, so it becomes the end time and no empty subtitle is added."
  - q: "My SMI file has two languages. What happens?"
    a: "Each language in an SMI file has its own class, such as KRCC or ENCC. SubtitleFixer lists the classes it finds, and you pick one. To get both languages, convert each one and combine them with [Merge subtitles](/merge-subtitles)."
  - q: "The Korean text shows as gibberish. What can I do?"
    a: "Older Korean SMI files are often saved as EUC-KR (CP949). SubtitleFixer detects this and saves the SRT file as UTF-8. If the text still looks wrong, try [Fix subtitle encoding](/fix-subtitle-encoding)."
  - q: "Will colours and fonts be kept?"
    a: "No. SRT players handle `<font>` tags differently, so they are removed. Italic, bold and underline (`<i>`, `<b>`, `<u>`) are kept, and line breaks (`<br>`) become new lines."
  - q: "Can players open an SMI file directly?"
    a: "Some players can read SMI, but many TVs, video editors and media servers handle SRT better. Converting to SRT is the safe choice."
  - q: "Is my SMI file uploaded?"
    a: "No. SubtitleFixer converts SMI to SRT inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/vtt-to-srt", "/ass-to-srt", "/sub-to-srt", "/sbv-to-srt", "/fix-subtitle-encoding", "/merge-subtitles", "/shift-subtitles"]
---

Free SMI to SRT conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert SMI to SRT in 3 steps

1. **Add your SMI files.** Drag one or more .smi or .sami files onto the page, or click to choose them.
2. **Pick the language.** If the file has more than one language class, choose the one you want. Files with one language skip this step.
3. **Download.** One file downloads as an .srt file; several files download together as one zip.

## Example: before and after

Before (SMI):

```html
<SAMI>
<BODY>
<SYNC Start=1200><P Class=KRCC>안녕하세요.
<SYNC Start=3800><P Class=KRCC>&nbsp;
<SYNC Start=4100><P Class=KRCC>어디 가세요?<br>역으로요.
<SYNC Start=7450><P Class=KRCC>&nbsp;
</BODY>
</SAMI>
```

After (SRT):

```srt
1
00:00:01,200 --> 00:00:03,800
안녕하세요.

2
00:00:04,100 --> 00:00:07,450
어디 가세요?
역으로요.
```

Each `SYNC Start` time in milliseconds became an SRT start time. The empty `&nbsp;` sync points became end times, and `<br>` became a new line.

## What it can and can't do

**It can:**

- Convert SAMI (.smi, .sami) subtitles to SRT.
- Use the next sync point as each subtitle's end time.
- Let you pick one language when the file has several.
- Keep `<i>`, `<b>` and `<u>`, turn `<br>` into line breaks, and turn codes like `&amp;` into normal characters.
- Read older encodings such as EUC-KR and save the SRT file as UTF-8, with an optional BOM for old players.
- Convert many files at once and give you one zip.
- Run fully in your browser, with no upload and no sign-up.

**It can't:**

- Keep colours, fonts or positions. SRT has no standard way to store them.
- Put two languages into one file in a single step. Convert each, then use [Merge subtitles](/merge-subtitles).
- Fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles).
- Read image-based subtitles.

## Related tools

- [VTT to SRT converter](/vtt-to-srt): turn WebVTT captions into SRT.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into SRT.
- [SUB to SRT converter](/sub-to-srt): turn text-based SUB files into SRT.
- [SBV to SRT converter](/sbv-to-srt): turn YouTube .sbv captions into SRT.
- [Merge subtitles](/merge-subtitles): combine two languages into one file.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later.

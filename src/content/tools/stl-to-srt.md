---
title: "STL to SRT Converter: EBU STL and Spruce | SubtitleFixer"
description: "Convert STL subtitles to SRT in your browser: binary EBU STL and text Spruce STL. Frame timecodes turned into SRT times. Free, no sign-up, no upload."
h1: "STL to SRT Converter"
slug: "stl-to-srt"
answer: "To convert STL to SRT, drop your .stl file on this page: SubtitleFixer detects whether it is a binary EBU STL file or a text Spruce STL file, turns its frame timecodes into SRT times, and does it in your browser without uploading anything."
faq:
  - q: "How do I convert an STL file to SRT?"
    a: "Drop the .stl file on this page. SubtitleFixer detects the type, shows a preview and lets you download the SRT file. For Spruce STL you also choose the frame rate. Nothing is uploaded."
  - q: "What's the difference between EBU STL and Spruce STL?"
    a: "They are two unrelated formats that share the .stl extension. EBU STL is a binary broadcast format from the European Broadcasting Union. Spruce STL is a plain-text format from DVD authoring tools like Spruce DVDMaestro. If you open the file in a text editor and see readable lines with timecodes, it's Spruce STL."
  - q: "Why do I have to choose a frame rate?"
    a: "STL timecodes count frames, not milliseconds. An EBU STL file says its frame rate in its header, so it is used automatically. A Spruce STL file doesn't, so you pick the frame rate of the video it was made for."
  - q: "Is an .stl subtitle file a 3D model?"
    a: "No, but the same extension is used for 3D printing models. If your .stl file is a 3D model, it can't be converted here."
  - q: "What gets lost?"
    a: "Positions, colours and teletext options. The text, line breaks and timings are kept. Italic and underline are kept where the file marks them. Spruce bold (^B) becomes <b>."
  - q: "Can I get VTT instead?"
    a: "Yes. Switch the output to VTT before you download."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer converts STL to SRT inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/ttml-to-srt", "/dfxp-to-srt", "/sub-to-srt", "/vtt-to-srt", "/srt-to-vtt", "/fix-subtitle-drift", "/shift-subtitles"]
---

Free STL to SRT conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert STL to SRT in 3 steps

1. **Add your STL file.** Drag one or more .stl files onto the page, or click to choose them.
2. **Check the type and frame rate.** SubtitleFixer shows "EBU STL" or "Spruce STL". For Spruce STL, choose the frame rate of your video.
3. **Download.** Save as SRT, or switch to VTT.

## EBU STL or Spruce STL?

| | EBU STL | Spruce STL |
|---|---|---|
| File type | Binary (not readable in a text editor) | Plain text |
| Used for | TV broadcast subtitles | DVD authoring |
| Frame rate | Written in the file | Not in the file: you choose it |
| Supported here | Yes | Yes |

## Example: Spruce STL to SRT (25 fps)

Before:

```text
00:00:01:05 , 00:00:03:20 , Hi, and welcome back.
00:00:04:02 , 00:00:07:11 , Today we're|fixing subtitles.
```

After:

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,080 --> 00:00:07,440
Today we're
fixing subtitles.
```

At 25 fps one frame is 40 ms, so `00:00:01:05` (1 second and 5 frames) is 1.2 seconds. The `|` became a new line.

## What it can and can't do

**It can:**

- Read binary EBU STL (including STL25.01 and STL30.01, and other STL codes when the number is a frame rate) and text Spruce STL files.
- Turn frame timecodes into SRT times using the right frame rate.
- Keep text, line breaks, italic and underline. Spruce `^I` becomes `<i>`, `^B` becomes `<b>`, and `^U` becomes `<u>`.
- Save as SRT or VTT, as UTF-8.

**It can't:**

- Keep teletext colours, positions or double-height text.
- Create STL files.
- Convert 3D model .stl files.

If the subtitles drift because the frame rate was wrong, use [Fix subtitle drift](/fix-subtitle-drift).

## Related tools

- [TTML to SRT](/ttml-to-srt) and [DFXP to SRT](/dfxp-to-srt): for timed-text XML.
- [SUB to SRT converter](/sub-to-srt): for MicroDVD files, which also count frames.
- [VTT to SRT converter](/vtt-to-srt) and [SRT to VTT converter](/srt-to-vtt).
- [Fix subtitle drift](/fix-subtitle-drift): for a frame rate mismatch.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later.

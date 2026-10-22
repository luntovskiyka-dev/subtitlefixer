---
title: "ASS/SSA to SRT Converter, Free, Batch | SubtitleFixer"
description: "Convert ASS/SSA subtitles to clean SRT. Style tags and duplicate layers removed; dialogue, timing, italics and bold kept. Batch, free, no upload."
h1: "ASS and SSA to SRT Converter"
slug: "ass-to-srt"
answer: "To convert ASS to SRT, drop your .ass or .ssa file on the page and SubtitleFixer removes the styling tags but keeps italics and bold, turns \\N into line breaks and merges duplicate layers into one SRT file, all in your browser, so your file never leaves your device."
faq:
  - q: "What do I lose when I convert ASS to SRT?"
    a: "You lose fonts, colours, positions, karaoke effects, animations and vector drawings, because SRT can't store them, so the ASS tags and drawing lines that create them are removed. The timing, the text, and italics and bold (as `<i>` and `<b>`) are kept."
  - q: "Will the dialogue and timing stay exactly the same?"
    a: "Yes. ASS stores times in hundredths of a second and SRT in thousandths, so 0:00:05.37 in an ASS file becomes 00:00:05,370 in the SRT file with no rounding. The dialogue text stays the same, minus the styling tags."
  - q: "Why do some converters give me duplicate lines?"
    a: "ASS files often place the same line on two or more layers, for example once for a soft outline and once for the text on top. A simple converter turns each copy into its own SRT subtitle, so every line appears twice. SubtitleFixer merges lines with the same start time, end time and text (after the tags are removed) into one subtitle."
  - q: "Are italics and bold kept?"
    a: "Yes. SubtitleFixer turns `{\\i1}`…`{\\i0}` into `<i>`…`</i>` and `{\\b1}`…`{\\b0}` into `<b>`…`</b>`, and closes any tag left open at the end of the line. All other styling tags, such as fonts, colours and positions, are removed."
  - q: "What's the difference between ASS and SSA?"
    a: "SSA (SubStation Alpha) is the older format, and ASS (Advanced SubStation Alpha) is the newer version with more styling options. Both work the same way here: drop the .ass or .ssa file and get an SRT file back."
  - q: "My ASS subtitles show garbled characters. How do I fix that?"
    a: "The converter detects the encoding of your ASS file automatically and always saves the SRT file as UTF-8, so files saved in an older encoding are read on the way. If the result still shows characters like Ã©, the text was probably double-encoded: repair it with [Fix subtitle encoding](/fix-subtitle-encoding), which accepts .ass and .ssa files, then convert."
  - q: "How do I export SRT from Aegisub?"
    a: "In Aegisub, go to File → Export Subtitles, click Export, and choose SubRip (*.srt) as the file type. If you only have the .ass file and no Aegisub, you can convert it here instead."
  - q: "Is my ASS file uploaded?"
    a: "No. SubtitleFixer converts ASS to SRT inside your browser, and your file never leaves your device. There is no upload and no sign-up."
related: ["/ass-to-vtt", "/subtitle-cleaner", "/fix-subtitle-encoding", "/shift-subtitles", "/srt-to-vtt", "/vtt-to-srt", "/fix-subtitle-drift", "/sup-to-srt"]
---

## How to convert ASS to SRT in 3 steps

You can convert ASS to SRT in three steps, and your files stay on your device the whole time.

1. **Add your ASS or SSA files.** Drag one or more .ass or .ssa files onto the page, or click to choose them.
2. **Convert.** SubtitleFixer removes the styling tags, keeps italics and bold as `<i>` and `<b>`, turns `\N` into line breaks and merges duplicate layers.
3. **Download.** One file downloads as an SRT file; several files download together as one zip.

## Example: before and after

The ASS lines below have styling tags, an italic word, a `\N` line break and the same line on two layers.

Before (ASS file, `[Events]` section):

```ass
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:05.37,0:00:08.12,Default,,0,0,0,,{\an8}Where are we going?\NTo the {\i1}station{\i0}.
Dialogue: 0,0:00:09.00,0:00:11.45,Default,,0,0,0,,{\blur4\bord6}I'll wait here.
Dialogue: 1,0:00:09.00,0:00:11.45,Default,,0,0,0,,I'll wait here.
```

After (SRT file):

```srt
1
00:00:05,370 --> 00:00:08,120
Where are we going?
To the <i>station</i>.

2
00:00:09,000 --> 00:00:11,450
I'll wait here.
```

The `{\an8}` and `{\blur4\bord6}` tags are gone, the italic tags became `<i>` and `</i>`, `\N` became a real line break, and the line that was on two layers is now one subtitle. The times are exactly the same, written with three digits for the milliseconds.

## What it does and doesn't do

The converter keeps the dialogue and timing of your ASS subtitles and removes everything SRT can't show.

**What it does:**

- Converts ASS and SSA (Advanced SubStation Alpha and SubStation Alpha) files to SRT.
- Removes styling tags such as `{\an8}`, `{\blur4}` or `{\pos(…)}`.
- Keeps italics and bold: `{\i1}`…`{\i0}` becomes `<i>`…`</i>` and `{\b1}`…`{\b0}` becomes `<b>`…`</b>`. A tag left open is closed at the end of the line.
- Turns `\N` and `\n` into real line breaks and `\h` into a normal space.
- Skips `Comment:` lines and removes drawing events (vector shapes drawn with `{\p1}`).
- Detects the file's encoding and saves the SRT file as UTF-8. Tick "Add BOM (old players)" if your device needs a BOM.
- Merges lines with the same start, end and text (after tags are removed) into one SRT subtitle.
- Keeps signs and song lyrics as normal subtitle lines.
- Keeps every start and end time exactly.
- Converts several files at once, with one zip to download.
- Runs in your browser: your files never leave your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't keep fonts, colours, positions, karaoke or animations. SRT can't store them, so signs and songs appear as plain lines in the usual subtitle position.
- It doesn't repair double-encoded text like `Ã©`. Use [Fix subtitle encoding](/fix-subtitle-encoding) for that, where you can compare previews and pick the right reading.
- It doesn't fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles), which also works directly on ASS files.
- It doesn't convert SRT to ASS.

## When to keep ASS instead of converting

Keep the ASS file if the styling matters and your player supports it; convert to SRT if your device or app needs SRT.

ASS is common for anime and fansubs, where signs, songs and on-screen text are placed and styled carefully. Players like VLC and mpv show all of that. After converting to SRT, every line, including signs and songs, appears in the usual subtitle position, with only italics and bold kept.

Convert to SRT when:

- your TV, streaming box or media server app doesn't show ASS subtitles properly,
- a video editor or website only accepts SRT,
- you just want readable dialogue without effects.

For a full comparison of the formats, read [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

## Related tools

- [ASS to VTT converter](/ass-to-vtt): turn ASS or SSA into WebVTT for HTML5 video.
- [Subtitle cleaner](/subtitle-cleaner): remove hearing-impaired tags, speaker names and formatting.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [Shift subtitles](/shift-subtitles): for subtitles that appear too early or too late, in SRT, VTT or ASS files.
- [SRT to VTT converter](/srt-to-vtt): turn SRT subtitles into VTT for web video players.
- [VTT to SRT converter](/vtt-to-srt): turn VTT captions into an SRT file.
- [SRT to TXT](/srt-to-txt): turn ASS, SRT or VTT subtitles into plain text, without styling tags.
- [SUP to SRT](/sup-to-srt): read a Blu-ray .sup picture subtitle into SRT. Check the text: OCR can be wrong.
- Guide: [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

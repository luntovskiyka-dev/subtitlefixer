---
title: "SRT vs VTT vs ASS: Which Subtitle Format? | SubtitleFixer"
description: "SRT vs VTT vs ASS compared: timestamps, styling, positioning, player and platform support, and what each conversion loses. With a table and examples."
h1: "SRT vs VTT vs ASS: Which Subtitle Format Should You Use?"
slug: "/guides/srt-vs-vtt-vs-ass"
answer: "Use an SRT file when you want plain subtitles that work almost everywhere, a VTT file for HTML5 video on websites, and an ASS file only when you need styling and positioning that your player can show."
faq:
  - q: "What's the difference between SRT and VTT?"
    a: "Both are plain-text subtitle formats with millisecond timing. A VTT file (WebVTT) must start with a WEBVTT line, uses a dot before the milliseconds (00:00:01.500) and supports positioning and CSS styling. An SRT file (SubRip) has no header, numbers every cue, uses a comma (00:00:01,500) and has no positioning."
  - q: "Should I use an SRT or VTT file for YouTube?"
    a: "YouTube accepts both. An SRT file is the simplest choice: YouTube reads basic SRT files in plain UTF-8, without styling. Use a VTT file if you need to position captions, since YouTube supports WebVTT positioning but only limited styling."
  - q: "Which subtitle format is best for Plex, Jellyfin or VLC?"
    a: "Plex, Jellyfin and VLC all support SRT, VTT and ASS files. An SRT file is the simplest and most predictable choice. Keep an ASS file when its styling matters to you. On Jellyfin, subtitles your device can't handle may be burned into the video, which takes a lot of server CPU."
  - q: "What is an ASS subtitle file, and when should I keep it instead of converting it to an SRT file?"
    a: "An ASS file (Advanced SubStation Alpha) stores subtitles with named styles and override tags for fonts, colors, positions and effects. Keep it when the styling carries meaning, such as translated signs or karaoke. Convert it with the [ASS to SRT converter](/ass-to-srt) when your player or platform only takes plain subtitles."
  - q: "What is the difference between ASS and SSA?"
    a: "SSA (SubStation Alpha, v4) is the older format. ASS (Advanced SubStation Alpha, v4.00+) is its successor and adds features such as layers, transparency and rotation. ASS files use a [V4+ Styles] section, SSA files a [V4 Styles] section."
  - q: "Which conversion loses data?"
    a: "Converting an SRT file to VTT keeps the text and timings. Converting a VTT file to an SRT file drops positioning, style and region blocks and comments, because SRT subtitles have no place for them. Converting an ASS file to an SRT file drops styles, fonts, colors, positions and effects but keeps the text and timings; the [ASS to SRT converter](/ass-to-srt) also keeps italics and bold as `<i>` and `<b>`."
  - q: "Can I just rename .srt to .vtt?"
    a: "No. A VTT file must start with the line WEBVTT and use a dot, not a comma, before the milliseconds. Without the header, browsers reject the file. Use the [SRT to VTT converter](/srt-to-vtt) instead."
  - q: "What is an SRT file, and how do I open it?"
    a: "An SRT file is a plain-text subtitle file in the SubRip format. You can open it in any text editor to read or edit it. To watch it with a video, give it the same name as the video file (for example movie.mp4 and movie.srt) and open the video in your player."
---

# SRT vs VTT vs ASS: Which Subtitle Format Should You Use?

**SRT files are the simplest and most widely supported, VTT files are the standard for video on the web, and ASS files are for styled, positioned subtitles.**

This guide explains what each format is, compares them side by side, shows the same lines in all three, and tells you which one to use for YouTube, websites, Plex, Jellyfin and VLC.

## What is an SRT file?

**An SRT file is a plain-text subtitle file in the SubRip format: numbered cues, each with a start time, an end time and one or more lines of text.**

Each cue has four parts: a number, a timing line with `-->` between start and end, the text, and a blank line. Times use hours, minutes, seconds and milliseconds, with a comma before the milliseconds.

```srt
1
00:00:01,500 --> 00:00:04,000
Is anyone here?

2
00:00:04,200 --> 00:00:06,800
<i>Over here!</i>
By the window.
```

SRT subtitles have no header, no styles and no positioning. Some players understand simple HTML-like tags such as `<i>` for italics, but support varies.

Some DJI drones also write a `.srt` file next to each video. That file holds flight and camera data, not dialogue.

## What is a VTT file?

**A VTT file is a WebVTT (Web Video Text Tracks) subtitle file, the format that HTML5 video uses for subtitles and captions.**

A VTT file must start with the line `WEBVTT`. Times use a dot before the milliseconds, and the hours can be left out when they are zero. Cue numbers are optional. After the timing, you can add cue settings that control position and alignment.

```vtt
WEBVTT

00:00:01.500 --> 00:00:04.000
Is anyone here?

00:00:04.200 --> 00:00:06.800 line:10% align:start
<i>Over here!</i>
By the window.
```

Here, `line:10%` moves the second cue near the top of the video and `align:start` aligns its text to the start of the line. WebVTT also supports `<b>`, `<i>` and `<u>` tags, voice tags like `<v Anna>`, `NOTE` comments and CSS styling through `STYLE` blocks or the page's own CSS.

## What is an ASS file?

**An ASS file is an Advanced SubStation Alpha subtitle file, which stores subtitles together with styles, positions and effects.**

An ASS file is split into sections. `[Script Info]` holds general settings, `[V4+ Styles]` defines named styles (font, size, colors, outline, alignment), and `[Events]` holds the subtitle lines. Each line starts with `Dialogue:` and lists its layer, start and end time, style and text. Times use one digit for hours and hundredths of a second.

```ass
[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,40,40,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.50,0:00:04.00,Default,,0,0,0,,Is anyone here?
Dialogue: 0,0:00:04.20,0:00:06.80,Default,,0,0,0,,{\an7\i1}Over here!{\i0}\NBy the window.
```

In the last line, `{\an7}` places the text at the top left, `{\i1}` and `{\i0}` switch italics on and off, and `\N` is a line break. ASS override tags can also set exact positions (`\pos`), movement (`\move`), rotation, fades and karaoke timing (`\k`).

SSA (SubStation Alpha) is the older version of the same format. ASS (v4.00+) added layers, transparency and rotation, and uses `[V4+ Styles]` instead of `[V4 Styles]`.

## SRT vs VTT vs ASS: comparison table

**The main differences are the header, the timing syntax, and how much styling and positioning each format can hold.**

| | SRT file (.srt) | VTT file (.vtt) | ASS file (.ass) |
|---|---|---|---|
| Full name | SubRip | WebVTT (Web Video Text Tracks) | Advanced SubStation Alpha |
| Timing syntax | `00:01:02,500` (comma, milliseconds) | `00:01:02.500` or `01:02.500` (dot, milliseconds, hours optional) | `0:01:02.50` (dot, hundredths of a second, one-digit hour) |
| Header | None | `WEBVTT` line required | `[Script Info]`, `[V4+ Styles]` and `[Events]` sections |
| Cue numbers | Every cue is numbered | Optional cue identifiers | None, each line starts with `Dialogue:` |
| Styling | Simple HTML-like tags, support varies by player | `<b>`, `<i>`, `<u>`, classes, voice tags, CSS | Named styles plus override tags for fonts, colors, borders, shadows |
| Positioning | None | Cue settings (`line`, `position`, `size`, `align`) and regions | Alignment (`\an`), exact position (`\pos`), margins |
| Effects and karaoke | None | Timestamps inside a cue | Karaoke (`\k`), movement, fades, rotation, animation (`\t`) |
| Text encoding | Not fixed, UTF-8 is safest | UTF-8 required | Not fixed, UTF-8 is safest |
| Where it's used | Downloaded movie and TV subtitles, video platforms, media servers | HTML5 video on websites, web players | Styled and typeset subtitles, common in anime and MKV files |

## Which format should you use?

**Choose the format based on where the subtitles will play, and use the simplest one that does what you need.**

| Where the subtitles play | Best choice |
|---|---|
| YouTube | SRT file, or VTT file if you need positioning |
| HTML5 video on your own website | VTT file |
| Plex | SRT file, or ASS file if you want to keep styling |
| Jellyfin | SRT file, or ASS file if you want to keep styling |
| VLC | Any of the three |

### YouTube

YouTube's help lists both SubRip (.srt) and WebVTT (.vtt) as supported caption files. For SRT files, only basic files work: YouTube ignores styling, and the file must be plain UTF-8. For VTT files, YouTube supports positioning, but styling is limited. ASS files are not on YouTube's list of supported formats, so convert them with the [ASS to SRT converter](/ass-to-srt) first.

### HTML5 video

The HTML `<track>` element loads subtitles and captions in WebVTT format, so use a VTT file. A browser won't read an SRT file there: the WebVTT parser rejects any file that doesn't start with `WEBVTT`. Convert with the [SRT to VTT converter](/srt-to-vtt).

### Plex

Plex's help lists SRT, SMI, SSA/ASS and WebVTT as fully supported, both embedded in the video and as separate files. It also recommends saving text subtitles as UTF-8. An SRT file is the simplest choice. Keep an ASS file if you want its styling. A separate subtitle file should use the video's file name plus a language code, for example `Movie Title (2020).en.srt` next to `Movie Title (2020).mkv`.

### Jellyfin

Jellyfin's documentation lists SubRip (SRT), WebVTT and ASS/SSA as text subtitle formats. It also warns that subtitles can cause transcoding: if a device can't show a subtitle format, the server may convert it or burn it into the video, and burning in is the most CPU-heavy kind of transcoding. If you don't need styling, an SRT file is the simplest choice. If you keep an ASS file, check that it plays well on the devices you use.

### VLC

VLC plays all three. Its feature list includes SubRip and SSA text subtitles, and VLC 3.0 rewrote its WebVTT support, including CSS styling. Pick the format based on where else you'll use the file.

## What you lose when converting

**Converting to a simpler format keeps the text and timing but drops whatever the simpler format can't store.**

- **SRT file → VTT file:** the text and timings carry over. The converter adds the `WEBVTT` header, drops the cue numbers (they're optional in VTT) and changes the commas in the times to dots. Simple tags like `<i>`, `<b>` and `<u>` exist in both formats and are kept.
- **VTT file → SRT file:** the text and timings carry over. Cue settings (position, alignment, size), `STYLE` blocks, regions and `NOTE` comments have no equivalent in SRT subtitles, so they are lost. SubtitleFixer keeps `<i>`, `<b>` and `<u>`, turns voice tags like `<v Anna>` into "Anna: " in front of the line, and removes YouTube `<c>` tags and other tags.
- **ASS file → SRT file:** the text and timings carry over. Styles, fonts, colors, positions, karaoke and other effects are lost. SubtitleFixer keeps italics and bold as `<i>` and `<b>`, and signs and songs become normal subtitle lines. ASS files store hundredths of a second and SRT files store milliseconds, so the times convert exactly.

Keep the original file if you might need the styling later.

## Save subtitles as UTF-8

**Saving subtitle files as UTF-8 avoids most problems with garbled characters.**

The WebVTT standard requires UTF-8. YouTube asks for SRT files in plain UTF-8, and Plex recommends UTF-8 for text subtitles. If your subtitles show characters like `Ã©` or `Ð¿Ñ€Ð¸` instead of normal letters, the file was saved or read in the wrong encoding. Use [fix subtitle encoding](/fix-subtitle-encoding) to detect the right encoding and save the file as UTF-8, with or without BOM. SubtitleFixer's converters also detect the encoding of the file you add and always save the result as UTF-8.

## Convert between formats

**SubtitleFixer's converters run in your browser, so your files never leave your device.**

- [SRT to VTT converter](/srt-to-vtt): turn one or many SRT files into VTT files for HTML5 video.
- [VTT to SRT converter](/vtt-to-srt): turn one or many VTT files into SRT files.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS files into SRT subtitles, keeping italics and bold.
- [SRT to TXT converter](/srt-to-txt): turn SRT, VTT or ASS subtitles into plain text, with or without timestamps.
- [TXT to SRT converter](/txt-to-srt): turn a script or transcript into a timed SRT or VTT file.

Timing problems instead? See [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

## Sources

- SubRip format: [Library of Congress, SubRip Subtitle format (SRT)](https://www.loc.gov/preservation/digital/formats/fdd/fdd000569.shtml)
- WebVTT: [W3C, WebVTT: The Web Video Text Tracks Format](https://www.w3.org/TR/webvtt1/) and [MDN, the `<track>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track)
- ASS: [Aegisub, ASS override tags](https://aegisub.org/docs/latest/ass_tags/)
- YouTube: [Supported subtitle and closed caption files](https://support.google.com/youtube/answer/2734698)
- Plex: [Adding local subtitles to your media](https://support.plex.tv/articles/200471133-adding-local-subtitles-to-your-media/)
- Jellyfin: [Codec support](https://jellyfin.org/docs/general/clients/codec-support/)
- VLC: [VLC features](https://www.videolan.org/vlc/features.html) and [VLC 3.0 release notes](https://www.videolan.org/vlc/releases/3.0.0.html)

## FAQ

<!-- FAQ is rendered from the `faq` frontmatter (FAQPage JSON-LD). -->

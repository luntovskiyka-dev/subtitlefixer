---
title: "About SubtitleFixer – Free Browser-Based Subtitle Tools"
description: "SubtitleFixer is a set of free subtitle tools that run in your browser. Fix out-of-sync timings, garbled characters and formats. No uploads, no sign-up."
---

# About SubtitleFixer

**SubtitleFixer is a set of free subtitle tools that run entirely in your browser, so your files never leave your device.**

You can shift subtitle timings, fix garbled characters, and convert between SRT, VTT and ASS without creating an account or uploading anything.

## Who it's for

SubtitleFixer is for anyone whose subtitles don't quite work, for example:

- The subtitles appear too early or too late compared to the speech.
- The text shows strange characters like `Ã©`, `Ð¿Ñ€Ð¸` or `�` instead of normal letters.
- Your player or website needs a different format, like VTT instead of SRT.

You don't need to know anything about encodings or subtitle formats. Pick the tool that matches your problem, drop in your file, and download the fixed version.

## Why everything runs in your browser

**SubtitleFixer processes your subtitle files on your own device, not on a server.**

When you add a file, the page reads it and fixes it with code running in your browser. The file is not sent anywhere, so there is nothing to upload, nothing to wait for, and nothing stored on our side.

We built it this way because:

- **Privacy:** subtitles can be personal or unreleased work, and you shouldn't have to hand them to a stranger's server.
- **Speed:** small text files are fixed instantly, with no upload or download queue.
- **Simplicity:** no account, no sign-up, no email address.

## The tools

- [**Shift subtitles**](/shift-subtitles) – Move all subtitle timings earlier or later by a number of milliseconds, optionally starting from a specific cue, in SRT, VTT or ASS files.
- [**Fix subtitle drift**](/fix-subtitle-drift) – Re-time subtitles that start in sync but slowly drift: set the correct time for two lines and every cue is corrected, or use a frame-rate preset (23.976↔25, 24↔25 or 23.976↔24 fps).
- [**Fix subtitle encoding**](/fix-subtitle-encoding) – Automatically detect the file's encoding, preview a few possible readings, choose the one that looks right for your language, repair double-encoded text (mojibake like `Ã©` instead of `é`), and save it as UTF-8, with an optional BOM for older players.
- [**SRT to VTT**](/srt-to-vtt) – Convert one or more SubRip (.srt) files to WebVTT (.vtt), the format used by HTML5 video.
- [**VTT to SRT**](/vtt-to-srt) – Convert one or more WebVTT (.vtt) files back to SubRip (.srt).
- [**ASS to SRT**](/ass-to-srt) – Convert Advanced SubStation Alpha (.ass) and SubStation Alpha (.ssa) files to SRT by removing styling tags (italics and bold are kept as `<i>` and `<b>`), turning `\N` into real line breaks, and merging duplicate lines from multiple layers.

If you process one file, you download it as a file. If you process several files at once, you download them together as one zip.

## How SubtitleFixer is funded

**SubtitleFixer is free to use, and there is no paid version.**

If a tool saved you some time, you can leave an optional tip through [Ko-fi](https://ko-fi.com/gngpromo). Donations are never required, and every tool works the same whether you donate or not.

## Contact

Found a bug, a file that doesn't convert properly, or have an idea for a new tool? Email [luntovskiy.k.a@gmail.com](mailto:luntovskiy.k.a@gmail.com).

SubtitleFixer is run by Kirill Luntovskii.

See also: [Privacy policy](/privacy)

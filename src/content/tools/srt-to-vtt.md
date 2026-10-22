---
title: "SRT to VTT Converter: Free WebVTT, No Upload | SubtitleFixer"
description: "Convert SRT to VTT (WebVTT) in your browser. Same text, same timings, many files at once. Free, no sign-up, and your files never leave your device."
h1: "SRT to VTT Converter"
slug: "srt-to-vtt"
answer: "To convert SRT to VTT, drop your .srt files on this page and download the WebVTT (.vtt) files: SubtitleFixer adds the WEBVTT header and changes the timestamp format in your browser, keeping the same text and timings, without uploading anything."
faq:
  - q: "How do I convert SRT to VTT?"
    a: "Drop one or more SRT files on this page or paste SRT text, then download the VTT files. SubtitleFixer adds the WEBVTT header, removes the cue numbers and changes the comma in each timestamp to a period. It all happens in your browser, so nothing is uploaded."
  - q: "Can I just rename an .srt file to .vtt?"
    a: "No. A VTT file must start with the line WEBVTT and use a period before the milliseconds, so web browsers reject a renamed SRT file. Converting the file here makes both changes for you."
  - q: "Will the timing or formatting change?"
    a: "No. Every start and end time is kept to the millisecond, and italic, bold and underline tags (`<i>`, `<b>`, `<u>`) are kept. Only the timestamp separator changes, from 00:00:01,200 to 00:00:01.200. The VTT file is saved as UTF-8."
  - q: "Can I convert many SRT files at once?"
    a: "Yes. Add as many SRT files as you need. One file downloads as a .vtt file; several download together as one zip."
  - q: "Do I need VTT for an HTML5 video player?"
    a: "Yes. The `<track>` element of HTML5 video uses WebVTT, so web pages need a .vtt file, not an .srt file. See the code example on this page."
  - q: "Does YouTube need VTT, or can I upload SRT?"
    a: "YouTube accepts both SRT and VTT caption files, so you don't have to convert for YouTube. Convert when your web player, course platform or site asks for VTT."
  - q: "Can VLC or Plex play VTT subtitles?"
    a: "VLC and Plex can both load external .vtt subtitle files, but most desktop players and TVs handle SRT at least as well. Keep the SRT file for them and use VTT for the web."
  - q: "Is my SRT file uploaded?"
    a: "No. SubtitleFixer converts SRT to VTT inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/vtt-to-srt", "/shift-subtitles", "/fix-subtitle-encoding", "/ass-to-srt", "/sbv-to-srt", "/guides/srt-vs-vtt-vs-ass"]
---

Free SRT to VTT conversion that runs in your browser: your files never leave your device, and there is no sign-up.

## How to convert SRT to VTT in 3 steps

1. **Add your SRT files.** Drag one or more .srt files onto the page, click to choose them, or paste SRT text with the "Paste text" option.
2. **Check the preview.** SubtitleFixer shows the WebVTT result with the same text and timings.
3. **Download.** One file downloads as a .vtt file; several files download together as one zip.

## Example: before and after

Before (SRT):

```srt
1
00:00:01,200 --> 00:00:03,800
Hi, and welcome back.

2
00:00:04,100 --> 00:00:07,450
Today we're fixing subtitles.
```

After (VTT):

```vtt
WEBVTT

00:00:01.200 --> 00:00:03.800
Hi, and welcome back.

00:00:04.100 --> 00:00:07.450
Today we're fixing subtitles.
```

The WEBVTT header is added, the cue numbers are gone (VTT doesn't need them), and `00:00:01,200` became `00:00:01.200`. The text and times didn't change.

## What it can and can't do

**What it does:**

- Convert SubRip (.srt) subtitles to WebVTT (.vtt).
- Add the WEBVTT header, drop the cue numbers and switch to the VTT timestamp format.
- Keep every start and end time exactly, to the millisecond.
- Keep italic, bold and underline tags (`<i>`, `<b>`, `<u>`).
- Turn old `<font>` tags into plain text so the WebVTT is valid.
- Read SRT files in other encodings and save the VTT file as UTF-8. Tick "Add BOM (old players)" if your device needs a BOM.
- Convert pasted SRT text as well as files.
- Convert many files at once and give you one zip.
- Run fully in your browser, with no upload and no sign-up.

**What it doesn't do:**

- Repair garbled characters like `Ã©`. Fix them first with [Fix subtitle encoding](/fix-subtitle-encoding), then convert.
- Fix subtitles that are out of sync. Use [Shift subtitles](/shift-subtitles) for that.
- Add VTT styling or positioning. SRT files don't contain it, so there is nothing to carry over.
- Burn subtitles into a video. You get a separate .vtt file.
- Extract subtitles that are embedded in a video file. You need a separate .srt file or its text.

## What changes between SRT and VTT

- **Header:** a VTT file starts with the line `WEBVTT`. SRT has no header.
- **Timestamps:** SRT uses a comma before the milliseconds (`00:00:01,200`), VTT uses a period (`00:00:01.200`).
- **Cue numbers:** required in SRT, optional in VTT, so SubtitleFixer leaves them out.
- **Tags:** `<i>`, `<b>` and `<u>` work in both formats.

For a full comparison, read [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

## How to add a VTT file to an HTML5 video

```html
<video controls src="movie.mp4">
  <track kind="subtitles" src="movie.vtt" srclang="en" label="English" default>
</video>
```

If the subtitles don't show:

- Check that the track `src` points to the right .vtt file.
- Make sure your server sends .vtt files as `text/vtt`.
- If the .vtt file is on another domain, the server must allow it (CORS) and the `<video>` element needs a `crossorigin` attribute.
- Test through a web server, not by opening the page from your disk (`file://`). Some browsers block subtitle tracks on local files.

## Related tools

- [VTT to SRT converter](/vtt-to-srt): turn VTT captions back into an SRT file.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©` or other garbled characters.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into SRT.
- [SBV to SRT converter](/sbv-to-srt): turn YouTube SBV captions into SRT.
- Guide: [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass).

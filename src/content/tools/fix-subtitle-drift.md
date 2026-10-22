---
title: "Fix Subtitle Drift & Frame Rate (23.976/25) | SubtitleFixer"
description: "Subtitles fine at the start but off by the end? Pin two lines and every cue is re-timed (fixes 23.976/25 fps drift). Free, in your browser, no upload."
h1: "Fix Subtitle Drift (Two-Point Sync)"
slug: "fix-subtitle-drift"
answer: "To fix subtitle drift, set the correct time for two lines, one near the start and one near the end, and SubtitleFixer stretches and moves every other line to match, right in your browser, so your file never leaves your device."
faq:
  - q: "Why do my subtitles start in sync and then drift further off?"
    a: "The subtitles were timed for a version of the video that plays at a slightly different speed, often because of a different frame rate such as 25 fps instead of 23.976 fps. The difference between those two is about 4%, which adds up to almost 4 minutes by the end of a 90-minute film."
  - q: "How do I know whether it's drift or a constant delay?"
    a: "Check how far off one line near the start is, then one line near the end. If both are off by about the same amount, it's a constant delay and you can use [Shift subtitles](/shift-subtitles). If the gap is clearly bigger at the end, it's drift, and this page fixes it."
  - q: "Should I convert 23.976 to 25 fps or 25 to 23.976 fps?"
    a: "If the subtitles appear later and later compared to the speech, use 23.976 → 25. If they appear earlier and earlier, use 25 → 23.976. If you're not sure, use two-point sync, which doesn't need frame rates at all."
  - q: "Do I need two-point sync or a frame rate preset?"
    a: "Use a frame rate preset if you know both frame rates and the subtitles are right at the very start. Use two-point sync if you don't know the frame rates or the subtitles are also shifted, because it fixes drift and a constant delay at the same time. Presets can convert several files at once, for example a whole season; two-point sync works on one file at a time."
  - q: "Why are my subtitles out of sync in Plex or Jellyfin?"
    a: "Often the subtitle file was made for a different release of the video, for example one with a different frame rate or an extra intro. If the gap is the same all the way through, use [Shift subtitles](/shift-subtitles); if it grows, fix the drift here. Then replace the old subtitle file next to your video with the fixed one. Plex's Adjust Offsets and Jellyfin's Subtitle Offset only move all lines by the same amount, so they can't fix drift. More in the guide [Subtitles out of sync](/guides/subtitles-out-of-sync)."
  - q: "Can I fix subtitles that drift on Netflix?"
    a: "No. Netflix and other streaming services load their own subtitles, so there is no file for you to fix. SubtitleFixer only works with subtitle files on your device. See the guide [Subtitles out of sync](/guides/subtitles-out-of-sync) for what you can try."
  - q: "How do I adjust subtitle timing when the delay isn't the same everywhere?"
    a: "Use two-point sync on this page: set the correct time for one line near the start and one near the end, and every line in between is re-timed. If the delay is the same everywhere, a simple [shift](/shift-subtitles) is enough."
  - q: "Is my subtitle file uploaded?"
    a: "No. SubtitleFixer fixes subtitle drift inside your browser, and the file never leaves your device. There is no upload and no sign-up."
related: ["/shift-subtitles", "/fix-subtitle-encoding", "/srt-to-vtt", "/vtt-to-srt", "/ass-to-srt"]
---

## How to fix subtitle drift in 3 steps

You can fix subtitle drift in three steps, and your file stays on your device the whole time.

1. **Add your subtitle file.** Drag an SRT, VTT or ASS file onto the page, or click to choose it. Two-point sync works on one file at a time; frame rate presets can convert several files at once.
2. **Set the correct time for two lines.** The first and last lines are selected by default; you can pick any other two from the list. For each one, type the time it is actually spoken in the video, as `hh:mm:ss,mmm` (for example `01:28:25,480`). If you know both frame rates, you can pick a preset such as 25 → 23.976 fps instead.
3. **Download the fixed file.** Every line is re-timed to match, the text stays the same, and the file keeps its format.

## Example: before and after

In this SRT file the subtitles are 1 second late at the start and about 3 minutes 40 seconds late by the end.

Before:

```srt
1
00:00:50,000 --> 00:00:52,500
Is anyone there?

612
00:45:10,250 --> 00:45:13,000
We should have left an hour ago.

1204
01:32:05,500 --> 01:32:08,750
It's over. Let's go home.
```

While watching the video, you note that line 1 is spoken at **00:00:49,000** and line 1204 (the last line) at **01:28:25,480**. You enter those two times for the two lines that are selected by default.

After:

```srt
1
00:00:49,000 --> 00:00:51,400
Is anyone there?

612
00:43:22,840 --> 00:43:25,480
We should have left an hour ago.

1204
01:28:25,480 --> 01:28:28,600
It's over. Let's go home.
```

You only set lines 1 and 1204. Line 612, and every other line, moved into place on its own. In this example every time was multiplied by 0.96 and then moved 1 second later, which is what a 24 fps vs 25 fps mismatch plus a 1-second offset looks like.

## What it does and doesn't do

This tool fixes subtitles that get gradually further out of sync. It does not fix a sudden jump in the middle of a file.

**What it does:**

- Re-times every line from two lines whose correct time you set: the first and last line, or any two lines.
- Fixes gradual drift and a constant delay at the same time.
- Converts subtitle frame rates with presets for 23.976 ↔ 25, 24 ↔ 25 and 23.976 ↔ 24 fps, for one file or several at once (several files download as one zip).
- Works with SRT, VTT and ASS files, keeps the format and keeps the text as it is.
- Rounds every new time to a whole millisecond.
- Runs in your browser: your file never leaves your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't fix subtitles that are fine up to one point and then suddenly jump, for example after a cut scene. Use [Shift subtitles](/shift-subtitles) and start the shift from the line where the jump happens.
- It doesn't watch the video or find the right times for you. You enter the correct times for the two lines yourself.
- It can't change subtitles inside streaming services like Netflix, Disney+ or YouTube. It only works on subtitle files you have on your device.
- Presets cover 23.976, 24 and 25 fps. For any other mismatch, use two-point sync.

## How two-point sync works

Two-point sync uses the two times you enter to work out a straight-line correction for the whole file.

Think of the subtitle timeline as a rubber band. SubtitleFixer stretches or squeezes it until the distance between your two lines is right, then slides it until both lines sit in the right place. Every other line moves along with it.

In math terms, each time `t` becomes `a × t + b`. Here `a` is the stretch (for example 0.96) and `b` is the slide (for example +1 second). You don't need to calculate either one: SubtitleFixer works them out from your two lines.

For the best result, choose two lines that are far apart and easy to hear, such as short lines of dialogue near the start and near the end.

## Subtitle frame rate converter: 23.976 ↔ 25 fps

The frame rate presets re-time subtitles made for one frame rate so they match a video with another, without entering any times.

A frame rate mismatch is a common reason for drift. Many European TV and DVD releases play films at 25 fps, which is about 4% faster than the 23.976 fps used by most Blu-ray and web releases. Subtitles made for one version slowly drift against the other: by almost 4 minutes over a 90-minute film. Between 23.976 and 24 fps the difference is only 0.1%, which is still about 5 seconds over 90 minutes.

Each preset is labelled "subtitle fps → video fps": the first number is the frame rate the subtitles were made for, and the second is the frame rate of your video. 23.976 fps here means the exact NTSC film rate, 24000/1001, and new times are rounded to whole milliseconds.

| Preset | Every time is multiplied by | Pick it when the subtitles appear… |
|---|---|---|
| 23.976 → 25 fps | ≈ 0.9590 | later and later |
| 25 → 23.976 fps | ≈ 1.0427 | earlier and earlier |
| 24 → 25 fps | 0.96 | later and later |
| 25 → 24 fps | ≈ 1.0417 | earlier and earlier |
| 23.976 → 24 fps | ≈ 0.9990 | slowly later and later |
| 24 → 23.976 fps | 1.001 | slowly earlier and earlier |

Example with the 25 → 24 fps preset (every time × 25 ÷ 24).

Before (subtitles made for 25 fps):

```srt
1
00:00:04,800 --> 00:00:07,200
Good morning.

640
00:48:00,000 --> 00:48:02,400
Did you hear that?
```

After (matching a 24 fps video):

```srt
1
00:00:05,000 --> 00:00:07,500
Good morning.

640
00:50:00,000 --> 00:50:02,500
Did you hear that?
```

At the start the change is only 0.2 seconds, but by line 640 it is 2 minutes. That growing gap is why a single shift can't fix a frame rate mismatch.

To check your video's frame rate in VLC, go to Tools → Codec Information. If you don't know the frame rate the subtitles were made for, use two-point sync instead.

Presets work in batch: add several files, such as every episode of a season, and download them together as one zip. Two-point sync handles one file at a time, because each file needs its own two lines.

## Related tools

- [Shift subtitles](/shift-subtitles): for subtitles that are off by the same amount all the way through, or that jump at one point.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [SRT to VTT converter](/srt-to-vtt): turn SRT subtitles into VTT for web video players.
- [VTT to SRT converter](/vtt-to-srt): turn VTT captions into an SRT file.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into a plain SRT file.
- Guide: [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

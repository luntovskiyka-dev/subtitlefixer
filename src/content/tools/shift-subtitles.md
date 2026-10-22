---
title: "Shift Subtitles Online: Fix Subtitle Delay | SubtitleFixer"
description: "Subtitles too early or too late? Shift SRT, VTT and ASS timings by milliseconds, from any line. Free, no sign-up, files never leave your device."
h1: "Shift Subtitles Online"
slug: "shift-subtitles"
answer: "To shift subtitles, drop your SRT, VTT or ASS file on this page, enter the offset in milliseconds (negative for earlier, positive for later) and download the fixed file: SubtitleFixer moves every line by that amount in your browser, without uploading anything."
faq:
  - q: "How do I shift subtitles to fix a delay?"
    a: "Drop the subtitle file on this page, enter the offset in milliseconds and download the fixed file. Use a negative number if the subtitles appear too late and a positive number if they appear too early. 1 second is 1000 ms."
  - q: "Can I shift only from a certain line onwards?"
    a: "Yes. Enter the line to start from in \"Start from cue\". That line and every line after it move; the lines before it stay as they are. In an SRT file this is the cue number; in a VTT or ASS file it is the line's position in the file, counting from 1."
  - q: "My subtitles drift further off as the video plays. Will shifting fix it?"
    a: "No. Shifting moves every line by the same amount, so it can't fix a gap that keeps growing. Use [Fix subtitle drift](/fix-subtitle-drift) instead."
  - q: "What happens to lines that would start before 00:00:00?"
    a: "A line that would end at or before 00:00:00 is removed, and a line that would start before it is trimmed to start at 00:00:00. You see how many lines were removed or trimmed, and SRT files are renumbered."
  - q: "What's the difference between VLC's subtitle delay and shifting the file?"
    a: "VLC's temporary subtitle delay (for example, the G and H keys on Windows and Linux) only lasts while the video is open in VLC, and the file doesn't change. A shifted file plays in sync in any player and for anyone you share it with. You can find the right delay in VLC first, then enter the same amount here."
  - q: "Can I fix out-of-sync subtitles for Plex or Jellyfin?"
    a: "Yes, if the subtitles are an external file next to your video (for example movie.en.srt). Shift the file here, replace the old file with the new one, and refresh the item's metadata (or rescan the library) in Plex or Jellyfin so it picks up the change. Subtitles built into the video file (embedded tracks) can't be shifted here."
  - q: "Can I shift subtitles on Netflix or YouTube?"
    a: "No. This tool only works with subtitle files on your device. It can't change subtitles inside streaming services."
  - q: "Is my subtitle file uploaded?"
    a: "No. SubtitleFixer shifts your subtitles inside your browser, and the file never leaves your device. There is no sign-up."
related: ["/srt-validator", "/fix-subtitle-drift", "/guides/subtitles-out-of-sync", "/fix-subtitle-encoding", "/srt-to-vtt", "/vtt-to-srt", "/merge-subtitles"]
---

Free subtitle shifter that runs in your browser: your file never leaves your device, and there is no sign-up.

## How to shift subtitles in 3 steps

1. **Add your subtitle file.** Drag an SRT, VTT or ASS file onto the page, or click to choose it. Several files get the same shift.
2. **Enter the offset in milliseconds.** Negative makes subtitles appear earlier, positive makes them appear later. The ±100, ±500 and ±1000 buttons change the number in steps. To shift only part of the file, also fill in "Start from cue".
3. **Download the fixed file.** It keeps its original format. Several files download together as one zip.

## Example: before and after

Every line here appears 2.5 seconds after it is spoken, so the offset is **-2500 ms**.

Before:

```srt
1
00:00:12,400 --> 00:00:15,100
Where were you last night?

2
00:00:15,600 --> 00:00:18,250
I told you. I was at work.
```

After shifting by -2500 ms:

```srt
1
00:00:09,900 --> 00:00:12,600
Where were you last night?

2
00:00:13,100 --> 00:00:15,750
I told you. I was at work.
```

Every start and end time moved 2.5 seconds earlier. The text and order stayed the same.

## What it can and can't do

**What it does:**

- Move every subtitle earlier or later by the same number of milliseconds.
- Start the shift from a line you choose and leave the earlier lines alone.
- Work with SRT, VTT and ASS files and keep the original format. ASS headers and styles are untouched.
- Shift several files at once by the same amount.
- Remove or trim lines pushed before 00:00:00, tell you how many, and renumber SRT files.
- Run fully in your browser, with no upload and no sign-up.

**What it doesn't do:**

- Fix drift, where subtitles get further off over time. Use [Fix subtitle drift](/fix-subtitle-drift).
- Work out the delay for you. You measure it once (see below).
- Change subtitles embedded inside a video file or on streaming services.
- Fix garbled characters like `Ã©`. Use [Fix subtitle encoding](/fix-subtitle-encoding).

## Shift or drift?

Check a line near the start and a line near the end of the video. If both are off by about the same amount, shift the file here. If the gap is clearly bigger at the end, it's drift, often from a frame rate mismatch such as 25 vs 23.976 fps, and you need [Fix subtitle drift](/fix-subtitle-drift). More in the guide [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

## How to measure the offset

1. Find a clear line of dialogue near the start. Note when it is spoken, for example `00:05:12.4`.
2. Find the same line in the subtitle file and note its start time, for example `00:05:14,900`.
3. Subtract: 00:05:12,400 − 00:05:14,900 = −2.5 seconds. Enter **-2500**.

Shift once, test in your player, and adjust by a few hundred milliseconds if needed.

## Shift from a specific line

Use "Start from cue" when subtitles are fine at first and then suddenly jump off, for example after an ad break was cut. With **+1200 ms from line 3**:

```srt
2
00:00:55,100 --> 00:00:57,000
Wait for me.

3
00:00:59,300 --> 00:01:01,850
We're late again.
```

becomes:

```srt
2
00:00:55,100 --> 00:00:57,000
Wait for me.

3
00:01:00,500 --> 00:01:03,050
We're late again.
```

Line 2 didn't move; line 3 and everything after it moved 1.2 seconds later.

## Player delay vs fixing the file

A player's subtitle delay is temporary. In VLC, the subtitle delay shortcuts (for example, G and H on Windows and Linux) change the timing while you watch, but the delay is gone when you close the video. A shifted file is fixed for good, in any player, on your TV, and in Plex or Jellyfin once you replace the old file.

## Related tools

- [SRT validator](/srt-validator): check an SRT file for bad times, overlaps and numbering.
- [Fix subtitle drift](/fix-subtitle-drift): for subtitles that get further out of sync over time.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.
- [SRT to VTT converter](/srt-to-vtt) and [VTT to SRT converter](/vtt-to-srt): change the format after fixing the timing.
- [Merge subtitles](/merge-subtitles): combine subtitle files.
- Guide: [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

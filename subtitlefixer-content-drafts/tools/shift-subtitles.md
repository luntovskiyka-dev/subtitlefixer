---
title: "Shift Subtitles Online – Sync SRT, VTT & ASS | SubtitleFixer"
description: "Subtitles early or late? Shift every cue by +/- milliseconds, from any line. Free, in your browser: no upload, no signup. Works with SRT, VTT and ASS."
h1: "Shift Subtitles Online"
slug: "shift-subtitles"
answer: "To shift subtitles, enter how many milliseconds to move them (positive = later, negative = earlier) and SubtitleFixer re-times every line of your SRT, VTT or ASS file in your browser, so your file never leaves your device."
faq:
  - q: "How do I fix subtitles that are out of sync by the same amount?"
    a: "Shift the whole file by that amount. Measure how far one line is off, enter the difference in milliseconds, and download the fixed file. If the gap gets bigger as the video plays, the problem is drift, and you need [Fix subtitle drift](/fix-subtitle-drift) instead."
  - q: "Should I enter a positive or negative number?"
    a: "Enter a positive number if the subtitles appear too early, and a negative number if they appear too late. For example, subtitles that show up 2 seconds after the words are spoken need -2000."
  - q: "How do I know how many milliseconds to shift?"
    a: "Subtract the subtitle's start time in the file from the moment the line is actually spoken in the video. If a line is spoken at 00:05:12.4 but the file says 00:05:14,900, the result is -2.5 seconds, so you enter -2500. You can use any whole number of milliseconds, so half a second is 500."
  - q: "Can I shift only from a certain line onwards?"
    a: "Yes. Enter the number of the line where the problem starts, and SubtitleFixer shifts that line and every line after it to the end of the file, while the lines before it stay unchanged. In an SRT file this is the cue number; in a VTT or ASS file it is the line's position in the file, counting from 1."
  - q: "My subtitles start in sync and then drift further off. Will shifting fix it?"
    a: "No. Shifting moves every line by the same amount, so it can't fix a gap that keeps growing. Use [Fix subtitle drift](/fix-subtitle-drift), which re-times the file from two lines you set yourself."
  - q: "Which formats can I shift, and does the format change?"
    a: "You can shift SRT, VTT and ASS files, and the format stays the same. An SRT file comes back as an SRT file, a VTT file as a VTT file, and an ASS file as an ASS file with its header and styles untouched."
  - q: "What's the difference between VLC's subtitle delay and fixing the file?"
    a: "VLC's subtitle delay only applies while that video is open in VLC, and the subtitle file itself doesn't change. Shifting the file fixes it once, so it plays in sync in any player, on your TV, and for anyone you share it with."
  - q: "Is my subtitle file uploaded?"
    a: "No. SubtitleFixer shifts your subtitles inside your browser, and the file never leaves your device. There is no upload and no sign-up."
related: ["/fix-subtitle-drift", "/fix-subtitle-encoding", "/srt-to-vtt", "/vtt-to-srt", "/ass-to-srt"]
---

## How to shift subtitles in 3 steps

You can shift subtitles in three steps, and your file stays on your device the whole time.

1. **Add your subtitle file.** Drag an SRT, VTT or ASS file onto the page, or click to choose it. You can add several files at once, and they all get the same shift.
2. **Enter the shift in milliseconds.** Use a positive number to make the subtitles appear later and a negative number to make them appear earlier. 1 second is 1000 ms. The ±100, ±500 and ±1000 buttons change the number in quick steps. To shift only part of the file, also enter the line to start from.
3. **Download the fixed file.** It keeps the same format as the original. One file downloads as it is; several files download together as one zip.

## Example: before and after

In this SRT file every line appears 2.5 seconds after it is spoken, so the shift is **-2500 ms**.

Before:

```srt
1
00:00:12,400 --> 00:00:15,100
Where were you last night?

2
00:00:15,600 --> 00:00:18,250
I told you. I was at work.

3
00:01:03,980 --> 00:01:06,020
Nobody at work has seen you all week.
```

After shifting by -2500 ms:

```srt
1
00:00:09,900 --> 00:00:12,600
Where were you last night?

2
00:00:13,100 --> 00:00:15,750
I told you. I was at work.

3
00:01:01,480 --> 00:01:03,520
Nobody at work has seen you all week.
```

Every start and end time moved 2.5 seconds earlier. The text, the order and the length of each line stayed the same.

## What it does and doesn't do

The shift tool moves subtitle timings by a fixed amount. It does not change the text or fix other kinds of timing problems.

**What it does:**

- Moves every subtitle earlier or later by the same number of milliseconds.
- Starts the shift from a line you choose, if you want, and leaves the earlier lines alone.
- Works with SRT, VTT and ASS files and keeps the original format.
- Shifts several files at once by the same amount and gives you one zip to download.
- Removes lines that would end at or before 00:00:00 and trims lines that would start before it, tells you how many lines were removed or trimmed, and renumbers SRT files 1, 2, 3…
- Runs in your browser: your file never leaves your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't fix drift, where the subtitles get further off as the video plays. For that, use [Fix subtitle drift](/fix-subtitle-drift).
- It can't change subtitles inside streaming services like Netflix, Disney+ or YouTube. It only works on subtitle files you have on your device.
- It doesn't work out the delay for you. You measure it once (see below).
- It doesn't fix garbled characters like `Ã©`. For that, use [Fix subtitle encoding](/fix-subtitle-encoding).

## Constant shift vs drift

A constant shift means every subtitle is off by the same amount, from the first line to the last, and this page fixes exactly that.

Drift is different: the subtitles are almost right at the start and clearly off by the end, because the gap keeps growing. A common cause is subtitles made for a version of the video with a different frame rate, such as 25 fps instead of 23.976 fps. Shifting can't fix drift, because no single number is right for the whole file.

To tell them apart, check two lines:

1. Check a line near the start of the video and note how far off it is.
2. Check a line near the end and note how far off it is.
3. If both are off by about the same amount, shift the subtitles here. If the gap is clearly bigger at the end, use [Fix subtitle drift](/fix-subtitle-drift).

For more help, read the guide [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

## How to measure the offset

The offset is the moment a line is spoken minus the time the subtitle file gives for it.

1. Find a clear line of dialogue near the start of the video. Note the time when it is spoken, for example `00:05:12.4`.
2. Open the subtitle file in a text editor and find the same line. Note its start time, for example `00:05:14,900`.
3. Subtract: 00:05:12,400 − 00:05:14,900 = −2.5 seconds. Enter **-2500**.

Most players only show whole seconds, so your first number may be a little off. Shift once, test the result in your player, and adjust by a few hundred milliseconds if needed.

## What happens to lines shifted before 00:00:00

A subtitle can't start before the video does, so SubtitleFixer removes or trims lines that a negative shift pushes past 00:00:00.

- **A line that would end at or before 00:00:00** is removed. A line ending exactly at 00:00:00,000 would have no length, so it is removed too.
- **A line that would start before 00:00:00 but end after it** starts at 00:00:00 and keeps its new end time.
- **In an SRT file**, the remaining lines are renumbered 1, 2, 3…

You see a message with the number of lines removed and trimmed, so nothing disappears without you knowing.

In this example the shift is **-3000 ms**. Line 1 is removed, line 2 is trimmed, and the rest move as usual.

Before:

```srt
1
00:00:01,000 --> 00:00:02,500
(Music)

2
00:00:02,200 --> 00:00:04,800
Previously on Harbour Lights…

3
00:00:05,100 --> 00:00:07,000
You can't stay here.
```

After shifting by -3000 ms:

```srt
1
00:00:00,000 --> 00:00:01,800
Previously on Harbour Lights…

2
00:00:02,100 --> 00:00:04,000
You can't stay here.
```

## Shift from a specific line

You can shift only part of a file by entering the line number where the shift should start.

In an SRT file, the line number is the cue number. In a VTT or ASS file, it is the line's position in the file, counting from 1. The shift always runs to the end of the file.

This is useful when subtitles are in sync at first and then suddenly jump off, for example after an extra scene or where an ad break was cut. Lines before the one you choose keep their original times.

In this example the subtitles are fine up to line 2, and from line 3 on they appear 1.2 seconds too early. The shift is **+1200 ms, starting from line 3**.

Before:

```srt
2
00:00:55,100 --> 00:00:57,000
Wait for me.

3
00:00:59,300 --> 00:01:01,850
We're late again.
```

After:

```srt
2
00:00:55,100 --> 00:00:57,000
Wait for me.

3
00:01:00,500 --> 00:01:03,050
We're late again.
```

Line 2 didn't move. Line 3 and every line after it moved 1.2 seconds later. If a later part of the file is off by a different amount, run the tool again on the fixed file, starting from that line.

## Player delay vs fixing the file

A player's subtitle delay is temporary, while shifting the file fixes it for good.

In VLC you can change the subtitle delay while watching (with the G and H keys on Windows and Linux, in 50 ms steps), but the delay only lasts while that video is open. Other players have similar settings, and they only work in that one player.

A shifted subtitle file plays in sync everywhere: in any player, on your TV, and for anyone you share it with. A practical way to work is to find the right delay in your player first, then enter the same amount here.

## Related tools

- [Fix subtitle drift](/fix-subtitle-drift): for subtitles that get further out of sync over time, or a frame rate mismatch such as 23.976 vs 25 fps.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [SRT to VTT converter](/srt-to-vtt): turn SRT subtitles into VTT for web video players.
- [VTT to SRT converter](/vtt-to-srt): turn VTT captions into an SRT file.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into a plain SRT file.
- Guide: [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

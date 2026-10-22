---
title: "Dual Subtitles: Merge Two Languages Free | SubtitleFixer"
description: "Make dual subtitles: merge two languages into one SRT or VTT file, one above the other, or join CD1 and CD2. Free, in your browser, no upload."
h1: "Merge Subtitles: Dual Subtitles in One File"
slug: "merge-subtitles"
answer: "To merge two subtitle files, add both files, choose \"Two languages (dual)\" to show both languages at once or \"Join parts (CD1 + CD2)\" to put one file after the other, and download a single SRT or VTT file, right in your browser, so your files never leave your device."
faq:
  - q: "How do I merge two SRT files into one?"
    a: "Add both files on this page and pick a mode. \"Two languages (dual)\" puts the text of both files into the same subtitles; \"Join parts (CD1 + CD2)\" puts the second file after the first and renumbers the lines. Then download one SRT or VTT file."
  - q: "How do I make dual-language subtitles?"
    a: "Add the subtitles in both languages and choose \"Two languages (dual)\". The first file sets the timings, and each line from the second file is added to the line it overlaps most in time, so both languages appear together, one above the other. Use the swap option to change which language is on top."
  - q: "My two files are out of sync with each other. What should I do?"
    a: "Sync the second file to the video first, then merge. If it is early or late by the same amount, use [Shift subtitles](/shift-subtitles); if the gap grows as the video plays, use [Fix subtitle drift](/fix-subtitle-drift). Merging works best when both files already match the same video."
  - q: "How do I join CD1 and CD2 subtitles?"
    a: "Add the CD1 file first and the CD2 file second, then choose \"Join parts (CD1 + CD2)\". The second part starts right after the last line of the first part, plus a gap you can set. If you know exactly where part 2 begins in the joined video, enter that time instead, which is more accurate."
  - q: "Can I watch dual subtitles in a player or on my TV?"
    a: "Yes, if the player can load an external SRT or VTT file. The merged file is a normal subtitle file in which each subtitle has two lines, one per language, so it shows both languages at once. Load it like any other subtitle file. In Plex, external text subtitles such as SRT can also be nudged during playback with Adjust Offsets, but that only moves every line by the same amount."
  - q: "Can I get dual subtitles on Netflix or YouTube?"
    a: "Not with SubtitleFixer. It only merges subtitle files you have on your device, and streaming services load their own subtitles. If you have both subtitle files for a video you play yourself, you can merge them here."
  - q: "Can it add the subtitles to my video permanently?"
    a: "No. SubtitleFixer creates a separate subtitle file; it doesn't burn subtitles into the picture or add them to the video file. Load the merged file in your player, or use a video editor if you need the subtitles inside the video."
  - q: "Are my subtitle files uploaded?"
    a: "No. SubtitleFixer merges subtitles inside your browser, and your files never leave your device. There is no upload and no sign-up."
related: ["/shift-subtitles", "/fix-subtitle-drift", "/fix-subtitle-encoding", "/srt-to-vtt", "/vtt-to-srt"]
---

## How to merge subtitles in 3 steps

You can merge two subtitle files in three steps, and your files stay on your device the whole time.

1. **Add two subtitle files.** Drag two .srt, .vtt or .ass files onto the page, or click to choose them. They can be different formats.
2. **Choose a mode.** Pick "Two languages (dual)" to show both files at the same time, or "Join parts (CD1 + CD2)" to put one after the other.
3. **Download.** Save the result as one SRT or VTT file.

## Two ways to merge

The two modes solve different problems, so pick the one that matches yours.

| You have | You want | Mode |
|---|---|---|
| The same video's subtitles in two languages | Both languages on screen at once, for example to learn a language | Two languages (dual) |
| Subtitles for part 1 and part 2 of a movie (CD1 and CD2) | One file for the whole movie | Join parts (CD1 + CD2) |

## Example: two languages in one file

The first file sets the timings. Each line from the second file is added under the line it overlaps most in time.

File A (English):

```srt
1
00:00:01,200 --> 00:00:03,800
Where are you going?

2
00:00:04,100 --> 00:00:06,500
To the station.
```

File B (Spanish):

```srt
1
00:00:01,300 --> 00:00:03,700
¿Adónde vas?

2
00:00:04,000 --> 00:00:06,600
A la estación.
```

Merged file:

```srt
1
00:00:01,200 --> 00:00:03,800
Where are you going?
¿Adónde vas?

2
00:00:04,100 --> 00:00:06,500
To the station.
A la estación.
```

The Spanish lines start and end a little differently, but each one overlaps one English line, so they are added there. English is on top because it's file A; use the swap option to put Spanish on top instead.

## Example: joining CD1 and CD2

In "Join parts" mode, the second file goes after the first, its times are moved forward, and the lines are numbered again from the start.

CD1 ends with:

```srt
812
01:02:10,400 --> 01:02:12,900
See you tomorrow.
```

CD2 starts with:

```srt
1
00:00:02,000 --> 00:00:04,300
Good morning.
```

If you set part 2 to start at `01:02:15,000`, the joined file continues like this:

```srt
812
01:02:10,400 --> 01:02:12,900
See you tomorrow.

813
01:02:17,000 --> 01:02:19,300
Good morning.
```

Every CD2 time moves by the same amount, so the gaps between its lines don't change.

## What it does and doesn't do

The merger combines two subtitle files into one. It doesn't change the words.

**What it does:**

- Merges two subtitle files in two languages into one dual-language file, with a choice of which language is on top.
- Joins two parts, such as CD1 and CD2, into one file, moves the second part's times and renumbers the lines.
- Keeps every line: lines that don't pair up are kept with their own times.
- Accepts SRT, VTT and ASS files in any combination.
- Detects the encoding of each file separately and saves the result as UTF-8. Tick "Add BOM (old players)" if your device needs a BOM.
- Saves the result as SRT or VTT.
- Runs in your browser: your files never leave your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't sync the two files to each other. If one file is early, late or drifting, fix it first with [Shift subtitles](/shift-subtitles) or [Fix subtitle drift](/fix-subtitle-drift).
- It doesn't place the languages in different parts of the screen. In an SRT or VTT file, both languages appear in the same subtitle, one above the other.
- It doesn't add subtitles to a video file or burn them into the picture.
- It doesn't translate subtitles. You need a file in each language.
- It doesn't repair double-encoded text like `Ã©`. Use [Fix subtitle encoding](/fix-subtitle-encoding) for that before merging.

## Before you merge: check the sync

Merging works best when both files already match the same video.

1. **Play the video with each file on its own** and check a line near the start and one near the end.
2. **If one file is off by the same amount everywhere,** shift it with [Shift subtitles](/shift-subtitles).
3. **If one file gets further off as the video plays,** usually because it was made for a different frame rate or release, re-time it with [Fix subtitle drift](/fix-subtitle-drift).
4. **Then merge** the two synced files here.

## Related tools

- [Shift subtitles](/shift-subtitles): move one file earlier or later before merging.
- [Fix subtitle drift](/fix-subtitle-drift): re-time a file that slowly goes out of sync.
- [Fix subtitle encoding](/fix-subtitle-encoding): for subtitles that show `Ã©`, `Ð¿Ñ€Ð¸` or other garbled characters.
- [SRT to VTT converter](/srt-to-vtt): turn the merged SRT file into VTT for web video players.
- Guide: [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

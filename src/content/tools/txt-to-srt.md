---
title: "TXT to SRT: Turn Text into Timed Subtitles | SubtitleFixer"
description: "Paste a script or transcript and get an SRT file timed by reading speed, or keep the timestamps already in your text. Free, in your browser, no upload."
h1: "TXT to SRT Converter"
slug: "txt-to-srt"
answer: "To convert TXT to SRT, paste your text or drop a .txt file on the page and SubtitleFixer turns each line into a subtitle, timed by reading speed or by the timestamps already in your text, right in your browser. The timings come from the text, not from the audio of your video."
faq:
  - q: "How do I convert a text file to SRT?"
    a: "Paste the text or drop the .txt file on this page, choose \"Plain text\" or \"Text with timestamps\", and download the SRT file. Each line of text becomes one subtitle, and everything happens in your browser with no upload."
  - q: "How are the timings calculated?"
    a: "In \"Plain text\" mode, each subtitle stays on screen long enough to read it: 17 characters per second by default, at least 1 second and at most 7 seconds. The first subtitle starts at the start time you set, and each next one starts when the previous one ends. You can change all of these settings. With \"Fit to total duration\" on, the minimum and maximum don't apply: the total time is shared out by the number of characters in each subtitle."
  - q: "Can it sync the text to my video's audio?"
    a: "No. SubtitleFixer doesn't listen to the audio, so the timings are estimated from the length of the text. To match the speech, turn the audio into a transcript with timestamps first (for example with a transcription tool), then use \"Text with timestamps\" mode, or adjust the result with [Shift subtitles](/shift-subtitles) and [Fix subtitle drift](/fix-subtitle-drift)."
  - q: "How do I turn a YouTube transcript into SRT?"
    a: "Copy the transcript with its timestamps, paste it here and choose \"Text with timestamps\". Lines like `1:05 text` keep their start times, and each subtitle ends when the next one starts."
  - q: "How long should one subtitle be?"
    a: "A common rule is at most two lines of about 42 characters each, which is what the Netflix style guide for English sets. SubtitleFixer splits longer lines into subtitles of that size. The default reading speed of 17 characters per second is the limit Netflix uses for children's programs, so it is comfortable to read; Netflix allows up to 20 for adult programs."
  - q: "Can I make an SRT file for song lyrics?"
    a: "Yes. Put one lyric line on each line of text. If you know when each line is sung, add the times in front of the lines and use \"Text with timestamps\", because reading speed alone won't match the music."
  - q: "Can I get a VTT file instead of SRT?"
    a: "Yes. Switch the output to VTT before you download, or open [TXT to VTT](/txt-to-vtt), which starts on VTT. You can also convert an SRT file later with the [SRT to VTT converter](/srt-to-vtt)."
  - q: "Is my text uploaded?"
    a: "No. SubtitleFixer creates the subtitle file inside your browser, and your text never leaves your device. There is no upload and no sign-up."
related: ["/txt-to-vtt", "/srt-to-txt", "/shift-subtitles", "/fix-subtitle-drift", "/srt-to-vtt", "/fix-subtitle-encoding"]
---

## How to convert TXT to SRT in 3 steps

You can turn text into a subtitle file in three steps, and your text stays on your device the whole time.

1. **Add your text.** Paste it into the box, or drag a .txt file onto the page.
2. **Choose a mode.** Pick "Plain text" if your text has no times, or "Text with timestamps" if it already has them. Check the start time and reading speed if you need to.
3. **Download.** Save the result as an SRT file, or switch the output to VTT.

**The timings are estimated from your text, not from the audio of your video.** If the subtitles need to match the speech exactly, see [Matching the subtitles to your video](#matching-the-subtitles-to-your-video) below.

## Example: plain text

Every line of text becomes one subtitle. At the default reading speed of 17 characters per second, a line of 21 characters stays on screen for about 1.2 seconds.

Before (text):

```text
Hi, and welcome back.
Today we're fixing subtitles.
First, open your file.
```

After (SRT file):

```srt
1
00:00:00,000 --> 00:00:01,235
Hi, and welcome back.

2
00:00:01,235 --> 00:00:02,941
Today we're fixing subtitles.

3
00:00:02,941 --> 00:00:04,235
First, open your file.
```

Each subtitle starts when the previous one ends. Set a gap in milliseconds if you want a short pause between them, or a start time if the speech doesn't begin at 00:00:00.

## Example: text with timestamps

If your text already has times, such as a transcript copied from YouTube, SubtitleFixer keeps them.

Before (text):

```text
0:00 Hi, and welcome back.
0:04 Today we're fixing subtitles.
0:09 First, open your file.
```

After (SRT file):

```srt
1
00:00:00,000 --> 00:00:04,000
Hi, and welcome back.

2
00:00:04,000 --> 00:00:09,000
Today we're fixing subtitles.

3
00:00:09,000 --> 00:00:10,294
First, open your file.
```

Each subtitle ends when the next one starts. The last one has no next line, so its length comes from the reading speed.

These timestamp styles are recognised:

- `00:01:05 text`
- `[00:01:05] text`
- `1:05 text`, as in a YouTube transcript
- `00:01:05,200 --> 00:01:07,000` on its own line, with the text below it

## Settings

Plain text mode has a few settings, and all of them have sensible defaults.

- **Split by:** lines (default) or sentences. With sentences, each sentence becomes its own subtitle, even when several are on one line. Lines are never joined, so a sentence that runs onto the next line becomes two subtitles.
- **Start time:** when the first subtitle appears, as `hh:mm:ss,mmm`. Default: `00:00:00,000`.
- **Reading speed:** characters per second. Default: 17.
- **Minimum and maximum duration:** how short or long one subtitle can be. Default: 1 to 7 seconds.
- **Gap:** a pause between subtitles, in milliseconds. Default: 0.
- **Fit to total duration:** enter the length of your video, and the timings are stretched or squeezed to fill it, with longer lines getting more time. The minimum and maximum duration don't apply in this case.

Lines longer than 42 characters are split into subtitles of up to two lines each.

In "Text with timestamps" mode, Start time and Gap aren't used, because the times come from your text.

## What it does and doesn't do

The converter turns text into a subtitle file. It doesn't change your words.

**What it does:**

- Turns plain text into SRT subtitles, one line or one sentence per subtitle.
- Times each subtitle by reading speed, or keeps the timestamps already in your text.
- Splits long lines into subtitles of up to two lines.
- Saves as SRT or VTT.
- Detects the encoding of your .txt file, so Cyrillic, Arabic or Chinese text reads correctly, and saves the result as UTF-8. Tick "Add BOM (old players)" if your player or TV needs a BOM.
- Runs in your browser: your text never leaves your device, and there's no sign-up.

**What it doesn't do:**

- It doesn't listen to audio or video. It can't transcribe speech or line the text up with it.
- It doesn't translate the text.
- It doesn't burn subtitles into a video. It creates a separate subtitle file that you load in your player or video editor.

## Matching the subtitles to your video

Timings from reading speed are a starting point, and they rarely match the speech exactly. Here's how to get closer.

1. **Set the start time** (in "Plain text" mode) to the moment the first line is spoken, so the whole file starts in the right place.
2. **Use timestamps if you have them.** A transcript with times, from YouTube or a transcription tool, gives far better timings than reading speed.
3. **Fix the rest in the file.** If every subtitle is early or late by the same amount, use [Shift subtitles](/shift-subtitles). If the gap grows towards the end, set the correct time for two lines with [Fix subtitle drift](/fix-subtitle-drift).

## Related tools

- [TXT to VTT](/txt-to-vtt): the same tool with WebVTT as the output.
- [SRT to TXT](/srt-to-txt): turn subtitles back into plain text.
- [Shift subtitles](/shift-subtitles): move every subtitle earlier or later.
- [Fix subtitle drift](/fix-subtitle-drift): re-time subtitles that slowly go out of sync.
- [SRT to VTT converter](/srt-to-vtt): turn SRT subtitles into VTT for web video players.
- Guide: [Subtitles out of sync: shift vs drift](/guides/subtitles-out-of-sync).

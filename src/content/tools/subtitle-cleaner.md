---
title: "Subtitle Cleaner: Remove SDH and Tags | SubtitleFixer"
description: "Clean SRT, VTT and ASS subtitles: remove hearing-impaired text in brackets, speaker names, music notes and tags. Timing kept. Free, no upload."
h1: "Subtitle Cleaner"
slug: "subtitle-cleaner"
answer: "To clean subtitles, drop your SRT, VTT or ASS file on this page, tick what to remove (hearing-impaired descriptions, speaker names, music lines or formatting tags), and download the cleaned file: SubtitleFixer keeps the timing and runs in your browser without uploading anything."
faq:
  - q: "How do I remove hearing-impaired (SDH) text from subtitles?"
    a: "Drop the file on this page and tick Text in brackets and Text in parentheses. Descriptions like [door slams] or (laughing) are removed. Subtitles left empty are deleted and the rest are renumbered."
  - q: "What can I remove?"
    a: "Text in [square brackets], text in (parentheses), speaker names at the start of a line in capital letters (like JOHN:), lines that are only music notes (♪ or #), and formatting tags such as <i>, <font> or ASS style codes. Each is a separate option, and all of them start off."
  - q: "Will it remove things I want to keep?"
    a: "It can. Parentheses are sometimes used for normal dialogue, and some names aren't in capitals. Check the preview, which shows each change, before you download."
  - q: "Does it change the timing?"
    a: "No. Start and end times stay the same. Only text is removed, and subtitles that end up empty are deleted."
  - q: "Which formats work?"
    a: "SRT, VTT and ASS. The file keeps its format. ASS headers and styles stay; only the dialogue text changes."
  - q: "Can I remove text in other languages?"
    a: "The options work on brackets, parentheses, symbols and tags, so they work in any language. The speaker-name option only finds names written in capital Latin letters."
  - q: "Is my file uploaded?"
    a: "No. SubtitleFixer cleans your subtitles inside your browser, and your file never leaves your device. There is no sign-up."
related: ["/srt-to-txt", "/ass-to-srt", "/vtt-to-srt", "/shift-subtitles", "/fix-subtitle-encoding", "/merge-subtitles"]
---

Free subtitle cleaner that runs in your browser: your files never leave your device, and there is no sign-up.

## How to clean subtitles in 3 steps

1. **Add your subtitle files.** Drag one or more .srt, .vtt or .ass files onto the page.
2. **Tick what to remove.** Brackets, parentheses, speaker names, music lines, formatting tags. The preview shows what will change.
3. **Download.** The cleaned file keeps its format; several files download as one zip.

## Example: before and after

Before:

```srt
1
00:00:01,200 --> 00:00:03,800
[DOOR SLAMS]

2
00:00:04,100 --> 00:00:07,450
JOHN: Where were you?
(sighs) I waited all night.

3
00:00:08,000 --> 00:00:10,000
♪ ♪
```

After (brackets, parentheses, speaker names and music lines removed):

```srt
1
00:00:04,100 --> 00:00:07,450
Where were you?
I waited all night.
```

Subtitles 1 and 3 had nothing left, so they were deleted and the file was renumbered.

## What it can and can't do

**It can:**

- Remove text in [brackets] and (parentheses), such as sound descriptions for the hearing impaired.
- Remove speaker names in capitals at the start of a line.
- Remove lines that are only music notes (`♪`, `♫` or `#`).
- Remove formatting tags and ASS style codes.
- Delete subtitles left empty and renumber SRT files.
- Keep every start and end time.

**It can't:**

- Tell sound descriptions from dialogue by meaning. It works on brackets, capitals and symbols.
- Remove ads or credit lines automatically.
- Fix spelling or timing.

## Related tools

- [SRT to TXT](/srt-to-txt): get only the text, without timings.
- [ASS to SRT converter](/ass-to-srt): remove ASS styling and get SRT.
- [VTT to SRT converter](/vtt-to-srt): removes VTT tags while converting.
- [Shift subtitles](/shift-subtitles): fix a delay.
- [Fix subtitle encoding](/fix-subtitle-encoding): for garbled characters.

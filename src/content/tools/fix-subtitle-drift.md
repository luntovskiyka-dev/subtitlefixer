---
title: "Fix subtitle drift — subtitlefixer"
description: "Fix subtitle drift with two cue times or a frame-rate preset. The SRT, VTT, or ASS file stays on your device."
h1: "Fix Subtitle Drift (Two-Point Sync)"
answer: "Two-point sync retimes every SRT, VTT, or ASS cue from two times you type, in your browser, and the file stays on your device."
steps:
  - "Add an SRT, VTT, ASS, or SSA file. Two-point sync uses one file. Frame-rate presets can use several."
  - "Pick two cues and type each correct time as hh:mm:ss,mmm, or choose a subtitle fps to video fps preset."
  - "Download the file. One file downloads as itself. Two or more download as one zip."
exampleBefore: |
  1
  00:00:00,000 --> 00:00:02,000
  Is anyone there?

  2
  00:00:05,000 --> 00:00:07,000
  We should have left an hour ago.

  3
  00:00:10,000 --> 00:00:12,000
  It's over. Let's go home.
exampleAfter: |
  1
  00:00:00,000 --> 00:00:02,200
  Is anyone there?

  2
  00:00:05,500 --> 00:00:07,700
  We should have left an hour ago.

  3
  00:00:11,000 --> 00:00:13,200
  It's over. Let's go home.
does:
  - "Retimes every cue from two correct times you type, or by a subtitle fps to video fps preset"
  - "Keeps the dialogue text and the input format: SRT, VTT, ASS, or SSA"
  - "Drops a cue that ends at or before zero and sets a negative start to zero"
  - "Runs in the browser, so the file stays on your device"
doesnt:
  - "Does not fix a sudden jump that is not a steady drift through the file"
  - "Does not run two-point sync on more than one file at a time"
  - "Does not convert SRT, VTT, and ASS into each other"
  - "Does not translate or rewrite the dialogue"
  - "Does not upload the file"
faq:
  - question: "Why do subtitles start in sync and then drift further off?"
    answer: "The file was timed for a video that plays at a slightly different speed, often 25 fps against 23.976 fps. The gap is small at the first line and much larger by the end. Two-point sync stretches the whole timeline so both lines you correct land on the times you type."
  - question: "How do I set the two points?"
    answer: "Load one file. The first and last cues are selected. Pick any two different cues, then type the time each one is actually spoken, as hh:mm:ss,mmm. Every other cue start and end follows the same straight line between those two times."
  - question: "Which way should the frame-rate preset go?"
    answer: "The label is subtitle fps to video fps. If the lines fall further behind the speech, try 23.976 to 25. If they get further ahead, try 25 to 23.976. The same pairs exist for 24 and 25, and for 23.976 and 24. 23.976 is the fraction 24000/1001. If you do not know the frame rates, use two-point sync."
  - question: "Can I fix several files at once?"
    answer: "Frame-rate presets can convert several files, and two or more download as one zip. Two-point sync asks for a single file and does not download when more than one file is loaded."
  - question: "Does this change the words, or drop lines?"
    answer: "The words stay as they are, and each line's length is scaled with the timeline. A cue whose end lands at or before zero is removed. A cue that only starts before zero keeps its end and starts at zero. The page says how many lines were removed or trimmed."
  - question: "Does my subtitle file get uploaded?"
    answer: "No. The correction runs in your browser, and the file stays on your device."
related:
  - shift-subtitles
  - fix-subtitle-encoding
  - srt-to-vtt
  - vtt-to-srt
  - ass-to-srt
---

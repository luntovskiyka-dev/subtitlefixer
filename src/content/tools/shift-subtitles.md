---
title: "Shift subtitles — SubtitleFixer"
description: "Shift SRT, VTT, and ASS subtitle timings by milliseconds in your browser. The file stays on your device."
h1: "Shift subtitles"
answer: "Shift subtitles moves SRT, VTT, and ASS timings by a given number of milliseconds in your browser."
steps:
  - "Add an SRT, VTT, or ASS file."
  - "Enter the offset in milliseconds. Use a negative number to move cues earlier."
  - "Download the file with the updated timings."
exampleBefore: |
  1
  00:00:12,400 --> 00:00:15,120
  We should have left an hour ago.

  2
  00:01:02,040 --> 00:01:05,800
  The train does not wait.
exampleAfter: |
  1
  00:00:13,900 --> 00:00:16,620
  We should have left an hour ago.

  2
  00:01:03,540 --> 00:01:07,300
  The train does not wait.
does:
  - "Moves the start and end of every cue by the same number of milliseconds"
  - "Keeps the subtitle text unchanged"
  - "Works on SRT, VTT, and ASS in the browser"
doesnt:
  - "Does not fix drift that increases over the length of the video"
  - "Does not translate or rewrite dialogue"
  - "Does not upload the file"
faq:
  - question: "How do I shift subtitles that show up too early or too late?"
    answer: "Add an SRT, VTT, or ASS file and enter an offset in milliseconds. A positive number moves every cue later. A negative number moves every cue earlier."
  - question: "How many milliseconds are in one second?"
    answer: "One second is 1000 milliseconds. If the dialogue starts two seconds after the subtitle, enter 2000. If the subtitle is half a second late, enter -500."
  - question: "Which subtitle formats can I shift?"
    answer: "SRT, VTT, and ASS, including SSA. The same offset is applied to each cue's start and end."
  - question: "Does shifting change the words?"
    answer: "No. Only the timestamps move. The text of each cue stays as it is."
  - question: "Can one offset fix subtitles that drift further out of sync?"
    answer: "No. One offset moves every cue by the same amount. That corrects a constant delay, not a drift that grows toward the end of the video."
  - question: "Do my subtitle files get uploaded?"
    answer: "No. The shift runs in your browser, and the file stays on your device."
related:
  - fix-subtitle-encoding
  - srt-to-vtt
  - vtt-to-srt
  - ass-to-srt
---

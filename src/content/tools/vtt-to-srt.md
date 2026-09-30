---
title: "VTT to SRT — subtitlefixer"
description: "Convert VTT to SRT in your browser. The file stays on the device."
h1: "VTT to SRT"
answer: "VTT to SRT turns WebVTT cues into SubRip in your browser, and the file stays on the device."
steps:
  - "Add one or more VTT files."
  - "Convert the cues to SRT."
  - "Download the converted file."
exampleBefore: |
  WEBVTT

  00:00:12.400 --> 00:00:15.120
  We should have left an hour ago.
exampleAfter: |
  1
  00:00:12,400 --> 00:00:15,120
  We should have left an hour ago.
does:
  - "Converts VTT to SRT"
  - "Keeps timings and text"
  - "Accepts several files"
doesnt:
  - "Does not shift timings"
  - "Does not translate"
  - "Does not upload"
faq:
  - question: "Why does a player want SRT instead of VTT?"
    answer: "Many media players, TVs, and editors expect SubRip (SRT). WebVTT is the format browsers use for HTML5 video. Converting to SRT lets those players open the same cues."
  - question: "Does converting VTT to SRT change the words?"
    answer: "No. Each cue keeps the same text. Only the file format changes."
  - question: "Can I convert several VTT files and download them together?"
    answer: "Yes. Add every VTT file at once. One converted file downloads as SRT. Two or more download as a single subtitles.zip."
  - question: "Do my subtitle files get uploaded?"
    answer: "No. The conversion runs in your browser, and the file stays on your device."
  - question: "Will the timestamps stay the same?"
    answer: "Yes. Each cue keeps its start and end. This page does not shift timings."
  - question: "What if one cue in the file is broken?"
    answer: "The cues that parsed are still converted and downloaded. The broken block is listed on the page."
related:
  - srt-to-vtt
  - shift-subtitles
  - fix-subtitle-encoding
  - ass-to-srt
---

---
title: "SRT to VTT — SubtitleFixer"
description: "Convert SRT to VTT in your browser. The file stays on the device."
h1: "SRT to VTT"
answer: "SRT to VTT turns SubRip cues into WebVTT in your browser, and the file stays on the device."
steps:
  - "Add one or more SRT files."
  - "Convert the cues to VTT."
  - "Download the converted file."
exampleBefore: |
  1
  00:00:12,400 --> 00:00:15,120
  We should have left an hour ago.
exampleAfter: |
  WEBVTT

  00:00:12.400 --> 00:00:15.120
  We should have left an hour ago.
does:
  - "Converts SRT to VTT"
  - "Keeps timings and text"
  - "Accepts several files"
doesnt:
  - "Does not shift timings"
  - "Does not translate"
  - "Does not upload"
faq:
  - question: "Why does a browser or HTML5 player want VTT?"
    answer: "The HTML5 video track element reads WebVTT. Many editors and players store dialogue as SRT. Converting to VTT lets that player load the same cues."
  - question: "Does converting SRT to VTT change the words?"
    answer: "No. Each cue keeps the same text. Only the file format changes."
  - question: "Can I convert several SRT files and download them together?"
    answer: "Yes. Add every SRT file at once. One converted file downloads as VTT. Two or more download as a single subtitles.zip."
  - question: "Do my subtitle files get uploaded?"
    answer: "No. The conversion runs in your browser, and the file stays on your device."
  - question: "Will the timestamps stay the same?"
    answer: "Yes. Each cue keeps its start and end. This page does not shift timings."
  - question: "What if one cue in the file is broken?"
    answer: "The cues that parsed are still converted and downloaded. The broken block is listed on the page."
related:
  - vtt-to-srt
  - shift-subtitles
  - fix-subtitle-encoding
  - ass-to-srt
---

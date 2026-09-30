---
title: "SRT vs VTT vs ASS — SubtitleFixer"
description: "SRT is the usual subtitle file, VTT is the web video format, and ASS carries styles and positions."
h1: "SRT vs VTT vs ASS"
---

SRT, VTT, and ASS each store a line of dialogue and the time it should appear. They are still different files, and a player often accepts only one of them.

SRT is the usual subtitle file. Most players, editors, and TVs open it. Each cue has a number, a start time, an end time, and the text.

VTT is the web video format. A browser reads it as a text track on an HTML5 video. The cues are the same idea as SRT, written so that player can load them.

ASS carries styles and positions. The file can set fonts, colors, and where a line sits on the screen. SSA is the older form of the same format. The ASS to SRT tool accepts both.

[SRT to VTT](/srt-to-vtt) turns an SRT file into VTT. [VTT to SRT](/vtt-to-srt) turns VTT into SRT. [ASS to SRT](/ass-to-srt) turns ASS and SSA into SRT and removes the style tags. Each conversion runs in the browser, and the file stays on the device.

A format change does not move the cues in time. If every cue is late or early by the same amount, that is a constant delay, not a new file type. [Subtitles out of sync: shift or drift](/guides/subtitles-out-of-sync) explains that difference, including drift, which this site does not fix.

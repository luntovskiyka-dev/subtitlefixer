---
title: "Subtitles out of sync: shift or drift — SubtitleFixer"
description: "A constant delay is the same offset on every cue. Drift grows toward the end of the video and needs more than one offset."
h1: "Subtitles out of sync: shift or drift"
---

Subtitles that disagree with the picture are either a constant delay or drift. The two problems look alike for a few lines, and they do not share one fix.

A constant delay means every cue is late or early by the same amount. The gap at the start of the video is the gap at the end. One millisecond offset moves every cue together and keeps that gap from growing.

[Shift subtitles](/shift-subtitles) applies that offset to an SRT, VTT, or ASS file in the browser. A positive number moves every cue later. A negative number moves every cue earlier. The text of each cue stays as it is.

Drift is the other case. The error grows toward the end of the video. A cue that is close at the beginning can be seconds off by the last scene. One offset cannot close a gap that keeps changing. Fixing drift needs more than one offset.

This site does not fix drift. The shift tool only moves every cue by the same number of milliseconds. It does not stretch the timings to follow a gap that grows.

Choosing a file format is a separate question. [SRT vs VTT vs ASS](/guides/srt-vs-vtt-vs-ass) compares the three files and links to the converters.

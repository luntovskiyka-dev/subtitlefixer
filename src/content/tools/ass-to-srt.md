---
title: "ASS to SRT — SubtitleFixer"
description: "Convert ASS and SSA subtitles to SRT in your browser. The file stays on the device."
h1: "ASS to SRT"
answer: "ASS to SRT turns ASS and SSA cues into SubRip in your browser, and the file stays on the device."
steps:
  - "Add one or more ASS or SSA files."
  - "Convert them to SRT."
  - "Download the SRT file."
exampleBefore: |
  Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\k20}Hello\Nthere
exampleAfter: |
  1
  00:00:01,000 --> 00:00:03,500
  Hello
  there
does:
  - "Converts ASS and SSA to SRT"
  - "Removes override tags"
  - "Collapses duplicate layers"
doesnt:
  - "Does not keep fonts or positions"
  - "Does not translate"
  - "Does not upload"
faq:
  - question: "What happens to ASS override tags?"
    answer: "Tags such as {\\k20} and {\\an8} are removed. The spoken text stays. Fonts, colors, and positions are not kept in the SRT file."
  - question: "How are ASS line breaks converted?"
    answer: "A \\N in an ASS line becomes a real line break inside the SRT cue. A hard space (\\h) becomes a normal space."
  - question: "What happens when Dialogue lines share the same start and end?"
    answer: "They are one group. If the text is the same, one cue is kept. If the lines differ, the longest text is kept. A karaoke line that grows replaces the shorter fragment. When two different texts have the same length, the last one in the group is kept."
  - question: "Does this convert SSA as well as ASS?"
    answer: "Yes. SSA and ASS Dialogue lines are converted the same way. Add a file that ends in .ass or .ssa."
  - question: "Do my subtitle files get uploaded?"
    answer: "No. The conversion runs in your browser, and the file stays on your device."
  - question: "What if one Dialogue line is broken?"
    answer: "The cues that parsed are still converted and downloaded. The broken line is listed on the page."
related:
  - srt-to-vtt
  - vtt-to-srt
  - shift-subtitles
  - fix-subtitle-encoding
---

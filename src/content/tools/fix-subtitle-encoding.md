---
title: "Fix subtitle encoding — SubtitleFixer"
description: "Repair a garbled subtitle file and save it as UTF-8 in your browser. The file stays on your device."
h1: "Fix subtitle encoding"
answer: "Fix subtitle encoding reads the file in your browser, lets you compare other readings, and saves UTF-8 while the file stays on your device."
steps:
  - "Add a subtitle file."
  - "Compare the detected reading with the other previews and pick a language if the detected one is wrong."
  - "Download the UTF-8 file."
exampleBefore: |
  CafÃ© â€” table for two.
exampleAfter: |
  Café — table for two.
does:
  - "Detects the encoding of the subtitle file"
  - "Shows other readings so you can compare them"
  - "Writes the file as UTF-8"
doesnt:
  - "Does not translate the dialogue"
  - "Does not change timings"
  - "Does not upload the file"
faq:
  - question: "What is mojibake in a subtitle file?"
    answer: "Mojibake is text that was saved in one encoding and opened in another, so letters turn into the wrong characters. The words are still in the file. This tool reads the original bytes again and writes them as UTF-8."
  - question: "What is UTF-8?"
    answer: "UTF-8 is a text encoding that can store letters from many languages in one file. Players and editors treat it as the usual encoding for subtitles, so the repaired file is saved as UTF-8."
  - question: "Should I include a UTF-8 BOM?"
    answer: "A BOM is a short marker at the start of the file that tells some older players the text is UTF-8. Leave it off unless a player still shows the wrong letters. The checkbox adds that marker to the downloaded UTF-8 file."
  - question: "Which languages can this read?"
    answer: "The language list is UTF-8, Windows-1251 (Cyrillic), Windows-1252 (Western European), Windows-1256 (Arabic), ISO-8859-7 (Greek), ISO-8859-9 (Turkish), Shift_JIS (Japanese), and GB18030 (Chinese)."
  - question: "Do my subtitle files get uploaded?"
    answer: "No. Encoding repair runs in your browser, and the file stays on your device."
  - question: "Will this move cues that are out of sync?"
    answer: "No. The words are re-read in a different encoding, and the timestamps stay as they are. Use Shift subtitles when the dialogue starts too early or too late."
related:
  - shift-subtitles
  - srt-to-vtt
  - vtt-to-srt
  - ass-to-srt
---

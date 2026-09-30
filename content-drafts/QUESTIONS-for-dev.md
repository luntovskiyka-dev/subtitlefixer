# Content questions still open (SubtitleFixer launch copy)

Everything asked earlier is resolved in PLAN.md «Поведение инструментов», and the drafts follow it. Only the points below are still open.

## Plan wording
1. /ass-to-srt input encoding: the drafts say the ASS converter auto-detects the input encoding, always saves UTF-8 and has the BOM checkbox, as instructed on 30 Sep. But in PLAN.md that rule is written only under `/srt-to-vtt`, `/vtt-to-srt`. Please add it to the `/ass-to-srt` block too, or tell the content writer to take it out of the ASS page (the "does" list and the FAQ "My ASS subtitles show garbled characters").

## Optional
2. /fix-subtitle-encoding: should Windows-1255 (Hebrew), Big5 or EUC-KR be supported? They aren't mentioned in the copy; Hebrew is listed as ISO-8859-8 only.

## Spot-check before publishing (not covered by the plan)
- VLC: G/H keys (50 ms steps), Tools → Codec Information, and the Default encoding setting.
- Aegisub: File → Export Subtitles.
- The FFmpeg commands on the pages.
- Jellyfin subtitle offset (confirmed only from jellyfin-web on GitHub) and the DJI .srt line (third-party sources).

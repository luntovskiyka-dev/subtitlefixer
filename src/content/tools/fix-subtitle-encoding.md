---
title: "SRT Encoding Fix: Convert Subtitles to UTF-8 | SubtitleFixer"
description: "Subtitles showing Ã© or gibberish? Detect the SRT encoding, preview the fix and convert subtitles to UTF-8. SRT, VTT, ASS. Free, no upload."
h1: "Fix SRT Encoding: Convert Subtitles to UTF-8"
slug: "fix-subtitle-encoding"
answer: "To fix subtitle encoding, add your file and SubtitleFixer detects how the text was saved, shows a few readable versions side by side, and saves the one you pick as UTF-8, all in your browser, so your file never leaves your device."
faq:
  - q: "Why are my subtitles showing weird characters like Ã© or â€™?"
    a: "The file was saved in one encoding and is being read in another. For example, Ã© is the letter é saved as UTF-8 but read as Western (Windows-1252) text. Choosing the right reading and saving the file as UTF-8 fixes it."
  - q: "Why do Arabic, Persian, Cyrillic or Hebrew subtitles turn into gibberish?"
    a: "These subtitles are often saved in an older, language-specific encoding, such as Windows-1256 for Arabic and Persian or Windows-1251 for Cyrillic. A player that expects a different encoding shows text like ÇáÓáÇã or Ïðèâåò instead. Pick your language, choose the preview that reads correctly, and save it as UTF-8."
  - q: "What encoding does an SRT file use?"
    a: "SRT has no fixed encoding, and the file doesn't say which one it uses. Newer files are usually UTF-8, but many older ones use a local encoding such as Windows-1251 for Cyrillic or Windows-1256 for Arabic. When a player guesses wrong, you see garbled text. SubtitleFixer detects the encoding for you and shows previews, so you can check it."
  - q: "How do I convert subtitles to UTF-8?"
    a: "Add the SRT, VTT, ASS, SSA, text-based SUB or TXT file, choose the preview where the text reads correctly, and download it. SubtitleFixer saves the result as UTF-8, without a BOM unless you tick \"Add BOM (old players)\"."
  - q: "What is mojibake, and can it be reversed?"
    a: "Mojibake is garbled text such as Ã© instead of é or Ð¿Ñ€Ð¸ instead of при, which happens when UTF-8 text is read with the wrong encoding and saved again. It can usually be reversed, and SubtitleFixer offers the repaired text as a separate option in the preview. It can't be reversed if the characters were already replaced by question marks."
  - q: "Should I save my subtitles with a UTF-8 BOM?"
    a: "Only if your player or TV needs it. Most modern players read UTF-8 without a BOM, so SubtitleFixer leaves it off by default, but some older players and TVs only recognise UTF-8 when the BOM is there. If the file still looks garbled on your device, save it again with \"Add BOM (old players)\" ticked."
  - q: "The automatic detection picked the wrong encoding. Can I choose another?"
    a: "Yes. SubtitleFixer shows 3–4 possible readings of your file side by side, so you can pick the one that looks right. Choosing your subtitle language also helps it make a better guess."
  - q: "Is my file uploaded, and does fixing the encoding change the timing?"
    a: "No to both. SubtitleFixer fixes the encoding inside your browser, so your file never leaves your device. Only the characters change (plus the optional BOM); the timings, line breaks and everything else stay exactly as they were."
related: ["/shift-subtitles", "/fix-subtitle-drift", "/srt-to-vtt", "/vtt-to-srt", "/ass-to-srt"]
---

## How to fix subtitle encoding in 3 steps

You can fix garbled subtitles in three steps, and your file stays on your device the whole time.

1. **Add your subtitle file.** Drag an .srt, .vtt, .ass, .ssa, text-based .sub or .txt file onto the page, or click to choose it.
2. **Pick the version that reads correctly.** SubtitleFixer detects the encoding and shows 3–4 previews side by side. If none looks right, choose your subtitle language. If you see patterns like `Ã©` or `Ð¿Ñ€Ð¸`, pick the repaired double-encoding version.
3. **Download it as UTF-8.** The BOM is off by default; tick "Add BOM (old players)" only if your device needs it (see below). One file downloads as it is; several files download together as one zip.

## Example: before and after

This Russian SRT file was saved as Windows-1251 but read as Western text, so every letter turned into a Latin symbol.

Before:

```srt
1
00:00:03,200 --> 00:00:05,600
Ïðèâåò! Êàê äåëà?
```

After (read as Windows-1251, saved as UTF-8):

```srt
1
00:00:03,200 --> 00:00:05,600
Привет! Как дела?
```

This French SRT file was double-encoded: it was already UTF-8, but it was read as Windows-1252 and saved again.

Before:

```srt
14
00:01:12,040 --> 00:01:14,500
Le cafÃ© est trÃ¨s bon.
```

After (double encoding repaired):

```srt
14
00:01:12,040 --> 00:01:14,500
Le café est très bon.
```

In both examples only the characters changed. The numbers, timestamps and line breaks are exactly the same.

## What it does and doesn't do

This tool changes how the text in your subtitle file is stored. It does not change the timing or the words.

**What it does:**

- Detects the encoding automatically and shows 3–4 possible readings side by side.
- Lets you choose your subtitle language to get a better guess.
- Accepts SRT, VTT, ASS, SSA, text-based SUB and TXT files.
- Reads common older encodings, including Windows-1251, Windows-1252, Windows-1254, Windows-1256, the ISO-8859 family (including ISO-8859-8 for Hebrew and ISO-8859-9 for Turkish), Shift_JIS and GB18030.
- Repairs double-encoded text (mojibake), such as `Ã©` → `é`, as a separate option in the preview.
- Saves the result as UTF-8, with an optional BOM, and changes nothing else in the file.
- Runs in your browser: your file never leaves your device, and there's no sign-up.

**What it doesn't do:**

- It can't bring back letters that were already replaced by `?` or `�` in the file. That information is gone, so you need a new copy of the subtitles.
- It doesn't fix boxes (□) that appear because your device has no font for that language. That's a player or font problem, not a file problem.
- It doesn't change timings. For that, use [Shift subtitles](/shift-subtitles) or [Fix subtitle drift](/fix-subtitle-drift).
- It doesn't translate subtitles.

## Why subtitles show weird characters

Subtitles show weird characters when the file was saved in one encoding and your player reads it in another.

An encoding is the rule that turns letters into bytes. UTF-8 covers every language, but many subtitle files, especially older ones, use a local encoding such as Windows-1251 for Cyrillic or Windows-1256 for Arabic. The bytes are fine; they are just being read with the wrong rule. Reading the file with the right encoding and saving it as UTF-8 fixes it for good.

## Mojibake: when text is encoded twice

Mojibake from double encoding happens when a UTF-8 file is read as Western text (Windows-1252 or Latin-1) and then saved again.

Each accented or non-Latin letter becomes two or three odd characters, often starting with `Ã`, `Â`, `â` or `Ð`. SubtitleFixer looks for these patterns and offers a repaired version as a separate option in the preview.

| You see | It should be | Typical language |
|---|---|---|
| `Ã©` | `é` | French, Spanish, Portuguese |
| `Ã¨` | `è` | French, Italian |
| `Ã¼` | `ü` | German, Turkish |
| `ÃŸ` | `ß` | German |
| `â€™` | `’` (curly apostrophe) | English and many others |
| `Ð¿Ñ€Ð¸` | `при` | Russian |

The repair works because the original bytes are still there, just misread. It can't work if the characters were replaced by `?` along the way.

## Encodings by language

The right encoding usually depends on the language of the subtitles.

| Language | Encodings older files often use |
|---|---|
| Russian, Ukrainian, Bulgarian, Serbian (Cyrillic) | Windows-1251 |
| Arabic, Persian | Windows-1256 |
| French, German, Spanish, Portuguese and other Western European languages | Windows-1252, ISO-8859-1 |
| Greek | ISO-8859-7 |
| Turkish | Windows-1254, ISO-8859-9 |
| Hebrew | ISO-8859-8 |
| Japanese | Shift_JIS |
| Chinese (Simplified) | GB18030 (which also covers GBK and GB2312) |

You don't need to know the encoding yourself. Choose your language, compare the previews, and keep the one that reads correctly.

## UTF-8 with or without BOM

A BOM (byte order mark) is an invisible marker at the very start of a file that says "this file is UTF-8".

- **Without BOM:** fine for most modern players, TVs, websites and video editors.
- **With BOM:** helps some older players and TVs that otherwise guess the wrong encoding.

SubtitleFixer saves without a BOM by default. Tick **Add BOM (old players)** if your device still shows garbled text after the fix. A BOM doesn't change the text or the timings.

## Related tools

- [Shift subtitles](/shift-subtitles): for subtitles that appear too early or too late by the same amount.
- [Fix subtitle drift](/fix-subtitle-drift): for subtitles that get further out of sync over time.
- [SRT to VTT converter](/srt-to-vtt): turn SRT subtitles into VTT for web video players.
- [VTT to SRT converter](/vtt-to-srt): turn VTT captions into an SRT file.
- [ASS to SRT converter](/ass-to-srt): turn styled ASS subtitles into a plain SRT file.

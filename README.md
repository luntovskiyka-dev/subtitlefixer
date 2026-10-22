# SubtitleFixer

Free subtitle tools that run in your browser — [subtitlefixer.com](https://subtitlefixer.com). Your files never leave your device.

![SubtitleFixer tool page](docs/screenshot.png)

## Tools

- [Shift Subtitles Online](https://subtitlefixer.com/shift-subtitles)
- [Fix Subtitle Drift (Two-Point Sync)](https://subtitlefixer.com/fix-subtitle-drift)
- [Fix SRT Encoding: Convert Subtitles to UTF-8](https://subtitlefixer.com/fix-subtitle-encoding)
- [SRT Editor Online](https://subtitlefixer.com/srt-editor)
- [SRT to VTT Converter](https://subtitlefixer.com/srt-to-vtt)
- [VTT to SRT Converter](https://subtitlefixer.com/vtt-to-srt)
- [ASS to SRT Converter](https://subtitlefixer.com/ass-to-srt)
- [SRT to TXT Converter](https://subtitlefixer.com/srt-to-txt)
- [VTT to TXT Converter](https://subtitlefixer.com/vtt-to-txt)
- [SRT to Word Converter](https://subtitlefixer.com/srt-to-word)
- [TXT to SRT Converter](https://subtitlefixer.com/txt-to-srt)
- [SUB to SRT Converter](https://subtitlefixer.com/sub-to-srt)
- [SBV to SRT Converter](https://subtitlefixer.com/sbv-to-srt)
- [SMI to SRT Converter](https://subtitlefixer.com/smi-to-srt)
- [Merge Subtitles: Dual Subtitles in One File](https://subtitlefixer.com/merge-subtitles)

## Guides

- [Subtitles Out of Sync? How to Tell Shift from Drift and Fix It](https://subtitlefixer.com/guides/subtitles-out-of-sync)
- [SRT vs VTT vs ASS: Which Subtitle Format Should You Use?](https://subtitlefixer.com/guides/srt-vs-vtt-vs-ass)

## Privacy

Subtitle files are read in the browser (`file.arrayBuffer()`) and saved with a local download (`URL.createObjectURL`). The app does not send file contents anywhere; the Cloudflare Worker only serves the static site. To check, open DevTools → Network and process a file.

## Tech

Astro and Tailwind CSS. Static build, deployed on Cloudflare.

```bash
npm install
npm run dev
npm run build
```

## Contributing

Issues and pull requests are welcome. For a bug, attach a sample subtitle file.

## License

[MIT](LICENSE)

Not affiliated with other projects named "subtitle fixer".

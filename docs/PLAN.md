# subtitlefixer.com — план действий (задачи для Claude)

Стек: Astro + TypeScript strict + Tailwind, static output, Cloudflare Pages. Вся обработка файлов в браузере, без бэкенда.
Палитра: direction B (cream, indigo, coral, teal, mint, lilac; см. docs/B-tokens.md, tokens.css / tailwind.tokens.js).

## Этап 0 — Подготовка (вручную)
- Купить subtitlefixer.com в Cloudflare Registrar.
- Создать репо `subtitlefixer` на GitHub.

## Этап 1 — Каркас
1. **AGENTS.md** — правила: только статика и client-side; TS strict; тест на каждую функцию ядра; Lighthouse ≥ 95; ни одного сетевого запроса с файлом пользователя; палитра только через токены.
2. **Astro-проект** — TS, Tailwind, `output: static`, layout (хедер, футер со ссылками на инструменты, заглушка доната). ✅ `npm run build` ок, Lighthouse ≥ 95.
3. **Компонент `<Seo>`** — title, description, canonical, OG, hreflang-заготовка, JSON-LD `WebApplication` (price 0). ✅ проходит Rich Results Test.
4. **Шаблон `ToolPage`** — H1 под запрос → инструмент → ответ в 1 фразу → 3 шага → пример до/после → «что умеет / чего нет» → FAQ 5–8 (`FAQPage` JSON-LD) → похожие инструменты. ✅ страница создаётся из одного файла `src/content/tools/*.md`.

## Этап 1.5 — Визуальная база
5. **Токены** — подключить `tokens.css` и `tailwind.tokens.js` (direction B, see docs/B-tokens.md), светлая + тёмная тема через `prefers-color-scheme`. ✅ в коде нет захардкоженных цветов.
6. **Шрифты** — self-hosted @fontsource (latin): Bricolage Grotesque 800, Figtree variable, DM Mono 500; ✅ ≤ 3 запроса шрифтов, все same-origin, ≤ 60 KB, CLS < 0.02.
7. **Базовые компоненты** — Button (primary/secondary/ghost), Dropzone (пунктир edge, состояния hover/drag/error), Badge, Card, Input (число мс, select кодировки), SubtitlePreview (моно, тайминги muted, текст ink), маркер-выделение (coral accent, текст ink) для ключевого слова в H1. ✅ страница `/_styleguide` со всеми компонентами.
8. **Логотип-заготовка + favicon** — текстовый wordmark «subtitle**fixer**» + простой знак (строка субтитра / скобки таймкода), SVG favicon + apple-touch-icon. ✅ favicon во всех размерах.

## Этап 2 — Ядро (без UI)
9. **`src/lib/subs`** — парсинг/сериализация SRT, VTT, ASS/SSA → `Cue { start, end, text, style? }` (subsrt-ts / ass-compiler или свой). Vitest + реальные и битые файлы. ✅ SRT→VTT→SRT без потерь таймингов.
10. **Кодировки** — детект (`jschardet`) + `TextDecoder` (cp1251, cp1252, cp1256, iso-8859-x, shift_jis, gb18030…), выход UTF-8 с/без BOM. ✅ тесты на кириллице, арабском, турецком, греческом.
11. **Загрузка/выгрузка** — drag&drop, несколько файлов, скачивание одним файлом или zip (`fflate`). ✅ в Network нет запросов с файлом.

## Этап 3 — Первые 4 инструмента
12. `/shift-subtitles` — сдвиг ±мс, опционально с N-го cue; SRT/VTT/ASS.
13. `/fix-subtitle-encoding` — автодетект, превью 3–4 вариантов, выбор языка, выход UTF-8.
14. `/srt-to-vtt` + `/vtt-to-srt` — одна логика, две страницы, пакетно.
15. `/ass-to-srt` — удаление тегов, `\N`, схлопывание дублей слоёв.
15a. `/fix-subtitle-drift` (H1 «Fix Subtitle Drift (Two-Point Sync)») — синхронизация по двум точкам: пользователь задаёт для первой и последней (или любых двух) реплик правильное время → линейная коррекция `t' = a·t + b` для всех cue (лечит дрейф и fps 23.976↔25). Плюс пресеты fps 23.976↔25, 24↔25, 23.976↔24 и H2-раздел «Subtitle frame rate converter». Отдельная страница, не часть `/shift-subtitles`. ✅ тесты: дрейф 25→23.976 исправляется до ±50 мс на всём файле.
15b. В `/fix-subtitle-encoding` — починка двойной кодировки (mojibake: `Ã©`→`é`, `Ð¿Ñ€Ð¸`→`при`): детект типичных паттернов UTF-8, прочитанного как cp1252/latin1, и обратное преобразование, отдельной кнопкой/вариантом в превью. ✅ тесты на французском, немецком, русском.
✅ для каждого: работает на 5 реальных файлах, собран из `ToolPage`, контент и FAQ написаны.

### Поведение инструментов (решения для кода и текстов)
Общие:
- Один результат → скачивается файлом, несколько → один zip. Формат на выходе = формат на входе (кроме конвертеров).
- FAQ в `.md` содержит markdown; в `FAQPage` JSON-LD отдавать чистый plain text: при сборке убрать ссылки (текст оставить), обратные кавычки, `*`/`_`, заголовки. На самой странице форматирование сохраняется.
- Все инструменты сохраняют окончания строк входного файла; BOM по умолчанию выкл., галочка «Add BOM (old players)».

`/shift-subtitles`:
- Одно число в мс со знаком: `+` = позже, `−` = раньше (+ быстрые кнопки ±100/±500/±1000).
- «From line N» = номер cue в SRT (с 1) или порядковый номер события в VTT/ASS; сдвиг до конца файла.
- Уход до 00:00:00: cue, который целиком ушёл в минус, удаляется; частично — start = 0. Показать предупреждение «N lines removed / trimmed».
- После удаления SRT перенумеровывается 1, 2, 3…; cue, который заканчивается ровно на 00:00:00,000 (нулевая длительность), удаляется.
- Несколько файлов → одинаковый сдвиг. ASS: заголовок и стили не трогаем.

`/fix-subtitle-drift`:
- Вход SRT/VTT/ASS, формат сохраняется.
- Две точки: выбрать реплику из списка (по умолчанию первая и последняя), ввести правильное время `hh:mm:ss,mmm`.
- Пресеты подписаны «subtitle fps → video fps»; 23.976 = 24000/1001; времена округлять до целых мс.
- Пресеты fps работают пакетно (несколько файлов); синхронизация по двум точкам — один файл за раз.

`/fix-subtitle-encoding`:
- Вход .srt/.vtt/.ass/.ssa/.sub(text)/.txt; меняются только символы (+ опц. BOM), всё остальное байт-в-байт.
- Список кодировок включает ISO-8859-8 (иврит) и ISO-8859-9/cp1254 (турецкий).

`/srt-to-vtt`, `/vtt-to-srt`:
- Все конвертеры (SRT↔VTT и ASS/SSA→SRT) автоопределяют кодировку входа (та же `src/lib`, что и в encoding); выход всегда UTF-8 (BOM — галочка).
- SRT→VTT: номера cue убираются, `<i>/<b>/<u>` сохраняются, `,`→`.` в таймкодах.
- VTT→SRT: удаляются cue settings, STYLE, NOTE, REGION; `<v Speaker>` → «Speaker: текст»; `<c>` и караоке-таймстемпы YouTube удаляются; `<i>/<b>/<u>` сохраняются, прочие теги удаляются; перенумерация 1, 2, 3…; дубли rolling-строк НЕ склеиваются.

`/ass-to-srt`:
- `{\i1}`/`{\b1}` → `<i>`/`<b>`, `{\i0}`/`{\b0}` → `</i>`/`</b>` (незакрытые закрывать в конце реплики); остальные override-теги удаляются; `\N`/`\n`→перенос, `\h`→обычный пробел.
- Строки `Comment:` пропускаются; события-рисунки (`{\p1}`…) удаляются целиком.
- Дубли слоёв = одинаковые start/end + одинаковый текст после очистки тегов.
- Надписи/песни остаются обычными репликами; `.ssa` принимается.

## Этап 3.5 — Визуальная полировка (перед запуском)
16. **Состояния UI** — пусто / файл загружен / обработка / ошибка / готово (accent-галочка), понятные тексты ошибок.
17. **Мобильная версия** — дропзона и кнопки удобны на 360px, без горизонтального скролла.
18. **Тёмная тема** — проверить контраст (WCAG AA) во всех компонентах.
19. **OG-картинки** — шаблон 1200×630 на каждую страницу (генерация при сборке, напр. satori).
20. **Лёгкие анимации** — только CSS (hover, появление результата), уважать `prefers-reduced-motion`.
21. **Финальный логотип** — доработать знак и wordmark.
✅ Lighthouse ≥ 95 на мобильном после всех правок.

## Этап 4 — SEO-инфраструктура
22. `sitemap.xml` (`@astrojs/sitemap`), `robots.txt`, `llms.txt` (инструменты + 1 фраза о каждом).
23. Главная (список инструментов), About, Privacy («файлы не покидают браузер», дата обновления).
24. Гайды по адресу `/guides/<slug>`: `/guides/subtitles-out-of-sync` («Subtitles Out of Sync? Shift vs Drift») и `/guides/srt-vs-vtt-vs-ass` — с внутренними ссылками на инструменты.
24a. ✅ **URL-правило (Worker):** все адреса без слэша в конце (`build.format: 'file'`, `trailingSlash: 'never'` в `astro.config`). В Worker явно: запрос `/path/` → 301 на `/path` (query сохраняется), корень `/` без изменений; `/path.html` → 301 на `/path` (в `wrangler` assets оставить `html_handling: "auto-trailing-slash"` по умолчанию, не отключать). На каждой странице `<link rel="canonical">` на `https://subtitlefixer.com/<path>` без слэша; sitemap содержит только канонические URL. ✅ `curl -I /shift-subtitles/` и `/shift-subtitles.html` → 301 на `/shift-subtitles`; canonical совпадает с URL в sitemap.

## Этап 5 — Запуск (вручную)
25. Cloudflare Pages: подключить репо, build `npm run build`, output `dist`, привязать домен.
26. Google Search Console + Яндекс Вебмастер, отправить sitemap.
27. Cloudflare Web Analytics; кнопка доната — обычная ссылка `https://ko-fi.com/gngpromo` (`rel="noopener"`, `target="_blank"`), без виджета/скриптов Ko-fi: в футере + мягкий блок «Saved you time? Buy me a coffee» после успешной обработки файла. URL вынести в `src/config/site.ts`, чтобы сменить в одном месте.

## Этап 6 — Рост (2–3 задачи в неделю)
28. Инструменты: ✅ склейка (28c `/merge-subtitles`), разбиение, ✅ SUB→SRT (28d `/sub-to-srt`), ✅ SBV→SRT (28e `/sbv-to-srt`), ✅ SRT↔TXT (28a `/srt-to-txt`, 28b `/txt-to-srt`), ✅ проверка на ошибки (`/srt-editor`), ✅ VTT→TXT (`/vtt-to-txt`), ✅ SMI→SRT (`/smi-to-srt`), ✅ SRT→Word (`/srt-to-word`). ✅ experimental `/sup-to-srt` (PGS OCR, noindex, not in the sitemap, home, nav, or llms.txt).
29. Страницы под плееры: VLC, Plex, Jellyfin, Samsung/LG TV.
30. Локализация: es, pt, ru (Astro i18n + hreflang).
31. Монетизация: affiliate с ~1–3k визитов/мес, реклама (AdSense, 1–2 места, не у дропзоны) с ~10k/мес.

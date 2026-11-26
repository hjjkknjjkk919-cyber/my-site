
# Правила экономии контекста и лимитов (от пользователя)
1. Не перечитывать весь проект: перед правкой читать только нужный файл и диапазон строк (grep / поиск по символам). Не перечитывать LESSONS.md, сценарий и конфиги, если они уже в контексте.
2. Никаких скриншотов ошибок: ошибки TypeScript / Remotion / Three.js чинить молча. Если нужна помощь пользователя — только сухим текстом: файл, строка, 3–5 строк лога.
3. Превью — один лёгкий коллаж: не генерировать картинки после каждого шага. Контрольный лист — один JPEG, качество ~75%, ширина до 1200px.
4. Жёсткий стоп перед рендером: финальный рендер и GitHub Actions не запускать без команды «ДА, ЗАПУСКАЙ ФИНАЛЬНЫЙ РЕНДЕР».
5. Правки — пакетом за минимум вызовов; ответы короткие (1–3 строки, без длинных отчётов).

# Проект: «Не открывай», серия 1 (9:16, 1080×1920, 01:00)
- Спецификация: `EP1_SPEC.md` (корень репо) — главный документ серии, сверяться с ним.
- Композиция Remotion: `DontOpen1` (`src/Root.tsx`).
- Код: `src/dontopen/DontOpen.tsx` (монтаж, звук, субтитры, плашки, зерно), `src/dontopen/Hall3D.tsx` (3D-квартира, кухня, подъезд, монстр, камера), `src/dontopen/Scenes2D.tsx` (телефон, спальня, глазок, «Локатор», руки POV).
- Звук: `public/audio/dontopen/` (Дима — Омин, мама — Маруся через фильтр двери, монстр — Гримбл + шёпот Норы, рассказчик — Михаил).
- Рендер: `.github/workflows/render-split.yml` (composition=DontOpen1, frames=1800) — только по команде «ДА, ЗАПУСКАЙ ФИНАЛЬНЫЙ РЕНДЕР».

# task-observer
(task-observer activation block — template of v3.12.0)
Before the first tool call of any session, the first turn after a
compaction included, and before writing or proposing a plan, invoke the
task-observer skill AND run its Session Start Protocol: loading alone
activates nothing, and a harness note not to re-execute earlier skills does
not cover this protocol. The first call is one batch: an `ls` of the
workspace path below, the skill load and its per-skill lookup. A host that
requires its plan call first puts it in that batch, the protocol as its
first item, revised after the scan. Every turn with a tool call counts,
however simple it looks. Report a step you did not run in one line before
the answer when the user can act on it; every skipped step is recorded in
session-starts.log, which the user can read. If the skill does not resolve,
tell the user in your first reply, never only in a log, naming the probe
(the skill listing, or the directory on disk); re-check the listing on
every later turn with a tool call and run the protocol the first time it
resolves. On disk but unlisted, or refused ("Unknown skill"): read its
SKILL.md directly and run the protocol; that is the activation, said once.

After each task, list this session's observation records and append, in the
same turn, a one-line summary of that listing to checkpoints.log (ids and
titles, or "none logged" plus one line per user correction and per
incident, each with why it is not an observation), never from memory. The
reply names what was logged, or says nothing was logged, in one line;
details are in checkpoints.log. It catches a skill that never ran.

The task-observer workspace for this project is:
  /home/user/my-site/.task-observer
Every path the skill uses derives from that root, never from the working
directory. A subagent dispatched by a session that runs this protocol does
not run it and does not write to the log; it reports its findings to its
caller.

The user's repositories live under:
  /home/user
Runs that cannot write here or get an approval answered write their output to:
  none
Findings about these skills also arrive through:
  none

# Железные правила рендера 2.5D-персонажей (для всех серий)
1. **Иерархия костей (`<g>`):** любая конечность (`torso → neck → head`, `shoulder → forearm → hand`) строится только вложенными `<g>` с `transformOrigin` ровно в координатах сустава и нахлёстом 6px (`strokeLinecap="round"`). Запрещено анимировать кисти или голову отдельными `x/y` координатами.
2. **Углы локтей:** рука сгибается только вперёд/вверх (0°..115°). Обратный вывих локтя назад запрещён.
3. **Глаза внутри `<clipPath>`:** белки, зрачки и прямые веки (`-_-`) лежат внутри `<g>` головы и обрезаются по контуру белка через `<clipPath>`.
4. **Сэндвич-хват предметов (Z-index):** предмет в руке (кружка, телефон, перфоратор, уровень) рендерится строго МЕЖДУ слоем ладони (сзади) и слоем фаланг (спереди). Пальцы — единый `<path>` внутри `<g>` кисти, никаких оторванных палок.
5. **Без цензуры и звёздочек (`*`):** в субтитрах и озвучке мат пишется открыто, без `beep` и без замены букв на `*`.

# АВТОНОМНЫЙ ПОИСК НИШ И A/B-АНАЛИЗ (`scripts/shorts_radar.py`)
Зависимости: `yt-dlp`, `ffmpeg`. Результаты — в `research_output/` (не коммитится), временные видео — только в `/tmp/shorts_radar` (скрипт удаляет их сразу после нарезки кадров).

**Команда «найди ниши» (или «найди ниши en»):**
1. Запусти `python3 scripts/shorts_radar.py niches` (западный YouTube — `--lang en`, конкретная тема — передай ключевые слова).
2. Посмотри `research_output/niches_grid.jpg` и прочитай `research_output/niches_outliers.json`.
3. Сгруппируй находки в 5–8 микро-ниш и выдай таблицу: название ниши, `viral_ratio`, пригодность под наш 2.5D-вектор в Remotion, формула хука первых 3 секунд.

**Команда «разбери нишу <запрос>» (A/B: 10 viral vs 10 flop):**
1. Запусти `python3 scripts/shorts_radar.py ab "<запрос 1>" "<запрос 2>" "<запрос 3>"` (можно прямые ссылки на теги TikTok `https://www.tiktok.com/tag/<тег>`).
2. Просмотри оба коллажа: `research_output/viral_grid.jpg` и `research_output/flop_grid.jpg` (плитки слева направо по `tile_index`).
3. Отбракуй из flops визуальный мусор, не совпадающий по уровню рисовки/монтажа с viral, чтобы осталось ровно 10 залетевших и 10 не залетевших одного качества (приоритет парам с `"same_channel": true`).
4. Сравни десятки по `scene_cuts_per_min`, `intro_silence_sec`, длительности, формуле хука 0–3 сек и триггерам из `top_comments`; выдай таблицу «Почему первые 10 залетели, а вторые 10 — нет» и конкретные параметры сценария и темпа для следующей серии в Remotion.

**Ограничение облачной сессии:** с IP облачного контейнера YouTube отвечает 403 «Sorry…» на поисковый API (`youtubei/v1/search`), поэтому `yt-dlp ytsearch` здесь не работает. Запускать радар нужно с машины с домашним IP (локальный Claude Code) — без основных Google-куков.

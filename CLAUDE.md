
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

# САМООБУЧЕНИЕ НА ЗАЛЕТЕВШИХ РОЛИКАХ (`scripts/viral_learner.py` + `VIRAL_PLAYBOOK.md`)
**Команда «поучись на трендах»** (или «поучись на трендах en» / «поучись на трендах <тема>»):
1. Запусти `python3 scripts/viral_learner.py learn` (`--lang en`, `--top N` или свои запросы). Если скачано 0 роликов из-за IP-блока — попроси пользователя положить `cookies.txt` от ПУСТОГО Google-аккаунта в корень проекта (никогда от основного) или добавить `pipedapi.kavin.rocks` в разрешённые хосты.
2. Прочитай `research_output/study_batch.json` (`hook_0_4s`, `script_timed`, `cuts`, `audio.pauses`, `words_per_sec`, `views`, `viral_ratio`, `top_comments`) И обязательно открой через Read все раскадровки `research_output/storyboard_*.jpg` — визуальный темп, хуки, текст на экране и концовки своими глазами.
3. Обнови `VIRAL_PLAYBOOK.md`: новые формулы хуков 0–4 с, темп склеек/пауз, сюжетные повороты (разделы 1–4) + строка в журнал (раздел 5).
4. Выдай 4 конкретные идеи следующей серии (наша вселенная: Дима с покерфейсом, Нюанс, Валера Перекуп, 2.5D-вектор в Remotion — или новый формат под наш стек): дословный хук первых 3 с, сюжет, финальный твист («чеховское ружьё»), длительность и обоснование из изученных роликов.

**ОБЯЗАТЕЛЬНАЯ САМОПРОВЕРКА ПЕРЕД СДАЧЕЙ ЛЮБОГО РЕНДЕРА (selfcheck):** после каждого рендера `.mp4` запускай `python3 scripts/viral_learner.py selfcheck <путь_к_mp4>` (для точной русской речи `--model small`), открой `research_output/selfcheck_*.jpg` и проверь `script_timed`/`issues` в `selfcheck_*.json`: речь распознаётся чисто, без заиканий и дыр, на кадрах с речью (`frames[].speech`) открыты рты, нет багов рига. Нашёл баг — чини до показа пользователю.

**Команда «найди вовлекающие» (ролики до 1:30 с комментами/лайками):** `python3 scripts/engagement_finder.py [запросы] [--max-sec 90]` → `research_output/engagement.json` (лайки, комменты на 1k просмотров, топ-комментарии); выводы — в раздел 4 `VIRAL_PLAYBOOK.md`. Репосты YouTube не показывает публично.

**ПРАВИЛО: каждый раз, когда просят новую идею/сюжет** (изи-видосы: простая 2.5D-анимация, одна-две локации):
1. **Разбор «что у нас не так»:** сравни наши последние ролики (`LESSONS.md`, `VIRAL_PLAYBOOK.md`) со свежими трендами — 3–5 честных пунктов (темп, хук, юмор, длина, чего не хватает для комментов).
2. **Вывод и правка:** запиши выводы в `VIRAL_PLAYBOOK.md` (и в `LESSONS.md`, если это урок по нашим роликам).
3. **Свежий скан:** `python3 scripts/engagement_finder.py` по ШИРОКОМУ кругу тем — от юмора и бытовой «жизы» до POV и «а что если я балерина» (выживалки, профессии, «что будет если», страшилки, школа, животные, абсурд).
4. **Идеи:** 6+ идей из разных жанров (не только наша вселенная), у каждой — хук 0–3 с дословно, сюжет, развязка, длина и паттерн-обоснование.

**Команда «берём идею №X»:** сразу в производство — покадровый сценарий по правилам `VIRAL_PLAYBOOK.md`, список аудиодорожек, сборка композиции в Remotion.

**Ограничение облака:** из облачного контейнера YouTube отдаёт поиск, oEmbed и `/youtubei/v1/next` (лайки, комменты), но без входа скачивание блокируется («подтвердите, что вы не бот»). Рабочая связка в облаке (проверено 26.11.2026): `cookies.txt` от пустого аккаунта + `pip install -U "yt-dlp[default]"` (решатель JS-задач через node) — ролики качаются по HLS. `cookies.txt` живёт только в контейнере (gitignored) — в новой сессии пользователь присылает его заново. Порядок попыток в `learn`: `cookies.txt` → yt-dlp с разными `player_client` → зеркала Piped (закрыты сетью). `selfcheck` своих рендеров работает в облаке всегда.

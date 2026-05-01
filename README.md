# Source-of-truth research and launch spec for Botanica paid club

Strategy doc, опубликованный как лендинг на **[timzinin.com/botanica/](https://timzinin.com/botanica/)**.

## Что внутри

Пресс-тест гипотезы Тима про двухуровневый клуб («Крутые vs Платящие»),
три опции запуска с прогнозом MRR на 3 / 6 / 12 месяцев,
рекомендация (Option C — гибрид) и спринт-1 на 14 дней.

## Файлы

- `index.html` — структура (hero + 7 секций)
- `style.css` — OKLCH-палитра (cream + botanical green + terracotta), Fraunces / Inter Tight / JetBrains Mono
- `scene.js` — three.js фоновая сцена (wireframe organic shapes, particle pollen, mouse parallax, scroll reaction, prefers-reduced-motion respected)
- `ui.js` — reveal on scroll, active-section tracking в nav, smooth anchor scroll, animated confidence meter

## Источники

- `botanicaschool.com` (live, 2026-05-01)
- voice memo «Standard Recording 13» (2026-04-27)
- privately notes (`MEMORY.md`, не публикуются)

## Цифры в опциях

Все inputs (`new_pool`, `conversion`, `ARPU`, `churn`) помечены либо `source:` либо `ASSUMPTION:`.
Calculated cells выведены по формуле `paying_users[m] = retained[m] + new_pool[m] × conversion[m]`,
`MRR[m] = paying_users[m] × ARPU[m]`. Старт: `paying_users[0] = 1`.

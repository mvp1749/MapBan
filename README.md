# CS2 Map Banpick

Инструмент для ban/pick карт Counter-Strike 2 — аналог [mapbanz.com](https://mapbanz.com/).

## Возможности

- Форматы: **BO1**, **BO3**, **PREMIER**
- Map pool: Ancient, Anubis, Cache, Dust 2, Inferno, Mirage, Nuke, Overpass, Train, Vertigo
- История всех банпиков (localStorage)
- Полэкранный режим (для OBS / стрима)
- Адаптив под телефон

## Локальный запуск

Откройте `index.html` в браузере или запустите локальный сервер:

```bash
npx serve .
```

## Публикация на GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите все файлы проекта
3. Settings → Pages → Source: **Deploy from a branch**
4. Branch: **main**, folder: **/ (root)**
5. Сайт будет доступен по адресу: `https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО/`

## Карты (папка maps/)

| Файл     | Карта    |
|----------|----------|
| 1.*      | Mirage   |
| 2.*      | Dust 2   |
| 3.*      | Nuke     |
| 4.*      | Inferno  |
| 5.*      | Ancient  |
| 6.*      | Anubis   |
| 7.*      | Cache    |
| 8.*      | Overpass |
| 9.*      | Train    |
| 10.*     | Vertigo  |

Формат файла не важен — поддерживаются webp, jpg, jpeg, png, gif, bmp, avif, svg.

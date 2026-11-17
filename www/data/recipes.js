/* Рецепты: связки команд с пошаговым разбором.
   Поля: id, t, g — группа, os, sh, s, cmd, steps [[часть, пояснение]], alt [[команда, пояснение]], nt, r */
(function (R) {

/* ===== Место на диске ===== */
R({ id: 'disk-hogs', g: 'Место на диске', t: 'Что занимает место: крупнейшие каталоги', os: 'lm',
  cmd: 'du -xh -d1 / 2>/dev/null | sort -h | tail -n 15',
  s: 'Показывает 15 самых больших каталогов первого уровня, не заходя на другие диски.',
  steps: [['du -xh -d1 /', 'du считает размер каждого каталога в корне: -x — не выходить на другие ФС (/proc, флешки), -h — в K/M/G, -d1 — только первый уровень.'], ['2>/dev/null', 'Сообщения «Permission denied» (поток ошибок 2) отправляются в никуда. Для полного результата запустите через sudo.'], ['| sort -h', 'Вывод du передаётся в sort, -h понимает суффиксы K, M, G и сортирует по реальному размеру.'], ['| tail -n 15', 'Берём последние 15 строк — самые большие.']],
  alt: [['sudo ncdu -x /', 'Интерактивно: можно ходить по каталогам и удалять.'], ['du -sh ~/.cache/* | sort -h', 'Что раздуло кэш в домашнем каталоге.'], ['Get-ChildItem C:\\Users\\$env:USERNAME -Directory | ForEach-Object { [pscustomobject]@{Name=$_.Name; GB=[math]::Round((Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum/1GB,2)} } | Sort-Object GB -Descending', 'Аналог в PowerShell.']],
  nt: 'На macOS у du нет `-x` в паре с `-d` по-другому: используйте `du -xh -d 1 /` — работает, но системный том доступен только для чтения, смотрите `/System/Volumes/Data`.',
  r: ['du', 'sort', 'tail', 'ncdu', 'devnull'] });

R({ id: 'big-files', g: 'Место на диске', t: 'Найти файлы больше 500 МБ', os: 'lm',
  cmd: 'find ~ -type f -size +500M -exec ls -lh {} + 2>/dev/null | awk \'{print $5, $9}\' | sort -h',
  steps: [['find ~ -type f -size +500M', 'Ищем в домашнем каталоге только файлы (-type f) больше 500 МБ.'], ['-exec ls -lh {} +', 'Для найденных файлов вызываем ls -lh пачкой ({} + — все пути сразу), чтобы получить размер в удобном виде.'], ['2>/dev/null', 'Прячем ошибки доступа.'], ['| awk \'{print $5, $9}\'', 'Из строки ls -l берём 5-й столбец (размер) и 9-й (имя). Имена с пробелами обрежутся — для них см. вариант ниже.'], ['| sort -h', 'Сортируем по размеру.']],
  alt: [['find ~ -type f -size +500M -printf "%s\\t%p\\n" | sort -n | numfmt --field=1 --to=iec', 'GNU-вариант, корректный с пробелами в именах (Linux).'], ['Get-ChildItem C:\\ -Recurse -File -ErrorAction SilentlyContinue | Where-Object Length -gt 500MB | Sort-Object Length -Descending | Select-Object FullName, @{n="GB";e={[math]::Round($_.Length/1GB,2)}}', 'Windows PowerShell.'], ['forfiles /S /M * /C "cmd /c if @fsize GEQ 524288000 echo @path @fsize"', 'Windows cmd (медленно).']],
  r: ['find', 'ls', 'awk', 'sort'] });

R({ id: 'clean-old', g: 'Место на диске', t: 'Удалить файлы старше 30 дней', os: 'lm',
  cmd: 'find ~/Downloads -type f -mtime +30 -print\nfind ~/Downloads -type f -mtime +30 -delete',
  s: 'Сначала посмотреть, что будет удалено, затем удалить.',
  steps: [['find ~/Downloads', 'Где искать.'], ['-type f', 'Только файлы, каталоги не трогаем.'], ['-mtime +30', 'Изменены более 30 суток назад.'], ['-print', 'Первый прогон — только показать список. Проверьте его!'], ['-delete', 'Второй прогон — удалить. Ставьте -delete в самом конце выражения.']],
  alt: [['Get-ChildItem $HOME\\Downloads -File | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item -WhatIf', 'PowerShell: уберите -WhatIf, когда убедитесь.'], ['forfiles /p "%USERPROFILE%\\Downloads" /d -30 /c "cmd /c del @path"', 'cmd.']],
  r: ['find', 'rm', 'Remove-Item'] });

R({ id: 'arch-clean', g: 'Место на диске', t: 'Почистить Arch: кэш пакетов, сироты, журналы', os: 'l',
  cmd: 'sudo paccache -rk2 && sudo pacman -Rns $(pacman -Qdtq) ; sudo journalctl --vacuum-size=200M',
  steps: [['sudo paccache -rk2', 'Удалить из /var/cache/pacman/pkg старые версии пакетов, оставив по 2 последних (откат возможен). Нужен pacman-contrib.'], ['&&', 'Следующий шаг — только если предыдущий успешен.'], ['pacman -Qdtq', 'Список пакетов, установленных как зависимости, но больше никому не нужных (q — только имена).'], ['$(…)', 'Подстановка команды: этот список становится аргументами для pacman -Rns.'], ['sudo pacman -Rns', 'Удалить сирот вместе с их зависимостями и конфигами. Если сирот нет, pacman выдаст ошибку «no targets» — это нормально.'], [';', 'Журнал чистим в любом случае, даже если сирот не было.'], ['journalctl --vacuum-size=200M', 'Урезать системный журнал до 200 МБ.']],
  alt: [['yay -Sc', 'Очистить также кэш сборки AUR.'], ['rm -rf ~/.cache/thumbnails/*', 'Миниатюры.']],
  r: ['pacman', 'journalctl', 'cmdsubst', 'andor'] });

/* ===== Процессы и порты ===== */
R({ id: 'port-who', g: 'Процессы и порты', t: 'Какая программа заняла порт', os: 'lmw',
  cmd: 'sudo ss -tulpn | grep :8080',
  steps: [['sudo', 'Без root ss не покажет процессы других пользователей.'], ['ss -tulpn', 'TCP + UDP, только слушающие (l), с процессами (p), числами вместо имён (n).'], ['| grep :8080', 'Оставляем строки с нужным портом. В конце строки будет users:(("node",pid=1234,…)).']],
  alt: [['sudo lsof -i :8080', 'Linux и macOS.'], ['netstat -ano | findstr :8080', 'Windows cmd: последний столбец — PID; затем tasklist /fi "PID eq 1234".'], ['Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess', 'Windows PowerShell — сразу имя процесса.'], ['sudo fuser -k 8080/tcp', 'Linux: сразу убить того, кто занял порт.']],
  r: ['ss', 'grep', 'lsof', 'win-netstat', 'Get-NetIPAddress'] });

R({ id: 'kill-by-name', g: 'Процессы и порты', t: 'Найти и завершить зависшие процессы по имени', os: 'lm',
  cmd: 'ps aux | grep -i [n]ginx | awk \'{print $2}\' | xargs -r sudo kill',
  steps: [['ps aux', 'Все процессы системы, построчно.'], ['grep -i [n]ginx', 'Строки с nginx без учёта регистра. Трюк [n]: шаблон совпадает с «nginx», но строка самого grep содержит «[n]ginx» и не совпадает — grep не найдёт сам себя.'], ['awk \'{print $2}\'', 'Второй столбец ps aux — PID.'], ['xargs -r', 'Превращает список PID в аргументы команды; -r — ничего не делать, если список пуст.'], ['sudo kill', 'Посылает TERM — вежливую просьбу завершиться. Если не помогло через несколько секунд — kill -9.']],
  alt: [['sudo pkill -i nginx', 'Всё то же одной командой.'], ['pgrep -a nginx', 'Сначала посмотреть, что будет затронуто.'], ['taskkill /f /im nginx.exe', 'Windows cmd.'], ['Get-Process nginx | Stop-Process -Force', 'PowerShell.']],
  r: ['ps', 'grep', 'awk', 'xargs', 'kill', 'pkill'] });

R({ id: 'top-mem', g: 'Процессы и порты', t: 'Топ-10 процессов по памяти', os: 'lm',
  cmd: 'ps -eo pid,comm,%mem,rss --sort=-rss | head -n 11',
  steps: [['ps -eo pid,comm,%mem,rss', 'Все процессы (-e) с выбранными столбцами: PID, имя, процент и объём памяти в КБ (RSS).'], ['--sort=-rss', 'Сортировка по RSS по убыванию (минус).'], ['| head -n 11', 'Заголовок + 10 строк.']],
  alt: [['ps -axo pid,comm,%mem,rss -m | head -n 11', 'macOS: -m — сортировка по памяти.'], ['Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, Id, @{n="MB";e={[int]($_.WS/1MB)}}', 'Windows PowerShell.']],
  r: ['ps', 'head', 'Get-Process'] });

R({ id: 'bg-ssh', g: 'Процессы и порты', t: 'Долгая задача на сервере, которая переживёт отключение', os: 'lm',
  cmd: 'nohup ./train.sh > train.log 2>&1 &\ntail -f train.log',
  steps: [['nohup', 'Процесс игнорирует сигнал HUP, который приходит при закрытии терминала/обрыве SSH.'], ['./train.sh', 'Ваша задача.'], ['> train.log 2>&1', 'Весь вывод и ошибки — в лог-файл (порядок важен: сначала stdout в файл, потом stderr туда же).'], ['&', 'Запуск в фоне — сразу получаем приглашение.'], ['tail -f train.log', 'Смотрим прогресс; Ctrl+C прекратит только просмотр, задача продолжит работу.']],
  alt: [['tmux new -s train  →  ./train.sh  →  Ctrl+b d', 'Удобнее: можно вернуться в живую сессию через tmux attach -t train.'], ['systemd-run --user --unit=train ./train.sh', 'Как временная служба systemd; логи — journalctl --user -u train.']],
  r: ['nohup', 'redirect', 'jobs', 'tail', 'tmux'] });

/* ===== Логи и текст ===== */
R({ id: 'top-ips', g: 'Логи и текст', t: 'Топ IP-адресов в логе веб-сервера', os: 'lm',
  cmd: 'awk \'{print $1}\' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10',
  steps: [['awk \'{print $1}\' access.log', 'В формате логов nginx/Apache первое поле — IP клиента. Получаем поток IP по одному в строке.'], ['| sort', 'Сортируем, чтобы одинаковые IP оказались рядом (uniq работает только с соседними строками).'], ['| uniq -c', 'Схлопываем повторы и ставим перед каждым IP количество.'], ['| sort -nr', 'Сортируем по этому числу (-n), по убыванию (-r).'], ['| head -n 10', 'Десятка лидеров.']],
  alt: [['Get-Content access.log | ForEach-Object { ($_ -split " ")[0] } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10 Count, Name', 'PowerShell.'], ['grep " 404 " access.log | awk \'{print $7}\' | sort | uniq -c | sort -nr | head', 'Самые частые «битые» URL (7-е поле — путь).']],
  r: ['awk', 'sort', 'uniq', 'head', 'pipe'] });

R({ id: 'errors-today', g: 'Логи и текст', t: 'Ошибки за последний час с контекстом', os: 'l',
  cmd: 'journalctl --since "1 hour ago" -p err --no-pager | grep -v -i "bluetooth" | tail -n 30',
  steps: [['journalctl --since "1 hour ago"', 'Системный журнал за последний час.'], ['-p err', 'Только приоритет «ошибка» и выше.'], ['--no-pager', 'Не открывать less — нужен поток для конвейера.'], ['| grep -v -i "bluetooth"', 'Исключить надоевший «шум» (-v — инверсия).'], ['| tail -n 30', 'Последние 30 строк.']],
  alt: [['log show --last 1h --predicate \'messageType == error\' | tail -n 30', 'macOS.'], ['Get-WinEvent -FilterHashtable @{LogName="System","Application"; Level=2; StartTime=(Get-Date).AddHours(-1)}', 'Windows.']],
  r: ['journalctl', 'grep', 'tail'] });

R({ id: 'replace-many', g: 'Логи и текст', t: 'Заменить текст во всех файлах проекта', os: 'lm',
  cmd: 'grep -rl "old.example.com" --include="*.yml" . | xargs sed -i \'s/old\\.example\\.com/new.example.com/g\'',
  steps: [['grep -rl "old.example.com"', 'Рекурсивно (-r) найти файлы и вывести только их имена (-l).'], ['--include="*.yml" .', 'Только YAML-файлы, начиная с текущего каталога.'], ['| xargs', 'Список файлов становится аргументами sed.'], ['sed -i', 'Редактировать файлы на месте (на macOS: sed -i \'\').'], ['\'s/old\\.example\\.com/new.example.com/g\'', 'Заменить все вхождения; точки экранированы, иначе «.» значит «любой символ».']],
  alt: [['git grep -l old.example.com | xargs sed -i \'s/…/…/g\'', 'Только по файлам в git — безопаснее.'], ['Get-ChildItem -Recurse -Filter *.yml | ForEach-Object { (Get-Content $_) -replace \'old\\.example\\.com\', \'new.example.com\' | Set-Content $_ }', 'PowerShell.']],
  nt: 'Перед массовой заменой сделайте коммит в git или копию — откатить будет просто. Имена файлов с пробелами: `grep -rlZ … | xargs -0 sed -i …`.',
  r: ['grep', 'xargs', 'sed', 'regex'] });

R({ id: 'csv-sum', g: 'Логи и текст', t: 'Сумма и среднее по столбцу CSV', os: 'lm',
  cmd: 'tail -n +2 sales.csv | cut -d, -f3 | awk \'{s+=$1; n++} END {printf "сумма=%.2f среднее=%.2f\\n", s, s/n}\'',
  steps: [['tail -n +2 sales.csv', 'Всё, начиная со второй строки — пропускаем заголовок.'], ['| cut -d, -f3', 'Третий столбец (разделитель — запятая).'], ['| awk \'{s+=$1; n++}', 'Для каждой строки прибавляем значение к сумме s и считаем строки n.'], ['END {printf …}', 'После всех строк печатаем сумму и среднее с двумя знаками.']],
  alt: [['awk -F, \'NR>1 {s+=$3; n++} END {print s, s/n}\' sales.csv', 'То же одной awk-программой.'], ['Import-Csv sales.csv | Measure-Object -Property Amount -Sum -Average', 'PowerShell по имени столбца.']],
  nt: 'cut не понимает кавычки в CSV (`"Москва, центр"`). Для «настоящих» CSV используйте `mlr`, `csvkit` или PowerShell `Import-Csv`.',
  r: ['tail', 'cut', 'awk', 'Export-Csv'] });

/* ===== Бэкапы и передача ===== */
R({ id: 'dated-backup', g: 'Бэкапы и передача', t: 'Архив с датой в имени', os: 'lm',
  cmd: 'tar -czf "backup-$(date +%F_%H-%M).tar.gz" --exclude=node_modules ~/project && echo "OK" || echo "ОШИБКА"',
  steps: [['tar -czf', 'Создать (c) архив, сжатый gzip (z), в файл (f).'], ['"backup-$(date +%F_%H-%M).tar.gz"', 'Подстановка команды: date вернёт, например, 2026-11-17_15-03, и имя станет backup-2026-11-17_15-03.tar.gz. Кавычки — на случай пробелов.'], ['--exclude=node_modules', 'Не включать тяжёлые зависимости.'], ['~/project', 'Что архивируем.'], ['&& echo "OK"', 'Сообщение при успехе (код tar = 0).'], ['|| echo "ОШИБКА"', 'Сообщение при неудаче.']],
  alt: [['Compress-Archive -Path .\\project -DestinationPath "backup-$(Get-Date -Format yyyy-MM-dd_HH-mm).zip"', 'PowerShell.'], ['tar -a -c -f backup-%date:~-4%%date:~3,2%%date:~0,2%.zip project', 'cmd (формат %date% зависит от локали).']],
  r: ['tar', 'date', 'cmdsubst', 'andor'] });

R({ id: 'rsync-backup', g: 'Бэкапы и передача', t: 'Зеркальный бэкап на внешний диск', os: 'lm',
  cmd: 'rsync -aHAXvh --delete --info=progress2 --exclude=".cache" ~/ /run/media/$USER/Backup/home/',
  steps: [['rsync -a', 'Архивный режим: рекурсивно, с правами, временем, симлинками.'], ['-HAX', 'Плюс жёсткие ссылки (H), ACL (A) и расширенные атрибуты (X).'], ['-vh', 'Подробно и в удобных единицах.'], ['--delete', 'Удалять из бэкапа файлы, удалённые у вас — получится точное зеркало. Сначала прогоните с -n (dry-run)!'], ['--info=progress2', 'Общий прогресс вместо списка файлов.'], ['--exclude=".cache"', 'Кэши не нужны.'], ['~/ …/home/', 'Слэш в конце источника — копировать содержимое ~, а не сам каталог.']],
  alt: [['robocopy %USERPROFILE% E:\\Backup\\home /MIR /XD AppData /R:1 /W:1 /MT:16', 'Windows.'], ['tmutil startbackup', 'macOS: Time Machine.']],
  r: ['rsync', 'robocopy'] });

R({ id: 'ssh-key-setup', g: 'Бэкапы и передача', t: 'Вход на сервер по SSH-ключу', os: 'lmw',
  cmd: 'ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)" && ssh-copy-id user@server && ssh user@server',
  steps: [['ssh-keygen -t ed25519', 'Создать пару ключей: приватный ~/.ssh/id_ed25519 (никому не отдавать!) и публичный .pub. Можно задать пароль на ключ.'], ['-C "$(whoami)@$(hostname)"', 'Комментарий, чтобы на сервере было видно, чей ключ.'], ['ssh-copy-id user@server', 'Дописывает публичный ключ в ~/.ssh/authorized_keys на сервере (спросит пароль последний раз).'], ['ssh user@server', 'Теперь вход без пароля.']],
  alt: [['type $env:USERPROFILE\\.ssh\\id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"', 'Windows: ssh-copy-id нет, делаем вручную.'], ['printf "Host srv\\n  HostName 1.2.3.4\\n  User alex\\n  Port 2222\\n" >> ~/.ssh/config', 'Короткий алиас: дальше просто ssh srv.']],
  r: ['ssh', 'cmdsubst', 'andor'] });

R({ id: 'tar-over-ssh', g: 'Бэкапы и передача', t: 'Переслать каталог по сети без временного архива', os: 'lm',
  cmd: 'tar -czf - ./site | ssh user@server "tar -xzf - -C /var/www"',
  steps: [['tar -czf - ./site', 'Упаковать каталог, но вместо файла (-f -) писать архив в stdout.'], ['|', 'Поток архива уходит в ssh.'], ['ssh user@server "…"', 'На сервере выполняется команда в кавычках, её stdin — наш поток.'], ['tar -xzf - -C /var/www', 'Распаковать архив из stdin (-f -) в каталог /var/www.']],
  nt: 'Нет промежуточного файла и места на диске под него. Для повторных синхронизаций rsync эффективнее.',
  r: ['tar', 'ssh', 'pipe'] });

/* ===== Сеть ===== */
R({ id: 'net-check', g: 'Сеть', t: 'Пошаговая диагностика «нет интернета»', os: 'lmw',
  cmd: 'ip r | grep default; ping -c3 $(ip r | awk \'/default/{print $3; exit}\'); ping -c3 1.1.1.1; ping -c3 archlinux.org',
  steps: [['ip r | grep default', 'Есть ли маршрут по умолчанию и какой адрес у роутера.'], ['ping -c3 $(…awk…)', 'awk вытаскивает IP шлюза из строки «default via 192.168.1.1 …». Пингуем роутер: нет ответа — проблема в Wi-Fi/кабеле.'], ['ping -c3 1.1.1.1', 'Пингуем внешний IP: нет ответа — проблема у провайдера или на роутере.'], ['ping -c3 archlinux.org', 'Пингуем по имени: IP отвечает, а имя нет — проблема с DNS (resolvectl status).']],
  alt: [['ipconfig | findstr Gateway & ping -n 3 1.1.1.1 & ping -n 3 google.com', 'Windows cmd (в русской Windows — «Основной шлюз»).'], ['route -n get default; ping -c3 1.1.1.1; ping -c3 apple.com', 'macOS.'], ['Test-NetConnection 1.1.1.1; Resolve-DnsName google.com', 'PowerShell.']],
  r: ['ip', 'ping', 'awk', 'cmdsubst', 'dig'] });

R({ id: 'api-json', g: 'Сеть', t: 'Запрос к API и выборка полей из JSON', os: 'lmw',
  cmd: 'curl -s "https://api.github.com/users/torvalds/repos?per_page=100" | jq -r \'.[] | select(.stargazers_count > 1000) | "\\(.stargazers_count)\\t\\(.name)"\' | sort -nr',
  steps: [['curl -s URL', 'Получить JSON без индикатора прогресса.'], ['| jq -r', 'Обработать JSON, вывести «сырые» строки.'], ['.[]', 'Перебрать элементы массива репозиториев.'], ['select(.stargazers_count > 1000)', 'Оставить только популярные.'], ['"\\(.stargazers_count)\\t\\(.name)"', 'Собрать строку «звёзды<TAB>имя».'], ['| sort -nr', 'Отсортировать по числу звёзд.']],
  alt: [['(irm "https://api.github.com/users/torvalds/repos?per_page=100") | Where-Object stargazers_count -gt 1000 | Sort-Object stargazers_count -Descending | Select-Object name, stargazers_count', 'PowerShell сам разбирает JSON в объекты.']],
  r: ['curl', 'jq', 'sort', 'Invoke-RestMethod'] });

R({ id: 'flash-iso', g: 'Система', t: 'Записать ISO на флешку', os: 'lm',
  cmd: 'lsblk\nsudo dd if=archlinux-x86_64.iso of=/dev/sdX bs=4M status=progress conv=fsync && sync',
  steps: [['lsblk', 'Определяем флешку по размеру: например, sdb 14.9G. Букву X замените на свою!'], ['sudo dd', 'Побайтовое копирование с правами root.'], ['if=…iso', 'Вход — образ.'], ['of=/dev/sdX', 'Выход — устройство целиком (не раздел sdX1).'], ['bs=4M', 'Блоки по 4 МБ — быстрее.'], ['status=progress', 'Показывать прогресс.'], ['conv=fsync && sync', 'Дописать всё на флешку физически, прежде чем её вынимать.']],
  alt: [['diskutil list; diskutil unmountDisk /dev/diskN; sudo dd if=x.iso of=/dev/rdiskN bs=4m', 'macOS.'], ['Rufus / Ventoy', 'Windows: графические программы. Ventoy позволяет держать несколько ISO на одной флешке.']],
  nt: 'Ошибка в of= — потеря данных на другом диске. Проверяйте дважды.',
  r: ['lsblk', 'dd', 'diskutil'] });

R({ id: 'sysinfo-report', g: 'Система', t: 'Краткий отчёт о системе одной строкой', os: 'lm',
  cmd: 'echo "$(uname -sr) | $(nproc) ядер | RAM $(free -h | awk \'/Mem/{print $3"/"$2}\') | диск / $(df -h / | awk \'NR==2{print $5}\') | up $(uptime -p)"',
  steps: [['uname -sr', 'Ядро и версия.'], ['nproc', 'Число ядер.'], ['free -h | awk \'/Mem/{…}\'', 'Из строки Mem берём использовано/всего.'], ['df -h / | awk \'NR==2{print $5}\'', 'Процент заполнения корня: вторая строка, пятый столбец.'], ['uptime -p', 'Время работы.'], ['echo "…$(…)…"', 'Все подстановки собираются в одну строку.']],
  alt: [['fastfetch', 'Готовая красивая сводка.'], ['Get-ComputerInfo | Select-Object OsName, OsVersion, CsNumberOfLogicalProcessors, OsTotalVisibleMemorySize', 'Windows.']],
  r: ['uname', 'free', 'df', 'uptime', 'cmdsubst', 'awk'] });

R({ id: 'bulk-rename', g: 'Файлы', t: 'Массовое переименование: пробелы → подчёркивания, нижний регистр', os: 'lm',
  cmd: 'for f in *\\ *; do mv -n -- "$f" "$(echo "${f// /_}" | tr \'[:upper:]\' \'[:lower:]\')"; done',
  steps: [['for f in *\\ *', 'Перебрать файлы, в имени которых есть пробел (экранирован \\).'], ['"${f// /_}"', 'Раскрытие параметра: заменить все пробелы на _.'], ['| tr \'[:upper:]\' \'[:lower:]\'', 'Перевести латиницу в нижний регистр.'], ['$(…)', 'Результат становится новым именем.'], ['mv -n --', 'Переименовать, не перезаписывая существующие (-n); -- защищает от имён, начинающихся с дефиса.']],
  alt: [['Get-ChildItem *" "* | Rename-Item -NewName { ($_.Name -replace " ", "_").ToLower() }', 'PowerShell.'], ['perl-rename \'s/ /_/g; $_=lc\' *', 'Arch: пакет perl-rename.']],
  r: ['for', 'mv', 'vars', 'tr', 'Copy-Item'] });

R({ id: 'dupes', g: 'Файлы', t: 'Найти дубликаты файлов по содержимому', os: 'l',
  cmd: 'find . -type f -print0 | xargs -0 md5sum | sort | uniq -w32 --all-repeated=separate',
  steps: [['find . -type f -print0', 'Все файлы, разделённые нулевым байтом — безопасно для любых имён.'], ['| xargs -0 md5sum', 'Посчитать контрольную сумму каждого файла: одинаковое содержимое → одинаковая сумма.'], ['| sort', 'Одинаковые суммы окажутся рядом.'], ['| uniq -w32 --all-repeated=separate', 'Сравнивать только первые 32 символа (сам хеш) и показать группы повторов, разделённые пустой строкой.']],
  alt: [['fdupes -r .', 'Специализированная утилита.'], ['Get-ChildItem -Recurse -File | Get-FileHash | Group-Object Hash | Where-Object Count -gt 1 | ForEach-Object { $_.Group.Path; "" }', 'PowerShell.']],
  r: ['find', 'xargs', 'sort', 'uniq'] });

/* ===== Windows ===== */
R({ id: 'win-repair', g: 'Windows', t: 'Починить системные файлы Windows', os: 'w', sh: 'cmd',
  cmd: 'DISM /Online /Cleanup-Image /RestoreHealth && sfc /scannow',
  s: 'Выполнять в «Терминале (администратор)».',
  steps: [['DISM /Online /Cleanup-Image /RestoreHealth', 'Проверяет хранилище компонентов работающей системы и скачивает исправные файлы из Windows Update.'], ['&&', 'sfc запустится, только если DISM отработал успешно.'], ['sfc /scannow', 'Сверяет системные файлы с хранилищем и заменяет повреждённые. Отчёт — в %windir%\\Logs\\CBS\\CBS.log.']],
  r: ['sfc', 'chkdsk', 'andor'] });

R({ id: 'win-wifi-pass', g: 'Windows', t: 'Узнать пароль от своей сохранённой Wi-Fi сети', os: 'w', sh: 'cmd',
  cmd: 'netsh wlan show profiles\nnetsh wlan show profile name="ИмяСети" key=clear | findstr /i "Key Content Содержимое"',
  steps: [['netsh wlan show profiles', 'Список сетей, к которым компьютер подключался.'], ['show profile name="…" key=clear', 'Подробности профиля с паролем в открытом виде (нужны права администратора).'], ['| findstr /i "Key Content Содержимое"', 'Оставить строку с паролем (пробел в шаблоне findstr = ИЛИ, поэтому работает и на английской, и на русской Windows).']],
  alt: [['security find-generic-password -wa "ИмяСети"', 'macOS (спросит пароль пользователя).'], ['sudo grep -r "^psk=" /etc/NetworkManager/system-connections/', 'Linux с NetworkManager.']],
  r: ['netsh', 'findstr'] });

R({ id: 'win-reboot-why', g: 'Windows', t: 'Почему Windows перезагрузилась или выключилась', os: 'w', sh: 'ps',
  cmd: 'Get-WinEvent -FilterHashtable @{LogName="System"; Id=41,1074,6006,6008} -MaxEvents 15 | Format-Table TimeCreated, Id, Message -Wrap',
  steps: [['Get-WinEvent -FilterHashtable', 'Быстрый фильтр журнала событий.'], ['LogName="System"', 'Системный журнал.'], ['Id=41,1074,6006,6008', '41 — неожиданная потеря питания/зависание, 1074 — кто инициировал перезагрузку (обновления, пользователь), 6006 — штатное выключение, 6008 — некорректное завершение.'], ['-MaxEvents 15', 'Последние 15 событий.'], ['| Format-Table … -Wrap', 'Таблица с переносом длинных сообщений.']],
  alt: [['last -x | head', 'Linux: история перезагрузок и выключений.'], ['journalctl --list-boots; journalctl -b -1 -e', 'Linux: что было в конце прошлой загрузки.']],
  r: ['Get-WinEvent', 'Format-Table'] });

R({ id: 'win-installed', g: 'Windows', t: 'Список установленных программ и массовое обновление', os: 'w', sh: 'ps',
  cmd: 'winget list --upgrade-available\nwinget upgrade --all --silent --accept-package-agreements',
  steps: [['winget list --upgrade-available', 'Программы, для которых есть новые версии.'], ['winget upgrade --all', 'Обновить всё, что знает winget.'], ['--silent', 'Без окон установщиков.'], ['--accept-package-agreements', 'Не останавливаться на лицензиях.']],
  alt: [['winget export -o apps.json; winget import apps.json', 'Перенести набор программ на новый ПК.'], ['brew update && brew upgrade', 'macOS.'], ['sudo pacman -Syu && yay -Sua', 'Arch с AUR.']],
  r: ['winget'] });

/* ===== macOS ===== */
R({ id: 'mac-setup', g: 'macOS', t: 'Быстрая настройка нового Mac из терминала', os: 'm', sh: 'zsh',
  cmd: 'xcode-select --install; brew install git coreutils ripgrep fd jq; brew install --cask iterm2 visual-studio-code; defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder',
  steps: [['xcode-select --install', 'Command Line Tools: git, make, clang (нужны для Homebrew).'], ['brew install …', 'Консольные утилиты (Homebrew нужно установить заранее с brew.sh).'], ['brew install --cask …', 'Приложения с GUI.'], ['defaults write … AppleShowAllFiles', 'Показывать скрытые файлы в Finder.'], ['&& killall Finder', 'Перезапустить Finder, чтобы настройка применилась.']],
  r: ['brew', 'defaults'] });

R({ id: 'mac-quarantine', g: 'macOS', t: '«Приложение повреждено и не может быть открыто»', os: 'm', sh: 'zsh',
  cmd: 'xattr -l /Applications/App.app\nxattr -dr com.apple.quarantine /Applications/App.app',
  steps: [['xattr -l', 'Посмотреть расширенные атрибуты: com.apple.quarantine — признак «скачано из интернета».'], ['xattr -dr com.apple.quarantine', 'Рекурсивно (-r) удалить (-d) атрибут карантина с пакета приложения.']],
  nt: 'Делайте это только для программ из источников, которым доверяете. Альтернатива — «Системные настройки → Конфиденциальность и безопасность → Всё равно открыть».',
  r: ['xattr'] });

})(function (o) { KD.recipes.push(o); });

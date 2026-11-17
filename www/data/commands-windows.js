/* Команды Windows: cmd.exe и PowerShell */
(function (C) {

/* ================= cmd.exe ================= */
C({ id: 'dir', n: 'dir', os: 'w', sh: 'cmd', c: 'nav', s: 'Список файлов и папок',
  syn: 'dir [путь] [/a] [/s] [/b] [/o:порядок]',
  d: 'Показывает содержимое папки: дату, время, размер, `<DIR>` для папок, а в конце — количество файлов и свободное место. В PowerShell `dir` — псевдоним `Get-ChildItem`, поэтому ключи `/s` там не работают (используйте `-Recurse`).',
  o: [['/a', 'Все файлы, включая скрытые и системные. /a:d — только папки, /a:h — скрытые.'], ['/s', 'Рекурсивно с подпапками.'], ['/b', 'Только имена (удобно для обработки).'], ['/o:n | s | d', 'Сортировка: имя, размер, дата; минус — обратная: /o:-s.'], ['/q', 'Показать владельца.'], ['/w', 'В несколько столбцов.'], ['/p', 'Постранично.']],
  e: [['dir /a', 'Включая скрытые.'], ['dir /s /b *.docx', 'Найти все .docx во всех подпапках (полные пути).'], ['dir /o:-s', 'Сначала самые большие.']],
  eq: { l: 'ls', m: 'ls' }, r: ['ls', 'Get-ChildItem', 'win-cd', 'where'], k: 'список файлов содержимое папки' });

C({ id: 'win-cd', n: 'cd / chdir', al: ['chdir'], os: 'w', sh: 'cmd', c: 'nav', s: 'Сменить текущую папку (cmd)',
  syn: 'cd [/d] [диск:][путь]\ncd ..\nдиск:',
  d: 'Без аргументов печатает текущую папку (как `pwd`). Для смены **диска** набирают букву диска: `D:`. Чтобы сменить диск и папку одной командой — ключ `/d`.',
  o: [['/d', 'Сменить и диск, и папку.'], ['..', 'На уровень вверх.'], ['\\', 'В корень диска.']],
  e: [['cd /d D:\\Games', 'Перейти на диск D в папку Games.'], ['cd %USERPROFILE%\\Desktop', 'На рабочий стол.'], ['cd', 'Показать текущую папку.']],
  eq: { l: 'cd', m: 'cd' }, r: ['cd', 'Set-Location', 'dir'] });

C({ id: 'copy', n: 'copy / xcopy', al: ['copy', 'xcopy'], os: 'w', sh: 'cmd', c: 'nav', s: 'Копирование файлов (cmd)',
  syn: 'copy источник назначение\nxcopy источник назначение /e /i /h',
  d: '`copy` копирует только файлы (не подпапки) и умеет склеивать: `copy a.txt+b.txt c.txt`. `xcopy` копирует деревья папок. Для больших и надёжных копий используйте `robocopy`.',
  o: [['/y', 'Перезаписывать без вопроса.'], ['/-y', 'Спрашивать.'], ['xcopy /e', 'С подпапками, включая пустые.'], ['xcopy /i', 'Считать назначение папкой.'], ['xcopy /h', 'Включая скрытые.'], ['xcopy /d', 'Только более новые.']],
  e: [['copy report.docx D:\\Backup\\', 'Скопировать файл.'], ['xcopy C:\\Project D:\\Project /e /i /h', 'Скопировать папку целиком.'], ['copy /b part1+part2 full.bin', 'Склеить бинарные части.']],
  eq: { l: 'cp', m: 'cp' }, r: ['robocopy', 'Copy-Item', 'cp'] });

C({ id: 'robocopy', n: 'robocopy', os: 'w', sh: 'cmd', c: 'nav', s: 'Надёжное копирование и синхронизация папок',
  syn: 'robocopy источник назначение [файлы] [опции]',
  d: '«Robust File Copy» — встроенный в Windows аналог `rsync`: копирует только изменённое, продолжает после обрыва, многопоточный, ведёт лог. Аргументы — **папки**, а маски файлов идут третьим параметром.\n\nКоды возврата необычные: 0–7 — успех (1 = что-то скопировано), 8 и больше — ошибки.',
  o: [['/e', 'Все подпапки, включая пустые.'], ['/mir', 'Зеркало: как /e + удалить в назначении лишнее.'], ['/z', 'Режим с возобновлением (для сети).'], ['/mt:16', 'Многопоточность (16 потоков).'], ['/xd ПАПКИ', 'Исключить папки.'], ['/xf ФАЙЛЫ', 'Исключить файлы.'], ['/r:2 /w:5', 'Повторов 2, пауза 5 с (по умолчанию миллион повторов!).'], ['/l', 'Только показать, ничего не делать (dry run).'], ['/log:файл', 'Записать лог.'], ['/move', 'Переместить (удалить источник).'], ['/copy:DAT', 'Что копировать: данные, атрибуты, время.']],
  e: [['robocopy C:\\Users\\Alex\\Documents D:\\Backup\\Docs /e /z /mt:8 /r:2 /w:5', 'Бэкап документов.'], ['robocopy C:\\Site \\\\server\\www /mir /xd node_modules .git /l', 'Сначала проверка зеркалирования.'], ['robocopy C:\\src D:\\dst *.jpg *.png /s', 'Только картинки.']],
  w: '`/mir` удаляет в назначении всё, чего нет в источнике. Перепутаете папки — потеряете данные. Сначала запускайте с `/l`.',
  eq: { l: 'rsync', m: 'rsync' }, r: ['rsync', 'copy', 'Copy-Item'], k: 'синхронизация бэкап копировать папку' });

C({ id: 'move', n: 'move / ren', al: ['move', 'ren', 'rename'], os: 'w', sh: 'cmd', c: 'nav', s: 'Переместить и переименовать (cmd)',
  syn: 'move источник назначение\nren старое_имя новое_имя',
  d: '`move` перемещает файлы и папки, `ren` переименовывает (новое имя — без пути). `ren` понимает маски: `ren *.jpeg *.jpg`.',
  e: [['move *.pdf D:\\Docs\\', 'Перенести все PDF.'], ['ren *.jpeg *.jpg', 'Сменить расширение у всех файлов.'], ['ren "old name.txt" new.txt', 'Имена с пробелами — в кавычках.']],
  eq: { l: 'mv', m: 'mv' }, r: ['mv', 'Move-Item'] });

C({ id: 'del', n: 'del / erase', al: ['del', 'erase'], os: 'w', sh: 'cmd', c: 'nav', s: 'Удалить файлы (cmd)',
  syn: 'del [/s] [/q] [/f] [/a] файлы',
  d: 'Удаляет файлы (не папки) без корзины. Для папок — `rmdir /s`.',
  o: [['/s', 'Во всех подпапках.'], ['/q', 'Без подтверждения.'], ['/f', 'Включая файлы «только для чтения».'], ['/a:h', 'Скрытые файлы.'], ['/p', 'Спрашивать про каждый.']],
  e: [['del *.tmp', 'Удалить временные файлы в папке.'], ['del /s /q %TEMP%\\*', 'Очистить временную папку.']],
  w: '`del /s /q` с неверной маской или папкой молча удалит много лишнего, без корзины.',
  eq: { l: 'rm', m: 'rm' }, r: ['rd', 'Remove-Item', 'rm'] });

C({ id: 'rd', n: 'rmdir / rd', al: ['rd'], os: 'w', sh: 'cmd', c: 'nav', s: 'Удалить папку (cmd)',
  syn: 'rd [/s] [/q] папка',
  d: 'Без ключей удаляет только пустую папку. С `/s` — со всем содержимым.',
  o: [['/s', 'Вместе с содержимым.'], ['/q', 'Без вопросов.']],
  e: [['rd /s /q node_modules', 'Удалить папку целиком (быстрее, чем через Проводник).']],
  eq: { l: 'rm -r, rmdir', m: 'rm -r' }, r: ['del', 'Remove-Item'] });

C({ id: 'win-mkdir', n: 'mkdir / md', al: ['md'], os: 'w', sh: 'cmd', c: 'nav', s: 'Создать папку (cmd)',
  syn: 'mkdir путь',
  d: 'Создаёт папку; промежуточные папки создаются автоматически (как `mkdir -p`).',
  e: [['mkdir C:\\Projects\\app\\src', 'Создаст все уровни.']],
  eq: { l: 'mkdir -p', m: 'mkdir -p' }, r: ['mkdir', 'New-Item'] });

C({ id: 'type', n: 'type / more', al: ['more'], os: 'w', sh: 'cmd', c: 'view', s: 'Вывести содержимое файла (cmd)',
  syn: 'type файл\nmore файл',
  d: '`type` выводит текстовый файл целиком, `more` — постранично (Пробел — дальше, q — выход).',
  e: [['type C:\\Windows\\System32\\drivers\\etc\\hosts', 'Файл hosts.'], ['ipconfig /all | more', 'Длинный вывод постранично.'], ['type nul > empty.txt', 'Создать пустой файл.']],
  eq: { l: 'cat, less', m: 'cat, less' }, r: ['cat', 'Get-Content'] });

C({ id: 'findstr', n: 'findstr / find', al: ['find /i'], os: 'w', sh: 'cmd', c: 'search', s: 'Поиск текста в файлах и выводе (cmd)',
  syn: 'findstr [опции] "строка" [файлы]',
  d: 'Аналог `grep` в cmd. Пробел в шаблоне означает ИЛИ между словами: `"error warn"` найдёт любое из слов; для точной фразы используйте `/c:"фраза"`. Поддерживает упрощённые регулярные выражения.',
  o: [['/i', 'Без учёта регистра.'], ['/s', 'Во всех подпапках.'], ['/n', 'Номера строк.'], ['/v', 'Строки БЕЗ совпадения.'], ['/m', 'Только имена файлов.'], ['/c:"фраза"', 'Искать фразу целиком.'], ['/r', 'Регулярное выражение.'], ['/b / /e', 'В начале / в конце строки.']],
  e: [['netstat -ano | findstr :8080', 'Кто использует порт 8080.'], ['tasklist | findstr /i chrome', 'Найти процесс.'], ['findstr /s /i /n "TODO" *.cs', 'TODO во всех .cs файлах.'], ['ipconfig | findstr /c:"IPv4"', 'Только IPv4-адреса.']],
  nt: 'Кириллица в выводе консольных программ может быть в кодировке 866: при проблемах выполните `chcp 65001`.',
  eq: { l: 'grep', m: 'grep' }, r: ['grep', 'Select-String'], k: 'найти текст поиск строки' });

C({ id: 'where', n: 'where', os: 'w', sh: 'cmd', c: 'search', s: 'Найти программу или файл',
  syn: 'where [/r каталог] шаблон',
  d: 'Ищет исполняемые файлы по PATH (как `which`) или файлы в указанной папке рекурсивно. В PowerShell пишите `where.exe` — `where` там означает `Where-Object`.',
  e: [['where python', 'Где установлен Python (покажет все найденные копии).'], ['where /r C:\\ hosts', 'Найти файл hosts на диске C.']],
  eq: { l: 'which, find', m: 'which, find' }, r: ['which', 'Get-Command'] });

C({ id: 'tasklist', n: 'tasklist', os: 'w', sh: 'cmd', c: 'proc', s: 'Список процессов',
  syn: 'tasklist [/v] [/svc] [/fi "фильтр"]',
  d: 'Показывает запущенные процессы с PID и памятью — консольный «Диспетчер задач».',
  o: [['/svc', 'Какие службы внутри каждого процесса (полезно для svchost).'], ['/v', 'Подробно.'], ['/fi "IMAGENAME eq chrome.exe"', 'Фильтр.'], ['/fi "MEMUSAGE gt 500000"', 'Больше 500 МБ.'], ['/fo csv', 'Формат CSV.']],
  e: [['tasklist | findstr /i discord', 'Найти процесс.'], ['tasklist /svc /fi "PID eq 1234"', 'Что за svchost с PID 1234.']],
  eq: { l: 'ps aux', m: 'ps aux' }, r: ['taskkill', 'Get-Process', 'ps'] });

C({ id: 'taskkill', n: 'taskkill', os: 'w', sh: 'cmd', c: 'proc', s: 'Завершить процесс',
  syn: 'taskkill /pid PID | /im имя.exe [/f] [/t]',
  o: [['/pid N', 'По номеру процесса.'], ['/im ИМЯ', 'По имени (маски: /im chrome*).'], ['/f', 'Принудительно (как kill -9).'], ['/t', 'Вместе с дочерними процессами.']],
  d: 'Завершает процессы. Без `/f` посылает вежливый запрос закрыться, с `/f` — убивает немедленно.',
  e: [['taskkill /im notepad.exe', 'Закрыть Блокнот.'], ['taskkill /f /t /im chrome.exe', 'Убить Chrome со всеми вкладками.'], ['taskkill /f /pid 4321', 'По PID.']],
  eq: { l: 'kill, pkill', m: 'kill, pkill' }, r: ['tasklist', 'Stop-Process', 'kill'], k: 'убить процесс завис закрыть программу' });

C({ id: 'ipconfig', n: 'ipconfig', os: 'w', sh: 'cmd', c: 'net', s: 'IP-адреса, DNS, сброс сети',
  syn: 'ipconfig [/all | /release | /renew | /flushdns | /displaydns]',
  d: 'Показывает сетевые адаптеры: IPv4/IPv6, маску, шлюз. С `/all` — MAC-адрес, DNS-серверы, DHCP.',
  o: [['/all', 'Подробно (MAC, DNS, DHCP).'], ['/release', 'Отпустить адрес DHCP.'], ['/renew', 'Получить новый адрес.'], ['/flushdns', 'Очистить DNS-кэш — первое средство, если сайт «не открывается» после смены DNS.'], ['/displaydns', 'Показать DNS-кэш.']],
  e: [['ipconfig', 'Мой IP и шлюз.'], ['ipconfig /release && ipconfig /renew', 'Переполучить адрес.'], ['ipconfig /flushdns', 'Сбросить кэш DNS.']],
  eq: { l: 'ip a, resolvectl flush-caches', m: 'ifconfig, ipconfig getifaddr en0' }, r: ['ip', 'Get-NetIPAddress', 'netsh', 'ping'], k: 'ip адрес сеть dns' });

C({ id: 'win-netstat', n: 'netstat', os: 'w', sh: 'cmd', c: 'net', s: 'Соединения и открытые порты (Windows)',
  syn: 'netstat [-a] [-n] [-o] [-b]',
  o: [['-a', 'Все соединения и слушающие порты.'], ['-n', 'Числовые адреса (быстро).'], ['-o', 'Показать PID.'], ['-b', 'Имя программы (нужен администратор).'], ['-r', 'Таблица маршрутов.'], ['-e', 'Статистика интерфейса.']],
  d: 'Показывает TCP/UDP-соединения. Связка `-ano` + `findstr` + `tasklist` отвечает на вопрос «какая программа заняла порт».',
  e: [['netstat -ano | findstr LISTENING', 'Все слушающие порты.'], ['netstat -ano | findstr :3000', 'Кто на порту 3000 (последний столбец — PID).']],
  eq: { l: 'ss -tulpn', m: 'lsof -i, netstat -an' }, r: ['ss', 'Get-NetTCPConnection', 'tasklist', 'findstr'] });

C({ id: 'tracert', n: 'tracert / pathping', al: ['tracert', 'pathping'], os: 'w', sh: 'cmd', c: 'net', s: 'Маршрут до узла (Windows)',
  syn: 'tracert [-d] хост',
  d: 'Список маршрутизаторов на пути к узлу. `-d` — не резолвить имена (быстрее). `pathping` — как mtr: дополнительно считает потери на каждом узле.',
  e: [['tracert -d 8.8.8.8', 'Маршрут до Google DNS.'], ['pathping google.com', 'Где теряются пакеты.']],
  eq: { l: 'traceroute, mtr', m: 'traceroute' }, r: ['ping', 'traceroute'] });

C({ id: 'netsh', n: 'netsh', os: 'w', sh: 'cmd', c: 'net', root: true, s: 'Настройка сети, Wi-Fi, брандмауэра',
  syn: 'netsh <контекст> <команда>',
  d: 'Мощная утилита сетевой конфигурации. Многие действия требуют консоли от имени администратора.',
  e: [['netsh wlan show profiles', 'Сохранённые Wi-Fi сети.'], ['netsh wlan show profile name="Сеть" key=clear', 'Забытый пароль от своего Wi-Fi (строка «Содержимое ключа»).'], ['netsh int ip reset && netsh winsock reset', 'Сбросить сетевой стек (потом перезагрузка).'], ['netsh advfirewall set allprofiles state off', 'Выключить брандмауэр (только для диагностики!).'], ['netsh interface portproxy add v4tov4 listenport=8080 connectaddress=172.20.0.2 connectport=8080', 'Проброс порта (например, в WSL).']],
  eq: { l: 'nmcli, ufw, iptables', m: 'networksetup' }, r: ['ipconfig'] });

C({ id: 'systeminfo', n: 'systeminfo / winver', al: ['systeminfo', 'winver', 'ver'], os: 'w', sh: 'cmd', c: 'sys', s: 'Сведения о системе',
  syn: 'systeminfo',
  d: 'Версия и сборка Windows, дата установки, время загрузки, процессор, память, установленные обновления. `winver` показывает окно с версией, `ver` — номер сборки.',
  e: [['systeminfo | findstr /b /c:"OS" /c:"Total Physical"', 'Только ОС и объём памяти (англ. локаль).'], ['systeminfo | findstr /i "boot"', 'Когда система загрузилась.']],
  eq: { l: 'uname -a, hostnamectl, inxi', m: 'sw_vers, system_profiler' }, r: ['Get-ComputerInfo', 'uname'] });

C({ id: 'sfc', n: 'sfc / DISM', al: ['sfc', 'dism', 'DISM'], os: 'w', sh: 'cmd', c: 'sys', root: true, s: 'Проверка и восстановление системных файлов',
  syn: 'DISM /Online /Cleanup-Image /RestoreHealth\nsfc /scannow',
  d: '`DISM` восстанавливает хранилище компонентов Windows (из Windows Update), `sfc` по нему проверяет и чинит системные файлы. Правильный порядок: сначала DISM, потом sfc. Запускать в консоли администратора.',
  e: [['DISM /Online /Cleanup-Image /RestoreHealth', 'Починить образ системы (10–30 мин).'], ['sfc /scannow', 'Проверить системные файлы.'], ['DISM /Online /Cleanup-Image /StartComponentCleanup', 'Почистить старые компоненты (освобождает место).']],
  r: ['chkdsk'], k: 'восстановить windows починить системные файлы' });

C({ id: 'chkdsk', n: 'chkdsk', os: 'w', sh: 'cmd', c: 'disk', root: true, s: 'Проверка диска и файловой системы',
  syn: 'chkdsk [диск:] [/f] [/r] [/scan]',
  o: [['/f', 'Исправлять ошибки ФС.'], ['/r', 'Искать повреждённые сектора (долго; включает /f).'], ['/scan', 'Онлайн-проверка без отключения тома.'], ['/x', 'Принудительно отключить том.']],
  d: 'Проверяет NTFS/FAT на ошибки. Для системного диска проверка с `/f` назначается на следующую перезагрузку.',
  e: [['chkdsk C: /scan', 'Быстрая онлайн-проверка.'], ['chkdsk D: /f', 'Исправить ошибки на D:.']],
  eq: { l: 'fsck, btrfs scrub', m: 'diskutil verifyVolume / repairVolume' }, r: ['sfc', 'diskpart'] });

C({ id: 'diskpart', n: 'diskpart', os: 'w', sh: 'cmd', c: 'disk', root: true, s: 'Разметка дисков (интерактивно)',
  syn: 'diskpart\n  list disk\n  select disk N\n  …',
  d: 'Интерактивная утилита: запускается и принимает свои команды. Типичный сценарий — «оживить» флешку после записи образа Linux.',
  e: [['diskpart → list disk → select disk 2 → clean → create partition primary → format fs=exfat quick → assign', 'Полностью очистить и отформатировать флешку (диск 2!).']],
  w: 'Команда `clean` моментально стирает таблицу разделов выбранного диска. Проверьте номер в `list disk` по размеру.',
  eq: { l: 'fdisk, parted, mkfs', m: 'diskutil' }, r: ['fdisk', 'diskutil', 'chkdsk'] });

C({ id: 'sc', n: 'sc / net start', al: ['sc', 'net start', 'net stop'], os: 'w', sh: 'cmd', c: 'svc', root: true, s: 'Управление службами (cmd)',
  syn: 'sc query|start|stop|config имя\nnet start|stop имя',
  d: 'Управляет службами Windows. Имя службы ≠ отображаемое имя: например, `wuauserv` = «Центр обновления Windows». Графический вариант — `services.msc`. В PowerShell `sc` — псевдоним `Set-Content`, пишите `sc.exe`.',
  e: [['sc query wuauserv', 'Состояние службы обновлений.'], ['net stop spooler && net start spooler', 'Перезапустить диспетчер печати.'], ['sc config "SysMain" start= disabled', 'Отключить автозапуск (пробел после = обязателен!).']],
  eq: { l: 'systemctl', m: 'launchctl' }, r: ['Get-Service', 'systemctl'] });

C({ id: 'net', n: 'net user / net localgroup', al: ['net user', 'net localgroup', 'net use'], os: 'w', sh: 'cmd', c: 'perm', root: true, s: 'Пользователи, группы, сетевые диски',
  syn: 'net user [имя [пароль]] [/add | /delete]\nnet localgroup группа имя /add\nnet use Z: \\\\сервер\\папка',
  e: [['net user', 'Список пользователей.'], ['net user alex * /add', 'Создать пользователя (пароль спросит).'], ['net localgroup Administrators alex /add', 'Сделать администратором (в русской Windows группа «Администраторы»).'], ['net use Z: \\\\nas\\share /persistent:yes', 'Подключить сетевую папку как диск Z:.'], ['net user alex /active:no', 'Отключить учётную запись.']],
  d: 'Набор команд для учётных записей и сетевых ресурсов.',
  eq: { l: 'useradd, usermod, mount -t cifs', m: 'sysadminctl, dscl' }, r: ['useradd', 'whoami-w'] });

C({ id: 'whoami-w', n: 'whoami', os: 'w', sh: 'cmd', c: 'perm', s: 'Текущий пользователь и его права (Windows)',
  syn: 'whoami [/groups | /priv | /all]',
  d: 'Покажет домен\\пользователь. `/groups` — группы и запущена ли консоль с повышенными правами (метка Mandatory Label\\High).',
  e: [['whoami /groups | findstr /i "High"', 'Запущено ли от администратора.'], ['whoami /priv', 'Привилегии текущего токена.']],
  eq: { l: 'id, whoami', m: 'id, whoami' }, r: ['id', 'runas'] });

C({ id: 'runas', n: 'runas / sudo (Windows)', al: ['runas'], os: 'w', sh: 'cmd', c: 'perm', s: 'Запуск от имени другого пользователя / администратора',
  syn: 'runas /user:имя команда\nsudo команда',
  d: '`runas` запускает программу от имени другой учётной записи. Для повышения прав в Windows 11 24H2+ есть встроенный `sudo` (включается в «Параметры → Система → Для разработчиков»). В PowerShell: `Start-Process cmd -Verb RunAs`.',
  e: [['runas /user:Administrator cmd', 'Консоль от имени администратора.'], ['sudo netstat -ab', 'Windows 11 sudo: команда с правами администратора.'], ['Start-Process powershell -Verb RunAs', 'Окно PowerShell от администратора.']],
  eq: { l: 'sudo, su', m: 'sudo' }, r: ['sudo', 'Start-Process'] });

C({ id: 'attrib', n: 'attrib', os: 'w', sh: 'cmd', c: 'perm', s: 'Атрибуты файлов (скрытый, системный, только чтение)',
  syn: 'attrib [+|-][r|h|s|a] файлы [/s /d]',
  d: 'Ставит или снимает атрибуты: **r** — только чтение, **h** — скрытый, **s** — системный, **a** — архивный.',
  e: [['attrib -h -s -r E:\\* /s /d', 'Вернуть видимость файлам на флешке после вируса.'], ['attrib +h secret.txt', 'Скрыть файл.']],
  eq: { l: 'chattr, mv .имя (скрыть точкой)', m: 'chflags hidden' }, r: ['icacls', 'chattr'] });

C({ id: 'icacls', n: 'icacls / takeown', al: ['icacls', 'takeown'], os: 'w', sh: 'cmd', c: 'perm', root: true, s: 'Права доступа NTFS',
  syn: 'icacls путь [/grant пользователь:права] [/reset] [/t]\ntakeown /f путь [/r]',
  d: 'Показывает и изменяет списки контроля доступа (ACL). Права: F — полный, M — изменение, RX — чтение и выполнение, R — чтение, W — запись. `(OI)(CI)` — наследование на файлы и подпапки. `takeown` делает вас владельцем.',
  o: [['/grant user:F', 'Выдать права.'], ['/remove user', 'Убрать.'], ['/reset', 'Сбросить на унаследованные.'], ['/t', 'Рекурсивно.'], ['/inheritance:r', 'Отключить наследование.']],
  e: [['icacls C:\\Data', 'Посмотреть права.'], ['takeown /f C:\\Old /r /d y && icacls C:\\Old /grant %USERNAME%:F /t', 'Получить доступ к папке «отказано в доступе».'], ['icacls key.pem /inheritance:r /grant:r "%USERNAME%:R"', 'Права для SSH-ключа в Windows (аналог chmod 600).']],
  eq: { l: 'chmod, chown, setfacl', m: 'chmod, chown' }, r: ['chmod', 'chown', 'attrib'] });

C({ id: 'schtasks', n: 'schtasks', os: 'w', sh: 'cmd', c: 'svc', s: 'Планировщик заданий',
  syn: 'schtasks /create /tn имя /tr команда /sc расписание [/st время]',
  o: [['/create', 'Создать.'], ['/query', 'Список.'], ['/run /tn ИМЯ', 'Запустить сейчас.'], ['/delete /tn ИМЯ', 'Удалить.'], ['/sc daily | weekly | onlogon | onstart | minute', 'Расписание.'], ['/st 03:00', 'Время.'], ['/ru SYSTEM', 'От имени системы.']],
  d: 'Консольный интерфейс «Планировщика заданий» (taskschd.msc).',
  e: [['schtasks /create /tn "Backup" /tr "C:\\scripts\\backup.bat" /sc daily /st 03:00', 'Ежедневно в 3:00.'], ['schtasks /query /fo list /v | more', 'Все задания подробно.']],
  eq: { l: 'crontab, systemd timers', m: 'launchd, crontab' }, r: ['crontab'] });

C({ id: 'setx', n: 'set / setx', al: ['set', 'setx'], os: 'w', sh: 'cmd', c: 'shell', s: 'Переменные окружения (cmd)',
  syn: 'set ИМЯ=значение\nsetx ИМЯ "значение"\necho %ИМЯ%',
  d: '`set` меняет переменную только в текущем окне. `setx` сохраняет её навсегда (для новых окон), но НЕ меняет текущее. Значение читается как `%ИМЯ%`.',
  e: [['set', 'Все переменные.'], ['echo %PATH%', 'Показать PATH.'], ['setx JAVA_HOME "C:\\Program Files\\Java\\jdk-21"', 'Сохранить переменную.'], ['set PATH=%PATH%;C:\\tools', 'Добавить в PATH до закрытия окна.']],
  w: '`setx PATH "%PATH%;…"` обрезает значение до 1024 символов и смешивает системный и пользовательский PATH. Надёжнее — через «Переменные среды» (sysdm.cpl) или PowerShell.',
  eq: { l: 'export', m: 'export' }, r: ['env', 'vars'] });

C({ id: 'winget', n: 'winget', os: 'w', sh: 'cmd', c: 'pkg', s: 'Менеджер пакетов Windows',
  syn: 'winget <команда> [запрос] [опции]',
  d: 'Официальный менеджер пакетов (встроен в Windows 10/11 через «Установщик приложений»). Ставит, обновляет и удаляет программы из каталога Microsoft и Microsoft Store.',
  sub: { install: 'Установить.', uninstall: 'Удалить.', upgrade: 'Обновить.', search: 'Поиск.', list: 'Установленное.', show: 'Подробности.', export: 'Сохранить список программ.', import: 'Установить по списку.' },
  o: [['search ЗАПРОС', 'Найти.'], ['install --id ID -e', 'Установить по точному ID.'], ['upgrade --all', 'Обновить все программы.'], ['list', 'Установленное (включая не из winget).'], ['uninstall ИМЯ', 'Удалить.'], ['export -o apps.json', 'Экспорт списка.'], ['--silent', 'Без окон установщика.']],
  e: [['winget search firefox', 'Найти.'], ['winget install --id Mozilla.Firefox -e', 'Установить.'], ['winget upgrade --all --silent', 'Обновить всё.'], ['winget install Microsoft.PowerShell', 'PowerShell 7.']],
  eq: { l: 'pacman, apt', m: 'brew' }, r: ['brew', 'pacman'], k: 'установить программу обновить' });

C({ id: 'wsl', n: 'wsl', os: 'w', sh: 'cmd', c: 'sys', s: 'Подсистема Windows для Linux',
  syn: 'wsl [опции] [команда]',
  d: 'Запускает настоящий Linux внутри Windows. `wsl --install` ставит всё необходимое (по умолчанию Ubuntu). Файлы Windows видны в Linux как `/mnt/c/…`, а Linux-файлы в Проводнике — `\\\\wsl$`.',
  o: [['--install', 'Установить WSL.'], ['-l -v', 'Список дистрибутивов и версий.'], ['--install -d archlinux', 'Установить Arch Linux (официальный образ).'], ['-d ИМЯ', 'Запустить конкретный дистрибутив.'], ['--shutdown', 'Остановить все ВМ (освободить память).'], ['--update', 'Обновить ядро WSL.'], ['--export / --import', 'Бэкап и перенос дистрибутива.']],
  e: [['wsl --install', 'Установка.'], ['wsl -l -v', 'Что установлено.'], ['wsl ls -la', 'Выполнить Linux-команду из Windows.'], ['dir | wsl grep -i log', 'Смешанный конвейер Windows → Linux.']],
  r: ['netsh'] });

C({ id: 'powercfg', n: 'powercfg', os: 'w', sh: 'cmd', c: 'sys', s: 'Питание: отчёты батареи, сон',
  syn: 'powercfg /<действие>',
  e: [['powercfg /batteryreport', 'HTML-отчёт о здоровье батареи (путь к файлу будет в выводе).'], ['powercfg /requests', 'Что не даёт компьютеру уснуть.'], ['powercfg /h off', 'Отключить гибернацию (удалит hiberfil.sys).'], ['powercfg /energy', 'Анализ проблем энергопотребления (администратор).']],
  d: 'Управление схемами питания и диагностика.',
  eq: { l: 'upower, powertop, systemd-inhibit --list', m: 'pmset' }, r: ['pmset'] });

C({ id: 'reg', n: 'reg', os: 'w', sh: 'cmd', c: 'sys', s: 'Работа с реестром',
  syn: 'reg query|add|delete|export|import ключ [опции]',
  d: 'Консольный редактор реестра. Ветки: HKLM (система), HKCU (текущий пользователь).',
  e: [['reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', 'Автозапуск пользователя.'], ['reg export HKCU\\Software\\MyApp backup.reg', 'Бэкап ключа.'], ['reg add "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32" /ve /f', 'Вернуть старое контекстное меню в Windows 11 (перезапустите Проводник).']],
  w: 'Ошибки в реестре могут сделать систему незагружаемой. Делайте `reg export` перед изменениями.',
  eq: { m: 'defaults', l: 'dconf, gsettings' }, r: ['defaults'] });

C({ id: 'mklink', n: 'mklink', os: 'w', sh: 'cmd', c: 'nav', s: 'Символические ссылки и junction (cmd)',
  syn: 'mklink [/d | /h | /j] ссылка цель',
  d: 'Обратите внимание: порядок аргументов обратный по сравнению с `ln` — сначала **ссылка**, потом **цель**. `/d` — симлинк на папку, `/j` — junction (не требует прав администратора), `/h` — жёсткая ссылка на файл. Встроенная команда cmd, в PowerShell: `cmd /c mklink …`.',
  e: [['mklink /j "C:\\Users\\Alex\\AppData\\Local\\BigCache" "D:\\BigCache"', 'Перенести тяжёлую папку на другой диск.'], ['mklink /d C:\\link D:\\target', 'Символическая ссылка (администратор или режим разработчика).']],
  eq: { l: 'ln -s', m: 'ln -s' }, r: ['ln'] });

C({ id: 'shutdown-w', n: 'shutdown (Windows)', al: ['shutdown /s'], os: 'w', sh: 'cmd', c: 'sys', s: 'Выключение, перезагрузка, таймер',
  syn: 'shutdown /s | /r | /h | /a [/t сек] [/f]',
  o: [['/s', 'Выключить.'], ['/r', 'Перезагрузить.'], ['/h', 'Гибернация.'], ['/t N', 'Через N секунд.'], ['/f', 'Принудительно закрыть программы.'], ['/a', 'Отменить запланированное.'], ['/r /o', 'Перезагрузка в меню дополнительных параметров загрузки.'], ['/r /fw', 'Перезагрузка в UEFI/BIOS.']],
  d: 'Управляет питанием компьютера, в том числе по таймеру.',
  e: [['shutdown /s /t 3600', 'Выключить через час.'], ['shutdown /a', 'Отменить.'], ['shutdown /r /fw /t 0', 'Сразу в BIOS/UEFI.']],
  eq: { l: 'shutdown, systemctl', m: 'shutdown' }, r: ['shutdown', 'Restart-Computer'] });

C({ id: 'cls', n: 'cls', os: 'w', sh: 'cmd', c: 'shell', s: 'Очистить экран (cmd, PowerShell)',
  syn: 'cls', d: 'Очищает окно консоли. В PowerShell — псевдоним Clear-Host.', eq: { l: 'clear', m: 'clear' }, r: ['clear'] });

C({ id: 'help-w', n: 'help / /?', al: ['help'], os: 'w', sh: 'cmd', c: 'shell', s: 'Справка по командам cmd',
  syn: 'команда /?\nhelp команда',
  d: 'Почти у каждой команды cmd есть встроенная справка по ключу `/?`. `help` без аргументов — список встроенных команд.',
  e: [['robocopy /?', 'Все ключи robocopy.'], ['help for', 'Справка по циклу for.']],
  eq: { l: 'man, --help', m: 'man, --help' }, r: ['man', 'Get-Help'] });

C({ id: 'chcp', n: 'chcp', os: 'w', sh: 'cmd', c: 'shell', s: 'Кодовая страница консоли (кракозябры)',
  syn: 'chcp [номер]',
  d: 'Меняет кодировку консоли. 866 — традиционная русская OEM, 1251 — Windows-1251, 65001 — UTF-8. Если вывод программы или bat-файла показывает кракозябры, попробуйте сменить кодировку.',
  e: [['chcp 65001', 'Переключиться на UTF-8.'], ['chcp', 'Текущая кодовая страница.']],
  r: ['type'] });

/* ================= PowerShell ================= */
C({ id: 'Get-Help', n: 'Get-Help', al: ['help', 'man'], os: 'w', sh: 'ps', c: 'shell', s: 'Справка PowerShell',
  syn: 'Get-Help командлет [-Examples | -Detailed | -Full | -Online]',
  d: 'Справка по любому командлету. При первом использовании выполните `Update-Help` (от администратора), иначе будет только краткая справка.\n\nКомандлеты PowerShell называются **Глагол-Существительное**: Get, Set, New, Remove, Start, Stop… Зная это правило, можно угадывать имена: `Get-Service`, `Stop-Service`.',
  o: [['-Examples', 'Только примеры — самое полезное.'], ['-Full', 'Полная справка.'], ['-Online', 'Открыть страницу в браузере.'], ['-Parameter ИМЯ', 'Описание одного параметра.']],
  e: [['Get-Help Get-ChildItem -Examples', 'Примеры использования.'], ['Get-Help *process*', 'Найти командлеты по теме.'], ['Update-Help -UICulture en-US', 'Скачать справку.']],
  eq: { l: 'man', m: 'man' }, r: ['Get-Command', 'Get-Member', 'man'] });

C({ id: 'Get-Command', n: 'Get-Command', al: ['gcm'], os: 'w', sh: 'ps', c: 'shell', s: 'Найти командлет или программу',
  syn: 'Get-Command [-Name шаблон] [-Verb глагол] [-Noun существительное]',
  d: 'Ищет командлеты, функции, псевдонимы и программы. Помогает найти нужную команду по слову.',
  e: [['Get-Command *firewall*', 'Все команды про брандмауэр.'], ['Get-Command -Verb Get -Noun *Net*', 'Все Get-…Net….'], ['(Get-Command python).Source', 'Путь к python (аналог which).'], ['Get-Alias ls', 'Чем является ls в PowerShell.']],
  eq: { l: 'which, type, apropos', m: 'which' }, r: ['Get-Help', 'which', 'where'] });

C({ id: 'Get-Member', n: 'Get-Member', al: ['gm'], os: 'w', sh: 'ps', c: 'shell', s: 'Какие свойства и методы у объектов',
  syn: 'команда | Get-Member',
  d: 'Ключ к пониманию PowerShell: конвейер передаёт **объекты**, а не текст. `Get-Member` показывает тип объекта и все его свойства (Property) и методы (Method), которые можно использовать в `Select-Object`, `Where-Object`, `Sort-Object`.',
  e: [['Get-Process | Get-Member', 'Свойства процесса: CPU, WorkingSet, Id, Path…'], ['Get-Item file.txt | Get-Member -MemberType Property', 'Только свойства файла.']],
  r: ['Select-Object', 'Where-Object', 'ps-pipeline'] });

C({ id: 'Get-ChildItem', n: 'Get-ChildItem', al: ['gci', 'ls', 'dir'], os: 'w', sh: 'ps', c: 'nav', s: 'Список файлов, поиск по дереву (PowerShell)',
  syn: 'Get-ChildItem [-Path] путь [-Filter] [-Recurse] [-File|-Directory] [-Force]',
  d: 'Перечисляет файлы, папки, а также ветки реестра (`HKCU:`) и сертификаты (`Cert:`). Возвращает объекты с свойствами Name, Length (размер), LastWriteTime, FullName и др. Псевдонимы: `ls`, `dir`, `gci`.',
  o: [['-Recurse', 'Рекурсивно.'], ['-Filter "*.log"', 'Быстрый фильтр по маске.'], ['-Include / -Exclude', 'Маски включения/исключения.'], ['-File / -Directory', 'Только файлы / папки.'], ['-Force', 'Включая скрытые и системные.'], ['-Depth N', 'Глубина рекурсии.'], ['-Name', 'Только имена.']],
  e: [['Get-ChildItem -Force', 'Включая скрытые.'], ['Get-ChildItem -Recurse -Filter *.mp4 | Sort-Object Length -Descending | Select-Object -First 10 FullName, @{n="MB";e={[math]::Round($_.Length/1MB)}}', 'Десять самых больших видео.'], ['Get-ChildItem C:\\Logs -File | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item', 'Удалить логи старше 30 дней.'], ['(Get-ChildItem -Recurse -File | Measure-Object Length -Sum).Sum / 1GB', 'Размер папки в ГБ.']],
  eq: { l: 'ls, find', m: 'ls, find' }, r: ['ls', 'find', 'Where-Object', 'Sort-Object', 'dir'], k: 'список файлов найти файл размер папки' });

C({ id: 'Set-Location', n: 'Set-Location', al: ['cd', 'sl', 'Push-Location', 'Pop-Location', 'Get-Location'], os: 'w', sh: 'ps', c: 'nav', s: 'Сменить папку (PowerShell)',
  syn: 'Set-Location путь\nPush-Location / Pop-Location',
  d: 'Переходит в папку (псевдоним `cd`). Меняет диск сам, ключ `/d` не нужен. Можно «зайти» в реестр: `cd HKCU:\\Software`. `Get-Location` (`pwd`) — текущий путь.',
  e: [['cd D:\\Projects', 'Сменить диск и папку.'], ['cd ~', 'Домашняя папка.'], ['cd $env:APPDATA', 'Папка AppData\\Roaming.'], ['Push-Location C:\\Temp; …; Pop-Location', 'Сходить и вернуться.']],
  eq: { l: 'cd, pushd', m: 'cd' }, r: ['cd', 'win-cd'] });

C({ id: 'Copy-Item', n: 'Copy-Item / Move-Item / Rename-Item', al: ['Copy-Item', 'Move-Item', 'Rename-Item', 'cp', 'copy', 'mv', 'move', 'ren', 'cpi', 'mi', 'rni'], os: 'w', sh: 'ps', c: 'nav', s: 'Копировать, переместить, переименовать (PowerShell)',
  syn: 'Copy-Item источник назначение [-Recurse] [-Force]\nMove-Item источник назначение\nRename-Item путь новое_имя',
  o: [['-Recurse', 'С подпапками.'], ['-Force', 'Перезаписывать, включая скрытые/только чтение.'], ['-WhatIf', 'Показать, что будет сделано, ничего не делая.'], ['-Confirm', 'Спрашивать подтверждение.'], ['-PassThru', 'Вернуть объект результата дальше по конвейеру.']],
  d: 'Работа с файлами и папками. `-WhatIf` есть у всех «опасных» командлетов — используйте его для проверки.',
  e: [['Copy-Item .\\site -Destination D:\\Backup -Recurse', 'Скопировать папку.'], ['Get-ChildItem *.jpeg | Rename-Item -NewName { $_.Name -replace \'\\.jpeg$\', \'.jpg\' }', 'Массовое переименование регулярным выражением.'], ['Move-Item *.pdf D:\\Docs -WhatIf', 'Проверить перед перемещением.']],
  eq: { l: 'cp, mv', m: 'cp, mv' }, r: ['cp', 'mv', 'robocopy'] });

C({ id: 'Remove-Item', n: 'Remove-Item', al: ['rm', 'del', 'rmdir', 'ri', 'erase'], os: 'w', sh: 'ps', c: 'nav', s: 'Удалить файлы и папки (PowerShell)',
  syn: 'Remove-Item путь [-Recurse] [-Force] [-WhatIf]',
  o: [['-Recurse', 'Папку с содержимым.'], ['-Force', 'Скрытые и только чтение.'], ['-WhatIf', 'Пробный запуск.'], ['-Include / -Exclude', 'Маски.']],
  d: 'Удаляет без корзины. Псевдонимы rm/del, но ключи — свои: `rm -r -fo` вместо `rm -rf`.',
  e: [['Remove-Item .\\node_modules -Recurse -Force', 'Удалить папку.'], ['Remove-Item $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue', 'Очистить TEMP, игнорируя занятые файлы.']],
  w: 'Без корзины и без подтверждения при `-Force`. Проверяйте с `-WhatIf`.',
  eq: { l: 'rm', m: 'rm' }, r: ['rm', 'del'] });

C({ id: 'New-Item', n: 'New-Item', al: ['ni', 'mkdir', 'md'], os: 'w', sh: 'ps', c: 'nav', s: 'Создать файл, папку, ссылку (PowerShell)',
  syn: 'New-Item [-ItemType File|Directory|SymbolicLink|Junction] -Path путь [-Value текст] [-Target цель]',
  e: [['New-Item -ItemType Directory -Path C:\\Dev\\app\\src -Force', 'Папка со всеми уровнями.'], ['New-Item notes.txt -Value "текст"', 'Файл с содержимым.'], ['New-Item -ItemType SymbolicLink -Path .\\link -Target D:\\data', 'Символическая ссылка.'], ['ni $PROFILE -Force', 'Создать файл профиля PowerShell.']],
  d: 'Создаёт объекты в любом провайдере (файловая система, реестр…).',
  eq: { l: 'touch, mkdir, ln -s', m: 'touch, mkdir, ln -s' }, r: ['mkdir', 'touch', 'mklink'] });

C({ id: 'Get-Content', n: 'Get-Content', al: ['gc', 'cat', 'type'], os: 'w', sh: 'ps', c: 'view', s: 'Читать файл, следить за логом (PowerShell)',
  syn: 'Get-Content путь [-Tail N] [-Wait] [-TotalCount N] [-Encoding enc]',
  d: 'Возвращает файл как массив строк — с каждой можно работать отдельно. `-Raw` — одной строкой целиком.',
  o: [['-Tail N', 'Последние N строк.'], ['-Wait', 'Следить за файлом (как tail -f).'], ['-TotalCount N', 'Первые N строк (как head).'], ['-Raw', 'Целиком одной строкой.'], ['-Encoding utf8', 'Кодировка.']],
  e: [['Get-Content app.log -Tail 50 -Wait', 'Следить за логом.'], ['(Get-Content file.txt).Count', 'Количество строк.'], ['Get-Content data.txt | Select-String "error"', 'Фильтр строк.']],
  eq: { l: 'cat, head, tail -f', m: 'cat, tail -f' }, r: ['cat', 'tail', 'Set-Content', 'Select-String'] });

C({ id: 'Set-Content', n: 'Set-Content / Add-Content / Out-File', al: ['Set-Content', 'Add-Content', 'Out-File', 'sc', 'ac'], os: 'w', sh: 'ps', c: 'view', s: 'Записать в файл (PowerShell)',
  syn: '"текст" | Set-Content файл\nAdd-Content файл "строка"\nкоманда | Out-File файл',
  d: '`Set-Content` перезаписывает, `Add-Content` дописывает, `Out-File` пишет форматированный вывод (как его видно на экране). Операторы `>` и `>>` в PowerShell работают через `Out-File`.\n\nКодировка: в PowerShell 7 по умолчанию UTF-8 без BOM; в Windows PowerShell 5.1 `>` пишет UTF-16 — указывайте `-Encoding utf8` явно.',
  e: [['(Get-Content cfg.ini) -replace \'debug=false\', \'debug=true\' | Set-Content cfg.ini', 'Замена текста в файле (скобки обязательны!).'], ['Add-Content log.txt "$(Get-Date) start"', 'Дописать строку.'], ['Get-Process | Out-File procs.txt -Encoding utf8', 'Сохранить вывод.']],
  eq: { l: 'echo >, sed -i, tee', m: 'echo >, sed -i' }, r: ['Get-Content', 'redirect', 'sed'] });

C({ id: 'Select-String', n: 'Select-String', al: ['sls'], os: 'w', sh: 'ps', c: 'search', s: 'Поиск текста регулярным выражением (PowerShell grep)',
  syn: 'Select-String -Pattern шаблон [-Path файлы] [опции]',
  d: 'Аналог `grep`: ищет по регулярным выражениям .NET в файлах или в строках из конвейера. По умолчанию **без учёта регистра**.',
  o: [['-Pattern', 'Регулярное выражение.'], ['-SimpleMatch', 'Обычная строка.'], ['-CaseSensitive', 'С учётом регистра.'], ['-NotMatch', 'Строки без совпадения (grep -v).'], ['-Context 2,3', 'Строки до/после.'], ['-List', 'Только первое совпадение в каждом файле.'], ['-AllMatches', 'Все совпадения в строке.']],
  e: [['Select-String -Path *.log -Pattern "ERROR|FATAL"', 'Ошибки во всех логах.'], ['Get-ChildItem -Recurse -Include *.cs | Select-String "TODO"', 'Рекурсивный поиск.'], ['ipconfig | Select-String IPv4', 'Фильтр вывода внешней программы.'], ['(Select-String -Path log -Pattern \'\\d+\\.\\d+\\.\\d+\\.\\d+\' -AllMatches).Matches.Value | Sort-Object -Unique', 'Все уникальные IP.']],
  eq: { l: 'grep', m: 'grep' }, r: ['grep', 'findstr', 'regex'] });

C({ id: 'Where-Object', n: 'Where-Object', al: ['where', '?'], os: 'w', sh: 'ps', c: 'text', s: 'Фильтровать объекты по условию',
  syn: 'команда | Where-Object { $_.Свойство -оператор значение }\nкоманда | Where-Object Свойство -оператор значение',
  d: 'Пропускает дальше по конвейеру только объекты, удовлетворяющие условию. `$_` (или `$PSItem`) — текущий объект.\n\nОператоры сравнения: `-eq` равно, `-ne` не равно, `-gt` / `-lt` больше / меньше, `-ge` / `-le`, `-like` по маске `*`, `-match` регулярка, `-contains` содержит элемент, `-in`. Логика: `-and`, `-or`, `-not`. Символы `>`, `<`, `==` здесь **не работают** — `>` означает перенаправление в файл!',
  e: [['Get-Process | Where-Object CPU -gt 100', 'Процессы, использовавшие больше 100 с CPU.'], ['Get-Service | Where-Object { $_.Status -eq "Running" -and $_.StartType -eq "Manual" }', 'Работающие службы с ручным запуском.'], ['Get-ChildItem | ? Name -like "*.tmp"', 'Сокращённая запись.']],
  eq: { l: 'grep, awk условие', m: 'grep, awk' }, r: ['Select-Object', 'ForEach-Object', 'ps-pipeline', 'ps-operators'] });

C({ id: 'Select-Object', n: 'Select-Object', al: ['select'], os: 'w', sh: 'ps', c: 'text', s: 'Выбрать свойства или первые/последние N',
  syn: 'команда | Select-Object [свойства] [-First N] [-Last N] [-Unique] [-ExpandProperty имя]',
  d: 'Оставляет только нужные столбцы (свойства), берёт первые/последние N объектов, создаёт вычисляемые свойства `@{Name="…"; Expression={…}}`.',
  o: [['-First N / -Last N', 'Первые / последние N (как head/tail).'], ['-Property a,b', 'Только эти свойства.'], ['-ExpandProperty имя', 'Вернуть само значение, а не объект с одним полем.'], ['-Unique', 'Убрать дубли.'], ['-Skip N', 'Пропустить N.']],
  e: [['Get-Process | Sort-Object WS -Descending | Select-Object -First 5 Name, Id, @{n="MB";e={[int]($_.WS/1MB)}}', 'Топ-5 по памяти с размером в МБ.'], ['Get-Process | Select-Object -ExpandProperty Name', 'Только имена строками.']],
  eq: { l: 'cut, awk, head', m: 'cut, awk, head' }, r: ['Where-Object', 'Sort-Object', 'Format-Table'] });

C({ id: 'Sort-Object', n: 'Sort-Object / Group-Object / Measure-Object', al: ['Sort-Object', 'Group-Object', 'Measure-Object', 'sort', 'group', 'measure'], os: 'w', sh: 'ps', c: 'text', s: 'Сортировка, группировка, подсчёт (PowerShell)',
  syn: '… | Sort-Object Свойство [-Descending] [-Unique]\n… | Group-Object Свойство\n… | Measure-Object [Свойство] -Sum -Average -Max',
  d: 'Сортирует по свойствам объектов (не по тексту!), группирует (аналог `sort | uniq -c`) и считает статистику.',
  e: [['Get-ChildItem | Sort-Object Length -Descending', 'Файлы по размеру.'], ['Get-ChildItem -Recurse -File | Group-Object Extension | Sort-Object Count -Descending', 'Сколько файлов каждого типа.'], ['Get-ChildItem -File | Measure-Object Length -Sum -Average', 'Суммарный и средний размер.'], ['(Get-Content log.txt | Measure-Object -Line).Lines', 'Число строк.']],
  eq: { l: 'sort, uniq -c, wc', m: 'sort, uniq -c, wc' }, r: ['sort', 'uniq', 'wc', 'Select-Object'] });

C({ id: 'ForEach-Object', n: 'ForEach-Object', al: ['foreach', '%'], os: 'w', sh: 'ps', c: 'text', s: 'Выполнить действие для каждого объекта',
  syn: 'команда | ForEach-Object { … $_ … }\nкоманда | ForEach-Object -Parallel { … } -ThrottleLimit N',
  d: 'Выполняет блок кода для каждого объекта из конвейера. `$_` — текущий объект. В PowerShell 7 есть `-Parallel` для одновременной обработки.',
  e: [['1..5 | ForEach-Object { $_ * 2 }', '2 4 6 8 10.'], ['Get-ChildItem *.txt | % { "{0}: {1} строк" -f $_.Name, (Get-Content $_).Count }', 'Число строк в каждом файле.'], ['Get-Content hosts.txt | ForEach-Object -Parallel { Test-Connection $_ -Count 1 -Quiet } -ThrottleLimit 10', 'Параллельный пинг списка (PS 7).']],
  eq: { l: 'xargs, while read, awk', m: 'xargs, while read' }, r: ['xargs', 'for', 'Where-Object'] });

C({ id: 'Format-Table', n: 'Format-Table / Format-List / Out-GridView', al: ['Format-Table', 'Format-List', 'Out-GridView', 'ft', 'fl', 'ogv'], os: 'w', sh: 'ps', c: 'text', s: 'Оформление вывода',
  syn: '… | Format-Table [свойства] -AutoSize\n… | Format-List *\n… | Out-GridView',
  d: '`Format-*` только для показа на экране — **ставьте последними** в конвейере: после них объекты превращаются в «инструкции форматирования» и дальше обрабатываться не могут. `Format-List *` показывает все свойства. `Out-GridView` — окно-таблица с фильтром (только Windows).',
  e: [['Get-Service | Format-Table Name, Status, StartType -AutoSize', 'Аккуратная таблица.'], ['Get-Process -Id $PID | Format-List *', 'Все свойства процесса.'], ['Get-Process | Out-GridView -PassThru | Stop-Process', 'Выбрать процессы мышью и завершить.']],
  r: ['Select-Object', 'Export-Csv'] });

C({ id: 'Export-Csv', n: 'Export-Csv / ConvertTo-Json', al: ['Export-Csv', 'Import-Csv', 'ConvertTo-Json', 'ConvertFrom-Json'], os: 'w', sh: 'ps', c: 'text', s: 'Объекты ↔ CSV и JSON',
  syn: '… | Export-Csv файл.csv -NoTypeInformation\nImport-Csv файл.csv\n… | ConvertTo-Json -Depth 5\nGet-Content x.json | ConvertFrom-Json',
  d: 'Сохраняют объекты в табличный CSV (откроется в Excel) или JSON и загружают обратно уже как объекты со свойствами.',
  e: [['Get-Process | Select-Object Name, Id, CPU | Export-Csv procs.csv -NoTypeInformation -Encoding utf8', 'Выгрузить в CSV.'], ['Import-Csv users.csv | Where-Object Age -gt 30', 'Работать с CSV как с таблицей.'], ['(Get-Content package.json | ConvertFrom-Json).version', 'Прочитать поле из JSON.']],
  eq: { l: 'jq, csvkit', m: 'jq' }, r: ['jq', 'Invoke-RestMethod'] });

C({ id: 'Get-Process', n: 'Get-Process / Stop-Process', al: ['Get-Process', 'Stop-Process', 'gps', 'ps', 'kill', 'spps'], os: 'w', sh: 'ps', c: 'proc', s: 'Процессы: список и завершение (PowerShell)',
  syn: 'Get-Process [-Name имя] [-Id PID]\nStop-Process -Name имя | -Id PID [-Force]',
  d: 'Возвращает объекты процессов со свойствами: Name, Id, CPU (секунды процессорного времени), WS (рабочий набор памяти, байты), Path, StartTime. Их можно сортировать, фильтровать и передавать в `Stop-Process`.',
  o: [['-Name', 'По имени без .exe, маски *.'], ['-Id', 'По PID.'], ['-IncludeUserName', 'Владелец (администратор).'], ['Stop-Process -Force', 'Принудительно.']],
  e: [['Get-Process | Sort-Object CPU -Descending | Select-Object -First 10', 'Топ-10 по CPU.'], ['Get-Process chrome | Measure-Object WS -Sum', 'Сколько памяти съел Chrome (все процессы).'], ['Stop-Process -Name notepad', 'Закрыть Блокнот.'], ['Get-Process | Where-Object { $_.MainWindowTitle -like "*Excel*" } | Stop-Process -Force', 'Закрыть зависший Excel.']],
  eq: { l: 'ps, top, kill', m: 'ps, top, kill' }, r: ['ps', 'kill', 'tasklist', 'taskkill'] });

C({ id: 'Start-Process', n: 'Start-Process', al: ['start', 'saps'], os: 'w', sh: 'ps', c: 'proc', s: 'Запустить программу (в т. ч. от администратора)',
  syn: 'Start-Process программа [-ArgumentList …] [-Verb RunAs] [-Wait]',
  e: [['Start-Process powershell -Verb RunAs', 'Повышенные права.'], ['Start-Process notepad.exe -ArgumentList "C:\\file.txt" -Wait', 'Дождаться закрытия.'], ['start https://github.com', 'Открыть ссылку в браузере (через псевдоним start).'], ['Invoke-Item .', 'Открыть текущую папку в Проводнике (ii .).']],
  d: 'Запускает процесс с параметрами: от другого пользователя, скрыто, с ожиданием завершения.',
  eq: { l: 'xdg-open, sudo, nohup', m: 'open' }, r: ['runas', 'open'] });

C({ id: 'Get-Service', n: 'Get-Service / Start-Service / Restart-Service', al: ['Get-Service', 'Start-Service', 'Stop-Service', 'Restart-Service', 'Set-Service', 'gsv'], os: 'w', sh: 'ps', c: 'svc', root: true, s: 'Службы Windows (PowerShell)',
  syn: 'Get-Service [имя]\nRestart-Service имя\nSet-Service имя -StartupType Disabled|Manual|Automatic',
  e: [['Get-Service | Where-Object Status -eq Running', 'Работающие службы.'], ['Restart-Service Spooler', 'Перезапустить печать.'], ['Set-Service -Name SysMain -StartupType Disabled', 'Отключить автозапуск.'], ['Get-Service *update*', 'Найти по имени.']],
  d: 'Список, запуск, остановка и настройка автозапуска служб.',
  eq: { l: 'systemctl', m: 'launchctl' }, r: ['sc', 'systemctl'] });

C({ id: 'Test-NetConnection', n: 'Test-NetConnection / Test-Connection', al: ['tnc', 'Test-Connection'], os: 'w', sh: 'ps', c: 'net', s: 'Проверить узел и порт (PowerShell)',
  syn: 'Test-NetConnection хост [-Port N] [-TraceRoute]\nTest-Connection хост -Count N',
  d: '`Test-NetConnection` (tnc) — проверка доступности TCP-порта, ping и трассировка. `Test-Connection` — ping, возвращающий объекты.',
  e: [['Test-NetConnection github.com -Port 443', 'Открыт ли HTTPS (TcpTestSucceeded: True).'], ['tnc 192.168.1.10 -Port 3389', 'Доступен ли RDP.'], ['Test-Connection 8.8.8.8 -Count 4', 'Пинг.']],
  eq: { l: 'nc -zv, ping', m: 'nc -zv, ping' }, r: ['nc', 'ping'] });

C({ id: 'Get-NetIPAddress', n: 'Get-NetIPAddress / Get-NetTCPConnection', al: ['Get-NetIPAddress', 'Get-NetTCPConnection', 'Get-NetAdapter', 'Set-DnsClientServerAddress'], os: 'w', sh: 'ps', c: 'net', s: 'Сеть в PowerShell: адреса, порты, адаптеры',
  syn: 'Get-NetIPAddress -AddressFamily IPv4\nGet-NetTCPConnection -State Listen',
  e: [['Get-NetIPAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, IPAddress', 'Мои IPv4-адреса.'], ['Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess | Get-Process -Id { $_.OwningProcess }', 'Какой процесс занял порт 8080.'], ['Get-NetAdapter', 'Сетевые адаптеры и скорость.'], ['Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses 1.1.1.1,8.8.8.8', 'Сменить DNS (администратор).']],
  d: 'Объектные аналоги ipconfig и netstat.',
  eq: { l: 'ip a, ss -tulpn', m: 'ifconfig, lsof -i' }, r: ['ipconfig', 'win-netstat', 'ss'] });

C({ id: 'Invoke-RestMethod', n: 'Invoke-RestMethod / Invoke-WebRequest', al: ['irm', 'iwr', 'Invoke-WebRequest', 'wget', 'curl'], os: 'w', sh: 'ps', c: 'net', s: 'HTTP-запросы и загрузка (PowerShell)',
  syn: 'Invoke-RestMethod URL [-Method POST] [-Body …] [-Headers @{…}]\nInvoke-WebRequest URL -OutFile файл',
  d: '`Invoke-RestMethod` (irm) сразу разбирает JSON/XML в объекты — удобно для API. `Invoke-WebRequest` (iwr) возвращает полный ответ: код, заголовки, содержимое; с `-OutFile` скачивает файл.',
  e: [['(irm https://api.github.com/repos/PowerShell/PowerShell).stargazers_count', 'Поле из JSON API.'], ['iwr https://example.com/file.zip -OutFile file.zip', 'Скачать файл.'], ['irm https://httpbin.org/post -Method Post -Body (@{name="x"} | ConvertTo-Json) -ContentType "application/json"', 'POST с JSON.'], ['irm https://get.scoop.sh | iex', 'Установщик, выполняемый сразу (как curl | sh) — сначала прочитайте скрипт.']],
  w: '`irm … | iex` выполняет загруженный код без проверки.',
  eq: { l: 'curl, wget', m: 'curl' }, r: ['curl', 'Export-Csv'] });

C({ id: 'Compress-Archive', n: 'Compress-Archive / Expand-Archive', al: ['Compress-Archive', 'Expand-Archive'], os: 'w', sh: 'ps', c: 'arch', s: 'ZIP-архивы (PowerShell)',
  syn: 'Compress-Archive -Path файлы -DestinationPath архив.zip\nExpand-Archive архив.zip -DestinationPath папка',
  e: [['Compress-Archive -Path .\\project\\* -DestinationPath project.zip', 'Упаковать содержимое папки.'], ['Expand-Archive photos.zip -DestinationPath .\\photos', 'Распаковать.'], ['tar -a -c -f out.zip folder', 'Быстрее для больших папок: встроенный tar.exe.']],
  d: 'Встроенная работа с ZIP. Ограничение ~2 ГБ на файл в старых версиях; для больших архивов используйте `tar` или 7-Zip.',
  eq: { l: 'zip, unzip, tar', m: 'zip, ditto' }, r: ['tar', 'zip', '7z'] });

C({ id: 'Set-ExecutionPolicy', n: 'Set-ExecutionPolicy', al: ['Get-ExecutionPolicy', 'Unblock-File'], os: 'w', sh: 'ps', c: 'sec', s: 'Разрешить запуск скриптов .ps1',
  syn: 'Set-ExecutionPolicy RemoteSigned -Scope CurrentUser',
  d: 'По умолчанию на клиентских Windows запуск .ps1 запрещён (`Restricted`) — ошибка «выполнение сценариев отключено в этой системе». `RemoteSigned` разрешает локальные скрипты, а скачанные из интернета — только подписанные (или после `Unblock-File`). Это защита от случайного запуска, а не граница безопасности.',
  e: [['Get-ExecutionPolicy -List', 'Текущие политики по областям.'], ['Set-ExecutionPolicy RemoteSigned -Scope CurrentUser', 'Разрешить свои скрипты (не нужен администратор).'], ['Unblock-File .\\script.ps1', 'Снять пометку «скачан из интернета».'], ['powershell -ExecutionPolicy Bypass -File .\\setup.ps1', 'Разовый запуск в обход политики.']],
  r: ['ps-scripts', 'chmod'] });

C({ id: 'Get-WinEvent', n: 'Get-WinEvent', al: ['Get-EventLog', 'eventvwr'], os: 'w', sh: 'ps', c: 'svc', s: 'Журналы событий Windows',
  syn: 'Get-WinEvent -LogName System -MaxEvents N\nGet-WinEvent -FilterHashtable @{LogName=…; Level=…; StartTime=…}',
  d: 'Чтение журналов «Просмотра событий». Уровни: 1 — критический, 2 — ошибка, 3 — предупреждение. Полезные ID: 41 — неожиданная перезагрузка (Kernel-Power), 6008 — некорректное завершение, 1074 — кто инициировал перезагрузку.',
  e: [['Get-WinEvent -FilterHashtable @{LogName="System"; Level=1,2; StartTime=(Get-Date).AddDays(-1)}', 'Ошибки за сутки.'], ['Get-WinEvent -FilterHashtable @{LogName="System"; Id=41,6008,1074} -MaxEvents 20 | Format-Table TimeCreated, Id, Message -Wrap', 'Почему компьютер перезагрузился.']],
  eq: { l: 'journalctl', m: 'log show' }, r: ['journalctl'] });

C({ id: 'Get-ComputerInfo', n: 'Get-ComputerInfo / Get-CimInstance', al: ['Get-ComputerInfo', 'Get-CimInstance', 'gcim'], os: 'w', sh: 'ps', c: 'sys', s: 'Подробности о системе и железе',
  syn: 'Get-ComputerInfo [-Property шаблон]\nGet-CimInstance класс',
  e: [['Get-ComputerInfo -Property OsName, OsVersion, CsTotalPhysicalMemory', 'ОС и память.'], ['Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores', 'Процессор.'], ['Get-CimInstance Win32_BIOS | Select-Object SerialNumber', 'Серийный номер ноутбука.'], ['(Get-CimInstance -Namespace root/wmi MSStorageDriver_FailurePredictStatus).PredictFailure', 'SMART: прогнозирует ли диск отказ (администратор).']],
  d: 'Доступ к WMI/CIM — источнику почти любой информации о Windows и оборудовании. Замена устаревшему `wmic`.',
  eq: { l: 'inxi, lscpu, dmidecode', m: 'system_profiler' }, r: ['systeminfo'] });

C({ id: 'Get-Volume', n: 'Get-Volume / Get-PSDrive', al: ['Get-Volume', 'Get-PSDrive', 'Get-Disk', 'Get-Partition'], os: 'w', sh: 'ps', c: 'disk', s: 'Диски и свободное место (PowerShell)',
  syn: 'Get-Volume\nGet-PSDrive -PSProvider FileSystem',
  e: [['Get-Volume', 'Буквы, ФС, размер и свободное место.'], ['Get-PSDrive C', 'Занято/свободно на C:.'], ['Get-Disk | Get-Partition', 'Физические диски и разделы.']],
  d: 'Сведения о томах и дисках.',
  eq: { l: 'df -h, lsblk', m: 'df -h, diskutil list' }, r: ['df', 'diskpart'] });

C({ id: 'Get-Clipboard', n: 'Get-Clipboard / Set-Clipboard / clip', al: ['Get-Clipboard', 'Set-Clipboard', 'clip', 'gcb', 'scb'], os: 'w', sh: 'ps', c: 'text', s: 'Буфер обмена (Windows)',
  syn: 'команда | Set-Clipboard\nGet-Clipboard\nкоманда | clip',
  e: [['Get-Content $HOME\\.ssh\\id_ed25519.pub | Set-Clipboard', 'Скопировать ключ.'], ['(Get-Clipboard) -split "`n" | Sort-Object -Unique | Set-Clipboard', 'Отсортировать строки в буфере.'], ['ipconfig | clip', 'cmd: вывод в буфер.']],
  d: 'Чтение и запись буфера обмена.',
  eq: { l: 'wl-copy, xclip', m: 'pbcopy, pbpaste' }, r: ['pbcopy', 'wl-copy'] });

C({ id: 'Restart-Computer', n: 'Restart-Computer / Stop-Computer', al: ['Restart-Computer', 'Stop-Computer'], os: 'w', sh: 'ps', c: 'sys', s: 'Перезагрузка и выключение (PowerShell)',
  syn: 'Restart-Computer [-Force]\nStop-Computer',
  d: 'Перезагружает или выключает компьютер (в т. ч. удалённый через -ComputerName).',
  e: [['Restart-Computer -Force', 'Перезагрузить, не дожидаясь программ.']],
  eq: { l: 'reboot, poweroff', m: 'shutdown -r now' }, r: ['shutdown-w'] });

C({ id: 'Get-History', n: 'Get-History / PSReadLine', al: ['Get-History', 'h', 'history', 'Invoke-History'], os: 'w', sh: 'ps', c: 'shell', s: 'История команд PowerShell',
  syn: 'Get-History\nCtrl+R',
  d: '`Get-History` — команды текущей сессии. Модуль PSReadLine хранит общую историю всех сессий в файле `(Get-PSReadLineOption).HistorySavePath`; `Ctrl+R` — поиск по ней, как в bash. Включите подсказки из истории: `Set-PSReadLineOption -PredictionSource History`.',
  e: [['Get-Content (Get-PSReadLineOption).HistorySavePath | Select-String ssh', 'Найти команду во всей истории.'], ['Set-PSReadLineOption -PredictionSource History -PredictionViewStyle ListView', 'Подсказки списком.']],
  eq: { l: 'history', m: 'history' }, r: ['history'] });

C({ id: 'Set-Alias', n: 'Set-Alias / $PROFILE', al: ['Set-Alias', 'Get-Alias', '$PROFILE', 'profile'], os: 'w', sh: 'ps', c: 'shell', s: 'Псевдонимы и профиль PowerShell',
  syn: 'Set-Alias имя командлет\nnotepad $PROFILE',
  d: 'Псевдоним в PowerShell — только другое имя команды, без аргументов. Для «команды с параметрами» пишут функцию. Всё постоянное кладут в файл профиля `$PROFILE` (аналог `.bashrc`); создать его: `New-Item $PROFILE -Force`.',
  e: [['Set-Alias g git', 'Короткое имя.'], ['function ll { Get-ChildItem -Force @args }', 'Функция вместо «псевдонима с параметрами».'], ['notepad $PROFILE', 'Редактировать профиль.'], ['. $PROFILE', 'Перечитать профиль.']],
  eq: { l: 'alias, ~/.bashrc', m: 'alias, ~/.zshrc' }, r: ['alias', 'source', 'ps-functions'] });

})(function (o) { KD.commands.push(o); });

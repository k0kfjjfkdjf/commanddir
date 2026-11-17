/* Команды, специфичные для macOS (zsh — оболочка по умолчанию с Catalina) */
(function (C) {

C({ id: 'brew', n: 'brew', os: 'ml', c: 'pkg', s: 'Homebrew — менеджер пакетов для macOS (и Linux)',
  syn: 'brew <команда> [пакет]',
  d: 'Неофициальный, но стандартный де-факто менеджер пакетов macOS. **Формулы** — консольные программы (`brew install wget`), **касты** — приложения с GUI (`brew install --cask firefox`). Запускается без `sudo`. На Apple Silicon ставится в `/opt/homebrew`, на Intel — в `/usr/local`.',
  sub: { install: 'Установить.', uninstall: 'Удалить.', update: 'Обновить сам brew и списки.', upgrade: 'Обновить установленные пакеты.', search: 'Поиск.', info: 'Информация.', list: 'Установленное.', cleanup: 'Удалить старые версии.', doctor: 'Диагностика проблем.', services: 'Управление службами (postgres, redis…).', outdated: 'Что можно обновить.', bundle: 'Установка по списку из Brewfile.' },
  o: [['install ПАКЕТ', 'Установить формулу.'], ['install --cask ПРИЛОЖЕНИЕ', 'Установить GUI-приложение.'], ['update && upgrade', 'Обновить всё.'], ['search ЗАПРОС', 'Найти.'], ['list', 'Что установлено.'], ['outdated', 'Устаревшие.'], ['cleanup', 'Освободить место.'], ['doctor', 'Проверить окружение.'], ['services start ИМЯ', 'Запустить службу.'], ['bundle dump', 'Сохранить список в Brewfile.']],
  e: [['/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"', 'Установка Homebrew (официальная команда с brew.sh).'], ['brew install coreutils gnu-sed grep', 'GNU-утилиты (gls, gsed, ggrep).'], ['brew install --cask visual-studio-code', 'Установить VS Code.'], ['brew update && brew upgrade && brew cleanup', 'Полное обслуживание.'], ['brew services start postgresql@16', 'Запуск PostgreSQL как службы.']],
  eq: { l: 'pacman, apt, dnf', w: 'winget, scoop, choco' }, r: ['pacman', 'winget', 'mas'], k: 'установить программу пакет' });

C({ id: 'open', n: 'open', os: 'm', c: 'nav', s: 'Открыть файл, папку, URL или приложение',
  syn: 'open [-a приложение] [-R] путь|URL',
  d: 'Делает то же, что двойной щелчок в Finder: открывает файл в приложении по умолчанию, папку — в Finder, ссылку — в браузере.',
  o: [['-a ПРИЛОЖЕНИЕ', 'Открыть в указанном приложении.'], ['-R', 'Показать файл в Finder (Reveal).'], ['-e', 'Открыть в TextEdit.'], ['-n', 'Новый экземпляр приложения.'], ['-g', 'Не выводить приложение на передний план.']],
  e: [['open .', 'Текущая папка в Finder.'], ['open -a "Visual Studio Code" .', 'Проект в VS Code.'], ['open https://github.com', 'Ссылка в браузере.'], ['open -R ~/Downloads/file.zip', 'Показать файл в Finder.']],
  eq: { l: 'xdg-open', w: 'start, explorer, Invoke-Item' }, r: ['xdg-open'], k: 'открыть файл приложение finder' });

C({ id: 'xdg-open', n: 'xdg-open', al: ['gio open'], os: 'l', c: 'nav', s: 'Открыть файл/URL приложением по умолчанию (Linux)',
  syn: 'xdg-open путь|URL',
  d: 'Linux-аналог `open` из macOS и `start` из Windows.',
  e: [['xdg-open .', 'Открыть каталог в файловом менеджере.'], ['xdg-open report.pdf', 'Открыть PDF.']],
  eq: { m: 'open', w: 'start' }, r: ['open'] });

C({ id: 'pbcopy', n: 'pbcopy / pbpaste', al: ['pbcopy', 'pbpaste'], os: 'm', c: 'text', s: 'Буфер обмена из терминала',
  syn: 'команда | pbcopy\npbpaste [| команда]',
  d: '`pbcopy` кладёт стандартный ввод в буфер обмена, `pbpaste` выводит буфер. Позволяют встроить буфер обмена в конвейеры.',
  e: [['cat ~/.ssh/id_ed25519.pub | pbcopy', 'Скопировать публичный ключ.'], ['pbpaste | sort -u | pbcopy', 'Отсортировать и убрать дубли прямо в буфере.'], ['pwd | pbcopy', 'Скопировать текущий путь.']],
  eq: { l: 'wl-copy / wl-paste (Wayland), xclip -sel clip (X11)', w: 'clip, Get-Clipboard, Set-Clipboard' }, r: ['clip'], k: 'буфер обмена скопировать вставить' });

C({ id: 'wl-copy', n: 'wl-copy / xclip', al: ['wl-copy', 'wl-paste', 'xclip', 'xsel'], os: 'l', c: 'text', s: 'Буфер обмена из терминала (Linux)',
  syn: 'команда | wl-copy\nwl-paste',
  d: 'На Wayland (GNOME, KDE Plasma 6, Hyprland) — `wl-copy`/`wl-paste` из пакета `wl-clipboard`. На X11 — `xclip -selection clipboard` или `xsel -b`.',
  e: [['cat key.pub | wl-copy', 'Скопировать в буфер (Wayland).'], ['xclip -sel clip < file.txt', 'То же на X11.']],
  eq: { m: 'pbcopy', w: 'clip' }, r: ['pbcopy'] });

C({ id: 'defaults', n: 'defaults', os: 'm', c: 'sys', s: 'Скрытые настройки macOS и приложений',
  syn: 'defaults read|write|delete домен ключ [значение]',
  d: 'Читает и меняет файлы настроек (.plist) системы и приложений, включая параметры, которых нет в интерфейсе. После изменения часто нужно перезапустить приложение: `killall Finder`, `killall Dock`.',
  e: [['defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder', 'Показывать скрытые файлы (или Cmd+Shift+. в Finder).'], ['defaults write com.apple.dock autohide-delay -float 0 && killall Dock', 'Dock появляется без задержки.'], ['defaults write com.apple.screencapture location ~/Screenshots', 'Куда сохранять скриншоты.'], ['defaults read com.apple.dock', 'Все настройки Dock.']],
  nt: 'Перед экспериментами сохраните исходное значение через `defaults read`; откат — `defaults delete домен ключ`.',
  eq: { w: 'reg, Set-ItemProperty HKCU:\\…', l: 'gsettings, dconf, kwriteconfig6' }, r: ['killall'] });

C({ id: 'diskutil', n: 'diskutil', al: ['hdiutil'], os: 'm', c: 'disk', s: 'Диски, разделы, форматирование на macOS',
  syn: 'diskutil <команда> [аргументы]',
  d: 'Консольная версия «Дисковой утилиты». Диски называются `disk0`, `disk2s1` и т. д. `hdiutil` работает с образами .dmg/.iso.',
  sub: { list: 'Все диски и разделы.', info: 'Подробности.', eraseDisk: 'Отформатировать диск целиком.', eraseVolume: 'Отформатировать раздел.', mount: 'Смонтировать.', unmount: 'Отмонтировать раздел.', unmountDisk: 'Отмонтировать все разделы диска.', eject: 'Извлечь.', apfs: 'Операции с контейнерами APFS.' },
  o: [['list', 'Список дисков.'], ['info disk2', 'Подробности.'], ['unmountDisk /dev/disk2', 'Отмонтировать перед dd.'], ['eraseDisk ExFAT USB GPT disk2', 'Флешка ExFAT для всех ОС.'], ['eject disk2', 'Безопасно извлечь.'], ['apfs list', 'Контейнеры и тома APFS.']],
  e: [['diskutil list', 'Найти флешку (например /dev/disk4).'], ['diskutil eraseDisk FAT32 USB MBRFormat /dev/disk4', 'Отформатировать в FAT32.'], ['hdiutil attach image.dmg', 'Подключить образ.'], ['hdiutil create -srcfolder Folder -format UDZO out.dmg', 'Создать DMG из папки.']],
  w: '`eraseDisk` уничтожает данные. Убедитесь, что номер диска правильный.',
  eq: { l: 'lsblk, fdisk, mkfs, mount', w: 'diskpart, Format-Volume' }, r: ['dd', 'df', 'lsblk'], k: 'флешка форматировать диск' });

C({ id: 'mdfind', n: 'mdfind / mdls', al: ['mdfind', 'mdls', 'mdutil'], os: 'm', c: 'search', s: 'Поиск через Spotlight',
  syn: 'mdfind [-onlyin каталог] запрос',
  d: 'Мгновенный поиск по индексу Spotlight — по именам и содержимому файлов. `mdls` показывает метаданные файла, `mdutil` управляет индексацией.',
  o: [['-name ИМЯ', 'Только по имени.'], ['-onlyin КАТАЛОГ', 'Ограничить каталогом.'], ['-count', 'Только количество.']],
  e: [['mdfind -name invoice', 'Файлы со словом invoice в имени.'], ['mdfind "kMDItemContentType == com.adobe.pdf" -onlyin ~/Documents', 'Все PDF в Документах.'], ['sudo mdutil -E /', 'Перестроить индекс Spotlight.']],
  eq: { l: 'locate, plocate', w: 'Everything, Windows Search' }, r: ['find', 'locate'] });

C({ id: 'launchctl', n: 'launchctl', os: 'm', c: 'svc', s: 'Службы и автозапуск (launchd)',
  syn: 'launchctl <команда> [аргументы]',
  d: 'launchd — система инициализации macOS (аналог systemd). Службы описываются .plist-файлами в `~/Library/LaunchAgents` (пользователь), `/Library/LaunchDaemons` (система). Современные подкоманды: `bootstrap`, `bootout`, `kickstart`, `print`; старые `load`/`unload` всё ещё работают.',
  e: [['launchctl list | grep -i docker', 'Найти службу.'], ['launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/my.job.plist', 'Загрузить пользовательскую службу.'], ['launchctl kickstart -k gui/$(id -u)/my.job', 'Перезапустить.'], ['launchctl bootout gui/$(id -u)/my.job', 'Выгрузить.']],
  nt: 'Для служб из Homebrew проще `brew services`.',
  eq: { l: 'systemctl', w: 'sc, Get-Service, schtasks' }, r: ['systemctl', 'brew', 'crontab'] });

C({ id: 'sw_vers', n: 'sw_vers / system_profiler', al: ['sw_vers', 'system_profiler'], os: 'm', c: 'sys', s: 'Версия macOS и сведения о железе',
  syn: 'sw_vers\nsystem_profiler [тип]',
  d: '`sw_vers` — версия и сборка macOS. `system_profiler` — всё, что видно в «Об этом Mac → Отчёт о системе».',
  e: [['sw_vers', 'ProductVersion: 15.x …'], ['system_profiler SPHardwareDataType', 'Модель, процессор, память, серийный номер.'], ['system_profiler SPPowerDataType | grep -i cycle', 'Число циклов батареи.'], ['sysctl -n machdep.cpu.brand_string', 'Модель процессора.']],
  eq: { l: 'uname, lsb_release, inxi, hostnamectl', w: 'winver, systeminfo' }, r: ['uname'] });

C({ id: 'softwareupdate', n: 'softwareupdate', os: 'm', c: 'pkg', root: true, s: 'Обновления macOS из терминала',
  syn: 'softwareupdate [-l | -i -a | --install-rosetta]',
  e: [['softwareupdate -l', 'Список доступных обновлений.'], ['sudo softwareupdate -i -a -R', 'Установить все и перезагрузиться.'], ['softwareupdate --install-rosetta --agree-to-license', 'Установить Rosetta 2 на Apple Silicon.'], ['softwareupdate --list-full-installers', 'Полные установщики macOS.']],
  d: 'Устанавливает системные обновления без «Системных настроек».',
  eq: { w: 'UsoClient, PSWindowsUpdate', l: 'pacman -Syu, apt upgrade' }, r: ['brew'] });

C({ id: 'caffeinate', n: 'caffeinate', os: 'm', c: 'sys', s: 'Не давать Mac засыпать',
  syn: 'caffeinate [-dims] [-t сек] [команда]',
  d: 'Блокирует сон, пока работает сама или пока выполняется переданная команда.',
  o: [['-d', 'Не гасить экран.'], ['-i', 'Не засыпать при простое.'], ['-s', 'Не засыпать от сети питания.'], ['-t N', 'На N секунд.']],
  e: [['caffeinate -i rsync -a big/ /Volumes/Backup/', 'Не спать, пока идёт копирование.'], ['caffeinate -d -t 3600', 'Экран не гаснет час.']],
  eq: { l: 'systemd-inhibit', w: 'powercfg /requestsoverride, PowerToys Awake' }, r: ['pmset'] });

C({ id: 'pmset', n: 'pmset', os: 'm', c: 'sys', root: true, s: 'Питание и сон',
  syn: 'pmset -g [batt|assertions]\nsudo pmset …',
  e: [['pmset -g batt', 'Заряд батареи.'], ['pmset -g assertions', 'Кто не даёт уснуть.'], ['pmset sleepnow', 'Уснуть сейчас.'], ['sudo pmset -a displaysleep 10', 'Гасить экран через 10 минут.']],
  d: 'Читает и меняет настройки энергосбережения.',
  eq: { l: 'systemctl suspend, upower, powerprofilesctl', w: 'powercfg' }, r: ['caffeinate'] });

C({ id: 'networksetup', n: 'networksetup / scutil', al: ['networksetup', 'scutil', 'ipconfig getifaddr'], os: 'm', c: 'net', root: true, s: 'Настройки сети macOS',
  syn: 'networksetup -<действие> [сервис] [значения]',
  d: 'Управляет сетевыми службами: DNS, прокси, Wi-Fi. `scutil` — имя компьютера и DNS-конфигурация.',
  e: [['networksetup -listallnetworkservices', 'Список служб (Wi-Fi, Ethernet…).'], ['sudo networksetup -setdnsservers Wi-Fi 1.1.1.1 8.8.8.8', 'Сменить DNS.'], ['ipconfig getifaddr en0', 'IP-адрес Wi-Fi.'], ['sudo scutil --set HostName mymac', 'Имя хоста.'], ['sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder', 'Сбросить DNS-кэш.']],
  eq: { l: 'nmcli, ip, resolvectl', w: 'netsh, ipconfig, Set-DnsClientServerAddress' }, r: ['ifconfig', 'dig'] });

C({ id: 'ifconfig', n: 'ifconfig', os: 'ml', c: 'net', s: 'Сетевые интерфейсы (BSD, macOS; устарело в Linux)',
  syn: 'ifconfig [интерфейс]',
  d: 'На macOS — основной способ посмотреть интерфейсы (`en0` — обычно Wi-Fi, `lo0` — loopback). В Linux устарел (пакет net-tools) — используйте `ip`.',
  e: [['ifconfig en0 | grep "inet "', 'IPv4 адрес Wi-Fi на Mac.']],
  eq: { l: 'ip a', w: 'ipconfig' }, r: ['ip', 'networksetup'] });

C({ id: 'screencapture', n: 'screencapture', os: 'm', c: 'sys', s: 'Скриншоты из терминала',
  syn: 'screencapture [опции] файл.png',
  e: [['screencapture -i shot.png', 'Выделить область (как Cmd+Shift+4).'], ['screencapture -T 5 full.png', 'Через 5 секунд.'], ['screencapture -c', 'Сразу в буфер обмена.']],
  d: 'Делает снимок экрана, окна или области.',
  eq: { l: 'grim + slurp (Wayland), spectacle, gnome-screenshot', w: 'Win+Shift+S, snippingtool' } });

C({ id: 'xattr', n: 'xattr', os: 'ml', c: 'sec', s: 'Расширенные атрибуты (карантин Gatekeeper)',
  syn: 'xattr [-l | -d атрибут | -cr] файл',
  d: 'Файлы из интернета получают атрибут `com.apple.quarantine`, из-за чего macOS пишет «приложение повреждено» или «не удаётся проверить разработчика». Снятие карантина разрешает запуск.',
  e: [['xattr -l App.app', 'Посмотреть атрибуты.'], ['xattr -dr com.apple.quarantine /Applications/App.app', 'Снять карантин с приложения.']],
  w: 'Снимайте карантин только с программ из источника, которому доверяете: это отключает проверку Gatekeeper для этого файла.',
  r: ['chmod'] });

C({ id: 'osascript', n: 'osascript / say', al: ['osascript', 'say'], os: 'm', c: 'shell', s: 'AppleScript из терминала, синтез речи',
  syn: 'osascript -e \'скрипт\'\nsay "текст"',
  d: 'Позволяет управлять приложениями macOS и показывать уведомления из shell-скриптов.',
  e: [['osascript -e \'display notification "Сборка готова" with title "Make"\'', 'Системное уведомление.'], ['make && say "готово"', 'Голосом сообщить о завершении.'], ['osascript -e \'set volume output volume 30\'', 'Громкость 30 %.']],
  eq: { l: 'notify-send, espeak-ng', w: 'New-BurntToastNotification, msg' } });

C({ id: 'tmutil', n: 'tmutil', os: 'm', c: 'disk', root: true, s: 'Time Machine из терминала',
  syn: 'tmutil <команда>',
  e: [['tmutil startbackup', 'Запустить резервное копирование.'], ['tmutil listbackups', 'Список копий.'], ['tmutil listlocalsnapshots /', 'Локальные снимки (занимают место!).'], ['tmutil thinlocalsnapshots / 10000000000 4', 'Освободить место от локальных снимков.']],
  d: 'Управляет резервными копиями Time Machine и локальными снимками APFS.',
  eq: { l: 'timeshift, snapper, btrfs subvolume snapshot', w: 'wbadmin, File History' }, r: ['diskutil'] });

C({ id: 'log', n: 'log', os: 'm', c: 'svc', s: 'Единый журнал macOS',
  syn: 'log show|stream [--predicate …] [--last время]',
  d: 'Консольный доступ к Unified Logging (то же, что в приложении «Консоль»).',
  e: [['log show --last 1h --predicate \'eventMessage CONTAINS "error"\'', 'Ошибки за последний час.'], ['log stream --process Finder', 'Живой лог процесса.']],
  eq: { l: 'journalctl', w: 'Get-WinEvent' }, r: ['journalctl'] });

C({ id: 'sips', n: 'sips', os: 'm', c: 'text', s: 'Обработка изображений без установки ПО',
  syn: 'sips [опции] файл…',
  e: [['sips -Z 1200 *.jpg', 'Уменьшить так, чтобы большая сторона была ≤ 1200 px (перезаписывает!).'], ['sips -s format png photo.heic --out photo.png', 'HEIC → PNG.']],
  d: 'Встроенный в macOS инструмент для изменения размера и конвертации картинок.',
  eq: { l: 'magick (ImageMagick)', w: 'magick (ImageMagick)' } });

})(function (o) { KD.commands.push(o); });

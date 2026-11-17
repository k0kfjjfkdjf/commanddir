/* Команды, специфичные для Linux */
(function (C) {

/* ===== Пакеты ===== */
C({ id: 'pacman', n: 'pacman', os: 'l', c: 'pkg', root: true, s: 'Менеджер пакетов Arch Linux',
  syn: 'pacman -<операция>[модификаторы] [пакеты]',
  d: 'Устанавливает, обновляет и удаляет пакеты в Arch и производных (EndeavourOS, Manjaro, CachyOS). Операции — заглавные буквы: **S** — sync (репозитории), **R** — remove, **Q** — query (установленные), **U** — установить локальный файл, **F** — поиск по файлам.\n\nArch — rolling-release: частичные обновления (`pacman -Sy пакет`) не поддерживаются и ломают систему. Обновляйте всё сразу: `pacman -Syu`.',
  sub: { '-S': 'Установить пакет из репозитория.', '-Syu': 'Синхронизировать базы и обновить всю систему.', '-Ss': 'Поиск в репозиториях.', '-Si': 'Информация о пакете из репозитория.', '-R': 'Удалить пакет.', '-Rns': 'Удалить пакет, его ненужные зависимости и конфиги.', '-Q': 'Список установленных.', '-Qs': 'Поиск среди установленных.', '-Qi': 'Информация об установленном пакете.', '-Ql': 'Файлы пакета.', '-Qo': 'Какому пакету принадлежит файл.', '-Qdtq': 'Список осиротевших зависимостей.', '-Qe': 'Явно установленные пакеты.', '-U': 'Установить локальный .pkg.tar.zst.', '-Sc': 'Очистить кэш от старых версий.', '-F': 'Поиск по файлам в репозиториях.', '-Fy': 'Обновить базу файлов.' },
  o: [['-S ПАКЕТ', 'Установить.'], ['-Syu', 'Полное обновление системы.'], ['-Syyu', 'С принудительным обновлением баз (после смены зеркал).'], ['-Ss ЗАПРОС', 'Найти пакет.'], ['-Si ПАКЕТ', 'Подробности о пакете в репозитории.'], ['-R ПАКЕТ', 'Удалить только пакет.'], ['-Rns ПАКЕТ', 'Удалить с зависимостями и конфигами.'], ['-Qs ЗАПРОС', 'Найти среди установленных.'], ['-Qo ФАЙЛ', 'Чей это файл.'], ['-Ql ПАКЕТ', 'Какие файлы установил пакет.'], ['-Qdtq', 'Сироты (ненужные зависимости).'], ['-Qe', 'Установленные вами явно.'], ['-U ФАЙЛ', 'Поставить пакет из файла.'], ['-F ФАЙЛ', 'Какой пакет содержит файл (после pacman -Fy).'], ['--needed', 'Не переустанавливать уже актуальные.'], ['--noconfirm', 'Не спрашивать (в скриптах).']],
  e: [['sudo pacman -Syu', 'Обновить систему.'], ['sudo pacman -S --needed git base-devel', 'Поставить инструменты сборки.'], ['pacman -Ss obs', 'Найти пакет.'], ['sudo pacman -Rns $(pacman -Qdtq)', 'Удалить все осиротевшие пакеты.'], ['pacman -Qo /usr/bin/ls', 'coreutils.'], ['sudo paccache -rk2', 'Оставить в кэше по 2 версии (пакет pacman-contrib).'], ['pacman -Qe > pkglist.txt', 'Сохранить список своих пакетов.']],
  w: 'Не выполняйте `pacman -Sy пакет` (без `u`) — частичное обновление ведёт к несовместимым библиотекам. Перед обновлением загляните в новости archlinux.org: иногда нужно ручное вмешательство.',
  nt: 'Пакеты из AUR ставятся помощником (`yay`, `paru`) или вручную через `makepkg -si`. Логи операций: `/var/log/pacman.log`.',
  eq: { l: 'apt, dnf', m: 'brew', w: 'winget, choco, scoop' }, r: ['yay', 'apt', 'dnf', 'flatpak'], k: 'установить программу обновить систему arch удалить пакет' });

C({ id: 'yay', n: 'yay / paru', al: ['yay', 'paru', 'makepkg'], os: 'l', c: 'pkg', s: 'Помощники AUR в Arch',
  syn: 'yay [опции pacman] [пакеты]',
  d: 'AUR (Arch User Repository) — пользовательские сценарии сборки (PKGBUILD). `yay` и `paru` принимают те же ключи, что и pacman, но умеют скачивать и собирать пакеты из AUR. Запускаются **без sudo** — сами попросят пароль.',
  o: [['yay', 'Без аргументов — обновить всё, включая AUR.'], ['yay ЗАПРОС', 'Интерактивный поиск и установка.'], ['-S ПАКЕТ', 'Установить.'], ['-Yc', 'Удалить ненужные зависимости.'], ['--editmenu / -Gp', 'Посмотреть PKGBUILD перед сборкой.']],
  e: [['git clone https://aur.archlinux.org/yay-bin.git && cd yay-bin && makepkg -si', 'Установить сам yay.'], ['yay -S visual-studio-code-bin', 'Пакет из AUR.'], ['paru', 'Обновить систему и AUR.']],
  w: 'Пакеты AUR никто не проверяет. Читайте PKGBUILD перед установкой, особенно у малоизвестных пакетов.',
  r: ['pacman'] });

C({ id: 'apt', n: 'apt', al: ['apt-get', 'dpkg'], os: 'l', c: 'pkg', root: true, s: 'Пакеты в Debian, Ubuntu, Mint',
  syn: 'apt <команда> [пакеты]',
  sub: { update: 'Обновить списки пакетов.', upgrade: 'Обновить установленные пакеты.', 'full-upgrade': 'Обновить с удалением/заменой пакетов при необходимости.', install: 'Установить.', remove: 'Удалить (конфиги остаются).', purge: 'Удалить вместе с конфигами.', autoremove: 'Удалить ненужные зависимости.', search: 'Поиск.', show: 'Информация о пакете.', list: 'Список пакетов.' },
  d: '`apt update` только скачивает свежие списки пакетов, а `apt upgrade` — обновляет установленное. Поэтому выполняют их вместе. `dpkg` — низкоуровневый инструмент для .deb-файлов.',
  o: [['update', 'Обновить списки.'], ['upgrade', 'Обновить пакеты.'], ['install ПАКЕТ', 'Установить.'], ['remove / purge', 'Удалить / с конфигами.'], ['autoremove', 'Почистить зависимости.'], ['search ЗАПРОС', 'Поиск.'], ['show ПАКЕТ', 'Подробности.'], ['list --installed', 'Установленные.'], ['-y', 'Отвечать «да» автоматически.'], ['dpkg -i файл.deb', 'Поставить .deb (лучше: apt install ./файл.deb).'], ['dpkg -S ФАЙЛ', 'Чей файл.']],
  e: [['sudo apt update && sudo apt upgrade -y', 'Обновить систему.'], ['sudo apt install ./chrome.deb', 'Поставить .deb с зависимостями.'], ['sudo apt purge --autoremove snapd', 'Удалить полностью.']],
  eq: { l: 'pacman, dnf', m: 'brew', w: 'winget' }, r: ['pacman', 'dnf'] });

C({ id: 'dnf', n: 'dnf', al: ['rpm', 'zypper'], os: 'l', c: 'pkg', root: true, s: 'Пакеты в Fedora, RHEL, Rocky, Alma',
  syn: 'dnf <команда> [пакеты]',
  d: 'Менеджер пакетов RPM-дистрибутивов. В Fedora 41+ — dnf5. В openSUSE аналог — `zypper`.',
  sub: { install: 'Установить.', remove: 'Удалить.', upgrade: 'Обновить.', search: 'Поиск.', info: 'Информация.', provides: 'Какой пакет даёт файл.', history: 'История операций с откатом.' },
  o: [['upgrade', 'Обновить систему.'], ['install ПАКЕТ', 'Установить.'], ['remove ПАКЕТ', 'Удалить.'], ['search', 'Поиск.'], ['provides */ФАЙЛ', 'Чей файл.'], ['history undo N', 'Откатить операцию.']],
  e: [['sudo dnf upgrade --refresh', 'Обновить систему.'], ['sudo dnf install htop', 'Установить.']],
  eq: { l: 'pacman, apt', m: 'brew', w: 'winget' }, r: ['pacman', 'apt'] });

C({ id: 'flatpak', n: 'flatpak', os: 'l', c: 'pkg', s: 'Универсальные изолированные приложения',
  syn: 'flatpak <команда> [приложение]',
  d: 'Ставит приложения из Flathub в «песочнице», независимо от дистрибутива. Права приложения можно сужать (удобно через Flatseal).',
  sub: { install: 'Установить.', uninstall: 'Удалить.', update: 'Обновить.', list: 'Список.', run: 'Запустить.', search: 'Поиск.', override: 'Изменить права.' },
  e: [['flatpak install flathub org.telegram.desktop', 'Поставить Telegram.'], ['flatpak update', 'Обновить всё.'], ['flatpak uninstall --unused', 'Удалить неиспользуемые среды выполнения.']],
  r: ['pacman'] });

/* ===== Службы ===== */
C({ id: 'systemctl', n: 'systemctl', os: 'l', c: 'svc', s: 'Управление службами systemd',
  syn: 'systemctl <команда> [юнит]',
  d: 'systemd — система инициализации почти всех современных дистрибутивов. Каждая служба — **юнит** (`nginx.service`, `backup.timer`, `home.mount`). Важно различать: `start` — запустить сейчас, `enable` — запускать при загрузке. `enable --now` делает оба действия.\n\nСистемные юниты требуют `sudo`; пользовательские (`--user`) — нет.',
  sub: { start: 'Запустить службу сейчас.', stop: 'Остановить.', restart: 'Перезапустить.', reload: 'Перечитать конфиг без перезапуска.', status: 'Состояние и последние строки лога.', enable: 'Включить автозапуск.', disable: 'Отключить автозапуск.', mask: 'Запретить запуск совсем.', 'is-active': 'Активна ли (для скриптов).', 'list-units': 'Список юнитов.', 'list-timers': 'Таймеры (замена cron).', 'daemon-reload': 'Перечитать файлы юнитов после правки.', edit: 'Создать override для юнита.', poweroff: 'Выключить компьютер.', reboot: 'Перезагрузить.', suspend: 'Сон.' },
  o: [['status ЮНИТ', 'Статус + последние логи.'], ['start / stop / restart', 'Управление сейчас.'], ['enable --now ЮНИТ', 'Включить автозапуск и запустить.'], ['disable --now', 'Выключить и убрать из автозапуска.'], ['--failed', 'Упавшие юниты.'], ['list-units --type=service', 'Все службы.'], ['list-timers', 'Расписание таймеров.'], ['daemon-reload', 'После изменения .service-файлов.'], ['edit ЮНИТ', 'Безопасно переопределить настройки.'], ['--user', 'Пользовательские службы.'], ['cat ЮНИТ', 'Показать файл юнита.']],
  e: [['systemctl status sshd', 'Работает ли SSH (в Debian: ssh).'], ['sudo systemctl enable --now bluetooth', 'Включить Bluetooth.'], ['systemctl --failed', 'Что не запустилось при загрузке.'], ['sudo systemctl restart NetworkManager', 'Перезапустить сеть.'], ['systemctl --user restart pipewire', 'Перезапустить звук.'], ['systemctl list-timers', 'Когда сработают таймеры.']],
  eq: { w: 'sc, services.msc, Get-Service', m: 'launchctl, brew services' }, r: ['journalctl', 'crontab', 'service'], k: 'служба сервис демон автозапуск' });

C({ id: 'journalctl', n: 'journalctl', os: 'l', c: 'svc', s: 'Системные логи (journald)',
  syn: 'journalctl [опции]',
  d: 'Читает журнал systemd: логи ядра, служб и загрузки в одном месте. Вывод открывается в `less`.',
  o: [['-u ЮНИТ', 'Логи конкретной службы.'], ['-f', 'Следить в реальном времени.'], ['-b', 'С текущей загрузки (-b -1 — с предыдущей).'], ['-p err', 'Только ошибки и важнее (emerg…err).'], ['-k', 'Только сообщения ядра (как dmesg).'], ['--since "1 hour ago"', 'За период. Также --until.'], ['-n N', 'Последние N строк.'], ['-e', 'Сразу в конец.'], ['-x', 'С пояснениями.'], ['--no-pager', 'Без less (для конвейеров).'], ['--disk-usage', 'Сколько места занимают логи.'], ['--vacuum-size=500M', 'Урезать журнал до 500 МБ.']],
  e: [['journalctl -u nginx -f', 'Следить за логом nginx.'], ['journalctl -b -1 -p err', 'Ошибки прошлой загрузки (что было перед зависанием).'], ['journalctl --since today -u sshd | grep Failed', 'Неудачные входы по SSH за сегодня.'], ['sudo journalctl --vacuum-time=2weeks', 'Удалить логи старше двух недель.']],
  eq: { w: 'eventvwr, Get-WinEvent', m: 'log show, Console.app' }, r: ['systemctl', 'dmesg', 'tail'], k: 'логи журнал ошибки' });

C({ id: 'dmesg', n: 'dmesg', os: 'lm', c: 'sys', root: true, s: 'Сообщения ядра',
  syn: 'dmesg [опции]',
  d: 'Кольцевой буфер ядра: обнаружение устройств, драйверы, ошибки диска и памяти. Первое, куда смотреть, если флешка/видеокарта/Wi-Fi не работает.',
  o: [['-H', 'Удобный вид с пейджером.'], ['-T', 'Человеческое время.'], ['-w', 'Следить за новыми сообщениями.'], ['-l err,warn', 'Только ошибки и предупреждения.']],
  e: [['sudo dmesg -wH', 'Вставьте USB-устройство и смотрите, что напишет ядро.'], ['sudo dmesg | grep -i -E "error|fail"', 'Проблемы.']],
  r: ['journalctl', 'lsusb', 'lspci'] });

/* ===== Система и железо ===== */
C({ id: 'free', n: 'free', os: 'l', c: 'sys', s: 'Использование оперативной памяти',
  syn: 'free [-h]',
  d: 'Показывает RAM и swap. Ключевой столбец — **available**: сколько памяти реально можно отдать программам. «Мало free» — нормально: Linux использует свободную память под кэш диска (buff/cache) и отдаёт её по требованию.',
  o: [['-h', 'Удобные единицы.'], ['-s N', 'Обновлять каждые N секунд.']],
  e: [['free -h', 'Сводка.']],
  eq: { m: 'vm_stat, top', w: 'systeminfo, Get-CimInstance Win32_OperatingSystem' }, r: ['top', 'vmstat'] });

C({ id: 'lsblk', n: 'lsblk / blkid', al: ['lsblk', 'blkid'], os: 'l', c: 'disk', s: 'Диски и разделы',
  syn: 'lsblk [-f]',
  d: 'Дерево блочных устройств: диски (`sda`, `nvme0n1`), разделы, размеры, точки монтирования. С `-f` — файловые системы, метки и UUID (нужны для /etc/fstab).',
  o: [['-f', 'ФС, метки, UUID.'], ['-o NAME,SIZE,MODEL', 'Свои столбцы.'], ['-d', 'Только диски.']],
  e: [['lsblk', 'Что подключено. Используйте перед dd!'], ['lsblk -f', 'Файловые системы и UUID.'], ['sudo blkid /dev/sdb1', 'UUID раздела.']],
  eq: { m: 'diskutil list', w: 'Get-Disk, Get-Partition, diskpart list disk' }, r: ['mount', 'df', 'fdisk', 'dd'], k: 'диски разделы флешка' });

C({ id: 'fdisk', n: 'fdisk / parted / cfdisk', al: ['fdisk', 'parted', 'cfdisk', 'gdisk'], os: 'l', c: 'disk', root: true, s: 'Разметка дисков',
  syn: 'sudo fdisk /dev/sdX\nsudo cfdisk /dev/sdX',
  d: 'Создают и удаляют разделы. `cfdisk` — с псевдографическим меню, проще всего. `fdisk -l` — список всех разделов. Изменения записываются только по команде `w`.',
  w: 'Разметка уничтожает данные на диске. Проверьте имя устройства в `lsblk` дважды.',
  e: [['sudo fdisk -l', 'Все диски и разделы.'], ['sudo cfdisk /dev/sdb', 'Разметить флешку в меню.']],
  eq: { m: 'diskutil partitionDisk', w: 'diskpart, diskmgmt.msc' }, r: ['lsblk', 'mkfs'] });

C({ id: 'mkfs', n: 'mkfs', al: ['mkfs.ext4', 'mkfs.btrfs', 'mkfs.vfat', 'mkfs.exfat'], os: 'l', c: 'disk', root: true, s: 'Форматирование раздела',
  syn: 'mkfs.ТИП [опции] /dev/sdXN',
  d: 'Создаёт файловую систему: ext4 (надёжная классика), btrfs (снапшоты, сжатие), vfat/exfat (флешки для всех ОС), xfs.',
  w: 'Все данные на разделе будут потеряны.',
  o: [['-L МЕТКА', 'Метка тома (для vfat: -n).'], ['-F 32', 'FAT32 для mkfs.vfat.']],
  e: [['sudo mkfs.exfat -L USB /dev/sdb1', 'Флешка для Windows/macOS/Linux.'], ['sudo mkfs.ext4 -L data /dev/sdc1', 'Диск для Linux.']],
  eq: { m: 'diskutil eraseDisk', w: 'format, Format-Volume' }, r: ['fdisk', 'lsblk', 'mount'] });

C({ id: 'lspci', n: 'lspci / lsusb / lscpu', al: ['lspci', 'lsusb', 'lscpu', 'lshw', 'inxi', 'fastfetch'], os: 'l', c: 'sys', s: 'Информация о железе',
  syn: 'lspci [-k]\nlsusb\nlscpu',
  d: '`lspci` — устройства PCI (видеокарта, сеть, звук); с `-k` показывает, какой драйвер используется. `lsusb` — USB-устройства. `lscpu` — процессор. `inxi -Fz` и `fastfetch` — сводка обо всей системе (удобно прикладывать к вопросам на форумах).',
  e: [['lspci -k | grep -A3 -i vga', 'Видеокарта и её драйвер.'], ['lspci -k | grep -A3 -i net', 'Сетевые адаптеры и драйверы (например rtw88_8821ce).'], ['lsusb', 'Что подключено по USB.'], ['inxi -Fxz', 'Полный отчёт без личных данных.']],
  eq: { m: 'system_profiler', w: 'msinfo32, Get-PnpDevice' }, r: ['dmesg', 'uname'] });

C({ id: 'hostnamectl', n: 'hostnamectl / timedatectl / localectl', al: ['hostnamectl', 'timedatectl', 'localectl'], os: 'l', c: 'sys', root: true, s: 'Имя хоста, время, язык (systemd)',
  syn: 'hostnamectl [set-hostname ИМЯ]\ntimedatectl [set-timezone ЗОНА]\nlocalectl',
  d: 'Утилиты systemd для базовых настроек. Без аргументов показывают текущее состояние.',
  e: [['sudo hostnamectl set-hostname archbox', 'Сменить имя компьютера.'], ['sudo timedatectl set-timezone Asia/Yekaterinburg', 'Часовой пояс.'], ['sudo timedatectl set-ntp true', 'Синхронизация времени.'], ['timedatectl set-local-rtc 1', 'Время в BIOS как в Windows (при двойной загрузке).']],
  eq: { w: 'Rename-Computer, tzutil, Set-TimeZone', m: 'scutil, systemsetup' }, r: ['date', 'uname'] });

C({ id: 'useradd', n: 'useradd / usermod / userdel', al: ['useradd', 'usermod', 'userdel', 'groupadd', 'adduser', 'gpasswd'], os: 'l', c: 'perm', root: true, s: 'Управление пользователями и группами',
  syn: 'useradd -m -G группы -s оболочка имя\nusermod -aG группа имя',
  d: 'Создают, изменяют и удаляют учётные записи. Членство в группах даёт доступ к устройствам и функциям: `wheel` (sudo в Arch), `sudo` (в Debian), `docker`, `video`, `input`… Изменения групп вступают в силу после повторного входа (или `newgrp группа`).',
  o: [['-m', 'Создать домашний каталог.'], ['-G g1,g2', 'Дополнительные группы.'], ['-s /bin/zsh', 'Оболочка.'], ['usermod -aG ГРУППА', 'ДОБАВИТЬ в группу (без -a все прочие группы будут сняты!).'], ['usermod -s', 'Сменить оболочку (или chsh -s).'], ['userdel -r', 'Удалить вместе с домашним каталогом.']],
  e: [['sudo useradd -m -G wheel -s /bin/bash alex && sudo passwd alex', 'Новый пользователь с правом sudo (Arch).'], ['sudo usermod -aG docker $USER', 'Работать с docker без sudo.'], ['sudo gpasswd -d alex docker', 'Убрать из группы.']],
  w: '`usermod -G` без `-a` заменяет весь список групп — можно потерять доступ к sudo.',
  eq: { w: 'net user, net localgroup, New-LocalUser', m: 'sysadminctl, dscl' }, r: ['id', 'passwd', 'sudo'] });

/* ===== Сеть ===== */
C({ id: 'ip', n: 'ip', os: 'l', c: 'net', s: 'Сетевые интерфейсы, адреса, маршруты',
  syn: 'ip [-c] <объект> <команда>',
  d: 'Современная замена `ifconfig`, `route`, `arp`. Объекты: `addr` (a) — IP-адреса, `link` (l) — интерфейсы, `route` (r) — маршруты, `neigh` (n) — соседи/ARP. Ключ `-c` включает цвет, `-br` — краткий вид.',
  sub: { addr: 'IP-адреса.', a: 'IP-адреса.', link: 'Интерфейсы.', route: 'Таблица маршрутизации.', r: 'Таблица маршрутизации.', neigh: 'ARP-таблица.' },
  o: [['-br a', 'Кратко: интерфейс, состояние, адреса.'], ['a', 'Все адреса подробно.'], ['r', 'Маршруты; default via … — ваш шлюз.'], ['link set ИФ up|down', 'Включить/выключить интерфейс.'], ['addr add 10.0.0.2/24 dev ИФ', 'Добавить адрес.'], ['-4 / -6', 'Только IPv4 / IPv6.']],
  e: [['ip -c -br a', 'Мои IP-адреса.'], ['ip r | grep default', 'Адрес роутера.'], ['sudo ip link set wlan0 down && sudo ip link set wlan0 up', 'Перезапустить интерфейс.']],
  eq: { m: 'ifconfig, networksetup, route -n get default', w: 'ipconfig, Get-NetIPAddress, route print' }, r: ['ss', 'nmcli', 'ping', 'ifconfig'], k: 'ip адрес сеть интерфейс шлюз' });

C({ id: 'ss', n: 'ss / netstat', al: ['ss', 'netstat'], os: 'l', c: 'net', s: 'Открытые порты и соединения',
  syn: 'ss [-tulpn]',
  d: '`ss` — современная замена `netstat`. Запоминалка **-tulpn**: TCP, UDP, Listening (слушающие), Processes (какая программа), Numeric (без резолва имён).',
  o: [['-t / -u', 'TCP / UDP.'], ['-l', 'Только слушающие.'], ['-p', 'Процесс (нужен sudo для чужих).'], ['-n', 'Числовые адреса и порты.'], ['-a', 'Все соединения.'], ['-s', 'Сводная статистика.'], ['state established', 'Только установленные.'], ['sport = :443', 'Фильтр по порту.']],
  e: [['sudo ss -tulpn', 'Какие порты слушает система и кто.'], ['ss -tn state established', 'Активные TCP-соединения.'], ['sudo ss -tulpn | grep :80', 'Кто занял 80-й порт.']],
  eq: { m: 'lsof -i, netstat -an', w: 'netstat -ano, Get-NetTCPConnection' }, r: ['lsof', 'ip', 'nc'], k: 'порт занят слушает соединения' });

C({ id: 'nmcli', n: 'nmcli', al: ['nmtui'], os: 'l', c: 'net', s: 'NetworkManager: Wi-Fi и соединения',
  syn: 'nmcli <объект> <команда>',
  d: 'Управление сетью из терминала там, где работает NetworkManager (большинство десктопов). `nmtui` — то же в псевдографическом меню.',
  e: [['nmcli device wifi list', 'Доступные Wi-Fi сети.'], ['nmcli device wifi connect "Сеть" password "пароль"', 'Подключиться.'], ['nmcli connection show', 'Сохранённые соединения.'], ['nmcli radio wifi off', 'Выключить Wi-Fi.'], ['nmtui', 'Меню.']],
  eq: { m: 'networksetup', w: 'netsh wlan' }, r: ['ip', 'systemctl'] });

C({ id: 'ufw', n: 'ufw / firewall-cmd', al: ['ufw', 'firewall-cmd', 'nft', 'iptables'], os: 'l', c: 'sec', root: true, s: 'Брандмауэр',
  syn: 'ufw allow|deny ПОРТ\nfirewall-cmd --add-service=…',
  d: '`ufw` (Ubuntu, Arch) и `firewalld` (Fedora, RHEL) — удобные надстройки над nftables/iptables.',
  e: [['sudo ufw default deny incoming && sudo ufw allow ssh && sudo ufw enable', 'Базовая защита сервера.'], ['sudo ufw status verbose', 'Правила.'], ['sudo firewall-cmd --add-port=8080/tcp --permanent && sudo firewall-cmd --reload', 'Открыть порт в firewalld.']],
  w: 'Включая брандмауэр на удалённом сервере, сначала разрешите SSH — иначе потеряете доступ.',
  eq: { w: 'netsh advfirewall, New-NetFirewallRule', m: 'socketfilterfw, pfctl' }, r: ['ss'] });

C({ id: 'resolvectl', n: 'resolvectl', os: 'l', c: 'net', s: 'DNS в systemd-resolved',
  syn: 'resolvectl [status|query|flush-caches]',
  d: 'Показывает, какие DNS-серверы используются на каждом интерфейсе, позволяет сбросить кэш.',
  e: [['resolvectl status', 'Текущие DNS.'], ['resolvectl flush-caches', 'Сбросить DNS-кэш.']],
  eq: { w: 'ipconfig /flushdns', m: 'dscacheutil -flushcache' }, r: ['dig'] });

C({ id: 'fuser', n: 'fuser', os: 'l', c: 'proc', s: 'Какие процессы используют файл или порт',
  syn: 'fuser [-vmk] файл|порт/tcp',
  d: 'Показывает PID процессов, использующих ресурс; с `-k` — убивает их.',
  e: [['sudo fuser -vm /mnt/usb', 'Кто держит флешку.'], ['sudo fuser -k 8080/tcp', 'Освободить порт 8080.']],
  r: ['lsof', 'kill'] });

C({ id: 'chattr', n: 'chattr / lsattr', al: ['chattr', 'lsattr'], os: 'l', c: 'perm', root: true, s: 'Особые атрибуты файлов ext4/btrfs',
  syn: 'chattr +i файл',
  d: 'Атрибут `i` (immutable) делает файл неизменяемым даже для root, `a` — только дозапись, `C` — отключить copy-on-write на btrfs (для образов ВМ и баз данных).',
  e: [['sudo chattr +i /etc/resolv.conf', 'Запретить перезапись DNS-настроек.'], ['chattr +C ~/VMs', 'Отключить CoW для каталога образов (до создания файлов).'], ['lsattr file', 'Посмотреть атрибуты.']],
  r: ['chmod'] });

C({ id: 'shutdown', n: 'shutdown / reboot / poweroff', al: ['shutdown', 'reboot', 'poweroff'], os: 'lm', c: 'sys', root: true, s: 'Выключение и перезагрузка',
  syn: 'shutdown [-h|-r] [время]',
  d: 'Выключает или перезагружает систему сейчас или по расписанию, предупреждая пользователей.',
  o: [['-h now', 'Выключить сейчас.'], ['-r now', 'Перезагрузить сейчас.'], ['+30', 'Через 30 минут.'], ['23:00', 'В указанное время.'], ['-c', 'Отменить запланированное (Linux).']],
  e: [['sudo shutdown -h now', 'Выключить.'], ['sudo shutdown -r +5 "Обновление"', 'Перезагрузка через 5 минут с сообщением.'], ['systemctl reboot --firmware-setup', 'Перезагрузиться в BIOS/UEFI (Linux).']],
  eq: { w: 'shutdown /s /t 0, shutdown /r, Restart-Computer' }, r: ['systemctl'] });

})(function (o) { KD.commands.push(o); });

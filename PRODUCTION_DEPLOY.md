# 🚀 Production Deployment Guide

## Новая система авторизации

### ✅ Реализовано:
- **Backend API авторизация** с JWT токенами
- **Безопасные httpOnly cookies** для хранения токенов  
- **Проверка ролей и прав** на сервере
- **Middleware защита** роутов
- **Демо-логин** для тестирования

### 🔧 Конфигурация:

**Environment Variables:**
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SUPABASE_URL=your_supabase_url  
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 🔐 Процесс авторизации:

1. **Frontend** → `POST /api/auth/login` с email/password
2. **Backend** проверяет через Supabase Auth  
3. **JWT токен** генерируется с данными администратора
4. **httpOnly cookie** устанавливается автоматически
5. **Переадресация** на dashboard

### 🛡️ Безопасность:

- JWT токены в httpOnly cookies (не доступны через JavaScript)
- Проверка ролей на каждом API запросе
- Automatic token refresh (24h lifetime)
- Защищенные API endpoints через `requireAuth()` и `requireRole()`

### 🧪 Тестирование:

**API тестирование:**
```bash
# Проверка статуса авторизации
curl http://localhost:3000/api/debug/auth-status

# Список пользователей  
curl http://localhost:3000/api/debug/users
```

### 📁 Структура:

```
server/api/auth/
├── login.post.ts     # Авторизация
├── logout.post.ts    # Выход  
└── me.get.ts         # Данные пользователя

server/utils/auth.ts  # JWT utilities
└── requireAuth()     # Проверка токена
└── requireRole()     # Проверка роли

middleware/auth.ts    # Защита роутов
composables/api/useAuthApi.ts  # Client API
```

### 🚀 Готово к продакшену:

- [x] JWT токены
- [x] httpOnly cookies
- [x] Роль-based доступ
- [x] Защищенные API
- [x] Middleware защита
- [x] Error handling

**Система готова для развертывания!** 🎉

## Проблема
Ваше приложение недоступно по адресу `http://admin.vozacki.rs:3000/` потому что:
1. Node.js приложение слушает только на `localhost:3000`
2. Apache не настроен как reverse proxy
3. SSL сертификат не настроен для HTTPS

## Быстрое решение

### Шаг 1: Подготовка файлов

На вашем локальном компьютере выполните:

```bash
# Соберите приложение для продакшена
npm run build

# Создайте архив для переноса на сервер
tar -czf vozacki-admin-deploy.tar.gz .output ecosystem.config.cjs apache-vozacki-admin.conf deploy.sh .env.example
```

### Шаг 2: Перенос на сервер

```bash
# Загрузите архив на сервер
scp vozacki-admin-deploy.tar.gz user@admin.vozacki.rs:/tmp/

# Подключитесь к серверу
ssh user@admin.vozacki.rs

# Распакуйте архив
cd /tmp
tar -xzf vozacki-admin-deploy.tar.gz
```

### Шаг 3: Автоматическое развертывание

```bash
# Запустите скрипт развертывания
sudo bash deploy.sh
```

### Шаг 4: Настройка приложения

```bash
# Создайте директорию для приложения
sudo mkdir -p /home/vozacki/vozacki-admin
sudo chown -R vozacki:vozacki /home/vozacki/vozacki-admin

# Скопируйте файлы приложения
sudo cp -r .output /home/vozacki/vozacki-admin/
sudo cp ecosystem.config.cjs /home/vozacki/vozacki-admin/
sudo chown -R vozacki:vozacki /home/vozacki/vozacki-admin

# Создайте .env файл с вашими настройками
sudo -u vozacki nano /home/vozacki/vozacki-admin/.env
```

Содержимое `.env` файла:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key

# Nuxt Configuration  
NUXT_SECRET_KEY=your_nuxt_secret_key

# Server Configuration
PORT=3000
HOST=127.0.0.1
```

### Шаг 5: Установка SSL сертификата

```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-apache

# Получите SSL сертификат
sudo certbot --apache -d admin.vozacki.rs

# Проверьте автообновление сертификата
sudo certbot renew --dry-run
```

### Шаг 6: Запуск приложения

```bash
# Переключитесь в директорию приложения
cd /home/vozacki/vozacki-admin

# Запустите приложение через PM2
sudo -u vozacki pm2 start ecosystem.config.cjs

# Настройте автозапуск PM2
sudo -u vozacki pm2 startup
sudo -u vozacki pm2 save
```

### Шаг 7: Проверка

```bash
# Проверьте статус приложения
sudo -u vozacki pm2 status

# Проверьте логи
sudo -u vozacki pm2 logs vozacki-admin

# Проверьте доступность
curl -I http://localhost:3000
curl -I https://admin.vozacki.rs
```

## Диагностика проблем

### Проверка работы Node.js приложения
```bash
# Проверьте, что процесс запущен
ps aux | grep node

# Проверьте, что порт 3000 слушается
netstat -tlnp | grep :3000

# Проверьте локальную доступность
curl http://localhost:3000
```

### Проверка Apache
```bash
# Проверьте статус Apache
systemctl status apache2

# Проверьте конфигурацию
apache2ctl configtest

# Проверьте логи ошибок
tail -f /var/log/apache2/admin.vozacki.rs_error.log
```

### Проверка DNS
```bash
# Проверьте, что домен указывает на ваш сервер
nslookup admin.vozacki.rs
dig admin.vozacki.rs
```

## Управление приложением

### Перезапуск
```bash
sudo -u vozacki pm2 restart vozacki-admin
sudo systemctl restart apache2
```

### Обновление приложения
```bash
# Остановите приложение
sudo -u vozacki pm2 stop vozacki-admin

# Замените .output папку новой версией
sudo rm -rf /home/vozacki/vozacki-admin/.output
sudo cp -r /tmp/new-build/.output /home/vozacki/vozacki-admin/
sudo chown -R vozacki:vozacki /home/vozacki/vozacki-admin/.output

# Запустите приложение
sudo -u vozacki pm2 start vozacki-admin
```

### Мониторинг
```bash
# Мониторинг PM2
sudo -u vozacki pm2 monit

# Мониторинг ресурсов
htop

# Проверка логов в реальном времени
sudo -u vozacki pm2 logs vozacki-admin --lines 100
```

## Безопасность

### Настройка firewall (уже включено в скрипте)
```bash
sudo ufw status
sudo ufw allow from trusted_ip to any port 22
```

### Регулярные обновления
```bash
# Настройте автообновления безопасности
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## Результат

После выполнения всех шагов ваше приложение будет доступно по адресам:
- **HTTPS (рекомендуется)**: https://admin.vozacki.rs
- **HTTP (редирект на HTTPS)**: http://admin.vozacki.rs

Порт 3000 не будет доступен извне - это правильно для безопасности! 
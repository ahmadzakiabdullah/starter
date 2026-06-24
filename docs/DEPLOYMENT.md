# Deployment

## Docker

1. Copy `.env.production.example` to `.env`, set a unique `APP_KEY` and the production `APP_URL`. Before starting Docker, set strong `DOCKER_DB_DATABASE`, `DOCKER_DB_USERNAME`, `DOCKER_DB_PASSWORD`, and `DOCKER_DB_ROOT_PASSWORD` environment values.
2. Build and start services: `docker compose up -d --build`.
3. Run database migrations explicitly: `docker compose exec app php artisan migrate --force`.
4. Create the storage symlink: `docker compose exec app php artisan storage:link`.
5. Verify `http://your-host:8080/api/health` returns `status: ok`.

The stack contains PHP-FPM, Nginx, MySQL, and Redis. Persistent MySQL and Redis volumes are managed by Docker. Back up the database before any destructive migration.

## Release checklist

- Run `php artisan test`, `vendor/bin/pint --test`, and `npm run build`.
- Set `APP_ENV=production`, `APP_DEBUG=false`, `SESSION_ENCRYPT=true`.
- Run `php artisan config:cache`, `php artisan route:cache`, and `php artisan view:cache` after deployment.
- Configure a process supervisor for `php artisan queue:work` when queued jobs are enabled.

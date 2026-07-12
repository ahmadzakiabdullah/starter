import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const e2eEnvPath = resolve('.env.e2e');

if (!existsSync(e2eEnvPath)) {
    console.error('.env.e2e not found. Create it from .env.e2e.example');
    process.exit(1);
}

const e2eVars = Object.fromEntries(
    readFileSync(e2eEnvPath, 'utf-8')
        .split('\n')
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => l.split('=', 2).map((s) => s.trim())),
);

const e2eEnv = { ...process.env, ...e2eVars, APP_ENV: 'e2e', APP_KEY: process.env.APP_KEY };

const run = (cmd) => {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { stdio: 'inherit', env: e2eEnv });
};

console.log('=== E2E Setup ===');

try {
    run(
        `php -r "$pdo = new PDO('mysql:host=${e2eVars.DB_HOST};port=${e2eVars.DB_PORT}', '${e2eVars.DB_USERNAME}', '${e2eVars.DB_PASSWORD}'); $pdo->exec('CREATE DATABASE IF NOT EXISTS \`${e2eVars.DB_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'); echo 'Database ready.';"`,
    );
} catch (e) {
    console.error('Failed to create database. Make sure MySQL is running.');
    process.exit(1);
}

run('php artisan migrate:fresh --seed --force');

console.log('\n=== E2E Setup Complete ===\n');

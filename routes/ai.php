<?php

use App\Mcp\Servers\LaravelServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/laravel', LaravelServer::class)
    ->middleware(['auth', 'can:manage-system']);

Mcp::local('laravel', LaravelServer::class);

<?php

use App\Mcp\Servers\LaravelServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/laravel', LaravelServer::class);
Mcp::local('laravel', LaravelServer::class);

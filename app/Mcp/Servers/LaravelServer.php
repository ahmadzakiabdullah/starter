<?php

namespace App\Mcp\Servers;

use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Laravel Project Server')]
#[Version('0.0.1')]
#[Instructions('Use the read-only tools to inspect the Laravel application before suggesting changes. The server does not expose credentials, user records, or write operations.')]
class LaravelServer extends Server
{
    protected array $tools = [
        \App\Mcp\Tools\ApplicationStatus::class,
        \App\Mcp\Tools\UserSummary::class,
    ];

    protected array $resources = [
        //
    ];

    protected array $prompts = [
        //
    ];
}

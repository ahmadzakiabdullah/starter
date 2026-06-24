<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

$superadmin = Role::firstOrCreate(['name' => 'superadmin']);
$manager = Role::firstOrCreate(['name' => 'manager']);
$permission = Permission::firstOrCreate(['name' => 'manage-users']);
$manager->givePermissionTo($permission);

$actor = User::factory()->create();
$actor->assignRole($manager);

$controller = app(UserController::class);
try {
    $ref = new ReflectionMethod($controller, 'assignableRolesFor');
    $ref->setAccessible(true);
    $res = $ref->invoke($controller, $actor);
    echo 'assignableRolesFor type: '.(is_object($res) ? get_class($res) : gettype($res))."\n";
    if (is_object($res)) {
        echo 'pluck: '.get_class($res->pluck('name'))."\n";
        print_r($res->pluck('name')->all());
    }
} catch (Throwable $e) {
    echo 'Error: '.$e->getMessage()."\n".$e->getTraceAsString()."\n";
}
